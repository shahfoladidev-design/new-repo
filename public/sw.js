const CACHE = "shah-foladi-static-v12";

const PRECACHE = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/brand/logo-header.png",
  "/icons/apple-touch-icon.png",
  "/icons/pwa-192x192.png",
  "/icons/pwa-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    void network;
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(
          "<!doctype html><title>Offline</title><p>You appear to be offline. Please try again.</p>",
          { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      }),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request, CACHE));
    return;
  }

  // Let the browser handle RSC / router prefetch natively — SW interception adds latency.
  if (
    url.pathname.startsWith("/_next/") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1"
  ) {
    return;
  }

  if (
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/media/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE));
    return;
  }

  if (/\.(ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE).then((cache) => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => Response.error()),
      ),
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => Response.error()));
});
