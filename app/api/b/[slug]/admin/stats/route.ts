import { sql } from '@/lib/db';
import { managerRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) => {
  const tz = biz.settings.timezone;
  const [[m], [st], [rw], [v], [p], daily] = await Promise.all([
    sql`select count(*)::int total, count(*) filter (where created_at > now() - interval '7 days')::int new7,
        count(*) filter (where marketing_opt_in)::int optin from customers where business_id = ${biz.id}`,
    sql`select coalesce(sum(delta) filter (where reason = 'purchase' and (created_at at time zone ${tz})::date = (now() at time zone ${tz})::date), 0)::int as today,
        coalesce(sum(delta) filter (where reason = 'purchase' and created_at > now() - interval '7 days'), 0)::int as week,
        count(distinct customer_id) filter (where reason = 'purchase' and created_at > now() - interval '30 days')::int active30
        from stamps where business_id = ${biz.id}`,
    sql`select count(*) filter (where created_at > now() - interval '30 days')::int as month, count(*)::int total
        from stamps where business_id = ${biz.id} and reason = 'redeem'`,
    sql`select count(*) filter (where redeemed_at > now() - interval '30 days')::int used30,
        count(*) filter (where created_at > now() - interval '30 days')::int issued30 from vouchers where business_id = ${biz.id}`,
    sql`select count(*) filter (where status = 'pending')::int pending, count(*) filter (where status = 'approved' and created_at > now() - interval '30 days')::int approved30
        from social_submissions where business_id = ${biz.id}`,
    sql`select to_char(day, 'DD Mon') d, sum(delta)::int n from (
          select (created_at at time zone ${tz})::date as day, delta from stamps
          where business_id = ${biz.id} and reason = 'purchase' and created_at > now() - interval '14 days') x
        group by day order by day`,
  ]);
  return json({ members: m, stamps: st, rewards: rw, vouchers: v, social: p, daily });
});
