import { notFound } from 'next/navigation';
import { getBusiness, inviteStamps } from '@/lib/business';
import { canGiveBlackCard } from '@/lib/blackcard';
import { getStaff } from '@/lib/auth';
import Brand from '@/components/Brand';
import PinLogin from '@/components/staff/PinLogin';
import StaffConsole from '@/components/staff/StaffConsole';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

export default async function StaffPage({ params }: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await params).slug);
  if (!biz) notFound();
  const staff = await getStaff(biz.id);
  if (!staff)
    return (
      <main className="wrap stack-lg">
        <Brand biz={biz} />
        <PinLogin slug={biz.slug} />
      </main>
    );
  const s = biz.settings;
  return (
    <main className="wrap wide">
      <StaffConsole
        biz={{ slug: biz.slug, name: biz.name, rewards: s.rewards, maxPerVisit: s.maxPerVisit, itemWord: s.itemWord,
          itemWordPlural: s.itemWordPlural, social: s.social.enabled, stampIcon: s.stampIcon, stampImageUrl: s.stampImageUrl,
          currency: s.currency, giftsEnabled: s.gifts.enabled, counterCodes: s.counterCodes, countryCode: s.defaultCountryCode,
          welcomeStamps: s.welcomeStamps, blackCard: await canGiveBlackCard(staff.id),
          invite: s.staffInvite.enabled ? { label: s.staffInvite.label, days: s.staffInvite.days, stamps: inviteStamps(s) } : null }}
        staff={staff}
      />
    </main>
  );
}
