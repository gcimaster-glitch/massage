// HOGUSY Service Worker v7
// 戦略:
//   静的アセット (JS/CSS/画像/フォント) → Cache-First（高速表示）
//   APIリクエスト (/api/*) → Network-Only（個人データをキャッシュしない・セキュリティ優先）
//   HTMLページ → Network-First (オフライン時はキャッシュ済みシェルにフォールバック)

const CACHE_VERSION = 'hogusy-v7';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const ALL_CACHES = [STATIC_CACHE];

// プリキャッシュするシェル（アプリの骨格）
const PRECACHE_URLS = ['/'];

// ============================================
// Install: プリキャッシュ
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ============================================
// Activate: 古いキャッシュを削除
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !ALL_CACHES.includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================
// Fetch: リクエスト種別ごとに戦略を切り替え
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 別オリジンは素通り
  if (url.origin !== self.location.origin) return;

  // POSTなど変更系リクエストはキャッシュしない
  if (request.method !== 'GET') return;

  // --- API: Network-Only ---
  // 認証トークン・個人情報を含むレスポンスはキャッシュしない
  if (url.pathname.startsWith('/api/')) return;

  // --- 静的アセット (JS/CSS/画像/フォント): Cache-First ---
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // --- HTML ページ: Network-First + シェルフォールバック ---
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, STATIC_CACHE, 5000));
    return;
  }
});

// ============================================
// 戦略実装
// ============================================

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Resource not available offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs) {
  try {
    const fetchPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // HTML フォールバック: キャッシュされたシェルを返す
    const shell = await caches.match('/');
    if (shell) return shell;
    return new Response('オフラインです。接続を確認してください。', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/assets/') ||
    /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|webp|gif|ico)$/.test(pathname)
  );
}
