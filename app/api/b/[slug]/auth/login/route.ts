import { checkPin, setCustomerSession, setMemberSession } from '@/lib/auth';
import { bizRoute, body } from '@/lib/route';
import { findCards } from '@/lib/username';
import { clientIp, json, rateLimit } from '@/lib/util';

export const POST = bizRoute(async (req, biz) => {
  const b = await body(req);
  const login = String(b.login ?? b.phone ?? '').trim().slice(0, 40); // username, or WhatsApp number for older cards
  const password = String(b.password || '');
  if (!login || !password) return json({ error: 'Enter your username and password' }, 400);
  const limits = await Promise.all([rateLimit(`login:${biz.id}:${login.toLowerCase()}`, 8, 900), rateLimit(`login-ip:${clientIp(req)}`, 40, 900)]);
  if (!limits.every(Boolean))
    return json({ error: 'Too many tries. Wait 15 minutes or reset your password.' }, 429);
  const [c] = await findCards(login, biz.settings.defaultCountryCode, biz.id);
  if (!c) return json({ error: 'No card with that username. Tap Join to create one.' }, 401);
  if (!c.password_hash) return json({ error: 'Your card has no password yet. Tap "Forgot password" to set one.' }, 401);
  if (!checkPin(password, c.password_hash)) return json({ error: 'Wrong password' }, 401);
  await setCustomerSession(biz.id, c.id);
  await setMemberSession(c.phone);
  return json({ ok: true });
});
