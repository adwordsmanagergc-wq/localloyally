import { sql } from '@/lib/db';
import { createGift, giftUrl } from '@/lib/gifts';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = staffRoute(async (_req, biz) => {
  const items = await sql`select g.id, g.code, g.kind, g.label, g.amount, g.balance, g.to_name, g.from_name, g.void,
      g.expires_at, g.created_at, (g.expires_at < now()) expired, s.name sold_by
    from gift_cards g left join staff s on s.id = g.created_by
    where g.business_id = ${biz.id} order by g.created_at desc limit 50`;
  return json({ items });
});

export const POST = staffRoute(async (req, biz, staff) => {
  const g = await createGift(biz, staff.id, await body(req));
  return json({ gift: g, url: giftUrl(biz, g.code) });
});

/** Managers can cancel a certificate, e.g. a refund. */
export const PATCH = staffRoute(async (req, biz, staff) => {
  if (staff.role !== 'manager') return json({ error: 'Managers only' }, 403);
  const b = await body(req);
  const [g] = await sql`update gift_cards set void = ${b.void === true} where id = ${String(b.id)} and business_id = ${biz.id} returning id`;
  return g ? json({ ok: true }) : json({ error: 'Not found' }, 404);
});
