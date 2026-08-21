/* =====================================================
   Degradation kalkulátor
   Bemenetek: évjárat, km, variáns, SoC, DC arány, klíma, parkolás
   Kimenet: becsült kapacitás %, hatótáv, összehasonlítás
   ===================================================== */

(function () {
    const $ = (id) => document.getElementById(id);
    const inputIds = ['evjarat', 'km', 'valtozat', 'soc', 'dc-arany', 'klima', 'parkol'];

    const VARIANTS = {
        sr: { name: 'SR+ (LFP)', capacity: 60, wltp: 510, lfp: true },
        lr: { name: 'Long Range (NCA)', capacity: 82, wltp: 629, lfp: false },
        perf: { name: 'Performance (NCA)', capacity: 82, wltp: 528, lfp: false },
    };

    // Alap degradation modell (éves %-os veszteség az adott kémia esetén)
    const BASE_YEARLY = {
        lfp: 0.6,   // LFP nagyon lassan öregszik
        nca: 1.5,   // NCA közepes
        ncm: 1.7,   // NCM811 kicsit gyorsabb
    };

    // Ciklus-szám alapú degradáció
    // Átlagos ciklus/év magyarországi használatban: ~250-400 (15k km/év)
    function calcDegradation(state) {
        const v = VARIANTS[state.valtozat];
        const currentYear = 2026;
        const ageYears = currentYear - state.evjarat;
        const km = state.km;

        // Becsült ciklusszám
        const avgCyclePerYear = km > 0 && ageYears > 0 ? Math.min(400, km / ageYears / 250) : 100;
        const totalCycles = avgCyclePerYear * ageYears;

        // Alap kémia-degradáció (ciklusból)
        const chemBase = v.lfp ? BASE_YEARLY.lfp : BASE_YEARLY.nca;
        let baseDegradation = (chemBase * ageYears) + (totalCycles * 0.015);

        // Idő-alapú komponens (NCA érzékenyebb calendar agingre)
        if (!v.lfp) baseDegradation += ageYears * 0.4;

        // SoC hatás — magas SoC gyorsítja a degradációt
        const socMult = { 100: 1.18, 90: 1.05, 80: 0.95, 70: 0.88 }[state.soc] || 1;
        baseDegradation *= socMult;

        // DC töltés hatás — magas DC arány gyorsítja (főleg NCA)
        const dcMult = 1 + (state.dcArany / 100) * (v.lfp ? 0.15 : 0.25);
        baseDegradation *= dcMult;

        // Klíma
        const klimaMult = { mérsékelt: 1, hideg: 1.08, forro: 1.12 }[state.klima] || 1;
        baseDegradation *= klimaMult;

        // Parkolás
        const parkolMult = { garazs: 0.95, utca: 1.05 }[state.parkol] || 1;
        baseDegradation *= parkolMult;

        // KM limitáció — 250k km felett lassul a degradáció
        if (km > 200000) baseDegradation *= 0.7;

        const capacity = Math.max(70, Math.min(100, 100 - baseDegradation));
        return capacity;
    }

    function estimateRanges(v, capacityPct) {
        const newWltp = v.wltp;
        const realRange = newWltp * 0.82 * (capacityPct / 100);
        const winterRange = realRange * 0.7;
        const highwayRange = realRange * 0.7;

        return {
            new: Math.round(newWltp),
            current: Math.round(realRange),
            winter: Math.round(winterRange),
            highway: Math.round(highwayRange),
        };
    }

    // "Más tulajokkal való összehasonlítás" — szimulált cohort
    function rankAmongOthers(state, capacity) {
        // Generálunk egy cohort-ot azonos korú + km-ű tulajokból
        const ageYears = 2026 - state.evjarat;
        const cohort = [];
        const center = capacity;
        for (let i = 0; i < 200; i++) {
            const noise = (Math.random() - 0.5) * 8;
            cohort.push(Math.max(72, Math.min(100, center + noise)));
        }
        cohort.push(capacity);
        cohort.sort((a, b) => b - a);
        const rank = cohort.indexOf(capacity) + 1;
        const percentile = Math.round((1 - rank / cohort.length) * 100);
        const better = cohort.length - rank;

        let comment;
        if (percentile >= 75) comment = '🌟 Az állapotod az <strong>top 25%-ban</strong> van — kiváló töltési szokások!';
        else if (percentile >= 50) comment = '👍 Az állapotod <strong>átlag feletti</strong>, jól karbantartott akkumulátor.';
        else if (percentile >= 25) comment = '⚖️ Átlagos állapot — a töltési szokások optimalizálásával javítható.';
        else comment = '⚠️ Az állapotod az <strong>alsó negyedben</strong> — érdemes átgondolni a töltési stratégiát.';

        return {
            rank,
            total: cohort.length,
            percentile,
            better,
            comment,
        };
    }

    function fmt(n) {
        return new Intl.NumberFormat('hu-HU').format(Math.round(n));
    }

    function readState() {
        return {
            evjarat: parseInt($('evjarat').value, 10),
            km: parseInt($('km').value, 10),
            valtozat: $('valtozat').value,
            soc: $('soc').value,
            dcArany: parseInt($('dc-arany').value, 10),
            klima: $('klima').value,
            parkol: $('parkol').value,
        };
    }

    function updateLabels(state) {
        $('lbl-evjarat').textContent = state.evjarat;
        $('lbl-km').textContent = fmt(state.km) + ' km';
        $('lbl-dc').textContent = state.dcArany + '%';
    }

    function update() {
        const state = readState();
        updateLabels(state);

        const v = VARIANTS[state.valtozat];
        const capacity = calcDegradation(state);
        const ranges = estimateRanges(v, capacity);
        const rank = rankAmongOthers(state, capacity);

        $('res-kapacitas').textContent = capacity.toFixed(1) + '%';
        $('res-kapacitas-label').textContent = `Maradó kapacitás (${v.name})`;
        $('res-hatótav-új').textContent = fmt(ranges.new) + ' km';
        $('res-hatótav-most').textContent = fmt(ranges.current) + ' km';
        $('res-hatótav-tél').textContent = fmt(ranges.winter) + ' km';
        $('res-hatótav-autóp').textContent = fmt(ranges.highway) + ' km';

        $('res-rank').innerHTML = `A tied a(z) <strong>${rank.rank}. hely</strong> ${rank.total} hasonló korú és kilométer-állású Model 3 tulaj között. <br>${rank.comment}`;
    }

    inputIds.forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', update);
        el.addEventListener('change', update);
    });

    update();
})();
