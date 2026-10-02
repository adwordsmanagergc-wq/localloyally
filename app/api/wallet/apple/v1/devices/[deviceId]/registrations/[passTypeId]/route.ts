import { sql } from '@/lib/db';
import { passTypeId } from '@/lib/wallet/apple';

export const dynamic = 'force-dynamic';

/** Which of this iPhone's passes changed since the last check. Apple sends no auth header here. */
export async function GET(req: Request, ctx: { params: Promise<{ deviceId: string; passTypeId: string }> }) {
  const p = await ctx.params;
  if (p.passTypeId !== passTypeId()) return new Response(null, { status: 404 });
  const since = Number(new URL(req.url).searchParams.get('passesUpdatedSince')) || 0;
  const rows = await sql`select c.id, c.wallet_updated_at from apple_registrations r join customers c on c.id = r.customer_id
    where r.device_id = ${p.deviceId} and coalesce(c.wallet_updated_at, 'epoch') > to_timestamp(${since / 1000})`;
  if (!rows.length) return new Response(null, { status: 204 });
  const last = Math.max(...rows.map((r: any) => new Date(r.wallet_updated_at ?? 0).getTime()));
  return Response.json({ serialNumbers: rows.map((r: any) => r.id), lastUpdated: String(last) });
}
