// PWA telepítés prompt + frissítés figyelmeztető
(function () {
    'use strict';

    // Service worker regisztráció - MINDEN oldalon, hogy a tm3-v6 SW
    // mindenhol aktiválódjon (a tobberek oldalon IS), és törölje a
    // korabbi tm3-v3 SW cache-ét (amely "API KEY REQUIRED" PNG-ket tartalmaz).
    // A query string biztositja, hogy a bongeszo mindig ujnak tekintse a SW-t.
    if ('serviceWorker' in navigator) {
        const SW_VERSION = 'tm3-v6-2026-08-29-final';
        const SW_URL = '/service-worker.js?v=' + encodeURIComponent(SW_VERSION);
        window.addEventListener('load', () => {
            // Regisztracio utan azonnal kerjuk a SW-t, hogy vegye at az iranyitast.
            navigator.serviceWorker.register(SW_URL).then((reg) => {
                // Ha van uj SW varakozik, azonnal aktiváljuk.
                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                // Figyeljuk a frissíteseket.
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

        // Ha az uj SW uzenetet kap SKIP_WAITING-ra, azonnal vegye at az iranyitast.
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Új SW aktiválódott - a kovetkezo navigacio mar az uj SW-vel tortenik.
            // Ha a tobberek oldalon vagyunk, frissitsuk az oldalt, hogy a tile-ok
            // mar az uj fetch handler-en menjenek at.
            if (window.location.pathname.endsWith('/pages/tobberek.html')) {
                // Nem kell azonnal reload - az uj SW mar aktiv, es a kovetkezo
                // tile-keres mar az uj fetch handler-en megy at.
            }
        });
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
