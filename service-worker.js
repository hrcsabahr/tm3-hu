/* =====================================================
   tm3.hu — Service Worker (PWA + offline cache)
   ===================================================== */

const CACHE = 'tm3-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/assets/css/site.css',
    '/assets/css/design-system.css',
    '/assets/css/_legacy.css',
    '/assets/js/util.js',
    '/assets/js/site.js',
    '/assets/js/szervizek.js',
    '/assets/js/tobberek.js',
    '/assets/js/kalkulator.js',
    '/assets/js/tco.js',
    '/assets/js/fogyasztas.js',
    '/assets/js/hibak.js',
    '/assets/js/vasarlas.js',
    '/assets/js/blog.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    // Network-first for HTML, cache-first for static assets
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, clone));
                    return res;
                })
                .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
        );
        return;
    }

    // Cache-first for everything else
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((res) => {
                if (!res || res.status !== 200 || res.type === 'opaque') return res;
                const clone = res.clone();
                caches.open(CACHE).then((cache) => cache.put(request, clone));
                return res;
            });
        })
    );
});
