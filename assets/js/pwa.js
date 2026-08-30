// PWA telepítés prompt + frissítés figyelmeztető
(function () {
    'use strict';

    // Service worker regisztráció - a tobberek oldal KIVÉTELÉVEL mindenhol.
    // A tobberek oldalon SZÁNDÉKOSAN NEM regisztrálunk SW-t, mert a korabbi
    // tm3-v3 SW cache-elte az OSM tile-okat "API KEY REQUIRED" PNG-vel.
    // A SW unregister a tobberek oldal betoltesekor azonnal torli a regi SW-t,
    // es a kovetkezo navigacional a tile-ok mar a SW nelkul, kozvetlenul a
    // haloatrol jonnek (a cache-buster query string biztositja a frissesseget).
    if ('serviceWorker' in navigator) {
        const SW_VERSION = 'tm3-v11-2026-08-30-gyik';
        const SW_URL = '/service-worker.js?v=' + encodeURIComponent(SW_VERSION);
        const isMapPage = /\/pages\/tobberek\.html$/.test(location.pathname);
        if (!isMapPage) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register(SW_URL).then((reg) => {
                    if (reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    reg.addEventListener('updatefound', () => {
                        const newSw = reg.installing;
                        if (newSw) {
                            newSw.addEventListener('statechange', () => {
                                if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
                                    newSw.postMessage({ type: 'SKIP_WAITING' });
                                }
                            });
                        }
                    });
                }).catch((err) => {
                    console.warn('SW registration failed:', err);
                });
            });
        } else {
            // Terkep oldal: azonnal unregistereljük az osszes SW-t.
            navigator.serviceWorker.getRegistrations().then((regs) => {
                regs.forEach((r) => r.unregister().then(() => {
                    // Minden tm3-* cache-t is toroljuk.
                    if (window.caches) {
                        caches.keys().then((keys) => {
                            keys.filter((k) => k.startsWith('tm3-')).forEach((k) => caches.delete(k));
                        });
                    }
                }));
            });
        }
    }

    // Install prompt — késleltetett megjelenítés
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // 30 másodperc után felajánljuk
        setTimeout(() => {
            if (deferredPrompt && !window.tm3?.installed) {
                showInstallBanner();
            }
        }, 30000);
    });

    function showInstallBanner() {
        if (document.getElementById('install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; right: 20px;
            /* 2026-08-29: Android Chrome home indicator + iPhone safe-area
               figyelembe vetele, hogy a banner ne keruljon a home gomb ala. */
            bottom: calc(20px + env(safe-area-inset-bottom, 0px));
            max-width: 420px; margin: 0 auto;
            padding: 16px 20px;
            background: var(--ink, #1A1A1A);
            color: white;
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
            display: flex; align-items: center; gap: 12px;
            z-index: 999;
            font-family: Inter, system-ui, sans-serif;
            font-size: 14px;
            animation: slideUp 0.3s ease;
            /* ANDROID: tap-highlight kikapcsolasa a banner gombjain. */
            -webkit-tap-highlight-color: transparent;
        `;
        banner.innerHTML = `
            <div style="flex:1;">
                <strong style="display:block;margin-bottom:2px;">Telepítsd a tm3.hu-t!</strong>
                <span style="opacity:0.8;font-size:13px;">Gyorsabb hozzáférés, offline használat.</span>
            </div>
            <button id="install-btn" style="background:#0075DE;color:white;border:0;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;">Telepítés</button>
            <button id="install-close" style="background:transparent;color:white;border:0;padding:8px;cursor:pointer;opacity:0.6;">✕</button>
        `;
        document.body.appendChild(banner);

        document.getElementById('install-btn').addEventListener('click', async () => {
            banner.remove();
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                window.tm3 = window.tm3 || {};
                window.tm3.installed = true;
            }
            deferredPrompt = null;
        });

        document.getElementById('install-close').addEventListener('click', () => banner.remove());
    }

    window.addEventListener('appinstalled', () => {
        window.tm3 = window.tm3 || {};
        window.tm3.installed = true;
    });
})();
