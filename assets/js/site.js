/* ===========================================================
   site.js — common UI for the Tesla Model 3 site
   - Nav render
   - Footer render
   - Scroll reveal (IntersectionObserver)
   - Nav scroll state
   - Mobile nav toggle
   =========================================================== */

(function () {
    'use strict';

    // ----- Nav -----
    const NAV_ITEMS = [
        { href: 'index.html', label: 'Főoldal' },
        { href: 'pages/szervizek.html', label: 'Szervizek' },
        { href: 'pages/tobberek.html', label: 'Töltők' },
        { href: 'pages/kalkulator.html', label: 'Degradation' },
        { href: 'pages/tco.html', label: 'TCO' },
        { href: 'pages/hibak.html', label: 'Hibák' },
        { href: 'pages/blog.html', label: 'Hírek' },
        { href: 'pages/jogi.html', label: 'Jogi' },
    ];

    // Repo prefix: a /tm3-hu/ repo user-site-on való eléréséhez (GitHub Pages),
    // üres ha custom domain (tm3.hu) alatt vagyunk.
    const REPO_PREFIX = (location.pathname.startsWith('/tm3-hu') ||
                          location.pathname.startsWith('/pages/'))
        ? '/tm3-hu'
        : '';

    const isSubpage = location.pathname.includes('/pages/');
    const root = isSubpage ? '..' : '.';

    function renderNav() {
        const current = location.pathname.replace(/\\/g, '/');
        const items = NAV_ITEMS.map(item => {
            const relHref = item.href;
            const href = isSubpage
                ? `${root}/${relHref}`
                : `${REPO_PREFIX}/${relHref}`;
            const pathForActive = `${REPO_PREFIX}/${relHref}`.replace(/\/+$/, '/');
            const active = (current === pathForActive) ||
                (item.href === 'index.html' && (current === '/' ||
                    current.endsWith('/index.html') ||
                    current.endsWith('/tm3-hu/')));
            return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${item.label}</a>`;
        }).join('');

        const homeHref = isSubpage ? `${root}/index.html` : `${REPO_PREFIX}/index.html`;
        const navHTML = `
            <header class="navbar" id="site-nav">
                <div class="nav-wrap">
                    <a href="${homeHref}" class="brand" aria-label="tm3.hu">
                        <span class="brand-mark">M3</span>
                        <span>tm3.hu</span>
                    </a>
                    <nav class="main-nav" id="site-main-nav" aria-label="Fő navigáció">
                        ${items}
                    </nav>
                    <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Menü megnyitása" aria-expanded="false">
                        <span></span>
                    </button>
                </div>
            </header>
        `;
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // ----- Footer -----
    function renderFooter() {
        const footerPrefix = isSubpage ? root : REPO_PREFIX;
        const footerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <div class="footer-brand">tm3.hu</div>
                            <p class="footer-tag">Magyar Tesla Model 3 tudásbázis. SR+, Long Range és Performance — adatok, kalkulátorok, közösség.</p>
                        </div>
                        <div class="footer-col">
                            <h4>Eszközök</h4>
                            <ul>
                                <li><a href="${footerPrefix}/pages/kalkulator.html">Degradation</a></li>
                                <li><a href="${footerPrefix}/pages/tco.html">10 éves TCO</a></li>
                                <li><a href="${footerPrefix}/pages/fogyasztas.html">Fogyasztás</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Információ</h4>
                            <ul>
                                <li><a href="${footerPrefix}/pages/szervizek.html">Szervizek</a></li>
                                <li><a href="${footerPrefix}/pages/tobberek.html">Töltők</a></li>
                                <li><a href="${footerPrefix}/pages/hibak.html">Hibák</a></li>
                                <li><a href="${footerPrefix}/pages/vasarlas.html">Vásárlás</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Közösség</h4>
                            <ul>
                                <li><a href="${footerPrefix}/pages/blog.html">Hírek</a></li>
                                <li><a href="${footerPrefix}/pages/kozosseg.html">Fórum</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="footer-bottom-row">
                            <span>© ${new Date().getFullYear()} tm3.hu · Tartalom: CC BY-SA 4.0 · Kód: MIT</span>
                            <span>Tesla, Model 3, SR+, Long Range, Performance a Tesla, Inc. bejegyzett védjegyei.</span>
                        </div>
                        <div class="footer-bottom-row footer-disclaimer">
                            <strong>⚠️ Nem hivatalos, független oldal.</strong>
                            A tm3.hu nem kapcsolódik a Tesla, Inc.-hez, és nem annak tulajdona vagy partnere.
                            Az itt megjelent tartalom kizárólag tájékoztató jellegű.
                            <a href="${footerPrefix}/pages/jogi.html">Jogi tudnivalók, impresszum, adatvédelem</a>.
                        </div>
                    </div>
                </div>
            </footer>
        `;
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // ----- Scroll reveal -----
    function initReveal() {
        const targets = document.querySelectorAll('.reveal');
        if (!targets.length || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });
        targets.forEach(el => observer.observe(el));
    }

    // ----- Nav scroll state -----
    function initNavScroll() {
        const nav = document.getElementById('site-nav');
        if (!nav) return;
        const onScroll = () => {
            if (window.scrollY > 8) {
                nav.classList.add('is-scrolled');
            } else {
                nav.classList.remove('is-scrolled');
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ----- Mobile nav toggle -----
    function initNavToggle() {
        const toggle = document.getElementById('nav-toggle');
        const nav = document.getElementById('site-main-nav');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Close on link click
        nav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ----- Footer & KPI helpers (kept for backward compat) -----
    function renderFooterYear() {
        const yearEl = document.querySelectorAll('[data-year]');
        yearEl.forEach(el => el.textContent = new Date().getFullYear());
    }

    function bindKpi() {
        const kpis = document.querySelectorAll('[data-kpi]');
        kpis.forEach(el => {
            const key = el.dataset.kpi;
            const target = el.dataset.target;
            // Simple counter — optional, not required
        });
    }

    // ----- Init -----
    function init() {
        renderNav();
        renderFooter();
        initReveal();
        initNavScroll();
        initNavToggle();
        renderFooterYear();
        bindKpi();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
