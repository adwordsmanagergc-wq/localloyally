import postgres from 'postgres';

const g = globalThis as unknown as { __sql?: postgres.Sql };

// prepare:false keeps it compatible with Supabase / Neon connection poolers.
export const sql: postgres.Sql =
  g.__sql ?? (g.__sql = postgres(process.env.DATABASE_URL as string, { max: 5, prepare: false }));

export type Tx = postgres.TransactionSql | postgres.Sql;
