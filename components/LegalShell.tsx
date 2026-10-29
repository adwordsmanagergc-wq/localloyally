import { company } from '@/lib/site';

/** Layout for the terms and privacy pages: header, English / Bahasa Indonesia jump links, and who runs the app. */
export default function LegalShell({ title, titleId, updated, children }: { title: string; titleId: string; updated: string; children: React.ReactNode }) {
  const co = company();
  return (
    <div className="lp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@400;500;600;700&family=Nunito:wght@900&display=swap" />
      <header className="lp-nav">
        <div className="lp-container">
          <a href="/" className="lp-logo" aria-label="Loyal Locally home"><img className="lp-logo-img" src="/brand/loyal-locally-icon.png" width={38} height={38} alt="" /><span className="lp-logo-text">Loyal <span className="lp-logo-pill">Locally</span></span></a>
        </div>
      </header>
      <main className="lp-login lp-terms">
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 2.6rem)' }}>{title}</h1>
        <p className="lp-terms-meta">{titleId}. Last updated / Terakhir diperbarui {updated}.</p>
        <p className="lp-terms-meta"><a href="#en" style={{ textDecoration: 'underline' }}>English</a> · <a href="#id" style={{ textDecoration: 'underline' }}>Bahasa Indonesia</a></p>
        {children}
        <h2>Contact / Kontak</h2>
        <p>
          Loyal Locally is run by {co.name}{co.address ? `, ${co.address}` : ''}. Email: <a href={`mailto:${co.email}`} style={{ textDecoration: 'underline' }}>{co.email}</a>.<br />
          Loyal Locally dikelola oleh {co.name}{co.address ? `, ${co.address}` : ''}. Email: <a href={`mailto:${co.email}`} style={{ textDecoration: 'underline' }}>{co.email}</a>.
        </p>
        <p className="lp-terms-meta"><a href="/terms" style={{ textDecoration: 'underline' }}>Terms and conditions</a> · <a href="/privacy" style={{ textDecoration: 'underline' }}>Privacy policy</a></p>
      </main>
    </div>
  );
}
