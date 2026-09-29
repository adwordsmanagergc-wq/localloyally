import QRCode from 'qrcode';
import { cardToken } from '@/lib/auth';
import { customerRoute } from '@/lib/route';
import { json } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const GET = customerRoute(async (_req, biz, id) => {
  const token = await cardToken(biz.id, id);
  const svg = await QRCode.toString(token, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#ffffff' } });
  return json({ svg });
});
