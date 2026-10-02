import { redeemReward } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { walletChanged } from '@/lib/wallet';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  const r = await redeemReward(biz, String(b.customerId), staff.id, Number(b.tier));
  walletChanged(biz, String(b.customerId));
  return json(r);
});
