// Apex Studios DJ App — keeps the app itself on the phone. Your songs live in the app's own storage, not here.
const V = "apex-6.96";
const SHELL = ["./", "index.html", "manifest.webmanifest", "logo-poster.jpg", "icon-180.png", "icon-512.png", "icon-64.png", "og-image.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("apex-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || r.headers.has("range") || /\.mp4$/.test(u.pathname)) return;   // the logo video streams from the web
  if (r.mode === "navigate") {   // the app page: newest version when online, the saved copy when not
    e.respondWith(fetch(r).then(res => { if (!res.ok) throw new Error(res.status); const c = res.clone(); caches.open(V).then(x => x.put("index.html", c)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  if (u.origin !== location.origin && !/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)) return;
  e.respondWith(caches.match(r).then(hit => {   // icons, DJ drops, fonts: the saved copy right away, refreshed in the background
    const net = fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
