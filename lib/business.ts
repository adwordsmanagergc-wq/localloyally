import { cache } from 'react';
import { sql } from './db';

export type Prize = { label: string; kind: 'percent' | 'item'; value: number; weight: number };
export type RewardTier = { stamps: number; label: string };

import { FONTS, STAMP_ICONS, TEXTURES } from './options';
export { FONTS, STAMP_ICONS, TEXTURES };

export const DEFAULT_SETTINGS = {
  // Look
  tagline: 'Collect stamps, get rewarded',
  logoUrl: '',
  bgImageUrl: '', // photo background, e.g. pebbles. Overrides texture
  stampImageUrl: '', // custom stamp, e.g. the business logo. Overrides stampIcon
  colors: { bg: '#e9e6e1', surface: '#f6f4f0', ink: '#1f1c19', muted: '#6f6a63', accent: '#6b4a2f', accentInk: '#ffffff' },
  font: 'classic' as keyof typeof FONTS,
  texture: 'pebble' as (typeof TEXTURES)[number],
  stampIcon: 'bean' as (typeof STAMP_ICONS)[number],
  // Words
  itemWord: 'coffee',
  itemWordPlural: 'coffees',
  // Program
  timezone: 'Asia/Makassar',
  defaultCountryCode: '62',
  rewards: [{ stamps: 8, label: 'Free coffee' }] as RewardTier[],
  welcomeStamps: 1,
  maxPerVisit: 6,
  social: { enabled: true, stamps: 2, cooldownDays: 7, handle: '' },
  doubleHours: { enabled: false, start: '14:00', end: '16:00', days: [1, 2, 3, 4, 5] as number[] },
  streak: { enabled: true, visits: 3, days: 7 },
  referral: { enabled: true, stamps: 1 },
  spin: {
    enabled: true, weekly: true, onRedeem: true, halfway: false, voucherDays: 7,
    prizes: [
      { label: '5% off', kind: 'percent', value: 5, weight: 40 },
      { label: '10% off', kind: 'percent', value: 10, weight: 25 },
      { label: '15% off', kind: 'percent', value: 15, weight: 15 },
      { label: 'Free pastry', kind: 'item', value: 0, weight: 10 },
      { label: 'Free coffee', kind: 'item', value: 0, weight: 8 },
      { label: '50% off', kind: 'percent', value: 50, weight: 2 },
    ] as Prize[],
  },
  birthday: { enabled: true, windowDays: 3, label: 'Birthday treat' },
  nudges: { enabled: true, afterDays: 3 },
  // Asks happy regulars for a Google review. Never rewarded (Google bans incentivised reviews).
  reviews: { enabled: true, googleUrl: '', afterVisits: 3 },
  currency: 'Rp',
  gifts: { enabled: true, validDays: 180 },
};
export type Settings = typeof DEFAULT_SETTINGS;
export type Business = { id: string; slug: string; name: string; active: boolean; settings: Settings };

/** Starting points for new clients. Everything can be changed afterwards. */
export const PRESETS: Record<string, { label: string; settings: Partial<Settings> }> = {
  cafe: { label: 'Cafe / coffee', settings: {} },
  matcha: {
    label: 'Matcha / tea bar',
    settings: {
      colors: { bg: '#e8ebe0', surface: '#f7f8f2', ink: '#1d2618', muted: '#66705c', accent: '#4f7a35', accentInk: '#ffffff' },
      stampIcon: 'leaf', itemWord: 'drink', itemWordPlural: 'drinks', font: 'editorial', texture: 'paper',
      rewards: [{ stamps: 8, label: 'Free matcha' }],
    },
  },
  restaurant: {
    label: 'Restaurant',
    settings: {
      colors: { bg: '#1c1917', surface: '#292524', ink: '#f5f0e8', muted: '#a8a29e', accent: '#e0772e', accentInk: '#1c1917' },
      stampIcon: 'star', itemWord: 'visit', itemWordPlural: 'visits', font: 'bold', texture: 'grid',
      rewards: [{ stamps: 5, label: 'Free starter' }, { stamps: 10, label: 'Free main' }],
      spin: { ...DEFAULT_SETTINGS.spin, prizes: [
        { label: '10% off', kind: 'percent', value: 10, weight: 45 }, { label: 'Free drink', kind: 'item', value: 0, weight: 25 },
        { label: 'Free dessert', kind: 'item', value: 0, weight: 18 }, { label: '20% off', kind: 'percent', value: 20, weight: 10 },
        { label: '50% off', kind: 'percent', value: 50, weight: 2 },
      ] },
    },
  },
  barber: {
    label: 'Barber / salon',
    settings: {
      colors: { bg: '#111418', surface: '#1b2027', ink: '#eef1f4', muted: '#94a0ad', accent: '#c9a45c', accentInk: '#111418' },
      stampIcon: 'scissors', itemWord: 'cut', itemWordPlural: 'cuts', font: 'modern', texture: 'none',
      rewards: [{ stamps: 6, label: 'Free haircut' }], welcomeStamps: 0,
      streak: { enabled: false, visits: 3, days: 7 },
      spin: { ...DEFAULT_SETTINGS.spin, weekly: false, prizes: [
        { label: '10% off', kind: 'percent', value: 10, weight: 50 }, { label: 'Free beard trim', kind: 'item', value: 0, weight: 25 },
        { label: '20% off', kind: 'percent', value: 20, weight: 20 }, { label: 'Free cut', kind: 'item', value: 0, weight: 5 },
      ] },
    },
  },
  beauty: {
    label: 'Beauty / spa / nails',
    settings: {
      colors: { bg: '#f4e9e6', surface: '#fcf6f4', ink: '#3a2226', muted: '#8a6d71', accent: '#b5566b', accentInk: '#ffffff' },
      stampIcon: 'heart', itemWord: 'treatment', itemWordPlural: 'treatments', font: 'editorial', texture: 'paper',
      rewards: [{ stamps: 6, label: '50% off a treatment' }, { stamps: 10, label: 'Free treatment' }],
    },
  },
  fitness: {
    label: 'Gym / studio / class',
    settings: {
      colors: { bg: '#0f1115', surface: '#181b22', ink: '#f2f4f8', muted: '#8b93a3', accent: '#c6f432', accentInk: '#0f1115' },
      stampIcon: 'bolt', itemWord: 'class', itemWordPlural: 'classes', font: 'bold', texture: 'grid',
      rewards: [{ stamps: 10, label: 'Free class' }], streak: { enabled: true, visits: 4, days: 7 },
    },
  },
  bakery: {
    label: 'Bakery / dessert',
    settings: {
      colors: { bg: '#f6ecdc', surface: '#fffaf1', ink: '#3b2a1a', muted: '#8c7560', accent: '#c46a2b', accentInk: '#ffffff' },
      stampIcon: 'slice', itemWord: 'treat', itemWordPlural: 'treats', font: 'rounded', texture: 'paper',
      rewards: [{ stamps: 6, label: 'Free pastry' }, { stamps: 12, label: 'Free cake slice' }],
    },
  },
};

const RESERVED = new Set(['api', 'platform', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'admin', 'login', 'static']);
export const validSlug = (s: string) => /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(s) && !RESERVED.has(s);

export function mergeSettings(saved: any): Settings {
  const d = DEFAULT_SETTINGS;
  const s = saved ?? {};
  return {
    ...d, ...s,
    colors: { ...d.colors, ...(s.colors ?? {}) },
    social: { ...d.social, ...(s.social ?? {}) },
    doubleHours: { ...d.doubleHours, ...(s.doubleHours ?? {}) },
    streak: { ...d.streak, ...(s.streak ?? {}) },
    referral: { ...d.referral, ...(s.referral ?? {}) },
    spin: { ...d.spin, ...(s.spin ?? {}), prizes: s.spin?.prizes?.length ? s.spin.prizes : d.spin.prizes },
    birthday: { ...d.birthday, ...(s.birthday ?? {}) },
    nudges: { ...d.nudges, ...(s.nudges ?? {}) },
    reviews: { ...d.reviews, ...(s.reviews ?? {}) },
    gifts: { ...d.gifts, ...(s.gifts ?? {}) },
    rewards: s.rewards?.length ? s.rewards : d.rewards,
  };
}

export const getBusiness = cache(async (slug: string): Promise<Business | null> => {
  if (!validSlug(slug)) return null;
  const [b] = await sql`select id, slug, name, active, settings from businesses where slug = ${slug}`;
  if (!b || !b.active) return null;
  return { ...(b as any), settings: mergeSettings(b.settings) };
});

export async function getBusinessById(id: string): Promise<Business | null> {
  const [b] = await sql`select id, slug, name, active, settings from businesses where id = ${id}`;
  return b ? { ...(b as any), settings: mergeSettings(b.settings) } : null;
}

/** Cleans everything coming from the settings form. Throws on bad input. */
export function validateSettings(input: any): Settings {
  const d = DEFAULT_SETTINGS;
  const int = (v: any, min: number, max: number, fb: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb;
  };
  const str = (v: any, max: number, fb = '') => (typeof v === 'string' ? v.trim().slice(0, max) : fb);
  const color = (v: any, fb: string) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : fb);
  const time = (v: any, fb: string) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fb);
  const bool = (v: any) => v === true;
  const pick = <T extends string>(v: any, list: readonly T[], fb: T): T => (list.includes(v) ? v : fb);

  const rewards: RewardTier[] = (Array.isArray(input.rewards) ? input.rewards : [])
    .filter((r: any) => r && str(r.label, 40))
    .map((r: any) => ({ stamps: int(r.stamps, 1, 50, 8), label: str(r.label, 40) }))
    .sort((a: RewardTier, b: RewardTier) => a.stamps - b.stamps)
    .slice(0, 4);
  if (!rewards.length) throw new Error('Add at least one reward');

  const prizes: Prize[] = (Array.isArray(input.spin?.prizes) ? input.spin.prizes : [])
    .filter((p: any) => p && str(p.label, 24))
    .slice(0, 10)
    .map((p: any) => ({
      label: str(p.label, 24),
      kind: p.kind === 'percent' ? 'percent' : 'item',
      value: p.kind === 'percent' ? int(p.value, 1, 100, 10) : 0,
      weight: int(p.weight, 0, 1000, 1),
    }));
  const spinEnabled = bool(input.spin?.enabled);
  if (spinEnabled && (prizes.length < 2 || prizes.every((p) => p.weight === 0)))
    throw new Error('Spin wheel needs at least 2 prizes with a chance above 0');

  let tz = str(input.timezone, 60, d.timezone);
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch { tz = d.timezone; }
  const img = (v: any) => {
    const u = str(v, 500);
    return u && (/^https:\/\//.test(u) || /^\/brands\/[\w./-]+$/.test(u)) ? u : '';
  };
  const logoUrl = img(input.logoUrl);

  return {
    tagline: str(input.tagline, 80, d.tagline),
    logoUrl,
    bgImageUrl: img(input.bgImageUrl),
    stampImageUrl: img(input.stampImageUrl),
    colors: {
      bg: color(input.colors?.bg, d.colors.bg), surface: color(input.colors?.surface, d.colors.surface),
      ink: color(input.colors?.ink, d.colors.ink), muted: color(input.colors?.muted, d.colors.muted),
      accent: color(input.colors?.accent, d.colors.accent), accentInk: color(input.colors?.accentInk, d.colors.accentInk),
    },
    font: pick(input.font, Object.keys(FONTS) as (keyof typeof FONTS)[], d.font),
    texture: pick(input.texture, TEXTURES, d.texture),
    stampIcon: pick(input.stampIcon, STAMP_ICONS, d.stampIcon),
    itemWord: str(input.itemWord, 20, d.itemWord) || d.itemWord,
    itemWordPlural: str(input.itemWordPlural, 20, d.itemWordPlural) || d.itemWordPlural,
    timezone: tz,
    defaultCountryCode: /^\d{1,4}$/.test(String(input.defaultCountryCode)) ? String(input.defaultCountryCode) : d.defaultCountryCode,
    rewards,
    welcomeStamps: int(input.welcomeStamps, 0, 5, d.welcomeStamps),
    maxPerVisit: int(input.maxPerVisit, 1, 20, d.maxPerVisit),
    social: {
      enabled: bool(input.social?.enabled), stamps: int(input.social?.stamps, 1, 10, d.social.stamps),
      cooldownDays: int(input.social?.cooldownDays, 0, 60, d.social.cooldownDays), handle: str(input.social?.handle, 40),
    },
    doubleHours: {
      enabled: bool(input.doubleHours?.enabled),
      start: time(input.doubleHours?.start, d.doubleHours.start),
      end: time(input.doubleHours?.end, d.doubleHours.end),
      days: Array.isArray(input.doubleHours?.days)
        ? [...new Set<number>(input.doubleHours.days.map(Number).filter((n: number) => Number.isInteger(n) && n >= 0 && n <= 6))]
        : d.doubleHours.days,
    },
    streak: { enabled: bool(input.streak?.enabled), visits: int(input.streak?.visits, 2, 10, 3), days: int(input.streak?.days, 2, 30, 7) },
    referral: { enabled: bool(input.referral?.enabled), stamps: int(input.referral?.stamps, 1, 5, 1) },
    spin: {
      enabled: spinEnabled, weekly: bool(input.spin?.weekly), onRedeem: bool(input.spin?.onRedeem), halfway: bool(input.spin?.halfway),
      voucherDays: int(input.spin?.voucherDays, 1, 60, 7), prizes: prizes.length >= 2 ? prizes : d.spin.prizes,
    },
    birthday: { enabled: bool(input.birthday?.enabled), windowDays: int(input.birthday?.windowDays, 0, 14, 3), label: str(input.birthday?.label, 40, d.birthday.label) || d.birthday.label },
    nudges: { enabled: bool(input.nudges?.enabled), afterDays: int(input.nudges?.afterDays, 1, 30, 3) },
    reviews: {
      enabled: bool(input.reviews?.enabled),
      googleUrl: (() => {
        const u = str(input.reviews?.googleUrl, 500);
        if (!u) return '';
        if (!/^https:\/\/(g\.page|maps\.app\.goo\.gl|search\.google\.com|www\.google\.[a-z.]+|maps\.google\.[a-z.]+|goo\.gl)\//.test(u))
          throw new Error("That doesn't look like a Google review link. Copy it from Google Business Profile > Ask for reviews.");
        return u;
      })(),
      afterVisits: int(input.reviews?.afterVisits, 1, 20, 3),
    },
    currency: str(input.currency, 6, d.currency) || d.currency,
    gifts: { enabled: bool(input.gifts?.enabled), validDays: int(input.gifts?.validDays, 7, 730, d.gifts.validDays) },
  };
}

export async function saveSettings(businessId: string, name: string, s: Settings) {
  await sql`update businesses set settings = ${sql.json(s as any)}, name = ${name} where id = ${businessId}`;
}

export const maxTier = (s: Settings) => Math.max(...s.rewards.map((r) => r.stamps));
export const minTier = (s: Settings) => Math.min(...s.rewards.map((r) => r.stamps));
/** Stamps needed for the halfway spin, e.g. 4 on an 8-stamp card. */
export const halfwayAt = (s: Settings) => Math.ceil(maxTier(s) / 2);

/** Local wall-clock parts in the business's timezone. */
export function localNow(tz: string, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return { time: `${hour}:${parts.minute}`, dow, year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

export function isDoubleHour(s: Settings, now = new Date()) {
  if (!s.doubleHours.enabled) return false;
  const l = localNow(s.timezone, now);
  return s.doubleHours.days.includes(l.dow) && l.time >= s.doubleHours.start && l.time < s.doubleHours.end;
}
