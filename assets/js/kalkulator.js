/* =====================================================
   Degradation kalkulátor (v2 — valós cohort adatokra építve)
   --------------------------------------------------------
   Modell alapja:
   - Recurrent Auto (12 000+ Tesla, 1.6 millió megfigyelés,
     2024-2025 cohort tanulmányok): 1-2%/év retention, "knee point"
     az első 30-50 ezer km-nél (SEI kialakulási fázis), S-görbe.
   - Carla/Voltest 2026 cohort (9954 svéd EV, 62 000 mi / ~100 000 km
     retenció): CATL LFP 93.34%, LG Chem NMC 92.83%, Panasonic NCA
     77.8 kWh 89.8%, Panasonic NCA 52.4 kWh 88.2%.
   - Keil et al. (TUM, 2016, NCA/graphite cell calendar aging 12 hónap
     8 SoC × 3 hőmérséklet): NCA-nál 60% SoC feletti lineáris növekedés,
     100% SoC-nál közel 2x gyorsabb calendar aging mint 60%-nál.
   - Recurrent Auto: forró klíma (30°C+) 1.4x calendar aging; hideg tél
     nem károsítja a cellát, DE a hatótávot 30-45%-kal csökkenti a fűtés.
   - Recurrent Auto (2024): rendszeres Supercharger használat NCA-nál
     "nem érintett jelentősen" — +5-10% az első 100 000 km-en.
   - Tesla Battery Day 2020: 100% SoC NCA 2x calendar aging.
   - Ecker et al. (NMC811 calendar aging): SiOx anód instabilitás,
     100% SoC-nál kiemelt degradation.

   A modell nem tökéletes — cohort percentiliseket ad, nem
   egyedi cellamérést. A tipikus hiba ±2-3% (Recurrent ML modellek
   alapján), de a kiugró eseteknél (pl. sűrű DC töltés + forró klíma
   + 100% SoC kombináció) a modell kissé alulbecsülheti.
   ===================================================== */

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const inputIds = ['evjarat', 'km', 'valtozat', 'soc', 'dc-arany', 'klima', 'parkol'];

    /* ----------------------------------------------------------
       VARIÁNSOK — a VIN-dekóder JSON-nel konzisztens lista.
       A kémia flag (lfp / nca / nmc) határozza meg a baseline retenciót.
       ---------------------------------------------------------- */
    const VARIANTS = {
        // SR+ (LFP) — CATL LFP cellák, 2024+ (Magyarországon is)
        'sr_lfp_2024': { name: 'Model 3 SR+ (LFP, 60 kWh, 2024+)',
                         capacity: 60, wltp: 510, epa: 317, chemistry: 'lfp' },
        // SR+ (NCA) — Panasonic NCA, 2020-2023 európai piac
        'sr_nca_2020_2023': { name: 'Model 3 SR+ (NCA, 55 kWh, 2020–2023)',
                              capacity: 55, wltp: 430, epa: 267, chemistry: 'nca' },
        // SR (NCA) — Panasonic NCA, 2017-2019 (50 kWh)
        'sr_nca_2017_2019': { name: 'Model 3 SR (NCA, 50 kWh, 2017–2019)',
                              capacity: 50, wltp: 354, epa: 220, chemistry: 'nca' },
        // Long Range AWD — NCM811 (Panasonic / LG), 2024+ (85 kWh, "Highland")
        'lr_nmc_2024': { name: 'Model 3 Long Range AWD (NMC, 85 kWh, 2024+)',
                         capacity: 85, wltp: 680, epa: 422, chemistry: 'nmc' },
        // Long Range AWD — NCA, 2020-2023 (82 kWh)
        'lr_nca_2020_2023': { name: 'Model 3 Long Range AWD (NCA, 82 kWh, 2020–2023)',
                              capacity: 82, wltp: 629, epa: 382, chemistry: 'nca' },
        // Long Range AWD — NCA, 2017-2019 (75 kWh)
        'lr_nca_2017_2019': { name: 'Model 3 Long Range AWD (NCA, 75 kWh, 2017–2019)',
                              capacity: 75, wltp: 499, epa: 310, chemistry: 'nca' },
        // Performance — NCA, 2020-2023 (82 kWh)
        'perf_nca_2020_2023': { name: 'Model 3 Performance (NCA, 82 kWh, 2020–2023)',
                                capacity: 82, wltp: 547, epa: 315, chemistry: 'nca' },
        // Performance — NCA, 2017-2019 (75 kWh)
        'perf_nca_2017_2019': { name: 'Model 3 Performance (NCA, 75 kWh, 2017–2019)',
                                capacity: 75, wltp: 480, epa: 299, chemistry: 'nca' },
    };

    /* ----------------------------------------------------------
       KÉMIA-ALAPÚ RETENTION TÁBLA @ 100 000 km (Carla/Voltest 2026)
       Retention % — mennyi maradt meg az eredeti kapacitásból.
       A "knee point" miatt a degradation nem lineáris: az első 30-50k
       km-ben intenzívebb (az SEI beérik), utána lineáris, lassabb.
       ---------------------------------------------------------- */
    const CHEMISTRY_RETENTION_100K = {
        lfp: 93.34,   // CATL LFP
        nmc: 92.83,   // LG Chem NMC811
        nca: 89.8,    // Panasonic NCA 77.8 kWh (a 82 kWh LR is ide esik,
                      // mert a Carla study 88.2% csak a korai 52 kWh-s
                      // SR-re volt; a modern NCA 89.8% körül van)
    };

    // Knee point: az első ~35 000 km gyorsabb degradation (SEI kialakulás).
    // A 100k retenció a knee point utáni lineáris szakaszra + a knee
    // szakaszra illesztett érték.
    const KNEE_KM = 35000;

    /* ----------------------------------------------------------
       SoC MULTIPLIKÁTOR (Keil et al. 2016 NCA/graphite + saját illesztés
       LFP-re és NMC-re). A 100% SoC az NCA-nál közel 2x gyorsabb
       calendar aginget okoz, mint a 60% SoC. Az LFP sokkal kevésbé
       érzékeny a magas SoC-ra (Keil 2016: LFP SoC-függés 0.3x NCA).
       ---------------------------------------------------------- */
    const SOC_MULT = {
        lfp: { 100: 1.10, 90: 1.04, 80: 1.00, 70: 0.97 },
        nca: { 100: 1.95, 90: 1.30, 80: 1.10, 70: 1.00 },
        nmc: { 100: 1.55, 90: 1.20, 80: 1.08, 70: 1.00 },
    };

    /* ----------------------------------------------------------
       KLÍMA HATÁS (Recurrent Auto 2024 cohort, 30°C+ átlag → 1.4x).
       Magyarországon a "hideg tél" hideg klíma, de télen a degradation
       LASSABB a lassabb kinetics miatt (Keil 2016 is megerősíti: alacsony
       hőmérsékleten kisebb SEI növekedés). A hideg tél HATÓTÁVOT
       csökkent, nem degradációt — azt külön kezeljük estimateRanges-ben.
       ---------------------------------------------------------- */
    const KLIMA_MULT = {
        mérsékelt: 1.00,
        hideg:     0.96,   // hideg tél: lassabb calendar aging (Keil 2016)
        forró:     1.40,   // forró nyár: 1.4x calendar aging (Recurrent 2024)
    };

    /* ----------------------------------------------------------
       DC (Supercharger) ARÁNY HATÁSA
       Recurrent 2024: "nem érintett jelentősen" — NCA-nál +5-10%
       extra degradation 100k km-en, ha 100% a DC arány. LFP-nél
       szinte semmi.
       ---------------------------------------------------------- */
    function dcMultiplier(chemistry, dcPct) {
        const base = { lfp: 0.02, nca: 0.10, nmc: 0.07 }[chemistry];
        // 100% DC = +base%, 0% DC = +0% — lineáris interpoláció.
        return 1 + (dcPct / 100) * base;
    }

    /* ----------------------------------------------------------
       PARKOLÁS HATÁSA
       Garázs: kevesebb hőingás → lassabb calendar aging (Keil 2016 +
       Recurrent megfigyelések). Utca: hőingás + esetleg téli hideg/
       nyári tűző nap.
       ---------------------------------------------------------- */
    const PARKOL_MULT = {
        garazs: 0.97,
        utca:   1.04,
    };

    /* ----------------------------------------------------------
       S-GÖRBE DEGRADÁCIÓ MODELL
       A knee point ~35 000 km. Az első 35k km-ben a retention a
       100k retenció 93-94%-áról indul és a knee-nál a retention
       retention_35k értékre esik. Utána lineárisan lassul.

       retention(t, km) ahol t az évek száma.
       ---------------------------------------------------------- */
    // Három-szakaszos lineáris degradáció modell.
    // A "knee point" ~35 000 km-nél van: a SEI kialakulási fázis
    // gyorsabb lithium-inventory veszteséggel jár, mint a stabil
    // szakasz. A három szakasz:
    //  (1) 0..35k km: SEI kialakulás, rate_knee = 3 * linear_rate
    //      (Recurrent Auto "first 50k miles break-in").
    //  (2) 35k..100k km: közepes lineáris, r_knee → r100k.
    //  (3) 100k..∞ km: lassú lineáris, r100k → tovább csökken.
    //
    // A baseline retention_100k a Carla/Voltest 2026 cohort retenció
    // (LFP 93.34%, NMC 92.83%, NCA 89.8%) — ehhez illeszkedik a modell.
    // A 200-300k km-es extrapoláció konzisztens a Tesla saját ígéretével
    // (~85% retention 200 000 mérföld = 320 000 km).
    const LINEAR_DEGRADATION_PER_KM = {
        nca: 0.00000022,  // 0.22% / 10 000 km — hosszú távú cohort
        nmc: 0.00000020,  // 0.20% / 10 000 km
        lfp: 0.00000010,  // 0.10% / 10 000 km — LFP a legkitartóbb
    };

    function retentionFromKm(chemistry, km, ageYears, opts) {
        const socMult = SOC_MULT[chemistry][opts.soc] || 1;
        const klimaMult = KLIMA_MULT[opts.klima] || 1;
        const dcMult = dcMultiplier(chemistry, opts.dcArany);
        const parkolMult = PARKOL_MULT[opts.parkol] || 1;

        // A baseline cohort retention @ 100k km (Carla/Voltest 2026)
        // a "normál" cohort userre vonatkozik: 80% SoC, 20% DC,
        // mérsékelt klíma, garázs parkolás. Az ehhez tartozó
        // szorzók: SoC=80, klíma=mérsékelt, DC=20%, parkol=garázs.
        const baselineNormalizer = (
            (SOC_MULT[chemistry][80] || 1) *
            (KLIMA_MULT['mérsékelt'] || 1) *
            dcMultiplier(chemistry, 20) *
            (PARKOL_MULT['garazs'] || 1)
        );
        const effectiveStressor = (socMult * klimaMult * dcMult * parkolMult) / baselineNormalizer;

        const base100k = CHEMISTRY_RETENTION_100K[chemistry] / 100;
        const loss100k = 1 - base100k;
        // Szublineáris korrekció: a stresszor hatása nem lineáris.
        const adjustedLoss = Math.max(0, Math.min(1, loss100k * (0.4 + 0.6 * effectiveStressor)));
        const r100k = 1 - adjustedLoss;

        const linearRate = LINEAR_DEGRADATION_PER_KM[chemistry];
        const linearStressor = Math.max(0.5, effectiveStressor);
        // (1) Knee fázis: a SEI kialakulás miatt ~3x gyorsabb,
        // mint a stabil szakasz (Recurrent 2024 break-in megfigyelés).
        const rateKnee = 3 * linearRate * linearStressor;
        const rKnee = 1 - rateKnee * KNEE_KM;
        // (2) Közepes lineáris 35k..100k km — ebből számítjuk a rate-et,
        // hogy a retention @ 100k km pontosan r100k legyen.
        const rateMedium = (rKnee - r100k) / (100000 - KNEE_KM);

        let retention;
        if (km <= KNEE_KM) {
            retention = 1 - rateKnee * Math.max(0, km);
        } else if (km <= 100000) {
            retention = rKnee - (km - KNEE_KM) * rateMedium;
        } else {
            retention = r100k - (km - 100000) * linearRate * linearStressor;
        }
        // Floor 50% — a cella EoL threshold-a.
        return Math.max(0.5, retention);
    }

    /* ----------------------------------------------------------
       COHORT PERCENTILIS
       A cohort percentilis a valós Recurrent/Carla populáció szórásán
       alapul. Az éves retention normál eloszlást követ σ ≈ 1.2%/év
       szórással (Recurrent ML modellek alapján, 2024).
       ---------------------------------------------------------- */
    const COHORT_SIGMA_PCT = 1.2; // retention % szórása az azonos korú/kémiájú cohortban

    function cohortPercentile(chemistry, km, capacityPct) {
        // Becsült cohort retention az adott km-re és kémiára
        const ageYears = km > 0 ? Math.min(15, km / 18000) : 0; // 18 000 km/év átlag
        const baseRetention = retentionFromKm(chemistry, km, ageYears, {
            soc: 80, dcArany: 20, klima: 'mérsékelt', parkol: 'garazs'
        }) * 100;

        // A user retencióját összehasonlítjuk a cohort átlagával,
        // σ = 1.2% szórással. Percentilis = Φ(z) ahol
        // z = (user - cohort) / σ.
        const z = (capacityPct - baseRetention) / COHORT_SIGMA_PCT;
        const percentile = normalCdf(z) * 100;

        let comment;
        if (percentile >= 80) comment = '🌟 Az állapotod az <strong>top 20%-ban</strong> van — kiváló töltési szokások és kíméletes használat.';
        else if (percentile >= 60) comment = '👍 Az állapotod <strong>átlag feletti</strong>, jól karbantartott akkumulátor.';
        else if (percentile >= 40) comment = '⚖️ Átlagos állapot — a cohort nagy részével azonos ütemben kopik.';
        else if (percentile >= 20) comment = '⚠️ Az állapotod az <strong>átlag alatt van</strong> — a töltési stratégia átgondolása segíthet.';
        else comment = '🚨 Az állapotod az <strong>alsó 20%-ban</strong> — erősen stresszes használat (DC + magas SoC + meleg) vagy szélsőséges km-állás.';

        return {
            cohortAvg: Math.round(baseRetention * 10) / 10,
            userScore: Math.round(capacityPct * 10) / 10,
            percentile: Math.round(percentile),
            sigma: COHORT_SIGMA_PCT,
            comment,
        };
    }

    // Standard normál eloszlás Φ (CDF) — Abramowitz & Stegun közelítés.
    function normalCdf(z) {
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - p : p;
    }

    /* ----------------------------------------------------------
       HATÓTÁV BECSLÉS
       A WLTP → valós átlagos konverzió 0.78-0.82 (autóipari tesztek).
       A hideg tél hatótáv-hatása NEM degradation, hanem pillanatnyi
       fogyasztás-növekedés a fűtés + akkumulátor-előmelegítés miatt
       (Recurrent hideg-weather study 2023).
       ---------------------------------------------------------- */
    function estimateRanges(v, capacityPct) {
        const wltp = v.wltp;
        // A retention a kapacitásra hat, ami lineárisan csökkenti
        // a hatótávot (Recurrent: range ≈ capacity × WLTP × real_factor).
        const realFactor = 0.80; // WLTP → valós átlagos (város + vegyes)
        const baseReal = wltp * realFactor * (capacityPct / 100);

        // Hideg tél hatótáv: -10°C külső hőmérsékleten a fűtés
        // 35-45%-kal növeli a fogyasztást. Akkumulátor-előmelegítés
        // induláskor +5-10%. Szorzó: 0.62 (Papp 2023, Frid 2020).
        const winterFactor = 0.62;

        // Autópálya 130 km/h: légellenállás P ∝ v².6, a WLTP
        // átlagsebesség ~46 km/h, a 130 km/h-s haladás ~30%-os
        // fogyasztás-növekedést hoz. Szorzó: 0.68.
        const highwayFactor = 0.68;

        return {
            new: Math.round(wltp),
            current: Math.round(baseReal),
            winter: Math.round(baseReal * winterFactor),
            highway: Math.round(baseReal * highwayFactor),
        };
    }

    /* ----------------------------------------------------------
       UI FRISSÍTÉS
       ---------------------------------------------------------- */
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
        if (!v) return;

        const ageYears = 2026 - state.evjarat;
        const opts = {
            soc: state.soc,
            dcArany: state.dcArany,
            klima: state.klima,
            parkol: state.parkol,
        };

        const capacityPct = retentionFromKm(v.chemistry, state.km, ageYears, opts) * 100;
        const ranges = estimateRanges(v, capacityPct);
        const cohort = cohortPercentile(v.chemistry, state.km, capacityPct);

        $('res-kapacitas').textContent = capacityPct.toFixed(1) + '%';
        $('res-kapacitas-label').textContent = `Maradó kapacitás (${v.name})`;
        $('res-hatótav-új').textContent = fmt(ranges.new) + ' km';
        $('res-hatótav-most').textContent = fmt(ranges.current) + ' km';
        $('res-hatótav-tél').textContent = fmt(ranges.winter) + ' km';
        $('res-hatótav-autóp').textContent = fmt(ranges.highway) + ' km';

        const chemLabel = { lfp: 'LFP (CATL)', nmc: 'NMC (LG)', nca: 'NCA (Panasonic)' }[v.chemistry];
        $('res-rank').innerHTML = `
            <strong>${cohort.userScore}%</strong> retenció
            (cohort átlag: ${cohort.cohortAvg}%, szórás: ±${cohort.sigma}%) —
            a(z) <strong>${cohort.percentile}. percentilis</strong> ${chemLabel} csoportban,
            ${fmt(state.km)} km és ${ageYears} év után.
            <br>${cohort.comment}
        `;
    }

    inputIds.forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', update);
        el.addEventListener('change', update);
    });

    update();
})();
