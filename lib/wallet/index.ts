import { after } from 'next/server';
import { sql } from '../db';
import { pushApple } from './apple';
import { pushGoogle, updateGoogleClass } from './google';
import { appleWalletEnabled, googleWalletEnabled } from './config';
import type { Business } from '../business';

/**
 * Pushes the latest card to the customer's Apple / Google Wallet.
 * With a message (an offer), it also lands on their lock screen. Returns true if any wallet got it.
 */
export async function syncWallet(biz: Business, customerId: string, message?: string): Promise<boolean> {
  if (!appleWalletEnabled() && !googleWalletEnabled()) return false;
  const [c] = await sql`update customers set wallet_updated_at = now(), wallet_news = coalesce(${message ?? null}, wallet_news)
    where id = ${customerId} and wallet_token is not null returning id`;
  if (!c) return false; // never added the card to a wallet
  const [a, g] = await Promise.all([
    appleWalletEnabled() ? pushApple(customerId).catch((e) => { console.error('Apple Wallet push', e); return false; }) : false,
    googleWalletEnabled() ? pushGoogle(biz, customerId, message).catch((e) => { console.error('Google Wallet push', e); return false; }) : false,
  ]);
  return a || g;
}

/** Call from a route after stamps or vouchers change. Runs after the response, so staff aren't kept waiting. */
export function walletChanged(biz: Business, ...customerIds: (string | null | undefined)[]) {
  if (!appleWalletEnabled() && !googleWalletEnabled()) return;
  after(async () => { for (const id of customerIds) if (id) await syncWallet(biz, id); });
}

export function walletBrandChanged(biz: Business) {
  if (googleWalletEnabled()) after(() => updateGoogleClass(biz).catch((e) => console.error('Google Wallet class', e)));
}
