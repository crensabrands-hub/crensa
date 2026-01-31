/* eslint-disable no-restricted-globals */

const STATIC_CACHE = "crensa-static-v1";

// Only PUBLIC, SAFE assets (never HTML, never APIs)
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/* ===============================
   INSTALL
   =============================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate new SW immediately
  self.skipWaiting();
});

/* ===============================
   ACTIVATE
   =============================== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );

  // Take control of open tabs
  self.clients.claim();
});

/* ===============================
   FETCH — ASSET ONLY
   =============================== */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 🚫 Never touch APIs
  if (url.pathname.startsWith("/api/")) return;

  // 🚫 Only same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache only SAFE asset types
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Serve from cache if available
        if (cached) return cached;

        // Otherwise fetch from network
        return fetch(request).then((networkResponse) => {
          // Guard against bad responses
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }

          // 🔑 CLONE IMMEDIATELY (fixes your error)
          const responseClone = networkResponse.clone();

          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          // Return original response to browser
          return networkResponse;
        });
      })
    );
  }
});
