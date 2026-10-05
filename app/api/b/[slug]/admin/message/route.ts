import { sql } from '@/lib/db';
import { sendPush } from '@/lib/push';
import { managerRoute, body } from '@/lib/route';
import { json, rateLimit } from '@/lib/util';

/** Managers send one member a phone notification from their card screen. */
export const POST = managerRoute(async (req, biz) => {
  const b = await body(req);
  const message = String(b.message || '').trim().slice(0, 300);
  if (message.length < 2) return json({ error: 'Write a message first' }, 400);
  const id = String(b.customerId || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Member not found' }, 404);
  const [c] = await sql`select id from customers where id = ${id} and business_id = ${biz.id}`;
  if (!c) return json({ error: 'Member not found' }, 404);
  if (!(await rateLimit(`message:${biz.id}`, 30, 86400))) return json({ error: 'You can send 30 messages a day. Try again tomorrow.' }, 429);
  const sent = await sendPush(c.id, { title: biz.name, body: message, url: `/${biz.slug}/card`, icon: biz.settings.logoUrl || undefined });
  if (!sent) return json({ error: "This member hasn't turned on notifications, so the message couldn't be sent." }, 400);
  return json({ ok: true });
});
