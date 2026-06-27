const CACHE_NAME = 'golpoghor-cache-v3';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(networkResponse) {
      return caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    }).catch(function() {
      return caches.match(event.request).then(function(cachedResponse) {
        return cachedResponse || caches.match('./index.html');
      });
    })
  );
});
