import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBusiness } from '@/lib/business';
import { fontHref, themeClass, themeVars } from '@/lib/theme';
import { siteUrl } from '@/lib/site';

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const biz = await getBusiness((await params).slug);
  if (!biz) return {};
  return {
    title: `${biz.name} Rewards | Loyal Locally`,
    description: biz.settings.tagline,
    // Link previews (WhatsApp, Instagram) show these
    openGraph: {
      title: `${biz.name} Rewards`, description: biz.settings.tagline, siteName: 'Loyal Locally', type: 'website',
      url: `${siteUrl()}/${biz.slug}`, images: biz.settings.logoUrl ? [{ url: biz.settings.logoUrl }] : undefined,
    },
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
    <div className={themeClass(biz.settings)} style={themeVars(biz.settings)}>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontHref(biz.settings)} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap" />
      {children}
    </div>
  );
}
