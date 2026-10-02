import webpush from 'web-push';
import { sql } from './db';

/** Phone notifications (web push). Needs VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY (npx web-push generate-vapid-keys). */
export const pushPublicKey = () => process.env.VAPID_PUBLIC_KEY || '';
export const pushEnabled = () => !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

let ready = false;
function setup() {
  if (!ready) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:aj@metatapdigital.com', process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
    ready = true;
  }
}

export type PushMessage = { title: string; body: string; url: string; icon?: string };

/** Sends to every phone the member turned notifications on for. Returns true if any got it. */
export async function sendPush(customerId: string, msg: PushMessage): Promise<boolean> {
  if (!pushEnabled()) return false;
  const subs = await sql`select endpoint, p256dh, auth from push_subscriptions where customer_id = ${customerId}`;
  if (!subs.length) return false;
  setup();
  const results = await Promise.all(subs.map(async (s: any) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(msg), { TTL: 60 * 60 * 24 });
      return true;
    } catch (e: any) {
      // 404/410: the phone turned notifications off or removed the app
      if (e?.statusCode === 404 || e?.statusCode === 410) await sql`delete from push_subscriptions where endpoint = ${s.endpoint}`; // gone for every card
      else console.error('Push failed', e?.statusCode ?? '', e?.body ?? e?.message);
      return false;
    }
  }));
  return results.some(Boolean);
}

/** After staff add stamps: tells the member what they now have, a spin they unlocked or a reward that's ready. */
export async function notifyStamps(biz: { name: string; slug: string; settings: any }, customerId: string, added: number, balance: number) {
  const s = biz.settings;
  const before = balance - added;
  const top = Math.max(...s.rewards.map((r: any) => r.stamps));
  const ready = s.rewards.filter((r: any) => before < r.stamps && balance >= r.stamps).map((r: any) => r.label);
  const half = Math.ceil(top / 2);
  const body = ready.length ? `🎉 ${ready.join(' or ')} is ready! Show your username at the counter to claim it.`
    : s.spin?.enabled && before < half && balance >= half ? `🎡 You're halfway there and unlocked a spin to win! Open your card to spin.`
    : `+${added} stamp${added === 1 ? '' : 's'}. You now have ${balance}.`;
  return sendPush(customerId, { title: biz.name, body, url: `/${biz.slug}/card`, icon: s.logoUrl || undefined });
}
