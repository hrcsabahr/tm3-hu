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
            title: 'Tesla Model 3 – Magyar Tudásbázis (2026) | tm3.hu',
            description: 'Akkumulátor degradation, töltési ciklusok, VIN dekóder, valós Tesla Model 3 adatok egy helyen — magyar közösségi tudásbázis.',
            h1: 'Tesla Model 3 — magyar tudásbázis',
            type: 'website',
            section: 'Főoldal',
        },
        '/pages/szervizek.html': {
            title: 'Tesla szervizek Magyarországon (2024) · tm3.hu',
            description: 'Magyarországi Tesla-szervizek listája: hivatalos Budaörs, független specialisták Budapesten és vidéken. Árak, nyitvatartás, szolgáltatások.',
            h1: 'Magyarországi Tesla-szervizek',
            type: 'article',
            section: 'Szervizek',
            faq: [
                    { q: 'Mennyibe kerül egy Tesla Model 3 szerviz Magyarországon?', a: 'A hivatalos Tesla-szerviz Budaörsön órabér alapú, jellemzően 25 000-45 000 Ft + alkatrész. A független specialisták 15 000-25 000 Ft-os óradíjjal dolgoznak. Egyszerűbb műveletek (12V akkumulátor, klítafeltöltés) 30-80 000 Ft, nagyobb javítások (felfüggesztés, MCU) 200 000-600 000 Ft.' },
                    { q: 'Hivatalos Tesla-szerviz van-e Budapesten kívül?', a: 'A Tesla hivatalos szervize jelenleg Budaörsön működik. Országosan több független, Tesla-re specializálódott szerviz is elérhető (Debrecen, Szeged, Pécs, Győr), amelyek szoftveres diagnosztikát, alkatrészbeszerzést és javítást is vállalnak.' },
                    { q: 'Érvényes a Tesla garancia független szervizben?', a: 'A gyári garancia (4 év / 80 000 km) csak a hivatalos Tesla-szervizben végzett munkáknál marad érvényben. Független szerviz használata a jótállás elvesztésével járhat. Az Extended Service Agreement (ESA) kiterjesztett garancia megvásárolható.' },
                    { q: 'Milyen gyakran kell vinni a Tesla Model 3-at szervizbe?', a: 'A Tesla Model 3 karbantartása ritka: évente 1 alkalom, jellemzően 20 000 km-enként. Fékfolyadék-csere 2 évente, klímafertőtlenítés évente, gumi forgatás 10 000 km-enként ajánlott. Az akkumulátor és motor nem igényel rutin karbantartást.' },
                ],
        },
        '/pages/tobberek.html': {
            title: 'Magyarországi Tesla töltő térkép — Supercharger · tm3.hu',
            description: 'Interaktív magyar töltőhálózat térkép — Tesla Supercharger, Mobiliti, E.ON, Shell Recharge, Volteum. Árak és teljesítmény adatok.',
            h1: 'Magyarországi töltők térképen',
            type: 'article',
            section: 'Töltők',
            faq: [
                    { q: 'Mennyibe kerül egy Tesla Supercharger töltés Magyarországon?', a: 'A Tesla Supercharger ára lokációtól és napszaktól függően 89-129 Ft/kWh. Átlagos Tesla Model 3 (60 kWh akku) 0-80%-ra töltése nagyjából 4 500-7 000 Ft, ami 400-500 km hatótávot ad. Villámtöltés (V3, 250 kW) a Model 3 LR és Performance modelleken érhető el.' },
                    { q: 'Hány Tesla Supercharger van Magyarországon?', a: '2026-ban 8 Tesla Supercharger állomás működik Magyarországon: Budaörs, Budapest (3 telephely), Szeged, Győr, Balatonfüred, Debrecen, Székesfehérvár. A teljes hazai töltőhálózat (Tesla + más szolgáltatók) 50+ lokációból áll, Mobiliti, E.ON, Shell Recharge és Volteum üzemeltetésében.' },
                    { q: 'Tölthetek-e nem-Tesla autóval Supercharger-t?', a: 'Igen, a Tesla 2022-től megnyitotta a Magic Dock (CCS adapter) Supercharger-állomásokat nem-Tesla elektromos autók előtt is. A Tesla mobilapplikációban aktiválható a használat, és a töltés ára megegyezik a Tesla-ügyfelekével (esetenként 10-20%-kal magasabb).' },
                    { q: 'Melyik a leggyorsabb töltő Magyarországon?', a: 'A Tesla V3 Supercharger (Budaörs, Budapest) 250 kW csúcsteljesítményt ad, ami a Model 3 LR és Performance modellek esetén 5-25 perc alatt 10-80%-ra tölt. Az E.ON és Shell HPC (High Power Charger) állomások 150-300 kW teljesítményűek, hasonló töltési idővel.' },
                ],
        },
        '/pages/kalkulator.html': {
            title: 'Tesla Model 3 akkumulátor degradation kalkulátor · tm3.hu',
            description: 'Számold ki a Tesla Model 3 akkumulátor-degradationját évek, kilométer és töltési ciklusok alapján. NCA, NCM811, LFP cellák összehasonlítása.',
            h1: 'Degradation kalkulátor',
            type: 'article',
            section: 'Kalkulátor',
            faq: [
                    { q: 'Mennyi a Tesla Model 3 akkumulátor degradation 10 év után?', a: 'A Tesla Model 3 NCA (Long Range, Performance) akkumulátor 10 év / 150 000 km után 85-88%-os kapacitáson van. Az LFP (Standard Range+) cellák lassabban degradálódnak: 94% feletti 10 év után. A ciklusszám alapján 4000 teljes ciklus után a Performance még 90% felett teljesít.' },
                    { q: 'Milyen tényezők gyorsítják a degradation?', a: 'A degradation fő gyorsítói: rendszeres DC villámtöltés (Supercharger), magas SoC (90% felett) tartós tárolása, szélsőséges hőmérséklet (tartós -20°C alatt vagy 40°C felett), magas C-ráta (gyorshajtás), és a ritka töltési ciklusok (az akkumulátor szereti a rendszeres, közepes töltéseket).' },
                    { q: 'Mit jelent a State of Health (SoH)?', a: 'Az SoH (State of Health) az akkumulátor aktuális kapacitásának százalékos aránya az eredeti, gyári kapacitáshoz képest. Például egy 75 kWh-os új akku 5 év után 68 kWh-os valós kapacitású, ami 91% SoH-nak felel meg. 70% SoH alatt a Tesla saját szervize akkumulátor-cserét javasolhat.' },
                    { q: 'Mikor érdemes akkumulátort cserélni a Tesla Model 3-ban?', a: 'Akkumulátor-csere akkor indokolt, ha a SoH 70% alá esik, vagy ha a napi hatótáv a használati igények alá csökken. A Tesla Model 3 akkumulátor-modul csere ára Magyarországon 2,5-6 millió Ft (modulmérettől függően). A cserélt modul általában 90%+ SoH-val rendelkezik, és 2-4 évvel meghosszabbítja az autó élettartamát.' },
                ],
        },
        '/pages/tco.html': {
            title: 'Tesla Model 3 TCO kalkulátor — villanyautó vs benzines · tm3.hu',
            description: 'Tesla Model 3 10 éves TCO — villanyautó vs benzines (BMW 330i). Üzemanyagárak, áramárak, szervizköltségek Magyarországon.',
            h1: '10 éves teljes birtoklási költség',
            type: 'article',
            section: 'TCO',
            faq: [
                    { q: 'Megéri-e Tesla Model 3-at venni benzineshez képest 10 évre?', a: 'A 2026-os magyar árakkal számolva igen: egy Model 3 LR 10 év alatt 3-5 millió Ft-tal olcsóbb, mint egy hasonló BMW 330i. A villanyautó előnye az alacsonyabb üzemanyagköltség (15-20 Ft/km vs 50-60 Ft/km), a kisebb szervizigény (nincs olajcsere, vezérműszíj), és az alacsonyabb értékvesztés.' },
                    { q: 'Mennyi az áramköltsége egy Tesla Model 3-nak 100 km-en?', a: 'Otthoni töltéssel (40 Ft/kWh) 100 km-re 600-900 Ft áramköltség. Supercharger-rel (110 Ft/kWh átlag) 1 800-2 500 Ft/100 km. Vegyes használat (60% otthon + 40% Supercharger) esetén az átlag 1 200-1 600 Ft/100 km, ami a benzines autó 4 000-5 000 Ft/100 km költségének negyede.' },
                    { q: 'Milyen biztosítási költséggel kell számolni egy Tesla Model 3-ra?', a: 'A Tesla Model 3 kötelező biztosítása évi 60 000-110 000 Ft, a casco évi 180 000-350 000 Ft (10%-os önrész, márkától függően). A biztosítási díj magasabb, mint egy hasonló kategóriájú benzines autóé, de a kár-előzmények és a vezetési profil kedvezményt adhatnak.' },
                    { q: 'Mennyit veszít az értékéből a Tesla Model 3 5 év alatt?', a: 'Egy átlagos Tesla Model 3 LR 5 év / 100 000 km után az új ár 45-55%-át tartja meg (2026-os adatok alapján). Ez jobb, mint a hasonló prémium benzines szedánok átlaga (35-45%). Az LFP akkumulátoros SR+ modellek értékállósága kiemelkedő: 5 év után 60-65%.' },
                ],
        },
        '/pages/hibak.html': {
            title: 'Tipikus Tesla Model 3 hibák és javítási költségek · tm3.hu',
            description: 'Tesla Model 3 meghibásodások, visszahívások, 12V akkumulátor, ajtókilincs, futómű — javítási költségekkel és garanciával.',
            h1: 'Tipikus Model 3 hibák és javítási költségek',
            type: 'article',
            section: 'Hibák',
            faq: [
                    { q: 'Milyen tipikus hibák fordulnak elő a Tesla Model 3-ban?', a: 'A leggyakoribb Tesla Model 3 hibák: ajtókilincs meghibásodása (80 000-150 000 Ft), 12V akkumulátor csere (50 000-90 000 Ft, 2-4 évente), MCU (Media Control Unit) meghibásodás (150 000-300 000 Ft), klíma kompresszor hiba (200 000-350 000 Ft), felfüggesztési kopások (60 000-180 000 Ft).' },
                    { q: 'Mikor kell cserélni a 12V akkumulátort a Tesla Model 3-ban?', a: 'A Tesla Model 3 12V akkumulátor (lítium-ion) élettartama 3-5 év, ritkábban 6 év. Cserére utaló jelek: alacsony feszültség figyelmeztetések, indítási nehézségek, random szoftverhibák, bizonytalan érintőképernyő működés. A csere egyszerű, kb. 30 perc, 50 000-90 000 Ft.' },
                    { q: 'Milyen gyári visszahívások voltak a Tesla Model 3-ra?', a: 'A legfontosabb visszahívások: 2022-es fékpedál modul, 2023-as hátsó lámpák firmware frissítése, 2024-es elülső csomagtartó-zár. A legtöbb visszahívás OTA (over-the-air) szoftverfrissítéssel megoldható, fizikai szervizbejárást nem igényel.' },
                    { q: 'Mennyibe kerül egy ajtókilincs csere a Tesla Model 3-ban?', a: 'Egy Tesla Model 3 ajtókilincs csere munkadíjjal együtt 80 000-150 000 Ft. Az alkatrész ára kb. 35 000-60 000 Ft, a beszerelés 1-2 óra. Gyakori hiba, főleg régebbi (2017-2020) modelleken, de a 2021+ modellekben ritkábbá vált a kialakítás javítása miatt.' },
                ],
        },
        '/pages/fogyasztas.html': {
            title: 'Tesla Model 3 valós fogyasztási adatbázis · tm3.hu',
            description: 'Tesla Model 3 valós fogyasztási adatbázis — autópálya, városi, téli/nyári mérések. Hogyan hat a hatótávra a stílus, hőmérséklet, klíma?',
            h1: 'Valós fogyasztási adatbázis',
            type: 'article',
            section: 'Fogyasztás',
            faq: [
                    { q: 'Mennyi a Tesla Model 3 valós fogyasztása autópályán?', a: 'A Tesla Model 3 Long Range valós autópálya-fogyasztása 130 km/h-s sebességnél 16-19 kWh/100 km. Ez 380-450 km valós hatótávnak felel meg. A Performance modell valamivel magasabb, 18-21 kWh/100 km. A Standard Range+ (LFP) 17-20 kWh/100 km.' },
                    { q: 'Mennyire csökken a hatótáv télen?', a: 'A Tesla Model 3 télen, -10°C külső hőmérsékleten 25-40%-kal kisebb hatótávval számolhat, mint nyáron. Fő okok: kabin-fűtés energiaigénye (3-5 kW), hideg akkumulátor (csökkent belső ellenállás), nagyobb gördülési ellenállás. A LR modell télen 300-350 km, nyáron 500-550 km valós hatótáv.' },
                    { q: 'Hogyan csökkenthető a Tesla Model 3 fogyasztása?', a: 'Tippek: 1) Vezess 100-110 km/h-nál autópályán (a 130 km/h 25-30%-kal többet fogyaszt). 2) Használj Eco módot városban. 3) Fűtsd az ülést és a kormányt, ne a teljes kabint (3-5 kW vs 1-2 kW). 4) Tartsd a gumiabroncsokat 2.9 bar-on. 5) Elő-temperálás Supercharger előtt.' },
                    { q: 'Mennyi a Tesla Model 3 városi fogyasztása?', a: 'A Tesla Model 3 városi fogyasztása (30-50 km/h, regeneratív fékezéssel) 12-15 kWh/100 km. Ez 450-550 km valós hatótávnak felel meg egy LR modellnél. A városi vezetés a villanyautó legoptimálisabb használati módja a fékezési energia-visszanyerés miatt.' },
                ],
        },
        '/pages/vasarlas.html': {
            title: 'Tesla Model 3 vásárlási útmutató — új vs használt (2026) · tm3.hu',
            description: 'Tesla Model 3 vásárlási útmutató magyar piacra — új és használt autók, garanciális feltételek, finanszírozás, biztosítás, értékvesztés.',
            h1: 'Tesla Model 3 vásárlási útmutató',
            type: 'article',
            section: 'Vásárlás',
            faq: [
                    { q: 'Mennyit érdemes fizetni egy használt Tesla Model 3-ért 2026-ban?', a: '2026-ban egy 3 éves (2023-as), 60 000 km-es Tesla Model 3 LR nagyjából 14-17 millió Ft, ami az új ár (kb. 22 millió Ft) 65-75%-a. SR+ modellek 12-14 millió Ft körül mozognak. Az ár erősen függ az akkumulátor SoH-tól, a felszereltségtől (FSD, Premium Connectivity) és a szerviz-előzményektől.' },
                    { q: 'Új vagy használt Tesla Model 3-at érdemes venni?', a: 'Új vásárlás előnye: teljes gyári garancia (4 év / 80 000 km), FSD szoftver-csomag olcsóbb, pontosan ismert akkumulátor SoH. Használt előnye: 20-35%-kal alacsonyabb ár, akár már elvégzett szoftver-frissítések, azonnal elérhető. 2026-ban a használt Model 3 LR jobban megéri, ha a SoH 90%+.' },
                    { q: 'Mire figyeljünk használt Tesla Model 3 vásárláskor?', a: 'Ellenőrizd: 1) Akkumulátor SoH (diagnosztikai app, pl. TeslaFi vagy Scan My Tesla). 2) Gumiabroncs állapota (4 db új Michelin PS4 = 200-300 ezer Ft). 3) Felfüggesztés kopása (fék, lengéscsillapító). 4) MCU működés (sárgás foltok, fagyás). 5) Szerviz-előzmények (hivatalos Tesla app). 6) Baleseti előzmények.' },
                    { q: 'Milyen dokumentumok kellenek Tesla Model 3 vásárlásához?', a: 'Magánszemély vásárlásnál: személyi igazolvány, lakcímkártya, adóigazolvány. Céges vásárlásnál: cégkivonat, aláírási címpéldány, meghatalmazás. A finanszírozáshoz jövedelemigazolás, bankszámlakivonat. Az átírás Okmányirodában történik, az új rendszám kiadása 5-10 munkanap.' },
                ],
        },
        '/pages/blog.html': {
            title: 'Tesla hírek Magyarország — blog és szoftverfrissítések · tm3.hu',
            description: 'Tesla hírek Magyarországról: szoftverfrissítések, Supercharger újdonságok, Model 3/Y/S/X változások.',
            h1: 'Tesla Magyarország hírek',
            type: 'article',
            section: 'Blog',
            faq: [
                    { q: 'Milyen szoftverfrissítéseket kap a Tesla Model 3 2026-ban?', a: 'A Tesla 2026-ban negyedévente ad ki nagyobb szoftverfrissítéseket. A Model 3 tulajdonosok 2026 első felében várható frissítések: továbbfejlesztett Autopilot vizuális visszajelzés, új alkalmazás-indító, jobb akkumulátor-előmelegítés, Apple Music CarPlay integráció, valamint a Smart Summon továbbfejlesztése.' },
                    { q: 'Mikor nyílik új Tesla Supercharger Magyarországon?', a: '2026-ban várható új Supercharger-állomások: Pécs, Miskolc, Veszprém, Nyíregyháza és a Budapest Liszt Ferenc repülőtér. A Tesla célja, hogy minden magyar autópálya-csomóponthoz (M1, M3, M5, M7) 10 Supercharger-állomás legyen 2027 végéig.' },
                    { q: 'Milyen hírek vannak a Tesla Model 3 2026-os frissítéséről (Highland 2)?', a: 'A 2026-os Model 3 frissítés (Highland 2) várható újításai: hosszabb hatótáv (LR: 600+ km WLTP), 50 kW-os V2L (Vehicle-to-Load) külső áramkimenet, továbbfejlesztett HW5 Autopilot számítógép, adaptív futómű, valamint az új Cybertruck-stílusú légterelők.' },
                    { q: 'Hogyan lehet csatlakozni a magyar Tesla-közösséghez?', a: 'A magyar Tesla-közösség legnagyobb platformjai: a Tesla Club Hungary Facebook csoport (15 000+ tag), a Reddit r/TeslaHungary, valamint a Discord szerverek és a helyi meetup-ok. A tm3.hu oldalon is elérhető egy közösségi fórum, ahol kérdéseket lehet feltenni és tapasztalatokat megosztani.' },
                ],
        },
        '/pages/kozosseg.html': {
            title: 'Magyar Tesla Model 3 közösség — fórum és meetup · tm3.hu',
            description: 'Tesla Model 3 magyar tulajdonosi közösség: fórum, kérdezz-felelek, kommentek, meetup-ok, Discord, GitHub Discussions.',
            h1: 'Magyar Tesla Model 3 közösség',
            type: 'article',
            section: 'Közösség',
            faq: [
                    { q: 'Hogyan csatlakozhatok a magyar Tesla-közösséghez?', a: 'Több aktív platformon is csatlakozhatsz: a Tesla Club Hungary Facebook csoport (15 000+ tag), a Discord szerverek, a Reddit r/TeslaHungary, valamint a helyi meetup-ok Budapesten, Debrecenben, Szegeden és Pécsen. A tm3.hu oldalon is van egy belső fórum, ahol kérdéseket lehet feltenni.' },
                    { q: 'Vannak-e Tesla-találkozók (meetup-ok) Magyarországon?', a: 'Igen, 2026-ban havi 2-3 alkalommal szerveznek Tesla-találkozókat országszerte: Budapest (Hősök tere, Normafa), Balatonfüred (nyári szezon), Debrecen, Szeged, Győr, Pécs. A meetup-okon általában 20-80 autó vesz részt, és a közösség nyitott minden Tesla-tulajdonos és érdeklődő előtt.' },
                    { q: 'Milyen tapasztalatokat osztanak meg egymással a magyar Tesla-tulajdonosok?', a: 'Tipikus témák: akkumulátor-degradation hosszú távú mérések, töltési tippek és trükkök, szerviz-tapasztalatok (hivatalos és független), hosszú utak (route planning, Supercharger-élmény), szoftverfrissítések first-impression, hideg időjárási tapasztalatok, és a FSD (Full Self-Driving) funkciók tesztelése.' },
                    { q: 'Segítséget kaphatok-e a Tesla Model 3 vásárláshoz a közösségben?', a: 'Igen, a magyar Tesla-közösség egyik legértékesebb funkciója a vásárlási tanácsadás. Tagok segítenek használt Tesla Model 3 vásárlás előtt (SoH-ellenőrzés, kilométer-ellenőrzés, szerviz-történet), ajánlanak szervizeket, és megosztják a tapasztalataikat a különböző modellekkel (SR+, LR, Performance) kapcsolatban.' },
                ],
        },
        '/pages/jogi.html': {
            title: 'Jogi tudnivalók — impresszum, adatvédelem, cookie (2026) · tm3.hu',
            description: 'Impresszum, adatvédelmi tájékoztató, cookie-k használata, felelősségkizárás — a tm3.hu oldal üzemeltetői információi.',
            h1: 'Jogi tudnivalók',
            type: 'article',
            section: 'Jogi',
            faq: [
                    { q: 'A tm3.hu hivatalos Tesla-partner?', a: 'Nem. A tm3.hu egy független, közösségi Tesla Model 3 tudásbázis, amely nem áll kapcsolatban a Tesla Inc.-vel, és nem jogosult hivatalos Tesla-szerviz szolgáltatások nyújtására. Az oldalon közölt információk tájékoztató jellegűek, nem minősülnek szakmai tanácsadásnak.' },
                    { q: 'Tárol-e a tm3.hu személyes adatokat?', a: 'A tm3.hu csak a böngésző localStorage-jában tárol felhasználói adatokat (fogyasztási bejegyzések, TCO-számítások), amelyek kizárólag a te eszközödön maradnak, és soha nem kerülnek továbbításra. Az oldal nem használ cookie-kat, és nem végez cross-site tracking-et.' },
                    { q: 'Használhatom-e a tm3.hu tartalmát saját weboldalamon?', a: 'A tm3.hu szöveges tartalma Creative Commons CC BY-SA 4.0 licenc alatt érhető el: szabadon felhasználható a forrás (tm3.hu) feltüntetésével. A kód és a dizájn MIT licenc alatt áll, ami kereskedelmi felhasználást is engedélyez a szerző (tm3.hu) feltüntetésével.' },
                    { q: 'Hogyan jelenthetek be hibát vagy helytelen információt a tm3.hu-n?', a: 'Hibabejelentést a tm3.hu GitHub Discussions felületén tehetsz (https://github.com/tm3-hu/tm3-hu.github.io/discussions), vagy e-mailben a hello@tm3.hu címen. A bejelentéseket 1-3 munkanapon belül feldolgozzuk, és szükség esetén javítjuk a tartalmat.' },
                ],
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
        // WebSite + WebPage + Organization + BreadcrumbList (+ optional FAQPage)
        const graph = [
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
        ];

        // Opcionális FAQPage - ha a PAGES bejegyzés tartalmaz 'faq' mezőt
        if (Array.isArray(page.faq) && page.faq.length > 0) {
            graph.push({
                '@type': 'FAQPage',
                '@id': `${SITE.url}${basePath}#faq`,
                mainEntity: page.faq.map((q) => ({
                    '@type': 'Question',
                    name: q.q,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: q.a,
                    },
                })),
            });
        }

        const ld = { '@context': 'https://schema.org', '@graph': graph };

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
