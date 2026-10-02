import { NextResponse, type NextRequest } from 'next/server';

/** The live site sends visitors on the old *.vercel.app address to loyallocally.com (same page), so old shared links still work. */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (process.env.VERCEL_ENV === 'production' && host.endsWith('.vercel.app')) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://loyallocally.com');
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Pages only; API calls (e.g. Apple Wallet updates, the daily cron) are left alone.
export const config = { matcher: ['/((?!api/|_next/|favicon.ico).*)'] };
