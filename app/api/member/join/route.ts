import { sql } from '@/lib/db';
import { getMemberPhone, setCustomerSession } from '@/lib/auth';
import { getBusiness } from '@/lib/business';
import { createCard } from '@/lib/members';
import { json, rateLimit } from '@/lib/util';

/** One-tap join: a logged-in member gets a card at another business with the same username, password and number. */
export async function POST(req: Request) {
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  const phone = await getMemberPhone();
  if (!phone) return json({ error: 'Please log in again' }, 401);
  const b = await req.json().catch(() => ({}));
  const biz = await getBusiness(String(b.slug || ''));
  if (!biz) return json({ error: 'Business not found' }, 404);

  const [mine] = await sql`select id from customers where business_id = ${biz.id} and phone = ${phone}`;
  if (mine) { await setCustomerSession(biz.id, mine.id); return json({ slug: biz.slug }); }
  if (!(await rateLimit(`mjoin:${phone}`, 20, 3600))) return json({ error: 'Too many new cards at once. Try again later.' }, 429);

  // Copy their details from the card they already have
  const [src] = await sql`select name, username, password_hash, birthday_month, birthday_day from customers
    where phone = ${phone} and password_hash is not null order by created_at desc limit 1`;
  if (!src) return json({ error: 'Please log in again' }, 401);
  const card = await createCard(biz, {
    name: src.name, username: src.username, phone, passwordHash: src.password_hash,
    birthdayMonth: src.birthday_month, birthdayDay: src.birthday_day, optIn: b.optIn === true,
  });
  if (!card) return json({ error: 'Could not create your card. Try joining on the business page.' }, 409);
  await setCustomerSession(biz.id, card.id);
  return json({ slug: biz.slug });
}
