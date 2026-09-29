import { isPlatformAdmin } from '@/lib/auth';
import PlatformConsole from '@/components/PlatformConsole';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Platform admin', robots: { index: false } };

export default async function Platform() {
  return (
    <main className="theme tx-paper">
      <div className="wrap wide">
        <PlatformConsole loggedIn={await isPlatformAdmin()} appUrl={(process.env.APP_URL || '').replace(/\/$/, '')} />
      </div>
    </main>
  );
}
