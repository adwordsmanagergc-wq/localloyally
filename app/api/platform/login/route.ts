import { checkPlatformPassword, setPlatformSession } from '@/lib/auth';
import { clientIp, json, rateLimit } from '@/lib/util';

export async function POST(req: Request) {
  if (!(await rateLimit(`platform:${clientIp(req)}`, 6, 900))) return json({ error: 'Too many tries' }, 429);
  const { password } = await req.json().catch(() => ({}));
  if (!checkPlatformPassword(String(password || ''))) return json({ error: 'Wrong password' }, 401);
  await setPlatformSession();
  return json({ ok: true });
}
