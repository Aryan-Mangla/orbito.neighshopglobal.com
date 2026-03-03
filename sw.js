/* Minimal service worker: offline fallback to index.html for SPA */
const CACHE = "pm-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add("/index.html"))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/index.html"))
  );
});
