import { clearCustomerSession } from '@/lib/auth';
import { bizRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = bizRoute(async (_req, biz) => {
  await clearCustomerSession(biz.id);
  return json({ ok: true });
});
