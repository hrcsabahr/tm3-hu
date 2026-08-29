/* =====================================================
   Tolto terkep - Leaflet + OSM CartoCDN + sajat markerek
   2026-08-29 revizio: vendorolt Leaflet, fitBounds,
   layer-toggle (dark/light), fit-all gomb, hibakezeles.
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

    // ---- Tile rétegek (CartoCDN - API key nelkul, ingyenes) ----
    const DARK_TILES = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    });
    const LIGHT_TILES = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    });

    // ---- Térkép inicializálás ----
    const map = L.map('map', {
        center: [47.2, 19.5],
        zoom: 7,
        scrollWheelZoom: true,
        layers: [DARK_TILES],
    });

    // ---- Adatok betöltése ----
    const fallbackHTML = '<div class="empty-state" style="padding:40px;text-align:center;color:var(--ink-2);">' +
        '<h3 style="color:var(--ink);margin-bottom:8px;">Adatbetöltési hiba</h3>' +
        '<p> Nem sikerült betölteni a töltőállomás-adatokat. Frissítsd az oldalt, vagy próbáld meg később.</p></div>';

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
                        <p>� ${escapeHtml(t.nyitvatartas || '')}</p>
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
                // induláskor is illeszkedjen
                setTimeout(() => {
                    try { map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 11 }); } catch (e) { /* ignore */ }
                }, 100);
            }

            // ---- Layer-toggle gomb: dark <-> light ----
            const toggleBtn = document.getElementById('map-toggle');
            if (toggleBtn) {
                let isDark = true;
                toggleBtn.addEventListener('click', () => {
                    if (isDark) {
                        map.removeLayer(DARK_TILES);
                        LIGHT_TILES.addTo(map);
                        toggleBtn.textContent = 'Sötét';
                        toggleBtn.classList.add('active');
                    } else {
                        map.removeLayer(LIGHT_TILES);
                        DARK_TILES.addTo(map);
                        toggleBtn.textContent = 'Világos';
                        toggleBtn.classList.remove('active');
                    }
                    isDark = !isDark;
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
