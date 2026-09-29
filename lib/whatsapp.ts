/**
 * WhatsApp sending. Pick a provider with WHATSAPP_PROVIDER:
 *  - dev    : prints messages to the server log (for local testing)
 *  - fonnte : Fonnte.com, Indonesian gateway using a normal WhatsApp number. Cheap, quick to set up.
 *  - meta   : Official WhatsApp Cloud API. Needs approved templates for codes and reminders.
 */
type Template = { name: string; params: string[]; otp?: boolean };

export async function sendWhatsApp(phone: string, text: string, template?: Template): Promise<boolean> {
  const provider = process.env.WHATSAPP_PROVIDER || 'dev';
  try {
    if (provider === 'fonnte') {
      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: process.env.FONNTE_TOKEN || '' },
        body: new URLSearchParams({ target: phone, message: text, countryCode: '0' }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.status === false) console.error('Fonnte send failed', body);
      return res.ok && body.status !== false;
    }
    if (provider === 'meta') {
      const url = `https://graph.facebook.com/v21.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`;
      const payload: any = template
        ? {
            messaging_product: 'whatsapp', to: phone, type: 'template',
            template: {
              name: template.name,
              language: { code: process.env.META_TEMPLATE_LANG || 'en' },
              components: [
                { type: 'body', parameters: template.params.map((t) => ({ type: 'text', text: t })) },
                ...(template.otp
                  ? [{ type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: template.params[0] }] }]
                  : []),
              ],
            },
          }
        : { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: text } };
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.META_WA_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) console.error('Meta WhatsApp send failed', await res.text());
      return res.ok;
    }
    console.log(`\n[WhatsApp dev] to +${phone}:\n${text}\n`);
    return true;
  } catch (e) {
    console.error('WhatsApp send error', e);
    return false;
  }
}

export function sendOtp(phone: string, code: string, businessName: string) {
  return sendWhatsApp(
    phone,
    `${code} is your ${businessName} rewards code. It expires in 10 minutes. Don't share it with anyone.`,
    { name: process.env.META_OTP_TEMPLATE || 'login_code', params: [code], otp: true },
  );
}
