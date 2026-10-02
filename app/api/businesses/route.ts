import { sql } from '@/lib/db';
import { clientIp, json, rateLimit } from '@/lib/util';

export const dynamic = 'force-dynamic';

/** Public search so customers and staff can find their business's page. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 40);
  if (q.length < 2) return json({ items: [] });
  if (!(await rateLimit(`bizsearch:${clientIp(req)}`, 60, 300))) return json({ items: [] }, 429);
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
  const items = await sql`select name, slug, settings->>'logoUrl' logo, settings->>'tagline' tagline from businesses where active and (name ilike ${like} or slug ilike ${like}) order by name limit 8`;
  return json({ items });
}
