import { sql } from '@/lib/db';
import { authorisePass, ok } from '@/lib/wallet/apple-service';

type Ctx = { params: Promise<{ deviceId: string; passTypeId: string; serial: string }> };

/** An iPhone added the pass and wants update pushes. */
export async function POST(req: Request, ctx: Ctx) {
  const p = await ctx.params;
  if (!(await authorisePass(req, p.passTypeId, p.serial))) return ok(401);
  const { pushToken } = await req.json().catch(() => ({}));
  if (typeof pushToken !== 'string' || !/^[0-9a-fA-F]{20,200}$/.test(pushToken) || p.deviceId.length > 200) return ok(400);
  await sql`insert into apple_devices (device_id, push_token) values (${p.deviceId}, ${pushToken})
    on conflict (device_id) do update set push_token = excluded.push_token, updated_at = now()`;
  const added = await sql`insert into apple_registrations (device_id, customer_id) values (${p.deviceId}, ${p.serial}) on conflict do nothing returning 1`;
  return ok(added.length ? 201 : 200);
}

/** The pass was removed from that iPhone. */
export async function DELETE(req: Request, ctx: Ctx) {
  const p = await ctx.params;
  if (!(await authorisePass(req, p.passTypeId, p.serial))) return ok(401);
  await sql`delete from apple_registrations where device_id = ${p.deviceId} and customer_id = ${p.serial}`;
  await sql`delete from apple_devices d where device_id = ${p.deviceId} and not exists (select 1 from apple_registrations r where r.device_id = d.device_id)`;
  return ok(200);
}
