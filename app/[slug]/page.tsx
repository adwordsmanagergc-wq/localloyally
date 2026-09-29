import { redirect } from 'next/navigation';
import { getBusiness, minTier } from '@/lib/business';
import { getCustomerId } from '@/lib/auth';
import Brand from '@/components/Brand';
import AuthFlow from '@/components/AuthFlow';
import StampIcon from '@/components/StampIcon';

export const dynamic = 'force-dynamic';

export default async function Join({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ ref?: string }>;
}) {
  const biz = (await getBusiness((await params).slug))!;
  if (await getCustomerId(biz.id)) redirect(`/${biz.slug}/card`);
  const { ref } = await searchParams;
  const s = biz.settings;
  const first = s.rewards[0];
  const perks = [
    `${first.stamps} ${s.itemWordPlural} = ${first.label.toLowerCase()}`,
    s.welcomeStamps > 0 && `${s.welcomeStamps} free stamp${s.welcomeStamps > 1 ? 's' : ''} when you join`,
    s.social.enabled && `${s.social.stamps} stamps when you post about us`,
    s.spin.enabled && 'Spin to win discounts and treats',
    s.birthday.enabled && 'A birthday treat on us',
  ].filter(Boolean) as string[];

  return (
    <main className="wrap stack-lg">
      <Brand biz={biz} />
      <section className="stack">
        <h1>{s.tagline}</h1>
        <div className="stamps" style={{ ['--cols' as any]: Math.min(minTier(s), 6) }} aria-hidden="true">
          {Array.from({ length: Math.min(minTier(s), 6) }, (_, i) => (
            <div key={i} className={`slot ${i < 3 ? 'on' : ''}`}><StampIcon icon={s.stampIcon} size={22} /></div>
          ))}
        </div>
        <ul className="stack small" style={{ paddingLeft: 18, margin: 0 }}>
          {perks.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>
      <AuthFlow slug={biz.slug} refCode={ref} />
      <p className="tiny muted center">
        We use your WhatsApp number to log you in and, only if you agree, to send you reward reminders.
      </p>
    </main>
  );
}
