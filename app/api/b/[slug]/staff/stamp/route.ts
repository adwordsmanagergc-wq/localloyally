import { sql } from '@/lib/db';
import { addPurchase } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { sendWhatsApp } from '@/lib/whatsapp';
import { walletChanged } from '@/lib/wallet';
import { after } from 'next/server';
import { notifyStamps, sendPush } from '@/lib/push';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  const r = await addPurchase(biz, String(b.customerId), staff.id, Number(b.qty) || 1, b.force === true);
  if ('events' in r) {
    walletChanged(biz, String(b.customerId), r.referrerId);
    const added = (r.events ?? []).reduce((a, e) => a + e.delta, 0);
    after(async () => {
      await notifyStamps(biz, String(b.customerId), added, r.balance!).catch(() => {});
      if (r.referrerId) await sendPush(r.referrerId, { title: biz.name, body: `Your friend just made their first visit. +${biz.settings.referral.stamps} bonus stamp for you!`, url: `/${biz.slug}/card` }).catch(() => {});
    });
  }
  if ('referrerId' in r && r.referrerId) {
    const [ref] = await sql`select phone, name, marketing_opt_in from customers where id = ${r.referrerId}`;
    if (ref?.marketing_opt_in)
      sendWhatsApp(ref.phone, `Hi ${ref.name}, your friend just made their first visit to ${biz.name}. We've added ${biz.settings.referral.stamps} bonus stamp to your card. Thanks for spreading the word!`);
  }
  return json(r);
});
