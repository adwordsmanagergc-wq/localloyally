'use client';
import { useState } from 'react';

const TYPES = ['Cafe / coffee', 'Matcha / tea bar', 'Restaurant', 'Barber / salon', 'Beauty / spa / nails', 'Gym / studio', 'Bakery / dessert', 'Other'];

export default function TrialForm() {
  const [f, setF] = useState({ businessName: '', businessType: TYPES[0], contactName: '', whatsapp: '', email: '', city: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/trial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong, please try again');
      setMsg({ ok: true, text: `Thanks ${f.contactName.split(' ')[0]}! We'll message you on WhatsApp shortly to set up ${f.businessName}.` });
      setF({ ...f, businessName: '', message: '' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally { setBusy(false); }
  }

  return (
    <form className="lp-form" onSubmit={submit}>
      <h3 style={{ fontSize: '1.5rem' }}>Get started</h3>
      <div className="row2">
        <label>Business name<input value={f.businessName} onChange={set('businessName')} required maxLength={80} autoComplete="organization" /></label>
        <label>Type of business<select value={f.businessType} onChange={set('businessType')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <div className="row2">
        <label>Your name<input value={f.contactName} onChange={set('contactName')} required maxLength={60} autoComplete="name" /></label>
        <label>WhatsApp number<input value={f.whatsapp} onChange={set('whatsapp')} required inputMode="tel" autoComplete="tel" placeholder="+61 412 345 678" /></label>
      </div>
      <div className="row2">
        <label>Email (optional)<input type="email" value={f.email} onChange={set('email')} maxLength={120} autoComplete="email" /></label>
        <label>City<input value={f.city} onChange={set('city')} maxLength={60} placeholder="Canggu" /></label>
      </div>
      <label>Anything we should know? (optional)<textarea rows={3} value={f.message} onChange={set('message')} maxLength={600} placeholder="E.g. we want 10 stamps for a free coffee and spin to win" /></label>
      {msg && <div className={`lp-msg ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.text}</div>}
      <button className="lp-btn orange" disabled={busy}>{busy ? 'Sending…' : 'Send →'}</button>
      <p style={{ fontSize: '0.8rem', color: '#5f544b' }}>We only use your details to get in touch and set up your card.</p>
    </form>
  );
}
