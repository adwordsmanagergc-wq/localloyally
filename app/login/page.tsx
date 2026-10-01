import '../landing.css';
import type { Metadata } from 'next';
import StampIcon from '@/components/StampIcon';
import FindBusiness from '@/components/landing/FindBusiness';

export const metadata: Metadata = { title: 'Log in | Loyalty Rewards' };

export default async function Login({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const { as } = await searchParams;
  return (
    <div className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&display=swap" />
      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo"><span className="lp-logo-mark"><StampIcon icon="star" size={18} /></span>Loyalty Rewards</a>
          <div className="lp-nav-cta"><a className="lp-btn small" href="/#trial">Free trial</a></div>
        </div>
      </header>
      <main className="lp-login">
        <h1 style={{ fontSize: 'clamp(2.2rem, 7vw, 3rem)' }}>Welcome back.</h1>
        <FindBusiness initial={as === 'business' ? 'business' : 'member'} />
      </main>
    </div>
  );
}
