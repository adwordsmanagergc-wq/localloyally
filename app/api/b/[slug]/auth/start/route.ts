import { randomInt } from 'node:crypto';
import { sql } from '@/lib/db';
import { hashOtp } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, normalizePhone, rateLimit } from '@/lib/util';
import { sendOtp } from '@/lib/whatsapp';

export const POST = bizRoute(async (req, biz) => {
  const { phone: raw } = await body(req);
  const phone = normalizePhone(raw, biz.settings.defaultCountryCode);
  if (!phone) return json({ error: 'Enter your WhatsApp number with country code, e.g. +62 812 3456 7890' }, 400);
  if (!(await rateLimit(`otp:${biz.id}:${phone}`, 3, 900)) || !(await rateLimit(`otp-ip:${clientIp(req)}`, 20, 3600)))
    return json({ error: 'Too many codes requested. Try again in 15 minutes.' }, 429);

  const code = String(randomInt(100000, 1000000));
  await sql`insert into otp_codes (business_id, phone, code_hash, expires_at)
            values (${biz.id}, ${phone}, ${hashOtp(biz.id, phone, code)}, now() + interval '10 minutes')
            on conflict (business_id, phone) do update set code_hash = excluded.code_hash, attempts = 0,
              expires_at = excluded.expires_at, created_at = now()`;
  const sent = await sendOtp(phone, code, biz.name);
  if (!sent) return json({ error: "Couldn't send the WhatsApp code. Check the number and try again." }, 502);
  const [existing] = await sql`select 1 from customers where business_id = ${biz.id} and phone = ${phone}`;
  return json({ ok: true, isNew: !existing, phone });
});
