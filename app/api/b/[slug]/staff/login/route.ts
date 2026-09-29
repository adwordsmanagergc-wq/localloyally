import { sql } from '@/lib/db';
import { checkPin, setStaffSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, rateLimit } from '@/lib/util';

export const POST = bizRoute(async (req, biz) => {
  if (!(await rateLimit(`pin:${biz.id}:${clientIp(req)}`, 8, 900))) return json({ error: 'Too many tries. Wait 15 minutes.' }, 429);
  const pin = String((await body(req)).pin || '');
  if (!/^\d{4,8}$/.test(pin)) return json({ error: 'PIN is 4 to 8 digits' }, 400);
  const staff = await sql`select id, pin_hash from staff where business_id = ${biz.id} and active`;
  const match = staff.find((s) => checkPin(pin, s.pin_hash));
  if (!match) return json({ error: 'Wrong PIN' }, 401);
  await setStaffSession(biz.id, match.id);
  return json({ ok: true });
});
