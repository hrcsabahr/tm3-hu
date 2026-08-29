/* =====================================================
   tm3.hu - Service Worker (PWA + offline cache)
   2026-08-29 v5: agresziv cache-torles + network-first
   minden kulso tile-keresre. A regi tm3-v3 SW az OSM
   tile-okat "API KEY REQUIRED" PNG-vel cache-elte, ami
   allandoan megjelent a terkepen.
   ===================================================== */

const SW_SCOPE = self.location.pathname.replace(/\/service-worker\.js.*$/, '');
const REPO_PREFIX = SW_SCOPE.endsWith('/tm3-hu') || SW_SCOPE === '/tm3-hu'
    ? '/tm3-hu'
    : '';

const CACHE = 'tm3-v5';

// Csak sajat asset-ek - a kulso tile-okat NEM cache-eljuk, mert
// az OSM/Carto/Stamen CDN-ek ha zarnak vagy limitálnak, "API KEY REQUIRED"
// PNG-t adnak. Ezeket mindig network-first kell szolgalni.
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
    `${REPO_PREFIX}/pages/jogi.html`,
    `${REPO_PREFIX}/assets/css/legal.css`,
    `${REPO_PREFIX}/manifest.json`,
    `${REPO_PREFIX}/vendor/leaflet/leaflet.css`,
    `${REPO_PREFIX}/vendor/leaflet/leaflet.js`,
    `${REPO_PREFIX}/vendor/leaflet/images/marker-icon.png`,
    `${REPO_PREFIX}/vendor/leaflet/images/marker-icon-2x.png`,
    `${REPO_PREFIX}/vendor/leaflet/images/marker-shadow.png`,
    `${REPO_PREFIX}/vendor/leaflet/images/layers.png`,
    `${REPO_PREFIX}/vendor/leaflet/images/layers-2x.png`,
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    // Minden tm3-* cache-t torlunk, kiveve az aktualisat.
    // Regi verziok (tm3-v3, tm3-v4) "API KEY REQUIRED" PNG-t tartalmazhatnak.
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k.startsWith('tm3-') && k !== CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

function isExternalTile(url) {
    // OSM, CartoCDN, Stamen, Stadia - ezek tile-szerverek
    return /tile\.openstreetmap\.org|basemaps\.cartocdn\.com|tiles\.stadiamaps\.com|tile\.stamen\.com|opentopomap\.org|maps\.wikimedia\.org/.test(url);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = request.url;

    // Kulso tile-szerverek: MINDIG network-first, soha ne cache-bol.
    // Ha a network failel, adjunk 404-et, NE a regi cache-bol.
    if (isExternalTile(url)) {
        event.respondWith(
            fetch(request).catch(() => new Response('', { status: 503, statusText: 'Tile server unavailable' }))
        );
        return;
    }

    // HTML: network-first, offline fallback az index.html-re.
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
        );
        return;
    }

    // Egyeb sajat asset-ek: cache-first (offline is mukodjenek).
    if (url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((res) => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, clone));
                    }
                    return res;
                });
            })
        );
        return;
    }

    // Minden mas (Google Fonts stb.): passthrough.
    event.respondWith(fetch(request));
});
