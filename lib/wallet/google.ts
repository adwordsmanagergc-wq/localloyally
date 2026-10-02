import { SignJWT, importPKCS8 } from 'jose';
import { sql } from '../db';
import { appUrl, passData, type PassData } from './data';
import type { Business } from '../business';

const API = 'https://walletobjects.googleapis.com/walletobjects/v1';
const issuer = () => process.env.GOOGLE_WALLET_ISSUER_ID || '';
const email = () => process.env.GOOGLE_WALLET_SA_EMAIL || '';
const key = () => importPKCS8((process.env.GOOGLE_WALLET_SA_KEY || '').replace(/\\n/g, '\n'), 'RS256');

export const classId = (biz: Business) => `${issuer()}.${biz.slug}`;
export const objectId = (customerId: string) => `${issuer()}.${customerId}`;

function loyaltyClass(biz: Business) {
  return {
    id: classId(biz),
    issuerName: biz.name,
    programName: `${biz.name} Rewards`,
    programLogo: { sourceUri: { uri: `${appUrl()}/api/wallet/icon/${biz.slug}` }, contentDescription: { defaultValue: { language: 'en', value: biz.name } } },
    hexBackgroundColor: biz.settings.colors.accent,
    reviewStatus: 'UNDER_REVIEW',
  };
}

function loyaltyObject(biz: Business, customerId: string, d: PassData) {
  return {
    id: objectId(customerId),
    classId: classId(biz),
    state: 'ACTIVE',
    accountId: customerId.slice(0, 8).toUpperCase(),
    accountName: d.name,
    loyaltyPoints: { label: 'Stamps', balance: { string: d.stamps } },
    barcode: { type: 'QR_CODE', value: d.code },
    textModulesData: [
      { id: 'status', header: d.status.startsWith('Ready') ? 'Reward ready' : 'Next reward', body: d.status.replace(/^Ready: /, '') || '-' },
      ...(d.vouchers.length ? [{ id: 'vouchers', header: 'Vouchers', body: d.vouchers.join(', ') }] : []),
      ...(d.news ? [{ id: 'news', header: `Latest from ${biz.name}`, body: d.news }] : []),
      { id: 'rewards', header: 'Rewards', body: d.rewards },
    ],
    linksModuleData: { uris: [{ id: 'card', uri: d.cardUrl, description: 'Open your card' }] },
  };
}

/** Link for the "Add to Google Wallet" button. Creates the class and card on Google's side when saved. */
export async function googleSaveUrl(biz: Business, customerId: string) {
  const d = await passData(biz, customerId);
  if (!d) return null;
  const jwt = await new SignJWT({
    iss: email(), aud: 'google', typ: 'savetowallet', origins: [appUrl()],
    payload: { loyaltyClasses: [loyaltyClass(biz)], loyaltyObjects: [loyaltyObject(biz, customerId, d)] },
  }).setProtectedHeader({ alg: 'RS256', typ: 'JWT' }).setIssuedAt().sign(await key());
  await sql`update customers set google_wallet = true where id = ${customerId}`;
  return `https://pay.google.com/gp/v/save/${jwt}`;
}

let token: { value: string; exp: number } | null = null;
async function accessToken() {
  if (token && token.exp > Date.now() + 60_000) return token.value;
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/wallet_object.issuer' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' }).setIssuer(email()).setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt().setExpirationTime('1h').sign(await key());
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Google token: ${JSON.stringify(j)}`);
  token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return token.value;
}

const call = async (method: string, path: string, body: unknown) =>
  fetch(`${API}${path}`, {
    method, signal: AbortSignal.timeout(8000), body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
  });

/** Updates the card on the customer's Android phone. With a message, also shows a notification. */
export async function pushGoogle(biz: Business, customerId: string, message?: string): Promise<boolean> {
  const [c] = await sql`select google_wallet from customers where id = ${customerId}`;
  if (!c?.google_wallet) return false;
  const d = await passData(biz, customerId);
  if (!d) return false;
  const res = await call('PUT', `/loyaltyObject/${objectId(customerId)}`, loyaltyObject(biz, customerId, d));
  if (res.status === 404) return false; // got the link but never saved it
  if (!res.ok) { console.error('Google Wallet update failed', await res.text()); return false; }
  if (message) {
    const m = await call('POST', `/loyaltyObject/${objectId(customerId)}/addMessage`, {
      message: { id: `m${Date.now()}`, header: biz.name, body: message, messageType: 'TEXT_AND_NOTIFY' },
    });
    if (!m.ok) console.error('Google Wallet message failed', await m.text());
  }
  return true;
}

/** Brand changes (name, colour, logo) after settings are saved. */
export async function updateGoogleClass(biz: Business) {
  const res = await call('PUT', `/loyaltyClass/${classId(biz)}`, loyaltyClass(biz));
  if (!res.ok && res.status !== 404) console.error('Google Wallet class update failed', await res.text());
}
