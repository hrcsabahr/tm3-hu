/* =====================================================
   tm3.hu — Service Worker (PWA + offline cache)
   ===================================================== */

// Repo prefix: ha a /tm3-hu/ alatt vagyunk (GitHub Pages user-site),
// használjuk azt prefixként; ha a tm3.hu domain alatt (custom domain),
// üres string.
const SW_SCOPE = self.location.pathname.replace(/\/service-worker\.js.*$/, '');
const REPO_PREFIX = SW_SCOPE.endsWith('/tm3-hu') || SW_SCOPE === '/tm3-hu'
    ? '/tm3-hu'
    : '';

const CACHE = 'tm3-v2';
const ASSETS = [
    `${REPO_PREFIX}/`,
    `${REPO_PREFIX}/index.html`,
    `${REPO_PREFIX}/styles.css`,
    `${REPO_PREFIX}/assets/css/site.css`,
    `${REPO_PREFIX}/assets/css/design-system.css`,
    `${REPO_PREFIX}/assets/css/_legacy.css`,
    `${REPO_PREFIX}/assets/js/util.js`,
    `${REPO_PREFIX}/assets/js/site.js`,
    `${REPO_PREFIX}/assets/js/szervizek.js`,
    `${REPO_PREFIX}/assets/js/tobberek.js`,
    `${REPO_PREFIX}/assets/js/kalkulator.js`,
    `${REPO_PREFIX}/assets/js/tco.js`,
    `${REPO_PREFIX}/assets/js/fogyasztas.js`,
    `${REPO_PREFIX}/assets/js/hibak.js`,
    `${REPO_PREFIX}/assets/js/vasarlas.js`,
    `${REPO_PREFIX}/assets/js/blog.js`,
    `${REPO_PREFIX}/pages/kalkulator.html`,
    `${REPO_PREFIX}/pages/tco.html`,
    `${REPO_PREFIX}/pages/blog.html`,
    `${REPO_PREFIX}/pages/szervizek.html`,
    `${REPO_PREFIX}/pages/tobberek.html`,
    `${REPO_PREFIX}/pages/hibak.html`,
    `${REPO_PREFIX}/pages/vasarlas.html`,
    `${REPO_PREFIX}/pages/kozosseg.html`,
    `${REPO_PREFIX}/pages/fogyasztas.html`,
    `${REPO_PREFIX}/manifest.json`,
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
