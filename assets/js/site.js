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
        { href: '/index.html', label: 'Főoldal' },
        { href: '/pages/szervizek.html', label: 'Szervizek' },
        { href: '/pages/tobberek.html', label: 'Töltők' },
        { href: '/pages/kalkulator.html', label: 'Degradation' },
        { href: '/pages/tco.html', label: 'TCO' },
        { href: '/pages/hibak.html', label: 'Hibák' },
        { href: '/pages/vasarlas.html', label: 'Vásárlás' },
        { href: '/pages/blog.html', label: 'Hírek' },
    ];

    const isSubpage = location.pathname.includes('/pages/');
    const root = isSubpage ? '..' : '.';

    function renderNav() {
        const current = location.pathname.replace(/\\/g, '/');
        const items = NAV_ITEMS.map(item => {
            const href = isSubpage ? item.href.replace('/pages/', '').replace('/index.html', '/index.html') : item.href;
            const full = isSubpage ? root + item.href.replace('/pages/', '/pages/') : item.href;
            const active = (current === full.replace(/^\.\./, '').replace(/^\.\//, '/')) ||
                (item.href === '/index.html' && (current === '/' || current === '/index.html' || current.endsWith('/index.html')));
            return `<a href="${full}"${active ? ' aria-current="page"' : ''}>${item.label}</a>`;
        }).join('');

        const navHTML = `
            <header class="navbar" id="site-nav">
                <div class="nav-wrap">
                    <a href="${root}/index.html" class="brand" aria-label="tm3.hu">
                        <span class="brand-mark">M3</span>
                        <span>tm3.hu</span>
                    </a>
                    <nav class="main-nav" id="site-main-nav" aria-label="Fő navigáció">
                        ${items}
                    </nav>
                    <a href="${root}/pages/vasarlas.html" class="nav-cta">Rendelés</a>
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
                                <li><a href="${root}/pages/kalkulator.html">Degradation</a></li>
                                <li><a href="${root}/pages/tco.html">10 éves TCO</a></li>
                                <li><a href="${root}/pages/fogyasztas.html">Fogyasztás</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Információ</h4>
                            <ul>
                                <li><a href="${root}/pages/szervizek.html">Szervizek</a></li>
                                <li><a href="${root}/pages/tobberek.html">Töltők</a></li>
                                <li><a href="${root}/pages/hibak.html">Hibák</a></li>
                                <li><a href="${root}/pages/vasarlas.html">Vásárlás</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Közösség</h4>
                            <ul>
                                <li><a href="${root}/pages/blog.html">Hírek</a></li>
                                <li><a href="${root}/pages/kozosseg.html">Fórum</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <span>© ${new Date().getFullYear()} tm3.hu · Tartalom: CC BY-SA 4.0 · Kód: MIT</span>
                        <span>Tesla, Model 3, SR+, Long Range, Performance a Tesla, Inc. bejegyzett védjegyei.</span>
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
