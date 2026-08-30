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
    // 2026-08-23: redesigned nav based on user feedback — group content by
    // domain (Model 3 / Töltők / Kalkulátorok / Szerviz / Közösség / Vásárlás / Jogi)
    // rather than by page type. Sticky order mirrors the user's information
    // hierarchy: identity → primary tools → support → community → legal.
    // Kept at 8 items (the original count) so the navbar doesn't overflow on
    // mid-width viewports — 'Vásárlás' and 'Közösség' are still reachable
    // from the home-page H2 cards and the footer sitemap.
    NAV_ITEMS = [
        { href: 'index.html', label: 'Főoldal' },
        { href: 'pages/tobberek.html', label: 'Töltők' },
        { href: 'pages/kalkulator.html', label: 'Degradation' },
        { href: 'pages/tco.html', label: 'TCO' },
        { href: 'pages/szervizek.html', label: 'Szerviz' },
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
        // P2 fix: ha a navbar már statikusan bent van a HTML-ben (#site-nav), ne duplikáld.
        if (document.getElementById('site-nav')) return;

        // P2 fix: ha van <nav id="nav"> placeholder, azt cseréljük le a header-re
        // (insertAdjacentHTML 'afterbegin' a body-ba szúr, ami a placeholder ELÉ teszi
        // a headert — így a placeholder is bent marad, és a layout elromlik).
        const placeholder = document.getElementById('nav');
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
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>
        `;
        if (placeholder && placeholder.parentNode) {
            placeholder.outerHTML = navHTML;
        } else if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        }
    }

    // ----- Footer -----
    function renderFooter() {
        const footerPrefix = isSubpage ? root : REPO_PREFIX;
        const footerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <div class="footer-minimal">
                        <div class="footer-brand">tm3.hu — magyar Tesla Model 3 tudásbázis</div>
                        <div class="footer-bottom">
                            <span>© ${new Date().getFullYear()} tm3.hu · Tartalom: CC BY-SA 4.0 · Kód: MIT</span>
                            <span class="footer-disclaimer">
                                <strong>⚠️ Nem hivatalos, független oldal.</strong>
                                A tm3.hu nem kapcsolódik a Tesla, Inc.-hez.
                                <a href="${footerPrefix}/pages/jogi.html">Jogi tudnivalók</a>.
                            </span>
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

    /**
     * P2 (design-concept-2025.md §7): stat counter animation.
     * A .hero__stats .stat__value elemeket 0-ról a célértékre számolja, amikor
     * láthatóvá válnak (IntersectionObserver). A szöveges suffix-eket megőrzi:
     *   "850+"  → 0..850, "850+"
     *   "4.5"   → 0.0..4.5, "4.5"
     *   "7"     → 0..7, "7"
     * prefers-reduced-motion: reduce esetén azonnal a célértéket írja ki.
     */
    function animateStat(el, target, suffix, decimals, duration) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) { el.textContent = target + suffix; return; }
        const start = performance.now();
        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);  // ease-out cubic
            const val = target * eased;
            el.textContent = val.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function parseStatValue(raw) {
        // "850+" → {target: 850, suffix: "+", decimals: 0}
        // "4.5"  → {target: 4.5, suffix: "", decimals: 1}
        // "7"    → {target: 7, suffix: "", decimals: 0}
        const m = String(raw).trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
        if (!m) return null;
        const num = parseFloat(m[1]);
        const suffix = m[2] || '';
        const decimals = (m[1].split('.')[1] || '').length;
        return { target: num, suffix, decimals };
    }

    function initStatCounters() {
        const stats = document.querySelectorAll('.hero__stats .stat__value');
        if (!stats.length) return;
        // Parse + zero out initially (avoid flash of final value)
        const parsed = [];
        stats.forEach((el) => {
            const p = parseStatValue(el.textContent);
            if (!p) return;
            el.dataset.counterTarget = String(p.target);
            el.dataset.counterSuffix = p.suffix;
            el.dataset.counterDecimals = String(p.decimals);
            el.textContent = (0).toFixed(p.decimals) + p.suffix;
            el.style.willChange = 'contents';
            parsed.push({ el, p });
        });

        if (!('IntersectionObserver' in window)) {
            parsed.forEach(({ el, p }) => animateStat(el, p.target, p.suffix, p.decimals, 1));
            return;
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.counterTarget);
                const suffix = el.dataset.counterSuffix;
                const decimals = parseInt(el.dataset.counterDecimals, 10);
                animateStat(el, target, suffix, decimals, 1200);
                obs.unobserve(el);
            });
        }, { threshold: 0.4 });

        parsed.forEach(({ el }) => obs.observe(el));
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
        initStatCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
