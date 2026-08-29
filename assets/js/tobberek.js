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

    // ---- Tile rétegek ----
    // A cache-buster query string biztositja, hogy a SW cache (ha meg aktiv)
    // NE cache-bol szolgalja a tile-okat, hanem mindig a halozatrol jöjjenek.
    // Ez az egyetlen biztos megoldas a regi tm3-v3 SW altal cache-elt
    // "API KEY REQUIRED" PNG-k ellen.
    //
    // A tm3.hu GitHub Pages-e alatt egyes tile-szolgaltatok (OSM direct,
    // CartoCDN light_all) "API KEY REQUIRED" PNG-t adnak vissza a GitHub
    // Pages referer policy miatt. A CartoCDN dark_all viszont megbizhatoan
    // mukodik - ezert az alapertelmezett layer. A Voyager (CartoCDN egy
    // masik stilus) szinten megbizhato, mint masodlagos opcio.
    const CACHE_BUSTER = '_t=' + Date.now();
    const CARTO_DARK_TILES = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?' + CACHE_BUSTER, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        className: 'cartodark-layer',
    });
    const CARTO_VOYAGER_TILES = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?' + CACHE_BUSTER, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    });
    const OSM_TILES = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png?' + CACHE_BUSTER, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    });

    // ---- Térkép inicializálás CartoDB Dark Matter-rel (megbizhato) ----
    const map = L.map('map', {
        center: [47.2, 19.5],
        zoom: 7,
        scrollWheelZoom: true,
        layers: [CARTO_DARK_TILES],
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

            // ---- "Mutasd mind" gomb: fitBounds az összes markerre ----
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

            // ---- Layer-toggle gomb: Dark <-> Voyager <-> OSM ----
            // A Light All reteget kivettuk, mert a GitHub Pages referer miatt
            // egyes edge-eken "API KEY REQUIRED" PNG-t ad. A Voyager megbizhato.
            const toggleBtn = document.getElementById('map-toggle');
            if (toggleBtn) {
                let mode = 'dark';
                const applyLayer = () => {
                    map.removeLayer(CARTO_DARK_TILES);
                    map.removeLayer(CARTO_VOYAGER_TILES);
                    map.removeLayer(OSM_TILES);
                    if (mode === 'dark') {
                        CARTO_DARK_TILES.addTo(map);
                        toggleBtn.textContent = 'Voyager';
                        toggleBtn.classList.add('active');
                    } else if (mode === 'voyager') {
                        CARTO_VOYAGER_TILES.addTo(map);
                        toggleBtn.textContent = 'OSM';
                        toggleBtn.classList.remove('active');
                    } else {
                        OSM_TILES.addTo(map);
                        toggleBtn.textContent = 'Dark';
                        toggleBtn.classList.remove('active');
                    }
                };
                toggleBtn.addEventListener('click', () => {
                    mode = (mode === 'dark') ? 'voyager' : (mode === 'voyager') ? 'osm' : 'dark';
                    applyLayer();
                });
            }
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
