// HOGUSY Service Worker
const CACHE_NAME = 'hogusy-v4'; // Updated version (fix icon references)
const STATIC_CACHE_NAME = 'hogusy-static-v4';
const DYNAMIC_CACHE_NAME = 'hogusy-dynamic-v4';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/therapists',
  '/app/map'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests (always fetch fresh)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // CRITICAL: Cache-first strategy for CSS/JS assets to prevent loading failures
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          console.log('[Service Worker] Serving from cache:', url.pathname);
          
          // Update cache in background
          fetch(request).then((fetchResponse) => {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, fetchResponse);
            });
          }).catch(() => {
            // Network failed, but we have cache
            console.log('[Service Worker] Network failed, using cached version:', url.pathname);
          });
          
          return cachedResponse;
        }
        
        // No cache, fetch from network
        return fetch(request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        }).catch((error) => {
          console.error('[Service Worker] Failed to fetch asset:', url.pathname, error);
          throw error;
        });
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Fallback to offline page if available
        return caches.match('/');
      })
    );
    return;
  }

  // Network-first strategy for dynamic content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // CRITICAL FIX: Do not cache partial responses (status code 206)
        // Partial responses are not supported by Cache API
        if (response.status === 206) {
          console.log('[Service Worker] Skipping cache for partial response (206):', url.pathname);
          return response;
        }
        
        // Clone the response before caching
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then((response) => {
          return response || caches.match('/');
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'HOGUSY';
  const options = {
    body: data.body || '新しい通知があります',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: data.url || '/',
    vibrate: [200, 100, 200],
    tag: 'hogusy-notification'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Helper function to sync bookings
async function syncBookings() {
  try {
    // Get pending bookings from IndexedDB or cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    // Implement your sync logic here
    console.log('[Service Worker] Syncing bookings...');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}
