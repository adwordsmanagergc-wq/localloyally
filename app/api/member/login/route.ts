import { checkPin, setCustomerSession, setMemberSession } from '@/lib/auth';
import { findCards } from '@/lib/username';
import { clientIp, json, rateLimit } from '@/lib/util';

/**
 * Log in from the main site with username + password, without picking the business first.
 * Logs in to every card that matches; the browser opens it (or lets them choose if there are several).
 */
export async function POST(req: Request) {
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  const b = await req.json().catch(() => ({}));
  const login = String(b.login || '').trim().slice(0, 40);
  const password = String(b.password || '');
  if (!login || !password) return json({ error: 'Enter your username and password' }, 400);
  if (!(await rateLimit(`mlogin:${login.toLowerCase()}`, 8, 900)) || !(await rateLimit(`mlogin-ip:${clientIp(req)}`, 40, 900)))
    return json({ error: 'Too many tries. Wait 15 minutes or reset your password.' }, 429);

  const cards = await findCards(login);
  if (!cards.length) return json({ error: 'No card with that username. New here? Tap Sign up.' }, 401);
  const ok = cards.filter((c: any) => c.password_hash && checkPin(password, c.password_hash));
  if (!ok.length) {
    if (cards.every((c: any) => !c.password_hash)) return json({ error: 'Your card has no password yet. Tap "Forgot password" to set one.' }, 401);
    return json({ error: 'Wrong password' }, 401);
  }
  for (const c of ok) await setCustomerSession(c.biz_id, c.id);
  await setMemberSession(ok[0].phone);
  return json({ cards: ok.map((c: any) => ({ name: c.name, slug: c.slug })) });
}
