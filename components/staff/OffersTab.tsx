'use client';
import { useEffect, useState } from 'react';
import { api, fmtDateTime } from '@/lib/client';
import { SEGMENTS, type Segment } from '@/lib/segments-meta';
import type { Toast } from './StaffConsole';

const IDEAS = [
  'Hi {name}, we miss you! Come in this week and your next coffee is on us.',
  'Double stamps this Saturday, {name}! See you soon.',
  'Hi {name}, you are so close to your next reward. Pop in for a coffee and claim it!',
];

export default function OffersTab({ slug, toast }: { slug: string; toast: Toast }) {
  const [d, setD] = useState<any>(null);
  const [segment, setSegment] = useState<Segment>('all');
  const [message, setMessage] = useState('');
  const [gift, setGift] = useState(false);
  const [v, setV] = useState({ label: 'Free pastry', kind: 'item', value: 10, days: 7 });
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState('');
  const load = () => api(`/api/b/${slug}/admin/campaigns`).then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Sends in small batches until everyone has it. Also used to finish an offer that was interrupted. */
  async function sendAll(id: string, total: number) {
    let done = 0;
    setProgress({ done, total });
    for (;;) {
      const r = await api(`/api/b/${slug}/admin/campaigns/${id}`, {});
      done = total - r.remaining; setProgress({ done, total });
      if (r.remaining === 0) break;
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    const count = d.segments[segment].total;
    if (!window.confirm(`Send this offer to ${count} member${count === 1 ? '' : 's'}?`)) return;
    try {
      const c = await api(`/api/b/${slug}/admin/campaigns`, { segment, message, voucher: gift ? v : null });
      await sendAll(c.id, c.recipients);
      toast('Offer sent'); setMessage(''); setGift(false);
    } catch (e: any) { setErr(e.message); }
    finally { setProgress(null); load(); }
  }

  if (!d) return err ? <div className="banner bad">{err}</div> : <p className="muted">Loading…</p>;
  const seg = d.segments[segment];
  const walletOn = d.wallet.apple || d.wallet.google;
  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      <form className="card flat stack" onSubmit={send}>
        <h3>Send an offer</h3>
        <label>Who gets it
          <select value={segment} onChange={(e) => setSegment(e.target.value as Segment)}>
            {(Object.keys(SEGMENTS) as Segment[]).map((k) => (
              <option key={k} value={k}>{SEGMENTS[k].label} ({d.segments[k].total}): {SEGMENTS[k].hint}</option>
            ))}
          </select>
        </label>
        <label>Message
          <textarea rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} required
            placeholder="Hi {name}, double stamps this Saturday!" />
          <span className="tiny muted" style={{ fontWeight: 400 }}>{'{name}'} becomes their first name. {message.length}/500</span>
        </label>
        <div className="row wrap-row">
          {IDEAS.map((t) => <button key={t} type="button" className="btn ghost small" onClick={() => setMessage(t)}>{t.slice(0, 28)}…</button>)}
        </div>
        <label className="check"><input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} /><span>Add a voucher to their card</span></label>
        {gift && (
          <div className="grid3">
            <label>Voucher<input value={v.label} maxLength={40} onChange={(e) => setV({ ...v, label: e.target.value })} /></label>
            <label>Type<select value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })}><option value="item">Free item</option><option value="percent">% off</option></select></label>
            {v.kind === 'percent' && <label>% off<input type="number" min={1} max={100} value={v.value} onChange={(e) => setV({ ...v, value: Number(e.target.value) })} /></label>}
            <label>Valid (days)<input type="number" min={1} max={60} value={v.days} onChange={(e) => setV({ ...v, days: Number(e.target.value) })} /></label>
          </div>
        )}
        <div className="banner small">
          <strong>{seg.total}</strong> member{seg.total === 1 ? '' : 's'} will see it on their card for 7 days.{' '}
          <strong>{seg.whatsapp}</strong> of them get it on WhatsApp (only people who agreed to messages)
          {seg.push ? <> and <strong>{seg.push}</strong> as a phone notification</> : null}.
          {walletOn ? ' Members with the wallet card also get a phone notification.' : ''}
        </div>
        {progress ? (
          <div className="stack">
            <div className="progress"><div style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} /></div>
            <p className="small muted">Sending… {progress.done} of {progress.total}. Keep this page open.</p>
          </div>
        ) : <button className="btn huge" disabled={!seg.total || message.trim().length < 5}>Send to {seg.total} member{seg.total === 1 ? '' : 's'}</button>}
        {err && <div className="banner bad small">{err}</div>}
      </form>

      <div className="card flat stack">
        <h3>Past offers</h3>
        <p className="small muted">&quot;Came back&quot; counts members who visited within 7 days of the offer.</p>
        <div className="scroll-x">
          <table className="table">
            <thead><tr><th>Sent</th><th>Group</th><th>Message</th><th>Members</th><th>WhatsApp</th><th>Notified</th>{walletOn && <th>Wallet</th>}<th>Came back</th><th>Vouchers used</th></tr></thead>
            <tbody>
              {d.items.map((c: any) => (
                <tr key={c.id}>
                  <td>{fmtDateTime(c.created_at)}</td>
                  <td>{SEGMENTS[c.segment as Segment]?.label ?? c.segment}</td>
                  <td style={{ minWidth: 200 }}>{c.message.length > 80 ? c.message.slice(0, 80) + '…' : c.message}{c.voucher && <div className="tiny muted">🎁 {c.voucher.label}</div>}
                    {c.pending > 0 && !progress && <div><button className="btn ghost small" onClick={() => sendAll(c.id, c.recipients).catch((e) => setErr(e.message)).finally(() => { setProgress(null); load(); })}>Finish sending ({c.pending} left)</button></div>}
                  </td>
                  <td>{c.recipients}</td><td>{c.whatsapp}</td><td>{c.push}</td>{walletOn && <td>{c.wallet}</td>}
                  <td><strong>{c.came_back}</strong> <span className="muted">({Math.round((c.came_back / Math.max(1, c.recipients)) * 100)}%)</span></td>
                  <td>{c.voucher ? c.vouchers_used : '-'}</td>
                </tr>
              ))}
              {!d.items.length && <tr><td colSpan={9} className="muted">No offers sent yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
