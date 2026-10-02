import { redirect } from 'next/navigation';

/** Referral link. A gift link also carries ?gift=CODE, which is passed on to sign-up. */
export default async function Referral({ params, searchParams }: {
  params: Promise<{ slug: string; code: string }>; searchParams: Promise<{ gift?: string }>;
}) {
  const { slug, code } = await params;
  const { gift } = await searchParams;
  const ref = encodeURIComponent(code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
  const g = gift ? `&gift=${encodeURIComponent(gift.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}` : '';
  redirect(`/${slug}?ref=${ref}${g}`);
}
