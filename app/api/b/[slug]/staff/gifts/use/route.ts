import { redeemGift } from '@/lib/gifts';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  return json(await redeemGift(biz, String(b.code || ''), Number(b.amount), staff.id));
});
