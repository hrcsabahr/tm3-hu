/* =====================================================
   Tesla Model 3 Guide — Interactivity (főoldali szekciók)
   A nav és footer a site.js-ben van.
   ===================================================== */

/* ----- Degradation chart (Chart.js) — LIGHT MODE 2026-08-22 v3 ----- */
(function initDegradationChart() {
    const canvas = document.getElementById("degChart");
    if (!canvas || typeof Chart === "undefined") return;

    // 2026-08-22 fix: a degradációs chart VILÁGOS hátteres, sötét betűkkel.
    // Korábban sötét chart volt, ami a sötét oldalon alig olvasható.
    // Most explicit fehér chart-háttér + sötét szövegek + vastag, színes vonalak.

    // Explicit chart area background (a Chart.js options-ban):
    Chart.defaults.color = "#1a1a26";
    Chart.defaults.borderColor = "rgba(0, 0, 0, 0.08)";

    const data = {
        years: {
            labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            datasets: [
                {
                    label: "NCA (Long Range)",
                    data: [100, 97, 95, 93.5, 92, 90.5, 89, 88, 87, 86, 85],
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 4,
                    pointBackgroundColor: "#8b5cf6",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                },
                {
                    label: "NCM811",
                    data: [100, 96, 94, 92, 90.5, 89, 87.5, 86, 85, 84, 83],
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 4,
                    pointBackgroundColor: "#ef4444",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                },
                {
                    label: "LFP (SR+)",
                    data: [100, 99, 98, 97.5, 97, 96.5, 96, 95.5, 95, 94.5, 94],
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 4,
                    pointBackgroundColor: "#f59e0b",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                },
            ],
        },
        km: {
            labels: ["0", "20k", "40k", "60k", "80k", "100k", "120k", "150k", "180k", "200k", "250k"],
            datasets: [
                {
                    label: "NCA (Long Range)",
                    data: [100, 96, 94, 92, 90.5, 89, 87.5, 85.5, 84, 82.5, 80],
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#8b5cf6", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
                {
                    label: "NCM811",
                    data: [100, 95.5, 93, 90.5, 88.5, 86.5, 85, 83, 81, 79.5, 77],
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#ef4444", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
                {
                    label: "LFP (SR+)",
                    data: [100, 99, 98, 97.5, 97, 96.5, 96, 95.5, 95, 94.5, 94],
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#f59e0b", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
            ],
        },
        chem: {
            labels: ["0", "500", "1 000", "1 500", "2 000", "2 500", "3 000", "3 500", "4 000"],
            datasets: [
                {
                    label: "NCA (tipikus ciklusszám)",
                    data: [100, 98, 95, 92, 88, 84, 80, 76, 72],
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#8b5cf6", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
                {
                    label: "NCM811",
                    data: [100, 97, 93, 89, 85, 81, 77, 73, 70],
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#ef4444", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
                {
                    label: "LFP (extrém hosszú)",
                    data: [100, 99.5, 99, 98, 97, 96, 95, 94, 93],
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5, pointHoverRadius: 8, borderWidth: 4,
                    pointBackgroundColor: "#f59e0b", pointBorderColor: "#fff", pointBorderWidth: 2,
                },
            ],
        },
    };

    const titles = {
        years: "Kapacitás (%) vs. évek száma",
        km: "Kapacitás (%) vs. megtett kilométer",
        chem: "Kapacitás (%) vs. töltési ciklusok (1 ciklus = 0→100%)",
    };
    const xLabels = { years: "Év", km: "Kilométer", chem: "Ciklusok" };

    // LIGHT MODE chart: fehér háttér, sötét betűk, színes vonalak.
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        backgroundColor: "#ffffff",
        // 2026-08-22 v4: MINDEN szöveg NAGYOBB, vonalak VASTAGABBAK, pontoK NAGYOBBAK
        plugins: {
            legend: {
                position: "top",
                align: "start",
                labels: {
                    color: "#0a0a14",
                    font: { family: "Inter", size: 17, weight: "800" },
                    boxWidth: 22,
                    boxHeight: 22,
                    padding: 22,
                    usePointStyle: true,
                    pointStyle: "circle",
                },
            },
            title: {
                display: true,
                text: titles.years,
                color: "#020a14",
                font: { family: "Inter Tight", size: 26, weight: "800" },
                padding: { top: 8, bottom: 28 },
            },
            tooltip: {
                enabled: true,
                backgroundColor: "rgba(8, 47, 73, 0.97)",  /* sotet navy */
                titleColor: "#ffffff",
                bodyColor: "#e0f2fe",
                borderColor: "#38bdf8",
                borderWidth: 2,
                padding: 16,
                cornerRadius: 12,
                titleFont: { family: "Inter Tight", size: 18, weight: "800" },
                bodyFont: { family: "Inter", size: 15, weight: "700" },
                caretSize: 8,
                caretPadding: 8,
                displayColors: true,
                boxPadding: 6,
                callbacks: {
                    title: (items) => `${items[0].label} ${dataModeLabel}`,
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}% kapacitás`,
                    afterLabel: (ctx) => {
                        const explanations = {
                            "NCA (Long Range)": "Nikkel-kobalt-aluminium — legnagyobb energiasűrűség, de gyorsabban kopik melegben.",
                            "NCM811": "Nikkel-kobalt-mangán — kiegyensúlyozott teljesítmény és élettartam.",
                            "LFP (SR+)": "Lítium-vas-foszfát — leghosszabb ciklus-élettartam, hidegben gyengébb.",
                            "NCA (tipikus ciklusszám)": "Egy teljes ciklus = 0% → 100% feltöltés.",
                            "LFP (extrém hosszú)": "LFP akár 4000+ ciklust is kibír 80% feletti kapacitással.",
                        };
                        return explanations[ctx.dataset.label] || "";
                    },
                },
            },
        },
        scales: {
            y: {
                min: 60,
                max: 102,
                ticks: {
                    color: "#1a1a26",
                    font: { family: "Inter", size: 16, weight: "700" },
                    padding: 8,
                    callback: (v) => `${v}%`,
                },
                grid: { color: "rgba(8, 47, 73, 0.10)", lineWidth: 1 },
                border: { color: "rgba(8, 47, 73, 0.35)", display: true, width: 2 },
                title: {
                    display: true,
                    text: "Maradék kapacitás (%)",
                    color: "#020a14",
                    font: { family: "Inter Tight", size: 18, weight: "800" },
                    padding: { bottom: 16 },
                },
            },
            x: {
                ticks: {
                    color: "#1a1a26",
                    font: { family: "Inter", size: 15, weight: "700" },
                    padding: 8,
                },
                grid: { color: "rgba(8, 47, 73, 0.06)" },
                border: { color: "rgba(8, 47, 73, 0.35)", display: true, width: 2 },
                title: {
                    display: true,
                    text: xLabels.years,
                    color: "#020a14",
                    font: { family: "Inter Tight", size: 18, weight: "800" },
                    padding: { top: 16 },
                },
            },
        },
        elements: {
            line: {
                borderWidth: 5,
                tension: 0.3,
            },
            point: {
                radius: 6,
                hoverRadius: 10,
                hitRadius: 16,
                borderWidth: 3,
            },
        },
    };

    // dataModeLabel — az x-axis mértékegysége a tooltip-ben
    let dataModeLabel = "év";  // ezt a tab click handler frissíti

    const chart = new Chart(canvas, {
        type: "line",
        data: data.years,
        options: JSON.parse(JSON.stringify(baseOptions)),
    });

    const tabs = document.querySelectorAll(".deg-tab");
    const modeLabels = { years: "év", km: "km", chem: "ciklus" };
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            if (tab.classList.contains("active")) return;
            tabs.forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            const mode = tab.dataset.mode;
            dataModeLabel = modeLabels[mode] || "";
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
