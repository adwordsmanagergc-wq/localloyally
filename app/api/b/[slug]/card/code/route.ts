import { sql } from '@/lib/db';
import { redeemCode } from '@/lib/codes';
import { customerRoute, body } from '@/lib/route';
import { clientIp, json, rateLimit } from '@/lib/util';
import { walletChanged } from '@/lib/wallet';
import { sendWhatsApp } from '@/lib/whatsapp';

/** A customer types a code from staff (or one sent to them) on their card. */
export const POST = customerRoute(async (req, biz, id) => {
  // Few tries, so nobody can guess a 6-digit code
  if (!(await rateLimit(`code:${id}`, 8, 900)) || !(await rateLimit(`code-ip:${clientIp(req)}`, 30, 3600)))
    return json({ error: 'Too many tries. Wait 15 minutes, or ask staff to scan your QR code.' }, 429);
  const r = await redeemCode(biz, id, String((await body(req)).code || ''));
  walletChanged(biz, id, r.referrerId);
  if (r.referrerId) {
    const [ref] = await sql`select phone, name, marketing_opt_in from customers where id = ${r.referrerId}`;
    if (ref?.marketing_opt_in)
      sendWhatsApp(ref.phone, `Hi ${ref.name}, your friend just made their first visit to ${biz.name}. We've added ${biz.settings.referral.stamps} bonus stamp to your card. Thanks for spreading the word!`);
  }
  return json({ kind: r.kind, added: r.added });
});
