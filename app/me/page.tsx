import '../landing.css';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import StampIcon from '@/components/StampIcon';
import { getMemberPhone } from '@/lib/auth';
import { sql } from '@/lib/db';
import { memberCards } from '@/lib/members';
import { FindPlaces, MemberLogout } from '@/components/member/FindPlaces';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My cards | Loyalty Rewards', robots: { index: false } };

/** A member's home: all their cards, and a search to collect stamps at more places. */
export default async function MyCards() {
  const phone = await getMemberPhone();
  if (!phone) redirect('/login');
  const cards = await memberCards(phone);
  if (!cards.length) redirect('/login');
  const [me] = await sql`select coalesce(username, name) who from customers where phone = ${phone} order by created_at limit 1`;

  return (
    <div className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&display=swap" />
      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo"><span className="lp-logo-mark"><StampIcon icon="star" size={18} /></span>Loyalty Rewards</a>
          <div className="lp-nav-cta"><MemberLogout /></div>
        </div>
      </header>
      <main className="lp-login lp-me">
        <h1 style={{ fontSize: 'clamp(2rem, 7vw, 2.8rem)' }}>Hi {me?.who}.</h1>

        <h2>Your cards</h2>
        <div className="lp-results">
          {cards.map((c: any) => (
            <a key={c.slug} className="lp-result me-card" href={`/${c.slug}/card`}>
              <span className="me-biz">
                {c.logo
                  ? <img src={c.logo} alt="" width={40} height={40} /> // eslint-disable-line @next/next/no-img-element
                  : <span className="me-dot" style={{ background: c.accent || '#ff6b35' }} />}
                <span>{c.name}<small>{c.balance} stamp{c.balance === 1 ? '' : 's'}</small></span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </div>

        <h2>Collect at more places</h2>
        <p className="lp-me-sub">Find another cafe, salon or shop using Loyalty Rewards and join with one tap. Same username and password.</p>
        <FindPlaces mine={cards.map((c: any) => c.slug)} />
      </main>
    </div>
  );
}
