'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import { FONTS, STAMP_ICONS, TEXTURES } from '@/lib/options';
import StampIcon from '../StampIcon';
import Stamp from '../Stamp';
import type { Toast } from './StaffConsole';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS: [string, string][] = [
  ['bg', 'Background'], ['surface', 'Cards'], ['ink', 'Text'], ['muted', 'Soft text'], ['accent', 'Brand colour'], ['accentInk', 'Text on brand colour'],
];

export default function SettingsTab({ slug, toast }: { slug: string; toast: Toast }) {
  const [name, setName] = useState('');
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { api(`/api/b/${slug}/admin/settings`).then((r) => { setName(r.name); setS(r.settings); }); }, [slug]);
  if (!s) return <p className="muted">Loading…</p>;

  /** set('spin.weekly', true) */
  const set = (path: string, value: any) =>
    setS((prev: any) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let o = next;
      for (const k of keys.slice(0, -1)) o = o[k];
      o[keys[keys.length - 1]] = value;
      return next;
    });
  const num = (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => set(path, e.target.value === '' ? '' : Number(e.target.value));
  const Check = ({ path, label }: { path: string; label: string }) => {
    const v = path.split('.').reduce((o, k) => o?.[k], s);
    return <label className="check"><input type="checkbox" checked={!!v} onChange={(e) => set(path, e.target.checked)} /><span>{label}</span></label>;
  };
  const totalWeight = s.spin.prizes.reduce((a: number, p: any) => a + (Number(p.weight) || 0), 0) || 1;

  async function save() {
    setBusy(true); setErr('');
    try {
      const r = await api(`/api/b/${slug}/admin/settings`, { name, settings: s });
      setS(r.settings); toast('Saved. Refresh the customer page to see it.');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      {/* Preview */}
      <div className={`card ${s.bgImageUrl ? 'has-photo' : `tx-${s.texture}`}`} style={{
        ...(s.bgImageUrl ? { backgroundImage: `linear-gradient(rgba(18,12,8,.38), rgba(18,12,8,.5)), url("${s.bgImageUrl}")` } : {}),
        ['--bg' as any]: s.colors.bg, ['--surface' as any]: s.colors.surface, ['--ink' as any]: s.colors.ink,
        ['--muted' as any]: s.colors.muted, ['--accent' as any]: s.colors.accent, ['--accent-ink' as any]: s.colors.accentInk,
        backgroundColor: s.colors.bg, color: s.colors.ink,
      }}>
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${(FONTS as any)[s.font]?.google}&display=swap`} />
        <div className="stack" style={{ fontFamily: (FONTS as any)[s.font]?.body }}>
          <div className="row">
            {s.logoUrl
              ? <img src={s.logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }} /> // eslint-disable-line @next/next/no-img-element
              : <span style={{ width: 40, height: 40, borderRadius: 10, background: s.colors.ink, color: s.colors.bg, display: 'grid', placeItems: 'center' }}><StampIcon icon={s.stampIcon} size={22} /></span>}
            <div>
              <div style={{ fontFamily: (FONTS as any)[s.font]?.head, fontWeight: 700, fontSize: '1.3rem' }}>{name || 'Business'}</div>
              <div className="small" style={{ color: s.colors.muted }}>{s.tagline}</div>
            </div>
          </div>
          <div className="card flat" style={{ background: s.colors.surface }}>
            <div className="stamps" style={{ ['--cols' as any]: 6 }}>
              {Array.from({ length: 6 }, (_, i) => <div key={i} className={`slot ${s.stampImageUrl ? 'img' : ''} ${i < 3 ? 'on' : ''}`}><Stamp icon={s.stampIcon} image={s.stampImageUrl} size={20} /></div>)}
            </div>
          </div>
          <span className="btn" style={{ alignSelf: 'start' }}>Spin</span>
        </div>
      </div>

      <fieldset>
        <legend>Brand</legend>
        <div className="grid2">
          <label>Business name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Tagline<input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} maxLength={80} /></label>
        </div>
        <label>Logo image link (https, square PNG works best)<input value={s.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…/logo.png" /></label>
        <label>Background photo link (optional, replaces the texture)<input value={s.bgImageUrl} onChange={(e) => set('bgImageUrl', e.target.value)} placeholder="https://…/background.jpg" /></label>
        <label>Custom stamp image link (optional, e.g. your logo as a transparent PNG)<input value={s.stampImageUrl} onChange={(e) => set('stampImageUrl', e.target.value)} placeholder="https://…/stamp.png" /></label>
        <div className="grid3">
          {COLORS.map(([k, l]) => (
            <label key={k}>{l}<input type="color" value={s.colors[k]} onChange={(e) => set(`colors.${k}`, e.target.value)} /></label>
          ))}
        </div>
        <div className="grid3">
          <label>Font<select value={s.font} onChange={(e) => set('font', e.target.value)}>
            {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}</select></label>
          <label>Background texture<select value={s.texture} onChange={(e) => set('texture', e.target.value)}>
            {TEXTURES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <span className="small" style={{ fontWeight: 600 }}>Stamp icon</span>
          <div className="row wrap-row">
            {STAMP_ICONS.map((i) => (
              <button key={i} type="button" onClick={() => set('stampIcon', i)} aria-label={i} aria-pressed={s.stampIcon === i}
                className={`btn small ${s.stampIcon === i ? '' : 'ghost'}`} style={{ width: 48, padding: 0 }}><StampIcon icon={i} size={22} /></button>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Stamp card</legend>
        <div className="grid2">
          <label>What earns a stamp (one)<input value={s.itemWord} onChange={(e) => set('itemWord', e.target.value)} placeholder="coffee, cut, class" /></label>
          <label>Plural<input value={s.itemWordPlural} onChange={(e) => set('itemWordPlural', e.target.value)} placeholder="coffees, cuts, classes" /></label>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <span className="small" style={{ fontWeight: 600 }}>Rewards (up to 4 tiers)</span>
          {s.rewards.map((r: any, i: number) => (
            <div key={i} className="row">
              <input type="number" min={1} max={50} value={r.stamps} style={{ width: 90 }} aria-label="Stamps needed"
                onChange={(e) => set('rewards', s.rewards.map((x: any, j: number) => (j === i ? { ...x, stamps: Number(e.target.value) } : x)))} />
              <span className="small muted">stamps =</span>
              <input className="grow" value={r.label} aria-label="Reward"
                onChange={(e) => set('rewards', s.rewards.map((x: any, j: number) => (j === i ? { ...x, label: e.target.value } : x)))} />
              {s.rewards.length > 1 && <button type="button" className="btn ghost small" onClick={() => set('rewards', s.rewards.filter((_: any, j: number) => j !== i))}>✕</button>}
            </div>
          ))}
          {s.rewards.length < 4 && <button type="button" className="btn ghost small" style={{ justifySelf: 'start' }}
            onClick={() => set('rewards', [...s.rewards, { stamps: Math.max(...s.rewards.map((r: any) => r.stamps)) + 4, label: 'New reward' }])}>+ Add tier</button>}
        </div>
        <div className="grid3">
          <label>Welcome stamps<input type="number" min={0} max={5} value={s.welcomeStamps} onChange={num('welcomeStamps')} /></label>
          <label>Max stamps per scan<input type="number" min={1} max={20} value={s.maxPerVisit} onChange={num('maxPerVisit')} /></label>
          <label>Country code for 0 numbers<input value={s.defaultCountryCode} onChange={(e) => set('defaultCountryCode', e.target.value.replace(/\D/g, ''))} /></label>
        </div>
        <label>Timezone<input value={s.timezone} onChange={(e) => set('timezone', e.target.value)} placeholder="Asia/Makassar" /></label>
      </fieldset>

      <fieldset>
        <legend>Bonus stamps</legend>
        <Check path="social.enabled" label="Stamps for social media posts" />
        {s.social.enabled && (
          <div className="grid3">
            <label>Stamps per post<input type="number" min={1} max={10} value={s.social.stamps} onChange={num('social.stamps')} /></label>
            <label>Days between posts<input type="number" min={0} max={60} value={s.social.cooldownDays} onChange={num('social.cooldownDays')} /></label>
            <label>Handle to tag<input value={s.social.handle} onChange={(e) => set('social.handle', e.target.value)} placeholder="@yourbusiness" /></label>
          </div>
        )}
        <hr />
        <Check path="doubleHours.enabled" label="Double stamp hours (quiet times)" />
        {s.doubleHours.enabled && (
          <>
            <div className="grid3">
              <label>From<input type="time" value={s.doubleHours.start} onChange={(e) => set('doubleHours.start', e.target.value)} /></label>
              <label>To<input type="time" value={s.doubleHours.end} onChange={(e) => set('doubleHours.end', e.target.value)} /></label>
            </div>
            <div className="row wrap-row">
              {DAYS.map((d, i) => (
                <label key={d} className="check small"><input type="checkbox" checked={s.doubleHours.days.includes(i)}
                  onChange={(e) => set('doubleHours.days', e.target.checked ? [...s.doubleHours.days, i] : s.doubleHours.days.filter((x: number) => x !== i))} />{d}</label>
              ))}
            </div>
          </>
        )}
        <hr />
        <Check path="streak.enabled" label="Streak bonus (+1 stamp)" />
        {s.streak.enabled && (
          <div className="grid3">
            <label>Visits<input type="number" min={2} max={10} value={s.streak.visits} onChange={num('streak.visits')} /></label>
            <label>Within days<input type="number" min={2} max={30} value={s.streak.days} onChange={num('streak.days')} /></label>
          </div>
        )}
        <hr />
        <Check path="referral.enabled" label="Refer a friend (both get stamps after the friend's first visit)" />
        {s.referral.enabled && <label style={{ maxWidth: 200 }}>Stamps each<input type="number" min={1} max={5} value={s.referral.stamps} onChange={num('referral.stamps')} /></label>}
        <hr />
        <Check path="birthday.enabled" label="Birthday treat" />
        {s.birthday.enabled && (
          <div className="grid3">
            <label>Treat<input value={s.birthday.label} onChange={(e) => set('birthday.label', e.target.value)} /></label>
            <label>Days either side<input type="number" min={0} max={14} value={s.birthday.windowDays} onChange={num('birthday.windowDays')} /></label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Spin to win</legend>
        <Check path="spin.enabled" label="Spin to win" />
        {s.spin.enabled && (
          <>
            <Check path="spin.onRedeem" label="Give a spin every time a reward is claimed" />
            <Check path="spin.weekly" label="Give 1 spin a week to members who visited that week" />
            <label style={{ maxWidth: 220 }}>Prize voucher lasts (days)<input type="number" min={1} max={60} value={s.spin.voucherDays} onChange={num('spin.voucherDays')} /></label>
            <div className="scroll-x">
              <table className="table">
                <thead><tr><th>Prize</th><th>Type</th><th>% off</th><th>Weight</th><th>Chance</th><th></th></tr></thead>
                <tbody>
                  {s.spin.prizes.map((p: any, i: number) => {
                    const upd = (k: string, v: any) => set('spin.prizes', s.spin.prizes.map((x: any, j: number) => (j === i ? { ...x, [k]: v } : x)));
                    return (
                      <tr key={i}>
                        <td><input value={p.label} onChange={(e) => upd('label', e.target.value)} maxLength={24} style={{ minWidth: 120 }} /></td>
                        <td><select value={p.kind} onChange={(e) => upd('kind', e.target.value)}><option value="percent">% off</option><option value="item">Free item</option></select></td>
                        <td>{p.kind === 'percent' ? <input type="number" min={1} max={100} value={p.value} onChange={(e) => upd('value', Number(e.target.value))} style={{ width: 80 }} /> : '-'}</td>
                        <td><input type="number" min={0} max={1000} value={p.weight} onChange={(e) => upd('weight', Number(e.target.value))} style={{ width: 80 }} /></td>
                        <td>{Math.round(((Number(p.weight) || 0) / totalWeight) * 1000) / 10}%</td>
                        <td>{s.spin.prizes.length > 2 && <button type="button" className="btn ghost small" onClick={() => set('spin.prizes', s.spin.prizes.filter((_: any, j: number) => j !== i))}>✕</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {s.spin.prizes.length < 10 && <button type="button" className="btn ghost small" style={{ justifySelf: 'start' }}
              onClick={() => set('spin.prizes', [...s.spin.prizes, { label: '5% off', kind: 'percent', value: 5, weight: 10 }])}>+ Add prize</button>}
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>WhatsApp reminders</legend>
        <Check path="nudges.enabled" label="Message opted-in members when they're 1 stamp from a reward, and before vouchers expire" />
        {s.nudges.enabled && <label style={{ maxWidth: 260 }}>Only if no visit for (days)<input type="number" min={1} max={30} value={s.nudges.afterDays} onChange={num('nudges.afterDays')} /></label>}
      </fieldset>

      <fieldset>
        <legend>Google reviews</legend>
        <p className="small muted">More 5-star reviews help you rank higher on Google Maps and get recommended by AI search. We ask regulars for a review on WhatsApp and on their card. Reviews are never rewarded with stamps, because Google's rules ban paying for reviews.</p>
        <Check path="reviews.enabled" label="Ask regulars for a Google review" />
        {s.reviews.enabled && (
          <div className="grid2">
            <label>Your Google review link<input value={s.reviews.googleUrl} onChange={(e) => set('reviews.googleUrl', e.target.value)} placeholder="https://g.page/r/…/review" /></label>
            <label>Ask after this many visits<input type="number" min={1} max={20} value={s.reviews.afterVisits} onChange={num('reviews.afterVisits')} /></label>
          </div>
        )}
        {s.reviews.enabled && <p className="tiny muted">Find your link in Google Business Profile: Ask for reviews, then copy the link.</p>}
      </fieldset>

      {err && <div className="banner bad">{err}</div>}
      <div className="row" style={{ position: 'sticky', bottom: 12 }}>
        <button className="btn huge grow" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        <a className="btn ghost huge" href={`/${slug}`} target="_blank" rel="noopener noreferrer">View</a>
      </div>
    </div>
  );
}
