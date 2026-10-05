'use client';
import { useEffect, useState } from 'react';
import { api, fmtDate, fmtDateTime } from '@/lib/client';
import { cleanGiftCode, fmtGiftCode, money } from '@/lib/money';
import type { BizInfo, Toast } from './StaffConsole';
import WhatsAppLink from '../WhatsAppLink';

/** Look up a certificate and take value off it. Also used by the Scan tab when a gift QR is scanned. */
export function GiftPanel({ biz, code, toast, onDone }: { biz: BizInfo; code: string; toast: Toast; onDone?: () => void }) {
  const [g, setG] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = () => api(`/api/b/${biz.slug}/staff/gifts/find`, { code })
    .then((r) => { setG(r.gift); setAmount(String(r.gift.balance)); setErr(''); })
    .catch((e) => { setErr(e.message); setG(null); });
  useEffect(() => { load(); }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  async function use() {
    const n = g.kind === 'item' ? 1 : Number(amount);
    const what = g.kind === 'item' ? g.label : money(biz.currency, n);
    if (!window.confirm(`Use ${what} from this gift certificate?`)) return;
    setBusy(true);
    try {
      const r = await api(`/api/b/${biz.slug}/staff/gifts/use`, { code: g.code, amount: n });
      toast(r.kind === 'item' ? `${r.label} given` : `Used ${money(biz.currency, r.used)}. ${money(biz.currency, r.balance)} left`);
      await load(); onDone?.();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  if (err && !g) return <div className="banner bad">{err}</div>;
  if (!g) return <p className="muted">Looking up…</p>;
  const problem = g.void ? 'Cancelled' : g.balance <= 0 ? 'Used up' : g.expired ? `Expired ${fmtDate(g.expires_at)}` : '';
  return (
    <div className="card stack">
      <div className="row between">
        <div>
          <h2>{g.kind === 'item' ? g.label : money(biz.currency, g.amount)}</h2>
          <p className="small muted">{fmtGiftCode(g.code)}{g.to_name ? ` · for ${g.to_name}` : ''} · valid until {fmtDate(g.expires_at)}</p>
        </div>
        {g.kind === 'amount' && <div className="center"><div className="bigcount" style={{ fontSize: '1.6rem' }}>{money(biz.currency, g.balance)}</div><div className="tiny muted">left</div></div>}
      </div>
      {problem ? <div className="banner bad">{problem}. Don&apos;t accept it.</div> : g.kind === 'item' ? (
        <button className="btn huge block" disabled={busy} onClick={use}>Give {g.label}</button>
      ) : (
        <div className="stack">
          <label>Amount to use ({biz.currency})
            <input type="number" inputMode="numeric" min={1} max={g.balance} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <button className="btn huge block" disabled={busy || !(Number(amount) > 0)} onClick={use}>Use {money(biz.currency, Number(amount) || 0)}</button>
        </div>
      )}
      {err && <div className="banner bad">{err}</div>}
      {g.uses.length > 0 && (
        <div className="list small">
          {g.uses.map((u: any, i: number) => (
            <div key={i} className="row between"><span>{fmtDateTime(u.created_at)}{u.staff ? ` · ${u.staff}` : ''}</span>
              <strong>{g.kind === 'item' ? 'Given' : `−${money(biz.currency, u.amount)}`}</strong></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GiftsTab({ biz, toast, manager }: { biz: BizInfo; toast: Toast; manager: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ kind: 'amount', amount: '', label: '', to: '', from: '', message: '', toUsername: '', toPhone: '', fromUsername: '' });
  const [made, setMade] = useState<{ url: string; gift: any; member: { username: string } | null; invite: boolean; whatsapp: string | null } | null>(null);
  const [code, setCode] = useState('');
  const [open, setOpen] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = () => api(`/api/b/${biz.slug}/staff/gifts`).then((r) => setItems(r.items)).catch(() => {});
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function sell(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await api(`/api/b/${biz.slug}/staff/gifts`, { ...form, amount: Number(form.amount) });
      setMade(r); setForm({ ...({ kind: 'amount', amount: '', label: '', to: '', from: '', message: '', toUsername: '', toPhone: '', fromUsername: '' }), kind: form.kind }); load();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  async function cancel(g: any) {
    if (!window.confirm(`Cancel gift certificate ${fmtGiftCode(g.code)}? It can't be used after this.`)) return;
    await api(`/api/b/${biz.slug}/staff/gifts`, { id: g.id, void: true }, 'PATCH').then(() => { toast('Cancelled'); load(); }).catch((e) => toast(e.message));
  }

  if (!biz.giftsEnabled) return <div className="banner">Gift certificates are switched off. A manager can switch them on in Settings.</div>;
  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <form className="card flat stack" onSubmit={sell}>
          <h3>Sell a gift certificate</h3>
          <p className="small muted">Take payment at the till first, then create it here.</p>
          <label>Type
            <select value={form.kind} onChange={f('kind')}>
              <option value="amount">Money value, e.g. {money(biz.currency, 100000)}</option>
              <option value="item">An item, e.g. a free coffee</option>
            </select>
          </label>
          {form.kind === 'amount'
            ? <label>Value ({biz.currency})<input type="number" inputMode="numeric" min={1} value={form.amount} onChange={f('amount')} required /></label>
            : <label>Item<input list="gift-items" value={form.label} onChange={f('label')} placeholder="Free coffee" maxLength={40} required />
                <datalist id="gift-items">{biz.rewards.map((r) => <option key={r.stamps} value={r.label} />)}</datalist></label>}
          <label>Bought by a member? (their username, optional)
            <input value={form.fromUsername} onChange={f('fromUsername')} autoCapitalize="none" placeholder="e.g. ketut.d" maxLength={40} />
            <span className="tiny muted" style={{ fontWeight: 400 }}>If their friend signs up from the gift, it counts as their referral.</span>
          </label>
          <div className="gift-to stack">
            <strong className="small">Who is it for?</strong>
            <label>A member: their username
              <input value={form.toUsername} onChange={f('toUsername')} autoCapitalize="none" placeholder="e.g. made.w" maxLength={40} />
            </label>
            {!form.toUsername.trim() && (
              <div className="grid2">
                <label>Or a friend: name<input value={form.to} onChange={f('to')} maxLength={40} placeholder="e.g. Made" /></label>
                <label>Friend&apos;s WhatsApp<input value={form.toPhone} onChange={f('toPhone')} inputMode="tel" placeholder="+61 412 345 678" /></label>
              </div>
            )}
            <span className="tiny muted">Members see it on their card straight away. A friend gets a link to sign up and collect it.</span>
          </div>
          {!form.fromUsername.trim() && <label>From (name on the gift, optional)<input value={form.from} onChange={f('from')} maxLength={40} /></label>}
          <label>Message (optional)<textarea value={form.message} onChange={f('message')} maxLength={200} rows={2} placeholder="e.g. Happy birthday!" /></label>
          <button className="btn" disabled={busy}>Create gift certificate</button>
          {err && <div className="banner bad small">{err}</div>}
        </form>
        <div className="stack">
          {made && (
            <div className="card stack">
              <div className="banner good">Gift certificate ready: <strong>{fmtGiftCode(made.gift.code)}</strong></div>
              {made.member ? <p className="small muted">It&apos;s on @{made.member.username}&apos;s card now.{made.whatsapp ? ' Let them know on WhatsApp:' : ''}</p>
                : made.invite ? <p className="small muted">Send your friend the sign-up link. When they join, the gift lands on their card.</p>
                : <p className="small muted">Send the link to the buyer. They can forward it to whoever it&apos;s for.</p>}
              {made.whatsapp && <WhatsAppLink className="btn block" href={made.whatsapp}>
                {made.member ? `Send to @${made.member.username} on WhatsApp` : `Send ${made.gift.to_name || 'your friend'} the sign-up link on WhatsApp`}</WhatsAppLink>}
              <div className="row wrap-row">
                <WhatsAppLink className="btn grow" href={`https://wa.me/?text=${encodeURIComponent(`Your ${biz.name} gift certificate: ${made.url}`)}`}>Send on WhatsApp</WhatsAppLink>
                <button className="btn ghost" type="button" onClick={() => navigator.clipboard.writeText(made.url).then(() => toast('Link copied'))}>Copy link</button>
                <a className="btn ghost" href={made.url} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
            </div>
          )}
          <form className="card flat stack" onSubmit={(e) => { e.preventDefault(); setOpen(cleanGiftCode(code)); }}>
            <h3>Use a gift certificate</h3>
            <p className="small muted">Scan its QR in the Scan tab, or type the code.</p>
            <div className="row">
              <input className="grow" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCDE-FGHJK" autoCapitalize="characters" />
              <button className="btn" disabled={cleanGiftCode(code).length !== 10}>Find</button>
            </div>
          </form>
          {open && <GiftPanel key={open} biz={biz} code={open} toast={toast} onDone={load} />}
        </div>
      </div>
      <div className="card flat stack">
        <h3>Recent gift certificates</h3>
        <div className="scroll-x">
          <table className="table">
            <thead><tr><th>Code</th><th>Gift</th><th>Left</th><th>For</th><th>Sold</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((g) => {
                const status = g.void ? 'Cancelled' : g.balance <= 0 ? 'Used' : g.expired ? 'Expired' : 'Active';
                return (
                  <tr key={g.id}>
                    <td><button className="linkbtn" onClick={() => setOpen(g.code)}>{fmtGiftCode(g.code)}</button></td>
                    <td>{g.kind === 'item' ? g.label : money(biz.currency, g.amount)}</td>
                    <td>{g.kind === 'item' ? (g.balance ? '1' : '0') : money(biz.currency, g.balance)}</td>
                    <td>{g.to_name || '-'}</td>
                    <td>{fmtDate(g.created_at)}{g.sold_by ? ` · ${g.sold_by}` : ''}</td>
                    <td><span className="pill">{status}</span></td>
                    <td>{manager && status === 'Active' && <button className="btn ghost small" onClick={() => cancel(g)}>Cancel</button>}</td>
                  </tr>
                );
              })}
              {!items.length && <tr><td colSpan={7} className="muted">None sold yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
