'use client';

/** Small fetch wrapper for the browser. Throws the server's error message. */
export async function api<T = any>(path: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(path, {
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong'), { status: res.status, data });
  return data as T;
}

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
export const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Pauses background refreshes while something animates (e.g. the spin wheel). */
export const uiLock = { busy: false };

/**
 * Asks the phone's password manager to save the login (Chrome / Android show "Save password?").
 * iPhones offer it from the form itself; this is a harmless no-op there.
 */
export async function savePassword(username: string, password: string) {
  try {
    const PC = (window as any).PasswordCredential;
    if (PC && navigator.credentials && username && password)
      // Never hold up logging in for more than a moment
      await Promise.race([navigator.credentials.store(new PC({ id: username, password, name: username })), new Promise((r) => setTimeout(r, 1500))]);
  } catch { /* the user said no, or the browser doesn't support it */ }
}
