'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

/** Two ways in: the business PIN (owner/manager), or a staff member's own name and password. */
export default function PinLogin({ slug, initial = 'business' }: { slug: string; initial?: 'business' | 'staff' }) {
  const router = useRouter();
  const [mode, setMode] = useState(initial);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const switchTo = (m: 'business' | 'staff') => { setMode(m); setErr(''); setPassword(''); };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api(`/api/b/${slug}/staff/login`, mode === 'business' ? { pin: password } : { name, password }); router.refresh(); }
    catch (e: any) { setErr(e.message); setPassword(''); setBusy(false); }
  }
  return (
    <form className="auth-card stack" onSubmit={submit}>
      <div className="row" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'business'} className={`btn small grow ${mode === 'business' ? '' : 'ghost'}`} onClick={() => switchTo('business')}>Business sign in</button>
        <button type="button" role="tab" aria-selected={mode === 'staff'} className={`btn small grow ${mode === 'staff' ? '' : 'ghost'}`} onClick={() => switchTo('staff')}>Staff login</button>
      </div>
      {mode === 'business' ? (
        <>
          <h2 className="auth-title">Business sign in</h2>
          <label>
            Business PIN
            <input key="pin" type="password" inputMode="numeric" autoComplete="current-password" value={password} autoFocus maxLength={64}
              onChange={(e) => setPassword(e.target.value)} style={{ fontSize: '1.6rem', letterSpacing: '0.4em', textAlign: 'center' }} />
          </label>
        </>
      ) : (
        <>
          <h2 className="auth-title">Staff login</h2>
          <label>
            Your name
            <input key="name" autoComplete="username" autoCapitalize="words" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Password
            <input key="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </>
      )}
      {err && <div className="banner bad small">{err}</div>}
      <button className="btn block auth-btn" disabled={busy || password.length < 4 || (mode === 'staff' && !name.trim())}>{busy ? 'Checking…' : 'Log in'}</button>
    </form>
  );
}
