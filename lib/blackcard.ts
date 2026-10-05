import { sql } from './db';

/**
 * Black card: free coffee for life (or until the owners say otherwise). Only staff with can_black_card (Andy)
 * send it with a one-off invite, or give or take it back on the member screen. Stored on the customer; the columns are added on first use so
 * no manual migration is needed (they're in db/schema.sql too).
 */
let ready: Promise<boolean> | null = null;
export function blackCardReady(): Promise<boolean> {
  ready ??= (async () => {
    const [c] = await sql`select 1 from information_schema.columns where table_name = 'customers' and column_name = 'black_card_welcomed_at'`;
    if (!c) await sql`alter table customers add column if not exists black_card_at timestamptz,
      add column if not exists black_card_by uuid references staff(id) on delete set null,
      add column if not exists black_card_welcomed_at timestamptz`;
    const [st] = await sql`select 1 from information_schema.columns where table_name = 'staff' and column_name = 'can_black_card'`;
    if (!st) await sql.begin(async (tx) => {
      await tx`alter table staff add column if not exists can_black_card boolean not null default false`;
      // Only Andy gives black cards. Set once, on his login as it is now, so a renamed or new "Andy" doesn't get it.
      await tx`update staff set can_black_card = true where lower(name) = 'andy' and role = 'manager' and active`;
    });
    return true;
  })().catch((e) => { console.error('Black card setup failed', e); ready = null; return false; });
  return ready;
}

export async function setBlackCard(bizId: string, customerId: string, staffId: string | null, on: boolean) {
  if (!(await blackCardReady())) throw new Error('Black cards are not available right now');
  await sql`update customers set black_card_at = ${on ? sql`coalesce(black_card_at, now())` : null},
    black_card_by = ${on ? sql`coalesce(black_card_by, ${staffId})` : null},
    black_card_welcomed_at = ${on ? sql`black_card_welcomed_at` : null}
    where id = ${customerId} and business_id = ${bizId}`;
}

/** The member has watched their black card intro, so it doesn't play again. */
export async function markBlackCardWelcomed(customerId: string) {
  if (await blackCardReady()) await sql`update customers set black_card_welcomed_at = now() where id = ${customerId} and black_card_at is not null`;
}

/** Whether this staff login may give black cards (only Andy). */
export async function canGiveBlackCard(staffId: string) {
  if (!(await blackCardReady())) return false;
  const [s] = await sql`select 1 from staff where id = ${staffId} and active and role = 'manager' and can_black_card`;
  return !!s;
}
