import { redeemReward } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  return json(await redeemReward(biz, String(b.customerId), staff.id, Number(b.tier)));
});
