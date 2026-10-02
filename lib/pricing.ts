import { headers } from 'next/headers';

/** EU members plus EEA and Switzerland: they see the euro price. */
const EUROPE = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','CH'];

/** Monthly price, by region (from the visitor's IP country). */
export const PRICES = [
  { codes: ['ID'], flag: '🇮🇩', country: 'Indonesia', price: 'Rp 2.500.000', where: 'in Indonesia' },
  { codes: ['AU'], flag: '🇦🇺', country: 'Australia', price: 'A$249', where: 'in Australia' },
  { codes: ['GB'], flag: '🇬🇧', country: 'United Kingdom', price: '£99', where: 'in the UK' },
  { codes: EUROPE, flag: '🇪🇺', country: 'Europe', price: '€149', where: 'in Europe' },
  { codes: ['US'], flag: '🇺🇸', country: 'United States', price: 'US$99', where: 'in the USA' },
];

/** Visitors in a priced region see only their price; everyone else sees them all. */
export async function pricesForVisitor() {
  const country = ((await headers()).get('x-vercel-ip-country') || '').toUpperCase();
  const mine = PRICES.filter((p) => p.codes.includes(country));
  return mine.length ? mine : PRICES;
}

/** "Rp 2.500.000 a month", or every region's price for visitors elsewhere. */
export function priceSentence(prices: typeof PRICES) {
  if (prices.length === 1) return `${prices[0].price} a month`;
  const parts = prices.map((p) => `${p.price} ${p.where}`);
  return `${parts.slice(0, -1).join(', ')} or ${parts[parts.length - 1]}, per month`;
}
