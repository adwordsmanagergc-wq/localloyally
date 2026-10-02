import { redeemVoucher } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { walletChanged } from '@/lib/wallet';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  const label = await redeemVoucher(biz, String(b.voucherId), String(b.customerId), staff.id);
  walletChanged(biz, String(b.customerId));
  return json({ ok: true, label });
});
