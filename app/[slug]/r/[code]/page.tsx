import { redirect } from 'next/navigation';

export default async function Referral({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code } = await params;
  redirect(`/${slug}?ref=${encodeURIComponent(code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}`);
}
