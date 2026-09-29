import { submitSocial } from '@/lib/loyalty';
import { customerRoute, body } from '@/lib/route';
import { json, rateLimit } from '@/lib/util';

export const POST = customerRoute(async (req, biz, id) => {
  if (!(await rateLimit(`social:${id}`, 10, 3600))) return json({ error: 'Too many tries, try later' }, 429);
  const { url } = await body(req);
  return json({ ok: true, platform: await submitSocial(biz, id, url) });
});
