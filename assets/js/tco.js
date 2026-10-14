/* =====================================================
   TCO — üzemeltetési költség kalkulátor (villany vs benzines)
   Csak a jól becsülhető részt számoljuk: áram/üzemanyag + gépjárműadó.
   Vételár + értékvesztés külön, a "Haladó" blokkban (becslés).
   Források: holtankoljak.hu (benzinár, 2026. szept.), NAV gépjárműadó-mentesség.
   ===================================================== */

(function () {
    const $ = (id) => document.getElementById(id);
    const fmtHuf = (n) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(n);
    const fmtNum = (n) => new Intl.NumberFormat('hu-HU').format(n);

    const BENZIN_AR = 630;      // Ft/l — 95-ös benzin (holtankoljak.hu, 2026. szept.)
    const ADO_BENZIN = 65000;   // Ft/év — ~150–190 kW-os benzines gépjárműadó
    const ADO_EV = 0;           // Ft/év — tisztán elektromos: NAV-mentes

    const TESLA_MARADEK = 0.25; // 10 év utáni maradványérték (becslés)
    const BENZ_MARADEK = 0.30;  // 10 év utáni maradványérték (becslés)

    function read() {
        const num = (id, fb) => {
            const el = $(id);
            const v = el ? parseFloat(el.value) : NaN;
            return isFinite(v) ? v : fb;
        };
        return {
            km: num('eves-km', 15000),
            fogy: num('fogyasztas', 16),
            aram: num('aram-ar', 60),
            benzFogy: num('benz-fogy', 7),
            teslaAr: num('tesla-ar', 18000000),
            benzAr: num('benz-ar', 22500000),
        };
    }

    function calc(i) {
        // Éves üzemeltetés (áram/üzemanyag + adó)
        const teslaAram = (i.km / 100) * i.fogy * i.aram;
        const benzUzemanyag = (i.km / 100) * i.benzFogy * BENZIN_AR;
        const teslaUzem = teslaAram + ADO_EV;
        const benzUzem = benzUzemanyag + ADO_BENZIN;

        const megtakEv = benzUzem - teslaUzem;
        const megtak10 = megtakEv * 10;

        // Teljes TCO (vételár + értékvesztés + 10 év üzemeltetés) — becslés
        const teslaTCO10 = teslaUzem * 10 + i.teslaAr * (1 - TESLA_MARADEK);
        const benzTCO10 = benzUzem * 10 + i.benzAr * (1 - BENZ_MARADEK);
        const tcoMegtak = benzTCO10 - teslaTCO10;

        return {
            teslaAram, benzUzemanyag, teslaUzem, benzUzem,
            megtakEv, megtak10, teslaTCO10, benzTCO10, tcoMegtak,
        };
    }

    function render(i, r) {
        $('lbl-km').textContent = fmtNum(i.km) + ' km';

        $('res-megtak-ev').textContent = fmtHuf(r.megtakEv);
        $('res-megtak-10ev').textContent = fmtHuf(r.megtak10);
        $('res-tesla').textContent = fmtHuf(r.teslaAram);
        $('res-benz').textContent = fmtHuf(r.benzUzemanyag);
        $('res-ado').textContent = 'Tesla 0 Ft · benzines ' + fmtHuf(ADO_BENZIN);

        // Oszlopdiagram (Tesla vs benzines éves költség)
        const max = Math.max(r.teslaUzem, r.benzUzem, 1);
        $('bar-tesla').style.width = (r.teslaUzem / max * 100).toFixed(1) + '%';
        $('bar-benz').style.width = (r.benzUzem / max * 100).toFixed(1) + '%';
        $('bar-tesla-val').textContent = fmtHuf(r.teslaUzem);
        $('bar-benz-val').textContent = fmtHuf(r.benzUzem);

        // Haladó: teljes TCO
        $('res-tco-tesla').textContent = fmtHuf(r.teslaTCO10);
        $('res-tco-benz').textContent = fmtHuf(r.benzTCO10);
        $('res-tco-megtak').textContent = fmtHuf(r.tcoMegtak);
    }

    function update() {
        const i = read();
        render(i, calc(i));
    }

    ['eves-km', 'fogyasztas', 'aram-ar', 'benz-fogy', 'tesla-ar', 'benz-ar'].forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', update);
        el.addEventListener('change', update);
    });

    update();
})();
