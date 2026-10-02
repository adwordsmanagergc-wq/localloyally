'use client';
import { useEffect, useState } from 'react';

type Item = { name: string; slug: string };
const linkStyle = { background: 'none', border: 0, padding: 0, font: 'inherit', textDecoration: 'underline', cursor: 'pointer', color: 'inherit' } as const;

/** Customers log in with WhatsApp number + password; we find their card. */
function MemberLogin({ onForgot, onSignup }: { onForgot: () => void; onSignup: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cards, setCards] = useState<Item[] | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await fetch('/api/member/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login, password }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || 'Something went wrong'); setBusy(false); return; }
      if (d.cards.length === 1) { window.location.href = `/${d.cards[0].slug}/card`; return; }
      setCards(d.cards); setBusy(false);
    } catch { setErr('Something went wrong, please try again'); setBusy(false); }
  }

  if (cards)
    return (
      <div className="lp-form">
        <p style={{ color: '#5f544b' }}>You have cards at more than one place. Which one?</p>
        <div className="lp-results">
          {cards.map((b) => (
            <a key={b.slug} className="lp-result" href={`/${b.slug}/card`}><span>{b.name}</span><span aria-hidden="true">→</span></a>
          ))}
        </div>
      </div>
    );
  return (
    <form className="lp-form" onSubmit={submit}>
      <label>
        Username
        <input autoFocus autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={login} onChange={(e) => setLogin(e.target.value)} required />
        <span style={{ fontWeight: 400, color: '#5f544b' }}>Joined before usernames? Use your WhatsApp number.</span>
      </label>
      <label>
        Password
        <div style={{ position: 'relative' }}>
          <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', paddingRight: 64 }} />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, font: 'inherit', fontWeight: 700, cursor: 'pointer', color: '#5f544b' }}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>
      {err && <p role="alert" style={{ color: '#b3261e', fontWeight: 600 }}>{err}</p>}
      <button className="lp-btn orange" disabled={busy}>{busy ? 'One moment…' : 'Log in'}</button>
      <p style={{ fontSize: '0.85rem', color: '#5f544b' }}>
        <button type="button" onClick={onForgot} style={linkStyle}>Forgot password?</button>
      </p>
      <p style={{ color: '#5f544b' }}>New here? <button type="button" onClick={onSignup} style={{ ...linkStyle, fontWeight: 700, color: '#1c1511' }}>Sign up for a card</button></p>
    </form>
  );
}

export default function FindBusiness({ initial }: { initial: 'member' | 'business' }) {
  const [mode, setMode] = useState(initial);
  // Customers: log in here, or find the business to sign up / reset a password on its page.
  const [step, setStep] = useState<'login' | 'signup' | 'forgot'>('login');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/businesses?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setItems(d.items || []); setSearched(true);
      } catch { setItems([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // From "Forgot password", open the business's login page with the reset form ready.
  const target = (slug: string) => (mode === 'business' ? `/${slug}/staff` : `/${slug}?${step === 'signup' ? 'join' : 'forgot'}=1`);

  return (
    <div>
      <div className="lp-tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'member'} onClick={() => setMode('member')}>I&apos;m a customer</button>
        <button role="tab" aria-selected={mode === 'business'} onClick={() => setMode('business')}>I&apos;m a business</button>
      </div>
      {mode === 'member' && step === 'login' ? <MemberLogin onForgot={() => setStep('forgot')} onSignup={() => setStep('signup')} /> : (
      <div className="lp-form">
        <p style={{ color: '#5f544b' }}>
          {mode === 'member'
            ? step === 'signup'
              ? 'Search for the business, tap it, then choose a username and password.'
              : 'Which business is your card for? Tap it and we\'ll send a reset code to your WhatsApp.'
            : 'Find your business to open your staff and manager page. You\'ll log in with your PIN.'}
        </p>
        <label>
          Business name
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Roasted" />
        </label>
        <div className="lp-results">
          {items.map((b) => (
            <a key={b.slug} className="lp-result" href={target(b.slug)}>
              <span>{b.name} <small>/{b.slug}</small></span><span aria-hidden="true">→</span>
            </a>
          ))}
          {searched && !items.length && <p style={{ color: '#5f544b' }}>No business found with that name.</p>}
        </div>
        {mode === 'business' && (
          <p style={{ fontSize: '0.85rem', color: '#5f544b' }}>
            New here? <a href="/#trial" style={{ textDecoration: 'underline' }}>Start a free week</a>.
          </p>
        )}
        {mode === 'member' && (
          <button type="button" onClick={() => setStep('login')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', color: '#5f544b', justifySelf: 'start' }}>← Back to log in</button>
        )}
      </div>
      )}
    </div>
  );
}
