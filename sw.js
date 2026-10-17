const CACHE = 'biblioteca-v3';
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./', './index.html', ...CDN]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(
      fetch(r)
        .then(res => {
          const cp = res.clone();
          caches.open(CACHE).then(c => c.put(r, cp));
          return res;
        })
        .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
    );
  } else if (CDN.includes(r.url)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r)));
  }
});
