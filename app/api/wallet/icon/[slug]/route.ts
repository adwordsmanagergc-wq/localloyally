import { getBusiness } from '@/lib/business';
import sharp from 'sharp';
import { logoPng } from '@/lib/wallet/icon';

/** Public PNG logo for Google Wallet, which loads images by URL. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await ctx.params).slug);
  if (!biz) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(await sharp(await logoPng(biz)).resize(660, 660, { fit: 'inside', withoutEnlargement: true }).png().toBuffer()), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } });
}
