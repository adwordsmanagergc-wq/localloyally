import { sql } from './db';
import { randomRefCode } from './util';
import type { Business } from './business';

export type NewCard = {
  name: string; username: string | null; phone: string; passwordHash: string;
  birthdayMonth?: number | null; birthdayDay?: number | null; optIn: boolean; referredBy?: string | null;
};

/** Creates a card at a business, with its welcome stamps. Returns null if that number already has a card there. */
export async function createCard(biz: Business, c: NewCard): Promise<{ id: string } | null> {
  return sql.begin(async (tx) => {
    let row: any;
    for (let i = 0; i < 5 && !row; i++) {
      [row] = await tx`insert into customers (business_id, name, username, phone, password_hash, birthday_month, birthday_day,
          marketing_opt_in, ref_code, referred_by, terms_accepted_at)
        values (${biz.id}, ${c.name}, ${c.username}, ${c.phone}, ${c.passwordHash}, ${c.birthdayMonth ?? null}, ${c.birthdayDay ?? null},
          ${c.optIn}, ${randomRefCode()}, ${c.referredBy ?? null}, now())
        on conflict (ref_code) do nothing returning id`;
    }
    if (!row) throw new Error('Could not create member');
    if (biz.settings.welcomeStamps > 0)
      await tx`insert into stamps (business_id, customer_id, delta, reason) values (${biz.id}, ${row.id}, ${biz.settings.welcomeStamps}, 'welcome')`;
    return row as { id: string };
  }).catch((e: any) => (e.code === '23505' ? null : Promise.reject(e))); // unique (business, phone) or username
}

/** All of a member's cards, with their stamp balance. */
export const memberCards = (phone: string) => sql`
  select b.slug, b.name, b.settings->>'logoUrl' logo, b.settings->'colors'->>'accent' accent,
    coalesce((select sum(delta) from stamps s where s.customer_id = c.id), 0)::int balance
  from customers c join businesses b on b.id = c.business_id
  where c.phone = ${phone} and b.active order by b.name`;

/**
 * Permanently deletes a member's card at one business (UU PDP right to erasure).
 * Stamps, vouchers, spins and wallet/push links go with it (on delete cascade); gift certificates stay but lose the link.
 */
export async function deleteCard(bizId: string, customerId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(customerId)) return false;
  return sql.begin(async (tx) => {
    const [c] = await tx`select phone from customers where id = ${customerId} and business_id = ${bizId}`;
    if (!c) return false;
    await tx`update customers set referred_by = null where referred_by = ${customerId}`;
    await tx`delete from otp_codes where business_id = ${bizId} and phone = ${c.phone}`;
    await tx`delete from customers where id = ${customerId}`;
    return true;
  });
}
