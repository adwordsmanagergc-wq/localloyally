import { sql } from '@/lib/db';
import { reviewSocial } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = staffRoute(async (_req, biz) => {
  const rows = await sql`select s.id, s.url, s.platform, s.created_at, c.name from social_submissions s
    join customers c on c.id = s.customer_id where s.business_id = ${biz.id} and s.status = 'pending' order by s.created_at limit 50`;
  return json({ items: rows });
});

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  await reviewSocial(biz, Number(b.id), b.approve === true, staff.id);
  return json({ ok: true });
});
