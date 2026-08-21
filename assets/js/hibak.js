/* =====================================================
   Hibák oldal — szűrés + render
   ===================================================== */

(async function () {
    const list = document.getElementById('hibak-list');
    if (!list) return;

    let data;
    try {
        const res = await fetch('../data/hibak.json');
        data = await res.json();
    } catch (e) {
        list.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + e.message + '</p></div>';
        return;
    }

    const SZERVIZ_NEV = {
        'tesla-szervizek': 'Minden Tesla Service Center',
        'budapest-pest-tesla': 'Tesla SC Budapest (Pest)',
        'budapest-buda-tesla': 'Tesla SC Budapest (Buda)',
        'budapest-ev-specialist': 'EV Specialist Hungary',
        'budapest-bodyshop': 'Tesla Karosszéria Specialista',
        'specialista-szervizek': 'Független specialisták',
        'minden-szerviz': 'Bármelyik szerviz',
    };

    function render(items) {
        if (items.length === 0) {
            list.innerHTML = '';
            document.getElementById('hibak-empty').style.display = 'block';
            return;
        }
        document.getElementById('hibak-empty').style.display = 'none';

        list.innerHTML = items
            .map(
                (h) => `
            <article class="card">
                <div class="card-head">
                    <h3>${h.cim}</h3>
                    <div class="hiba-badges">
                        <span class="tag">${h.gyakorisag}</span>
                        <span class="tag accent">${h.evjarat}</span>
                        <span class="tag">${h.kategoria}</span>
                    </div>
                </div>
                <div class="grid grid-2">
                    <div class="hiba-section">
                        <h4>⚠ Tünetek</h4>
                        <ul>${h.tunetek.map((t) => `<li>${t}</li>`).join('')}</ul>
                    </div>
                    <div class="hiba-section">
                        <h4>🔍 Ok & javítás</h4>
                        <p>${h.ok}</p>
                        <p>${h.javitás}</p>
                    </div>
                </div>
                <div class="row" style="padding-top:16px;margin-top:16px;border-top:1px solid var(--line);font-size:13px;">
                    <div><span style="color:var(--ink-3);">⏱ Idő:</span> <strong>${h.ido_orak} óra</strong></div>
                    <div><span style="color:var(--ink-3);">💶 Ár (EUR):</span> <strong>€${h.ar_eur}</strong></div>
                    <div><span style="color:var(--ink-3);">💰 Ár (HUF):</span> <strong>${tm3.fmt.huf(h.ar_huf)}</strong></div>
                    <div><span style="color:var(--ink-3);">🔧 Szerviz:</span> <strong>${h.megoldo_szerviz.map((s) => SZERVIZ_NEV[s] || s).join(', ')}</strong></div>
                </div>
                ${h.megelozes ? `<div class="tip-box green" style="margin-top:16px;margin-bottom:0;"><strong>Megelőzés:</strong> ${h.megelozes}</div>` : ''}
                ${h.megjegyzes ? `<div class="tip-box orange" style="margin-top:16px;margin-bottom:0;">${h.megjegyzes}</div>` : ''}
            </article>`,
            )
            .join('');
    }

    function filter() {
        const q = document.getElementById('filter-search').value.toLowerCase();
        const kat = document.getElementById('filter-kategoria').value;
        const gyak = document.getElementById('filter-gyak').value;

        const filtered = data.hibak.filter((h) => {
            if (
                q &&
                !`${h.cim} ${h.kategoria} ${h.tunetek.join(' ')} ${h.ok} ${h.javitás}`
                    .toLowerCase()
                    .includes(q)
            )
                return false;
            if (kat && h.kategoria !== kat) return false;
            if (gyak && h.gyakorisag !== gyak) return false;
            return true;
        });

        render(filtered);
    }

    document.querySelectorAll('.filter-bar input, .filter-bar select').forEach((el) => {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
    });

    render(data.hibak);
})();
