const CACHE = "dpi-v1";
const ASSETS = ["./index.html","./manifest.json","./icon-180.png","./icon-192.png","./icon-512.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  if(req.url.includes("supabase.co")) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
