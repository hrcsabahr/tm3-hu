/* =====================================================
   Visszahívások oldal — szűrés + render
   ===================================================== */

(async function () {
    const list = document.getElementById('visszahivasok-list');
    if (!list) return;

    let data;
    try {
        const res = await fetch('../data/visszahivasok.json');
        data = await res.json();
    } catch (e) {
        list.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + e.message + '</p></div>';
        return;
    }

    const JAVITAS_NEV = {
        'ota': '📡 OTA frissítés',
        'szerviz': '🔧 Szerviz',
    };

    function render(items) {
        const empty = document.getElementById('visszahivasok-empty');
        const count = document.getElementById('visszahivasok-count');
        if (items.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
            count.textContent = '0 találat';
            return;
        }
        empty.style.display = 'none';
        count.textContent = items.length + ' visszahívás';

        list.innerHTML = items
            .map((r) => `
            <article class="card">
                <div class="card-head">
                    <h3>${r.cim}</h3>
                    <div class="hiba-badges">
                        <span class="tag">${r.alkatresz}</span>
                        <span class="tag accent">${r.evjarat}</span>
                        <span class="tag">${r.nhtsa}</span>
                    </div>
                </div>
                <p style="color:var(--ink-2);font-size:15px;line-height:1.6;">${r.leiras}</p>
                <div class="row" style="padding-top:16px;margin-top:16px;border-top:1px solid var(--line);font-size:13px;">
                    <div><span style="color:var(--ink-3);">📅 Dátum:</span> <strong>${tm3.fmt.dt(r.datum)}</strong></div>
                    <div><span style="color:var(--ink-3);">🛠 Javítás:</span> <strong>${JAVITAS_NEV[r.javitas] || r.javitas}</strong></div>
                    ${r.darab ? `<div><span style="color:var(--ink-3);">🚗 Érintett:</span> <strong>${tm3.fmt.num(r.darab)} jármű</strong></div>` : ''}
                </div>
            </article>`,
            )
            .join('');
    }

    function filter() {
        const q = document.getElementById('filter-search').value.toLowerCase();
        const kat = document.getElementById('filter-alkatresz').value;
        const jav = document.getElementById('filter-javitas').value;

        const filtered = data.visszahivasok.filter((r) => {
            if (q && !`${r.cim} ${r.leiras} ${r.evjarat} ${r.alkatresz} ${r.nhtsa}`.toLowerCase().includes(q)) return false;
            if (kat && r.alkatresz !== kat) return false;
            if (jav && r.javitas !== jav) return false;
            return true;
        });

        render(filtered);
    }

    document.querySelectorAll('.filter-bar input, .filter-bar select').forEach((el) => {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
    });

    // Rendezés: legújabb elöl
    render(data.visszahivasok.sort((a, b) => new Date(b.datum) - new Date(a.datum)));
})();
