/* Tesla VIN Checker — TELJES POZÍCIÓ-ALAPÚ DEKÓDER (2026-08-23)
 *
 * Mind a 17 VIN pozíciót dekódolja a data/tesla_vin_decode.json tábla
 * alapján (NHTSA Part 565 + villanyautosok.hu + teslatap.com + tesla-info.com).
 *
 * Felépítés:
 *   1-3   WMI            — gyártó + ország
 *   4     Modell         — S / X / 3 / Y / R / T / C
 *   5     Body + kormány — A/B/C/D
 *   6     Restraint      — airbag öv kombináció
 *   7     Motor/Drive    — single/dual/performance + tekercselés
 *   8     Battery        — kémia + cell gyártó
 *   9     Check digit    — matematikai checksum
 *   10    Model year     — A=2010 ... T=2026
 *   11    Plant          — Fremont/Austin/Shanghai/Berlin/etc.
 *   12-17 Serial         — egyedi gyártási szám
 *
 * A variáns-specifikációk (hatótáv, HP, 0-100) a VIN 4-5-7-8. pozíciói +
 * modell év alapján azonosítódnak a data/tesla_vin_decode.json variants
 * blokkjából.
 */
(function () {
    'use strict';

    const DECODE_URL = 'data/tesla_vin_decode.json';

    const form = document.getElementById('vin-form');
    const input = document.getElementById('vin-input');
    const status = document.getElementById('vin-status');
    const result = document.getElementById('vin-result');
    if (!form || !input) return;

    let decodeCache = null;

    async function loadDecodeTable() {
        if (decodeCache) return decodeCache;
        try {
            const r = await fetch(DECODE_URL, { cache: 'force-cache' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            decodeCache = await r.json();
            return decodeCache;
        } catch (e) {
            console.warn('VIN decode table load failed:', e);
            return null;
        }
    }

    /** Tesla VIN check digit számítás (49 CFR § 565.15(c)) */
    function computeCheckDigit(vin15) {
        const trans = {
            A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
            J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
            S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
            0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
        };
        const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
        // weights 0..7 for vin[0..7], then weight[9] is for vin[9], weight[10] for vin[10] etc.
        // Standard VIN check digit algorithm:
        let sum = 0;
        for (let i = 0; i < 17; i++) {
            const ch = vin15.charAt(i).toUpperCase();
            const val = trans[ch];
            if (val === undefined) return null;
            // Weight pattern: 8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2 (skipping position 9 which is the check digit itself)
            const w = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2][i];
            sum += val * w;
        }
        const remainder = sum % 11;
        return remainder === 10 ? 'X' : String(remainder);
    }

    /** Tesla VIN dekódolás — 2026-08-23 NHTSA Part 565 + villanyautosok.hu + findmyelectric.com.
     *  A VIN 17 karakter pozíciója (Tesla specifikus):
     *    1-3   WMI              — 5YJ=Tesla USA, 7SA=Tesla USA (MX/MY 2022+), LRW=Tesla Shanghai, XP7=Tesla Berlin
     *    4     Modell           — S / X / 3 / Y / R / T / C
     *    5     Body + kormány   — A=Model S LHD, B=RHD, C=Model X LHD, D=Model X RHD,
     *                            E=Model 3 LHD, F=Model 3 RHD, G=Model Y LHD, H=Model Y RHD
     *    6     Restraint        — airbag + öv kombináció
     *    7     Battery/charger  — 2012-13: töltő típus; 2015+: Electric
     *    8     Motor/Drive      — single/dual/performance + tekercselés
     *    9     Check digit      — matematikai checksum (49 CFR § 565.15(c))
     *    10    Model year       — A=2010 ... T=2026
     *    11    Plant            — Fremont/Austin/Shanghai/Berlin
     *    12-17 Serial
     */
    function decodeVin(vin) {
        const t = decodeCache;
        if (!t) return null;

        const WMI = vin.slice(0, 3);
        const modelChar = vin.charAt(3);
        const bodyChar = vin.charAt(4);
        const restraintChar = vin.charAt(5);
        const batteryChar = vin.charAt(6);
        const motorChar = vin.charAt(7);
        const checkChar = vin.charAt(8);
        const yearChar = vin.charAt(9);
        const plantChar = vin.charAt(10);
        const serial = vin.slice(11, 17);

        const wmi = t.position_1_3_wmi.values[WMI] || null;
        const model = t.position_4_model.values[modelChar] || null;
        const body = t.position_5_body.values[bodyChar] || null;
        const restraint = t.position_6_restraint.values[restraintChar] || null;
        const battery = t.position_7_battery_charger.values[batteryChar] || null;
        const motor = t.position_8_motor_drive.values[motorChar] || null;
        const year = t.position_10_year.values[yearChar] || null;
        const plant = t.position_11_plant.values[plantChar] || null;

        // Check digit ellenőrzés
        const expectedCheck = computeCheckDigit(vin);
        const checkValid = expectedCheck === checkChar;

        // Variáns azonosítás: VIN prefix + modell év + meghajtás.
        // SPECIÁLIS ESET: a 2018-2020-as Model 3 Performance és Long Range
        // VIN-jében a 8. pozíció azonos 'B' — a Tesla csak szoftverben
        // különbözteti meg. Ilyenkor ambiguousPerformance=true, és mindkét
        // variáns listája megjelenik a felhasználónak.
        let variant = null;
        let ambiguousPerformance = false;
        let variants = Object.entries(t.variants || {});
        // Szűrés: modellév + prefix + drive
        const motorDrive = motor && motor.drive;
        const matching = variants.filter(([_, v]) => {
            const yearInRange = year && v.model_years.includes(year);
            const prefixOk = vin.startsWith(v.vin_prefix_match);
            const driveMatch = !motorDrive || motorDrive === v.drive;
            return yearInRange && prefixOk && driveMatch;
        });
        // Ha több matching van (LR + P), a sorrend fontos: Performance a specifikációban később van
        if (matching.length > 0) {
            variant = matching[0][1];
            variant.key = matching[0][0];
            // Ha a drive AWD és több AWD variáns is van (LR + P), ambiguous
            if (motorDrive === 'AWD' && matching.length > 1) {
                // Ellenőrizzük, hogy van-e Performance és Long Range is
                const hasP = matching.some(([_, v]) => v.label && v.label.includes('Performance'));
                const hasLR = matching.some(([_, v]) => v.label && v.label.includes('Long Range'));
                if (hasP && hasLR) {
                    ambiguousPerformance = true;
                    // Adjuk vissza mindkettőt a variant.ambiguousOptions tömbben
                    variant.ambiguousOptions = matching.map(([k, v]) => ({ key: k, ...v }));
                }
            }
        }

        return {
            vin, WMI, wmi, model, modelChar, body, bodyChar, restraint, restraintChar,
            battery, batteryChar, motor, motorChar,
            checkChar, expectedCheck, checkValid,
            year, yearChar, plant, plantChar, serial,
            variant, ambiguousPerformance,
        };
    }

    function fmtPos(value, fallback) {
        if (value === null || value === undefined) return fallback || '—';
        if (typeof value === 'object') return value.label || JSON.stringify(value);
        return String(value);
    }

    function renderResult(vin, decoded) {
        if (!decoded) {
            result.innerHTML = `
                <div class="vin-card vin-card--unknown">
                    <header class="vin-card__header">
                        <div>
                            <div class="vin-card__title">Ismeretlen VIN</div>
                            <div class="vin-card__sub">A VIN "${vin}" dekódolása nem sikerült. Ellenőrizd, hogy 17 karakter hosszú, A-H és J-N és P-R és Z és 0-9 betűket/számokat tartalmaz (I, O, Q nélkül).</div>
                        </div>
                        <div class="vin-card__vin">${vin}</div>
                    </header>
                </div>`;
            result.hidden = false;
            return;
        }

        const d = decoded;
        const variant = d.variant;

        // 17 pozíció sora: 1-3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12-17
        const positionsRow = `
            <div class="vin-positions">
                <div class="vin-pos"><span class="vin-pos__label">1-3</span><span class="vin-pos__char">${vin.slice(0, 3)}</span><span class="vin-pos__hint">${fmtPos(d.wmi)}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">4</span><span class="vin-pos__char">${d.modelChar}</span><span class="vin-pos__hint">${fmtPos(d.model)}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">5</span><span class="vin-pos__char">${d.bodyChar}</span><span class="vin-pos__hint">${fmtPos(d.body)}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">6</span><span class="vin-pos__char">${d.restraintChar}</span><span class="vin-pos__hint">Biztonsági rendszer</span></div>
                <div class="vin-pos"><span class="vin-pos__label">7</span><span class="vin-pos__char">${d.motorChar}</span><span class="vin-pos__hint">${fmtPos(d.motor)}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">8</span><span class="vin-pos__char">${d.batteryChar}</span><span class="vin-pos__hint">${fmtPos(d.battery)}</span></div>
                <div class="vin-pos ${d.checkValid ? '' : 'vin-pos--invalid'}"><span class="vin-pos__label">9</span><span class="vin-pos__char">${d.checkChar}</span><span class="vin-pos__hint">Check digit ${d.checkValid ? '✓' : `✗ (elvárt: ${d.expectedCheck})`}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">10</span><span class="vin-pos__char">${d.yearChar}</span><span class="vin-pos__hint">${d.year ? d.year + ' modellév' : 'Ismeretlen év'}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">11</span><span class="vin-pos__char">${d.plantChar}</span><span class="vin-pos__hint">${fmtPos(d.plant)}</span></div>
                <div class="vin-pos"><span class="vin-pos__label">12-17</span><span class="vin-pos__char">${d.serial}</span><span class="vin-pos__hint">Sorozatszám</span></div>
            </div>`;

        const restraintFullText = d.restraint ? (typeof d.restraint === 'object' ? d.restraint.label : d.restraint) : '—';
        const motorFullText = d.motor ? (typeof d.motor === 'object' ? d.motor.label : d.motor) : '—';
        const batteryFullText = d.battery ? (typeof d.battery === 'object' ? d.battery.label : d.battery) : '—';
        const wmiFullText = d.wmi ? (typeof d.wmi === 'object' ? d.wmi.label : d.wmi) : '—';
        const plantFullText = d.plant ? (typeof d.plant === 'object' ? d.plant.label : d.plant) : '—';
        const bodyFullText = d.body ? (typeof d.body === 'object' ? d.body.label : d.body) : '—';

        // Specifikációk a variants táblából
        let specsHtml = '';
        if (variant) {
            // Ha ambiguous (LR vs P), figyelmeztetés + mindkét variáns
            if (d.ambiguousPerformance && variant.ambiguousOptions) {
                const optList = variant.ambiguousOptions.map((o) => `
                    <div class="vin-spec">
                        <div class="vin-spec__label">${o.label}</div>
                        <div class="vin-spec__value">
                            <strong>${o.acceleration_0_100}s</strong> 0-100 · ${o.range_km_wltp} km WLTP<br>
                            ${o.hp} HP · ${o.top_speed_kmh} km/h végsebesség
                        </div>
                    </div>
                `).join('');
                specsHtml = `
                    <div class="vin-specs">
                        <h3 class="vin-specs__title">⚠️ Nem egyértelmű — Performance vagy Long Range?</h3>
                        <div class="vin-ambiguous-note">
                            <p><strong>A VIN 8. pozíciója "B" — ez a Tesla Motors Club fórum és a Tesla saját NHTSA Part 565 specifikációja szerint is kétféle autót jelölhet.</strong> A Tesla a 2018-2020 közötti Model 3 gyártásban a Long Range és a Performance VIN-kódját <strong>nem</strong> különböztette meg — a különbség csak a fedélzeti szoftverben van (track mode, gyorsulás-korlátozás).</p>
                            <p>A pontos variánst a következők alapján tudod eldönteni:</p>
                            <ul>
                                <li><strong>0-100 km/h:</strong> Performance = 3.1-3.3s · Long Range = 4.2-4.5s</li>
                                <li><strong>Végsebesség:</strong> Performance = 250-261 km/h · Long Range = 225 km/h</li>
                                <li><strong>Track Mode:</strong> Performance igen · Long Range nem</li>
                                <li><strong>Piros féknyereg:</strong> Performance igen · Long Range nem</li>
                                <li><strong>Tulajdonosi app / Tesla fiók:</strong> a pontos modell a "Specs" alatt látható</li>
                            </ul>
                            <p>A Tesla hivatalos VIN Recall Search szolgáltatásában is megtekinthető: <a href="https://service.tesla.com/en-US/vin-recall-search" target="_blank" rel="noopener noreferrer">service.tesla.com/en-US/vin-recall-search</a></p>
                        </div>
                        <div class="vin-specs__grid vin-specs__grid--ambiguous">${optList}</div>
                    </div>`;
            } else {
                specsHtml = `
                    <div class="vin-specs">
                        <h3 class="vin-specs__title">Specifikációk (${variant.label})</h3>
                        <div class="vin-specs__grid">
                            <div class="vin-spec"><div class="vin-spec__label">Hatótáv (WLTP)</div><div class="vin-spec__value">${variant.range_km_wltp} km</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Hatótáv (EPA)</div><div class="vin-spec__value">${variant.range_km_epa} mi</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Akkumulátor</div><div class="vin-spec__value">${variant.battery_kwh} kWh (${variant.chemistry})</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">0-100 km/h</div><div class="vin-spec__value">${variant.acceleration_0_100} s</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Végsebesség</div><div class="vin-spec__value">${variant.top_speed_kmh} km/h</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Meghajtás</div><div class="vin-spec__value">${variant.drive}</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Motor</div><div class="vin-spec__value">${variant.motor}</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Teljesítmény</div><div class="vin-spec__value">${variant.hp} HP</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Forgatónyomaték</div><div class="vin-spec__value">${variant.torque_nm} Nm</div></div>
                            <div class="vin-spec"><div class="vin-spec__label">Tömeg</div><div class="vin-spec__value">${variant.weight_kg} kg</div></div>
                        </div>
                        ${variant.factory_note ? `<p class="vin-spec-note">⚠️ <strong>Fontos:</strong> ${variant.factory_note}</p>` : ''}
                    </div>`;
            }
        } else {
            specsHtml = `
                <div class="vin-specs vin-specs--unknown">
                    <h3 class="vin-specs__title">Specifikáció</h3>
                    <p>A ${d.year || 'ismeretlen év'} ${fmtPos(d.model) || 'Tesla'} pontos specifikációja nem található a Tesla Model 3 táblában. Próbáld meg a Tesla konfigurátorban vagy a villanyautosok.hu-n.</p>
                </div>`;
        }

        result.innerHTML = `
            <div class="vin-card">
                <header class="vin-card__header">
                    <div>
                        <div class="vin-card__title">${fmtPos(d.model)} — ${d.year || '?'} modellév</div>
                        <div class="vin-card__sub">${plantFullText} · ${variant ? variant.label : 'Ismeretlen variáns'}</div>
                    </div>
                    <div class="vin-card__vin">${vin}</div>
                </header>
                ${positionsRow}
                <div class="vin-decoded-grid">
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">WMI (1-3)</span><span class="vin-decoded-cell__value">${wmiFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Modell (4)</span><span class="vin-decoded-cell__value">${fmtPos(d.model)}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Body (5)</span><span class="vin-decoded-cell__value">${bodyFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Restraint (6)</span><span class="vin-decoded-cell__value">${restraintFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Motor (7)</span><span class="vin-decoded-cell__value">${motorFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Akkumulátor (8)</span><span class="vin-decoded-cell__value">${batteryFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Modellév (10)</span><span class="vin-decoded-cell__value">${d.year ? d.year : '?'}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Gyár (11)</span><span class="vin-decoded-cell__value">${plantFullText}</span></div>
                    <div class="vin-decoded-cell"><span class="vin-decoded-cell__label">Sorozatszám (12-17)</span><span class="vin-decoded-cell__value">${d.serial}</span></div>
                </div>
                ${specsHtml}
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
        status.textContent = 'Dekódolás...';
        result.hidden = true;
        const t = await loadDecodeTable();
        if (!t) {
            status.textContent = 'A VIN dekódoló tábla nem tölthető be. Próbáld újra később.';
            status.className = 'vin-status vin-status--error';
            return;
        }
        const decoded = decodeVin(vin);
        renderResult(vin, decoded);
        if (decoded && decoded.variant) {
            status.textContent = 'Sikeres dekódolás.';
            status.className = 'vin-status vin-status--ok';
        } else if (decoded) {
            status.textContent = 'A VIN struktúrája érvényes, de a pontos specifikáció nem található.';
            status.className = 'vin-status vin-status--warn';
        }
    });

    // Uppercase + live filter (I, O, Q nem megengedett)
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    });
})();
