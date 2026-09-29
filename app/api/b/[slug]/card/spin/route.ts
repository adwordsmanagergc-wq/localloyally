import { spin } from '@/lib/loyalty';
import { customerRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const POST = customerRoute(async (_req, biz, id) => json(await spin(biz, id)));
