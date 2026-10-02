import { getCustomerId } from '@/lib/auth';
import { getBusiness } from '@/lib/business';
import { googleWalletEnabled } from '@/lib/wallet/config';
import { googleSaveUrl } from '@/lib/wallet/google';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** "Add to Google Wallet": sends the logged-in member to Google's save page. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await ctx.params).slug);
  if (!biz) return new Response('Not found', { status: 404 });
  const id = await getCustomerId(biz.id);
  if (!id) return Response.redirect(`${siteUrl()}/${biz.slug}`, 302);
  if (!googleWalletEnabled()) return new Response('Google Wallet is not set up yet', { status: 404 });
  const url = await googleSaveUrl(biz, id);
  return url ? Response.redirect(url, 302) : new Response('Not found', { status: 404 });
}
