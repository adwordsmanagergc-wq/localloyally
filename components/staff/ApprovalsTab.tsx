'use client';
import { useEffect, useState } from 'react';
import { api, fmtDateTime } from '@/lib/client';
import type { Toast } from './StaffConsole';

export default function ApprovalsTab({ slug, toast, onChange }: { slug: string; toast: Toast; onChange: () => void }) {
  const [items, setItems] = useState<any[] | null>(null);
  const load = () => api(`/api/b/${slug}/staff/social`).then((r) => setItems(r.items)).catch(() => setItems([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function review(id: number, approve: boolean) {
    try { await api(`/api/b/${slug}/staff/social`, { id, approve }); toast(approve ? 'Approved, stamps added' : 'Rejected'); }
    catch (e: any) { toast(e.message); }
    load(); onChange();
  }

  if (!items) return <p className="muted">Loading…</p>;
  if (!items.length) return <div className="card flat"><p className="muted">No posts waiting. Nice.</p></div>;
  return (
    <div className="stack" style={{ maxWidth: 680 }}>
      <p className="small muted">Open each link, check it tags the business and is still up, then approve.</p>
      {items.map((s) => (
        <div key={s.id} className="card flat stack">
          <div className="row between"><strong>{s.name}</strong><span className="pill">{s.platform}</span></div>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="small" style={{ wordBreak: 'break-all' }}>{s.url}</a>
          <div className="row between">
            <span className="tiny muted">{fmtDateTime(s.created_at)}</span>
            <div className="row">
              <button className="btn small" onClick={() => review(s.id, true)}>Approve</button>
              <button className="btn ghost small" onClick={() => review(s.id, false)}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
