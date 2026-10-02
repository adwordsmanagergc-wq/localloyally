import { sendBatch } from '@/lib/campaigns';
import { getStaff } from '@/lib/auth';
import { getBusiness } from '@/lib/business';
import { RuleError } from '@/lib/loyalty';
import { json } from '@/lib/util';

export const maxDuration = 60;

/** Sends the next batch of an offer. */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) {
  // Same cross-site form guard as bizRoute
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  const { slug, id } = await ctx.params;
  const biz = await getBusiness(slug);
  if (!biz) return json({ error: 'Business not found' }, 404);
  const st = await getStaff(biz.id);
  if (st?.role !== 'manager') return json({ error: 'Managers only' }, 403);
  if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Offer not found' }, 404);
  try { return json(await sendBatch(biz, id)); }
  catch (e) {
    if (e instanceof RuleError) return json({ error: e.message }, 400);
    console.error(e); return json({ error: 'Something went wrong, please try again' }, 500);
  }
}
