const CACHE_NAME = 'lumimatch-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/i18n.js',
  '/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Şunları cache'leme: socket.io, API, dış domain'ler, data: URL'ler, blob URL'ler
  if (
    url.includes('/socket.io') ||
    url.includes('/api/') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.includes('supabase.co') ||
    url.includes('effectivecpmnetwork') ||
    url.includes('adsterra') ||
    url.includes('cdn.jsdelivr') ||
    url.includes('%7B') ||  // encoded { — template literal render edilmemiş
    url.includes('%7D') ||  // encoded }
    !url.startsWith(self.location.origin) ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
