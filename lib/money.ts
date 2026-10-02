/** "Rp 50.000" or "$ 25". Safe to use in the browser. */
export function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString(currency === 'Rp' ? 'id-ID' : 'en-US')}`;
}

/** Gift codes are 10 characters, shown as ABCDE-FGHJK. */
export const fmtGiftCode = (c: string) => `${c.slice(0, 5)}-${c.slice(5)}`;
export const cleanGiftCode = (c: string) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
