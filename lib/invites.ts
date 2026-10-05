import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { sql } from './db';
import { siteUrl } from './site';
import { rateLimit } from './util';
import { inviteStamps, type Business } from './business';
import { blackCardReady, canGiveBlackCard } from './blackcard';

/**
 * Staff invites: staff send a fresh link from their own WhatsApp each time. For each link they pick the gift:
 * a voucher, or head-start stamps. A link works for one sign-up, within 24 hours, so it can't be farmed.
 * The code carries the gift, expiry and a one-off id, signed with the staff id, so no extra table is needed.
 */
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LIFETIME_SEC = 24 * 3600;
export type InviteGift = 'voucher' | 'stamps' | 'black';

const sign = (staffId: string, body: string) => {
  const h = createHmac('sha256', process.env.SESSION_SECRET || '').update(`staff-invite:${staffId}:${body}`).digest();
  return Array.from(h.subarray(0, 10), (b) => CHARS[b % CHARS.length]).join('');
};

/** S + gift (V voucher, T stamps, B black card) + expiry (7 base-36) + one-off id (6) + signature (10). */
export function staffInviteCode(staffId: string, gift: InviteGift) {
  const exp = (Math.floor(Date.now() / 1000) + LIFETIME_SEC).toString(36).toUpperCase().padStart(7, '0');
  const nonce = Array.from({ length: 6 }, () => CHARS[randomInt(CHARS.length)]).join('');
  const body = `${gift === 'stamps' ? 'T' : gift === 'black' ? 'B' : 'V'}${exp}${nonce}`;
  return `S${body}${sign(staffId, body)}`;
}

export const staffInviteLink = (biz: Business, staffId: string, gift: InviteGift) =>
  `${siteUrl()}/${biz.slug}?join=1&invite=${staffInviteCode(staffId, gift)}`;

export const cleanInviteCode = (raw: unknown) => String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

const usedKey = (bizId: string, nonce: string) => `staff-invite-used:${bizId}:${nonce}`;

export type Inviter = { id: string; name: string; gift: InviteGift; nonce: string };

/** Who sent an invite and what it gives. Null if the code is fake or for another business; 'expired' if it's too old or already used. */
export async function findInviter(bizId: string, raw: unknown): Promise<Inviter | 'expired' | null> {
  const code = cleanInviteCode(raw);
  const m = code.match(/^S([VTB])([0-9A-Z]{7})([A-Z0-9]{6})([A-Z0-9]{10})$/);
  if (!m) return null;
  const [, g, exp, nonce, sig] = m;
  const body = `${g}${exp}${nonce}`;
  const staff = await sql`select id, name, role from staff where business_id = ${bizId} and active`;
  const s = staff.find((x) => timingSafeEqual(Buffer.from(sign(x.id, body)), Buffer.from(sig)));
  if (!s || (g === 'B' && !(await canGiveBlackCard(s.id)))) return null;
  if (parseInt(exp, 36) * 1000 < Date.now()) return 'expired';
  const [used] = await sql`select 1 from rate_limits where key = ${usedKey(bizId, nonce)}`;
  if (used) return 'expired';
  return { id: s.id as string, name: s.name as string, gift: g === 'T' ? 'stamps' : g === 'B' ? 'black' : 'voucher', nonce };
}

/** Gives a brand new member the invite gift and credits the staff member who sent it. Each link pays out once. */
export async function claimStaffInvite(biz: Business, customerId: string, inviter: Inviter) {
  const inv = biz.settings.staffInvite;
  if (!inv.enabled) return;
  // Marks the link used atomically, so two sign-ups racing on the same link can't both get the gift
  if (!(await rateLimit(usedKey(biz.id, inviter.nonce), 1, 2 * LIFETIME_SEC))) return;
  const stamps = inviteStamps(biz.settings);
  if (inviter.gift === 'black' && !(await blackCardReady())) return;
  await sql.begin(async (tx) => {
    if (inviter.gift === 'black')
      await tx`update customers set black_card_at = now(), black_card_by = ${inviter.id} where id = ${customerId} and business_id = ${biz.id}`;
    else if (inviter.gift === 'stamps' && stamps > 0)
      await tx`insert into stamps (business_id, customer_id, staff_id, delta, reason, note)
        values (${biz.id}, ${customerId}, ${inviter.id}, ${stamps}, 'bonus', 'Invited by staff')`;
    else
      await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
        values (${biz.id}, ${customerId}, ${inv.label}, 'item', 0, 'campaign', 'staff-invite',
                now() + make_interval(days => ${inv.days}::int))
        on conflict do nothing`;
    // The welcome stamps stay as they are; tagging them with the staff member shows who brought the member in.
    await tx`update stamps set staff_id = ${inviter.id}, note = 'Invited by staff'
      where customer_id = ${customerId} and reason = 'welcome' and staff_id is null`;
  });
}
