// A robust, production-ready service worker with advanced caching strategies.

const CACHE_VERSION = 'v1.1'; // Increment this version to bust the cache
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-cache-${CACHE_VERSION}`;

// List of essential files to be precached for the app shell to work offline.
const APP_SHELL_URLS = [
  '/',
  '/favicon.ico',
  '/logo-144.png',
  '/logo.png',
  '/og-image.png',
  // Note: Next.js build files (_next/static/...) are dynamically named.
  // We'll cache them at runtime instead of precaching them.
];

// 1. Installation: Precaching the App Shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting()) // Activate the new service worker immediately
  );
});

// 2. Activation: Cleaning up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open clients
});

// 3. Fetch: Intercepting network requests and applying caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore requests to Firebase and other external services we don't want to cache.
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis.com')) {
    return;
  }
  
  // Ignore requests from browser extensions
  if (!request.url.startsWith('http')) {
    return;
  }

  // Strategy 1: Cache First for images and fonts
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          return caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for CSS and JavaScript
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Strategy 3: Network First for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
     event.respondWith(
        fetch(request)
          .then(networkResponse => {
            // If the request is successful, cache it for offline use.
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // If the network fails, try to serve from the cache.
            return caches.match(request);
          })
    );
    return;
  }

  // Default: Fallback to network for any other requests
  event.respondWith(fetch(request));
});
