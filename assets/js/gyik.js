/* ===========================================================
   gyik.js — tm3.hu GYIK oldal
   - Accordion (HTML <details> natív, nincs JS szükséges)
   - Kategória szűrő (5 kategória: vásárlás, akkumulátor, töltés, szerviz, TCO)
   - "Összes kibontása / összecsukása" gomb
   - URL hash alapján auto-open (#q1, #q2, ... #q18)
   =========================================================== */

(function () {
    'use strict';

    const filterBar = document.getElementById('gyik-filter');
    const faqList = document.getElementById('faq-list');
    if (!filterBar || !faqList) return;

    const buttons = filterBar.querySelectorAll('.gyik-cat');
    const items = faqList.querySelectorAll('.faq-item');

    /* ----- KATEGÓRIA SZŰRŐ ----- */
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Aktív gomb státusz
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.dataset.cat;
            items.forEach((item) => {
                if (cat === 'all' || item.dataset.cat === cat) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                    // Ha rejtett, zárjuk is be az accordion-t, hogy ne foglaljon scroll-t.
                    item.removeAttribute('open');
                }
            });

            // Görgetés a lista tetejére, hogy a user lássa a szűrt találatokat.
            const section = faqList.closest('.section');
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top < 0 || rect.top > 200) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    /* ----- ÖSSZES KIBONTÁSA / ÖSSZECSUKÁSA GOMB ----- */
    // Beszúrjuk a "Bezárás / Megnyitás" gombot a szűrősorba.
    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.type = 'button';
    toggleAllBtn.className = 'gyik-cat';
    toggleAllBtn.style.marginLeft = 'auto';
    toggleAllBtn.innerHTML = '<span id="gyik-toggle-label">Bezárás mind</span>';
    filterBar.appendChild(toggleAllBtn);

    let allOpen = false;
    toggleAllBtn.addEventListener('click', () => {
        allOpen = !allOpen;
        items.forEach((item) => {
            if (item.style.display === 'none') return;  // rejtett, kihagy
            if (allOpen) item.setAttribute('open', '');
            else item.removeAttribute('open');
        });
        document.getElementById('gyik-toggle-label').textContent =
            allOpen ? 'Bezárás mind' : 'Mindent megnyit';
    });

    /* ----- URL HASH ALAPÚ AUTO-OPEN ----- */
    // A user a #q12 anchor-re navigál → a 12-es kérdés kinyílik + görgetés hozzá.
    function openFromHash() {
        const hash = window.location.hash;
        if (!hash || !hash.startsWith('#q')) return;
        const idx = parseInt(hash.replace('#q', ''), 10);
        if (isNaN(idx)) return;

        // Először mutassuk az "all" szűrőt, hogy minden kérdés látszódjon.
        const allBtn = filterBar.querySelector('[data-cat="all"]');
        if (allBtn) allBtn.click();

        const target = items[idx - 1];
        if (target) {
            target.setAttribute('open', '');
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
})();
