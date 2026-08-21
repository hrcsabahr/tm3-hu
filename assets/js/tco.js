/* =====================================================
   TCO — 10 éves teljes birtoklási költség
   ===================================================== */

(function () {
    const $ = (id) => document.getElementById(id);
    const fmtHuf = (n) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(n);

    function update() {
        const evesKm = parseInt($('eves-km').value, 10);
        const aramAr = parseInt($('aram-ar').value, 10);
        const dcArany = parseInt($('dc-arany').value, 10);
        const fogyasztas = parseFloat($('fogyasztas').value);
        const bonusz = parseInt($('bonusz').value, 10);
        const szerviz = parseInt($('szerviz').value, 10) || 0;
        const gumi = parseInt($('gumi').value, 10) || 0;

        // Labelek
        $('lbl-km').textContent = new Intl.NumberFormat('hu-HU').format(evesKm) + ' km';
        $('lbl-aram').textContent = aramAr + ' Ft/kWh';
        $('lbl-dc').textContent = dcArany + '%';
        $('lbl-bonusz').textContent = 'B' + Math.round(bonusz / 10) + ' (' + bonusz + '% kedvezmény)';

        // Energia költség
        const kWhPerYear = (evesKm / 100) * fogyasztas;
        const kWhOthon = kWhPerYear * (1 - dcArany / 100);
        const kWhDc = kWhPerYear * (dcArany / 100);

        const aramKoltseg = kWhOthon * aramAr;
        // DC töltés drágább, átlagosan 145 Ft/kWh
        const dcArPerKwh = 145;
        const dcKoltseg = kWhDc * dcArPerKwh;

        // Biztosítás + adó (becsült)
        // Tesla biztosítás alapja ~500k Ft/év, bónusz szorzóval
        const biztAlap = 500000;
        const biztositas = biztAlap * (1 - bonusz / 100);
        const ado = evesKm > 0 ? 46000 : 0; // gépjárműadó elektromosra kedvezményes

        // Szerviz + kopó alkatrész
        const szervizKoltseg = szerviz + gumi;

        // Éves költség
        const evesKoltseg = aramKoltseg + dcKoltseg + biztositas + ado + szervizKoltseg;
        const tco10 = evesKoltseg * 10;

        // Benzines referencia (BMW 330i ~ 7L/100 km, 580 Ft/L, hasonló biztosítás, drágább szerviz)
        const benzFogy = 7.0;
        const benzUzemanyag = (evesKm / 100) * benzFogy * 580;
        const benzBizt = biztositas * 1.1;
        const benzSzerviz = szervizKoltseg * 1.9;
        const benzAdo = ado * 4;
        const benzEves = benzUzemanyag + benzBizt + benzAdo + benzSzerviz;
        const benz10 = benzEves * 10;

        const megtakaritas = benz10 - tco10;

        // Kimenetek
        $('res-eves').textContent = fmtHuf(evesKoltseg);
        $('res-otthon').textContent = fmtHuf(aramKoltseg);
        $('res-dc').textContent = fmtHuf(dcKoltseg);
        $('res-bizt').textContent = fmtHuf(biztositas + ado);
        $('res-szerviz').textContent = fmtHuf(szervizKoltseg);
        $('res-10ev').textContent = fmtHuf(tco10);
        $('res-benzines').textContent = fmtHuf(benz10);
        $('res-megtakaritas').textContent = fmtHuf(megtakaritas);

        // Stat boxok
        $('stat-ev').textContent = fmtHuf(evesKoltseg / evesKm).replace(' Ft', '');
        $('stat-100').textContent = fmtHuf(evesKoltseg / evesKm * 100).replace(' Ft', '');
        $('stat-toltes').textContent = new Intl.NumberFormat('hu-HU').format(Math.round(kWhPerYear));
    }

    ['eves-km', 'aram-ar', 'dc-arany', 'fogyasztas', 'bonusz', 'szerviz', 'gumi'].forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', update);
        el.addEventListener('change', update);
    });

    update();
})();
