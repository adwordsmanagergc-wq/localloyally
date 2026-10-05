import { redirect, notFound } from 'next/navigation';
import { getBusiness, minTier } from '@/lib/business';
import { getCustomerId } from '@/lib/auth';
import Brand from '@/components/Brand';
import AuthFlow from '@/components/AuthFlow';
import Stamp from '@/components/Stamp';
import PoweredBy from '@/components/PoweredBy';
import { cleanInviteCode, findInviter } from '@/lib/invites';

export const dynamic = 'force-dynamic';

export default async function Join({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ ref?: string; forgot?: string; join?: string; gift?: string; invite?: string }>;
}) {
  const biz = await getBusiness((await params).slug);
  if (!biz) notFound();
  if (await getCustomerId(biz.id)) redirect(`/${biz.slug}/card`);
  const { ref, forgot, join, gift, invite } = await searchParams;
  const inviter = invite && biz.settings.staffInvite.enabled ? await findInviter(biz.id, invite) : null;
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
        <span className="sticker">Free to join · No app needed</span>
        <h1 className="on-bg join-title">{s.tagline}</h1>
        <div className="stamps" style={{ ['--cols' as any]: Math.min(minTier(s), 6) }} aria-hidden="true">
          {Array.from({ length: Math.min(minTier(s), 6) }, (_, i) => (
            <div key={i} className={`slot ${s.stampImageUrl ? 'img' : ''} ${i < 3 ? 'on' : ''}`}><Stamp icon={s.stampIcon} image={s.stampImageUrl} size={22} /></div>
          ))}
        </div>
        <div className="perk-chips">
          {perks.map((p) => <span key={p} className="perk">{p}</span>)}
        </div>
      </section>
      <AuthFlow slug={biz.slug} refCode={ref} businessName={biz.name} start={join === '1' || gift || inviter ? 'join' : forgot === '1' ? 'forgot' : undefined} giftCode={gift}
        invite={inviter ? { code: cleanInviteCode(invite), from: inviter.name, label: s.staffInvite.label, welcome: s.welcomeStamps } : undefined} />
      <p className="tiny muted center on-bg">
        We only message you on WhatsApp about your rewards if you agree.
      </p>
      <PoweredBy />
    </main>
  );
}
