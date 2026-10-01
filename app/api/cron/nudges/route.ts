import { sql } from '@/lib/db';
import { mergeSettings } from '@/lib/business';
import { json } from '@/lib/util';
import { sendWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

/** Runs daily. Sends "1 stamp away" nudges and voucher expiry reminders to opted-in members. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
  const base = (process.env.APP_URL || '').replace(/\/$/, '');
  let nudges = 0, reminders = 0, reviewAsks = 0;

  const businesses = await sql`select id, slug, name, settings from businesses where active`;
  for (const b of businesses) {
    const s = mergeSettings(b.settings);
    const link = `${base}/${b.slug}/card`;

    // Review requests: once per customer, the day after their Nth visit. Never tied to a reward.
    if (s.reviews.enabled && s.reviews.googleUrl) {
      const ready = await sql`
        select c.id, c.name, c.phone from customers c
        where c.business_id = ${b.id} and c.marketing_opt_in and c.review_asked_at is null
          and (select count(*) from stamps s where s.customer_id = c.id and s.reason = 'purchase') >= ${s.reviews.afterVisits}
          and (select max(created_at) from stamps s where s.customer_id = c.id and s.reason = 'purchase') < now() - interval '20 hours'
        limit 200`;
      for (const c of ready) {
        const ok = await sendWhatsApp(c.phone, `Hi ${c.name}, thanks for being a regular at ${b.name}! Would you mind leaving us a quick Google review? It really helps a small business get found.\n${s.reviews.googleUrl}`,
          { name: process.env.META_REVIEW_TEMPLATE || 'review_request', params: [c.name, b.name, s.reviews.googleUrl] });
        if (ok) { reviewAsks++; await sql`update customers set review_asked_at = now() where id = ${c.id}`; }
      }
    }

    if (!s.nudges.enabled) continue;
    const tiers = s.rewards.map((r) => r.stamps);

    const oneAway = await sql`
      select c.id, c.name, c.phone, x.balance from customers c
      cross join lateral (select coalesce(sum(delta), 0)::int balance, max(created_at) filter (where reason = 'purchase') last_visit
                          from stamps s where s.customer_id = c.id) x
      where c.business_id = ${b.id} and c.marketing_opt_in
        and (c.last_nudged_at is null or c.last_nudged_at < now() - interval '7 days')
        and x.last_visit < now() - make_interval(days => ${s.nudges.afterDays}::int)
        and (x.balance + 1) = any(${tiers}::int[])
      limit 200`;
    for (const c of oneAway) {
      const reward = s.rewards.find((r) => r.stamps === c.balance + 1)!.label;
      const ok = await sendWhatsApp(c.phone, `Hi ${c.name}! You're 1 stamp away from your next reward at ${b.name}: ${reward}. See you soon!\n${link}`,
        { name: process.env.META_NUDGE_TEMPLATE || 'one_stamp_away', params: [c.name, reward, b.name] });
      if (ok) { nudges++; await sql`update customers set last_nudged_at = now() where id = ${c.id}`; }
    }

    const expiring = await sql`
      select v.id, v.label, v.expires_at, c.name, c.phone from vouchers v join customers c on c.id = v.customer_id
      where v.business_id = ${b.id} and c.marketing_opt_in and v.redeemed_at is null and v.reminded_at is null
        and v.expires_at > now() and v.expires_at < now() + interval '48 hours' limit 200`;
    for (const v of expiring) {
      const ok = await sendWhatsApp(v.phone, `Hi ${v.name}, your ${v.label} voucher at ${b.name} expires soon. Show your card at the counter to use it.\n${link}`,
        { name: process.env.META_VOUCHER_TEMPLATE || 'voucher_expiring', params: [v.name, v.label, b.name] });
      if (ok) { reminders++; await sql`update vouchers set reminded_at = now() where id = ${v.id}`; }
    }
  }
  return json({ ok: true, nudges, reminders, reviewAsks });
}
