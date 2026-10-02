import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { getBusiness } from '@/lib/business';
import { findGift, giftUrl } from '@/lib/gifts';
import { fmtGiftCode, money } from '@/lib/money';
import Brand from '@/components/Brand';
import { ShareReferral } from '@/components/CardParts';
import PoweredBy from '@/components/PoweredBy';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

const d = (x: Date) => new Date(x).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The certificate the buyer shares. Anyone with the link can see it; staff scan the QR to use it. */
export default async function GiftPage({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const p = await params;
  const biz = await getBusiness(p.slug);
  if (!biz) notFound();
  const g = await findGift(biz, p.code);
  if (!g) notFound();
  const url = giftUrl(biz, g.code);
  const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#ffffff' } });
  const value = g.kind === 'item' ? g.label : money(biz.settings.currency, g.amount);
  const status = g.void ? 'This gift certificate was cancelled.' : g.balance <= 0 ? 'This gift certificate has been used.'
    : g.expired ? `This gift certificate expired on ${d(g.expires_at)}.` : null;

  return (
    <main className="wrap stack-lg">
      <Brand biz={biz} />
      <section className="card stack center gift">
        <span className="sticker" style={{ justifySelf: 'center' }}>Gift certificate</span>
        {g.to_name && <p className="small muted">For {g.to_name}{g.from_name ? `, from ${g.from_name}` : ''}</p>}
        {!g.to_name && g.from_name && <p className="small muted">From {g.from_name}</p>}
        <div className="gift-value">{value}</div>
        <p className="small muted">at {biz.name}</p>
        {g.message && <blockquote className="gift-msg">“{g.message}”</blockquote>}
        {status ? <div className="banner bad">{status}</div> : (
          <>
            {g.kind === 'amount' && g.balance < g.amount && (
              <div className="banner good"><strong>{money(biz.settings.currency, g.balance)}</strong> left to spend</div>
            )}
            <div className="qrbox" style={{ maxWidth: 240, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="small">Show this at the counter. Code <strong style={{ letterSpacing: 1 }}>{fmtGiftCode(g.code)}</strong></p>
            <p className="tiny muted">Valid until {d(g.expires_at)}{g.kind === 'amount' ? '. Use it in one go or over several visits.' : '.'}</p>
          </>
        )}
      </section>
      {!status && <ShareReferral link={url} text={`A gift for you from ${biz.name}`} />}
      <PoweredBy />
    </main>
  );
}
