const CACHE_NAME = "v6-macro-calculator-v5";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./js/algorithm.js?v=navy2",
  "./js/calendar.js",
  "./js/charts.js",
  "./js/coach.js",
  "./js/dashboard.js",
  "./js/edamam.js",
  "./js/food.js",
  "./js/foodSearch.js",
  "./js/foodLog.js",
  "./js/main.js",
  "./js/mealPlanner.js",
  "./js/openFoodFacts.js",
  "./js/pantry.js",
  "./js/recipes.js",
  "./js/seeds.js",
  "./js/state.js",
  "./js/storage.js",
  "./js/ui.js",
  "./js/utils.js",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-192.svg",
  "./assets/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isDocument = event.request.mode === "navigate";
  const isAppShellAsset =
    event.request.destination === "script" ||
    event.request.destination === "style" ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".html");

  // Stale-While-Revalidate strategy for app shell and documents:
  // - Return cached response immediately when available
  // - Fetch from network in background and update cache
  // - Fallback to cached index.html if nothing available
  const staleWhileRevalidate = async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const networkFetch = fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          try {
            cache.put(request, networkResponse.clone());
          } catch (e) {
            // ignore cache put failures
          }
        }
        return networkResponse;
      })
      .catch(() => null);

    // Return cache immediately if present, otherwise wait for network
    if (cachedResponse) {
      // kick off background update but don't block response
      void networkFetch;
      return cachedResponse;
    }

    const net = await networkFetch;
    return net || (await caches.match("./index.html"));
  };

  if (isDocument || isAppShellAsset) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // For other assets use cache-first with background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
