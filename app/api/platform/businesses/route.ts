import { sql } from '@/lib/db';
import { hashPin, isPlatformAdmin } from '@/lib/auth';
import { DEFAULT_SETTINGS, PRESETS, mergeSettings, validSlug } from '@/lib/business';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isPlatformAdmin())) return json({ error: 'Log in' }, 401);
  const rows = await sql`
    select b.id, b.slug, b.name, b.active, b.created_at,
      (select count(*) from customers c where c.business_id = b.id)::int members,
      (select coalesce(sum(delta), 0) from stamps s where s.business_id = b.id and reason = 'purchase' and created_at > now() - interval '30 days')::int stamps30
    from businesses b order by b.created_at`;
  const trials = await sql`select id, business_name, business_type, contact_name, whatsapp, email, city, message, created_at
    from trial_requests order by created_at desc limit 50`;
  return json({ items: rows, trials, presets: Object.entries(PRESETS).map(([k, v]) => ({ key: k, label: v.label })) });
}

export async function POST(req: Request) {
  if (!(await isPlatformAdmin())) return json({ error: 'Log in' }, 401);
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 60);
  const slug = String(b.slug || '').trim().toLowerCase();
  const password = String(b.managerPassword || '');
  if (name.length < 2) return json({ error: 'Add the business name' }, 400);
  if (!validSlug(slug)) return json({ error: 'Link name: 3 to 40 lowercase letters, numbers or dashes' }, 400);
  if (password.length < 6 || password.length > 64) return json({ error: 'Manager password needs at least 6 characters' }, 400);
  const preset = PRESETS[b.preset as string] ?? PRESETS.cafe;
  const settings = mergeSettings({ ...DEFAULT_SETTINGS, ...preset.settings });
  if (b.timezone) settings.timezone = String(b.timezone);
  if (b.countryCode && /^\d{1,4}$/.test(String(b.countryCode))) settings.defaultCountryCode = String(b.countryCode);
  try {
    await sql.begin(async (tx) => {
      const [biz] = await tx`insert into businesses (slug, name, settings) values (${slug}, ${name}, ${sql.json(settings as any)}) returning id`;
      await tx`insert into staff (business_id, name, pin_hash, role) values (${biz.id}, ${String(b.managerName || 'Manager').slice(0, 40)}, ${hashPin(password)}, 'manager')`;
    });
  } catch (e: any) {
    if (e.code === '23505') return json({ error: 'That link name is taken' }, 400);
    throw e;
  }
  return json({ ok: true, slug });
}

export async function PATCH(req: Request) {
  if (!(await isPlatformAdmin())) return json({ error: 'Log in' }, 401);
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  const b = await req.json().catch(() => ({}));
  // Reset manager password: sets the password on the "Manager (reset)" login, creating it the first time
  if (typeof b.resetPassword === 'string') {
    const password = b.resetPassword;
    if (password.length < 6 || password.length > 64) return json({ error: 'Password needs at least 6 characters' }, 400);
    const id = String(b.id);
    const [existing] = await sql`select id from staff where business_id = ${id} and name = 'Manager (reset)' order by active desc, created_at desc limit 1`;
    if (existing) await sql`update staff set pin_hash = ${hashPin(password)}, role = 'manager', active = true where id = ${existing.id}`;
    else await sql`insert into staff (business_id, name, pin_hash, role) values (${id}, 'Manager (reset)', ${hashPin(password)}, 'manager')`;
    return json({ ok: true });
  }
  await sql`update businesses set active = ${b.active === true} where id = ${String(b.id)}`;
  return json({ ok: true });
}
