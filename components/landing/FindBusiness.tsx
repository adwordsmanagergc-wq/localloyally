'use client';
import { useEffect, useState } from 'react';

type Item = { name: string; slug: string };

export default function FindBusiness({ initial }: { initial: 'member' | 'business' }) {
  const [mode, setMode] = useState(initial);
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

  const target = (slug: string) => (mode === 'business' ? `/${slug}/staff` : `/${slug}`);

  return (
    <div>
      <div className="lp-tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'member'} onClick={() => setMode('member')}>I&apos;m a customer</button>
        <button role="tab" aria-selected={mode === 'business'} onClick={() => setMode('business')}>I&apos;m a business</button>
      </div>
      <div className="lp-form">
        <p style={{ color: '#5f544b' }}>
          {mode === 'member'
            ? 'Find the business whose rewards card you want to open. You\'ll log in with your WhatsApp number.'
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
      </div>
    </div>
  );
}
