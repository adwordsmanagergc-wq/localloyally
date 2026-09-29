'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AuthFlow({ slug, refCode }: { slug: string; refCode?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [bm, setBm] = useState('');
  const [bd, setBd] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function start(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await api(`/api/b/${slug}/auth/start`, { phone });
      setIsNew(r.isNew); setStep('code');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api(`/api/b/${slug}/auth/verify`, {
        phone, code, name, optIn, ref: refCode,
        birthdayMonth: bm ? Number(bm) : undefined, birthdayDay: bd ? Number(bd) : undefined,
      });
      router.replace(`/${slug}/card`);
      router.refresh();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  if (step === 'phone')
    return (
      <form className="card stack" onSubmit={start}>
        <h2>Join or log in</h2>
        {refCode && <div className="banner small">A friend invited you. You'll both get a bonus stamp after your first visit.</div>}
        <label>
          WhatsApp number
          <input inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" value={phone}
            onChange={(e) => setPhone(e.target.value)} required />
          <span className="tiny muted" style={{ fontWeight: 400 }}>Visiting from overseas? Start with + and your country code.</span>
        </label>
        {err && <div className="banner bad small">{err}</div>}
        <button className="btn block" disabled={busy || phone.replace(/\D/g, '').length < 8}>
          {busy ? 'Sending…' : 'Send me a code on WhatsApp'}
        </button>
      </form>
    );

  return (
    <form className="card stack" onSubmit={verify}>
      <h2>{isNew ? 'Create your card' : 'Welcome back'}</h2>
      <p className="small muted">We sent a 6-digit code to your WhatsApp.</p>
      <label>
        Code
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus
          style={{ letterSpacing: '0.4em', fontSize: '1.4rem', textAlign: 'center' }} />
      </label>
      {isNew && (
        <>
          <label>
            Your name
            <input autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} />
          </label>
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
        </>
      )}
      {err && <div className="banner bad small">{err}</div>}
      <button className="btn block" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : isNew ? 'Create my card' : 'Log in'}</button>
      <div className="row between small">
        <button type="button" className="linkbtn" onClick={() => { setStep('phone'); setCode(''); setErr(''); }}>Change number</button>
        <button type="button" className="linkbtn" onClick={() => start()} disabled={busy}>Resend code</button>
      </div>
    </form>
  );
}
