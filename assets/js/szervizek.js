/* =====================================================
   Szerviz kereső — szűrés + render
   ===================================================== */

(async function () {
    const list = document.getElementById('szerviz-list');
    if (!list) return;

    let data;
    try {
        const res = await fetch('../data/szervizek.json');
        data = await res.json();
    } catch (e) {
        list.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + e.message + '</p></div>';
        return;
    }

    const szervizek = data.szervizek;

    // Városok a legördülőbe
    const varosSelect = document.getElementById('filter-varos');
    const varosok = [...new Set(szervizek.map((s) => s.varos))].sort();
    varosok.forEach((v) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        varosSelect.appendChild(o);
    });

    const SZOLGALTATAS_LABEL = {
        'hv-rendszer': 'HV akkumulátor',
        futomu: 'Futómű',
        fek: 'Fék',
        klima: 'Klíma',
        '12v': '12V akkumulátor',
        hutofolyadek: 'Hűtőfolyadék',
        diagnosztika: 'Diagnosztika',
        karosszeria: 'Karosszéria',
        gumi: 'Gumiabroncs',
        fenyezes: 'Fényezés',
        szoftver: 'Szoftver',
        ajtokilincs: 'Ajtókilincs',
    };

    function serviceChip(key) {
        return `<span class="chip">${SZOLGALTATAS_LABEL[key] || key}</span>`;
    }

    function ratingStars(r) {
        const full = Math.round(r);
        return '★'.repeat(full) + '☆'.repeat(5 - full);
    }

    function render(items) {
        if (items.length === 0) {
            list.innerHTML = '';
            document.getElementById('szerviz-empty').style.display = 'block';
            return;
        }
        document.getElementById('szerviz-empty').style.display = 'none';

        list.innerHTML = items
            .map(
                (s) => `
            <article class="card ${s.premium ? 'feature' : ''}">
                <div class="card-head">
                    <h3>${s.nev}</h3>
                    <span class="tag ${s.tipus === 'hivatalos' ? 'accent' : ''}">${s.tipus === 'hivatalos' ? 'Hivatalos' : 'Specialista'}</span>
                </div>
                <div class="meta">
                    <span>📍 ${s.varos}</span>
                    <span class="rating">${ratingStars(s.rating)} ${s.rating.toFixed(1)} (${s.reviews})</span>
                </div>
                <div class="meta">
                    <span>📫 ${s.cim}</span>
                </div>
                <div class="meta">
                    <span>📞 <a href="tel:${s.telefon}" style="color:var(--accent-2);">${s.telefon}</a></span>
                </div>
                <div class="services">
                    ${s.services.map(serviceChip).join('')}
                </div>
                ${s.megjegyzes ? `<p class="megjegyzes">${s.megjegyzes}</p>` : ''}
                <div class="actions">
                    ${s.idpont ? `<a href="${s.idpont === 'telefon' ? 'tel:' + s.telefon : s.idpont}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Időpontfoglalás</a>` : ''}
                    ${s.web ? `<a href="${s.web}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Weboldal ↗</a>` : ''}
                </div>
            </article>`,
            )
            .join('');
    }

    function filter() {
        const q = document.getElementById('filter-search').value.toLowerCase();
        const varos = document.getElementById('filter-varos').value;
        const tipus = document.getElementById('filter-tipus').value;
        const szolgal = document.getElementById('filter-szolgaltatas').value;
        const premium = document.getElementById('filter-premium').checked;

        const filtered = szervizek.filter((s) => {
            if (q && !`${s.nev} ${s.varos} ${s.cim}`.toLowerCase().includes(q)) return false;
            if (varos && s.varos !== varos) return false;
            if (tipus && s.tipus !== tipus) return false;
            if (szolgal && !s.services.includes(szolgal)) return false;
            if (premium && !s.premium) return false;
            return true;
        });

        filtered.sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || b.rating - a.rating);
        render(filtered);
    }

    document.querySelectorAll('.filter-bar input, .filter-bar select').forEach((el) => {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
    });

    render(szervizek.sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || b.rating - a.rating));
})();
