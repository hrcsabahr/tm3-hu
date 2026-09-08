/* =====================================================
   tm3.hu — Cookie / consent kezelés (GDPR, ePrivacy)
   --------------------------------------------------------
   - 0 külső függőség, ~3 KB
   - consent tárolása: localStorage['tm3:consent']
     { necessary: true, functional: bool, analytics: bool,
       decidedAt: ISO, version: '2026-09-v1' }
   - Google Analytics (gtag.js) csak analytics consent után
     kap 'analytics_storage: granted' jelet. Alapállapot:
     'denied' (consent mode v2, wait_for_update: 500).
   - Banner az első látogatáskor, illetve ha a consent
     elavult (>365 nap) vagy a 'version' eltér.
   - Láblécben lévő "Adatvédelem / Cookie beállítások"
     gombbal bármikor újra megnyitható (window.tm3Consent.open()).
   - A 'functional' kategória a helyi localStorage-ot
     használó funkciókra vonatkozik (fogyasztás CRUD, TCO,
     checklist). Ezek a felhasználó saját eszközén maradnak,
     nem kerülnek továbbításra — de az ePrivacy értelmében
     "tárolóeszközön elhelyezett információ", ezért kéri a
     hozzájárulást. Ha a user elutasítja, a localStorage-ot
     használó funkciók read-only / disabled módba kapcsolnak.
   ===================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'tm3:consent';
    var CONSENT_VERSION = '2026-09-v1';
    var MAX_AGE_DAYS = 365;

    // ----- State -----
    function readConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var c = JSON.parse(raw);
            if (!c || c.version !== CONSENT_VERSION) return null;
            var ageMs = Date.now() - new Date(c.decidedAt).getTime();
            if (ageMs > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;
            return c;
        } catch (_) { return null; }
    }

    function writeConsent(c) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
        } catch (_) {}
    }

    // ----- gtag consent mode bridge -----
    function applyToGtag(c) {
        // Globális gtag mindig definiálva van (a HTML-ben),
        // még ha a config még nem fut le.
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { dataLayer.push(arguments); };

        // Alapértelmezetten minden "denied" — ez a v2 consent mode default.
        // A wait_for_update: 500 ms-ig vár a consent update-re, utána
        // a denied alapján indul (nem küld adatot).
        window.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: c && c.analytics ? 'granted' : 'denied',
            functionality_storage: c && c.functional ? 'granted' : 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted',
            wait_for_update: 500
        });

        if (c && c.analytics) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                functionality_storage: 'granted'
            });
        }
    }

    // ----- UI: Banner + Modal -----
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') node.className = attrs[k];
                else if (k === 'text') node.textContent = attrs[k];
                else if (k === 'html') node.innerHTML = attrs[k];
                else node.setAttribute(k, attrs[k]);
            });
        }
        (children || []).forEach(function (c) {
            if (typeof c === 'string') node.appendChild(document.createTextNode(c));
            else if (c) node.appendChild(c);
        });
        return node;
    }

    var bannerEl = null;
    var modalEl = null;

    function buildBanner() {
        if (bannerEl) return bannerEl;

        bannerEl = el('div', {
            id: 'tm3-consent-banner',
            class: 'tm3-consent-banner',
            role: 'region',
            'aria-label': 'Cookie és adatvédelmi beállítások'
        });

        var box = el('div', { class: 'tm3-consent-box' });

        var text = el('div', { class: 'tm3-consent-text' });
        text.appendChild(el('h3', { class: 'tm3-consent-title', text: 'Sütik és adatvédelem' }));
        text.appendChild(el('p', { html:
            'A tm3.hu a működéshez elengedhetetlen sütiket (PWA cache) és a saját eszközödön tárolt ' +
            'beállításokat (fogyasztási adatok, TCO számítások) minden esetben használ. ' +
            'A statisztikai sütik (Google Analytics) segítenek az oldal fejlesztésében — ' +
            'ezek használatához az alábbi gombbal adhatsz hozzájárulást. ' +
            'Bármikor módosíthatod a döntésedet a láblécben található „Cookie beállítások” gombbal. ' +
            '<a href="/pages/jogi.html" target="_blank" rel="noopener">Részletek</a>.'
        }));

        var actions = el('div', { class: 'tm3-consent-actions' });
        var btnReject = el('button', {
            type: 'button',
            class: 'tm3-btn tm3-btn-secondary',
            'data-action': 'reject-nonessential'
        }, ['Csak a szükségeset']);
        var btnAccept = el('button', {
            type: 'button',
            class: 'tm3-btn tm3-btn-primary',
            'data-action': 'accept-all'
        }, ['Elfogadom']);
        var btnSettings = el('button', {
            type: 'button',
            class: 'tm3-btn tm3-btn-link',
            'data-action': 'open-settings'
        }, ['Beállítások']);
        actions.appendChild(btnSettings);
        actions.appendChild(btnReject);
        actions.appendChild(btnAccept);

        box.appendChild(text);
        box.appendChild(actions);
        bannerEl.appendChild(box);
        return bannerEl;
    }

    function buildModal() {
        if (modalEl) return modalEl;

        modalEl = el('div', {
            id: 'tm3-consent-modal',
            class: 'tm3-consent-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'tm3-consent-modal-title',
            hidden: 'hidden'
        });

        var backdrop = el('div', { class: 'tm3-consent-backdrop', 'data-action': 'close-modal' });
        var card = el('div', { class: 'tm3-consent-card' });

        var head = el('div', { class: 'tm3-consent-card-head' });
        head.appendChild(el('h2', { id: 'tm3-consent-modal-title', text: 'Cookie és adatvédelmi beállítások' }));
        var closeBtn = el('button', {
            type: 'button', class: 'tm3-consent-close',
            'aria-label': 'Bezárás', 'data-action': 'close-modal'
        }, ['×']);
        head.appendChild(closeBtn);

        var body = el('div', { class: 'tm3-consent-card-body' });

        // Necessary
        var rowN = el('div', { class: 'tm3-consent-row tm3-consent-row-locked' });
        rowN.appendChild(el('h3', { text: 'Szigorúan szükséges sütik' }));
        rowN.appendChild(el('p', { text:
            'A PWA offline működéséhez (Service Worker cache: tm3-v2) szükséges. ' +
            'Személyes adatot nem tartalmaz, nem tiltható le.'
        }));
        rowN.appendChild(el('span', { class: 'tm3-consent-state tm3-consent-state-on', text: 'Mindig aktív' }));

        // Functional
        var rowF = el('div', { class: 'tm3-consent-row' });
        rowF.appendChild(el('h3', { text: 'Funkcionális (saját eszközön tárolt)' }));
        rowF.appendChild(el('p', { text:
            'A böngésződ localStorage-jába mentett fogyasztási bejegyzések, TCO-számítások ' +
            'és vásárlási checklist-állapot. Kizárólag a te eszközödön marad, ' +
            'nem kerül továbbításra.'
        }));
        var toggleF = el('label', { class: 'tm3-toggle' });
        var inpF = el('input', { type: 'checkbox', 'data-toggle': 'functional' });
        var sliderF = el('span', { class: 'tm3-toggle-slider' });
        toggleF.appendChild(inpF); toggleF.appendChild(sliderF);
        rowF.appendChild(toggleF);

        // Analytics
        var rowA = el('div', { class: 'tm3-consent-row' });
        rowA.appendChild(el('h3', { text: 'Statisztikai (Google Analytics)' }));
        rowA.appendChild(el('p', { text:
            'Google Analytics 4 (G-709EQ9B200) — anonimizált IP-címmel. ' +
            'Segít megérteni, mely tartalmak a leghasznosabbak. ' +
            'A Google adatkezelése: policies.google.com/privacy.'
        }));
        var toggleA = el('label', { class: 'tm3-toggle' });
        var inpA = el('input', { type: 'checkbox', 'data-toggle': 'analytics' });
        var sliderA = el('span', { class: 'tm3-toggle-slider' });
        toggleA.appendChild(inpA); toggleA.appendChild(sliderA);
        rowA.appendChild(toggleA);

        body.appendChild(rowN);
        body.appendChild(rowF);
        body.appendChild(rowA);

        var foot = el('div', { class: 'tm3-consent-card-foot' });
        var btnSave = el('button', {
            type: 'button', class: 'tm3-btn tm3-btn-primary',
            'data-action': 'save-custom'
        }, ['Mentés']);
        foot.appendChild(btnSave);

        card.appendChild(head);
        card.appendChild(body);
        card.appendChild(foot);

        modalEl.appendChild(backdrop);
        modalEl.appendChild(card);
        return modalEl;
    }

    function showBanner() {
        var b = buildBanner();
        if (!b.parentNode) document.body.appendChild(b);
        // Egy frame-et várunk, hogy a CSS biztosan alkalmazódjon a transition-höz
        requestAnimationFrame(function () { b.classList.add('is-visible'); });
    }

    function hideBanner() {
        if (bannerEl) bannerEl.classList.remove('is-visible');
    }

    function openModal() {
        var m = buildModal();
        if (!m.parentNode) document.body.appendChild(m);
        // Aktuális állapot betöltése a toggle-ökbe
        var c = readConsent() || { functional: false, analytics: false };
        var f = m.querySelector('[data-toggle="functional"]');
        var a = m.querySelector('[data-toggle="analytics"]');
        if (f) f.checked = !!c.functional;
        if (a) a.checked = !!c.analytics;
        m.hidden = false;
        document.documentElement.classList.add('tm3-modal-open');
    }

    function closeModal() {
        if (!modalEl) return;
        modalEl.hidden = true;
        document.documentElement.classList.remove('tm3-modal-open');
    }

    function decide(consentObj) {
        var c = {
            necessary: true, // mindig
            functional: !!consentObj.functional,
            analytics: !!consentObj.analytics,
            decidedAt: new Date().toISOString(),
            version: CONSENT_VERSION
        };
        writeConsent(c);
        applyToGtag(c);
        hideBanner();
        closeModal();
        // Értesítjük a többi scriptet (pl. fogyasztás CRUD)
        document.dispatchEvent(new CustomEvent('tm3:consent-changed', { detail: c }));
    }

    // ----- Event delegation -----
    document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-action]');
        if (!t) return;
        var action = t.getAttribute('data-action');
        if (action === 'accept-all') {
            decide({ functional: true, analytics: true });
        } else if (action === 'reject-nonessential') {
            decide({ functional: false, analytics: false });
        } else if (action === 'open-settings') {
            openModal();
        } else if (action === 'close-modal') {
            closeModal();
        } else if (action === 'save-custom') {
            var f = modalEl && modalEl.querySelector('[data-toggle="functional"]');
            var a = modalEl && modalEl.querySelector('[data-toggle="analytics"]');
            decide({
                functional: f && f.checked,
                analytics: a && a.checked
            });
        }
    });

    // ESC zárja a modált
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalEl && !modalEl.hidden) closeModal();
    });

    // ----- Globális API a lábléc / egyéb scriptek számára -----
    window.tm3Consent = {
        open: openModal,
        showBanner: showBanner,
        get: readConsent,
        set: decide
    };

    // ----- Init -----
    function init() {
        var c = readConsent();
        applyToGtag(c);
        if (!c) {
            // Első látogatás vagy elavult consent
            showBanner();
        }
        // Láblécben lévő "Cookie beállítások" gomb hook
        document.addEventListener('click', function (e) {
            var t = e.target.closest('[data-tm3-action="open-consent"]');
            if (t) {
                e.preventDefault();
                openModal();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
