/* =====================================================
   Tesla Model 3 Guide — Interactivity (főoldali szekciók)
   A nav és footer a site.js-ben van.
   ===================================================== */

/* ----- Degradation chart (Chart.js) ----- */
(function initDegradationChart() {
    const canvas = document.getElementById('degChart');
    if (!canvas || typeof Chart === 'undefined') return;

    // Marveen-style chart background: set explicit dark background on the canvas,
    // and ensure the surrounding container has high contrast. This prevents
    // the "black on black" readability issue on dark-mode pages.
    if (canvas.parentElement) {
        canvas.parentElement.style.background = 'rgba(255, 255, 255, 0.04)';
        canvas.parentElement.style.borderRadius = '16px';
        canvas.parentElement.style.padding = '20px';
    }

    // Adatforrások: Tesloop, P3 Charging, EV-database, Tesla flottajelentések.
    const data = {
        years: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            datasets: [
                {
                    label: 'NCA (Long Range)',
                    data: [100, 97, 95, 93.5, 92, 90.5, 89, 88, 87, 86, 85],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'NCM811',
                    data: [100, 96, 94, 92, 90.5, 89, 87.5, 86, 85, 84, 83],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'LFP (SR+)',
                    data: [100, 99, 98, 97.5, 97, 96.5, 96, 95.5, 95, 94.5, 94],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
            ],
        },
        km: {
            labels: ['0', '20k', '40k', '60k', '80k', '100k', '120k', '150k', '180k', '200k', '250k'],
            datasets: [
                {
                    label: 'NCA (Long Range)',
                    data: [100, 96, 94, 92, 90.5, 89, 87.5, 85.5, 84, 82.5, 80],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'NCM811',
                    data: [100, 95.5, 93, 90.5, 88.5, 86.5, 85, 83, 81, 79.5, 77],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'LFP (SR+)',
                    data: [100, 99, 98, 97.5, 97, 96.5, 96, 95.5, 95, 94.5, 94],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
            ],
        },
        chem: {
            labels: ['0', '500', '1 000', '1 500', '2 000', '2 500', '3 000', '3 500', '4 000'],
            datasets: [
                {
                    label: 'NCA (tipikus ciklusszám)',
                    data: [100, 98, 95, 92, 88, 84, 80, 76, 72],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'NCM811',
                    data: [100, 97, 93, 89, 85, 81, 77, 73, 70],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
                {
                    label: 'LFP (extrém hosszú)',
                    data: [100, 99.5, 99, 98, 97, 96, 95, 94, 93],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                },
            ],
        },
    };

    const titles = {
        years: 'Kapacitás (%) vs. évek száma',
        km: 'Kapacitás (%) vs. megtett kilométer',
        chem: 'Kapacitás (%) vs. töltési ciklusok (1 ciklus = 0→100%)',
    };

    const xLabels = { years: 'Év', km: 'Kilométer', chem: 'Ciklusok' };

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { left: 10, right: 30, top: 20, bottom: 10 } },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e4e4e7',
                    font: { family: 'Inter', size: 16, weight: '700' },
                    boxWidth: 16,
                    boxHeight: 16,
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            title: {
                display: true,
                text: titles.years,
                color: '#ffffff',
                font: { family: 'Inter', size: 20, weight: '800' },
                padding: { top: 6, bottom: 24 },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 20, 0.96)',
                titleColor: '#ffffff',
                bodyColor: '#e4e4e7',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                padding: 14,
                cornerRadius: 10,
                titleFont: { family: 'Inter', size: 15, weight: '700' },
                bodyFont: { family: 'Inter', size: 14, weight: '600' },
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
                },
            },
        },
        scales: {
            y: {
                min: 60,
                max: 102,
                ticks: {
                    color: '#d4d4d8',
                    font: { family: 'Inter', size: 14, weight: '600' },
                    callback: (v) => `${v}%`,
                },
                grid: { color: 'rgba(255,255,255,0.12)', lineWidth: 1 },
                border: { color: 'rgba(255,255,255,0.2)' },
                title: {
                    display: true,
                    text: 'Kapacitás (%)',
                    color: '#e4e4e7',
                    font: { family: 'Inter', size: 15, weight: '700' },
                    padding: { bottom: 12 },
                },
            },
            x: {
                ticks: {
                    color: '#d4d4d8',
                    font: { family: 'Inter', size: 14, weight: '600' },
                },
                grid: { color: 'rgba(255,255,255,0.08)' },
                border: { color: 'rgba(255,255,255,0.2)' },
                title: {
                    display: true,
                    text: xLabels.years,
                    color: '#e4e4e7',
                    font: { family: 'Inter', size: 15, weight: '700' },
                    padding: { top: 12 },
                },
            },
        },
    };

    const chart = new Chart(canvas, {
        type: 'line',
        data: data.years,
        options: JSON.parse(JSON.stringify(baseOptions)),
    });

    const tabs = document.querySelectorAll('.deg-tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            tabs.forEach((t) => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const mode = tab.dataset.mode;
            chart.data = data[mode];
            chart.options.plugins.title.text = titles[mode];
            chart.options.scales.x.title.text = xLabels[mode];
            chart.update();
        });
    });
})();

/* =====================================================
   Reveal on scroll
   ===================================================== */
(function initReveal() {
    const items = document.querySelectorAll('.section');
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 },
    );
    items.forEach((i) => observer.observe(i));
})();

console.log(
    '%c⚡ Tesla Model 3 Guide',
    'color:#e31937;font-weight:800;font-size:18px;',
);
console.log(
    '%cMinden adat 2026 Q2-es forrásokból. Készült HTML, CSS és vanilla JS-sel.',
    'color:#a1a1aa;font-size:12px;',
);
