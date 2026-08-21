/* =====================================================
   Töltő térkép — Leaflet + OSM + saját markerek
   ===================================================== */

(async function () {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    // Magyarország középpont
    const map = L.map('map', {
        center: [47.2, 19.5],
        zoom: 7,
        scrollWheelZoom: true,
    });

    // Sötét OSM tile (CartoDB Dark Matter — ingyenes, OSM alapú)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(map);

    let adat;
    try {
        const res = await fetch('../data/tobberek.json');
        adat = await res.json();
    } catch (e) {
        mapEl.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + e.message + '</p></div>';
        return;
    }

    const tipusBadge = {
        supercharger: '⚡ Supercharger',
        mobiliti: '🔋 Mobiliti',
        eon: '🟡 E.ON',
        shell: '🐚 Shell',
        volteum: '⚪ Volteum',
    };

    adat.toltoallomasok.forEach((t) => {
        const label = tipusBadge[t.tipus] || t.tipus;
        const icon = L.divIcon({
            className: 'map-marker ' + t.tipus,
            html: t.tipus === 'supercharger' ? '⚡' : t.tipus === 'mobiliti' ? 'M' : t.tipus === 'eon' ? 'E' : t.tipus === 'shell' ? 'S' : 'V',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const popup = `
            <div class="map-popup">
                <h4>${label} — ${t.varos}</h4>
                <p><strong>${t.nev}</strong></p>
                <p>📍 ${t.cim}</p>
                <p>⚡ <strong>${t.teljesitmeny} kW</strong> · ${t.helyek_szama} állás${t.v3v4 ? ' · V3' : ''}</p>
                <p>💰 <strong>${t.ar_huf_kwh} Ft/kWh</strong></p>
                <p>🕒 ${t.nyitvatartas}</p>
                ${t.megjegyzes ? `<p style="margin-top:8px;font-style:italic;color:#888;">${t.megjegyzes}</p>` : ''}
            </div>`;

        L.marker([t.lat, t.lng], { icon })
            .addTo(map)
            .bindPopup(popup);
    });
})();
