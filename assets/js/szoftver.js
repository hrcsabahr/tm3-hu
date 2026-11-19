/* =====================================================
   Szoftververziók oldal — legújabb verzió + előzmények
   Adatforrás: ../data/software.json (GitHub Actions cron frissíti)
   ===================================================== */

(function () {
    'use strict';

    const latestEl = document.getElementById('szoftver-latest');
    const listEl = document.getElementById('szoftver-list');
    const countEl = document.getElementById('szoftver-count');
    const emptyEl = document.getElementById('szoftver-empty');
    if (!latestEl && !listEl) return;

    const HONAP = ['január', 'február', 'március', 'április', 'május', 'június',
        'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function nl2br(s) {
        return esc(s).replace(/\n/g, '<br>');
    }

    function fmtDate(d) {
        if (!d) return '—';
        const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return esc(d);
        const mi = parseInt(m[2], 10) - 1;
        if (mi < 0 || mi > 11) return esc(d);
        return m[1] + '. ' + HONAP[mi] + ' ' + parseInt(m[3], 10) + '.';
    }

    function fleetLine(v) {
        const parts = [];
        if (v.flotta_db) {
            parts.push('<div>🚗 <strong>' + tm3.fmt.num(v.flotta_db) + '</strong> jármű a flottában'
                + (v.flotta_pct != null ? ' (' + v.flotta_pct + '%)' : '') + '</div>');
        }
        const r = v.rollout || {};
        const rollout = [];
        if (r.elérhető) rollout.push(r.elérhető + ' elérhető');
        if (r.letöltés) rollout.push(r.letöltés + ' letöltés');
        if (r.telepítés) rollout.push(r.telepítés + ' telepítés');
        if (rollout.length) parts.push('<div>📥 ' + rollout.join(' · ') + '</div>');
        return parts.join('');
    }

    function renderLatest(v) {
        if (!latestEl) return;
        if (!v) { latestEl.innerHTML = ''; return; }
        const feats = (v.features || []).map(f => (
            '<li style="margin:10px 0;">'
            + '<strong>' + esc(f.cim) + '</strong>'
            + (f.leiras ? '<br><span style="color:var(--ink-2);">' + nl2br(f.leiras) + '</span>' : '')
            + '</li>'
        )).join('');

        latestEl.innerHTML =
            '<article class="card" style="border-color:var(--accent,#F43F5E);">' +
                '<div class="card-head">' +
                    '<h3>Legújabb verzió</h3>' +
                    '<div class="hiba-badges"><span class="tag accent">LEGÚJABB</span></div>' +
                '</div>' +
                '<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:clamp(28px,5vw,44px);' +
                    'font-weight:700;letter-spacing:-0.02em;line-height:1.1;">' + esc(v.version) + '</div>' +
                '<div style="color:var(--ink-2);font-size:15px;margin:8px 0 16px;">' +
                    'Kiadva: <strong>' + fmtDate(v.datum) + '</strong>'
                    + (v.fsd ? ' · FSD: <strong>' + esc(v.fsd) + '</strong>' : '')
                    + (v.orszagok && v.orszagok.length ? ' · 🌍 ' + v.orszagok.length + ' ország' : '') +
                '</div>' +
                '<div class="row" style="gap:16px;flex-wrap:wrap;padding:14px 0;' +
                    'border-top:1px solid var(--line);border-bottom:1px solid var(--line);' +
                    'margin-bottom:18px;font-size:14px;color:var(--ink-2);">' + fleetLine(v) + '</div>' +
                (feats
                    ? '<h4 style="margin:0 0 10px;">Újdonságok (release notes)</h4>'
                      + '<ul style="margin:0 0 0 20px;padding:0;color:var(--ink-2);">' + feats + '</ul>'
                    : '<p style="color:var(--ink-2);">Ehhez a verzióhoz nincs részletes release notes.</p>') +
            '</article>';
    }

    function renderList(items) {
        if (!listEl) return;
        if (!items || items.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (countEl) countEl.textContent = '';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        listEl.innerHTML = items.map(v => (
            '<article class="card">' +
                '<div class="card-head">' +
                    '<h3 style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">' + esc(v.version) + '</h3>'
                    + (v.fsd ? '<span class="tag accent">' + esc(v.fsd) + '</span>' : '') +
                '</div>' +
                '<div style="color:var(--ink-3);font-size:13px;margin-bottom:8px;">' + fmtDate(v.datum)
                    + (v.flotta_db ? ' · 🚗 ' + tm3.fmt.num(v.flotta_db) + ' jármű' : '') + '</div>'
                + (v.feature_cimek && v.feature_cimek.length
                    ? '<p style="color:var(--ink-2);font-size:14px;line-height:1.6;margin:0;">'
                      + v.feature_cimek.slice(0, 3).map(esc).join(' · ')
                      + (v.feature_cimek.length > 3 ? ' …' : '') + '</p>'
                    : '<p style="color:var(--ink-3);font-size:14px;margin:0;">Nincs részletes leírás.</p>') +
            '</article>'
        )).join('');
    }

    (async function () {
        let data;
        try {
            const res = await fetch('../data/software.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            data = await res.json();
        } catch (e) {
            if (latestEl) latestEl.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + esc(e.message) + '</p></div>';
            if (listEl) listEl.innerHTML = '';
            return;
        }

        renderLatest(data.latest);
        renderList(data.verziok);
        if (countEl && data.verziok && data.verziok.length) {
            const upd = data.meta && data.meta.updated ? ' · frissítve: ' + fmtDate(data.meta.updated.slice(0, 10)) : '';
            countEl.textContent = data.verziok.length + ' korábbi verzió' + upd;
        }
    })();
})();
