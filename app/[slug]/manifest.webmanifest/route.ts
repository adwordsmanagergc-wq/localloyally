import { getBusiness } from '@/lib/business';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await params).slug);
  if (!biz) return new Response('Not found', { status: 404 });
  const icons = biz.settings.logoUrl ? [{ src: biz.settings.logoUrl, sizes: '512x512', purpose: 'any' }] : [];
  return Response.json({
    name: `${biz.name} Rewards`, short_name: biz.name, start_url: `/${biz.slug}/card`, scope: `/${biz.slug}/`,
    display: 'standalone', background_color: biz.settings.colors.bg, theme_color: biz.settings.colors.bg, icons,
  }, { headers: { 'Content-Type': 'application/manifest+json' } });
}
