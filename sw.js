// مسار — Service Worker: بيخزّن التطبيق والمكتبات عشان يفتح من غير نت (البيانات نفسها بتتخزن في التطبيق)
const SHELL = "masar-shell-v2";
const LIBS = "masar-libs-v1";
const SHELL_FILES = ["./", "./index.html", "./app.js", "./athkar.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];
const LIB_URLS = [
  "https://unpkg.com/react@18.2.0/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Amiri+Quran&display=swap"
];
const LIB_HOSTS = ["unpkg.com", "cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    try {
      const s = await caches.open(SHELL);
      await Promise.all(SHELL_FILES.map(f => s.add(new Request(f, { cache: "reload" })).catch(() => {})));
      const l = await caches.open(LIBS);
      await Promise.all(LIB_URLS.map(u => l.add(new Request(u, { mode: "cors" })).catch(() => {})));
    } catch (err) {}
    self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = [SHELL, LIBS];
    for (const n of await caches.keys()) if (!keep.includes(n)) await caches.delete(n);
    await self.clients.claim();
  })());
});
async function networkFirst(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs))]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
  return res;
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (LIB_HOSTS.includes(url.hostname)) { e.respondWith(cacheFirst(req, LIBS)); return; }
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req, SHELL, 4000)); }
  // أي حاجة تانية (Supabase / Worker / Cloudinary) بتعدّي مباشرة من غير تخزين
});
