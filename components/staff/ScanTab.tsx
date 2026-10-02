'use client';
import { useEffect, useRef, useState } from 'react';
import { api, fmtDate, fmtDateTime } from '@/lib/client';
import Stamp from '../Stamp';
import type { BizInfo, Toast } from './StaffConsole';
import { GiftPanel } from './GiftsTab';

const LABEL: Record<string, string> = {
  purchase: 'Visit', double_hour: 'Double hour', welcome: 'Welcome', social: 'Social post',
  referral: 'Referral', streak: 'Streak', redeem: 'Redeemed', adjust: 'Adjustment',
};

function Scanner({ onScan }: { onScan: (text: string) => void }) {
  const ref = useRef<any>(null);
  const [err, setErr] = useState('');
  const cb = useRef(onScan);
  cb.current = onScan;
  useEffect(() => {
    let stopped = false;
    (async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (stopped) return;
      const q = new Html5Qrcode('reader', { verbose: false } as any);
      ref.current = q;
      try {
        await q.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } },
          (text: string) => { if (!stopped) { stopped = true; q.stop().catch(() => {}); cb.current(text); } }, () => {});
      } catch (e: any) {
        setErr('Camera blocked. Allow camera access for this site, or look up by phone below.');
      }
    })();
    return () => { stopped = true; ref.current?.stop?.().catch(() => {}); };
  }, []);
  return (
    <div className="stack">
      <div id="reader" style={{ width: '100%', maxWidth: 420, margin: '0 auto' }} />
      {err && <div className="banner bad small">{err}</div>}
    </div>
  );
}

export default function ScanTab({ biz, toast, onSocialChange }: { biz: BizInfo; toast: Toast; onSocialChange: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [gift, setGift] = useState('');
  const maxTier = Math.max(...biz.rewards.map((r) => r.stamps));

  async function lookup(q: Record<string, string>) {
    setErr(''); setBusy(true);
    try { setData(await api(`/api/b/${biz.slug}/staff/lookup`, q)); setQty(1); setConfirm(false); }
    catch (e: any) { setErr(e.message); setData(null); }
    finally { setBusy(false); setScanning(false); }
  }
  const refresh = () => data && lookup({ customerId: data.customer.id });

  async function act(path: string, payload: any, done: (r: any) => string) {
    setBusy(true); setErr('');
    try {
      const r = await api(`/api/b/${biz.slug}/staff/${path}`, { customerId: data.customer.id, ...payload });
      if (r.needsConfirm) { setConfirm(true); setBusy(false); return; }
      toast(done(r)); setConfirm(false);
      await refresh();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  if (gift)
    return (
      <div className="stack-lg" style={{ maxWidth: 520 }}>
        <GiftPanel biz={biz} code={gift} toast={toast} />
        <button className="btn dark huge block" onClick={() => { setGift(''); setScanning(true); }}>Next customer</button>
      </div>
    );

  if (!data)
    return (
      <div className="stack-lg" style={{ maxWidth: 520 }}>
        {scanning ? (
          <div className="stack">
            <Scanner onScan={(t) => {
              const g = t.match(/\/g\/([A-Z0-9]{10})(?:[/?#]|$)/);
              if (g) { setScanning(false); setGift(g[1]); } else lookup({ token: t });
            }} />
            <button className="btn ghost block" onClick={() => setScanning(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn huge block" onClick={() => { setErr(''); setScanning(true); }}>Scan member or gift QR</button>
        )}
        <form className="card flat stack" onSubmit={(e) => { e.preventDefault(); lookup({ phone }); }}>
          <label>
            Or find by WhatsApp number or username
            <div className="row">
              <input className="grow" autoCapitalize="none" placeholder="0812… or username" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="btn" disabled={busy || phone.trim().length < 3}>Find</button>
            </div>
          </label>
        </form>
        {busy && <p className="muted">Looking up…</p>}
        {err && <div className="banner bad">{err}</div>}
      </div>
    );

  const bal = data.balance as number;
  return (
    <div className="stack-lg" style={{ maxWidth: 620 }}>
      <div className="card stack">
        <div className="row between">
          <div>
            <h2>{data.customer.name}{data.customer.username && data.customer.username !== data.customer.name && <span className="muted small"> @{data.customer.username}</span>}</h2>
            <p className="small muted">{data.customer.phone.startsWith('+') ? data.customer.phone : '+' + data.customer.phone} · last visit {data.lastVisit ? fmtDate(data.lastVisit) : 'never'}</p>
          </div>
          <div className="center"><div className="bigcount">{bal}</div><div className="tiny muted">stamps</div></div>
        </div>
        <div className="stamps" style={{ ['--cols' as any]: maxTier <= 6 ? maxTier : maxTier <= 10 ? 5 : 6 }}>
          {Array.from({ length: maxTier }, (_, i) => (
            <div key={i} className={`slot ${biz.stampImageUrl ? 'img' : ''} ${i < bal ? 'on' : ''} ${biz.rewards.some((r) => r.stamps === i + 1) ? 'tier' : ''}`}>
              <Stamp icon={biz.stampIcon} image={biz.stampImageUrl} size={20} />
            </div>
          ))}
        </div>
        {data.doubleHourNow && <div className="banner small">Double stamp hour is on: each {biz.itemWord} gets 2 stamps.</div>}
      </div>

      <div className="card stack">
        <h3>Add stamps</h3>
        <div className="row">
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(biz.maxPerVisit, q + 1))} aria-label="More">+</button>
          </div>
          <span className="muted small">{qty === 1 ? biz.itemWord : biz.itemWordPlural} bought now</span>
        </div>
        {confirm ? (
          <div className="stack">
            <div className="banner">This member got a stamp in the last 3 minutes. Add again?</div>
            <div className="row">
              <button className="btn grow" disabled={busy} onClick={() => act('stamp', { qty, force: true }, stampMsg)}>Yes, add</button>
              <button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn huge block" disabled={busy} onClick={() => act('stamp', { qty }, stampMsg)}>
            + Add {qty} stamp{qty > 1 ? 's' : ''}
          </button>
        )}
      </div>

      <div className="card stack">
        <h3>Rewards</h3>
        {biz.rewards.map((r) => (
          <button key={r.stamps} className={`btn block ${bal >= r.stamps ? '' : 'ghost'}`} disabled={busy || bal < r.stamps}
            onClick={() => { if (window.confirm(`Give ${r.label} and use ${r.stamps} stamps?`)) act('redeem', { tier: r.stamps }, (x) => `${x.label} redeemed`); }}>
            {r.label} · {r.stamps} stamps {bal < r.stamps && `(needs ${r.stamps - bal} more)`}
          </button>
        ))}
        {data.vouchers.length > 0 && <hr />}
        {data.vouchers.map((v: any) => (
          <div key={v.id} className="voucher">
            <div><div className="v-label">{v.label}</div><div className="tiny muted">{v.source} · expires {fmtDate(v.expires_at)}</div></div>
            <button className="btn small" disabled={busy}
              onClick={() => act('voucher', { voucherId: v.id }, (x) => `${x.label} used`)}>Use now</button>
          </div>
        ))}
      </div>

      {data.pendingSocial && (
        <div className="card stack">
          <h3>Post waiting for approval</h3>
          <a href={data.pendingSocial.url} target="_blank" rel="noopener noreferrer" className="small" style={{ wordBreak: 'break-all' }}>{data.pendingSocial.url}</a>
          <div className="row">
            <button className="btn grow" disabled={busy} onClick={async () => {
              await api(`/api/b/${biz.slug}/staff/social`, { id: data.pendingSocial.id, approve: true }).then(() => toast('Post approved')).catch((e) => setErr(e.message));
              onSocialChange(); refresh();
            }}>Approve</button>
            <button className="btn ghost" disabled={busy} onClick={async () => {
              await api(`/api/b/${biz.slug}/staff/social`, { id: data.pendingSocial.id, approve: false }).then(() => toast('Post rejected')).catch((e) => setErr(e.message));
              onSocialChange(); refresh();
            }}>Reject</button>
          </div>
        </div>
      )}

      {err && <div className="banner bad">{err}</div>}

      <div className="card flat stack">
        <h3>History</h3>
        <div className="list small">
          {data.history.map((h: any, i: number) => (
            <div key={i} className="row between">
              <span>{LABEL[h.reason] ?? h.reason}{h.note ? ` · ${h.note}` : ''} <span className="muted">· {fmtDateTime(h.created_at)}</span></span>
              <strong>{h.delta > 0 ? `+${h.delta}` : h.delta}</strong>
            </div>
          ))}
        </div>
      </div>

      <button className="btn dark huge block" onClick={() => { setData(null); setPhone(''); setErr(''); setScanning(true); }}>Next customer</button>
    </div>
  );

  function stampMsg(r: any) {
    const extra = (r.events as any[]).filter((e) => e.reason !== 'purchase').map((e) => `${LABEL[e.reason]} +${e.delta}`);
    return `Stamped! Now ${r.balance}${extra.length ? ` (${extra.join(', ')})` : ''}`;
  }
}
