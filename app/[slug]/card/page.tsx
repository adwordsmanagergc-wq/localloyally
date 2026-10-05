import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { walletEnabled } from '@/lib/wallet/config';
import { pushEnabled, pushPublicKey } from '@/lib/push';
import { getBusiness, halfwayAt } from '@/lib/business';
import { getCustomerId } from '@/lib/auth';
import { customerSummary, grantPassive, REASON_LABEL } from '@/lib/loyalty';
import Brand from '@/components/Brand';
import Stamp from '@/components/Stamp';
import { CardRefresh, CodeForm, GiftFriend, PushToggle, LogoutButton, OptInToggle, ShareReferral, SocialForm } from '@/components/CardParts';
import SpinWheel from '@/components/SpinWheel';
import { latestOffer } from '@/lib/campaigns';
import { memberGifts } from '@/lib/gifts';
import { fmtGiftCode, money } from '@/lib/money';
import { siteUrl } from '@/lib/site';
import PoweredBy from '@/components/PoweredBy';
import WelcomePopup from '@/components/WelcomePopup';
import BlackCard from '@/components/BlackCard';
import BlackCardWelcome from '@/components/BlackCardWelcome';

export const dynamic = 'force-dynamic';

const d = (x: Date) => new Date(x).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default async function CardPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const biz = await getBusiness((await params).slug);
  if (!biz) notFound();
  const id = await getCustomerId(biz.id);
  if (!id) redirect(`/${biz.slug}`);
  await grantPassive(biz, id);
  // Extras (offer banner, gift cards) must never take the whole card down
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch((e) => { console.error('Card extra failed', e); return fallback; });
  const [sum, offer, gifts] = await Promise.all([
    customerSummary(biz, id).then((x) => x!), safe(latestOffer(id), null), safe(memberGifts(id) as Promise<any[]>, [] as any[]),
  ]);
  const s = biz.settings;
  const { balance, maxTier } = sum;
  const earned = s.rewards.filter((r) => balance >= r.stamps);
  const next = s.rewards.find((r) => balance < r.stamps);
  const cols = maxTier <= 6 ? maxTier : maxTier <= 10 ? 5 : 6;
  const tierAt = new Map(s.rewards.map((r) => [r.stamps, r.label]));
  const base = siteUrl();
  const refLink = `${base}/${biz.slug}/r/${sum.customer.ref_code}`;
  const socialPending = sum.lastSocial?.status === 'pending';
  // Show the wallet that matches the phone; both on a computer.
  const ua = (await headers()).get('user-agent') || '';
  const wallets = walletEnabled();
  const showApple = wallets.apple && !/Android/i.test(ua);
  const showGoogle = wallets.google && !/iPhone|iPad|iPod/i.test(ua);
  const royal = !!sum.customer.black_card_at;
  const username = sum.customer.username ?? sum.customer.name;
  const welcome = !royal && (await searchParams).welcome === '1' ? welcomeMessage(biz.name, sum) : null;

  return (
    <>
    {royal && <div className="royal-bg" aria-hidden="true" />}
    {royal && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap" />}
    <main className={`wrap stack-lg${royal ? ' royal' : ''}`}>
      <Brand biz={biz} right={<div className="row" style={{ gap: 14 }}><a className="linkbtn small" href="/me">My cards</a><LogoutButton slug={biz.slug} /></div>} />

      {offer && <div className="banner offer">📣 {offer}</div>}

      {royal ? (
        <section className="stack">
          <p className="center king on-bg">Welcome, your majesty <strong className="gold">@{username}</strong></p>
          <BlackCard bizName={biz.name} logoUrl={s.logoUrl || undefined} username={username}
            since={new Date(sum.customer.black_card_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()} />
          <div className="card stack center">
            <div className="stamps" style={{ ['--cols' as any]: cols }}>
              {Array.from({ length: maxTier }, (_, i) => (
                <div key={i} className={`slot ${s.stampImageUrl ? 'img' : ''} on`}><Stamp icon={s.stampIcon} image={s.stampImageUrl} size={22} /></div>
              ))}
            </div>
            <p className="king gold" style={{ fontSize: '1.15rem', fontWeight: 700 }}>You don&apos;t need stamps, you king 👑</p>
            <p className="small muted">Free coffee for life. Show staff your card and it&apos;s on the house.</p>
          </div>
        </section>
      ) : (
      <section className="card stack">
        <div className="row between">
          <div>
            <p className="muted small">Hi {sum.customer.name}</p>
            <div className="row" style={{ alignItems: 'baseline', gap: 8 }}>
              <span className="bigcount">{balance}</span>
              <span className="muted">stamp{balance === 1 ? '' : 's'}</span>
            </div>
          </div>
          {sum.doubleHourNow && <span className="pill accent">Double stamps now</span>}
        </div>
        <div className="stamps" style={{ ['--cols' as any]: cols }}>
          {Array.from({ length: maxTier }, (_, i) => {
            const n = i + 1;
            const tier = tierAt.get(n);
            return (
              <div key={n} className={`slot ${s.stampImageUrl ? 'img' : ''} ${n <= balance ? 'on' : ''} ${tier ? 'tier' : ''}`} title={tier}>
                <Stamp icon={s.stampIcon} image={s.stampImageUrl} size={22} />
                {tier && s.rewards.length > 1 && <span className="tierlabel">{n}</span>}
              </div>
            );
          })}
        </div>
        {balance > maxTier && <p className="small muted">+{balance - maxTier} extra stamps saved</p>}
        {earned.length > 0 ? (
          <div className="banner good">
            You've earned: {earned.map((r) => r.label).join(' or ')}. Tell staff your username at the counter to claim it.
          </div>
        ) : next ? (
          <p className="small">
            <strong>{next.stamps - balance} more</strong> to <strong>{next.label.toLowerCase()}</strong>
          </p>
        ) : null}
        {s.rewards.length > 1 && (
          <div className="row wrap-row small muted">
            {s.rewards.map((r) => <span key={r.stamps} className="pill">{r.stamps} = {r.label}</span>)}
          </div>
        )}
      </section>
      )}

      {/* A waiting spin goes straight under the stamps, so it's the first thing they see */}
      {sum.spins > 0 && (
        <section className="card stack center">
          <h2>You&apos;re halfway there!</h2>
          <p className="small muted">Have a spin to see if you can win a prize for your next visit!</p>
          <SpinWheel slug={biz.slug} prizes={s.spin.prizes.map((p) => p.label)} voucherDays={s.spin.voucherDays} />
        </section>
      )}

      <section className="card stack center">
        <h2>At the counter</h2>
        <p className="small muted">{royal ? 'Tell staff your username. Your coffee is on the house.' : 'Tell staff your username and they\'ll add your stamps.'}</p>
        <div className="username-big">@{sum.customer.username ?? sum.customer.name}</div>
        <CardRefresh slug={biz.slug} />
        <div className="stack" style={{ textAlign: 'left', marginTop: 6 }}>
          <p className="small muted">{s.counterCodes ? 'Or type the code staff give you, or one we sent you:' : 'Got a code we sent you? Type it here:'}</p>
          <CodeForm slug={biz.slug} />
        </div>
        {(showApple || showGoogle) && (
          <div className="stack" style={{ marginTop: 6 }}>
            <p className="small muted">Keep your card in your phone&apos;s wallet. It updates by itself and is one tap away at the counter.</p>
            <div className="row wrap-row" style={{ justifyContent: 'center' }}>
              {showApple && <a className="btn wallet-btn" href={`/api/b/${biz.slug}/card/wallet/apple`}>Add to Apple Wallet</a>}
              {showGoogle && <a className="btn wallet-btn" href={`/api/b/${biz.slug}/card/wallet/google`}>Add to Google Wallet</a>}
            </div>
          </div>
        )}
      </section>

      {gifts.length > 0 && (
        <section className="stack">
          <h2 className="on-bg">Your gift cards</h2>
          {gifts.map((g: any) => (
            <a key={g.code} className="voucher gift-card-link" href={`/${biz.slug}/g/${g.code}`}>
              <div>
                <div className="v-label">🎁 {g.kind === 'item' ? g.label : money(s.currency, g.balance)}</div>
                <div className="tiny muted">{g.from_name ? `From ${g.from_name} · ` : ''}tell staff your username to use it · {fmtGiftCode(g.code)}</div>
              </div>
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </section>
      )}

      {sum.vouchers.length > 0 && (
        <section className="stack">
          <h2 className="on-bg">Your vouchers</h2>
          {sum.vouchers.map((v: any) => (
            <div key={v.id} className="voucher">
              <div>
                <div className="v-label">{v.label}</div>
                <div className="tiny muted">Use by {d(v.expires_at)} · tell staff your username to claim</div>
              </div>
              <span className="pill">{v.source === 'birthday' ? 'Birthday' : v.period_key === 'staff-invite' ? 'Welcome gift' : v.period_key?.startsWith('reward-') ? 'Full card' : v.source === 'campaign' ? 'Gift' : 'Won'}</span>
            </div>
          ))}
        </section>
      )}

      {!royal && <section className="stack">
        <h2 className="on-bg">Earn more stamps</h2>
        {s.social.enabled && (
          <div className="card flat stack">
            <div className="row between">
              <h3>Post about us</h3><span className="pill accent">+{s.social.stamps}</span>
            </div>
            <p className="small muted">
              Share a post or story on Instagram, TikTok, Facebook or Threads{s.social.handle ? <> tagging <strong>{s.social.handle}</strong></> : ''}, then paste the link. Staff check it, then the stamps land.
              {s.social.cooldownDays > 0 && ` Once every ${s.social.cooldownDays} days.`}
            </p>
            {socialPending ? <div className="banner small">Your post is waiting for approval.</div> : <SocialForm slug={biz.slug} />}
          </div>
        )}
        {s.referral.enabled && (
          <div className="card flat stack">
            <div className="row between"><h3>Bring a friend</h3><span className="pill accent">+{s.referral.stamps}</span></div>
            <p className="small muted">When a friend joins with your link and makes their first visit, you get {s.referral.stamps === 1 ? 'a bonus stamp' : `${s.referral.stamps} bonus stamps`}.</p>
            <ShareReferral link={refLink} text={`Join ${biz.name} rewards with my link${s.welcomeStamps > 0 ? ` and get ${s.welcomeStamps === 1 ? 'a free stamp' : `${s.welcomeStamps} free stamps`} when you sign up` : ''}`} />
          </div>
        )}
        <div className="card flat stack small">
          {s.streak.enabled && <p>🔥 <strong>Streak bonus:</strong> {s.streak.visits} visits in {s.streak.days} days earns an extra stamp.</p>}
          {s.doubleHours.enabled && (
            <p>⏱ <strong>Double stamps</strong> {s.doubleHours.start} to {s.doubleHours.end}
              {s.doubleHours.days.length < 7 && ` on ${s.doubleHours.days.sort().map((x) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x]).join(', ')}`}.</p>
          )}
          {s.spin.enabled && <p>🎡 <strong>Spin to win</strong> when you reach {halfwayAt(s)} stamps.</p>}
          {s.birthday.enabled && <p>🎂 <strong>{s.birthday.label}</strong> around your birthday.</p>}
        </div>
      </section>}

      {s.reviews.enabled && s.reviews.googleUrl && sum.visits >= 1 && (
        <section className="card flat stack center">
          <h3>Enjoying {biz.name}?</h3>
          <p className="small muted">A quick Google review helps other people find us. It means a lot to a small business.</p>
          <a className="btn block" href={s.reviews.googleUrl} target="_blank" rel="noopener noreferrer">★ Leave a Google review</a>
        </section>
      )}

      {sum.history.length > 0 && (
        <section className="card flat stack">
          <h3>Recent activity</h3>
          <div className="list small">
            {sum.history.map((h: any, i: number) => (
              <div key={i} className="row between">
                <span>{h.reason === 'redeem' ? `Claimed ${h.note ?? 'reward'}` : REASON_LABEL[h.reason] ?? h.reason}
                  <span className="muted"> · {d(h.created_at)}</span></span>
                <strong>{h.delta > 0 ? `+${h.delta}` : h.delta}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
      {s.gifts.enabled && s.whatsappNumber && (
        <section className="card flat stack">
          <h3>🎁 Send a gift to a friend</h3>
          <p className="small muted">Treat a friend to a {biz.name} gift card. Pick an amount and we&apos;ll open WhatsApp to the team.</p>
          <GiftFriend bizName={biz.name} waNumber={s.whatsappNumber} currency={s.currency} me={sum.customer.username ?? sum.customer.name} />
        </section>
      )}

      <section className="card flat stack small">
        {pushEnabled() && <PushToggle slug={biz.slug} publicKey={pushPublicKey()} business={biz.name} />}
        <OptInToggle slug={biz.slug} initial={!!sum.customer.marketing_opt_in} business={biz.name} />
      </section>

      <a className="card flat row between more-places" href="/me">
        <span><strong>Collect stamps at more places</strong><br /><span className="small muted">See all your cards and join other businesses with one tap.</span></span>
        <span aria-hidden="true">→</span>
      </a>
      <PoweredBy />
      {welcome && <WelcomePopup slug={biz.slug} {...welcome} />}
      {royal && !sum.customer.black_card_welcomed_at && <BlackCardWelcome slug={biz.slug} bizName={biz.name} logoUrl={s.logoUrl || undefined} username={username} />}
    </main>
    </>
  );
}

/** What a brand new member got, read from their card so it always matches: welcome stamps, plus any staff invite gift. */
function welcomeMessage(bizName: string, sum: any): { title: string; body: string; note?: string } {
  const total = (pick: (h: any) => boolean) => (sum.history as any[]).filter(pick).reduce((n, h) => n + h.delta, 0);
  const welcome = total((h) => h.reason === 'welcome');
  const headStart = total((h) => h.reason === 'bonus' && h.note === 'Invited by staff');
  const voucher = (sum.vouchers as any[]).find((v) => v.period_key === 'staff-invite');
  const stamps = (n: number, w: string) => (n === 1 ? `a ${w} stamp` : `${n} ${w} stamps`);
  const title = `Welcome to ${bizName}!`;
  if (voucher) {
    const days = Math.max(1, Math.ceil((new Date(voucher.expires_at).getTime() - Date.now()) / 86400000));
    return {
      title,
      body: `You received ${welcome > 0 ? `${stamps(welcome, 'welcome')} and ` : ''}a ${voucher.label.toLowerCase()} voucher to use in store within ${days} day${days === 1 ? '' : 's'}.`,
      note: 'Tell staff your username at the counter to use it.',
    };
  }
  if (headStart > 0)
    return { title, body: `You received ${welcome > 0 ? `${stamps(welcome, 'welcome')} and ` : ''}${stamps(headStart, 'head-start')}.` };
  return { title, body: welcome > 0 ? `Here's your ${welcome === 1 ? 'welcome stamp' : `${welcome} welcome stamps`}.` : 'Your card is ready.' };
}
