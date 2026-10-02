import { sql } from '@/lib/db';
import { createGift, giftJoinUrl, giftUrl } from '@/lib/gifts';
import { staffRoute, body } from '@/lib/route';
import { json } from '@/lib/util';
import { money } from '@/lib/money';

export const dynamic = 'force-dynamic';
export const GET = staffRoute(async (_req, biz) => {
  const items = await sql`select g.id, g.code, g.kind, g.label, g.amount, g.balance, g.to_name, g.from_name, g.void,
      g.expires_at, g.created_at, (g.expires_at < now()) expired, s.name sold_by
    from gift_cards g left join staff s on s.id = g.created_by
    where g.business_id = ${biz.id} order by g.created_at desc limit 50`;
  return json({ items });
});

export const POST = staffRoute(async (req, biz, staff) => {
  const { gift, member, from, toPhone } = await createGift(biz, staff.id, await body(req));
  const url = giftUrl(biz, gift.code);
  const what = gift.kind === 'item' ? `a ${gift.label} at ${biz.name}` : `a ${biz.name} gift card for ${money(biz.settings.currency, gift.amount)}`;
  const fromWho = gift.from_name ? `${gift.from_name} sent you` : "You've got";
  const note = gift.message ? `"${gift.message}"\n` : '';
  // Managers get a ready-made WhatsApp to whoever it's for
  let whatsapp: string | null = null;
  if (staff.role === 'manager' && member) {
    const text = `Hi ${member.username}! ${fromWho} ${what} 🎁\n${note}It's on your card now, or open it here: ${url}`;
    whatsapp = `https://wa.me/${member.phone}?text=${encodeURIComponent(text)}`;
  } else if (staff.role === 'manager' && toPhone) {
    const text = `Hi${gift.to_name ? ` ${gift.to_name}` : ''}! ${fromWho} ${what} 🎁\n${note}`
      + `Sign up here to collect it on your rewards card (it takes 30 seconds): ${giftJoinUrl(biz, gift.code, from?.ref_code)}`;
    whatsapp = `https://wa.me/${toPhone}?text=${encodeURIComponent(text)}`;
  }
  return json({ gift, url, member: member ? { username: member.username } : null, invite: !member && !!toPhone, whatsapp });
});

/** Managers can cancel a certificate, e.g. a refund. */
export const PATCH = staffRoute(async (req, biz, staff) => {
  if (staff.role !== 'manager') return json({ error: 'Managers only' }, 403);
  const b = await body(req);
  const [g] = await sql`update gift_cards set void = ${b.void === true} where id = ${String(b.id)} and business_id = ${biz.id} returning id`;
  return g ? json({ ok: true }) : json({ error: 'Not found' }, 404);
});
