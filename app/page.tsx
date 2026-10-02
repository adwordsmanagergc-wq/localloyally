import './landing.css';
import type { Metadata } from 'next';
import TrialForm from '@/components/landing/TrialForm';

export const metadata: Metadata = {
  title: 'Loyal Locally | Digital stamp cards for your business',
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
  { t: 'More Google reviews', p: 'Automatically asks your regulars for a Google review on WhatsApp and on their card, so you climb Google Maps and get picked by AI search.', bg: '#ffd166', d: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z' },
  { t: 'Dashboard and customer list', p: 'See visits, rewards and your busiest days. Export your members to use in your own marketing.', bg: '#9fd8ff', d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
];

/** Unique stamp art for the example businesses */
const FadeStamp = () => (
  <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
    <circle cx="20" cy="20" r="18.5" fill="#15181d" stroke="#c9a45c" strokeWidth="2" />
    <circle cx="20" cy="20" r="14.5" fill="none" stroke="#c9a45c" strokeWidth=".8" strokeDasharray="1.6 1.6" />
    <text x="20" y="22.5" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="11" fill="#c9a45c">FB</text>
    <path d="M12 27c3 2 5 2 8 0 3 2 5 2 8 0" fill="none" stroke="#c9a45c" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const PulseStamp = () => (
  <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
    <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c6f432" /><stop offset="1" stopColor="#3cf2c4" /></linearGradient></defs>
    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#pg)" />
    <path d="M7 21h7l3-8 5 15 3-7h8" fill="none" stroke="#120e2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MINIS = [
  {
    name: 'Roasted', ink: '#fff', surface: 'rgba(251,246,239,.94)', accent: '#9a5a32', accentInk: '#fff',
    bg: 'linear-gradient(rgba(18,12,8,.3), rgba(18,12,8,.45)), url(/brands/roasted/pebbles.jpg) center/cover',
    font: 'Georgia, serif', tag: '5 = pastry · 8 = coffee', stamp: 'img' as const,
    logo: '/brands/roasted/logo.png',
  },
  {
    name: 'Fade Barbers', ink: '#f3efe6', surface: '#1b1f26', accent: '#c9a45c', accentInk: '#111418',
    bg: 'repeating-linear-gradient(135deg, #b3262d 0 10px, #f3efe6 10px 20px, #1f3a8a 20px 30px, #f3efe6 30px 40px) top/100% 14px no-repeat, radial-gradient(circle at 80% 110%, #2a2f38, #0e1014 70%)',
    font: 'Georgia, serif', tag: '6 cuts = free cut', stamp: 'fade' as const,
  },
  {
    name: 'Pulse Studio', ink: '#f2f4f8', surface: 'rgba(18,14,43,.65)', accent: '#c6f432', accentInk: '#120e2b',
    bg: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px) 0 0/18px 18px, linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px) 0 0/18px 18px, linear-gradient(160deg, #3a1c8f, #120e2b 55%, #0b3b5c)',
    font: 'var(--head)', tag: '10 classes = free class', stamp: 'pulse' as const,
  },
];

const COMPARE: [string, string, string, string][] = [
  ['Customers can\'t lose their card', 'no', 'yes', 'yes'],
  ['No app download for customers', 'yes', 'no', 'yes'],
  ['Stops fake stamps and screenshots', 'no', 'meh', 'yes'],
  ['Bonus stamps for social media posts', 'no', 'meh', 'yes'],
  ['Spin to win prizes', 'no', 'meh', 'yes'],
  ['WhatsApp reminders', 'no', 'no', 'yes'],
  ['Your logo, colours and fonts', 'meh', 'meh', 'yes'],
  ['Asks happy customers for Google reviews', 'no', 'meh', 'yes'],
  ['You own your customer list', 'no', 'meh', 'yes'],
];
const mark = (v: string) => (v === 'yes' ? <span className="yes">✓</span> : v === 'no' ? <span className="no">✕</span> : <span className="meh">Sometimes</span>);

const FAQ = [
  ['Do my customers need to download an app?', 'No. They open your rewards page in their phone browser, join with their WhatsApp number and can save it to their home screen like an app.'],
  ['How do staff add stamps?', 'Staff open your staff page on any phone or tablet, log in with their own PIN and scan the customer\'s QR code. It takes about two seconds.'],
  ['Can people cheat the system?', 'The customer QR code changes every few minutes, so screenshots stop working. Every stamp is logged with the staff member who gave it, spin results are decided on our server, and social posts need staff approval.'],
  ['Can I make it look like my brand?', 'Yes. Upload your logo, pick your colours, font, background texture and stamp icon, and change the wording to suit you, like "coffee", "cut" or "class".'],
  ['How does it help with Google Maps and AI search?', 'Google ranks local businesses partly on how many reviews you have, how good they are and how recent they are. AI assistants like ChatGPT and Google AI Overviews also read reviews when they recommend places. Loyal Locally asks your regulars, the people most likely to leave 5 stars, for a review at the right moment, so a steady stream keeps coming in.'],
  ['Do customers get stamps for reviews?', 'No, and that is on purpose. Google\'s rules ban rewarding customers for reviews, and businesses that do it can have reviews removed. We simply ask happy regulars, which keeps your profile safe.'],
  ['What happens after the free week?', 'If you love it, you move onto a simple monthly plan. If not, there is nothing to cancel and no card is needed to start.'],
  ['Does it work outside Indonesia?', 'Yes. Customers can join with any international WhatsApp number, and you set your own country and timezone.'],
];

export default function Home() {
  return (
    <div className="lp">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&family=Nunito:wght@900&display=swap" />

      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo" aria-label="Loyal Locally home">
            <img className="lp-logo-img" src="/brand/loyal-locally-icon.png" width={38} height={38} alt="" />
            <span className="lp-logo-text">Loyal <span className="lp-logo-pill">Locally</span></span>
          </a>
          <nav className="lp-links" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#customise">Customise</a>
            <a href="#reviews">Reviews</a>
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
                Digital stamp cards with spin to win, social media bonus stamps, WhatsApp reminders and automatic Google review requests that help you rank higher on Google Maps. Branded to your business, set up in minutes, no app to download.
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
                <div className="lp-screen lp-screen-roasted">
                  <div className="s-brand"><img src="/brands/roasted/logo.png" alt="" width={34} height={34} /> Roasted</div>
                  <div className="s-card">
                    <div style={{ color: '#7a7067' }}>Hi Sarah</div>
                    <div className="s-count">5 <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>stamps</span></div>
                    <div className="s-grid">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={`s-dot img ${i < 5 ? 'on' : ''}`}>
                          <img src="/brands/roasted/stamp.png" alt="" />
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
            <p className="lp-lead">Paper cards get lost and most loyalty apps make customers download something. Loyal Locally lives in their phone browser and does the marketing for you.</p>
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
                <li>Your own background photo, like Roasted&apos;s pebblestones, or a ready-made texture</li>
                <li>Stamps made from your own logo, or pick from coffee beans, cups, leaves, scissors, stars and more</li>
                <li>Up to 4 reward tiers, with your own wording like &ldquo;coffee&rdquo;, &ldquo;cut&rdquo; or &ldquo;class&rdquo;</li>
                <li>Your own spin prizes, odds and voucher expiry</li>
                <li>Ready-made templates for cafes, restaurants, barbers, beauty, gyms and bakeries</li>
              </ul>
            </div>
            <div className="lp-cards" aria-label="Example cards for three different businesses">
              {MINIS.map((m) => (
                <div key={m.name} className={`lp-mini lp-mini-${m.stamp}`} style={{ background: m.bg, color: m.ink }}>
                  <div className="m-name" style={{ fontFamily: m.font }}>
                    {m.logo && <img src={m.logo} alt="" width={30} height={30} />}{m.name}
                  </div>
                  <div style={{ background: m.surface, borderRadius: 14, padding: 10 }}>
                    <div className="m-grid">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={`m-dot ${i < 5 ? 'on' : ''} m-${m.stamp}`} style={i < 5 && m.stamp !== 'img' ? undefined : undefined}>
                          {m.stamp === 'img' ? <img src="/brands/roasted/stamp.png" alt="" /> : m.stamp === 'fade' ? <FadeStamp /> : <PulseStamp />}
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

        <section className="lp-section lp-reviews" id="reviews">
          <div className="lp-container lp-custom-grid">
            <div>
              <div className="lp-eyebrow">✺ Get found</div>
              <h2 className="lp-title">More reviews. Higher on Google Maps. Picked by AI.</h2>
              <p className="lp-lead">
                Reviews are one of the biggest reasons a business shows up in the Google Maps top 3, and AI assistants like ChatGPT and Google AI Overviews read them when they recommend where to go. Your regulars love you. Loyal Locally makes sure they say so.
              </p>
              <ul className="lp-checks">
                <li>Asks regulars for a review on WhatsApp after their 3rd visit (you choose when)</li>
                <li>A &ldquo;Leave a Google review&rdquo; button on every customer&apos;s card</li>
                <li>Asks the right people: your loyal regulars, not one-off visitors</li>
                <li>A steady flow of fresh reviews, which Google and AI search both favour</li>
                <li>Done the right way: we ask, we never reward, so you stay within Google&apos;s rules</li>
              </ul>
            </div>
            <div className="lp-review-stack" aria-hidden="true">
              <div className="lp-wa">
                <div className="lp-wa-head"><span className="lp-wa-dot" /> Your Cafe</div>
                <div className="lp-wa-bubble">Hi Sarah, thanks for being a regular at Your Cafe! Would you mind leaving us a quick Google review? It really helps a small business get found ☕<span className="lp-wa-link">g.page/your-cafe/review</span><span className="lp-wa-time">10:02</span></div>
              </div>
              <div className="lp-gcard">
                <div className="lp-g-row"><strong>Your Cafe</strong><span className="lp-g-pill">Example</span></div>
                <div className="lp-g-stars">★★★★★ <span>4.9 · 312 reviews</span></div>
                <div className="lp-g-review">&ldquo;Best flat white in town, and I love the stamp card!&rdquo;</div>
                <div className="lp-g-meta">Sarah · 2 days ago</div>
              </div>
              <div className="lp-ai">
                <div className="lp-ai-q">Best coffee near me?</div>
                <div className="lp-ai-a">✨ <strong>Your Cafe</strong> is a top pick, with a 4.9 rating from 300+ reviews. Locals mention the flat whites and friendly staff.</div>
              </div>
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
                  <tr><th scope="col"></th><th scope="col">Paper cards</th><th scope="col">Typical loyalty apps</th><th scope="col" className="us">Loyal Locally</th></tr>
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
          <a href="/" className="lp-footer-logo" aria-label="Loyal Locally home">
            <img src="/brand/loyal-locally-logo.png" width={88} height={120} alt="Loyal Locally" />
          </a>
          <nav aria-label="Footer">
            <a href="/login?as=member">Member login</a>
            <a href="/login?as=business">Business login</a>
            <a href="#trial">Free trial</a>
            <a href="/platform">Admin</a>
          </nav>
          <span>© {new Date().getFullYear()} Loyal Locally by Metatap Digital</span>
        </div>
      </footer>
    </div>
  );
}
