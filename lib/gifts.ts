import { sql } from './db';
import { RuleError } from './loyalty';
import { cleanGiftCode } from './money';
import type { Business } from './business';
import { siteUrl } from './site';

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => CHARS[b % CHARS.length]).join('');

export const giftUrl = (biz: Business, code: string) =>
  `${siteUrl()}/${biz.slug}/g/${code}`;

export type GiftInput = { kind: 'amount' | 'item'; amount?: number; label?: string; to?: string; from?: string; message?: string; days?: number };

export async function createGift(biz: Business, staffId: string, input: GiftInput) {
  if (!biz.settings.gifts.enabled) throw new RuleError('Gift certificates are switched off in Settings');
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null;
  const kind = input.kind === 'item' ? 'item' : 'amount';
  const amount = kind === 'item' ? 1 : Math.round(Number(input.amount));
  if (kind === 'amount' && !(amount > 0 && amount <= 100_000_000)) throw new RuleError('Enter the gift value');
  const label = str(input.label, 40) ?? (kind === 'item' ? null : 'Gift certificate');
  if (!label) throw new RuleError('Say what the gift is, e.g. Free coffee');
  const days = Math.min(730, Math.max(1, Math.round(Number(input.days)) || biz.settings.gifts.validDays));
  for (let i = 0; i < 5; i++) {
    const [g] = await sql`insert into gift_cards (business_id, code, kind, label, amount, balance, to_name, from_name, message, expires_at, created_by)
      values (${biz.id}, ${newCode()}, ${kind}, ${label}, ${amount}, ${amount}, ${str(input.to, 40)}, ${str(input.from, 40)},
              ${str(input.message, 200)}, now() + make_interval(days => ${days}::int), ${staffId})
      on conflict (code) do nothing returning *`;
    if (g) return g;
  }
  throw new Error('Could not create a gift code');
}

export async function findGift(biz: Business, rawCode: string) {
  const code = cleanGiftCode(rawCode);
  if (code.length !== 10) return null;
  const [g] = await sql`select g.*, (g.expires_at < now()) expired from gift_cards g where business_id = ${biz.id} and code = ${code}`;
  if (!g) return null;
  const uses = await sql`select u.amount, u.created_at, s.name staff from gift_card_uses u left join staff s on s.id = u.staff_id
    where gift_card_id = ${g.id} order by u.created_at desc`;
  return { ...(g as any), uses } as Record<string, any>;
}

/** Takes value off a certificate. Items are used in one go. */
export async function redeemGift(biz: Business, rawCode: string, amount: number, staffId: string) {
  const code = cleanGiftCode(rawCode);
  return sql.begin(async (tx) => {
    const [g] = await tx`select * from gift_cards where business_id = ${biz.id} and code = ${code} for update`;
    if (!g) throw new RuleError('Gift certificate not found');
    if (g.void) throw new RuleError('This gift certificate was cancelled');
    if (new Date(g.expires_at) < new Date()) throw new RuleError('This gift certificate has expired');
    if (g.balance <= 0) throw new RuleError('This gift certificate is already used up');
    const take = g.kind === 'item' ? 1 : Math.round(Number(amount));
    if (!(take > 0)) throw new RuleError('Enter the amount to use');
    if (take > g.balance) throw new RuleError('That is more than the balance left');
    await tx`insert into gift_card_uses (gift_card_id, amount, staff_id) values (${g.id}, ${take}, ${staffId})`;
    const [u] = await tx`update gift_cards set balance = balance - ${take} where id = ${g.id} returning balance`;
    return { label: g.label as string, kind: g.kind as string, used: take, balance: u.balance as number };
  });
}
