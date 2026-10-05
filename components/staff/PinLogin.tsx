'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

export default function PinLogin({ slug }: { slug: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api(`/api/b/${slug}/staff/login`, { name, password }); router.refresh(); }
    catch (e: any) { setErr(e.message); setPassword(''); setBusy(false); }
  }
  return (
    <form className="auth-card stack" onSubmit={submit}>
      <span className="sticker" style={{ justifySelf: 'start' }}>Staff and managers</span>
      <h2 className="auth-title">Staff login</h2>
      <label>
        Your name
        <input autoComplete="username" autoCapitalize="words" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <span className="tiny muted">Using an old PIN? Leave your name empty.</span>
      </label>
      {err && <div className="banner bad small">{err}</div>}
      <button className="btn block auth-btn" disabled={busy || password.length < 4}>{busy ? 'Checking…' : 'Log in'}</button>
    </form>
  );
}
