'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

export default function PinLogin({ slug }: { slug: string }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api(`/api/b/${slug}/staff/login`, { pin }); router.refresh(); }
    catch (e: any) { setErr(e.message); setPin(''); setBusy(false); }
  }
  return (
    <form className="card stack" onSubmit={submit}>
      <h2>Staff login</h2>
      <label>
        Your PIN
        <input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pin} autoFocus
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} style={{ fontSize: '1.6rem', letterSpacing: '0.4em', textAlign: 'center' }} />
      </label>
      {err && <div className="banner bad small">{err}</div>}
      <button className="btn block" disabled={busy || pin.length < 4}>{busy ? 'Checking…' : 'Log in'}</button>
    </form>
  );
}
