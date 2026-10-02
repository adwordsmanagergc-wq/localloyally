import { clearAllCustomerSessions } from '@/lib/auth';
import { json } from '@/lib/util';

export async function POST() {
  await clearAllCustomerSessions();
  return json({ ok: true });
}
