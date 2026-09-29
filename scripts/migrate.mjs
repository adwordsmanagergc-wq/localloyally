// Usage: npm run migrate   (reads .env.local)
import postgres from 'postgres';
import { readFileSync } from 'node:fs';

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
await sql.unsafe(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
console.log('Schema ready. Add businesses at /platform');
await sql.end();
