import { sql } from '@/lib/db';
import { customerSummary } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json, maskPhone, normalizePhone } from '@/lib/util';
import { customerByWalletCode, WALLET_PREFIX } from '@/lib/wallet/data';
import { cleanUsername } from '@/lib/username';
import { memberGifts } from '@/lib/gifts';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  let id: string | null = null;
  if (String(b.token || '').startsWith(WALLET_PREFIX)) {
    id = await customerByWalletCode(biz.id, String(b.token));
    if (!id) return json({ error: 'Wallet card not recognised. Ask them to show the card in the app instead.' }, 400);
  } else if (b.token) {
    return json({ error: 'That QR code is not a Loyal Locally card. Search by username instead.' }, 400);
  } else if (b.phone) {
    // The search box takes a WhatsApp number or a username
    const q = String(b.phone).trim().slice(0, 40);
    const username = cleanUsername(q);
    const phone = username ? null : normalizePhone(q, biz.settings.defaultCountryCode);
    // Exact username or number first
    const [exact] = username || phone
      ? await sql`select id from customers where business_id = ${biz.id} and ${username ? sql`lower(username) = ${username}` : sql`phone = ${phone}`}`
      : [];
    if (exact) id = exact.id;
    else {
      // Otherwise part of a username, name or number: let staff pick from a list
      if (q.length < 2) return json({ error: 'Type at least 2 letters or numbers' }, 400);
      const like = `%${q.toLowerCase().replace(/[%_\\]/g, '\\$&')}%`;
      const digits = q.replace(/\D/g, '');
      const rows = await sql`select id, name, username, phone from customers where business_id = ${biz.id}
        and (lower(username) like ${like} or lower(name) like ${like} ${digits.length >= 4 ? sql`or phone like ${'%' + digits + '%'}` : sql``})
        order by username nulls last, name limit 8`;
      if (!rows.length) return json({ error: 'No member found. Check the spelling, or search by WhatsApp number.' }, 404);
      if (rows.length > 1)
        return json({ matches: rows.map((r: any) => ({ id: r.id, name: r.name, username: r.username, phone: staff.role === 'manager' ? r.phone : maskPhone(r.phone) })) });
      id = rows[0].id;
    }
  } else if (b.customerId) {
    id = String(b.customerId);
  }
  const sum = id ? await customerSummary(biz, id) : null;
  if (!sum) return json({ error: 'Member not found' }, 404);
  if (staff.role !== 'manager') sum.customer.phone = maskPhone(sum.customer.phone);
  const [pending] = await sql`select id, url, platform from social_submissions where customer_id = ${id} and status = 'pending' limit 1`;
  return json({ ...sum, pendingSocial: pending ?? null, gifts: await memberGifts(id!) });
});
