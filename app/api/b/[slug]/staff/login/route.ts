import { sql } from '@/lib/db';
import { checkPin, setStaffSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { clientIp, json, rateLimit } from '@/lib/util';

/** Staff log in with their name and password. Older logins can still use a PIN on its own. */
export const POST = bizRoute(async (req, biz) => {
  if (!(await rateLimit(`pin:${biz.id}:${clientIp(req)}`, 8, 900))) return json({ error: 'Too many tries. Wait 15 minutes.' }, 429);
  const b = await body(req);
  const name = String(b.name || '').trim().toLowerCase();
  const password = String(b.password ?? b.pin ?? '');
  if (password.length < 4 || password.length > 64) return json({ error: 'Enter your password' }, 400);
  const staff = name
    ? await sql`select id, pin_hash from staff where business_id = ${biz.id} and active and lower(name) = ${name}`
    : await sql`select id, pin_hash from staff where business_id = ${biz.id} and active`;
  const matches = staff.filter((s) => checkPin(password, s.pin_hash));
  if (!matches.length) return json({ error: name ? 'Wrong name or password' : 'Wrong PIN' }, 401);
  if (matches.length > 1) return json({ error: 'Type your name as well' }, 400);
  await setStaffSession(biz.id, matches[0].id);
  return json({ ok: true });
});
