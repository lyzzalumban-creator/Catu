/* penniq: service worker sederhana (mode offline). Naikkan VERSI bila daftar berkas berubah.
   Berkas milik penniq diambil dari jaringan dulu (supaya versi baru cepat muncul), cadangannya cache.
   Login Google dan API Drive tidak pernah disentuh. */
const VERSI = 'penniq-v6';
const INTI = ['./', 'index.html', 'app.css', 'app.js', 'bg.js', 'manifest.json',
  'assets/logo/penniq-ikon-192.png', 'assets/logo/penniq-ikon-512.png', 'assets/logo/penniq-maskable-512.png'];
const FONT = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(INTI.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const sama = u.origin === self.location.origin, font = FONT.includes(u.hostname);
  if (!sama && !font) return; /* Google OAuth, Drive API, dll. langsung ke jaringan */
  e.respondWith(
    fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const salin = res.clone(); caches.open(VERSI).then(c => c.put(r, salin)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(h => h || (r.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
