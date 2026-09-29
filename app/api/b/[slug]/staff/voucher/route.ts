import { redeemVoucher } from '@/lib/loyalty';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = staffRoute(async (req, biz, staff) => {
  const b = await body(req);
  return json({ ok: true, label: await redeemVoucher(biz, String(b.voucherId), String(b.customerId), staff.id) });
});
