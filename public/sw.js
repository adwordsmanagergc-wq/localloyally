// Loyal Locally service worker: shows phone notifications and opens the card when tapped.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { title: 'Loyal Locally', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.title || 'Loyal Locally', {
    body: d.body || '', icon: d.icon || '/brand/loyal-locally-icon.png', badge: '/brand/loyal-locally-badge.png',
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) if (w.url.includes(url) && 'focus' in w) return w.focus();
    return self.clients.openWindow(url);
  })());
});
