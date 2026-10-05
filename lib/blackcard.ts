import { sql } from './db';

/**
 * Black card: free coffee for life (or until the owners say otherwise). Managers send it with a one-off invite,
 * or give or take it back on the member screen. Stored on the customer; the columns are added on first use so
 * no manual migration is needed (they're in db/schema.sql too).
 */
let ready: Promise<boolean> | null = null;
export function blackCardReady(): Promise<boolean> {
  ready ??= (async () => {
    const [c] = await sql`select 1 from information_schema.columns where table_name = 'customers' and column_name = 'black_card_welcomed_at'`;
    if (!c) await sql`alter table customers add column if not exists black_card_at timestamptz,
      add column if not exists black_card_by uuid references staff(id) on delete set null,
      add column if not exists black_card_welcomed_at timestamptz`;
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
