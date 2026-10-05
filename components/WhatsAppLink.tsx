'use client';
import type { ReactNode } from 'react';

/**
 * WhatsApp links that work on iPhone. A wa.me link opened in a new tab (and always from a card saved to the
 * home screen) lands on WhatsApp's web page instead of the app, or opens the app without the message.
 * On iPhone we open the app directly with whatsapp://, and fall back to the web page if WhatsApp isn't installed.
 */
export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** https://wa.me/<phone>?text=… → whatsapp://send?phone=<phone>&text=… (or api.whatsapp.com/send?… for the web fallback) */
export function waAppUrl(url: string, base = 'whatsapp://send') {
  const m = url.match(/^https:\/\/wa\.me\/(\d*)\/?(?:\?text=(.*))?$/);
  if (!m) return url;
  return `${base}?${[m[1] && `phone=${m[1]}`, m[2] && `text=${m[2]}`].filter(Boolean).join('&')}`;
}

/** Opens a wa.me link in the WhatsApp app (iPhone) or a new tab (everything else). */
export function openWhatsApp(url: string) {
  if (!isIOS()) { window.open(url, '_blank', 'noopener'); return; }
  const fallback = setTimeout(() => { if (!document.hidden) window.location.href = waAppUrl(url, 'https://api.whatsapp.com/send'); }, 1600);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(fallback); }, { once: true });
  window.location.href = waAppUrl(url);
}

export default function WhatsAppLink({ href, className, children, disabled, onOpen }: { href: string; className?: string; children: ReactNode; disabled?: boolean; onOpen?: () => void }) {
  return (
    <a className={className} href={disabled ? undefined : href} target="_blank" rel="noopener noreferrer" aria-disabled={disabled}
      onClick={(e) => { if (disabled) { e.preventDefault(); return; } if (isIOS()) { e.preventDefault(); openWhatsApp(href); } onOpen?.(); }}>
      {children}
    </a>
  );
}
