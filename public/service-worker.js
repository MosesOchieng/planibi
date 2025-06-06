const CACHE_NAME = 'planibi-v1';
const OFFLINE_URL = '/offline.html';
const SYNC_TAG = 'planibi-sync';
const PERIODIC_SYNC_TAG = 'planibi-periodic-sync';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Enable periodic sync
      self.registration.periodicSync.register(PERIODIC_SYNC_TAG, {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      })
    ]).then(() => self.clients.claim())
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncDestinations());
  }
});

// Periodic sync event
self.addEventListener('periodicsync', (event) => {
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(updateDestinations());
  }
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tripp', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function syncDestinations() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineDestinations = await cache.match('/api/destinations/offline');
    
    if (offlineDestinations) {
      const destinations = await offlineDestinations.json();
      
      // Sync each destination
      for (const destination of destinations) {
        try {
          await fetch('/api/destinations/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(destination),
          });
        } catch (error) {
          console.error('Error syncing destination:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

// Periodic sync function
async function updateDestinations() {
  try {
    const response = await fetch('/api/destinations/update');
    if (response.ok) {
      const destinations = await response.json();
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/destinations', new Response(JSON.stringify(destinations)));
      
      // Show notification if there are new destinations
      if (destinations.length > 0) {
        self.registration.showNotification('Tripp', {
          body: `Found ${destinations.length} new destinations!`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [100, 50, 100],
          data: {
            url: '/'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in periodic sync:', error);
  }
} 