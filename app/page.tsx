import './landing.css';
import type { Metadata } from 'next';
import StampIcon from '@/components/StampIcon';
import TrialForm from '@/components/landing/TrialForm';

export const metadata: Metadata = {
  title: 'Loyalty Rewards | Digital stamp cards for your business',
  description:
    'Digital loyalty stamp cards for cafes, restaurants, barbers, salons and gyms. Customers join with WhatsApp, staff scan a QR code. Spin to win, social stamps and your own branding. Free for 7 days.',
};

const Icon = ({ d, bg }: { d: string; bg: string }) => (
  <span className="ic" style={{ background: bg }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c1511" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  </span>
);

const FEATURES = [
  { t: 'Digital stamp cards', p: 'Set any number of stamps and up to four reward tiers, like 5 for a pastry and 8 for a free coffee.', bg: '#d4f56b', d: 'M4 6h16v12H4zM8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01' },
  { t: 'Spin to win', p: 'Customers spin a prize wheel when they claim a reward or visit weekly. You set the prizes and the odds.', bg: '#ffb8cb', d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 3v9l6 6M12 12L5 16' },
  { t: 'Stamps for social posts', p: 'Give bonus stamps when customers post about you on Instagram or TikTok. Staff approve each post in one tap.', bg: '#9fd8ff', d: 'M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM17 7h.01' },
  { t: 'WhatsApp login', p: 'No passwords and no app to download. Customers join with their name and a code sent to WhatsApp.', bg: '#c8b8ff', d: 'M4 20l1.5-4A8 8 0 1 1 8 18.5L4 20zM9 10c.5 2 2 3.5 4 4' },
  { t: 'Refer a friend', p: 'Every member gets a share link. When a friend makes their first visit, both get a bonus stamp.', bg: '#ffd166', d: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M19 8v6M16 11h6' },
  { t: 'Reminders that bring them back', p: 'Automatic WhatsApp nudges when someone is one stamp away, or a voucher is about to expire.', bg: '#d4f56b', d: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0' },
  { t: 'Birthday treats, streaks and happy hours', p: 'Birthday rewards, streak bonuses and double stamps in your quiet hours, all switched on or off in settings.', bg: '#ffb8cb', d: 'M12 3v3M8 21h8M5 11h14v10H5zM5 15h14M12 6c-1.5 0-2 1-2 2s1 2 2 2 2-1 2-2-.5-2-2-2' },
  { t: 'Dashboard and customer list', p: 'See visits, rewards and your busiest days. Export your members to use in your own marketing.', bg: '#9fd8ff', d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
];

const MINIS = [
  { name: 'Roasted', bg: '#e9e6e1', surface: '#f6f4f0', ink: '#1f1c19', accent: '#6b4a2f', accentInk: '#fff', icon: 'bean', tag: '8 coffees = free coffee', font: 'Georgia, serif' },
  { name: 'Fade Barbers', bg: '#111418', surface: '#1b2027', ink: '#eef1f4', accent: '#c9a45c', accentInk: '#111418', icon: 'scissors', tag: '6 cuts = free cut', font: 'var(--head)' },
  { name: 'Pulse Studio', bg: '#0f1115', surface: '#181b22', ink: '#f2f4f8', accent: '#c6f432', accentInk: '#0f1115', icon: 'bolt', tag: '10 classes = free class', font: 'var(--head)' },
];

const COMPARE: [string, string, string, string][] = [
  ['Customers can\'t lose their card', 'no', 'yes', 'yes'],
  ['No app download for customers', 'yes', 'no', 'yes'],
  ['Stops fake stamps and screenshots', 'no', 'meh', 'yes'],
  ['Bonus stamps for social media posts', 'no', 'meh', 'yes'],
  ['Spin to win prizes', 'no', 'meh', 'yes'],
  ['WhatsApp reminders', 'no', 'no', 'yes'],
  ['Your logo, colours and fonts', 'meh', 'meh', 'yes'],
  ['You own your customer list', 'no', 'meh', 'yes'],
];
const mark = (v: string) => (v === 'yes' ? <span className="yes">✓</span> : v === 'no' ? <span className="no">✕</span> : <span className="meh">Sometimes</span>);

const FAQ = [
  ['Do my customers need to download an app?', 'No. They open your rewards page in their phone browser, join with their WhatsApp number and can save it to their home screen like an app.'],
  ['How do staff add stamps?', 'Staff open your staff page on any phone or tablet, log in with their own PIN and scan the customer\'s QR code. It takes about two seconds.'],
  ['Can people cheat the system?', 'The customer QR code changes every few minutes, so screenshots stop working. Every stamp is logged with the staff member who gave it, spin results are decided on our server, and social posts need staff approval.'],
  ['Can I make it look like my brand?', 'Yes. Upload your logo, pick your colours, font, background texture and stamp icon, and change the wording to suit you, like "coffee", "cut" or "class".'],
  ['What happens after the free week?', 'If you love it, you move onto a simple monthly plan. If not, there is nothing to cancel and no card is needed to start.'],
  ['Does it work outside Indonesia?', 'Yes. Customers can join with any international WhatsApp number, and you set your own country and timezone.'],
];

export default function Home() {
  return (
    <div className="lp">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&display=swap" />

      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo" aria-label="Loyalty Rewards home">
            <span className="lp-logo-mark"><StampIcon icon="star" size={18} /></span>
            <span className="lp-logo-text">Loyalty Rewards</span>
          </a>
          <nav className="lp-links" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#customise">Customise</a>
            <a href="#how">How it works</a>
            <a href="#compare">Compare</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-nav-cta">
            <a className="lp-btn ghost small" href="/login?as=member">Member login</a>
            <a className="lp-btn small" href="/login?as=business">Business login</a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container lp-hero-grid">
            <div>
              <span className="lp-sticker">🎉 Free for your business for 7 days</span>
              <h1>
                Loyalty cards your customers <span className="squiggle">won&apos;t lose</span>. <span className="hl">Rewards they&apos;ll chase.</span>
              </h1>
              <p className="lp-lead">
                Digital stamp cards with spin to win, social media bonus stamps and WhatsApp reminders. Branded to your business, set up in minutes, and no app for customers to download.
              </p>
              <div className="lp-hero-cta">
                <a className="lp-btn orange" href="#trial">Start your free week →</a>
                <a className="lp-btn ghost" href="#how">See how it works</a>
              </div>
              <div className="lp-ticks">
                <span>No card needed</span><span>Set up in 5 minutes</span><span>Works on any phone</span>
              </div>
            </div>

            <div className="lp-phone-wrap" aria-hidden="true">
              <div className="lp-float f1">+2 stamps for your post 📸</div>
              <div className="lp-float f2">You won 15% off! 🎡</div>
              <div className="lp-float f3">Double stamps 2 to 4pm ⏱</div>
              <div className="lp-phone">
                <div className="lp-screen">
                  <div className="s-brand"><i /> Roasted</div>
                  <div className="s-card">
                    <div style={{ color: '#7a7067' }}>Hi Sarah</div>
                    <div className="s-count">5 <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>stamps</span></div>
                    <div className="s-grid">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={`s-dot ${i < 5 ? 'on' : ''}`} style={{ color: i < 5 ? '#fff' : '#c7bdb2' }}>
                          <StampIcon icon="bean" size={14} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontWeight: 700 }}>3 more to a free coffee</div>
                  </div>
                  <div className="s-qr">
                    <svg width="110" height="110" viewBox="0 0 21 21" shapeRendering="crispEdges">
                      {Array.from({ length: 21 * 21 }, (_, k) => {
                        const x = k % 21, y = Math.floor(k / 21);
                        const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7 && (x === a || x === a + 6 || y === b || y === b + 6 || (x >= a + 2 && x <= a + 4 && y >= b + 2 && y <= b + 4));
                        const inFinderZone = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
                        const on = inFinderZone ? finder(0, 0) || finder(14, 0) || finder(0, 14) : (x * 7 + y * 13 + x * y) % 5 < 2;
                        return on ? <rect key={k} x={x} y={y} width="1" height="1" fill="#1c1511" /> : null;
                      })}
                    </svg>
                  </div>
                  <div className="s-btn">Spin to win 🎡</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-marquee" aria-label="Built for cafes, restaurants, barbers, salons, gyms, bakeries and more">
          <div className="lp-marquee-track" aria-hidden="true">
            {[0, 1].map((r) => (
              <span key={r}>
                {['Cafes', 'Matcha bars', 'Restaurants', 'Barbers', 'Nail & beauty', 'Gyms & studios', 'Bakeries', 'Juice bars', 'Car washes', 'Pet groomers'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="lp-section" id="features">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Everything in one place</div>
            <h2 className="lp-title">More than a stamp card. A reason to come back.</h2>
            <p className="lp-lead">Paper cards get lost and most loyalty apps make customers download something. Loyalty Rewards lives in their phone browser and does the marketing for you.</p>
            <div className="lp-grid">
              {FEATURES.map((f) => (
                <article key={f.t} className="lp-feature">
                  <Icon d={f.d} bg={f.bg} />
                  <h3>{f.t}</h3>
                  <p>{f.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-dark" id="customise">
          <div className="lp-container lp-custom-grid">
            <div>
              <div className="lp-eyebrow">✺ Made to match you</div>
              <h2 className="lp-title">Your brand, your rules, your card.</h2>
              <p className="lp-lead">Every business gets its own rewards page that looks like it was designed just for them. Change anything, anytime, from your settings.</p>
              <ul className="lp-checks">
                <li>Your logo, brand colours and font style</li>
                <li>Background textures: pebble, paper, grid or clean</li>
                <li>Stamp icons: coffee bean, cup, leaf, scissors, star, heart, paw and more</li>
                <li>Up to 4 reward tiers, with your own wording like &ldquo;coffee&rdquo;, &ldquo;cut&rdquo; or &ldquo;class&rdquo;</li>
                <li>Your own spin prizes, odds and voucher expiry</li>
                <li>Ready-made templates for cafes, restaurants, barbers, beauty, gyms and bakeries</li>
              </ul>
            </div>
            <div className="lp-cards" aria-label="Example cards for three different businesses">
              {MINIS.map((m) => (
                <div key={m.name} className="lp-mini" style={{ background: m.bg, color: m.ink }}>
                  <div className="m-name" style={{ fontFamily: m.font }}>{m.name}</div>
                  <div style={{ background: m.surface, borderRadius: 14, padding: 12 }}>
                    <div className="m-grid">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={`m-dot ${i < 5 ? 'on' : ''}`} style={i < 5 ? { background: m.accent, color: m.accentInk } : undefined}>
                          <StampIcon icon={m.icon} size={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="m-tag" style={{ background: m.accent, color: m.accentInk }}>{m.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section" id="how">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Easy for everyone</div>
            <h2 className="lp-title">Live in an afternoon. Simple from day one.</h2>
            <div className="lp-steps">
              <div className="lp-step">
                <div className="n">01</div>
                <h3>Set up your card</h3>
                <p>Pick a template for your type of business, add your logo and colours, and choose your rewards. About 5 minutes.</p>
              </div>
              <div className="lp-step">
                <div className="n">02</div>
                <h3>Put up your QR code</h3>
                <p>Print your join QR for the counter, add a link to your website and Instagram bio. Customers join in 20 seconds.</p>
              </div>
              <div className="lp-step">
                <div className="n">03</div>
                <h3>Scan and reward</h3>
                <p>Staff scan the customer&apos;s card on any phone. Stamps, rewards, spins and reminders take care of themselves.</p>
              </div>
            </div>
            <div className="lp-who">
              <div style={{ background: '#d4f56b' }}>
                <h3>For owners</h3>
                <ul><li>Change rewards and design anytime</li><li>See your regulars and busiest days</li><li>Export your customer list</li></ul>
              </div>
              <div style={{ background: '#c8b8ff' }}>
                <h3>For staff</h3>
                <ul><li>Own PIN, no training needed</li><li>Scan, tap, done</li><li>Warns about accidental double stamps</li></ul>
              </div>
              <div style={{ background: '#ffb8cb' }}>
                <h3>For customers</h3>
                <ul><li>No app, no password</li><li>Card always in their pocket</li><li>Fun prizes worth coming back for</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section" id="compare" style={{ paddingTop: 0 }}>
          <div className="lp-container">
            <div className="lp-eyebrow">✺ The honest comparison</div>
            <h2 className="lp-title">Why businesses switch.</h2>
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr><th scope="col"></th><th scope="col">Paper cards</th><th scope="col">Typical loyalty apps</th><th scope="col" className="us">Loyalty Rewards</th></tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, a, b, c]) => (
                    <tr key={label}><td>{label}</td><td>{mark(a)}</td><td>{mark(b)}</td><td className="us">{mark(c)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="lp-section" id="trial" style={{ background: '#fffaf1', borderBlock: '2px solid #1c1511' }}>
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Try it free</div>
            <h2 className="lp-title">One week free. No card, no catch.</h2>
            <div className="lp-trial-grid">
              <div className="lp-price">
                <div style={{ fontWeight: 800 }}>Free trial</div>
                <div className="big">7 days</div>
                <p style={{ marginTop: 8, fontWeight: 600 }}>Every feature switched on, set up with you.</p>
                <ul>
                  <li>Your own branded rewards page</li>
                  <li>Unlimited customers and staff logins</li>
                  <li>Spin to win, social stamps and referrals</li>
                  <li>Help setting up your rewards and design</li>
                  <li>Simple monthly plan after, only if you love it</li>
                </ul>
              </div>
              <TrialForm />
            </div>
          </div>
        </section>

        <section className="lp-section" id="faq">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Questions</div>
            <h2 className="lp-title">Good to know.</h2>
            <div className="lp-faq">
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section" style={{ paddingTop: 0 }}>
          <div className="lp-container">
            <div className="lp-final">
              <h2>Turn first visits into regulars.</h2>
              <p className="lp-lead" style={{ margin: '14px auto 0', color: '#1c1511' }}>Start your free week today. We&apos;ll help you set it up.</p>
              <div className="lp-hero-cta" style={{ justifyContent: 'center' }}>
                <a className="lp-btn" href="#trial">Start your free week →</a>
                <a className="lp-btn ghost" href="/login?as=business">Business login</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-logo" style={{ color: '#1c1511' }}>
            <span className="lp-logo-mark"><StampIcon icon="star" size={18} /></span> Loyalty Rewards
          </div>
          <nav aria-label="Footer">
            <a href="/login?as=member">Member login</a>
            <a href="/login?as=business">Business login</a>
            <a href="#trial">Free trial</a>
            <a href="/platform">Admin</a>
          </nav>
          <span>© {new Date().getFullYear()} Loyalty Rewards by Metatap Digital</span>
        </div>
      </footer>
    </div>
  );
}
