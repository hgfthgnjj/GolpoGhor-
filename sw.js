// গল্পঘর - Service Worker
// এই ফাইলটা প্রথমবার অ্যাপ লোড হওয়ার সময় পুরো অ্যাপ ফোনে cache করে রাখে,
// যাতে পরে ইন্টারনেট না থাকলেও অ্যাপ চলে।

const CACHE_NAME = 'golpoghor-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ইনস্টলের সময়: প্রয়োজনীয় ফাইলগুলো cache-এ সেভ করা
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// পুরনো ভার্সনের cache পরিষ্কার করা
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

// রিকোয়েস্ট হ্যান্ডলিং: cache-first, fail করলে network, network-ও fail করলে cache-এর index.html (offline fallback)
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(function(networkResponse) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
