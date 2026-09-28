/* =====================================================
   TCO — 10 éves teljes birtoklási költség (vételár + értékvesztés + üzemeltetés)
   Források: NAV gépjárműadó-mentesség, holtankoljak.hu (2026. szept.),
   a site saját töltőárai (tobberek.json).
   ===================================================== */

(function () {
    const $ = (id) => document.getElementById(id);
    const fmtHuf = (n) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(n);
    const fmtNum = (n) => new Intl.NumberFormat('hu-HU').format(n);

    // Konstansok — 2026 Q3, Magyarország
    const DC_AR = 145;             // Supercharger Ft/kWh (a site tobberek.json szerint)
    const BENZIN_AR = 630;         // 95-ös benzin Ft/L (2026. szept., holtankoljak.hu)
    const BENZIN_FOGY = 7.0;       // BMW 330i ~7 L/100 km vegyes
    const BIZT_ALAP = 500000;      // Tesla CASCO+kgfb alap (bónusz nélkül), Ft/év
    const BENZ_BIZT_FAKTOR = 1.1;  // BMW biztosítás ~10%-kal drágább
    const ADO_EV = 0;              // tisztán elektromos: gépjárműadó-mentes (NAV, 5E/5Z)
    const ADO_BENZIN = 65000;      // BMW 330i (~190 kW) gépjárműadó ~65 000 Ft/év
    const BENZ_SZERVIZ_FAKTOR = 1.9;
    const TESLA_MARADEK = 0.25;    // 10 év utáni maradványérték (becslés)
    const BENZ_MARADEK = 0.30;     // 10 év utáni maradványérték (becslés)

    function readInputs() {
        const num = (id, fallback) => {
            const el = $(id);
            const v = el ? parseFloat(el.value) : NaN;
            return isFinite(v) ? v : fallback;
        };
        return {
            evesKm: num('eves-km', 15000),
            aramAr: num('aram-ar', 60),
            dcArany: num('dc-arany', 20),
            fogyasztas: num('fogyasztas', 16),
            bonusz: num('bonusz', 50),
            szerviz: num('szerviz', 0),
            gumi: num('gumi', 0),
            teslaAr: num('tesla-ar', 18000000),
            benzAr: num('benz-ar', 22500000),
        };
    }

    function calc(inp) {
        // ---- Tesla energia ----
        const kWhPerYear = (inp.evesKm / 100) * inp.fogyasztas;
        const kWhOthon = kWhPerYear * (1 - inp.dcArany / 100);
        const kWhDc = kWhPerYear * (inp.dcArany / 100);
        const aramKoltseg = kWhOthon * inp.aramAr;
        const dcKoltseg = kWhDc * DC_AR;
        const biztositas = BIZT_ALAP * (1 - inp.bonusz / 100);
        const szervizKoltseg = inp.szerviz + inp.gumi;
        const teslaUzemEves = aramKoltseg + dcKoltseg + biztositas + ADO_EV + szervizKoltseg;
        const teslaErtekvesztes = inp.teslaAr * (1 - TESLA_MARADEK);
        const teslaTCO10 = teslaUzemEves * 10 + teslaErtekvesztes;

        // ---- Benzines (BMW 330i) ----
        const benzUzemanyag = (inp.evesKm / 100) * BENZIN_FOGY * BENZIN_AR;
        const benzBizt = biztositas * BENZ_BIZT_FAKTOR;
        const benzSzerviz = szervizKoltseg * BENZ_SZERVIZ_FAKTOR;
        const benzUzemEves = benzUzemanyag + benzBizt + ADO_BENZIN + benzSzerviz;
        const benzErtekvesztes = inp.benzAr * (1 - BENZ_MARADEK);
        const benzTCO10 = benzUzemEves * 10 + benzErtekvesztes;

        const megtakaritas = benzTCO10 - teslaTCO10;

        // Kumulatív TCO görbe: vételár + kumulált üzemeltetés − aktuális maradványérték
        function curve(vetelar, uzemEves, maradekFrac) {
            const pts = [];
            for (let t = 0; t <= 10; t++) {
                const maradek = vetelar * (1 - (1 - maradekFrac) * t / 10);
                pts.push(Math.round(vetelar + t * uzemEves - maradek));
            }
            return pts;
        }

        return {
            inp, kWhPerYear, aramKoltseg, dcKoltseg, biztositas, szervizKoltseg,
            teslaUzemEves, teslaTCO10, teslaErtekvesztes,
            benzUzemanyag, benzUzemEves, benzTCO10, benzErtekvesztes,
            megtakaritas,
            teslaCurve: curve(inp.teslaAr, teslaUzemEves, TESLA_MARADEK),
            benzCurve: curve(inp.benzAr, benzUzemEves, BENZ_MARADEK),
        };
    }

    function render(r) {
        $('lbl-km').textContent = fmtNum(r.inp.evesKm) + ' km';
        $('lbl-aram').textContent = r.inp.aramAr + ' Ft/kWh';
        $('lbl-dc').textContent = r.inp.dcArany + '%';
        $('lbl-bonusz').textContent = 'B' + Math.round(r.inp.bonusz / 10) + ' (' + r.inp.bonusz + '% kedvezmény)';

        $('res-eves').textContent = fmtHuf(r.teslaUzemEves);
        $('res-otthon').textContent = fmtHuf(r.aramKoltseg);
        $('res-dc').textContent = fmtHuf(r.dcKoltseg);
        $('res-bizt').textContent = fmtHuf(r.biztositas + ADO_EV);
        $('res-szerviz').textContent = fmtHuf(r.szervizKoltseg);
        $('res-10ev').textContent = fmtHuf(r.teslaTCO10);
        $('res-benzines').textContent = fmtHuf(r.benzTCO10);
        $('res-megtakaritas').textContent = fmtHuf(r.megtakaritas);

        // Értékvesztés megjelenítése a 10 éves TCO alatt
        const evEl = $('res-ertekvesztes');
        if (evEl) evEl.textContent = 'ebből értékvesztés: ' + fmtHuf(r.teslaErtekvesztes);

        $('stat-ev').textContent = fmtHuf(r.teslaUzemEves / r.inp.evesKm).replace(' Ft', '');
        $('stat-100').textContent = fmtHuf(r.teslaUzemEves / r.inp.evesKm * 100).replace(' Ft', '');
        $('stat-toltes').textContent = fmtNum(Math.round(r.kWhPerYear));
    }

    function update() {
        const r = calc(readInputs());
        render(r);
        window.tm3Tco = window.tm3Tco || {};
        window.tm3Tco.latest = r;
        if (window.tm3Tco.renderChart) window.tm3Tco.renderChart(r);
    }

    ['eves-km', 'aram-ar', 'dc-arany', 'fogyasztas', 'bonusz', 'szerviz', 'gumi', 'tesla-ar', 'benz-ar'].forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', update);
        el.addEventListener('change', update);
    });

    update();
})();
