const CACHE_NAME = 'formiq-v1'
const OFFLINE_URL = '/offline.html'

const APP_SHELL = [
  '/',
  '/app/home',
  OFFLINE_URL,
]

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch strategy
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API: Network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Static assets: Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // Pages: Stale while revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return res
      }).catch(() => cached ?? caches.match(OFFLINE_URL))

      return cached ?? networkFetch
    })
  )
})

// Background Sync: workout completion
self.addEventListener('sync', event => {
  if (event.tag === 'workout-complete') {
    event.waitUntil(syncOfflineWorkouts())
  }
})

async function syncOfflineWorkouts() {
  const db = await openDB()
  const pendingWorkouts = await db.getAll('pending_workouts')

  for (const workout of pendingWorkouts) {
    try {
      const res = await fetch(`/api/workouts/${workout.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout.data),
      })
      if (res.ok) {
        await db.delete('pending_workouts', workout.id)
      }
    } catch {}
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'FORMIQ', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: data.tag ?? 'formiq',
      data: { url: data.url ?? '/app/home' },
      actions: data.actions ?? [],
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/app/home'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})

// Minimal IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('formiq-offline', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('pending_workouts', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve({
      getAll: store => new Promise(res => {
        const tx = req.result.transaction(store, 'readonly')
        const r = tx.objectStore(store).getAll()
        r.onsuccess = () => res(r.result)
      }),
      delete: (store, key) => new Promise(res => {
        const tx = req.result.transaction(store, 'readwrite')
        tx.objectStore(store).delete(key)
        tx.oncomplete = () => res()
      }),
    })
    req.onerror = reject
  })
}
