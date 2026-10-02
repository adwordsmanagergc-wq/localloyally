'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, uiLock } from '@/lib/client';

/** Keeps the card up to date: refreshes when they come back to the page and every 20 seconds, so new stamps appear. */
export function CardRefresh({ slug }: { slug: string }) {
  const router = useRouter();
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible' && !uiLock.busy) router.refresh(); };
    document.addEventListener('visibilitychange', onVis);
    const poll = setInterval(() => { if (!uiLock.busy && document.visibilityState === 'visible') router.refresh(); }, 20000);
    return () => { clearInterval(poll); document.removeEventListener('visibilitychange', onVis); };
  }, [slug, router]);
  return null;
}

export function SocialForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api(`/api/b/${slug}/card/social`, { url });
      setMsg({ ok: true, text: 'Sent! Staff will approve it soon.' }); setUrl('');
      router.refresh();
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  }
  return (
    <form className="stack" onSubmit={submit}>
      <div className="row">
        <input className="grow" type="url" inputMode="url" placeholder="https://instagram.com/p/…" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <button className="btn" disabled={busy || !url}>Send</button>
      </div>
      {msg && <div className={`banner small ${msg.ok ? 'good' : 'bad'}`}>{msg.text}</div>}
    </form>
  );
}

export function ShareReferral({ link, text }: { link: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}: ${link}`)}`;
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ text, url: link }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="row">
      <a className="btn grow" href={wa} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
      <button className="btn ghost" type="button" onClick={share}>{copied ? 'Copied' : 'Share'}</button>
    </div>
  );
}

export function LogoutButton({ slug }: { slug: string }) {
  return (
    <button className="linkbtn small" onClick={async () => {
      await api(`/api/b/${slug}/auth/logout`, {}).catch(() => {});
      window.location.href = '/'; // back to the Loyal Locally homepage
    }}>Log out</button>
  );
}

/** Type a code from staff (or one sent on WhatsApp) to get a stamp without being scanned. */
export function CodeForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await api(`/api/b/${slug}/card/code`, { code });
      setMsg({ ok: true, text: `Done! +${r.added} stamp${r.added === 1 ? '' : 's'}${r.kind === 'bonus' ? ' (bonus)' : ''}.` });
      setCode(''); router.refresh();
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  }
  return (
    <form className="stack" onSubmit={submit}>
      <div className="row">
        <input className="grow code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="123 456"
          autoComplete="one-time-code" autoCapitalize="characters" maxLength={9} aria-label="Code" required />
        <button className="btn" disabled={busy || code.replace(/[^A-Z0-9]/gi, '').length !== 6}>Add</button>
      </div>
      {msg && <div className={`banner small ${msg.ok ? 'good' : 'bad'}`}>{msg.text}</div>}
    </form>
  );
}

/** Lets a customer stop (or restart) WhatsApp offers from this business. */
export function OptInToggle({ slug, initial, business }: { slug: string; initial: boolean; business: string }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    try { setOn((await api(`/api/b/${slug}/card/optin`, { optIn: !on })).optIn); } catch { /* keep as is */ } finally { setBusy(false); }
  }
  return (
    <label className="check">
      <input type="checkbox" checked={on} disabled={busy} onChange={toggle} />
      <span>WhatsApp messages about rewards and offers from {business}</span>
    </label>
  );
}

/** Ask the business on WhatsApp to send a friend a gift card; payment is sorted out with staff. */
export function GiftFriend({ bizName, waNumber, currency, me }: { bizName: string; waNumber: string; currency: string; me: string }) {
  const presets = currency === 'Rp' ? [50000, 100000, 200000] : [25, 50, 100];
  const [isMember, setIsMember] = useState(true);
  const [friend, setFriend] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [amount, setAmount] = useState(presets[1]);
  const fmt = (n: number) => `${currency} ${n.toLocaleString(currency === 'Rp' ? 'id-ID' : 'en-US')}`;
  const to = isMember ? (friend.trim() ? `@${friend.trim().replace(/^@/, '')}` : '') : (friendName.trim() && friendPhone.trim() ? `${friendName.trim()} (WhatsApp ${friendPhone.trim()})` : '');
  const ready = !!to && amount > 0;
  const text = `Hi ${bizName}! I'm @${me} and I'd like to send a gift card for ${fmt(amount)} to my friend ${to}. How can I pay?`;
  return (
    <div className="stack">
      <div className="seg">
        <button type="button" aria-pressed={isMember} onClick={() => setIsMember(true)}>They have a card</button>
        <button type="button" aria-pressed={!isMember} onClick={() => setIsMember(false)}>They&apos;re new</button>
      </div>
      {isMember
        ? <input value={friend} onChange={(e) => setFriend(e.target.value)} placeholder="Friend's username" autoCapitalize="none" autoCorrect="off" />
        : <div className="row"><input className="grow" value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Friend's name" />
            <input className="grow" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} inputMode="tel" placeholder="+61 412 345 678" /></div>}
      <div className="row wrap-row">
        {presets.map((p) => (
          <button key={p} type="button" className={`btn small ${amount === p ? '' : 'ghost'}`} onClick={() => setAmount(p)}>{fmt(p)}</button>
        ))}
        <input type="number" inputMode="numeric" min={1} value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: 130 }} aria-label="Other amount" />
      </div>
      <a className={`btn block ${ready ? '' : 'disabled'}`} aria-disabled={!ready} target="_blank" rel="noopener noreferrer"
        href={ready ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}` : undefined}>
        Ask {bizName} on WhatsApp →
      </a>
      <p className="tiny muted">You&apos;ll sort out payment with the team, then they send the gift to your friend.</p>
    </div>
  );
}
