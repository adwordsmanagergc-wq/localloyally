import { findGift } from '@/lib/gifts';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = staffRoute(async (req, biz) => {
  const g = await findGift(biz, String((await body(req)).code || ''));
  return g ? json({ gift: g }) : json({ error: 'No gift certificate with that code' }, 404);
});
