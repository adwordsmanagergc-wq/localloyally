import { sql } from '@/lib/db';
import { managerRoute } from '@/lib/route';
import { csvResponse } from '@/lib/csv';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) => {
  const rows = await sql`
    select c.name, c.username, c.phone, c.marketing_opt_in, c.created_at,
      coalesce((select sum(delta) from stamps s where s.customer_id = c.id), 0)::int stamps,
      (select count(*) from stamps s where s.customer_id = c.id and reason = 'purchase')::int visits,
      (select max(created_at) from stamps s where s.customer_id = c.id and reason = 'purchase') last_visit
    from customers c where c.business_id = ${biz.id} order by c.created_at`;
  return csvResponse(`${biz.slug}-members.csv`, ['name', 'username', 'whatsapp', 'marketing_opt_in', 'joined', 'stamps', 'visits', 'last_visit'],
    rows.map((r) => [r.name, r.username, r.phone, r.marketing_opt_in, r.created_at, r.stamps, r.visits, r.last_visit]));
});
