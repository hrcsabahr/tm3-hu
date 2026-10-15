/* ============================================================
   vasarlas.js — "Melyik modell illik hozzád?" tanácsadó
   pages/vasarlas.html. 4 kérdés → modell-ajánlás + hatótáv.
   Nincs szerver, tisztán kliensoldali. 2026-10.
   ============================================================ */
(function () {
    'use strict';

    function $(id) { return document.getElementById(id); }

    var kmEl = $('va-km'),
        utEl = $('va-ut'),
        holEl = $('va-hol'),
        tolEl = $('va-toltes');
    if (!kmEl || !utEl || !holEl || !tolEl) return;

    var MODELS = {
        rwd: {
            nev: 'Model 3 RWD (SR+) — LFP',
            nyar: '~350–420 km',
            tel: '~280–330 km',
            tol: '100% (nyugodtan)',
            ar: '~14,9 M Ft',
        },
        lr: {
            nev: 'Model 3 Long Range AWD',
            nyar: '~450–500 km',
            tel: '~330–380 km',
            tol: 'napi 80%',
            ar: '~19,2 M Ft',
        },
    };

    function napikm(km) {
        return {
            keves: '~25–30 km/nap',
            atlag: '~40–55 km/nap',
            sok: '~55–80 km/nap',
            nagysok: '80+ km/nap',
        }[km] || '';
    }

    function utLabel(ut) {
        return {
            varos: 'főleg város',
            vegyes: 'vegyes közlekedés',
            autopalya: 'sok autópálya',
        }[ut] || '';
    }

    function szamol() {
        var km = kmEl.value,
            ut = utEl.value,
            hol = holEl.value,
            tol = tolEl.value;

        var autopalya = (ut === 'autopalya');
        var nincsToltesVideken = (tol === 'nem' && hol !== 'nagyvaros');
        var sokKmNincsToltes = (tol === 'nem' && (km === 'sok' || km === 'nagysok'));

        var m, indok, tipp;

        if (autopalya || nincsToltesVideken || sokKmNincsToltes) {
            m = MODELS.lr;
            if (autopalya) {
                indok = 'Sok autópályán vezetsz — a nagyobb hatótáv kevesebb töltési megállót és nyugodtabb utazást jelent.';
            } else if (nincsToltesVideken) {
                indok = (hol === 'videk' ? 'Vidéken laksz' : 'Kisvárosban laksz') +
                    ', és nincs otthoni töltésed — ilyenkor a nagyobb hatótáv sokat ér, mert ritkábban kell töltőt keresned.';
            } else {
                indok = 'Sokat vezetsz, és nincs otthoni töltésed — a nagyobb hatótávval ritkábban kell nyilvános töltőn állnod.';
            }
            tipp = 'Napi szinten 80%-ig töltsd, 100%-ra csak hosszú út előtt. Ha a gyorsulás is fontos, a Performance ugyanez a kategória — de drágább a gumija.';
        } else {
            m = MODELS.rwd;
            indok = 'A te profilodhoz (' + utLabel(ut) + ', ' + napikm(km) + ') az RWD (LFP) a legjobb ár-érték: olcsóbb, és naponta nyugodtan tölthető 100%-ra.';
            tipp = 'LFP akkuja van, ezért naponta 100%-ra töltheted — hetente egyszer mindenképp töltsd teljesre, hogy a töltöttség-kijelzés pontos maradjon.';
        }

        $('va-eredmeny').textContent = m.nev;
        $('va-indok').textContent = indok;
        $('va-napi').textContent = napikm(km);
        $('va-nyar').textContent = m.nyar;
        $('va-tel').textContent = m.tel;
        $('va-toltes-ajanlas').textContent = m.tol;
        $('va-ar').textContent = m.ar;
        $('va-tipp').innerHTML = '<strong>💡 Tipp:</strong> ' + tipp;
        $('va-reszletek').style.display = '';
        $('va-tipp').style.display = '';
    }

    [kmEl, utEl, holEl, tolEl].forEach(function (el) {
        el.addEventListener('change', szamol);
    });
    szamol();
})();
