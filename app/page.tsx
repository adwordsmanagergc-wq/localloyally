import './home.css';
import StampIcon from '@/components/StampIcon';

const STEPS = [
  { t: 'Customers join in seconds', d: 'They scan the QR at your counter and sign up with their name and WhatsApp number. No app to download.' },
  { t: 'Staff scan and stamp', d: 'Each visit, staff scan the customer’s card on any phone and add a stamp with one tap.' },
  { t: 'Rewards bring them back', d: 'Free items, spin-to-win prizes and WhatsApp reminders turn one-time visitors into regulars.' },
];

const FEATURES = [
  { icon: 'star', t: 'Digital stamp cards', d: 'Your logo, colours and reward. Customers add it to their home screen like an app.' },
  { icon: 'bolt', t: 'Spin to win', d: 'Prizes, % off and vouchers with expiry dates. A small thrill that makes every visit count.' },
  { icon: 'heart', t: 'Refer a friend', d: 'Customers share their link and both get a stamp when a friend joins.' },
  { icon: 'drop', t: 'WhatsApp reminders', d: 'Automatic nudges when someone is one stamp away or a voucher is about to expire.' },
  { icon: 'leaf', t: 'Social post stamps', d: 'Reward customers for posting about you. Staff approve posts before stamps are added.' },
  { icon: 'paw', t: 'Built-in anti-cheat', d: 'Rotating QR codes, staff PINs and limits stop fake stamps before they happen.' },
];

const FAQ = [
  { q: 'What happens after the free week?', a: 'We check in to see how it went. If you want to keep going, we agree a plan. If not, we switch it off. No card needed to start and nothing is charged automatically.' },
  { q: 'Do my customers need to download an app?', a: 'No. Everything works in the phone’s browser, and customers can add their card to the home screen.' },
  { q: 'What do I need to get started?', a: 'Just your logo, your reward (for example “free coffee after 9 stamps”) and a phone for your staff. We set it up for you.' },
  { q: 'Which businesses is it for?', a: 'Cafes, tea bars, restaurants, bakeries, barbers and salons, beauty and spa, gyms and studios — anywhere customers come back.' },
];

function trialHref(name: string) {
  const text = `Hi! I'd like to start the 7-day free trial of ${name} for my business.`;
  const wa = (process.env.CONTACT_WHATSAPP || '').replace(/\D/g, '');
  if (wa) return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  const email = process.env.CONTACT_EMAIL;
  if (email) return `mailto:${email}?subject=${encodeURIComponent('7-day free trial')}&body=${encodeURIComponent(text)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function DemoCard() {
  const filled = 6;
  return (
    <div className="lp-demo" aria-hidden="true">
      <div className="lp-demo-card">
        <div className="row between">
          <div className="row">
            <span className="lp-demo-mark"><StampIcon icon="bean" size={20} /></span>
            <div>
              <div className="lp-demo-name">Your Cafe</div>
              <div className="tiny lp-demo-sub">Rewards card</div>
            </div>
          </div>
          <span className="lp-demo-pill">Gold</span>
        </div>
        <div className="lp-demo-stamps">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`lp-demo-slot${i < filled ? ' on' : ''}`}>
              <StampIcon icon={i === 9 ? 'star' : 'bean'} size={18} />
            </span>
          ))}
        </div>
        <div className="row between">
          <div className="small"><b>{filled} of 10</b> stamps</div>
          <div className="small lp-demo-sub">Free drink at 10</div>
        </div>
      </div>
      <div className="lp-demo-toast">
        <span className="lp-demo-dot" />
        <div>
          <div className="small"><b>1 stamp away!</b></div>
          <div className="tiny lp-demo-sub">Sent on WhatsApp</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const name = process.env.PLATFORM_NAME || 'Rewards';
  const cta = trialHref(name);
  return (
    <main className="lp">
      <header className="lp-nav lp-wrap">
        <a href="/" className="lp-logo">
          <span className="lp-logo-mark"><StampIcon icon="star" size={18} /></span>
          {name}
        </a>
        <nav className="lp-nav-links">
          <a href="#how" className="lp-hide-sm">How it works</a>
          <a href="#features" className="lp-hide-sm">Features</a>
          <a href="/platform">Log in</a>
          <a href={cta} className="lp-btn lp-btn-sm" target="_blank" rel="noopener">Free trial</a>
        </nav>
      </header>

      <section className="lp-hero lp-wrap">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">7-day free trial &middot; No card needed</span>
          <h1>Turn first visits into loyal regulars.</h1>
          <p className="lp-lead">
            Digital stamp cards, spin-to-win rewards and WhatsApp reminders for cafes, restaurants, salons and studios.
            Set up in a day, no app for your customers to download.
          </p>
          <div className="lp-ctas">
            <a href={cta} className="lp-btn" target="_blank" rel="noopener">Start your free week</a>
            <a href="#how" className="lp-btn lp-btn-ghost">See how it works</a>
          </div>
          <ul className="lp-checks">
            <li>We set everything up for you</li>
            <li>Cancel anytime</li>
          </ul>
        </div>
        <DemoCard />
      </section>

      <section id="how" className="lp-section lp-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow">How it works</span>
          <h2>Simple for customers. Simple for staff.</h2>
        </div>
        <ol className="lp-steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="lp-step">
              <span className="lp-step-n">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="features" className="lp-section lp-band">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Features</span>
            <h2>Everything you need to keep them coming back</h2>
          </div>
          <div className="lp-features">
            {FEATURES.map((f) => (
              <div key={f.t} className="lp-feature">
                <span className="lp-feature-icon"><StampIcon icon={f.icon} size={22} /></span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trial" className="lp-section lp-wrap">
        <div className="lp-trial">
          <div className="lp-trial-copy">
            <span className="lp-eyebrow lp-eyebrow-light">Free for 7 days</span>
            <h2>Try it at your counter for a week.</h2>
            <p>
              We&rsquo;ll set up your branded card, your rewards and your staff login. Print the QR, put it on the counter and watch
              customers join. If it&rsquo;s not for you, we switch it off. No card, no commitment.
            </p>
          </div>
          <ul className="lp-trial-list">
            <li>Your logo, colours and rewards</li>
            <li>Unlimited customers and stamps</li>
            <li>Staff app with PIN login</li>
            <li>Spin to win, referrals and vouchers</li>
            <li>WhatsApp reminders</li>
            <li>Dashboard and customer export</li>
          </ul>
          <a href={cta} className="lp-btn lp-btn-light" target="_blank" rel="noopener">Start your free week</a>
        </div>
      </section>

      <section className="lp-section lp-wrap lp-faq-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Questions</span>
          <h2>Good to know</h2>
        </div>
        <div className="lp-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lp-section lp-wrap lp-final">
        <h2>Ready to reward your regulars?</h2>
        <p className="lp-lead">Start your 7-day free trial today. We&rsquo;ll have you running by tomorrow.</p>
        <a href={cta} className="lp-btn" target="_blank" rel="noopener">Start your free week</a>
      </section>

      <footer className="lp-footer lp-wrap">
        <span>&copy; {new Date().getFullYear()} {name}</span>
        <a href="/platform">Business owner login</a>
      </footer>
    </main>
  );
}
