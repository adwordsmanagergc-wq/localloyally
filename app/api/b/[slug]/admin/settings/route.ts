import { saveSettings, validateSettings } from '@/lib/business';
import { managerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { walletBrandChanged } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) => json({ name: biz.name, settings: biz.settings }));

export const POST = managerRoute(async (req, biz) => {
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 60);
  if (name.length < 2) return json({ error: 'Business name is required' }, 400);
  let s;
  try { s = validateSettings(b.settings || {}); } catch (e: any) { return json({ error: e.message }, 400); }
  await saveSettings(biz.id, name, s);
  walletBrandChanged({ ...biz, name, settings: s });
  return json({ ok: true, settings: s });
});
