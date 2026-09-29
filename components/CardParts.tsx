'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, uiLock } from '@/lib/client';

export function CardQr({ slug }: { slug: string }) {
  const router = useRouter();
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api(`/api/b/${slug}/card/qr`);
        if (alive) { setSvg(r.svg); setErr(''); }
      } catch (e: any) {
        if (e.status === 401) router.replace(`/${slug}`);
        else if (alive) setErr('Offline? Pull down to refresh.');
      }
    };
    load();
    const t = setInterval(load, 4 * 60 * 1000);
    // Refresh stamps when they come back to the app after being scanned
    const onVis = () => { if (document.visibilityState === 'visible') { load(); if (!uiLock.busy) router.refresh(); } };
    document.addEventListener('visibilitychange', onVis);
    const poll = setInterval(() => { if (!uiLock.busy && document.visibilityState === 'visible') router.refresh(); }, 20000);
    return () => { alive = false; clearInterval(t); clearInterval(poll); document.removeEventListener('visibilitychange', onVis); };
  }, [slug, router]);

  return (
    <div className="stack">
      <div className="qrbox" aria-label="Your member QR code">
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <div style={{ aspectRatio: '1' }} />}
      </div>
      {err && <p className="small muted">{err}</p>}
    </div>
  );
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
