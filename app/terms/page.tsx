import '../landing.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms and conditions | Loyal Locally' };

const UPDATED = '2 October 2026';

/** Terms customers agree to when they sign up for a rewards card. Plain language; review with a local adviser. */
export default function Terms() {
  return (
    <div className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&family=Nunito:wght@900&display=swap" />
      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo" aria-label="Loyal Locally home"><img className="lp-logo-img" src="/brand/loyal-locally-icon.png" width={38} height={38} alt="" /><span className="lp-logo-text">Loyal <span className="lp-logo-pill">Locally</span></span></a>
        </div>
      </header>
      <main className="lp-login lp-terms">
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 2.6rem)' }}>Terms and conditions</h1>
        <p className="lp-terms-meta">For rewards cards. Last updated {UPDATED}.</p>

        <h2>1. Who runs your card</h2>
        <p>Each rewards card belongs to the business you signed up with (for example, a cafe). That business sets its own rewards, prizes and rules and is responsible for honouring them. Loyal Locally provides the app the business uses.</p>

        <h2>2. Your account</h2>
        <ul>
          <li>You need a username, a password and a WhatsApp number you can receive messages on.</li>
          <li>Keep your password private. You are responsible for what happens on your card.</li>
          <li>One card per person per business. The details you give must be your own and correct.</li>
        </ul>

        <h2>3. Stamps and rewards</h2>
        <ul>
          <li>Staff add stamps when you buy something and show your card. Stamps have no cash value and can&apos;t be sold, swapped or transferred.</li>
          <li>When you have enough stamps, you can claim the reward shown on your card. Claiming it uses those stamps.</li>
          <li>Vouchers and prizes (including from spin to win, offers and birthday treats) are only valid until the date shown and can&apos;t be exchanged for cash.</li>
          <li>The business can change or end its rewards, prizes or rules. It should tell you on your card first, and keep rewards you have already earned where it reasonably can.</li>
        </ul>

        <h2>4. Fair use</h2>
        <p>The business can remove stamps or rewards that were gained by mistake or unfairly (for example, sharing someone else&apos;s card, fake social posts or misusing a screenshot), and can close a card that is misused.</p>

        <h2>5. Spin to win</h2>
        <p>Spins are free and are given as a thank-you. You never pay to play. Prizes are discounts or free items at that business only, and the chances are set by the business.</p>

        <h2>6. Gift certificates</h2>
        <p>Gift certificates can be used until the date shown, in one go or over several visits. They can&apos;t be exchanged for cash unless the law requires it. Treat the link like cash: anyone with it can use the balance.</p>

        <h2>7. Messages</h2>
        <p>We send WhatsApp messages needed to run your card, such as password reset codes. Reminders and offers are only sent if you ticked the box to receive them, and you can ask the business to stop them at any time.</p>

        <h2>8. Your data</h2>
        <p>We store your username, WhatsApp number, birthday (if you give it) and your stamps, rewards and visits. The business can see this to run its rewards and may contact you about them if you agreed. We don&apos;t sell your data. You can ask the business to correct or delete your details at any time; deleting them closes your card.</p>

        <h2>9. Changes and contact</h2>
        <p>We may update these terms. If the changes are important, we&apos;ll tell you on your card. For questions about your stamps or rewards, ask the business. These terms are governed by the laws of the Republic of Indonesia.</p>
      </main>
    </div>
  );
}
