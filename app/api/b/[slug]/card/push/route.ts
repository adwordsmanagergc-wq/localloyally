import { sql } from '@/lib/db';
import { customerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

/** A member turns phone notifications on (POST) or off (DELETE) for this card. */
export const POST = customerRoute(async (req, _biz, id) => {
  const b = await body(req);
  const endpoint = String(b.endpoint || ''), p256dh = String(b.keys?.p256dh || ''), auth = String(b.keys?.auth || '');
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000 || !p256dh || !auth) return json({ error: 'Could not turn on notifications' }, 400);
  await sql`insert into push_subscriptions (endpoint, customer_id, p256dh, auth) values (${endpoint}, ${id}, ${p256dh}, ${auth})
    on conflict (endpoint, customer_id) do update set p256dh = excluded.p256dh, auth = excluded.auth`;
  return json({ ok: true });
});

export const DELETE = customerRoute(async (req, _biz, id) => {
  const b = await body(req);
  await sql`delete from push_subscriptions where customer_id = ${id} and endpoint = ${String(b.endpoint || '')}`;
  return json({ ok: true });
});

/** Is this phone getting notifications for this card? */
export const GET = customerRoute(async (req, _biz, id) => {
  const endpoint = new URL(req.url).searchParams.get('endpoint') || '';
  const [r] = await sql`select 1 from push_subscriptions where customer_id = ${id} and endpoint = ${endpoint}`;
  return json({ on: !!r });
});
