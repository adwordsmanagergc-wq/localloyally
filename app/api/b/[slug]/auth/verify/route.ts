import { sql } from '@/lib/db';
import { hashOtp, setCustomerSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { json, normalizePhone, randomRefCode } from '@/lib/util';
import { timingSafeEqual } from 'node:crypto';

export const POST = bizRoute(async (req, biz) => {
  const b = await body(req);
  const phone = normalizePhone(b.phone, biz.settings.defaultCountryCode);
  const code = String(b.code || '').replace(/\D/g, '');
  if (!phone || code.length !== 6) return json({ error: 'Enter the 6-digit code' }, 400);

  const [otp] = await sql`select code_hash, attempts, expires_at from otp_codes where business_id = ${biz.id} and phone = ${phone}`;
  if (!otp || new Date(otp.expires_at) < new Date()) return json({ error: 'Code expired. Send a new one.' }, 400);
  if (otp.attempts >= 5) return json({ error: 'Too many wrong tries. Send a new code.' }, 429);
  const a = Buffer.from(otp.code_hash, 'hex');
  const c = Buffer.from(hashOtp(biz.id, phone, code), 'hex');
  if (!timingSafeEqual(a, c)) {
    await sql`update otp_codes set attempts = attempts + 1 where business_id = ${biz.id} and phone = ${phone}`;
    return json({ error: 'That code is not right' }, 400);
  }

  let [cust] = await sql`select id from customers where business_id = ${biz.id} and phone = ${phone}`;
  if (!cust) {
    const name = String(b.name || '').trim().slice(0, 60);
    if (name.length < 2) return json({ error: 'Add your name', needName: true }, 400);
    const m = Number(b.birthdayMonth), d = Number(b.birthdayDay);
    const bday = Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= new Date(2024, m, 0).getDate();
    let referredBy: string | null = null;
    if (b.ref) {
      const [r] = await sql`select id from customers where business_id = ${biz.id} and ref_code = ${String(b.ref).toUpperCase()}`;
      referredBy = r?.id ?? null;
    }
    cust = await sql.begin(async (tx) => {
      let row: any;
      for (let i = 0; i < 5 && !row; i++) {
        [row] = await tx`insert into customers (business_id, name, phone, birthday_month, birthday_day, marketing_opt_in, ref_code, referred_by)
          values (${biz.id}, ${name}, ${phone}, ${bday ? m : null}, ${bday ? d : null}, ${b.optIn === true}, ${randomRefCode()}, ${referredBy})
          on conflict do nothing returning id`;
        if (!row) {
          const [dupe] = await tx`select id from customers where business_id = ${biz.id} and phone = ${phone}`;
          if (dupe) return dupe; // signed up in another tab
        }
      }
      if (!row) throw new Error('Could not create member');
      if (biz.settings.welcomeStamps > 0)
        await tx`insert into stamps (business_id, customer_id, delta, reason) values (${biz.id}, ${row.id}, ${biz.settings.welcomeStamps}, 'welcome')`;
      return row;
    });
  }
  await sql`delete from otp_codes where business_id = ${biz.id} and phone = ${phone}`;
  await setCustomerSession(biz.id, cust.id);
  return json({ ok: true });
});
