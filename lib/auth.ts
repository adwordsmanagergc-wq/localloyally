import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { sql } from './db';

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET missing or too short');
  return s;
};
const key = () => new TextEncoder().encode(secret());

export async function signToken(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(expiresIn).sign(key());
}

export async function verifyToken<T = any>(token: string | undefined | null): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return payload as T;
  } catch {
    return null;
  }
}

const customerCookie =(bizId: string) => `rrc_${bizId.slice(0, 8)}`;
const staffCookie = (bizId: string) => `rrs_${bizId.slice(0, 8)}`;
export const PLATFORM_COOKIE = 'rr_platform';

const cookieOpts = (maxAge: number) => ({
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge,
});

export async function setCustomerSession(bizId: string, customerId: string) {
  const token = await signToken({ sub: customerId, biz: bizId, typ: 'customer' }, '180d');
  (await cookies()).set(customerCookie(bizId), token, cookieOpts(60 * 60 * 24 * 180));
}
export async function clearCustomerSession(bizId: string) {
  (await cookies()).delete(customerCookie(bizId));
}

export async function getCustomerId(bizId: string): Promise<string | null> {
  const p = await verifyToken((await cookies()).get(customerCookie(bizId))?.value);
  if (p?.typ !== 'customer' || p.biz !== bizId) return null;
  const [c] = await sql`select id from customers where id = ${p.sub as string} and business_id = ${bizId}`;
  return c ? (c.id as string) : null;
}

export async function setStaffSession(bizId: string, staffId: string) {
  const token = await signToken({ sub: staffId, biz: bizId, typ: 'staff' }, '14h');
  (await cookies()).set(staffCookie(bizId), token, cookieOpts(60 * 60 * 14));
}
export async function clearStaffSession(bizId: string) {
  (await cookies()).delete(staffCookie(bizId));
}

export type StaffUser = { id: string; name: string; role: 'staff' | 'manager' };

export async function getStaff(bizId: string): Promise<StaffUser | null> {
  const p = await verifyToken((await cookies()).get(staffCookie(bizId))?.value);
  if (p?.typ !== 'staff' || p.biz !== bizId) return null;
  const rows = await sql`select id, name, role from staff where id = ${p.sub as string} and business_id = ${bizId} and active`;
  return (rows[0] as StaffUser) ?? null;
}

/** Platform owner (you). Password comes from PLATFORM_ADMIN_PASSWORD. */
export async function setPlatformSession() {
  const token = await signToken({ typ: 'platform' }, '7d');
  (await cookies()).set(PLATFORM_COOKIE, token, cookieOpts(60 * 60 * 24 * 7));
}
export async function isPlatformAdmin() {
  const p = await verifyToken((await cookies()).get(PLATFORM_COOKIE)?.value);
  return p?.typ === 'platform';
}
export function checkPlatformPassword(pw: string) {
  const real = process.env.PLATFORM_ADMIN_PASSWORD || '';
  if (real.length < 8) return false;
  const a = createHmac('sha256', 'x').update(pw).digest();
  const b = createHmac('sha256', 'x').update(real).digest();
  return timingSafeEqual(a, b);
}

/** Short-lived token shown as the customer's QR code. */
export async function cardToken(bizId: string, customerId: string) {
  return signToken({ sub: customerId, biz: bizId, typ: 'card' }, '10m');
}
export async function readCardToken(bizId: string, token: string) {
  const p = await verifyToken(token);
  return p?.typ === 'card' && p.biz === bizId ? (p.sub as string) : null;
}

export function hashOtp(bizId: string, phone: string, code: string) {
  return createHmac('sha256', secret()).update(`${bizId}:${phone}:${code}`).digest('hex');
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pin, salt, 32).toString('hex')}`;
}
export function checkPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(pin, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}
