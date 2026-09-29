import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBusiness } from '@/lib/business';
import { fontHref, themeVars } from '@/lib/theme';

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const biz = await getBusiness((await params).slug);
  if (!biz) return {};
  return {
    title: `${biz.name} Rewards`,
    description: biz.settings.tagline,
    manifest: `/${biz.slug}/manifest.webmanifest`,
    themeColor: biz.settings.colors.bg,
    appleWebApp: { capable: true, title: biz.name, statusBarStyle: 'default' },
    icons: biz.settings.logoUrl ? { icon: biz.settings.logoUrl, apple: biz.settings.logoUrl } : undefined,
  } as Metadata;
}

export default async function BizLayout({ children, params }: P & { children: React.ReactNode }) {
  const biz = await getBusiness((await params).slug);
  if (!biz) notFound();
  return (
    <div className={`theme tx-${biz.settings.texture}`} style={themeVars(biz.settings)}>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontHref(biz.settings)} />
      {children}
    </div>
  );
}
