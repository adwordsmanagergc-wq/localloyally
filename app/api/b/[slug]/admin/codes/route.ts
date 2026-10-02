import { createPersonalCode } from '@/lib/codes';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { siteUrl } from '@/lib/site';

/** Managers create a one-off code worth some stamps for one customer, to send them on WhatsApp. */
export const POST = managerRoute(async (req, biz, staff) => {
  const b = await body(req);
  const c = await createPersonalCode(biz, String(b.customerId), staff.id, Number(b.stamps), String(b.note || ''), Number(b.days) || 30);
  const link = `${siteUrl()}/${biz.slug}/card`;
  const text = `Hi ${c.name}, here's a code for ${c.stamps} bonus stamp${c.stamps > 1 ? 's' : ''} at ${biz.name}: ${c.code}\nEnter it on your card: ${link}`;
  return json({ code: c.code, stamps: c.stamps, expiresAt: c.expires_at, whatsapp: `https://wa.me/${c.phone}?text=${encodeURIComponent(text)}` });
});
