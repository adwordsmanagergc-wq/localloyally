'use client';
import { useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/client';
import type { Toast } from './StaffConsole';

/** Customers who agreed to WhatsApp messages: a list the owner can use for their own marketing. */
export default function MarketingTab({ slug, toast }: { slug: string; toast: Toast }) {
  const [d, setD] = useState<{ items: any[]; total: number } | null>(null);
  const [q, setQ] = useState('');
  useEffect(() => { api(`/api/b/${slug}/admin/marketing`).then(setD).catch((e) => toast(e.message)); }, [slug, toast]);
  if (!d) return <p className="muted">Loading…</p>;
  const ql = q.trim().toLowerCase();
  const items = ql ? d.items.filter((c) => [c.username, c.name, c.phone].some((v) => String(v ?? '').toLowerCase().includes(ql))) : d.items;

  async function copyNumbers() {
    await navigator.clipboard.writeText(items.map((c) => '+' + c.phone).join('\n'));
    toast(`${items.length} numbers copied`);
  }
  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      <div className="card flat stack">
        <h3>WhatsApp marketing list</h3>
        <p className="small muted">
          <strong>{d.items.length}</strong> of {d.total} members agreed to WhatsApp messages from you. Only message people on this list,
          and stop if someone asks. They can also switch messages off on their card, and they then leave this list.
        </p>
        <div className="row wrap-row">
          <input className="grow" placeholder="Search username, name or number" value={q} onChange={(e) => setQ(e.target.value)} />
          <a className="btn" href={`/api/b/${slug}/admin/marketing?csv=1`}>Download CSV</a>
          <button className="btn ghost" type="button" onClick={copyNumbers} disabled={!items.length}>Copy numbers</button>
        </div>
      </div>
      <div className="card flat scroll-x">
        <table className="table">
          <thead><tr><th>Username</th><th>WhatsApp</th><th>Joined</th><th>Visits</th><th>Last visit</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.phone}>
                <td>{c.username ?? c.name}</td>
                <td><a href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer">+{c.phone}</a></td>
                <td>{fmtDate(c.created_at)}</td><td>{c.visits}</td><td>{c.last_visit ? fmtDate(c.last_visit) : '-'}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="muted">Nobody yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
