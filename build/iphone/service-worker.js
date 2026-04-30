const CACHE_NAME = "v6-fitness-dashboard-v6-iphone";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./js/algorithm.js",
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
  "./js/usdaFoodData.js",
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

  if (isDocument || isAppShellAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || caches.match("./index.html");
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match("./index.html");
        });
    }),
  );
});
