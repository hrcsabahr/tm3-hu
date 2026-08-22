/* Tesla VIN Checker
 * Bekéri a 17 karakteres Tesla VIN-t, hívja a NHTSA vPIC API-t
 * (https://vpic.nhtsa.dot.gov/api/), és a data/tesla_vin_variants.json
 * lookup-ból adja a Tesla-specifikus specifikációkat.
 */
(function () {
    'use strict';

    const NHTSA_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/';
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

    function getVariant(vin, modelYear) {
        // Tesla VIN 4-8. karakter: VDS kód. A 10. karakter: model year code.
        // A lookup tábla a vin_prefix + évjárat alapján azonosít.
        const vds = (vin || '').slice(3, 8);
        // Year code (position 10) → year (NHTSA értelmezi).
        // Itt egyszerűsítve: a 10. karakter indexel egy year-kód táblát.
        const YEAR_CODES = {
            'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016,
            'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023,
            'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029, 'Y': 2030,
        };
        const year = YEAR_CODES[(vin || '').charAt(9).toUpperCase()] || modelYear;

        // Match by VDS prefix and year range.
        const entries = Object.entries(variantsCache);
        for (const [key, v] of entries) {
            const yearStart = v.model_years[0];
            const yearEnd = v.model_years[v.model_years.length - 1];
            if (year >= yearStart && year <= yearEnd &&
                v.vin_prefix.some(p => vds.startsWith(p))) {
                return { key, ...v, year };
            }
        }
        // Fallback: return the closest by year
        for (const [key, v] of entries) {
            const yearStart = v.model_years[0];
            const yearEnd = v.model_years[v.model_years.length - 1];
            if (year >= yearStart && year <= yearEnd) {
                return { key, ...v, year };
            }
        }
        return null;
    }

    function renderResult(nhtsa, variant) {
        // NHTSA fields: Make, Model, ModelYear, BodyClass, DriveType, FuelType, etc.
        const get = (name) => {
            const r = (nhtsa.Results || []).find(x => x.Variable === name);
            return r ? (r.Value || '—') : '—';
        };

        const make = get('Make');
        const model = get('Model');
        const year = get('Model Year') || (variant ? variant.year : '—');
        const body = get('Body Class') || 'Sedan/Saloon';
        const drive = get('Drive Type') || (variant ? variant.drive : '—');
        const fuel = get('Fuel Type') || 'Electric';
        const madeIn = get('Plant Country') || (variant ? variant.production : '—');
        const errorCode = get('Error Code');

        let variantHtml = '';
        if (variant) {
            variantHtml = `
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
        } else {
            variantHtml = `<p class="vin-note">A VIN "${vin}" alapján a rendszerünk nem talált pontos specifikációt a Tesla Model 3 táblázatban. Próbáld meg a Tesla configurator-on vagy a NHTSA <a href="${NHTSA_URL}${vin}?format=json" target="_blank" rel="noopener">VIN dekóder</a> oldalon.</p>`;
        }

        result.innerHTML = `
            <div class="vin-card">
                <header class="vin-card__header">
                    <div>
                        <div class="vin-card__title">${make} ${model}</div>
                        <div class="vin-card__sub">${year} · ${body} · ${fuel}</div>
                    </div>
                    <div class="vin-card__vin">${vin}</div>
                </header>
                <dl class="vin-card__meta">
                    <div><dt>Meghajtás</dt><dd>${drive}</dd></div>
                    <div><dt>Gyártás helye</dt><dd>${madeIn}</dd></div>
                    <div><dt>Forrás</dt><dd>NHTSA vPIC + Tesla VIN lookup</dd></div>
                </dl>
                ${variantHtml}
            </div>`;
        result.hidden = false;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vin = input.value.trim().toUpperCase();
        // Validate: 17 chars, A-H J-N P-R Z 0-9 (no I, O, Q)
        if (vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
            status.textContent = 'A VIN 17 karakter hosszú, A-H és J-N és P-R és Z és 0-9 betűket/számokat tartalmazhat (I, O, Q nélkül).';
            status.className = 'vin-status vin-status--error';
            result.hidden = true;
            return;
        }
        status.className = 'vin-status';
        status.textContent = 'Lekérdezés folyamatban...';
        result.hidden = true;
        try {
            await loadVariants();
            const r = await fetch(NHTSA_URL + vin + '?format=json');
            if (!r.ok) throw new Error('NHTSA HTTP ' + r.status);
            const data = await r.json();
            const variant = getVariant(vin, parseInt(((data.Results || []).find(x => x.Variable === 'Model Year') || {}).Value, 10));
            renderResult(data, variant);
            status.textContent = 'Sikeres lekérdezés.';
            status.className = 'vin-status vin-status--ok';
        } catch (err) {
            status.textContent = 'Hiba a lekérdezés során: ' + (err.message || err);
            status.className = 'vin-status vin-status--error';
            result.hidden = true;
        }
    });

    // Uppercase + live filter
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    });
})();