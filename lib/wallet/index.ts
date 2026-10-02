import type { Business } from '../business';

/** Pushes the latest card to the customer's Apple / Google Wallet. Filled in by the wallet feature. */
export async function syncWallet(_biz: Business, _customerId: string, _message?: string): Promise<boolean> {
  return false;
}
