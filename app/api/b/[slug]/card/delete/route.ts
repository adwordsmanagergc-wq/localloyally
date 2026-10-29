import { clearCustomerSession } from '@/lib/auth';
import { deleteCard } from '@/lib/members';
import { customerRoute } from '@/lib/route';
import { json } from '@/lib/util';

/** A member deletes their own card and details at this business. Can't be undone. */
export const POST = customerRoute(async (_req, biz, id) => {
  await deleteCard(biz.id, id);
  await clearCustomerSession(biz.id);
  return json({ ok: true });
});
