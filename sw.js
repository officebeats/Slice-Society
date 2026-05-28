
const CACHE_NAME = 'pizza-time-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Styles & Fonts
  'https://cdn.tailwindcss.com?plugins=forms,typography,container-queries',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  // JS Modules
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
            // Only cache valid responses from known domains to avoid junk
            const url = new URL(event.request.url);
            if (networkResponse.status === 200 && (url.origin === location.origin || urlsToCache.some(u => url.href.includes(u)))) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(() => {
            // If network fails and no cache, maybe return a fallback if it's an image
            return response;
        });
        return response || fetchPromise;
      });
    })
  );
});
