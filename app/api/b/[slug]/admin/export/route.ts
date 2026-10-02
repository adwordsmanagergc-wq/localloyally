import { sql } from '@/lib/db';
import { managerRoute } from '@/lib/route';

export const dynamic = 'force-dynamic';
const cell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET = managerRoute(async (_req, biz) => {
  const rows = await sql`
    select c.name, c.username, c.phone, c.marketing_opt_in, c.created_at,
      coalesce((select sum(delta) from stamps s where s.customer_id = c.id), 0)::int stamps,
      (select count(*) from stamps s where s.customer_id = c.id and reason = 'purchase')::int visits,
      (select max(created_at) from stamps s where s.customer_id = c.id and reason = 'purchase') last_visit
    from customers c where c.business_id = ${biz.id} order by c.created_at`;
  const head = ['name', 'username', 'whatsapp', 'marketing_opt_in', 'joined', 'stamps', 'visits', 'last_visit'];
  const csv = [head.join(','), ...rows.map((r) => [r.name, r.username, '+' + r.phone, r.marketing_opt_in, r.created_at, r.stamps, r.visits, r.last_visit].map(cell).join(','))].join('\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${biz.slug}-members.csv"` },
  });
});
