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
      <div className="rc-wrap">
        <header className="rc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brands/roasted/logo.png" width={96} height={96} alt="Roasted Cafe Canggu logo" />
          <h1>Roasted Cafe <span>Canggu</span></h1>
          <p>Thanks for visiting. Pick one below.</p>
        </header>

        <nav className="rc-links" aria-label="Roasted Cafe Canggu links">
          <a className="rc-link" href={REVIEW_URL} target="_blank" rel="noopener noreferrer">
            <span className="rc-icon" aria-hidden="true">★</span>
            <span className="rc-text">
              <strong>Review Roasted Cafe Canggu</strong>
              <small>Tell us how we did on Google</small>
            </span>
            <span className="rc-arrow" aria-hidden="true">→</span>
          </a>
          <a className="rc-link rc-link-main" href={JOIN_URL}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="rc-icon" aria-hidden="true"><img src="/brands/roasted/stamp.png" alt="" width={30} height={30} /></span>
            <span className="rc-text">
              <strong>Get the Roasted Cafe digital card</strong>
              <small>Sign up free and get 1 free stamp</small>
            </span>
            <span className="rc-arrow" aria-hidden="true">→</span>
          </a>
        </nav>

        <footer className="rc-powered">
          <a href="/" aria-label="Loyal Locally home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/loyal-locally-icon.png" width={28} height={28} alt="" />
            <span>Powered by <strong>Loyal Locally</strong></span>
          </a>
          <p>Rewards for being loyal to your local small businesses</p>
        </footer>
      </div>
    </main>
  );
}
