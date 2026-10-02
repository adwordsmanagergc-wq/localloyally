import { createCampaign, listCampaigns } from '@/lib/campaigns';
import { isSegment, segmentCounts } from '@/lib/segments';
import { managerRoute, body } from '@/lib/route';
import { json, rateLimit } from '@/lib/util';
import { walletEnabled } from '@/lib/wallet/config';

export const dynamic = 'force-dynamic';
export const GET = managerRoute(async (_req, biz) => {
  const [items, segments] = await Promise.all([listCampaigns(biz), segmentCounts(biz.id, biz.settings.rewards.map((r) => r.stamps))]);
  return json({ items, segments, wallet: walletEnabled() });
});

export const POST = managerRoute(async (req, biz, staff) => {
  const b = await body(req);
  if (!isSegment(b.segment)) return json({ error: 'Pick a group' }, 400);
  if (!(await rateLimit(`campaign:${biz.id}`, 3, 86400))) return json({ error: 'You can send 3 offers a day. Try again tomorrow.' }, 429);
  return json(await createCampaign(biz, staff.id, b.segment, b.message, b.voucher));
});
