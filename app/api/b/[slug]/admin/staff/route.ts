import { sql } from '@/lib/db';
import { hashPin } from '@/lib/auth';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) =>
  json({ items: await sql`select id, name, role, active from staff where business_id = ${biz.id} order by active desc, created_at` }));

const badPassword = (p: string) => p.length < 6 || p.length > 64;

export const POST = managerRoute(async (req, biz) => {
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 40);
  const password = String(b.password || '');
  if (name.length < 2) return json({ error: 'Add a name' }, 400);
  if (badPassword(password)) return json({ error: 'Password needs at least 6 characters' }, 400);
  const [taken] = await sql`select 1 from staff where business_id = ${biz.id} and active and lower(name) = ${name.toLowerCase()}`;
  if (taken) return json({ error: 'Someone already has that name. Add a surname or initial.' }, 400);
  await sql`insert into staff (business_id, name, pin_hash, role) values (${biz.id}, ${name}, ${hashPin(password)}, ${b.role === 'manager' ? 'manager' : 'staff'})`;
  return json({ ok: true });
});

/** Switch a login on or off, or set a new password. */
export const PATCH = managerRoute(async (req, biz, me) => {
  const b = await body(req);
  const id = String(b.id || '');
  if (typeof b.password === 'string') {
    if (badPassword(b.password)) return json({ error: 'Password needs at least 6 characters' }, 400);
    await sql`update staff set pin_hash = ${hashPin(b.password)} where id = ${id} and business_id = ${biz.id}`;
    return json({ ok: true });
  }
  if (id === me.id) return json({ error: "You can't switch off your own login" }, 400);
  if (b.active === true) {
    const [s] = await sql`select name from staff where id = ${id} and business_id = ${biz.id}`;
    const [taken] = s ? await sql`select 1 from staff where business_id = ${biz.id} and active and id <> ${id} and lower(name) = ${String(s.name).toLowerCase()}` : [];
    if (taken) return json({ error: 'Someone active already has that name' }, 400);
  }
  await sql`update staff set active = ${b.active === true} where id = ${id} and business_id = ${biz.id}`;
  return json({ ok: true });
});
