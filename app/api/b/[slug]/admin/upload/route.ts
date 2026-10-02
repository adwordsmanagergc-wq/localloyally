import sharp, { type Sharp } from 'sharp';
import { sql } from '@/lib/db';
import { getStaff } from '@/lib/auth';
import { getBusiness } from '@/lib/business';
import { json, rateLimit } from '@/lib/util';

export const maxDuration = 30;

/** How each kind of image is sized: small and fast to load on a phone. */
const SIZES = {
  logo: (img: Sharp) => img.resize(512, 512, { fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9 }),
  stamp: (img: Sharp) => img.resize(256, 256, { fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9 }),
  background: (img: Sharp) => img.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }),
} as const;

/** A manager uploads a logo, background photo or stamp image in Settings. Returns the URL to use. */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const biz = await getBusiness((await ctx.params).slug);
  if (!biz) return json({ error: 'Business not found' }, 404);
  const st = await getStaff(biz.id);
  if (st?.role !== 'manager') return json({ error: 'Managers only' }, 403);
  if (!(await rateLimit(`upload:${biz.id}`, 30, 3600))) return json({ error: 'Too many uploads. Try again later.' }, 429);

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const kind = String(form?.get('kind') || '') as keyof typeof SIZES;
  if (!(kind in SIZES)) return json({ error: 'Unknown image type' }, 400);
  if (!(file instanceof File)) return json({ error: 'Choose an image' }, 400);
  if (file.size > 10 * 1024 * 1024) return json({ error: 'That image is over 10 MB. Try a smaller one.' }, 400);

  let out: Buffer;
  try {
    // rotate() applies the phone's orientation so photos aren't sideways
    out = await SIZES[kind](sharp(Buffer.from(await file.arrayBuffer())).rotate()).toBuffer();
  } catch {
    return json({ error: "That file isn't an image we can read. Use a JPG, PNG or WebP." }, 400);
  }
  const type = kind === 'background' ? 'image/jpeg' : 'image/png';
  const [u] = await sql`insert into uploads (business_id, kind, content_type, data) values (${biz.id}, ${kind}, ${type}, ${out}) returning id`;
  return json({ url: `/api/uploads/${u.id}`, size: out.length });
}
