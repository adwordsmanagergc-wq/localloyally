import { createHmac } from 'node:crypto';
import { sql } from './db';
import { siteUrl } from './site';
import type { Business } from './business';

/**
 * Staff invites: each staff member has their own link they send from their own WhatsApp.
 * A new member who joins through it gets the welcome stamps as usual, plus a free item voucher.
 * The code is a keyed hash of the staff id, so no extra table is needed and it can't be guessed.
 */
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function staffInviteCode(staffId: string) {
  const h = createHmac('sha256', process.env.SESSION_SECRET || '').update(`staff-invite:${staffId}`).digest();
  return 'S' + Array.from(h.subarray(0, 7), (b) => CHARS[b % CHARS.length]).join('');
}

export const staffInviteLink = (biz: Business, staffId: string) =>
  `${siteUrl()}/${biz.slug}?join=1&invite=${staffInviteCode(staffId)}`;

export const cleanInviteCode = (raw: unknown) => String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

/** The active staff member an invite code belongs to, or null. */
export async function findInviter(bizId: string, raw: unknown): Promise<{ id: string; name: string } | null> {
  const code = cleanInviteCode(raw);
  if (!/^S[A-Z0-9]{7}$/.test(code)) return null;
  const staff = await sql`select id, name from staff where business_id = ${bizId} and active`;
  const s = staff.find((x) => staffInviteCode(x.id) === code);
  return s ? { id: s.id as string, name: s.name as string } : null;
}

/** Gives a brand new member the invite voucher and credits the staff member who sent it. Once per member. */
export async function claimStaffInvite(biz: Business, customerId: string, staffId: string) {
  const inv = biz.settings.staffInvite;
  if (!inv.enabled) return;
  await sql.begin(async (tx) => {
    await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
      values (${biz.id}, ${customerId}, ${inv.label}, 'item', 0, 'campaign', 'staff-invite',
              now() + make_interval(days => ${inv.days}::int))
      on conflict do nothing`;
    // The welcome stamps stay as they are; tagging them with the staff member shows who brought the member in.
    await tx`update stamps set staff_id = ${staffId}, note = 'Invited by staff'
      where customer_id = ${customerId} and reason = 'welcome' and staff_id is null`;
  });
}
