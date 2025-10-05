self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const IMG_CACHE = 'img-cache-v1';
const JSON_CACHE = 'json-cache-v1';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece GET istekleri
  if (request.method !== 'GET') return;

  // Görselleri cache'le (runtime)
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const resp = await fetch(request);
        cache.put(request, resp.clone());
        return resp;
      })
    );
    return;
  }

  // Küçük JSON'lar (<= 100KB) - ör: system status, configs
  if (url.pathname.startsWith('/api/system') || url.pathname.includes('/api/monitoring')) {
    event.respondWith(
      caches.open(JSON_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((resp) => {
          cache.put(request, resp.clone());
          return resp;
        });
        return cached || network;
      })
    );
  }
});
