import { sql } from '@/lib/db';
import { readCardToken } from '@/lib/auth';
import { customerSummary } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json, maskPhone, normalizePhone } from '@/lib/util';
import { customerByWalletCode, WALLET_PREFIX } from '@/lib/wallet/data';
import { cleanUsername } from '@/lib/username';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  let id: string | null = null;
  if (String(b.token || '').startsWith(WALLET_PREFIX)) {
    id = await customerByWalletCode(biz.id, String(b.token));
    if (!id) return json({ error: 'Wallet card not recognised. Ask them to show the card in the app instead.' }, 400);
  } else if (b.token) {
    id = await readCardToken(biz.id, String(b.token));
    if (!id) return json({ error: 'QR code expired or from another business. Ask them to refresh their card.' }, 400);
  } else if (b.phone) {
    // The search box takes a WhatsApp number or a username
    const username = cleanUsername(b.phone);
    const phone = username ? null : normalizePhone(b.phone, biz.settings.defaultCountryCode);
    if (!username && !phone) return json({ error: 'Check the number or username' }, 400);
    const [c] = await sql`select id from customers where business_id = ${biz.id} and ${username ? sql`lower(username) = ${username}` : sql`phone = ${phone}`}`;
    if (!c) return json({ error: username ? 'No member with that username' : 'No member with that number' }, 404);
    id = c.id;
  } else if (b.customerId) {
    id = String(b.customerId);
  }
  const sum = id ? await customerSummary(biz, id) : null;
  if (!sum) return json({ error: 'Member not found' }, 404);
  if (staff.role !== 'manager') sum.customer.phone = maskPhone(sum.customer.phone);
  const [pending] = await sql`select id, url, platform from social_submissions where customer_id = ${id} and status = 'pending' limit 1`;
  return json({ ...sum, pendingSocial: pending ?? null });
});
