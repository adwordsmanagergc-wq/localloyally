import { sql } from '@/lib/db';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { walletChanged } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (req, biz) => {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 40);
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
  const rows = await sql`
    select c.id, c.name, c.phone, c.marketing_opt_in, c.created_at,
      coalesce((select sum(delta) from stamps s where s.customer_id = c.id), 0)::int balance,
      (select max(created_at) from stamps s where s.customer_id = c.id and reason = 'purchase') last_visit,
      (select count(*) from stamps s where s.customer_id = c.id and reason = 'purchase')::int visits
    from customers c where c.business_id = ${biz.id}
      and (${q} = '' or c.name ilike ${like} or c.phone like ${like})
    order by last_visit desc nulls last, c.created_at desc limit 100`;
  return json({ items: rows });
});

/** Manual correction, e.g. a stamp given by mistake. */
export const POST = managerRoute(async (req, biz, staff) => {
  const b = await body(req);
  const delta = Math.round(Number(b.delta));
  if (!delta || Math.abs(delta) > 50) return json({ error: 'Adjust by -50 to 50' }, 400);
  const [c] = await sql`select id from customers where id = ${String(b.customerId)} and business_id = ${biz.id}`;
  if (!c) return json({ error: 'Member not found' }, 404);
  await sql`insert into stamps (business_id, customer_id, delta, reason, staff_id, note)
            values (${biz.id}, ${c.id}, ${delta}, 'adjust', ${staff.id}, ${String(b.note || '').slice(0, 100) || null})`;
  walletChanged(biz, c.id);
  return json({ ok: true });
});
