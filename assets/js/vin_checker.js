/* Tesla VIN Checker — LOCAL LOOKUP ONLY (no external API)
 * A böngészőből a NHTSA vPIC API-t a CORS tiltja, ezért csak a helyi
 * data/tesla_vin_variants.json táblát használjuk. Ha a VIN nem található
 * a táblában, egyszerűen "Ismeretlen VIN" üzenetet adunk.
 */
(function () {
    'use strict';

    const VARIANTS_URL = 'data/tesla_vin_variants.json';

    const form = document.getElementById('vin-form');
    const input = document.getElementById('vin-input');
    const status = document.getElementById('vin-status');
    const result = document.getElementById('vin-result');
    if (!form || !input) return;

    let variantsCache = null;

    async function loadVariants() {
        if (variantsCache) return variantsCache;
        try {
            const r = await fetch(VARIANTS_URL, { cache: 'force-cache' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const data = await r.json();
            variantsCache = data.variants || {};
            return variantsCache;
        } catch (e) {
            console.warn('VIN lookup load failed:', e);
            return {};
        }
    }

    // Tesla VIN dekódolás a helyi táblából.
    // A VIN 17 karakter: 1-3 WMI (5YJ=Tesla), 4-8 VDS (modell/konfiguráció),
    // 9 check digit, 10 modell év kód, 11 gyár kód, 12-17 sorozatszám.
    function getVariant(vin) {
        const vds = (vin || '').slice(3, 8);
        const YEAR_CODES = {
            'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021, 'N': 2022,
            'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028,
            'X': 2029, 'Y': 2030,
        };
        const year = YEAR_CODES[(vin || '').charAt(9).toUpperCase()] || null;

        const entries = Object.entries(variantsCache);
        // Exact match: VDS prefix + year range
        for (const [key, v] of entries) {
            const yearStart = v.model_years[0];
            const yearEnd = v.model_years[v.model_years.length - 1];
            if (year !== null && year >= yearStart && year <= yearEnd &&
                v.vin_prefix.some(p => vds.startsWith(p))) {
                return { key, ...v, year };
            }
        }
        // Fallback: csak évjárat alapján
        if (year !== null) {
            for (const [key, v] of entries) {
                const yearStart = v.model_years[0];
                const yearEnd = v.model_years[v.model_years.length - 1];
                if (year >= yearStart && year <= yearEnd) {
                    return { key, ...v, year };
                }
            }
        }
        return null;
    }

    function renderResult(vin, variant) {
        if (!variant) {
            result.innerHTML = `
                <div class="vin-card">
                    <header class="vin-card__header">
                        <div>
                            <div class="vin-card__title">Ismeretlen VIN</div>
                            <div class="vin-card__sub">A VIN "${vin}" nem található a Tesla Model 3 lookup táblában.</div>
                        </div>
                        <div class="vin-card__vin">${vin}</div>
                    </header>
                    <p class="vin-note">Csak a 2017–2025 közötti Model 3 SR+, Long Range, Performance és Highland variánsok támogatottak. Próbálj meg egy másik Tesla VIN-t, vagy ellenőrizd a Tesla konfigurátorban.</p>
                </div>`;
            result.hidden = false;
            return;
        }

        let variantHtml = `
            <div class="vin-specs">
                <h3 class="vin-specs__title">${variant.key.replace(/_/g, ' ')} (${variant.year})</h3>
                <div class="vin-specs__grid">
                    <div class="vin-spec"><div class="vin-spec__label">Akkumulátor</div><div class="vin-spec__value">${variant.battery_kwh} kWh</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Hatótáv (WLTP)</div><div class="vin-spec__value">${variant.range_km} km</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Hatótáv (EPA)</div><div class="vin-spec__value">${variant.range_epa_miles} mi</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">0-100 km/h</div><div class="vin-spec__value">${variant.acceleration_0_100} s</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Végsebesség</div><div class="vin-spec__value">${variant.top_speed_kmh} km/h</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Meghajtás</div><div class="vin-spec__value">${variant.drive}</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Motor</div><div class="vin-spec__value">${variant.motor}</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Teljesítmény</div><div class="vin-spec__value">${variant.hp} HP</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Forgatónyomaték</div><div class="vin-spec__value">${variant.torque_nm} Nm</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Tömeg</div><div class="vin-spec__value">${variant.weight_kg} kg</div></div>
                    <div class="vin-spec"><div class="vin-spec__label">Gyártás</div><div class="vin-spec__value">${variant.production}</div></div>
                </div>
            </div>`;

        result.innerHTML = `
            <div class="vin-card">
                <header class="vin-card__header">
                    <div>
                        <div class="vin-card__title">Tesla Model 3</div>
                        <div class="vin-card__sub">${variant.year} · ${variant.drive} · ${variant.motor}</div>
                    </div>
                    <div class="vin-card__vin">${vin}</div>
                </header>
                ${variantHtml}
            </div>`;
        result.hidden = false;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vin = input.value.trim().toUpperCase();
        if (vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
            status.textContent = 'A VIN 17 karakter hosszú, A-H és J-N és P-R és Z és 0-9 betűket/számokat tartalmazhat (I, O, Q nélkül).';
            status.className = 'vin-status vin-status--error';
            result.hidden = true;
            return;
        }
        status.className = 'vin-status';
        status.textContent = 'Keresés...';
        result.hidden = true;
        await loadVariants();
        const variant = getVariant(vin);
        renderResult(vin, variant);
        if (variant) {
            status.textContent = 'Sikeres lekérés.';
            status.className = 'vin-status vin-status--ok';
        } else {
            status.textContent = 'A VIN nincs a Tesla Model 3 táblában.';
            status.className = 'vin-status vin-status--error';
        }
    });

    // Uppercase + live filter
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    });
})();
