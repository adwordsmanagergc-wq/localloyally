import { markBlackCardWelcomed } from '@/lib/blackcard';
import { customerRoute } from '@/lib/route';
import { json } from '@/lib/util';

/** The member watched their black card intro. */
export const POST = customerRoute(async (_req, _biz, customerId) => {
  await markBlackCardWelcomed(customerId);
  return json({ ok: true });
});
