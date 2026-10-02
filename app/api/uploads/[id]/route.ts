import { sql } from '@/lib/db';

/** Serves an uploaded image. Each upload has its own id, so it can be cached for a long time. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
  const [u] = await sql`select content_type, data from uploads where id = ${id}`;
  if (!u) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(u.data), {
    headers: { 'Content-Type': u.content_type, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
