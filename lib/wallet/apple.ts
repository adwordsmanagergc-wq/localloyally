import { connect } from 'node:http2';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PKPass } from 'passkit-generator';
import { sql } from '../db';
import { appUrl, passData } from './data';
import { walletImages } from './icon';
import type { Business } from '../business';

/** Keys from the Apple Developer account. PEM text; literal \n is accepted so they fit in one env line. */
const pem = (name: string) => (process.env[name] || '').replace(/\\n/g, '\n');
export const passTypeId = () => process.env.APPLE_PASS_TYPE_ID || '';

/** The per-pass secret Apple sends back when it asks for updates. Derived, so nothing to store. */
export const appleAuthToken = (customerId: string) =>
  createHmac('sha256', process.env.SESSION_SECRET || '').update(`apple-pass:${customerId}`).digest('base64url');
export function checkAppleAuth(req: Request, customerId: string) {
  const got = Buffer.from((req.headers.get('authorization') || '').replace(/^ApplePass /, ''));
  const want = Buffer.from(appleAuthToken(customerId));
  return got.length === want.length && timingSafeEqual(got, want);
}

const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) || 0).join(',')})`;

export async function buildApplePass(biz: Business, customerId: string) {
  const d = await passData(biz, customerId);
  if (!d) return null;
  const s = biz.settings;
  const images = await walletImages(biz);
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: passTypeId(),
    teamIdentifier: process.env.APPLE_TEAM_ID,
    organizationName: biz.name,
    description: `${biz.name} rewards card`,
    serialNumber: customerId,
    logoText: biz.name,
    backgroundColor: rgb(s.colors.accent),
    foregroundColor: rgb(s.colors.accentInk),
    labelColor: rgb(s.colors.accentInk),
    // Apple calls these to keep the pass up to date. Must be https in production.
    webServiceURL: `${appUrl()}/api/wallet/apple`,
    authenticationToken: appleAuthToken(customerId),
    storeCard: {},
  };
  const pass = new PKPass(
    { 'pass.json': Buffer.from(JSON.stringify(passJson)), ...images },
    { wwdr: pem('APPLE_WWDR_CERT'), signerCert: pem('APPLE_PASS_CERT'), signerKey: pem('APPLE_PASS_KEY'), signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined },
  );
  pass.headerFields.push({ key: 'stamps', label: 'STAMPS', value: d.stamps, changeMessage: 'You now have %@ stamps' });
  pass.primaryFields.push({ key: 'status', label: d.status.startsWith('Ready') ? 'REWARD READY' : 'NEXT REWARD', value: d.status.replace(/^Ready: /, '') });
  pass.secondaryFields.push({ key: 'name', label: 'MEMBER', value: d.name });
  if (d.vouchers.length) pass.secondaryFields.push({ key: 'vouchers', label: 'VOUCHERS', value: d.vouchers.join(', '), changeMessage: 'New voucher: %@' });
  // Changing this field is how offers reach the lock screen.
  pass.backFields.push({ key: 'news', label: 'Latest from ' + biz.name, value: d.news || 'No news yet', changeMessage: '%@' });
  pass.backFields.push({ key: 'rewards', label: 'Rewards', value: d.rewards });
  pass.backFields.push({ key: 'card', label: 'Your full card', value: d.cardUrl, attributedValue: `<a href="${d.cardUrl}">Open your card</a>` });
  pass.setBarcodes({ format: 'PKBarcodeFormatQR', message: d.code, messageEncoding: 'iso-8859-1' });
  const loc = s.location;
  if (loc.lat != null && loc.lng != null)
    pass.setLocations({ latitude: loc.lat, longitude: loc.lng, relevantText: `You're near ${biz.name}. Show this card for your stamps.` });
  return { buffer: pass.getAsBuffer(), updatedAt: d.updatedAt };
}

/** Tells the customer's iPhones to fetch the new pass. Apple sends an empty push to the pass type topic. */
export async function pushApple(customerId: string): Promise<boolean> {
  const devices = await sql`select d.device_id, d.push_token from apple_registrations r join apple_devices d on d.device_id = r.device_id
    where r.customer_id = ${customerId}`;
  if (!devices.length) return false;
  const session = connect('https://api.push.apple.com', { cert: pem('APPLE_PASS_CERT'), key: pem('APPLE_PASS_KEY'), passphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined });
  session.on('error', (e) => console.error('APNs connection error', e.message));
  try {
    const results = await Promise.all(devices.map((dv: any) => new Promise<boolean>((resolve) => {
      const req = session.request({ ':method': 'POST', ':path': `/3/device/${dv.push_token}`, 'apns-topic': passTypeId(), 'content-type': 'application/json' });
      const timer = setTimeout(() => { req.close(); resolve(false); }, 8000);
      req.on('response', async (h) => {
        clearTimeout(timer);
        const status = Number(h[':status']);
        if (status === 410) await sql`delete from apple_devices where device_id = ${dv.device_id}`; // phone removed the pass
        resolve(status === 200);
      });
      req.on('error', () => { clearTimeout(timer); resolve(false); });
      req.end('{}');
    })));
    return results.some(Boolean);
  } finally {
    session.close();
  }
}
