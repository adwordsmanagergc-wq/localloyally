import { getCustomerId } from '@/lib/auth';
import { getBusiness } from '@/lib/business';
import { buildApplePass } from '@/lib/wallet/apple';
import { appleWalletEnabled } from '@/lib/wallet/config';

export const dynamic = 'force-dynamic';

/** "Add to Apple Wallet": downloads the signed pass for the logged-in member. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await ctx.params).slug);
  if (!biz) return new Response('Not found', { status: 404 });
  const id = await getCustomerId(biz.id);
  if (!id) return Response.redirect(`${process.env.APP_URL || ''}/${biz.slug}`, 302);
  if (!appleWalletEnabled()) return new Response('Apple Wallet is not set up yet', { status: 404 });
  const pass = await buildApplePass(biz, id);
  if (!pass) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(pass.buffer), {
    headers: { 'Content-Type': 'application/vnd.apple.pkpass', 'Content-Disposition': `attachment; filename="${biz.slug}.pkpass"` },
  });
}
