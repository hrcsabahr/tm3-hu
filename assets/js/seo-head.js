/* ============================================================
 *  seo-head.js — egységes SEO / Open Graph / JSON-LD injektor
 *  Minden HTML oldal <head>-jébe betöltődik a közös SEO-konfig.
 *  Létező meta tageket NEM ír felül — csak a hiányzókat pótolja.
 *  Betöltés: defer, tehát DOMContentLoaded előtt lefut.
 * ============================================================ */
(function () {
    'use strict';

    /* A kanonikus konfiguráció — kézzel karbantartott, de a HEAD-be
       bemásolt JSON-LD blokk így mindig konzisztens a Google-nek. */
    const SITE = {
        url: 'https://tm3.hu',
        name: 'tm3.hu',
        title: 'Tesla Model 3 — Magyar tudásbázis',
        description: 'Tesla Model 3 SR+, Long Range és Performance — reszponzív magyar tudásbázis: akkumulátor, hatótáv, töltés, degradation, szervizek, VIN dekóder, költségkalkulátor.',
        locale: 'hu_HU',
        twitter: '@tm3hu',
        ogImage: 'https://tm3.hu/assets/img/og-image.svg',
        themeColor: '#06121E',
        publisher: {
            '@type': 'Organization',
            name: 'tm3.hu',
            url: 'https://tm3.hu',
            logo: 'https://tm3.hu/assets/img/icon.svg',
        },
    };

    /* Oldal-specifikus felülbírálatok — kulcs = URL path,
       érték = { title, description, h1, type, section } */
    const PAGES = {
        '/': {
            title: 'Tesla Model 3 — Minden, amit tudni érdemes (2024) | tm3.hu',
            description: 'Tesla Model 3 SR+, Long Range és Performance — reszponzív magyar tudásbázis: akkumulátor, hatótáv, töltés, degradation, szervizek, VIN dekóder, költségkalkulátor.',
            h1: 'Tesla Model 3 — Magyar tudásbázis 2024',
            type: 'website',
            section: 'Főoldal',
        },
        '/pages/szervizek.html': {
            title: 'Tesla szervizek Magyarországon (2024) · tm3.hu',
            description: 'Magyarországi Tesla-szervizek listája: hivatalos Budaörs, független specialisták Budapesten és vidéken. Árak, nyitvatartás, szolgáltatások.',
            h1: 'Magyarországi Tesla-szervizek',
            type: 'article',
            section: 'Szervizek',
        },
        '/pages/tobberek.html': {
            title: 'Magyarországi Tesla töltő térkép · Supercharger + Mobiliti · tm3.hu',
            description: 'Interaktív magyarországi töltőhálózat térkép — Tesla Supercharger (Budaörs, Budapest, Szeged, Győr, Balatonfüred, Debrecen, Székesfehérvár), Mobiliti, E.ON, Shell, Volteum. Árak és teljesítmény adatok 2024.',
            h1: 'Magyarországi töltők térképen',
            type: 'article',
            section: 'Töltők',
        },
        '/pages/kalkulator.html': {
            title: 'Tesla Model 3 akkumulátor degradation kalkulátor · tm3.hu',
            description: 'Számold ki a Tesla Model 3 akkumulátor-degradationját évek, kilométer és töltési ciklusok alapján. NCA, NCM811, LFP cellák összehasonlítása.',
            h1: 'Degradation kalkulátor',
            type: 'article',
            section: 'Kalkulátor',
        },
        '/pages/tco.html': {
            title: 'Tesla Model 3 10 éves TCO kalkulátor · Villanyautó vs benzines · tm3.hu',
            description: 'Tesla Model 3 10 éves teljes birtoklási költsége (TCO) — villanyautó vs hasonló benzines szedán (BMW 330i) összehasonlítás. Magyarországi üzemanyagárak, áramárak, szervizköltségek.',
            h1: '10 éves teljes birtoklási költség',
            type: 'article',
            section: 'TCO',
        },
        '/pages/hibak.html': {
            title: 'Tipikus Tesla Model 3 hibák és javítási költségek · tm3.hu',
            description: 'Tipikus Tesla Model 3 meghibásodások, gyári visszahívások, 12V akkumulátor, ajtókilincs, futómű, felfüggesztés — javítási költségekkel és garanciális feltételekkel.',
            h1: 'Tipikus Model 3 hibák és javítási költségek',
            type: 'article',
            section: 'Hibák',
        },
        '/pages/fogyasztas.html': {
            title: 'Tesla Model 3 valós fogyasztási adatbázis · kWh/100km · tm3.hu',
            description: 'Tesla Model 3 valós fogyasztási adatbázis — autópálya, városi, téli/nyári vezetés közösségi mérései. Hogyan befolyásolja a hatótávot a vezetési stílus, hőmérséklet, szél, klíma?',
            h1: 'Valós fogyasztási adatbázis',
            type: 'article',
            section: 'Fogyasztás',
        },
        '/pages/vasarlas.html': {
            title: 'Tesla Model 3 vásárlási útmutató · Új vs használt · tm3.hu',
            description: 'Tesla Model 3 vásárlási útmutató magyar piacra — új és használt autók, garanciális feltételek, finanszírozás, biztosítás, értékvesztés.',
            h1: 'Tesla Model 3 vásárlási útmutató',
            type: 'article',
            section: 'Vásárlás',
        },
        '/pages/blog.html': {
            title: 'Tesla hírek Magyarország · Tesla blog · tm3.hu',
            description: 'Tesla hírek Magyarországról: szoftverfrissítések, Supercharger újdonságok, Model 3/Y/S/X változások, tulajdonosi tapasztalatok.',
            h1: 'Tesla Magyarország hírek',
            type: 'article',
            section: 'Blog',
        },
        '/pages/kozosseg.html': {
            title: 'Magyar Tesla Model 3 közösség · fórum, Discord · tm3.hu',
            description: 'Tesla Model 3 magyar tulajdonosi közösség — hivatalos fórum link, Discord szerver, GitHub Discussions, meetup-ok és tapasztalatcsere.',
            h1: 'Magyar Tesla Model 3 közösség',
            type: 'article',
            section: 'Közösség',
        },
        '/pages/jogi.html': {
            title: 'Jogi tudnivalók · Impresszum · Adatvédelem · tm3.hu',
            description: 'Impresszum, adatvédelmi tájékoztató, cookie-k használata, felelősségkizárás — a tm3.hu oldal üzemeltetői információi.',
            h1: 'Jogi tudnivalók',
            type: 'article',
            section: 'Jogi',
        },
    };

    function getCurrentPath() {
        // index.html esetén /, pages/foo.html esetén /pages/foo.html
        const p = window.location.pathname;
        if (p.endsWith('/index.html') || p === '/' || p === '') return '/';
        return p;
    }

    function ensureMeta(name, attr, content) {
        // attr = 'name' | 'property'
        const sel = `meta[${attr}="${name}"]`;
        let el = document.head.querySelector(sel);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
        return el;
    }

    function ensureLink(rel, href) {
        let el = document.head.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
        return el;
    }

    function setOrUpdateTitle(t) {
        if (document.title !== t) document.title = t;
    }

    function injectJsonLd(page, basePath) {
        // WebSite + WebPage + Organization + BreadcrumbList
        const ld = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': `${SITE.url}/#website`,
                    url: SITE.url,
                    name: SITE.name,
                    inLanguage: 'hu-HU',
                    publisher: { '@id': `${SITE.url}/#organization` },
                },
                {
                    '@type': 'WebPage',
                    '@id': `${SITE.url}${basePath}#webpage`,
                    url: `${SITE.url}${basePath}`,
                    name: page.title,
                    description: page.description,
                    inLanguage: 'hu-HU',
                    isPartOf: { '@id': `${SITE.url}/#website` },
                    about: page.h1,
                },
                {
                    '@type': 'Organization',
                    '@id': `${SITE.url}/#organization`,
                    name: SITE.publisher.name,
                    url: SITE.publisher.url,
                    logo: { '@type': 'ImageObject', url: SITE.publisher.logo },
                },
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Főoldal', item: SITE.url },
                        { '@type': 'ListItem', position: 2, name: page.section, item: `${SITE.url}${basePath}` },
                    ],
                },
            ],
        };

        let script = document.head.querySelector('script[type="application/ld+json"]');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(ld);
    }

    function applySeo() {
        const path = getCurrentPath();
        const page = PAGES[path];
        if (!page) return;

        // Title
        setOrUpdateTitle(page.title);

        // Description
        ensureMeta('description', 'name', page.description);

        // Canonical
        ensureLink('canonical', `${SITE.url}${path === '/' ? '/' : path}`);

        // Open Graph
        ensureMeta('og:type', 'property', page.type);
        ensureMeta('og:site_name', 'property', SITE.name);
        ensureMeta('og:title', 'property', page.title);
        ensureMeta('og:description', 'property', page.description);
        ensureMeta('og:url', 'property', `${SITE.url}${path}`);
        ensureMeta('og:image', 'property', SITE.ogImage);
        ensureMeta('og:locale', 'property', SITE.locale);

        // Twitter Card
        ensureMeta('twitter:card', 'name', 'summary_large_image');
        ensureMeta('twitter:site', 'name', SITE.twitter);
        ensureMeta('twitter:title', 'name', page.title);
        ensureMeta('twitter:description', 'name', page.description);
        ensureMeta('twitter:image', 'name', SITE.ogImage);

        // Theme color + language hint
        ensureMeta('theme-color', 'name', SITE.themeColor);

        // JSON-LD structured data
        injectJsonLd(page, path);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySeo);
    } else {
        applySeo();
    }
})();
