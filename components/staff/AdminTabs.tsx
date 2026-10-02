'use client';
import { useEffect, useState } from 'react';
import { api, fmtDate } from '@/lib/client';
import { SEGMENTS } from '@/lib/segments-meta';
import type { Toast } from './StaffConsole';

export function DashboardTab({ slug }: { slug: string }) {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api(`/api/b/${slug}/admin/stats`).then(setD).catch(() => {}); }, [slug]);
  if (!d) return <p className="muted">Loading…</p>;
  const max = Math.max(1, ...d.daily.map((x: any) => x.n));
  const Stat = ({ n, label }: { n: number; label: string }) => (
    <div className="card flat stat"><div className="n">{n}</div><div className="small muted">{label}</div></div>
  );
  const Pct = ({ n, of, label }: { n: number; of: number; label: string }) => (
    <div className="stat"><div className="n">{of ? `${Math.round((n / of) * 100)}%` : '-'}</div><div className="small muted">{label}{of ? ` (${n} of ${of})` : ''}</div></div>
  );
  return (
    <div className="stack-lg">
      <div className="grid3">
        <Stat n={d.members.total} label="members" />
        <Stat n={d.members.new7} label="new this week" />
        <Stat n={d.stamps.today} label="stamps today" />
        <Stat n={d.stamps.week} label="stamps this week" />
        <Stat n={d.stamps.active30} label="active last 30 days" />
        <Stat n={d.rewards.month} label="rewards claimed (30d)" />
        <Stat n={d.vouchers.used30} label={`vouchers used of ${d.vouchers.issued30} (30d)`} />
        <Stat n={d.social.approved30} label="social posts (30d)" />
        <Stat n={d.members.optin} label="opted in to WhatsApp" />
      </div>
      <div className="card flat stack">
        <h3>Are customers coming back?</h3>
        <div className="grid3">
          <Pct n={d.repeat.returned} of={d.repeat.visited} label="came back for a 2nd visit or more" />
          <Pct n={d.retention.back} of={d.retention.base} label="of last month's customers came back this month" />
          <div className="stat"><div className="n">{d.repeat.avg_visits}</div><div className="small muted">visits per customer on average</div></div>
        </div>
      </div>
      <div className="card flat stack">
        <h3>Customer groups</h3>
        <p className="small muted">Send any group an offer from the Offers tab.</p>
        <div className="list small">
          {Object.entries(SEGMENTS).filter(([k]) => k !== 'all').map(([k, g]) => (
            <div key={k} className="row between">
              <span><strong>{g.label}</strong> <span className="muted">· {g.hint}</span></span>
              <strong>{d.segments[k]?.total ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="card flat stack">
        <h3>Team, last 30 days</h3>
        <div className="scroll-x">
          <table className="table">
            <thead><tr><th>Name</th><th>Visits</th><th>Stamps</th><th>Customers</th><th>Rewards</th><th>Vouchers</th><th>Posts</th><th>Gifts sold</th></tr></thead>
            <tbody>
              {d.staff.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.name} {s.role === 'manager' && <span className="pill">manager</span>} {!s.active && <span className="pill">off</span>}</td>
                  <td><strong>{s.visits}</strong></td><td>{s.stamps}</td><td>{s.customers}</td><td>{s.rewards}</td><td>{s.vouchers}</td><td>{s.posts}</td><td>{s.gifts_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card flat stack">
        <h3>Stamps per day, last 14 days</h3>
        {d.daily.length ? (
          <>
            <div className="bars">{d.daily.map((x: any) => <div key={x.d} style={{ height: `${(x.n / max) * 100}%` }} title={`${x.d}: ${x.n}`} />)}</div>
            <div className="row between tiny muted"><span>{d.daily[0].d}</span><span>{d.daily[d.daily.length - 1].d}</span></div>
          </>
        ) : <p className="muted small">No stamps yet.</p>}
      </div>
    </div>
  );
}

export function MembersTab({ slug, toast }: { slug: string; toast: Toast }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const load = (query = q) => api(`/api/b/${slug}/admin/customers?q=${encodeURIComponent(query)}`).then((r) => setItems(r.items)).catch(() => {});
  useEffect(() => { load(''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function adjust(c: any) {
    const v = window.prompt(`Adjust stamps for ${c.name}. Use a negative number to remove (e.g. -1).`);
    if (!v) return;
    const note = window.prompt('Reason (optional)') || '';
    try { await api(`/api/b/${slug}/admin/customers`, { customerId: c.id, delta: Number(v), note }); toast('Adjusted'); load(); }
    catch (e: any) { toast(e.message); }
  }
  return (
    <div className="stack">
      <div className="row wrap-row">
        <form className="row grow" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <input className="grow" placeholder="Search name or number" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn">Search</button>
        </form>
        <a className="btn ghost" href={`/api/b/${slug}/admin/export`}>Export CSV</a>
      </div>
      <div className="card flat scroll-x">
        <table className="table">
          <thead><tr><th>Name</th><th>WhatsApp</th><th>Stamps</th><th>Visits</th><th>Last visit</th><th>Opt-in</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td><td>+{c.phone}</td><td><strong>{c.balance}</strong></td><td>{c.visits}</td>
                <td>{c.last_visit ? fmtDate(c.last_visit) : '-'}</td><td>{c.marketing_opt_in ? 'Yes' : 'No'}</td>
                <td><button className="btn ghost small" onClick={() => adjust(c)}>Adjust</button></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={7} className="muted">No members found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TeamTab({ slug, toast, me }: { slug: string; toast: Toast; me: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('staff');
  const load = () => api(`/api/b/${slug}/admin/staff`).then((r) => setItems(r.items)).catch(() => {});
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try { await api(`/api/b/${slug}/admin/staff`, { name, pin, role }); toast(`${name} added`); setName(''); setPin(''); load(); }
    catch (e: any) { toast(e.message); }
  }
  async function toggle(s: any) {
    try { await api(`/api/b/${slug}/admin/staff`, { id: s.id, active: !s.active }, 'PATCH'); load(); }
    catch (e: any) { toast(e.message); }
  }
  return (
    <div className="grid2" style={{ alignItems: 'start' }}>
      <div className="card flat stack">
        <h3>Team</h3>
        <div className="list">
          {items.map((s) => (
            <div key={s.id} className="row between">
              <span>{s.name} <span className="pill">{s.role}</span> {!s.active && <span className="pill">off</span>}</span>
              {s.id !== me && <button className="btn ghost small" onClick={() => toggle(s)}>{s.active ? 'Switch off' : 'Switch on'}</button>}
            </div>
          ))}
        </div>
      </div>
      <form className="card flat stack" onSubmit={add}>
        <h3>Add a staff login</h3>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>PIN (4 to 8 digits, unique per person)
          <input inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={8} required />
        </label>
        <label>Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff: stamp and redeem</option>
            <option value="manager">Manager: also settings, members, team</option>
          </select>
        </label>
        <button className="btn">Add</button>
      </form>
    </div>
  );
}
