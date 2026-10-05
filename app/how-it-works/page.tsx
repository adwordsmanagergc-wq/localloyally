import '../landing.css';
import type { Metadata } from 'next';
import { pricesForVisitor } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'How it works | Loyal Locally',
  description: 'See exactly how Loyal Locally works for your business: the customer card, the staff screen, spin to win, WhatsApp marketing, Google reviews, gift cards and your reports.',
};

const IMG = '/how-it-works/';
const Phone = ({ src, alt }: { src: string; alt: string }) => (
  <figure className="hiw-phone"><img src={IMG + src} alt={alt} loading="lazy" /></figure>
);
const Laptop = ({ src, alt }: { src: string; alt: string }) => (
  <figure className="hiw-laptop"><div className="hiw-bar"><span /><span /><span /></div><img src={IMG + src} alt={alt} loading="lazy" /></figure>
);

const STEPS = [
  { n: '1', t: 'We set you up', p: 'Your logo, colours, rewards and prizes. Most cafés are live the same day.' },
  { n: '2', t: 'Customers join', p: 'They scan your join QR at the counter or tap the link in your bio. 30 seconds, no app.' },
  { n: '3', t: 'Every visit, a stamp', p: 'They tell staff their username, staff tap Add stamp. Done in seconds.' },
  { n: '4', t: 'We bring them back', p: 'Spin to win, WhatsApp offers, reminders and Google review requests do the rest.' },
];

const BENEFITS = [
  { e: '🔁', t: 'More repeat visits', p: 'A reward they can see filling up, a prize halfway, and reminders when they are close.' },
  { e: '📇', t: 'You own your customer list', p: 'Every member, their visits and who agreed to WhatsApp. Download it any time.' },
  { e: '⭐', t: 'More Google reviews', p: 'Your happiest regulars get asked at the right moment, so you climb Google Maps.' },
  { e: '📣', t: 'Marketing that costs nothing', p: 'Message the right group from your own WhatsApp, and let members post and refer for you.' },
  { e: '🧾', t: 'No paper, no hardware', p: 'No cards to print or lose and no till to change. Any phone or tablet works.' },
  { e: '🛡️', t: 'Hard to cheat', p: 'Staff logins, a log of every stamp, codes that change every 2 minutes, and approvals for posts.' },
];

export default async function HowItWorks() {
  const prices = await pricesForVisitor();
  return (
    <div className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&family=Nunito:wght@900&display=swap" />
      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo" aria-label="Loyal Locally home"><img className="lp-logo-img" src="/brand/loyal-locally-icon.png" width={38} height={38} alt="" /><span className="lp-logo-text">Loyal <span className="lp-logo-pill">Locally</span></span></a>
          <nav className="lp-links" aria-label="Main">
            <a href="#steps">Steps</a><a href="#customers">Customers</a><a href="#staff">Staff</a><a href="#reports">Reports</a>
            <a href="#marketing">Marketing</a><a href="#reviews">Reviews</a><a href="#pricing">Pricing</a>
          </nav>
          <div className="lp-nav-cta">
            <a className="lp-btn small ghost" href="/login?as=business">Business login</a>
            <a className="lp-btn small" href="/#setup">Get started</a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-section hiw-hero">
          <div className="lp-container hiw-split">
            <div>
              <div className="lp-eyebrow">✺ How it works</div>
              <h1 className="lp-title" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>The loyalty card your customers keep. The marketing that brings them back.</h1>
              <p className="lp-lead">Here&apos;s the whole thing, screen by screen, using a real café set-up: <strong>Roasted</strong> in Canggu. Customers get a branded card on their phone. Your staff add stamps in seconds. You get the numbers and the tools to fill quiet days.</p>
              <div className="lp-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
                <a className="lp-btn orange" href="/#setup">Get started →</a>
                <a className="lp-btn ghost" href="#steps">Show me how</a>
              </div>
            </div>
            <div className="hiw-duo">
              <Phone src="card-wheel.webp" alt="Roasted customer card: 4 stamps and the spin to win wheel just unlocked" />
              <Phone src="staff-customer.webp" alt="Staff screen adding a stamp for Sophie" />
            </div>
          </div>
        </section>

        <section className="lp-section" id="steps" style={{ paddingTop: 0 }}>
          <div className="lp-container">
            <div className="lp-eyebrow">✺ In four steps</div>
            <h2 className="lp-title">From sign-up to second visit.</h2>
            <div className="hiw-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="hiw-step"><span className="hiw-n">{s.n}</span><strong>{s.t}</strong><p>{s.p}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section hiw-band" id="customers">
          <div className="lp-container hiw-split">
            <div className="hiw-duo">
              <Phone src="join.webp" alt="Roasted sign-up page" />
              <Phone src="join-form.webp" alt="Sign-up form with username, password and WhatsApp" />
            </div>
            <div>
              <div className="lp-eyebrow">✺ For your customers</div>
              <h2 className="lp-title">A card that looks like you, not like us.</h2>
              <p className="lp-lead">Your logo, colours, background photo and even your own stamp design. Customers sign up in 30 seconds with a username, password and WhatsApp number, and their phone remembers them.</p>
              <ul className="lp-checks">
                <li>No app to download, works on any phone</li>
                <li>Up to 4 reward levels, like 5 for a pastry and 8 for a free coffee</li>
                <li>Welcome stamps, birthday treats and streak bonuses</li>
                <li>One login for every Loyal Locally business they love</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section" id="staff">
          <div className="lp-container hiw-split">
            <div>
              <div className="lp-eyebrow">✺ At the counter</div>
              <h2 className="lp-title">Stamps in seconds. No scanning, no cards.</h2>
              <p className="lp-lead">The customer says their username, which is shown big on their card. Staff type it, or just the first few letters, and tap <strong>Add stamp</strong>.</p>
              <p className="lp-lead">Busy queue? Staff read out a 6-digit counter code instead and the customer types it on their card. Codes change every 2 minutes and work once a day per customer, so sharing them is pointless.</p>
              <ul className="lp-checks">
                <li>Every staff member logs in with their own name and password</li>
                <li>Every stamp is logged with who gave it</li>
                <li>Warns about accidental double stamps</li>
              </ul>
            </div>
            <div className="hiw-trio">
              <Phone src="card-counter.webp" alt="Customer card showing @sophie for staff" />
              <Phone src="staff-pick.webp" alt="Staff searching 'sop' and picking the customer" />
              <Phone src="staff-codes.webp" alt="Counter codes on the staff screen" />
            </div>
          </div>
        </section>

        <section className="lp-section hiw-band">
          <div className="lp-container hiw-split">
            <Phone src="card-wheel.webp" alt="Customer card with 4 stamps and the spin to win wheel unlocked" />
            <div>
              <div className="lp-eyebrow">✺ Spin to win</div>
              <h2 className="lp-title">A reason to come back before the reward.</h2>
              <p className="lp-lead">Halfway to their top reward, say 4 stamps on an 8-stamp card, customers unlock one spin. Prizes are vouchers for their <em>next</em> visit, so every spin brings them back again.</p>
              <ul className="lp-checks">
                <li>You choose the prizes and the odds</li>
                <li>The result is decided on our server, not the phone</li>
                <li>Vouchers show on their card and on your staff screen</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section" id="reports">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Your numbers</div>
            <h2 className="lp-title">Know who&apos;s coming back, and who isn&apos;t.</h2>
            <p className="lp-lead">Your dashboard shows repeat visits, customers slipping away, rewards claimed and what each staff member did, so you can act before regulars drift off.</p>
            <div className="hiw-sample">Sample report with example numbers</div>
            <Laptop src="dashboard-full.webp" alt="Manager dashboard: members, repeat visits, customer groups, team and stamps per day" />
            <div className="hiw-callouts">
              <div><strong>Repeat rate</strong><p>How many customers came back for a 2nd visit, and how many of last month&apos;s came back this month.</p></div>
              <div><strong>Customer groups</strong><p>Regulars, close to a reward, at risk and lost, each ready to message in one tap.</p></div>
              <div><strong>Team</strong><p>Visits, stamps, rewards and gift sales per staff member over 30 days.</p></div>
            </div>
          </div>
        </section>

        <section className="lp-section hiw-band" id="marketing">
          <div className="lp-container hiw-split">
            <div>
              <div className="lp-eyebrow">✺ WhatsApp marketing</div>
              <h2 className="lp-title">Message the right people. See who came back.</h2>
              <p className="lp-lead">Pick a group, like customers you haven&apos;t seen in 30 days, write one message and add a voucher if you like. Send it from <strong>your own WhatsApp</strong>, one tap per customer, or to one person at a time.</p>
              <ul className="lp-checks">
                <li>Only customers who agreed to messages, as the law requires</li>
                <li>{'{name}'} becomes each customer&apos;s first name</li>
                <li>Automatic reminders when they&apos;re 1 stamp away or a voucher is expiring</li>
                <li>Every offer shows how many came back within 7 days</li>
              </ul>
            </div>
            <Phone src="marketing-phone.webp" alt="Sending a WhatsApp offer from the business's own number" />
          </div>
          <div className="lp-container" style={{ marginTop: 34 }}>
            <div className="hiw-sample">Sample results</div>
            <Laptop src="offers.webp" alt="Past offers with members, WhatsApp, came back and vouchers used" />
          </div>
        </section>

        <section className="lp-section" id="reviews">
          <div className="lp-container hiw-split">
            <div className="hiw-stack">
              <Phone src="card-review.webp" alt="Google review request on the customer card" />
            </div>
            <div>
              <div className="lp-eyebrow">✺ Google reviews</div>
              <h2 className="lp-title">More 5-star reviews, on autopilot.</h2>
              <p className="lp-lead">Reviews are one of the biggest reasons a business shows up in the Google Maps top 3, and AI assistants like ChatGPT read them when they recommend places. After a regular&apos;s 3rd visit (you choose when), we ask them for a review on WhatsApp and on their card.</p>
              <ul className="lp-checks">
                <li>Asks your happiest customers, at the right moment</li>
                <li>Never rewarded with stamps, so you stay inside Google&apos;s rules</li>
                <li>A steady stream of fresh reviews instead of a one-off push</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section hiw-band">
          <div className="lp-container hiw-split">
            <div>
              <div className="lp-eyebrow">✺ Free marketing from your regulars</div>
              <h2 className="lp-title">Your customers post, share and invite for you.</h2>
              <p className="lp-lead">Members earn bonus stamps for posting about you on Instagram, TikTok, Facebook or Threads. Staff check each post and approve it in one tap. Every member also has a share link, and earns a stamp when a friend joins and visits.</p>
              <ul className="lp-checks">
                <li>Your Instagram handle on every card</li>
                <li>One post every 7 days, and the same link can&apos;t be used twice</li>
                <li>Referrals only count after the friend&apos;s first visit</li>
              </ul>
            </div>
            <div className="hiw-duo">
              <Phone src="card-earn.webp" alt="Post about us and bring a friend on the customer card" />
              <Phone src="staff-posts.webp" alt="Staff approving an Instagram post" />
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-container hiw-split">
            <div className="hiw-duo">
              <Phone src="gift-page.webp" alt="Branded gift certificate with QR code and balance" />
              <Phone src="card-giftfriend.webp" alt="Send a gift to a friend from the card" />
            </div>
            <div>
              <div className="lp-eyebrow">✺ Gift cards</div>
              <h2 className="lp-title">Sell gift cards without printing a thing.</h2>
              <p className="lp-lead">Create a gift card for any amount or item at the counter. The buyer gets a branded link with a QR code, and the balance can be used over several visits. Members can even ask you to send a gift to a friend straight from their card, and a new friend who signs up counts as a referral.</p>
              <ul className="lp-checks">
                <li>Money value or an item, like a free coffee</li>
                <li>Shows on the friend&apos;s card if they&apos;re a member</li>
                <li>Every sale and use is tracked per staff member</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section hiw-band">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ What you get</div>
            <h2 className="lp-title">Why businesses switch.</h2>
            <div className="lp-trial-perks">
              {BENEFITS.map((b) => (
                <div key={b.t} className="lp-perk">
                  <span className="lp-perk-e" aria-hidden="true">{b.e}</span>
                  <div><strong>{b.t}</strong><p>{b.p}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section" id="pricing">
          <div className="lp-container">
            <div className="lp-eyebrow">✺ Pricing</div>
            <h2 className="lp-title">One simple monthly price.</h2>
            <p className="lp-lead">Everything on this page is included, set up with you, with unlimited customers and staff logins.</p>
            <div className={`lp-plans${prices.length === 1 ? ' lp-plans-one' : ''}`}>
              {prices.map((p) => (
                <div key={p.country} className="lp-plan">
                  <div className="lp-plan-country"><span aria-hidden="true">{p.flag}</span> {p.country}</div>
                  <div className="lp-plan-price">{p.price}<span>/ month</span></div>
                  <a className="lp-btn small orange" href="/#setup">Get started</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <a href="/" className="lp-footer-logo" aria-label="Loyal Locally home"><img src="/brand/loyal-locally-logo.png" width={88} height={120} alt="Loyal Locally" /></a>
          <nav aria-label="Footer">
            <a href="/">Home</a><a href="/login?as=member">Member login</a><a href="/login?as=business">Business login</a><a href="/#setup">Get started</a>
          </nav>
          <span>© {new Date().getFullYear()} Loyal Locally by Metatap Digital</span>
        </div>
      </footer>
    </div>
  );
}
