import { sql } from '@/lib/db';
import { canGiveBlackCard, setBlackCard } from '@/lib/blackcard';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

/** Andy gives a member a black card (free coffee for life) or take it back. */
export const POST = managerRoute(async (req, biz, staff) => {
  if (!(await canGiveBlackCard(staff.id))) return json({ error: 'Only Andy can give or take back black cards' }, 403);
  const b = await body(req);
  const id = String(b.customerId || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Member not found' }, 404);
  const [c] = await sql`select id from customers where id = ${id} and business_id = ${biz.id}`;
  if (!c) return json({ error: 'Member not found' }, 404);
  await setBlackCard(biz.id, id, staff.id, b.active === true);
  return json({ ok: true });
});
