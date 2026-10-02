import { currentCodes } from '@/lib/codes';
import { staffRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
/** Today's counter codes for the staff screen. They change every 2 minutes. */
export const GET = staffRoute(async (_req, biz) =>
  biz.settings.counterCodes ? json(currentCodes(biz.id)) : json({ error: 'Counter codes are switched off' }, 404));
