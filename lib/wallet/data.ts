import { randomBytes } from 'node:crypto';
import { sql } from '../db';
import { customerSummary } from '../loyalty';
import type { Business } from '../business';
import { siteUrl } from '../site';

export const appUrl = siteUrl;

/** Wallet cards can't refresh like the web QR, so they carry a fixed code. Prefix tells the scanner what it is. */
export const WALLET_PREFIX = 'RW1:';

export async function ensureWalletToken(customerId: string): Promise<string> {
  const [c] = await sql`update customers set wallet_token = coalesce(wallet_token, ${randomBytes(18).toString('base64url')})
    where id = ${customerId} returning wallet_token`;
  return c.wallet_token;
}

export async function customerByWalletCode(bizId: string, scanned: string) {
  if (!scanned.startsWith(WALLET_PREFIX)) return null;
  const [c] = await sql`select id from customers where business_id = ${bizId} and wallet_token = ${scanned.slice(WALLET_PREFIX.length)}`;
  return (c?.id as string) ?? null;
}

/** Everything a wallet card shows, worked out once for both Apple and Google. */
export async function passData(biz: Business, customerId: string) {
  const sum = await customerSummary(biz, customerId);
  if (!sum) return null;
  const [c] = await sql`select wallet_token, wallet_news, wallet_updated_at from customers where id = ${customerId}`;
  const s = biz.settings;
  const next = s.rewards.find((r) => sum.balance < r.stamps);
  const earned = s.rewards.filter((r) => sum.balance >= r.stamps).map((r) => r.label);
  return {
    name: sum.customer.name as string,
    stamps: sum.balance > sum.maxTier ? String(sum.balance) : `${sum.balance} / ${sum.maxTier}`,
    status: earned.length ? `Ready: ${earned.join(' or ')}` : next ? `${next.stamps - sum.balance} more to ${next.label.toLowerCase()}` : '',
    vouchers: (sum.vouchers as any[]).map((v) => v.label as string),
    news: (c.wallet_news as string | null) ?? '',
    code: WALLET_PREFIX + (c.wallet_token ?? (await ensureWalletToken(customerId))),
    updatedAt: (c.wallet_updated_at as Date | null) ?? new Date(0),
    rewards: s.rewards.map((r) => `${r.stamps} stamps: ${r.label}`).join('\n'),
    cardUrl: `${appUrl()}/${biz.slug}/card`,
  };
}
export type PassData = NonNullable<Awaited<ReturnType<typeof passData>>>;
