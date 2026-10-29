export const SITE_DOMAIN = 'loyallocally.com';

/**
 * The site's public address for links in messages, QR codes and wallet cards.
 * APP_URL wins, except Vercel's own *.vercel.app addresses, which should never end up in shared links.
 */
export function siteUrl() {
  const env = (process.env.APP_URL || '').trim().replace(/\/$/, '');
  return env && !/\.vercel\.app$/i.test(new URL(env.startsWith('http') ? env : `https://${env}`).hostname) ? env : `https://${SITE_DOMAIN}`;
}

/** Who runs Loyal Locally, shown in the footer, terms and privacy policy (PP 80/2019 asks for clear business identity). */
export function company() {
  return {
    name: process.env.COMPANY_LEGAL_NAME || 'Metatap Digital',
    address: process.env.COMPANY_ADDRESS || '',
    email: process.env.CONTACT_EMAIL || 'hello@loyallocally.com',
  };
}
