'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fmtDate } from '@/lib/client';

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

export default function PlatformConsole({ loggedIn, appUrl }: { loggedIn: boolean; appUrl: string }) {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState<any>(null);
  const [f, setF] = useState({ name: '', slug: '', preset: 'cafe', countryCode: '62', timezone: 'Asia/Makassar', managerName: 'Manager', managerPin: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => api('/api/platform/businesses').then(setData).catch(() => {});
  useEffect(() => { if (loggedIn) load(); }, [loggedIn]);

  if (!loggedIn)
    return (
      <form className="card stack" style={{ maxWidth: 420, margin: '40px auto' }} onSubmit={async (e) => {
        e.preventDefault(); setErr('');
        try { await api('/api/platform/login', { password: pw }); router.refresh(); } catch (e: any) { setErr(e.message); }
      }}>
        <h2>Platform admin</h2>
        <label>Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        {err && <div className="banner bad small">{err}</div>}
        <button className="btn">Log in</button>
      </form>
    );

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const r = await api('/api/platform/businesses', f);
      setMsg(`Created. Customer page: ${appUrl}/${r.slug}  ·  Staff: ${appUrl}/${r.slug}/staff`);
      setF({ ...f, name: '', slug: '', managerPin: '' }); setSlugTouched(false); load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="stack-lg">
      <h1>Businesses</h1>
      <div className="card flat scroll-x">
        <table className="table">
          <thead><tr><th>Business</th><th>Links</th><th>Members</th><th>Stamps (30d)</th><th>Since</th><th></th></tr></thead>
          <tbody>
            {data?.items.map((b: any) => (
              <tr key={b.id}>
                <td><strong>{b.name}</strong> {!b.active && <span className="pill">paused</span>}</td>
                <td className="small"><a href={`/${b.slug}`} target="_blank">/{b.slug}</a> · <a href={`/${b.slug}/staff`} target="_blank">staff</a></td>
                <td>{b.members}</td><td>{b.stamps30}</td><td>{fmtDate(b.created_at)}</td>
                <td className="row">
                  <button className="btn ghost small" onClick={async () => { await api('/api/platform/businesses', { id: b.id, active: !b.active }, 'PATCH'); load(); }}>
                    {b.active ? 'Pause' : 'Resume'}</button>
                  <button className="btn ghost small" onClick={async () => {
                    const pin = window.prompt(`New manager PIN for ${b.name} (4-8 digits)`);
                    if (!pin) return;
                    try { await api('/api/platform/businesses', { id: b.id, resetPin: pin }, 'PATCH'); setMsg(`New manager login added for ${b.name}`); }
                    catch (e: any) { setErr(e.message); }
                  }}>New PIN</button>
                </td>
              </tr>
            ))}
            {data && !data.items.length && <tr><td colSpan={6} className="muted">No businesses yet. Add your first below.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card flat stack">
        <h2>Free trial requests</h2>
        {data?.trials?.length ? (
          <div className="scroll-x">
            <table className="table">
              <thead><tr><th>Business</th><th>Contact</th><th>WhatsApp</th><th>City</th><th>Note</th><th>When</th></tr></thead>
              <tbody>
                {data.trials.map((t: any) => (
                  <tr key={t.id}>
                    <td><strong>{t.business_name}</strong><div className="tiny muted">{t.business_type}</div></td>
                    <td>{t.contact_name}{t.email && <div className="tiny muted">{t.email}</div>}</td>
                    <td><a href={`https://wa.me/${String(t.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{t.whatsapp}</a></td>
                    <td>{t.city || '-'}</td>
                    <td className="small" style={{ maxWidth: 260 }}>{t.message || '-'}</td>
                    <td>{fmtDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted small">No trial requests yet. They appear here when someone fills in the form on the home page.</p>}
      </div>

      <form className="card stack" onSubmit={create} style={{ maxWidth: 720 }}>
        <h2>Add a business</h2>
        <div className="grid2">
          <label>Business name<input value={f.name} required onChange={(e) => setF({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) })} /></label>
          <label>Link name<input value={f.slug} required onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} /></label>
        </div>
        <p className="tiny muted">Customers will use {appUrl || ''}/{f.slug || 'link-name'}</p>
        <div className="grid3">
          <label>Type (starting template)<select value={f.preset} onChange={(e) => setF({ ...f, preset: e.target.value })}>
            {data?.presets.map((p: any) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
          <label>Country code<input value={f.countryCode} onChange={(e) => setF({ ...f, countryCode: e.target.value.replace(/\D/g, '') })} /></label>
          <label>Timezone<select value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })}>
            {['Asia/Makassar', 'Asia/Jakarta', 'Asia/Singapore', 'Australia/Sydney', 'Australia/Brisbane', 'Australia/Perth', 'Europe/London', 'America/New_York', 'America/Los_Angeles']
              .map((t) => <option key={t}>{t}</option>)}</select></label>
        </div>
        <div className="grid2">
          <label>Manager name<input value={f.managerName} onChange={(e) => setF({ ...f, managerName: e.target.value })} /></label>
          <label>Manager PIN (4-8 digits)<input inputMode="numeric" value={f.managerPin} required maxLength={8} onChange={(e) => setF({ ...f, managerPin: e.target.value.replace(/\D/g, '') })} /></label>
        </div>
        {err && <div className="banner bad small">{err}</div>}
        {msg && <div className="banner good small" style={{ wordBreak: 'break-all' }}>{msg}</div>}
        <button className="btn">Create business</button>
        <p className="tiny muted">After creating, log in to the staff page with the manager PIN and open Settings to add the logo, colours and rewards.</p>
      </form>
    </div>
  );
}
