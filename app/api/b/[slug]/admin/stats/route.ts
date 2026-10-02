import { sql } from '@/lib/db';
import { managerRoute } from '@/lib/route';
import { json } from '@/lib/util';
import { memberStats, segmentCounts } from '@/lib/segments';

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
  const tiers = biz.settings.rewards.map((r) => r.stamps);
  const [[repeat], [retention], staff, segments] = await Promise.all([
    // Of members who have visited, how many came back at least once more
    sql`with m as (${memberStats(biz.id)})
        select count(*) filter (where visits >= 1)::int visited, count(*) filter (where visits >= 2)::int returned,
          coalesce(round(avg(visits) filter (where visits >= 1), 1), 0)::float avg_visits from m`,
    // Of members who visited 31-60 days ago, how many visited again in the last 30 days
    sql`select count(distinct a.customer_id)::int base,
          count(distinct a.customer_id) filter (where exists (select 1 from stamps b where b.customer_id = a.customer_id
            and b.reason = 'purchase' and b.created_at > now() - interval '30 days'))::int back
        from stamps a where a.business_id = ${biz.id} and a.reason = 'purchase'
          and a.created_at <= now() - interval '30 days' and a.created_at > now() - interval '60 days'`,
    // What each staff member did in the last 30 days
    sql`select st.id, st.name, st.role, st.active,
          coalesce(s.visits, 0)::int visits, coalesce(s.stamps, 0)::int stamps, coalesce(s.rewards, 0)::int rewards,
          coalesce(s.customers, 0)::int customers,
          (select count(*) from vouchers v where v.redeemed_by = st.id and v.redeemed_at > now() - interval '30 days')::int vouchers,
          (select count(*) from social_submissions x where x.reviewed_by = st.id and x.reviewed_at > now() - interval '30 days')::int posts,
          (select count(*) from gift_cards g where g.created_by = st.id and g.created_at > now() - interval '30 days')::int gifts_sold
        from staff st
        left join lateral (
          select count(*) filter (where reason = 'purchase') visits, sum(delta) filter (where reason = 'purchase') stamps,
            count(*) filter (where reason = 'redeem') rewards, count(distinct customer_id) filter (where reason = 'purchase') customers
          from stamps where staff_id = st.id and created_at > now() - interval '30 days'
        ) s on true
        where st.business_id = ${biz.id}
        order by visits desc, st.name`,
    segmentCounts(biz.id, tiers),
  ]);
  return json({ members: m, stamps: st, rewards: rw, vouchers: v, social: p, daily, repeat, retention, staff, segments });
});
