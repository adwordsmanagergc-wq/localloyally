import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
import { appUrl } from './data';
import type { Business } from '../business';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** A plain square PNG in the brand colour, for businesses without a PNG logo. */
export function solidPng(hex: string, size = 180) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) || 0);
  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) row.set([r, g, b], 1 + x * 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(Array(size).fill(row)))), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const isPng = (b: Buffer) => b.length > 8 && b.readUInt32BE(0) === 0x89504e47;

/** The business logo as a PNG (wallets need PNG), or a brand-colour square. */
export async function logoPng(biz: Business): Promise<Buffer> {
  const u = biz.settings.logoUrl;
  if (u) {
    try {
      const res = await fetch(u.startsWith('/') ? appUrl() + u : u, { signal: AbortSignal.timeout(5000) });
      const buf = Buffer.from(await res.arrayBuffer());
      if (res.ok && isPng(buf)) return buf;
    } catch { /* fall back */ }
  }
  return solidPng(biz.settings.colors.accent);
}

/** Shrinks the logo to wallet sizes so the pass stays small. Square icon; logo fits a wide strip. */
export async function walletImages(biz: Business) {
  const src = await logoPng(biz);
  const icon = (px: number) => sharp(src).resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const logo = (h: number) => sharp(src).resize({ height: h, width: h * 3.2, fit: 'inside' }).png().toBuffer();
  const [i1, i2, i3, l1, l2, l3] = await Promise.all([icon(29), icon(58), icon(87), logo(50), logo(100), logo(150)]);
  return { 'icon.png': i1, 'icon@2x.png': i2, 'icon@3x.png': i3, 'logo.png': l1, 'logo@2x.png': l2, 'logo@3x.png': l3 };
}
