import { spin } from '@/lib/loyalty';
import { customerRoute } from '@/lib/route';
import { json } from '@/lib/util';

import { walletChanged } from '@/lib/wallet';

export const POST = customerRoute(async (_req, biz, id) => {
  const r = await spin(biz, id);
  walletChanged(biz, id);
  return json(r);
});
