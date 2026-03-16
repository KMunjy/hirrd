/**
 * Hirrd Service Worker
 * Provides offline capability for SA users on limited data
 * Cache strategy: Stale-while-revalidate for static assets
 *                 Network-first for API calls
 *                 Cache-only for offline fallback
 */
const CACHE_VERSION = 'hirrd-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const API_CACHE = `${CACHE_VERSION}-api`

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/jobs',
  '/learnerships',
  '/build-profile',
  '/auth/login',
  '/auth/register',
  '/offline',
]

// Install: precache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// Fetch: route-based cache strategy
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // API calls: network-first, cache on success
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstForAPI(request))
    return
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Pages: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request))
})

async function networkFirstForAPI(request) {
  try {
    const networkResponse = await fetch(request)
    // Cache successful non-sensitive API responses
    if (networkResponse.ok && !request.url.includes('/auth/')) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await caches.match(request)
    return cached || new Response(JSON.stringify({ error: 'offline', offline: true }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  return cached || fetch(request).catch(() =>
    new Response('Asset unavailable offline', { status: 404 })
  )
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)

  return cached || networkFetch || caches.match('/offline')
}

// Push notifications (WhatsApp alternative for web)
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hirrd', {
      body: data.body || 'You have new job matches',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag || 'hirrd-notification',
      data: { url: data.url || '/dashboard' },
      actions: [
        { action: 'view', title: 'View matches →' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: false,
      silent: false,
    })
  )
})

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
