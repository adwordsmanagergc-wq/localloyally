'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/client';
import { personalise } from '@/lib/personalise';
import { SEGMENTS, type Segment } from '@/lib/segments-meta';
import type { Toast } from './StaffConsole';

type Person = { username: string | null; name: string; phone: string; created_at: string; last_visit: string | null; visits: number };
type Run = { message: string; segment: Segment; people: { phone: string; name: string; who: string }[]; done: string[] };

const KEY = (slug: string) => `ll-wa-run2-${slug}`;
const loadRun = (slug: string): Run | null => {
  try { return JSON.parse(localStorage.getItem(KEY(slug)) || 'null'); } catch { return null; }
};
const saveRun = (slug: string, r: Run | null) => {
  try { r ? localStorage.setItem(KEY(slug), JSON.stringify(r)) : localStorage.removeItem(KEY(slug)); } catch { /* private mode */ }
};

/**
 * Send a message from the business's own WhatsApp, one customer at a time.
 * Each tap opens WhatsApp with the message ready; progress is kept on this phone so they can carry on later.
 */
function OwnWhatsAppSender({ slug, people, segment, toast, message, setMessage }: {
  slug: string; people: Person[]; segment: Segment; toast: Toast; message: string; setMessage: (m: string) => void;
}) {
  const [run, setRun] = useState<Run | null>(null);
  useEffect(() => { setRun(loadRun(slug)); }, [slug]);
  const update = (r: Run | null) => { setRun(r); saveRun(slug, r); };

  if (!run)
    return (
      <div className="card flat stack">
        <h3>Send from your own WhatsApp</h3>
        <p className="small muted">
          Write your message once. Send it to everyone below one by one, or tap Send next to a single customer.
          We open WhatsApp on this phone with it ready, and you just tap send. Free, and it comes from your own number.
        </p>
        <label>Message
          <textarea rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi {name}! Double stamps at our cafe this Saturday ☕" />
          <span className="tiny muted" style={{ fontWeight: 400 }}>{'{name}'} becomes their first name.</span>
        </label>
        <button className="btn" disabled={message.trim().length < 3 || !people.length}
          onClick={() => update({ message: message.trim(), segment, people: people.map((p) => ({ phone: p.phone, name: p.name, who: p.username ?? p.name })), done: [] })}>
          Send to all {people.length}{segment !== 'all' ? ` ${SEGMENTS[segment].label.toLowerCase()}` : ''} one by one
        </button>
      </div>
    );

  const person = run.people.find((p) => !run.done.includes(p.phone));
  const next = person?.phone;
  const who = person?.who ?? '';
  const text = personalise(run.message, person?.name ?? '');
  const mark = () => next && update({ ...run, done: [...run.done, next] });
  const waLink = next ? `https://wa.me/${next}?text=${encodeURIComponent(text)}` : '';

  return (
    <div className="card stack">
      <div className="row between">
        <h3>Sending from your WhatsApp</h3>
        <span className="small muted">{run.done.length} of {run.people.length} done</span>
      </div>
      <div className="progress"><div style={{ width: `${(run.done.length / Math.max(1, run.people.length)) * 100}%` }} /></div>
      {next ? (
        <>
          <div className="wa-next">
            <div className="tiny muted">Next</div>
            <div className="wa-who">{who}</div>
            <div className="small muted">+{next}</div>
            <p className="wa-preview">{text}</p>
          </div>
          {/* Open WhatsApp for this person first, then line up the next one for when they come back.
              (Moving on before opening would change the link to the next person.) */}
          <a className="btn huge block" href={waLink} target="_blank" rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); window.open(waLink, '_blank', 'noopener'); mark(); }}>
            Open WhatsApp for {who} →
          </a>
          <div className="row">
            <button className="btn ghost grow" onClick={mark}>Skip</button>
            <button className="btn ghost grow" onClick={() => { if (window.confirm('Stop this message? You can start a new one.')) update(null); }}>Stop</button>
          </div>
          <p className="tiny muted">Send it in WhatsApp, then come back here. Progress is saved on this phone.</p>
        </>
      ) : (
        <>
          <div className="banner good">All done! Sent to {run.done.length} {run.done.length === 1 ? 'person' : 'people'}.</div>
          <button className="btn" onClick={() => { update(null); toast('Ready for a new message'); }}>New message</button>
        </>
      )}
    </div>
  );
}

/** Customers who agreed to WhatsApp messages: a list the owner can use for their own marketing. */
export default function MarketingTab({ slug, toast }: { slug: string; toast: Toast }) {
  const [segment, setSegment] = useState<Segment>('all');
  const [d, setD] = useState<{ items: Person[]; total: number } | null>(null);
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');
  const load = useCallback(() => api(`/api/b/${slug}/admin/marketing?segment=${segment}`).then(setD).catch((e) => toast(e.message)), [slug, segment, toast]);
  useEffect(() => { load(); }, [load]);
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
          Everyone here agreed to WhatsApp messages from you ({d.total} members in total). Only message people on this list,
          and stop if someone asks. They can also switch messages off on their card, and they then leave this list.
        </p>
        <label>Group
          <select value={segment} onChange={(e) => setSegment(e.target.value as Segment)}>
            {(Object.keys(SEGMENTS) as Segment[]).map((k) => <option key={k} value={k}>{SEGMENTS[k].label}: {SEGMENTS[k].hint}</option>)}
          </select>
        </label>
        <div className="row wrap-row">
          <input className="grow" placeholder="Search username, name or number" value={q} onChange={(e) => setQ(e.target.value)} />
          <a className="btn" href={`/api/b/${slug}/admin/marketing?csv=1&segment=${segment}`}>Download CSV</a>
          <button className="btn ghost" type="button" onClick={copyNumbers} disabled={!items.length}>Copy numbers</button>
        </div>
      </div>

      <OwnWhatsAppSender slug={slug} people={items} segment={segment} toast={toast} message={message} setMessage={setMessage} />

      <div className="card flat scroll-x">
        <table className="table">
          <thead><tr><th>Username</th><th>WhatsApp</th><th>Joined</th><th>Visits</th><th>Last visit</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.phone}>
                <td>{c.username ?? c.name}</td>
                <td><a href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer">+{c.phone}</a></td>
                <td>{fmtDate(c.created_at)}</td><td>{c.visits}</td><td>{c.last_visit ? fmtDate(c.last_visit) : '-'}</td>
                <td>
                  {/* Just this customer: uses the message above if there is one */}
                  <a className="btn small" target="_blank" rel="noopener noreferrer"
                    href={`https://wa.me/${c.phone}${message.trim() ? `?text=${encodeURIComponent(personalise(message.trim(), c.name))}` : ''}`}>Send</a>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={6} className="muted">Nobody in this group yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
