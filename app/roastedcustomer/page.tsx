import type { Metadata } from 'next';
import './roastedcustomer.css';

const REVIEW_URL = 'https://g.page/r/CeN3XdxA-OZkEBM/review';
const JOIN_URL = '/roastedcustomer/join';

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
            <img src="/brands/roasted/logo.png" width={82} height={82} alt="Roasted Cafe Canggu logo" />
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

        <a className="rc-preview" href={JOIN_URL} aria-label="See the Roasted Cafe digital card and sign up">
          <span className="rc-preview-label">Your card looks like this 👇</span>
          <figure className="rc-phone">
            <span className="rc-notch" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/how-it-works/card-wheel-home.webp" width={720} height={1558} loading="lazy"
              alt="Example Roasted Cafe digital stamp card: 4 stamps, 1 more to a free pastry" />
          </figure>
        </a>

        <footer className="rc-powered">
          <a className="rc-ad" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/loyal-locally-icon.png" width={22} height={22} alt="" />
            <span>Own a business? <strong>Get digital rewards →</strong></span>
          </a>
          <p>Powered by <a href="/">Loyal Locally</a> · Rewards for being loyal to your local small businesses</p>
        </footer>
      </div>
    </main>
  );
}
