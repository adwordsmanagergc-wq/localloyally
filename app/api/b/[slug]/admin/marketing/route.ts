import { sql } from '@/lib/db';
import { csvResponse } from '@/lib/csv';
import { managerRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';

/** Customers who agreed to WhatsApp messages from this business. ?csv=1 downloads them. */
export const GET = managerRoute(async (req, biz) => {
  const rows = await sql`
    select c.username, c.name, c.phone, c.created_at,
      (select max(created_at) from stamps s where s.customer_id = c.id and reason = 'purchase') last_visit,
      (select count(*) from stamps s where s.customer_id = c.id and reason = 'purchase')::int visits
    from customers c where c.business_id = ${biz.id} and c.marketing_opt_in
    order by c.created_at desc`;
  const [{ total }] = await sql`select count(*)::int total from customers where business_id = ${biz.id}`;
  if (new URL(req.url).searchParams.get('csv'))
    return csvResponse(`${biz.slug}-whatsapp-marketing.csv`, ['username', 'name', 'whatsapp', 'whatsapp_link', 'joined', 'visits', 'last_visit'],
      // Digits with country code (what WhatsApp tools expect); a leading + would be mangled by spreadsheets
      rows.map((r) => [r.username, r.name, r.phone, `https://wa.me/${r.phone}`, r.created_at, r.visits, r.last_visit]));
  return json({ items: rows, total });
});
