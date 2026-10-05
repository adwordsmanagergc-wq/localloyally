'use client';
import { useEffect, useRef, useState } from 'react';
import { api, fmtDate, fmtDateTime } from '@/lib/client';
import Stamp from '../Stamp';
import type { BizInfo, Toast } from './StaffConsole';
import { GiftPanel } from './GiftsTab';
import { fmtGiftCode, money } from '@/lib/money';

const LABEL: Record<string, string> = {
  purchase: 'Visit', double_hour: 'Double hour', welcome: 'Welcome', social: 'Social post',
  referral: 'Referral', streak: 'Streak', redeem: 'Redeemed', adjust: 'Adjustment', bonus: 'Bonus',
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

/** The two codes customers can type instead of being scanned. They change every 2 minutes. */
function CounterCodes({ slug }: { slug: string }) {
  const [c, setC] = useState<{ stamp: string; bonus: string; secondsLeft: number } | null>(null);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const r = await api(`/api/b/${slug}/staff/codes`);
        if (!alive) return;
        setC(r); setLeft(r.secondsLeft);
        timer = setTimeout(load, r.secondsLeft * 1000 + 300);
      } catch { if (alive) timer = setTimeout(load, 15000); }
    };
    load();
    const tick = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => { alive = false; clearTimeout(timer); clearInterval(tick); };
  }, [slug]);
  if (!c) return null;
  const fmt = (x: string) => `${x.slice(0, 3)} ${x.slice(3)}`;
  return (
    <div className="card flat stack">
      <div className="row between"><h3>Counter codes</h3><span className="tiny muted">New codes in {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span></div>
      <p className="small muted">Or tell the customer a code to type on their card. Each works once per customer per day.</p>
      <div className="grid2">
        <div className="code-box"><div className="tiny muted">Stamp code</div><div className="code-n">{fmt(c.stamp)}</div></div>
        <div className="code-box"><div className="tiny muted">Bonus stamp code (staff only)</div><div className="code-n">{fmt(c.bonus)}</div></div>
      </div>
      <div className="progress"><div style={{ width: `${(left / 120) * 100}%`, transition: 'width 1s linear' }} /></div>
    </div>
  );
}

/** Managers only: send this member a phone notification. */
function MessageBox({ slug, customerId, name, toast }: { slug: string; customerId: string; name: string; toast: Toast }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api(`/api/b/${slug}/admin/message`, { customerId, message: text }); toast(`Message sent to ${name}`); setText(''); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  return (
    <form className="card stack" onSubmit={send}>
      <h3>Send a message</h3>
      <p className="small muted">Goes to their phone as a notification.</p>
      <textarea rows={2} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Hi ${name.split(' ')[0]}, …`} />
      {err && <div className="banner bad small">{err}</div>}
      <button className="btn block" disabled={busy || text.trim().length < 2}>{busy ? 'Sending…' : 'Send'}</button>
    </form>
  );
}

/** Staff send a one-off invite from their own WhatsApp and pick the gift: a voucher or head-start stamps. Each link works once, for 24 hours. */
function InviteFriend({ biz, toast, manager }: { biz: BizInfo; toast: Toast; manager: boolean }) {
  const [to, setTo] = useState('');
  const [gift, setGift] = useState<'voucher' | 'stamps' | 'black'>('voucher');
  const [busy, setBusy] = useState(false);
  if (!biz.invite) return null;
  const inv = biz.invite;
  const item = inv.label.toLowerCase();
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const welcome = biz.welcomeStamps > 0 ? ` and ${plural(biz.welcomeStamps, 'welcome stamp')}` : '';
  const giftText = gift === 'black' ? 'a 👑 Black card: free coffee for life' : gift === 'stamps' ? plural(inv.stamps, 'head-start stamp') : `${item} (use within ${inv.days} days)`;

  async function newLink() {
    const r = await api(`/api/b/${biz.slug}/staff/invite`, { gift });
    return r.link as string;
  }
  async function send() {
    // Open the tab now, while the tap still counts, then point it at WhatsApp once the link is ready
    const w = window.open('', '_blank');
    setBusy(true);
    try {
      const link = await newLink();
      const opener = gift === 'black' ? `👑 You've been chosen. Here's a ${biz.name} Black card: free coffee for life.` : gift === 'stamps' ? `Hi! Here's a head start on your ${biz.name} rewards card ☕` : `Hi! Here's a ${item} on me at ${biz.name} ☕`;
      const text = `${opener} Join with this link and your ${giftText}${welcome} will be waiting for you. The link works once, within 24 hours: ${link}`;
      let digits = to.replace(/\D/g, '');
      if (digits.startsWith('0')) digits = biz.countryCode + digits.slice(1);
      const href = `https://wa.me/${digits.length >= 8 ? digits : ''}?text=${encodeURIComponent(text)}`;
      if (w) w.location.href = href; else window.location.href = href;
    } catch (e: any) { w?.close(); toast(e.message); }
    finally { setBusy(false); }
  }
  async function copy() {
    setBusy(true);
    try {
      const link = await newLink();
      try { await navigator.clipboard.writeText(link); toast('Link copied. It works once, within 24 hours.'); } catch { toast(link); }
    } catch (e: any) { toast(e.message); }
    finally { setBusy(false); }
  }
  return (
    <div className="card flat stack">
      <h3>Invite a friend</h3>
      <p className="small muted">
        Send an invite from your own WhatsApp. Each link works for one person, within 24 hours. New members also get the usual
        {biz.welcomeStamps > 0 ? ` ${plural(biz.welcomeStamps, 'welcome stamp')}` : ' welcome'}.
      </p>
      {(inv.stamps > 0 || manager) && (
        <div className="row wrap-row">
          <button type="button" className={`btn small grow ${gift === 'voucher' ? '' : 'ghost'}`} onClick={() => setGift('voucher')}>{inv.label}</button>
          {inv.stamps > 0 && <button type="button" className={`btn small grow ${gift === 'stamps' ? '' : 'ghost'}`} onClick={() => setGift('stamps')}>{plural(inv.stamps, 'stamp')} head start</button>}
          {manager && <button type="button" className={`btn small grow ${gift === 'black' ? 'dark' : 'ghost'}`} onClick={() => setGift('black')}>👑 Black card</button>}
        </div>
      )}
      {gift === 'black' && <div className="banner small">Black card: free coffee for life. Managers only. You can take it back on their member screen.</div>}
      <p className="small">They get: <strong>{giftText}</strong></p>
      <label>
        Their WhatsApp number (optional)
        <input inputMode="tel" placeholder="e.g. 0812 3456 7890 or +61 412 345 678" value={to} onChange={(e) => setTo(e.target.value)} />
        <span className="tiny muted">Leave empty to pick the chat in WhatsApp.</span>
      </label>
      <div className="row">
        <button type="button" className="btn grow" disabled={busy} onClick={send}>Send on WhatsApp</button>
        <button type="button" className="btn ghost" disabled={busy} onClick={copy}>Copy link</button>
      </div>
    </div>
  );
}

export default function ScanTab({ biz, toast, onSocialChange, manager }: { biz: BizInfo; toast: Toast; onSocialChange: () => void; manager: boolean }) {
  const [scanning, setScanning] = useState(false);
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [gift, setGift] = useState('');
  const [matches, setMatches] = useState<any[] | null>(null);
  const maxTier = Math.max(...biz.rewards.map((r) => r.stamps));

  async function lookup(q: Record<string, string>) {
    setErr(''); setBusy(true);
    setMatches(null);
    try {
      const r = await api(`/api/b/${biz.slug}/staff/lookup`, q);
      if (r.matches) { setMatches(r.matches); setData(null); }
      else { setData(r); setQty(1); setConfirm(false); }
    }
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
        <button className="btn dark huge block" onClick={() => { setGift(''); setScanning(false); }}>Next customer</button>
      </div>
    );

  if (!data)
    return (
      <div className="stack-lg" style={{ maxWidth: 520 }}>
        <form className="card stack" onSubmit={(e) => { e.preventDefault(); lookup({ phone }); }}>
          <label>
            <span style={{ fontSize: '1.15rem' }}>Find the customer</span>
            <span className="tiny muted" style={{ fontWeight: 400 }}>Type their username (they can see it on their card), part of it, or their WhatsApp number.</span>
            <div className="row">
              <input className="grow" autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="e.g. ketut.d" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="btn" disabled={busy || phone.trim().length < 2}>Find</button>
            </div>
          </label>
        </form>
        {matches && (
          <div className="card flat stack">
            <h3>Pick the customer</h3>
            <div className="list">
              {matches.map((m) => (
                <button key={m.id} type="button" className="btn ghost block match-btn" onClick={() => lookup({ customerId: m.id })}>
                  <span><strong>{m.username ?? m.name}</strong>{m.username && m.name !== m.username ? ` · ${m.name}` : ''}</span>
                  <span className="muted small">{m.phone.startsWith('+') ? m.phone : '+' + m.phone}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {busy && <p className="muted">Looking up…</p>}
        {err && <div className="banner bad">{err}</div>}
        {biz.counterCodes && <CounterCodes slug={biz.slug} />}
        <InviteFriend biz={biz} toast={toast} manager={manager} />
        {scanning ? (
          <div className="stack">
            <Scanner onScan={(t) => {
              const g = t.match(/\/g\/([A-Z0-9]{10})(?:[/?#]|$)/);
              if (g) { setScanning(false); setGift(g[1]); } else lookup({ token: t });
            }} />
            <button className="btn ghost block" onClick={() => setScanning(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn ghost block" style={{ background: 'var(--surface)' }} onClick={() => { setErr(''); setScanning(true); }}>🎁 Scan a gift certificate</button>
        )}
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

      {data.customer.black_card_at && (
        <div className="banner" style={{ background: '#0b0b0c', color: '#e8c977', borderColor: '#c9a34a' }}>
          👑 <strong>Black card member.</strong> Free coffee, every time. No stamps needed.
        </div>
      )}
      {manager && (
        <button className="btn ghost block" disabled={busy} onClick={async () => {
          const on = !data.customer.black_card_at;
          if (!on && !window.confirm(`Take ${data.customer.name}'s black card away?`)) return;
          setBusy(true);
          try { await api(`/api/b/${biz.slug}/admin/blackcard`, { customerId: data.customer.id, active: on }); toast(on ? `👑 ${data.customer.name} is now a Black card member` : 'Black card taken back'); await refresh(); }
          catch (e: any) { setErr(e.message); setBusy(false); }
        }}>{data.customer.black_card_at ? 'Take back black card' : '👑 Give black card (free coffee for life)'}</button>
      )}

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
        {data.gifts?.map((g: any) => (
          <div key={g.code} className="voucher">
            <div><div className="v-label">🎁 {g.kind === 'item' ? g.label : money(biz.currency, g.balance)}</div>
              <div className="tiny muted">Gift card{g.from_name ? ` from ${g.from_name}` : ''} · {fmtGiftCode(g.code)}</div></div>
            <button className="btn small" onClick={() => setGift(g.code)}>Use</button>
          </div>
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

      {manager && <MessageBox slug={biz.slug} customerId={data.customer.id} name={data.customer.name} toast={toast} />}

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

      <button className="btn dark huge block" onClick={() => { setData(null); setPhone(''); setErr(''); setMatches(null); setScanning(false); }}>Next customer</button>
    </div>
  );

  function stampMsg(r: any) {
    const extra = (r.events as any[]).filter((e) => e.reason !== 'purchase').map((e) => `${LABEL[e.reason]} +${e.delta}`);
    return `Stamped! Now ${r.balance}${extra.length ? ` (${extra.join(', ')})` : ''}`;
  }
}
