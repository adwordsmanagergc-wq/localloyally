import { sql } from './db';
import { RuleError } from './loyalty';
import { cleanGiftCode } from './money';
import { normalizePhone } from './util';
import type { Business } from './business';
import { siteUrl } from './site';

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => CHARS[b % CHARS.length]).join('');

export const giftUrl = (biz: Business, code: string) =>
  `${siteUrl()}/${biz.slug}/g/${code}`;

export type GiftInput = {
  kind: 'amount' | 'item'; amount?: number; label?: string; to?: string; from?: string; message?: string; days?: number;
  toUsername?: string;   // a member: the gift appears on their card
  toPhone?: string;      // a friend who isn't a member yet: they get a sign-up link
  fromUsername?: string; // the member who bought it: counts as their referral when the friend signs up
};

const findMember = async (biz: Business, raw: unknown) => {
  const u = String(raw || '').trim().replace(/^@/, '').toLowerCase();
  if (!u) return null;
  const [m] = await sql`select id, coalesce(username, name) username, name, phone, ref_code from customers where business_id = ${biz.id} and lower(username) = ${u}`;
  if (!m) throw new RuleError(`No member called @${u} here. Check the username.`);
  return m as { id: string; username: string; name: string; phone: string; ref_code: string };
};

export async function createGift(biz: Business, staffId: string, input: GiftInput) {
  if (!biz.settings.gifts.enabled) throw new RuleError('Gift certificates are switched off in Settings');
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null;
  const kind = input.kind === 'item' ? 'item' : 'amount';
  const amount = kind === 'item' ? 1 : Math.round(Number(input.amount));
  if (kind === 'amount' && !(amount > 0 && amount <= 100_000_000)) throw new RuleError('Enter the gift value');
  const label = str(input.label, 40) ?? (kind === 'item' ? null : 'Gift certificate');
  if (!label) throw new RuleError('Say what the gift is, e.g. Free coffee');
  const days = Math.min(730, Math.max(1, Math.round(Number(input.days)) || biz.settings.gifts.validDays));
  const member = await findMember(biz, input.toUsername);
  const from = await findMember(biz, input.fromUsername);
  let toPhone: string | null = null;
  if (!member && input.toPhone && String(input.toPhone).trim()) {
    toPhone = normalizePhone(String(input.toPhone), biz.settings.defaultCountryCode);
    if (!toPhone) throw new RuleError("Check the friend's WhatsApp number, e.g. +61 412 345 678");
  }
  for (let i = 0; i < 5; i++) {
    const [g] = await sql`insert into gift_cards (business_id, code, kind, label, amount, balance, to_name, from_name, message, expires_at,
        created_by, customer_id, from_customer_id, to_phone)
      values (${biz.id}, ${newCode()}, ${kind}, ${label}, ${amount}, ${amount}, ${str(input.to, 40) ?? member?.username ?? null},
              ${str(input.from, 40) ?? from?.username ?? null}, ${str(input.message, 200)}, now() + make_interval(days => ${days}::int),
              ${staffId}, ${member?.id ?? null}, ${from?.id ?? null}, ${toPhone})
      on conflict (code) do nothing returning *`;
    if (g) return { gift: g, member, from, toPhone };
  }
  throw new Error('Could not create a gift code');
}

/** Sign-up link for a friend who isn't a member: it carries the gift, and the buyer's referral if there is one. */
export const giftJoinUrl = (biz: Business, code: string, buyerRef?: string | null) =>
  buyerRef ? `${siteUrl()}/${biz.slug}/r/${buyerRef}?gift=${code}` : `${siteUrl()}/${biz.slug}?join=1&gift=${code}`;

/** A new member signed up from a gift link: the gift moves onto their card. */
export async function claimGift(biz: Business, customerId: string, rawCode: unknown) {
  const code = cleanGiftCode(String(rawCode || ''));
  if (code.length !== 10) return;
  await sql`update gift_cards set customer_id = ${customerId}
    where business_id = ${biz.id} and code = ${code} and customer_id is null and not void`;
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

/** Gift certificates sent to this member that can still be used. */
export const memberGifts = (customerId: string) => sql`
  select code, kind, label, amount, balance, from_name, expires_at from gift_cards
  where customer_id = ${customerId} and not void and balance > 0 and expires_at > now() order by created_at desc`;
