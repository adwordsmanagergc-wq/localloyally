import { sql } from './db';

/** Turns what people type into international digits. A leading 0 uses the business's country code (62 = Indonesia). */
export function normalizePhone(input: string, defaultCountry = '62'): string | null {
  let s = String(input || '').replace(/[^\d+]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  else if (s.startsWith('00')) s = s.slice(2);
  else if (s.startsWith('0')) s = defaultCountry + s.slice(1);
  s = s.replace(/\+/g, '');
  if (!/^[1-9]\d{7,14}$/.test(s)) return null;
  return s;
}

export function maskPhone(p: string) {
  return `+${p.slice(0, p.length - 7)} ••• ${p.slice(-4)}`;
}

/** Fixed-window rate limiter backed by Postgres. Returns true when allowed. */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const [r] = await sql`
    insert into rate_limits (key, count, window_start) values (${key}, 1, now())
    on conflict (key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}::float8) then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}::float8) then now() else rate_limits.window_start end
    returning count`;
  return r.count <= limit;
}

export function clientIp(req: Request) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export function randomRefCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
