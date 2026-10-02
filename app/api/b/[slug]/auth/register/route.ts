import { sql } from '@/lib/db';
import { hashPin, setCustomerSession, setMemberSession } from '@/lib/auth';
import { createCard } from '@/lib/members';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, normalizePhone, rateLimit } from '@/lib/util';
import { cleanUsername, usernameTakenByOther } from '@/lib/username';

export const POST = bizRoute(async (req, biz) => {
  if (!(await rateLimit(`register:${clientIp(req)}`, 10, 3600))) return json({ error: 'Too many sign ups from this device. Try again later.' }, 429);
  const b = await body(req);
  const username = cleanUsername(b.username);
  const phone = normalizePhone(b.phone, biz.settings.defaultCountryCode);
  const password = String(b.password || '');
  if (!username) return json({ error: 'Usernames are 3 to 20 letters or numbers (dots and _ are fine), with at least one letter' }, 400);
  // Shown on the card and to staff. Customers can't set a separate name, so the username is it.
  const name = String(b.name || '').trim().slice(0, 60) || username;
  if (!phone) return json({ error: 'Enter your WhatsApp number, e.g. 0812 3456 7890 or +44 7700 900123' }, 400);
  if (password.length < 6) return json({ error: 'Password needs at least 6 characters' }, 400);
  if (b.terms !== true) return json({ error: 'Please agree to the terms and conditions' }, 400);
  if (await usernameTakenByOther(username, phone)) return json({ error: 'That username is taken. Try another.' }, 409);
  const m = Number(b.birthdayMonth), d = Number(b.birthdayDay);
  const bday = Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= new Date(2024, m, 0).getDate();

  const [exists] = await sql`select 1 from customers where business_id = ${biz.id} and phone = ${phone}`;
  if (exists) return json({ error: 'That number already has a card. Log in instead.', exists: true }, 409);
  const [userTaken] = await sql`select 1 from customers where business_id = ${biz.id} and lower(username) = ${username}`;
  if (userTaken) return json({ error: 'That username is taken. Try another.' }, 409);

  let referredBy: string | null = null;
  if (b.ref) {
    const [r] = await sql`select id from customers where business_id = ${biz.id} and ref_code = ${String(b.ref).toUpperCase()}`;
    referredBy = r?.id ?? null;
  }
  const cust = await createCard(biz, {
    name, username, phone, passwordHash: hashPin(password), optIn: b.optIn === true, referredBy,
    birthdayMonth: bday ? m : null, birthdayDay: bday ? d : null,
  });
  if (!cust) return json({ error: 'That number already has a card. Log in instead.', exists: true }, 409);
  await setCustomerSession(biz.id, cust.id);
  await setMemberSession(phone);
  return json({ ok: true });
});
