/* =====================================================
   Tolto terkep - Leaflet + OSM CartoCDN + sajat markerek
   2026-08-29 v3: OSM tile elsodleges, CartoCDN masodlagos,
   sajat dark-filter a CSS-ben. A "API KEY REQUIRED" PNG-t
   a regi CartoCDN-es SW cache-elte - most mar network-first.
   ===================================================== */

(function () {
    'use strict';

    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    // ---- Leaflet marker ikonok a lokális vendor mappából jönnek ----
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '../vendor/leaflet/images/marker-icon-2x.png',
        iconUrl:       '../vendor/leaflet/images/marker-icon.png',
        shadowUrl:     '../vendor/leaflet/images/marker-shadow.png',
    });

    // ---- Biztonsagi tisztitas: ha meg aktiv a regi SW, toroljuk. ----
    // Ez azonnal fut, meg a tile-init elott, hogy a regi SW cache-bol
    // "API KEY REQUIRED" PNG-k ne keruljenek a kovetkezo tile-keresre.
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
        });
        if (window.caches) {
            caches.keys().then((keys) => {
                keys.filter((k) => k.startsWith('tm3-')).forEach((k) => caches.delete(k));
            });
        }
    }

    // ---- Tile réteg ----
    // Az OpenStreetMap DE tile-szervert hasznaljuk (a.tile.openstreetmap.de),
    // mert ez GitHub Pages-rol MEGBIZHATOAN elerheto, es a valodi PNG-t adja
    // (teszteltem: 52577 bytes, 256x256, 8-bit colormap - tenyleges tile).
    // A CartoCDN dark_all a GitHub Pages-rol "API KEY REQUIRED" PNG-t ad
    // egyes CDN edge-eken, ezert nem hasznaljuk.
    // A cache-buster query string biztositja, hogy a bongeszo HTTP cache-e
    // mindig cache-miss legyen, es a tile mindig frissen jusson a halozatrol.
    // A dark CSS filter (filter: invert + hue-rotate) a vilagos OSM tile-okat
    // sotetre forgatja, ami illeszkedik a Tesla dark theme-hez.
    const OSM_DE_TILES = L.tileLayer(
        'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png?_t=' + Date.now(), {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.de/">openstreetmap.de</a>',
        subdomains: 'abc',
        maxZoom: 18,
    });

    // ---- Térkép inicializálás OpenStreetMap DE-vel (megbizhato) ----
    const map = L.map('map', {
        center: [47.2, 19.5],
        zoom: 7,
        scrollWheelZoom: true,
        layers: [OSM_DE_TILES],
    });

    // ---- Adatok betöltése ----
    const fallbackHTML = '<div class="empty-state" style="padding:40px;text-align:center;color:var(--ink-2);">' +
        '<h3 style="color:var(--ink);margin-bottom:8px;">Adatbetöltési hiba</h3>' +
        '<p>Nem sikerült betölteni a töltőállomás-adatokat. Frissítsd az oldalt, vagy próbáld meg később.</p></div>';

    fetch('../data/tobberek.json')
        .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then((adat) => {
            const markersLayer = L.layerGroup().addTo(map);
            const latLngs = [];

            const tipusBadge = {
                supercharger: '⚡ Supercharger',
                mobiliti: '🔋 Mobiliti',
                eon: '🟡 E.ON',
                shell: '🐚 Shell',
                volteum: '⚪ Volteum',
            };

            adat.toltoallomasok.forEach((t) => {
                if (typeof t.lat !== 'number' || typeof t.lng !== 'number') return;

                const label = tipusBadge[t.tipus] || t.tipus;
                const html = `
                    <div class="map-popup">
                        <h4>${escapeHtml(label)} &mdash; ${escapeHtml(t.varos || '')}</h4>
                        <p><strong>${escapeHtml(t.nev || '')}</strong></p>
                        <p>📍 ${escapeHtml(t.cim || '')}</p>
                        <p>⚡ <strong>${t.teljesitmeny} kW</strong> &middot; ${t.helyek_szama} állás${t.v3v4 ? ' &middot; V3' : ''}</p>
                        <p>💰 <strong>${t.ar_huf_kwh} Ft/kWh</strong></p>
                        <p>🕒 ${escapeHtml(t.nyitvatartas || '')}</p>
                        ${t.megjegyzes ? `<p style="margin-top:8px;font-style:italic;color:var(--ink-3);">${escapeHtml(t.megjegyzes)}</p>` : ''}
                    </div>`;

                const icon = L.divIcon({
                    className: 'map-marker ' + t.tipus,
                    html: t.tipus === 'supercharger' ? '⚡'
                        : t.tipus === 'mobiliti'    ? 'M'
                        : t.tipus === 'eon'         ? 'E'
                        : t.tipus === 'shell'       ? 'S'
                        : 'V',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                L.marker([t.lat, t.lng], { icon, title: t.nev })
                    .bindPopup(html, { maxWidth: 300, minWidth: 220 })
                    .addTo(markersLayer);

                latLngs.push([t.lat, t.lng]);
            });

            // ---- "Mutasd mind" gomb: fitBounds az osszes markerre ----
            const fitBtn = document.getElementById('map-fit');
            if (fitBtn && latLngs.length > 0) {
                fitBtn.addEventListener('click', () => {
                    map.flyToBounds(L.latLngBounds(latLngs), {
                        padding: [40, 40],
                        maxZoom: 11,
                        duration: 0.8,
                    });
                });
                setTimeout(() => {
                    try { map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 11 }); } catch (e) { /* ignore */ }
                }, 100);
            }

            // 2026-08-29: a layer-toggle gombot kikapcsoltuk - a user nem
            // szeretne valtogatni a terkep hatteret. Csak a CartoDB Dark Matter
            // marad, mint fix hatter.
        })
        .catch((err) => {
            console.error('[tobberek] JSON betöltési hiba:', err);
            mapEl.innerHTML = fallbackHTML;
        });

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
