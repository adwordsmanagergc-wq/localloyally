import { sql } from '../db';
import { getBusinessById } from '../business';
import { checkAppleAuth, passTypeId } from './apple';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Checks the pass type, serial (= customer id) and the ApplePass auth header. Returns the business, or null. */
export async function authorisePass(req: Request, ptid: string, serial: string) {
  if (ptid !== passTypeId() || !UUID.test(serial) || !checkAppleAuth(req, serial)) return null;
  const [c] = await sql`select business_id from customers where id = ${serial}`;
  return c ? getBusinessById(c.business_id) : null;
}

export const ok = (status: number) => new Response(null, { status });
