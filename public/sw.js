/*
 * Souls Align service worker — network-only.
 *
 * Deliberately does NOT cache app bundles or navigations. Caching Next.js
 * chunks caused stale UI in development (old code masking new code). This
 * worker keeps the app installable (it has a fetch handler + the manifest and
 * icons are served normally) without ever serving stale assets, and it purges
 * any caches left behind by earlier versions of this worker.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge every cache created by any previous worker version.
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Network-only: no respondWith → the browser fetches everything fresh.
self.addEventListener("fetch", () => {});
