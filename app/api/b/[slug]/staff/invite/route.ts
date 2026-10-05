import { inviteStamps } from '@/lib/business';
import { staffInviteLink } from '@/lib/invites';
import { staffRoute, body } from '@/lib/route';
import { json, rateLimit } from '@/lib/util';

/** A fresh one-off invite link (works once, for 24 hours) with the gift the staff member picked. */
export const POST = staffRoute(async (req, biz, staff) => {
  if (!biz.settings.staffInvite.enabled) return json({ error: 'Staff invites are switched off in Settings' }, 400);
  const b = await body(req);
  const gift = b.gift === 'stamps' && inviteStamps(biz.settings) > 0 ? 'stamps' : 'voucher';
  if (!(await rateLimit(`staff-invite:${staff.id}`, 40, 86400))) return json({ error: 'You can send 40 invites a day. Try again tomorrow.' }, 429);
  return json({ link: staffInviteLink(biz, staff.id, gift) });
});
