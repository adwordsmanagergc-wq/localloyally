'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, uiLock } from '@/lib/client';

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`;
}

export default function SpinWheel({ slug, prizes, voucherDays }: { slug: string; prizes: string[]; voucherDays: number }) {
  const router = useRouter();
  const [rot, setRot] = useState(0);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const rotRef = useRef(0);
  const n = prizes.length;
  const seg = (2 * Math.PI) / n;

  async function go() {
    setBusy(true); setErr(''); setWon(null);
    uiLock.busy = true;
    try {
      const r = await api(`/api/b/${slug}/card/spin`, {});
      const center = (r.index + 0.5) * (360 / n);
      const jitter = (Math.random() - 0.5) * (360 / n) * 0.6;
      const current = rotRef.current % 360;
      const target = rotRef.current - current + 360 * 6 + (360 - center) + jitter;
      rotRef.current = target;
      setRot(target);
      setTimeout(() => { setWon(r.prize.label); setBusy(false); }, 4300);
    } catch (e: any) { setErr(e.message); setBusy(false); uiLock.busy = false; }
  }

  return (
    <div className="stack">
      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <svg viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)` }} role="img" aria-label="Prize wheel">
          {prizes.map((label, i) => {
            const mid = (i + 0.5) * seg;
            const tx = 100 + 62 * Math.sin(mid), ty = 100 - 62 * Math.cos(mid);
            return (
              <g key={i}>
                <path d={arc(100, 100, 98, i * seg, (i + 1) * seg)} fill={i % 2 ? 'var(--surface)' : 'var(--accent)'} stroke="var(--ink)" strokeOpacity=".15" />
                <text x={tx} y={ty} fill={i % 2 ? 'var(--ink)' : 'var(--accent-ink)'} fontSize={n > 7 ? 8 : 10} fontWeight="700"
                  textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(mid * 180) / Math.PI} ${tx} ${ty})`}>
                  {label}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="14" fill="var(--ink)" />
        </svg>
      </div>
      {won ? (
        <div className="stack">
          <div className="banner good"><strong>You won {won}!</strong> It's in your vouchers for {voucherDays} days.</div>
          <button className="btn block" onClick={() => { setWon(null); uiLock.busy = false; router.refresh(); }}>Nice</button>
        </div>
      ) : (
        <button className="btn block" onClick={go} disabled={busy}>{busy ? 'Spinning…' : 'Spin'}</button>
      )}
      {err && <div className="banner bad small">{err}</div>}
    </div>
  );
}
