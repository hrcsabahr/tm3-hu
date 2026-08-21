/* =====================================================
   Fogyasztás adatbázis — localStorage CRUD
   ===================================================== */

(function () {
    const $ = (id) => document.getElementById(id);
    const KEY = 'fogyasztas';

    function load() {
        return tm3.store.get(KEY, []);
    }

    function save(arr) {
        tm3.store.set(KEY, arr);
    }

    const TIPUS_LABEL = {
        autopalya: { label: 'Autópálya', badge: 'autopalya' },
        orszagut: { label: 'Országút', badge: 'autopalya' },
        varos: { label: 'Város', badge: 'varos' },
        tel: { label: 'Tél', badge: 'tel' },
        vegyes: { label: 'Vegyes', badge: 'vegyes' },
    };

    const VARIANT_LABEL = { sr: 'SR+', lr: 'Long Range', perf: 'Performance' };

    function render() {
        const data = load().sort((a, b) => new Date(b.datum) - new Date(a.datum));
        const tbody = $('fogy-tbody');
        const empty = $('fogy-empty');

        if (data.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            tbody.innerHTML = data
                .map(
                    (d) => `
                <tr>
                    <td>${tm3.fmt.dt(d.datum)}</td>
                    <td><span class="badge ${TIPUS_LABEL[d.tipus].badge}">${TIPUS_LABEL[d.tipus].label}</span></td>
                    <td>${VARIANT_LABEL[d.valtozat]}</td>
                    <td>${d.homerseklet}°C</td>
                    <td>${d.sebesseg} km/h</td>
                    <td><strong>${d.kwh.toFixed(1)}</strong> kWh/100km</td>
                    <td>${tm3.fmt.num(d.tavolsag)} km</td>
                    <td><button class="btn btn-ghost btn-sm" data-del="${d.id}">🗑️</button></td>
                </tr>`,
                )
                .join('');

            tbody.querySelectorAll('[data-del]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-del');
                    const arr = load().filter((x) => x.id !== id);
                    save(arr);
                    render();
                    tm3.toast('✓ Sor törölve', 'success');
                });
            });
        }

        // Statisztikák
        $('stat-count').textContent = data.length;
        if (data.length > 0) {
            const avg = data.reduce((s, x) => s + x.kwh, 0) / data.length;
            $('stat-avg').textContent = avg.toFixed(1) + ' kWh';

            const hw = data.filter((x) => x.tipus === 'autopalya');
            if (hw.length > 0) {
                const hwAvg = hw.reduce((s, x) => s + x.kwh, 0) / hw.length;
                $('stat-hw').textContent = hwAvg.toFixed(1) + ' kWh';
            } else {
                $('stat-hw').textContent = '—';
            }

            const wt = data.filter((x) => x.tipus === 'tel');
            if (wt.length > 0) {
                const wtAvg = wt.reduce((s, x) => s + x.kwh, 0) / wt.length;
                $('stat-winter').textContent = wtAvg.toFixed(1) + ' kWh';
            } else {
                $('stat-winter').textContent = '—';
            }
        } else {
            $('stat-avg').textContent = '—';
            $('stat-hw').textContent = '—';
            $('stat-winter').textContent = '—';
        }
    }

    $('fogyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const entry = {
            id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            datum: new Date().toISOString(),
            tipus: $('f-tipus').value,
            valtozat: $('f-valtozat').value,
            homerseklet: parseFloat($('f-homerseklet').value),
            sebesseg: parseFloat($('f-sebesseg').value),
            kwh: parseFloat($('f-kwh').value),
            tavolsag: parseFloat($('f-tavolsag').value),
            regen: $('f-regen').value,
            klima: $('f-klima').value,
        };
        const arr = load();
        arr.push(entry);
        save(arr);
        render();
        e.target.reset();
        tm3.toast('✓ Fogyasztási adat elmentve', 'success', 3000);
    });

    $('export-btn').addEventListener('click', () => {
        const data = load();
        if (data.length === 0) {
            tm3.toast('Nincs exportálható adat');
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tm3-fogyasztas-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        tm3.toast('✓ Exportálva', 'success');
    });

    $('reset-btn').addEventListener('click', () => {
        if (load().length === 0) {
            tm3.toast('Nincs törölhető adat');
            return;
        }
        if (confirm('Biztosan törlöd az összes saját fogyasztási adatodat?')) {
            save([]);
            render();
            tm3.toast('✓ Adatok törölve', 'success');
        }
    });

    render();
})();
