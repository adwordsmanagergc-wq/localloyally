import { buildApplePass } from '@/lib/wallet/apple';
import { authorisePass, ok } from '@/lib/wallet/apple-service';

export const dynamic = 'force-dynamic';

/** Apple fetching the latest version of a pass. */
export async function GET(req: Request, ctx: { params: Promise<{ passTypeId: string; serial: string }> }) {
  const p = await ctx.params;
  const biz = await authorisePass(req, p.passTypeId, p.serial);
  if (!biz) return ok(401);
  const pass = await buildApplePass(biz, p.serial);
  if (!pass) return ok(404);
  const since = Date.parse(req.headers.get('if-modified-since') || '');
  const modified = new Date(Math.floor(pass.updatedAt.getTime() / 1000) * 1000);
  if (since && modified.getTime() <= since) return ok(304);
  return new Response(new Uint8Array(pass.buffer), {
    headers: { 'Content-Type': 'application/vnd.apple.pkpass', 'Last-Modified': modified.toUTCString() },
  });
}
