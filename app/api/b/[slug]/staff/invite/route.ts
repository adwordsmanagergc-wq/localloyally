import { inviteStampCap, inviteStamps } from '@/lib/business';
import { canGiveBlackCard } from '@/lib/blackcard';
import { cleanInviteItem, staffInviteLink, type InviteChoice } from '@/lib/invites';
import { staffRoute, body } from '@/lib/route';
import { json, rateLimit } from '@/lib/util';

/** A fresh one-off invite link (works once, for 24 hours) with the gift the staff member picked. */
export const POST = staffRoute(async (req, biz, staff) => {
  if (!biz.settings.staffInvite.enabled) return json({ error: 'Staff invites are switched off in Settings' }, 400);
  const b = await body(req);
  if (b.gift === 'black' && !(await canGiveBlackCard(staff.id))) return json({ error: 'Only Andy can send a black card' }, 403);
  const gift = b.gift === 'black' ? 'black' : b.gift === 'stamps' && inviteStamps(biz.settings) > 0 ? 'stamps' : 'voucher';
  if (!(await rateLimit(`staff-invite:${staff.id}`, 40, 86400))) return json({ error: 'You can send 40 invites a day. Try again tomorrow.' }, 429);
  // Managers can choose how many head-start stamps, or which free item; staff send the defaults from Settings
  const choice: InviteChoice = {};
  if (staff.role === 'manager') {
    const n = Math.round(Number(b.stamps));
    if (gift === 'stamps' && n >= 1) choice.stamps = Math.min(n, inviteStampCap(biz.settings), 35); // one base-36 character in the code
    const item = cleanInviteItem(b.item);
    if (gift === 'voucher' && item.length >= 2) choice.item = item;
  }
  return json({ link: staffInviteLink(biz, staff.id, gift, choice) });
});
