import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** The "Get the digital card" button. Finds Roasted's card by name, so it keeps working whatever its link name is. */
export async function GET(req: Request) {
  const [biz] = await sql`select slug from businesses where active and (slug ilike 'roasted%' or name ilike 'roasted%')
    order by (slug = 'roasted') desc, created_at limit 1`;
  return Response.redirect(new URL(biz ? `/${biz.slug}?join=1` : '/', req.url), 302);
}
