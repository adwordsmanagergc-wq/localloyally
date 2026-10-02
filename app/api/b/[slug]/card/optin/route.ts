import { sql } from '@/lib/db';
import { customerRoute, body } from '@/lib/route';
import { json } from '@/lib/util';

/** Customers switch WhatsApp offers from this business on or off. */
export const POST = customerRoute(async (req, biz, id) => {
  const on = (await body(req)).optIn === true;
  await sql`update customers set marketing_opt_in = ${on} where id = ${id} and business_id = ${biz.id}`;
  return json({ optIn: on });
});
