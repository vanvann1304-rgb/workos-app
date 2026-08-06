const CACHE_NAME = 'workos-v1';
const API_CACHE = 'workos-api-v1';

const STATIC_ASSETS = [
  '/',
  '/tasks',
  '/calendar',
  '/kanban',
  '/notes',
  '/habits',
  '/pomodoro',
  '/stats',
  '/settings',
  '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME && n !== API_CACHE).map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'WorkOS', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: data.tag || 'workos-notification',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          return client.navigate(url);
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Sync any pending offline changes
  console.log('[SW] Background sync: tasks');
}
