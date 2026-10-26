import type { Metadata } from 'next';
import './roastedcustomer.css';

const REVIEW_URL = 'https://g.page/r/CeN3XdxA-OZkEBM/review';
const JOIN_URL = '/roasted?join=1';

export const metadata: Metadata = {
  title: 'Roasted Cafe Canggu | Loyal Locally',
  description: 'Review Roasted Cafe Canggu or get the Roasted Cafe digital card with 1 free stamp.',
  openGraph: {
    title: 'Roasted Cafe Canggu', description: 'Leave a review or get your digital card with 1 free stamp.',
    siteName: 'Loyal Locally', type: 'website', images: [{ url: '/brands/roasted/logo.png' }],
  },
};

/** QR / table-card landing page for Roasted customers: one tap to review, one tap to join. */
export default function RoastedCustomer() {
  return (
    <main className="rc">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap" />
      <div className="rc-glow" aria-hidden="true" />
      <div className="rc-wrap">
        <header className="rc-brand">
          <div className="rc-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brands/roasted/logo.png" width={104} height={104} alt="Roasted Cafe Canggu logo" />
          </div>
          <h1>Roasted Cafe <span>Canggu</span></h1>
          <p>Thanks for visiting! Tap one below 👇</p>
        </header>

        <nav className="rc-links" aria-label="Roasted Cafe Canggu links">
          <a className="rc-link rc-review" href={REVIEW_URL} target="_blank" rel="noopener noreferrer">
            <span className="rc-text">
              <span className="rc-stars" aria-hidden="true">★★★★★</span>
              <strong>Review Roasted Cafe Canggu</strong>
              <small>Tell us how we did on Google</small>
            </span>
            <span className="rc-arrow" aria-hidden="true">→</span>
          </a>
          <a className="rc-link rc-join" href={JOIN_URL}>
            <span className="rc-badge">1 free stamp</span>
            <span className="rc-icon" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brands/roasted/stamp.png" alt="" width={34} height={34} />
            </span>
            <span className="rc-text">
              <strong>Get the Roasted Cafe digital card</strong>
              <small>Sign up free and get 1 free stamp</small>
            </span>
            <span className="rc-arrow" aria-hidden="true">→</span>
          </a>
        </nav>

        <a className="rc-ad" href="/">
          <span className="rc-ad-tag">For business owners</span>
          <strong>Get a digital rewards scheme for your business</strong>
          <span className="rc-ad-sub">Stamp cards on your customers&apos; phones, more Google reviews, more regulars. No app needed.</span>
          <span className="rc-ad-btn">Find out more at Loyal Locally →</span>
        </a>

        <footer className="rc-powered">
          <a href="/" aria-label="Loyal Locally home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/loyal-locally-icon.png" width={26} height={26} alt="" />
            <span>Powered by Loyal <span className="rc-pill">Locally</span></span>
          </a>
          <p>Rewards for being loyal to your local small businesses</p>
        </footer>
      </div>
    </main>
  );
}
