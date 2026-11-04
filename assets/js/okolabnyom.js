/* ===========================================================
   okolabnyom.js — Ökolábnyom kalkulátor (EV vs benzines, teljes életciklus)
   Átlátható modell, minden konstans a hivatkozott forrásokból:
   - Akkugyártás CO2-intenzitás: 45/80/108 kg CO2e/kWh (T&E 2020, IVL 2019)
   - Árammix: 50/250/800 g CO2e/kWh (EEA/IEA tartományok)
   - EV fogyasztás: 0,16 kWh/km (Model 3 vegyes)
   - Benzin: 0,07 L/km · 2,8 kg CO2e/L (2,31 égés + ~20% kitermelés/finomítás, NETL)
   - Karosszéria+hajtáslánc gyártás: ~7 t CO2e (mindkettő)
   =========================================================== */
(function () {
    'use strict';

    function fmt(n, digits) {
        var d = (digits === undefined) ? 1 : digits;
        var v = Number(n);
        if (!isFinite(v)) return '—';
        return v.toLocaleString('hu-HU', { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    function fmtKm(n) {
        return Math.round(n).toLocaleString('hu-HU');
    }

    function el(id) { return document.getElementById(id); }

    function recompute() {
        var evesKm = parseFloat(el('oko-eves-km').value) || 15000;
        var ev = parseInt(el('oko-ev').value, 10) || 12;
        var akku = parseFloat(el('oko-akku').value) || 60;
        var akkugy = parseFloat(el('oko-akkugy').value) || 80;
        var mix = parseFloat(el('oko-mix').value) || 250;

        var totalKm = evesKm * ev;

        // Gyártás (tonna CO2e)
        var prodEV = 7 + (akku * akkugy) / 1000;   // karosszéria + akku
        var prodICE = 7;

        // Használat (tonna CO2e)
        var useEV = totalKm * 0.16 * mix / 1e6;     // kWh * g/kWh -> tonna
        var useICE = totalKm * 0.07 * 2.8 / 1000;   // L * kg/L -> tonna

        var evTotal = prodEV + useEV;
        var iceTotal = prodICE + useICE;
        var diff = iceTotal - evTotal;

        // Megtérülési pont: akku_többlet / (fajlagos benzines - fajlagos villany)
        var perKmICE = 0.07 * 2.8 / 1000;           // tonna/km
        var perKmEV = 0.16 * mix / 1e6;             // tonna/km
        var akkuExtra = (akku * akkugy) / 1000;     // tonna
        var breakeven;
        var breakText;
        if (perKmICE > perKmEV) {
            breakeven = akkuExtra / (perKmICE - perKmEV);
            breakText = '~' + fmtKm(breakeven) + ' km';
        } else {
            breakText = 'azonnal (már a gyártásnál kedvezőbb)';
        }

        el('lbl-oko-km').textContent = fmtKm(evesKm) + ' km';
        el('res-oko-km').textContent = fmtKm(totalKm) + ' km';
        el('res-oko-ev').textContent = fmt(evTotal, 1) + ' t CO₂';
        el('res-oko-benz').textContent = fmt(iceTotal, 1) + ' t CO₂';
        el('res-oko-diff').textContent = fmt(diff, 1) + ' t CO₂ (' + fmt((diff / iceTotal) * 100, 0) + '%)';
        el('res-oko-breakeven').textContent = breakText;
    }

    function bind() {
        ['oko-eves-km', 'oko-ev', 'oko-akku', 'oko-akkugy', 'oko-mix'].forEach(function (id) {
            var node = el(id);
            if (!node) return;
            node.addEventListener('input', recompute);
            node.addEventListener('change', recompute);
        });
        recompute();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
})();
