/**
 * Email via Resend (resend.com). Needs RESEND_API_KEY; without it, emails are skipped and logged.
 * EMAIL_FROM must be an address on a domain verified in Resend, e.g. "Loyal Locally <hello@loyallocally.com>".
 */
export async function sendEmail(to: string, subject: string, text: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[email skipped, no RESEND_API_KEY] to ${to}: ${subject}\n${text}`); return false; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Loyal Locally <onboarding@resend.dev>',
        to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) console.error('Email failed', res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error('Email error', e);
    return false;
  }
}
