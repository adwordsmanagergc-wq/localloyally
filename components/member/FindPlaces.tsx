'use client';
import { useEffect, useState } from 'react';

type Place = { name: string; slug: string; logo?: string | null; tagline?: string | null };

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Something went wrong');
  return d;
}

/** Search other businesses and join with the member's existing account. */
export function FindPlaces({ mine }: { mine: string[] }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Place[]>([]);
  const [searched, setSearched] = useState(false);
  const [joining, setJoining] = useState<Place | null>(null);
  const [optIn, setOptIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      try {
        const d = await (await fetch(`/api/businesses?q=${encodeURIComponent(q.trim())}`)).json();
        setItems(d.items || []); setSearched(true);
      } catch { setItems([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function join() {
    if (!joining) return;
    setBusy(true); setErr('');
    try { const d = await post('/api/member/join', { slug: joining.slug, optIn }); window.location.href = `/${d.slug}/card`; }
    catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="lp-form">
      <label>
        Search businesses
        <input value={q} onChange={(e) => { setQ(e.target.value); setJoining(null); }} placeholder="e.g. cafe name" />
      </label>
      <div className="lp-results">
        {items.map((p) => {
          const have = mine.includes(p.slug);
          return (
            <div key={p.slug} className="lp-result me-place">
              <span className="me-biz">
                {p.logo ? <img src={p.logo} alt="" width={40} height={40} /> /* eslint-disable-line @next/next/no-img-element */ : <span className="me-dot" />}
                <span>{p.name}{p.tagline && <small>{p.tagline}</small>}</span>
              </span>
              {have
                ? <a className="lp-btn small ghost" href={`/${p.slug}/card`}>Open</a>
                : <button type="button" className="lp-btn small" onClick={() => { setJoining(p); setErr(''); }}>Join</button>}
            </div>
          );
        })}
        {searched && !items.length && <p style={{ color: '#5f544b' }}>No business found with that name.</p>}
      </div>
      {joining && (
        <div className="me-join">
          <strong>Join {joining.name}?</strong>
          <p>You&apos;ll get a {joining.name} card with your username and password. The same terms and conditions apply.</p>
          <label className="me-check">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
            <span>Send me WhatsApp messages about my rewards and offers from {joining.name}. You can stop anytime.</span>
          </label>
          {err && <p role="alert" style={{ color: '#b3261e', fontWeight: 600 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="lp-btn orange" disabled={busy} onClick={join}>{busy ? 'One moment…' : 'Get my card →'}</button>
            <button type="button" className="lp-btn ghost" onClick={() => setJoining(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MemberLogout() {
  return (
    <button type="button" className="lp-btn small ghost" onClick={async () => {
      await post('/api/member/logout', {}).catch(() => {});
      window.location.href = '/';
    }}>Log out</button>
  );
}
