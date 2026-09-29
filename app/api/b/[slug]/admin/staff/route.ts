import { sql } from '@/lib/db';
import { checkPin, hashPin } from '@/lib/auth';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) =>
  json({ items: await sql`select id, name, role, active from staff where business_id = ${biz.id} order by active desc, created_at` }));

export const POST = managerRoute(async (req, biz) => {
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 40);
  const pin = String(b.pin || '');
  if (name.length < 2) return json({ error: 'Add a name' }, 400);
  if (!/^\d{4,8}$/.test(pin)) return json({ error: 'PIN must be 4 to 8 digits' }, 400);
  const existing = await sql`select pin_hash from staff where business_id = ${biz.id} and active`;
  if (existing.some((s) => checkPin(pin, s.pin_hash))) return json({ error: 'That PIN is already used, pick another' }, 400);
  await sql`insert into staff (business_id, name, pin_hash, role) values (${biz.id}, ${name}, ${hashPin(pin)}, ${b.role === 'manager' ? 'manager' : 'staff'})`;
  return json({ ok: true });
});

export const PATCH = managerRoute(async (req, biz, me) => {
  const b = await body(req);
  if (b.id === me.id) return json({ error: "You can't switch off your own login" }, 400);
  await sql`update staff set active = ${b.active === true} where id = ${String(b.id)} and business_id = ${biz.id}`;
  return json({ ok: true });
});
