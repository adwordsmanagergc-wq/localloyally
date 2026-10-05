import { createHmac, timingSafeEqual } from 'node:crypto';
import { sql } from './db';
import { addPurchase, RuleError } from './loyalty';
import { localNow, type Business } from './business';

/**
 * Counter codes: 6 digits on the staff screen that change every 2 minutes, like a bank app code.
 * Customers type them on their card. A shared code is useless a few minutes later.
 */
export const CODE_WINDOW_SEC = 120;
export type CodeKind = 'stamp' | 'bonus';

function codeFor(bizId: string, kind: CodeKind, window: number) {
  const h = createHmac('sha256', process.env.SESSION_SECRET || '').update(`counter:${bizId}:${kind}:${window}`).digest();
  return String(h.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}
const windowAt = (ms: number) => Math.floor(ms / 1000 / CODE_WINDOW_SEC);

/** What the staff screen shows, and how many seconds until it changes. */
export function currentCodes(bizId: string, now = Date.now()) {
  const w = windowAt(now);
  return {
    stamp: codeFor(bizId, 'stamp', w),
    bonus: codeFor(bizId, 'bonus', w),
    secondsLeft: CODE_WINDOW_SEC - Math.floor((now / 1000) % CODE_WINDOW_SEC),
  };
}

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Accepts the current code and the previous one, so a code read out just before it changes still works. */
function matchCounter(bizId: string, code: string): CodeKind | null {
  const w = windowAt(Date.now());
  for (const kind of ['stamp', 'bonus'] as const)
    if (same(code, codeFor(bizId, kind, w)) || same(code, codeFor(bizId, kind, w - 1))) return kind;
  return null;
}

/** Personal codes: 6 characters with at least one letter, so they never look like a counter code. */
const PERSONAL_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newPersonalCode() {
  for (;;) {
    const c = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => PERSONAL_CHARS[b % PERSONAL_CHARS.length]).join('');
    if (/[A-Z]/.test(c)) return c;
  }
}

export async function createPersonalCode(biz: Business, customerId: string, staffId: string, stamps: number, note: string, days: number) {
  const n = Math.round(stamps);
  if (!(n >= 1 && n <= 20)) throw new RuleError('Choose 1 to 20 stamps');
  const [c] = await sql`select id, name, phone from customers where id = ${customerId} and business_id = ${biz.id}`;
  if (!c) throw new RuleError('Member not found');
  const [row] = await sql`insert into personal_codes (business_id, customer_id, code, stamps, note, created_by, expires_at)
    values (${biz.id}, ${c.id}, ${newPersonalCode()}, ${n}, ${note.trim().slice(0, 80) || null}, ${staffId},
            now() + make_interval(days => ${Math.min(90, Math.max(1, Math.round(days) || 30))}::int))
    returning code, stamps, expires_at`;
  return { code: row.code as string, stamps: row.stamps as number, expires_at: row.expires_at as Date, name: c.name as string, phone: c.phone as string };
}

/** A customer typed a code on their card. Returns what they got. */
export async function redeemCode(biz: Business, customerId: string, raw: string) {
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (/^\d{6}$/.test(code)) {
    if (!biz.settings.counterCodes) throw new RuleError('Ask staff to scan your QR code instead');
    const kind = matchCounter(biz.id, code);
    if (!kind) throw new RuleError('That code is not right or has changed. Ask staff for the current one.');
    const l = localNow(biz.settings.timezone);
    const day = `${l.year}-${String(l.month).padStart(2, '0')}-${String(l.day).padStart(2, '0')}`;
    // The primary key makes "once a day" safe even if they tap twice
    const [use] = await sql`insert into code_uses (customer_id, kind, day) values (${customerId}, ${kind}, ${day})
      on conflict do nothing returning 1`;
    if (!use) throw new RuleError(kind === 'stamp' ? 'You already used today\'s stamp code. Come back tomorrow!' : 'You already used today\'s bonus code.');
    try {
      if (kind === 'stamp') {
        const r = await addPurchase(biz, customerId, null, 1, true, 'Counter code');
        return { kind, added: 'events' in r && r.events ? r.events.reduce((a, e) => a + e.delta, 0) : 1, referrerId: 'referrerId' in r ? r.referrerId : null, referrerNote: 'referrerNote' in r ? r.referrerNote : '' };
      }
      await sql`insert into stamps (business_id, customer_id, delta, reason, note) values (${biz.id}, ${customerId}, 1, 'bonus', 'Bonus code')`;
      return { kind, added: 1, referrerId: null, referrerNote: '' };
    } catch (e) {
      await sql`delete from code_uses where customer_id = ${customerId} and kind = ${kind} and day = ${day}`;
      throw e;
    }
  }

  if (/^[A-Z0-9]{6}$/.test(code)) {
    const added = await sql.begin(async (tx) => {
      const [p] = await tx`update personal_codes set used_at = now()
        where customer_id = ${customerId} and business_id = ${biz.id} and code = ${code} and used_at is null and expires_at > now()
        returning stamps, note`;
      if (!p) return null;
      await tx`insert into stamps (business_id, customer_id, delta, reason, note)
               values (${biz.id}, ${customerId}, ${p.stamps}, 'bonus', ${p.note ? `Code: ${p.note}` : 'Personal code'})`;
      return p.stamps as number;
    });
    if (added == null) throw new RuleError('That code is not right, already used or expired.');
    return { kind: 'personal' as const, added, referrerId: null, referrerNote: '' };
  }
  throw new RuleError('Codes are 6 numbers from staff, or 6 letters and numbers sent to you');
}
