import { sql } from '@/lib/db';
import { checkPin, setCustomerSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, normalizePhone, rateLimit } from '@/lib/util';

export const POST = bizRoute(async (req, biz) => {
  const b = await body(req);
  const phone = normalizePhone(b.phone, biz.settings.defaultCountryCode);
  const password = String(b.password || '');
  if (!phone || !password) return json({ error: 'Enter your WhatsApp number and password' }, 400);
  if (!(await rateLimit(`login:${biz.id}:${phone}`, 8, 900)) || !(await rateLimit(`login-ip:${clientIp(req)}`, 40, 900)))
    return json({ error: 'Too many tries. Wait 15 minutes or reset your password.' }, 429);
  const [c] = await sql`select id, password_hash from customers where business_id = ${biz.id} and phone = ${phone}`;
  if (!c) return json({ error: 'No card with that number. Tap Join to create one.' }, 401);
  if (!c.password_hash) return json({ error: 'Your card has no password yet. Tap "Forgot password" to set one.' }, 401);
  if (!checkPin(password, c.password_hash)) return json({ error: 'Wrong password' }, 401);
  await setCustomerSession(biz.id, c.id);
  return json({ ok: true });
});
