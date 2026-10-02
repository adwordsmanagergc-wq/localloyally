/** The site's public address for links in messages, QR codes and wallet cards. APP_URL wins; loyallocally.com if it's missing. */
export const siteUrl = () => (process.env.APP_URL || 'https://loyallocally.com').replace(/\/$/, '');
