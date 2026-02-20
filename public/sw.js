const CACHE_NAME = 'campuspath-ar-v1';

// Core app shell files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin',
];

// External CDN scripts to cache
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
];

// ── Install: cache core assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache static assets, ignore failures for CDN
      return cache.addAll(STATIC_ASSETS).then(() => {
        CDN_ASSETS.forEach(url => {
          fetch(url).then(res => cache.put(url, res)).catch(() => {});
        });
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache first, fallback to network ──
self.addEventListener('fetch', (event) => {
  // Skip non-GET and browser-extension requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // For navigation requests (page loads) — serve index.html from cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cached => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // For everything else — cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});