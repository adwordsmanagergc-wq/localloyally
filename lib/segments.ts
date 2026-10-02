import { sql } from './db';
import { SEGMENTS, type Segment } from './segments-meta';
export { SEGMENTS, isSegment, type Segment } from './segments-meta';

/** One row per member with the numbers the segments need. */
export const memberStats = (bizId: string) => sql`
  select c.id, c.name, c.username, c.phone, c.marketing_opt_in, c.created_at,
    coalesce(x.balance, 0)::int balance, coalesce(x.visits, 0)::int visits, coalesce(x.visits60, 0)::int visits60, x.last_visit
  from customers c
  left join lateral (
    select sum(delta) balance,
      count(*) filter (where reason = 'purchase') visits,
      count(*) filter (where reason = 'purchase' and created_at > now() - interval '60 days') visits60,
      max(created_at) filter (where reason = 'purchase') last_visit
    from stamps s where s.customer_id = c.id
  ) x on true
  where c.business_id = ${bizId}`;

/** SQL condition on a memberStats row (aliased m). tiers = reward stamp counts. */
export function segmentWhere(segment: Segment, tiers: number[]) {
  switch (segment) {
    case 'all': return sql`true`;
    case 'active': return sql`m.last_visit > now() - interval '30 days'`;
    case 'regulars': return sql`m.visits60 >= 3`;
    case 'close': return sql`exists (select 1 from unnest(${tiers}::int[]) t where t - m.balance between 1 and 2)`;
    case 'at_risk': return sql`m.last_visit <= now() - interval '30 days' and m.last_visit > now() - interval '60 days'`;
    case 'lost': return sql`m.last_visit <= now() - interval '60 days'`;
    case 'never': return sql`m.last_visit is null`;
  }
}

export async function segmentCounts(bizId: string, tiers: number[]) {
  const out = {} as Record<Segment, { total: number; whatsapp: number }>;
  await Promise.all((Object.keys(SEGMENTS) as Segment[]).map(async (k) => {
    const [r] = await sql`with m as (${memberStats(bizId)})
      select count(*)::int total, count(*) filter (where m.marketing_opt_in)::int whatsapp from m where ${segmentWhere(k, tiers)}`;
    out[k] = r as any;
  }));
  return out;
}
