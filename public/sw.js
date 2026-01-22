// HOGUSY Service Worker - DISABLED FOR CACHE CLEARING
const CACHE_NAME = 'hogusy-v5-cache-clear'; // Force cache update

// Install event - skip caching
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v5 - Cache Clear Mode');
  self.skipWaiting();
});

// Activate event - DELETE ALL OLD CACHES
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v5 - Clearing ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[Service Worker] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] All caches cleared!');
      return self.clients.claim();
    })
  );
});

// Fetch event - ALWAYS fetch from network (no caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Network error', { status: 503 });
    })
  );
});
