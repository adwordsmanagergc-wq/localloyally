import { timingSafeEqual } from 'node:crypto';
import { sql } from '@/lib/db';
import { hashOtp, hashPin, setCustomerSession, setMemberSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { json, normalizePhone } from '@/lib/util';

/** Forgot password: check the WhatsApp code from /auth/start, then set a new password. */
export const POST = bizRoute(async (req, biz) => {
  const b = await body(req);
  const phone = normalizePhone(b.phone, biz.settings.defaultCountryCode);
  const code = String(b.code || '').replace(/\D/g, '');
  const password = String(b.password || '');
  if (!phone || code.length !== 6) return json({ error: 'Enter the 6-digit code' }, 400);
  if (password.length < 6) return json({ error: 'Password needs at least 6 characters' }, 400);
  const [otp] = await sql`select code_hash, attempts, expires_at from otp_codes where business_id = ${biz.id} and phone = ${phone}`;
  if (!otp || new Date(otp.expires_at) < new Date()) return json({ error: 'Code expired. Send a new one.' }, 400);
  if (otp.attempts >= 5) return json({ error: 'Too many wrong tries. Send a new code.' }, 429);
  if (!timingSafeEqual(Buffer.from(otp.code_hash, 'hex'), Buffer.from(hashOtp(biz.id, phone, code), 'hex'))) {
    await sql`update otp_codes set attempts = attempts + 1 where business_id = ${biz.id} and phone = ${phone}`;
    return json({ error: 'That code is not right' }, 400);
  }
  // Same person, verified by WhatsApp: one password for all their cards.
  await sql`update customers set password_hash = ${hashPin(password)} where phone = ${phone}`;
  const [c] = await sql`select id from customers where business_id = ${biz.id} and phone = ${phone}`;
  await sql`delete from otp_codes where business_id = ${biz.id} and phone = ${phone}`;
  if (!c) return json({ error: 'No card with that number' }, 404);
  await setCustomerSession(biz.id, c.id);
  await setMemberSession(phone);
  return json({ ok: true });
});
