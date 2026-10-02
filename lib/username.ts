import { sql } from './db';
import { normalizePhone } from './util';

/** 3-20 letters, numbers, dots or underscores, with at least one letter (so it can't be mistaken for a phone number). */
export function cleanUsername(raw: unknown): string | null {
  const u = String(raw ?? '').trim().toLowerCase();
  return /^[a-z0-9._]{3,20}$/.test(u) && /[a-z]/.test(u) ? u : null;
}

/**
 * A username belongs to one person across all businesses, so the main-site login can find their cards.
 * The same person (same WhatsApp number) can reuse it at another business.
 */
export async function usernameTakenByOther(username: string, phone: string) {
  const [r] = await sql`select 1 from customers where lower(username) = ${username} and phone <> ${phone} limit 1`;
  return !!r;
}

/** Login box accepts a username or (for older cards) a WhatsApp number. Returns matching cards, optionally for one business. */
export async function findCards(login: string, defaultCountry = '62', bizId?: string) {
  const u = cleanUsername(login);
  const phone = u ? null : normalizePhone(login, defaultCountry);
  if (!u && !phone) return [];
  return sql`select c.id, c.password_hash, b.id biz_id, b.name, b.slug from customers c join businesses b on b.id = c.business_id
    where b.active and ${u ? sql`lower(c.username) = ${u}` : sql`c.phone = ${phone}`}
      ${bizId ? sql`and c.business_id = ${bizId}` : sql``}
    order by b.name`;
}
