import { sql } from '@/lib/db';
import { csvResponse } from '@/lib/csv';
import { managerRoute } from '@/lib/route';
import { json } from '@/lib/util';
import { isSegment, memberStats, segmentWhere } from '@/lib/segments';

export const dynamic = 'force-dynamic';

/** Customers who agreed to WhatsApp messages from this business, optionally one group (?segment=). ?csv=1 downloads them. */
export const GET = managerRoute(async (req, biz) => {
  const seg = new URL(req.url).searchParams.get('segment') || 'all';
  if (!isSegment(seg)) return json({ error: 'Unknown group' }, 400);
  const tiers = biz.settings.rewards.map((r) => r.stamps);
  const rows = await sql`with m as (${memberStats(biz.id)})
    select m.username, m.name, m.phone, m.created_at, m.last_visit, m.visits from m
    where m.marketing_opt_in and ${segmentWhere(seg, tiers)}
    order by m.created_at desc`;
  const [{ total }] = await sql`select count(*)::int total from customers where business_id = ${biz.id}`;
  if (new URL(req.url).searchParams.get('csv'))
    return csvResponse(`${biz.slug}-whatsapp-marketing.csv`, ['username', 'name', 'whatsapp', 'whatsapp_link', 'joined', 'visits', 'last_visit'],
      // Digits with country code (what WhatsApp tools expect); a leading + would be mangled by spreadsheets
      rows.map((r) => [r.username, r.name, r.phone, `https://wa.me/${r.phone}`, r.created_at, r.visits, r.last_visit]));
  return json({ items: rows, total });
});
