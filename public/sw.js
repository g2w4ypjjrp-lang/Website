/* Eksen service worker: yalnızca statik varlıkları önbelleğe alır ve çevrimdışıyken sade bir sayfa gösterir.
   Kişisel veri içeren panel/API yanıtları asla önbelleğe alınmaz. */
const VERSION = "eksen-v1";
const OFFLINE = "/cevrimdisi";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll([OFFLINE, "/icon.svg"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
  }
});
