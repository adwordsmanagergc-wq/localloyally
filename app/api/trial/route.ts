import { sql } from '@/lib/db';
import { after } from 'next/server';
import { clientIp, json, rateLimit } from '@/lib/util';
import { sendEmail } from '@/lib/email';
import { siteUrl } from '@/lib/site';

const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  if (!(await rateLimit(`trial:${clientIp(req)}`, 5, 3600))) return json({ error: 'Too many requests, please try again later' }, 429);
  const b = await req.json().catch(() => ({}));
  const businessName = clean(b.businessName, 80);
  const contactName = clean(b.contactName, 60);
  const whatsapp = clean(b.whatsapp, 30).replace(/[^\d+ ]/g, '');
  const email = clean(b.email, 120);
  if (businessName.length < 2) return json({ error: 'Add your business name' }, 400);
  if (contactName.length < 2) return json({ error: 'Add your name' }, 400);
  if (whatsapp.replace(/\D/g, '').length < 8) return json({ error: 'Add a WhatsApp number we can reach you on' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Check your email address' }, 400);
  await sql`insert into trial_requests (business_name, business_type, contact_name, whatsapp, email, city, message)
    values (${businessName}, ${clean(b.businessType, 40)}, ${contactName}, ${whatsapp}, ${email || null}, ${clean(b.city, 60) || null}, ${clean(b.message, 600) || null})`;

  // Tell the team straight away (after replying, so the visitor isn't kept waiting)
  const wa = whatsapp.replace(/\D/g, '');
  const text = [
    `New sign-up request on Loyal Locally`, '',
    `Business: ${businessName}`, `Type: ${clean(b.businessType, 40) || '-'}`, `Area: ${clean(b.city, 60) || '-'}`,
    `Name: ${contactName}`, `WhatsApp: ${whatsapp} (https://wa.me/${wa})`, `Email: ${email || '-'}`, '',
    `Message: ${clean(b.message, 600) || '-'}`, '', `All requests: ${siteUrl()}/platform`,
  ].join('\n');
  after(() => sendEmail(process.env.TRIAL_EMAIL_TO || 'aj@metatapdigital.com', `New business enquiry: ${businessName}`, text, email || undefined));
  return json({ ok: true });
}
