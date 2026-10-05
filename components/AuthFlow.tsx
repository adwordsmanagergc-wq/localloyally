'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, savePassword } from '@/lib/client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
type Mode = 'join' | 'login' | 'forgot' | 'reset';

export default function AuthFlow({ slug, refCode, businessName, start, giftCode, invite }: {
  slug: string; refCode?: string; businessName: string; start?: 'join' | 'forgot'; giftCode?: string;
  invite?: { code: string; item?: string; from: string; gift: string; welcome: number };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(refCode ? 'join' : start ?? 'login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState('');
  const [bm, setBm] = useState('');
  const [bd, setBd] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const go = (m: Mode) => { setMode(m); setErr(''); setInfo(''); };
  const done = (welcome = false) => router.replace(`/${slug}/card${welcome ? '?welcome=1' : ''}`);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setErr('');
    try { await fn(); } catch (e: any) {
      setErr(e.message);
      if (e.data?.exists) setMode('login');
      setBusy(false);
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') return run(async () => { await api(`/api/b/${slug}/auth/login`, { login: username, password }); await savePassword(username, password); done(); });
    if (mode === 'join')
      return run(async () => {
        await api(`/api/b/${slug}/auth/register`, {
          username, phone, password, optIn, terms, ref: refCode, gift: giftCode, invite: invite?.code, inviteItem: invite?.item,
          birthdayMonth: bm ? Number(bm) : undefined, birthdayDay: bd ? Number(bd) : undefined,
        });
        await savePassword(username.trim().toLowerCase(), password);
        done(true);
      });
    if (mode === 'forgot')
      return run(async () => {
        await api(`/api/b/${slug}/auth/start`, { phone });
        setMode('reset'); setInfo('We sent a 6-digit code to your WhatsApp.'); setBusy(false);
      });
    return run(async () => { await api(`/api/b/${slug}/auth/reset`, { phone, code, password }); done(); });
  };

  const pwField = () => (
    <label>
      {mode === 'login' ? 'Password' : mode === 'reset' ? 'New password' : 'Create a password'}
      <div className="pw-wrap">
        <input type={show ? 'text' : 'password'} name="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 6} required />
        <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
      </div>
      {mode !== 'login' && <span className="tiny muted" style={{ fontWeight: 400 }}>At least 6 characters. Your phone can save it for next time.</span>}
    </label>
  );

  return (
    <div className="auth">
      {(mode === 'join' || mode === 'login') && (
        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => go('login')}>Log in</button>
          <button type="button" role="tab" aria-selected={mode === 'join'} onClick={() => go('join')}>Join free</button>
        </div>
      )}
      <form className="auth-card stack" onSubmit={submit} autoComplete="on">
        <h2 className="auth-title">
          {mode === 'login' ? 'Welcome back' : mode === 'join' ? `Get your ${businessName} card` : 'Reset your password'}
        </h2>
        {mode === 'join' && giftCode && <div className="banner good small">🎁 You&apos;ve been sent a gift card! Sign up and it&apos;ll be waiting on your card.</div>}
        {mode === 'join' && invite && (
          <div className="banner good small">
            ☕ {invite.from} sent you {invite.gift}! Sign up to claim it on your card
            {invite.welcome > 0 ? `, plus ${invite.welcome} welcome stamp${invite.welcome > 1 ? 's' : ''}` : ''}.
          </div>
        )}
        {mode === 'join' && refCode && !giftCode && !invite && <div className="banner small">A friend invited you. Welcome!</div>}
        {info && <div className="banner good small">{info}</div>}

        {(mode === 'join' || mode === 'login') && (
          <label>
            {mode === 'join' ? 'Choose a username' : 'Username'}
            <input name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={username}
              onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={mode === 'join' ? 20 : 40} />
            <span className="tiny muted" style={{ fontWeight: 400 }}>
              {mode === 'join' ? '3 to 20 letters or numbers. You\'ll use it to log in.' : 'Joined before usernames? Use your WhatsApp number.'}
            </span>
          </label>
        )}
        {mode === 'join' && pwField()}
        {mode !== 'login' && (
          <label>
            WhatsApp number
            <input name="phone" autoComplete="tel" inputMode="tel" placeholder="+61 412 345 678" value={phone}
              onChange={(e) => setPhone(e.target.value)} required readOnly={mode === 'reset'} />
            {mode !== 'reset' && <span className="tiny muted" style={{ fontWeight: 400 }}>
              Start with + and your country code, e.g. +61 Australia, +62 Indonesia.{mode === 'join' ? ' Used for password reset codes and your rewards.' : ''}</span>}
          </label>
        )}
        {mode === 'reset' && (
          <label>Code from WhatsApp
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required
              style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.3rem' }} />
          </label>
        )}
        {(mode === 'login' || mode === 'reset') && pwField()}

        {mode === 'join' && (
          <>
            <div className="stack" style={{ gap: 6 }}>
              <span className="small" style={{ fontWeight: 600 }}>Birthday (optional, for a treat)</span>
              <div className="row">
                <select value={bd} onChange={(e) => setBd(e.target.value)} aria-label="Birthday day">
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                </select>
                <select value={bm} onChange={(e) => setBm(e.target.value)} aria-label="Birthday month">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
            </div>
            <label className="check">
              <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              <span>Send me WhatsApp messages about my rewards and offers. You can stop anytime.</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
              <span>I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>terms and conditions</a></span>
            </label>
          </>
        )}

        {err && <div className="banner bad small">{err}</div>}
        {(mode === 'login' || mode === 'join') && <p className="tiny muted">You&apos;ll stay logged in on this phone, and it can save your password.</p>}
        <button className="btn block auth-btn" disabled={busy}>
          {busy ? 'One moment…' : mode === 'login' ? 'Log in' : mode === 'join' ? 'Create my card →' : mode === 'forgot' ? 'Send me a code' : 'Save and log in'}
        </button>

        <div className="row between small">
          {mode === 'login' && <button type="button" className="linkbtn" onClick={() => go('forgot')}>Forgot password?</button>}
          {(mode === 'forgot' || mode === 'reset') && <button type="button" className="linkbtn" onClick={() => go('login')}>Back to log in</button>}
          {mode === 'reset' && <button type="button" className="linkbtn" onClick={() => go('forgot')}>Resend code</button>}
        </div>
      </form>
    </div>
  );
}
