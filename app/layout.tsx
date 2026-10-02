import './globals.css';
import type { Metadata, Viewport } from 'next';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: process.env.PLATFORM_NAME || 'Loyal Locally',
  description: 'Digital stamp cards and rewards',
  metadataBase: new URL(siteUrl()), // makes preview images and links absolute on loyallocally.com
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
