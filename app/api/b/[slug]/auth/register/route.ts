import { sql } from '@/lib/db';
import { hashPin, setCustomerSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, normalizePhone, randomRefCode, rateLimit } from '@/lib/util';

export const POST = bizRoute(async (req, biz) => {
  if (!(await rateLimit(`register:${clientIp(req)}`, 10, 3600))) return json({ error: 'Too many sign ups from this device. Try again later.' }, 429);
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 60);
  const phone = normalizePhone(b.phone, biz.settings.defaultCountryCode);
  const password = String(b.password || '');
  if (name.length < 2) return json({ error: 'Add your name' }, 400);
  if (!phone) return json({ error: 'Enter your WhatsApp number, e.g. 0812 3456 7890 or +44 7700 900123' }, 400);
  if (password.length < 6) return json({ error: 'Password needs at least 6 characters' }, 400);
  const m = Number(b.birthdayMonth), d = Number(b.birthdayDay);
  const bday = Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= new Date(2024, m, 0).getDate();

  const [exists] = await sql`select 1 from customers where business_id = ${biz.id} and phone = ${phone}`;
  if (exists) return json({ error: 'That number already has a card. Log in instead.', exists: true }, 409);

  let referredBy: string | null = null;
  if (b.ref) {
    const [r] = await sql`select id from customers where business_id = ${biz.id} and ref_code = ${String(b.ref).toUpperCase()}`;
    referredBy = r?.id ?? null;
  }
  const hash = hashPin(password);
  const cust = await sql.begin(async (tx) => {
    let row: any;
    for (let i = 0; i < 5 && !row; i++) {
      try {
        [row] = await tx`insert into customers (business_id, name, phone, password_hash, birthday_month, birthday_day, marketing_opt_in, ref_code, referred_by)
          values (${biz.id}, ${name}, ${phone}, ${hash}, ${bday ? m : null}, ${bday ? d : null}, ${b.optIn === true}, ${randomRefCode()}, ${referredBy})
          on conflict (ref_code) do nothing returning id`;
      } catch (e: any) {
        if (e.code === '23505') throw Object.assign(new Error('exists'), { exists: true });
        throw e;
      }
    }
    if (!row) throw new Error('Could not create member');
    if (biz.settings.welcomeStamps > 0)
      await tx`insert into stamps (business_id, customer_id, delta, reason) values (${biz.id}, ${row.id}, ${biz.settings.welcomeStamps}, 'welcome')`;
    return row;
  }).catch((e) => (e.exists ? null : Promise.reject(e)));
  if (!cust) return json({ error: 'That number already has a card. Log in instead.', exists: true }, 409);
  await setCustomerSession(biz.id, cust.id);
  return json({ ok: true });
});
