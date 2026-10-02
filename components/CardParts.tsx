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
  const router = useRouter();
  return (
    <button className="linkbtn small" onClick={async () => {
      await api(`/api/b/${slug}/auth/logout`, {}).catch(() => {});
      router.replace(`/${slug}`); router.refresh();
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
