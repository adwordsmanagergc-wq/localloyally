import { sql } from './db';
import { RuleError } from './loyalty';
import { memberStats, segmentWhere, type Segment } from './segments';
import { sendWhatsApp } from './whatsapp';
import { syncWallet } from './wallet';
import { sendPush } from './push';
import type { Business } from './business';
import { firstName, personalise } from './personalise';
export { personalise };
import { siteUrl } from './site';

export type OfferVoucher = { label: string; kind: 'percent' | 'item'; value: number; days: number };


/** Saves the offer, picks the members and gives them the voucher. Messages go out in batches via sendBatch. */
export async function createCampaign(biz: Business, staffId: string, segment: Segment, rawMessage: string, rawVoucher: any) {
  const message = String(rawMessage || '').trim().slice(0, 500);
  if (message.length < 5) throw new RuleError('Write a message first');
  let voucher: OfferVoucher | null = null;
  if (rawVoucher && rawVoucher.label) {
    const kind = rawVoucher.kind === 'percent' ? 'percent' : 'item';
    voucher = {
      label: String(rawVoucher.label).trim().slice(0, 40), kind,
      value: kind === 'percent' ? Math.min(100, Math.max(1, Math.round(Number(rawVoucher.value)) || 10)) : 0,
      days: Math.min(60, Math.max(1, Math.round(Number(rawVoucher.days)) || 10)),
    };
  }
  const tiers = biz.settings.rewards.map((r) => r.stamps);
  return sql.begin(async (tx) => {
    const [c] = await tx`insert into campaigns (business_id, staff_id, segment, message, voucher)
      values (${biz.id}, ${staffId}, ${segment}, ${message}, ${voucher ? sql.json(voucher) : null}) returning id`;
    const ins = await tx`insert into campaign_recipients (campaign_id, customer_id)
      select ${c.id}, m.id from (${memberStats(biz.id)}) m where ${segmentWhere(segment, tiers)} returning customer_id`;
    if (!ins.length) throw new RuleError('Nobody is in that group yet');
    await tx`update campaigns set recipients = ${ins.length} where id = ${c.id}`;
    if (voucher)
      await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
        select ${biz.id}, customer_id, ${voucher.label}, ${voucher.kind}, ${voucher.value}, 'campaign', ${c.id}::text,
               now() + make_interval(days => ${voucher.days}::int)
        from campaign_recipients where campaign_id = ${c.id} on conflict do nothing`;
    return { id: c.id as string, recipients: ins.length };
  });
}

/** Sends the next few messages. The browser calls this until remaining is 0, so no request runs long. */
export async function sendBatch(biz: Business, campaignId: string, size = 20) {
  const [c] = await sql`select id, message, voucher from campaigns where id = ${campaignId} and business_id = ${biz.id}`;
  if (!c) throw new RuleError('Offer not found');
  const link = `${siteUrl()}/${biz.slug}/card`;
  const batch = await sql`
    update campaign_recipients r set status = 'done' from customers cu
    where r.customer_id = cu.id and r.campaign_id = ${c.id}
      and r.customer_id in (select customer_id from campaign_recipients where campaign_id = ${c.id} and status = 'pending' limit ${size} for update skip locked)
    returning r.customer_id, cu.name, cu.phone, cu.marketing_opt_in`;
  await Promise.all(batch.map(async (r: any) => {
    const text = personalise(c.message, r.name);
    const extra = c.voucher ? `\n\n🎁 ${c.voucher.label} is waiting on your card.` : '';
    const [wa, wallet, push] = await Promise.all([
      r.marketing_opt_in
        ? sendWhatsApp(r.phone, `${text}${extra}\n\n${biz.name}: ${link}`,
            // Meta templates can't hold line breaks in parameters.
            { name: process.env.META_OFFER_TEMPLATE || 'offer', params: [firstName(r.name), biz.name, (text + extra).replace(/\s*\n+\s*/g, ' '), link] })
        : Promise.resolve(false),
      syncWallet(biz, r.customer_id, text).catch(() => false),
      sendPush(r.customer_id, { title: biz.name, body: text + (c.voucher ? ` 🎁 ${c.voucher.label} is on your card.` : ''), url: `/${biz.slug}/card`, icon: biz.settings.logoUrl || undefined }).catch(() => false),
    ]);
    if (wa || wallet || push) await sql`update campaign_recipients set whatsapp = ${wa}, wallet = ${wallet}, push = ${push} where campaign_id = ${c.id} and customer_id = ${r.customer_id}`;
  }));
  const [{ n }] = await sql`select count(*)::int n from campaign_recipients where campaign_id = ${c.id} and status = 'pending'`;
  if (n === 0) await sql`update campaigns set finished_at = coalesce(finished_at, now()) where id = ${c.id}`;
  return { sent: batch.length, remaining: n as number };
}

export async function listCampaigns(biz: Business) {
  return sql`
    select c.id, c.segment, c.message, c.voucher, c.recipients, c.created_at, c.finished_at, s.name staff,
      (select count(*) from campaign_recipients r where r.campaign_id = c.id and r.whatsapp)::int whatsapp,
      (select count(*) from campaign_recipients r where r.campaign_id = c.id and r.wallet)::int wallet,
      (select count(*) from campaign_recipients r where r.campaign_id = c.id and r.push)::int push,
      (select count(*) from campaign_recipients r where r.campaign_id = c.id and r.status = 'pending')::int pending,
      (select count(*) from campaign_recipients r where r.campaign_id = c.id and exists (
        select 1 from stamps st where st.customer_id = r.customer_id and st.reason = 'purchase'
          and st.created_at > c.created_at and st.created_at < c.created_at + interval '7 days'))::int came_back,
      (select count(*) from vouchers v where v.business_id = c.business_id and v.source = 'campaign'
        and v.period_key = c.id::text and v.redeemed_at is not null)::int vouchers_used
    from campaigns c left join staff s on s.id = c.staff_id
    where c.business_id = ${biz.id} order by c.created_at desc limit 30`;
}

/** The newest offer a member got in the last 7 days, shown on their card. */
export async function latestOffer(customerId: string) {
  const [o] = await sql`select c.message, cu.name from campaign_recipients r join campaigns c on c.id = r.campaign_id
    join customers cu on cu.id = r.customer_id
    where r.customer_id = ${customerId} and c.created_at > now() - interval '7 days' order by c.created_at desc limit 1`;
  return o ? personalise(o.message, o.name) : null;
}
