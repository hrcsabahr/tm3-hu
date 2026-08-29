/* =====================================================
   tm3.hu - Service Worker (PWA + offline cache)
   2026-08-29 v6: query-string verzió a regisztrációban, így a bongeszo
   MINDIG ujnak tekinti a SW-t. Az activate event minden tm3-* cache-t
   torol (kiveve az aktualisat), self.unregister() hív, és a fetch
   handler a kulso tile-keresekre soha nem valaszol - a bongeszo
   kozvetlenul a halozatrol tolt. A regi tm3-v3 SW cache-elt
   "API KEY REQUIRED" PNG-k mostantol elerhetetlenek.

   A tobberek.html NEM tolti ezt a SW-t (lasd pwa.js), igy a terkep
   oldalon a SW egyáltalán nem fut.
   ===================================================== */

const SW_SCOPE = self.location.pathname.replace(/\/service-worker\.js.*$/, '');
const REPO_PREFIX = SW_SCOPE.endsWith('/tm3-hu') || SW_SCOPE === '/tm3-hu'
    ? '/tm3-hu'
    : '';

const CACHE = 'tm3-v7';

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
    `${REPO_PREFIX}/assets/js/kalkulator.js`,
    `${REPO_PREFIX}/assets/js/tco.js`,
    `${REPO_PREFIX}/assets/js/fogyasztas.js`,
    `${REPO_PREFIX}/assets/js/hibak.js`,
    `${REPO_PREFIX}/assets/js/vasarlas.js`,
    `${REPO_PREFIX}/assets/js/blog.js`,
    `${REPO_PREFIX}/assets/js/pwa.js`,
    `${REPO_PREFIX}/pages/kalkulator.html`,
    `${REPO_PREFIX}/pages/tco.html`,
    `${REPO_PREFIX}/pages/blog.html`,
    `${REPO_PREFIX}/pages/szervizek.html`,
    `${REPO_PREFIX}/pages/hibak.html`,
    `${REPO_PREFIX}/pages/vasarlas.html`,
    `${REPO_PREFIX}/pages/kozosseg.html`,
    `${REPO_PREFIX}/pages/fogyasztas.html`,
    `${REPO_PREFIX}/pages/jogi.html`,
    // A tobberek.html szandekosan NINCS itt - a terkep oldal nem tolti a SW-t.
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

// 2026-08-29: fogadjuk a SKIP_WAITING uzenetet a fo thread-rol, hogy az uj SW
// azonnal aktiválódjon (a pwa.js kuldi, amikor regisztracio utan varakozo SW-t
// talal). Igy a felhasznalo nem kell zárnia-nyitnia a tabot.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', (event) => {
    // Minden tm3-* cache-t torlunk (kivéve az aktuálisat), és unregistereljük
    // a regi SW-ket, hogy a "API KEY REQUIRED" PNG-k soha többet ne jelenjenek meg.
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k.startsWith('tm3-') && k !== CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = request.url;

    // Kulso tile-szerverek (OSM, CartoDB, Stamen, stb.): a SW nem avatkozik be.
    // A bongeszo kozvetlenul a halozatrol tolt, igy a cache nem zavar be.
    // Ha megis szolgalni akarna, a regi "API KEY REQUIRED" PNG-k helyett normalis 403-at kap.
    if (/tile\.openstreetmap\.org|basemaps\.cartocdn\.com|tiles\.stadiamaps\.com|tile\.stamen\.com|opentopomap\.org|maps\.wikimedia\.org/.test(url)) {
        return; // NEM respondWith - a bongeszo fetch-el a hálózaton
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

    // Sajat asset-ek: cache-first (offline mukodes).
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
