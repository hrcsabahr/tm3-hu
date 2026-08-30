# tm3.hu — SEO és Linképítési Stratégia

**Verzió:** 2026-08-30 · **Cél:** a Tesla Model 3 magyar nyelvű keresési találatok között az első helyekre kerülni 6-12 hónap alatt.

---

## 1. JELENLEGI SEO ÁLLAPOT (Augusztus 2026)

### Ami már kész (commit `ccf27e0`):

✅ **On-page SEO:**
- Meta title + description minden oldalon (`seo-head.js` automatikus)
- Canonical URL-ek mindenhol
- Open Graph + Twitter Card meta tagek
- Heading hierarchia (1 db H1, H2-H3 szekciónként)
- Magyar nyelv (`lang="hu"`, `hreflang="hu"`)
- Reszponzív design (mobilbarát)
- HTTPS (Rackhost CDN)
- Világos, modern dizájn (#FAFAF7, #0A0A0A)

✅ **Strukturált adatok (schema.org):**
- `WebSite` + `SearchAction` (Google Sitelinks Search Box)
- `Organization` (logo, kapcsolat)
- `WebPage` (description, inLanguage, primaryImageOfPage)
- `BreadcrumbList` (Főoldal → Szekció)
- `Article` (főoldalon, headline + author + dateModified)
- `SoftwareApplication` (VIN dekóder, ingyenes)
- `FAQPage` (főoldalon + GYIK oldalon, 18+4 kérdéssel)
- `ItemList` (szervizek)
- Az `seo-head.js` automatikusan injektálja a WebSite + WebPage + Organization + BreadcrumbList + FAQPage schema-kat MINDEN oldalra

✅ **Technikai:**
- `sitemap.xml` (12 URL, weekly/monthly changefreq)
- `robots.txt` (Allow + Disallow + Sitemap direktíva)
- Service Worker (tm3-v12, network-first stratégia)
- PWA manifest
- Page speed: minimális CSS, nincs nehéz JS lib (kivéve chart.js, csak a degradation szekcióban)

### Ami még hiányzik:

� Google Search Console regisztráció (URL: https://search.google.com/search-console)
❌ Bing Webmaster Tools regisztráció (URL: https://www.bing.com/webmasters)
� Google Analytics 4 (vagy Plausible / Fathom privacy-friendly)
❌ Backlinkek (off-page SEO)
❌ Google Business Profile (ha van fizikai iroda)
❌ Schema: `HowTo`, `LocalBusiness` a szervizekhez, `Product`/`Offer` az esetleges ajánlatokhoz

---

## 2. KULCSSZÓ KUTATÁS (KET FŐ KATEGÓRIA)

### A) Pénzügyi szándék (high-intent, konverzióra kész)

| Kulcsszó | Havi keresés (HU, becsült) | Verseny | Jelenlegi helyezés |
|---|---|---|---|
| tesla model 3 ár | 1200-2000 | közepes | nincs indexelve |
| tesla model 3 vásárlás | 800-1500 | közepes | nincs indexelve |
| tesla model 3 tco | 400-700 | alacsony | remek esély #1-re |
| tesla model 3 szerviz | 500-900 | alacsony | remek esély #1-re |
| tesla szerviz budapest | 300-600 | alacsony | remek esély #1-re |
| tesla akkumulátor csere ár | 200-400 | alacsony | remek esély #1-re |
| tesla töltés otthon költség | 200-400 | alacsony | remek esély #1-re |
| tesla model 3 használt | 600-1000 | közepes | esély top 5-re |
| tesla vin dekóder | 100-300 | alacsony | remek esély #1-re |

### B) Információs szándék (top-of-funnel, forgalom)

| Kulcsszó | Havi keresés | Verseny |
|---|---|---|
| tesla model 3 hatótáv télen | 800-1500 | alacsony |
| tesla model 3 akkumulátor élettartam | 500-900 | alacsony |
| tesla model 3 töltési idő | 400-700 | alacsony |
| tesla model 3 megbízhatóság | 300-600 | alacsony |
| tesla model 3 vs bmw 330i | 200-500 | alacsony |
| mennyit fogyaszt a tesla model 3 | 200-500 | alacsony |
| tesla model 3 szerviz költség | 300-600 | alacsony |
| legjobb otthoni töltő tesla | 100-300 | alacsony |
| tesla supercharger magyarország | 300-600 | alacsony |
| villanyautó tco kalkulátor | 200-400 | alacsony |

### C) Long-tail (alacsony verseny, magas konverzió)

| Kulcsszó (long-tail) | Keresési szándék |
|---|---|
| "mennyibe kerül a tesla model 3 télen" | szezonális |
| "tesla model 3 degradation 10 év" | specifikus |
| "tesla model 3 12v akkumulátor csere ár" | tranzakciós |
| "tesla supercharger töltés mennyibe kerül" | tranzakciós |
| "legjobb független tesla szerviz" | lokális |
| "tesla model 3 lr vs performance 2026" | összehasonlító |
| "milyen gyakran kell tölteni a teslát" | alapvető |
| "használt tesla model 3 mire figyelj" | tranzakciós |
| "tesla model 3 gyerekülés" | specifikus |
| "tesla insurance magyarország" | biztosítás |

**Eszközök a kutatáshoz:**
- Google Search Console (ingyenes, a te saját adataid)
- Google Trends (https://trends.google.com)
- Ubersuggest (https://neilpatel.com/ubersuggest/) — 3 ingyenes keresés/nap
- Ahrefs / SEMrush — fizetős, de a magyar piacon kevésbé hasznos
- **Legjobb:** Google "Autocomplete" — gépelj be "tesla model 3" és nézd meg a felugró javaslatokat

---

## 3. ON-PAGE SEO TOVÁBBI FEJLESZTÉSEK

### 3.1 Hiányzó schema bővítések (technikai)

A `seo-head.js` automatikusan kezeli a FAQPage-t, de egyedi schema kellene:

**`pages/szervizek.html` — `LocalBusiness` (vagy `AutomotiveBusiness`) schema:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "name": "Tesla Service Budaörs",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kinizsi út 1-3",
    "addressLocality": "Budaörs",
    "postalCode": "2040",
    "addressCountry": "HU"
  },
  "telephone": "+36-23-555-123",
  "url": "https://tm3.hu/pages/szervizek.html#budaors",
  "priceRange": "$$$",
  "openingHoursSpecification": [...]
}
</script>
```

Ezt minden szervizre (10 db) külön be kellene szúrni. A Google a "tesla szerviz budapest" keresésre a LocalBusiness rich snippetet jeleníti meg (cím, telefonszám, értékelés, nyitvatartás).

### 3.2 Képek alt text javítása

Minden képnek alt textet kell adni. A jelenlegi SVG-knek van `aria-label` (ami screen reader-nek jó), de a Google a `<title>` elemet olvassa. Adjunk `<title>` tagot is:

```html
<svg ...>
  <title>Tesla Model 3 — magyar tudásbázis hero illusztráció</title>
  ...
</svg>
```

### 3.3 Belső linkek (internal linking)

Erősíteni kell a belső linkeket a kulcsfontosságú oldalak között:

- A `tco.html` legyen linkelve a `vasarlas.html`-ből ("Mielőtt vásárolsz, nézd meg a 10 éves TCO-t")
- A `kalkulator.html` legyen linkelve minden degradation említésnél
- A `szervizek.html` legyen linkelve minden "szerviz" említésnél
- A `gyik.html` legyen linkelve minden specifikus kérdésnél ("Gyakori kérdések a töltésről → GYIK #11")

### 3.4 Oldalbetöltési sebesség (PageSpeed)

Jelenlegi állapot:
- ✅ Minimális CSS (89 KB egyben, gzipelve ~15 KB)
- ✅ Nincs felesleges JS lib (chart.js csak a degradation chart-hoz)
- ✅ Lazy loading a képekre (egyelőre nincs kép, de ha lesz, használni kell)
- ❌ A Google Fonts CSS külső (https://fonts.googleapis.com) — preload-ölni kell
- ❌ A chart.js CDN-ről jön — érdemes self-hostolni

Javaslat: `font-display: swap` a Google Fonts URL-ben (már megvan: `display=swap`).

### 3.5 Mobile usability

- ✅ Reszponzív design
- ✅ Hamburger menü (1024px alatt)
- ✅ Touch target minimum 44x44 px
- ❌ A `padding-top` mobilon 64px-re van állítva, de a 768px alatti media query felülírja 10px-re (már javítva a `e0debec` commitban)

---

## 4. OFF-PAGE SEO: LINKÉPÍTÉSI STRATÉGIA

### 4.1 Magyar Tesla-témájú oldalak listája (ahol linket lehet szerezni)

#### A) Magas authority, nehéz outreach (Tier 1):
1. **Totalcar.hu** — legnagyobb magyar autós portál, 1M+ havi látogató
   - Kontakt: szerkesztoseg@totalcar.hu
   - Lehetőség: vendégcikk "Tesla Model 3 — 5 év magyarországi tapasztalatok"

2. **Hvg.hu / Portfolio.hu** — híroldalak, magas DR
   - Kontakt: szerkesztoseg@hvg.hu
   - Lehetőség: sajtóközlemény "tm3.hu elindult" + adat-alapú cikkek (árak, statisztikák)

3. **Index.hu** — legnagyobb magyar hírportál
   - Kontakt: szerkesztoseg@index.hu
   - Lehetőség: csak akkor, ha valami konkrét, figyelemfelkeltő hír van (pl. új Tesla-modell)

#### B) Közepes authority, könnyebb outreach (Tier 2):
4. **Villanyautósok.hu** — magyar villanyautós közösség
   - Kontakt: info@villanyautosok.hu
   - Lehetőség: fórumbejegyzés, vendégcikk, linkcsere

5. **E-cars.hu** — villanyautós hírportál
   - Kontakt: info@e-cars.hu

6. **Autó-Motor.hu** — hagyományos autós portál
   - Kontakt: szerkesztoseg@automotor.hu

7. **Hamisítatlan.hu** — fogyasztóvédelmi, tech
   - Kontakt: info@hamisitotlen.hu

#### C) Alacsony authority, könnyű link (Tier 3):
8. **Tesla Club Hungary Facebook csoport** (15 000+ tag)
   - Link: facebook.com/groups/teslaclubhungary
   - Lehetőség: megosztás, komment

9. **Reddit r/TeslaHungary** — ha létezik
10. **Tesla-tulajdonos.hu** (ha van)
11. **Garázs.blog.hu** — autós blog
12. **Járműipar.hu** — szakmai

#### D) Quora, Reddit, fórumok (Tier 4, nofollow linkek, de brand exposure):
- **Quora** — válaszolj Tesla Model 3 kérdésekre, linkelj a tm3.hu-ra
- **Reddit r/teslamotors** — válaszok, linkek (óvatosan, nem spammelni)
- **Reddit r/cars** — Tesla topic-k
- **Tesla Motors Club (teslamotorsclub.com)** — fórum, signature link

### 4.2 Vendégposzt lehetőségek

**Magyar villanyautós blogok**, ahol vendégcikket lehet írni:
- Villanyautósok.hu — "Vendégcikk" szekció
- E-cars.hu — beküldés
- Járműipar.hu — szakmai cikkek

**Vendégcikk ötletek:**
1. "Tesla Model 3 télen — valós hatótáv 850+ magyar tulajdonos mérése alapján"
2. "Mennyibe kerül valójában a Tesla Model 3 10 év alatt? TCO elemzés"
3. "Akkumulátor-degradáció: mit tanultunk 5 év és 150 000 km alatt"
4. "VIN dekóder: hogyan olvassuk ki a Tesla gyártási adatait a VIN-ből"
5. "Magyarországi Tesla töltőhálózat 2026-ban: teljes körkép"

### 4.3 Linkcsere lehetőségek

**Magyar villanyautós és autós oldalak**, akikkel linkcserét lehet ajánlani:
- **villanyautosok.hu** ↔ tm3.hu
- **e-cars.hu** ↔ tm3.hu
- **autopalyamatrica.hu** (kapcsolódó) ↔ tm3.hu
- **hybrid-autok.hu** (ha van) ↔ tm3.hu

### 4.4 Közösségi média linkek

**Magyar Tesla közösségek, ahol megosztható:**
- Facebook: Tesla Club Hungary (15 000+ tag), Villanyautósok Magyarország
- Reddit: r/TeslaHungary, r/teslamotors, r/electricvehicles
- Twitter/X: #Tesla hashtag, magyar Tesla-influencerek
- LinkedIn: Tesla-csoportok, villanyautós szakemberek
- Instagram: Tesla-tulajdonosok
- TikTok: rövid videók a degradation chart-ról, VIN dekóderről

**Megosztási terv:**
1. Indító poszt: "Elindult a tm3.hu — magyar Tesla Model 3 tudásbázis"
2. Heti 1 poszt: legújabb statisztika, frissítés, cikk
3. Havi 1 hír: új aloldal, új funkció
4. Negyedéves: "Év értékelő" poszt

---

## 5. OUTREACH E-MAIL SABLONOK

### 5.1 Sajtóközlemény (Tier 1 — Totalcar, HVG, Index)

```
Tárgy: [Sajtóközlemény] tm3.hu — Magyar Tesla Model 3 tudásbázis indult

Tisztelt Szerkesztőség!

A tm3.hu (https://tm3.hu) 2026 augusztusában indult, és célja, hogy a
magyar nyelvű Tesla Model 3 tulajdonosok számára átfogó, független
tudásbázist nyújtson. Az oldal különlegessége, hogy 850+ magyar
tulajdonos valós mérési adatait, a Tesla flottajelentéseket és a
P3 Charging ciklusteszteket dolgozza fel.

Főbb tartalmak:
- Akkumulátor-degradáció kalkulátor (NCA, NCM811, LFP kémia)
- VIN dekóder (ingyenes, online)
- TCO kalkulátor (10 éves teljes birtoklási költség)
- Magyarországi Tesla szervizek listája
- Magyar töltőhálózat térkép
- 18 kérdéses GYIK

Kérem, fontolják meg, hogy az alábbiak egyikéről cikket jelentetnek meg:

1. "Mennyibe kerül valójában egy Tesla Model 3 10 év alatt?" —
   exkluzív TCO adatok, amiket más magyar portál nem közölt.

2. "Akkumulátor-degradáció: mit mondanak a magyar Tesla-tulajdonosok
   850+ mérése alapján" — valós magyarországi adatok.

3. "Magyarországi Tesla-töltés 2026-ban: hol, mennyiért, hogyan?"

Az oldal teljesen ingyenes, reklámmentes, és a Tesla, Inc.-től
független. A tartalom CC BY-SA 4.0 licenc alatt nyílt forráskódú.

Háttéranyagok, képek, interjú-lehetőség:
- Web: https://tm3.hu
- Email: seo@tm3.hu
- GitHub: https://github.com/hrcsabahr/tm3-hu (teljes kód, nyílt)

Üdvözlettel,
[tm3.hu csapata]
```

### 5.2 Villanyautós portál (Tier 2 — Villanyautósok.hu, E-cars.hu)

```
Tárgy: Vendégcikk-ajánlat: Tesla Model 3 magyarországi tapasztalatok

Kedves [Szerkesztőség]!

A tm3.hu magyar Tesla Model 3 tudásbázis csapata vagyunk. Az oldal
2026-ban indult, és célja, hogy a magyar villanyautós közösségnek
független, valós adaton alapuló tartalmat nyújtson.

Szeretnénk vendégcikket írni az önök portáljára, amely az alábbi
témák egyikét dolgozná fel (az önök szerkesztősége választhat):

1. "Tesla Model 3 télen — valós hatótáv 850+ magyar tulajdonos
   mérése alapján" — részletes adatok,图表, valós úti beszámolók.

2. "Akkumulátor-degradáció 10 év alatt: mit tanultunk" —
   NCA vs LFP összehasonlítás, magyar klíma, tippek.

3. "Mennyibe kerül a Tesla Model 3 fenntartása 10 év alatt?"
   — TCO kalkulátorral, benzines autóval való összehasonlítás.

A cikk:
- 1500-2500 szó
- Eredeti, kizárólag az önök portáljára szól
- Magyar nyelvű, szakmailag pontos
- Képekkel, ábrákkal (jelenlegi oldalunkról is linkelhető)

Cserébe:
- 1 dofollow link a tm3.hu-ra a cikkben
- Megosztás a saját közösségi média felületeinken
- Hosszú távú együttműködés (cikk-sorozat)

Kérem, jelezzék, ha érdekli a lehetőség, és melyik témát preferálják.

Üdvözlettel,
[tm3.hu]
seo@tm3.hu
https://tm3.hu
```

### 5.3 Linkcsere ajánlat (Tier 3)

```
Tárgy: Linkcsere ajánlat — tm3.hu ↔ [partner domain]

Kedves [Webmester]!

A tm3.hu (https://tm3.hu) magyar Tesla Model 3 tudásbázis vagyunk,
amely 2026-ban indult és havonta [X ezer] látogatót ér el.

Szeretnénk linkcsere-együttműködést javasolni:

Ti linkeltek ránk: [megfelelő URL a ti oldalatokon, pl. "Kapcsolódó
oldalak" szekció]

Mi linkelünk ti reátok: [megfelelő hely a tm3.hu-n, pl. "Hasznos
linkek" vagy "Kapcsolódó oldalak" szekció a láblécben]

Előnyök:
- Mindkét oldal jobb helyezést ér el a Google-ben
- Releváns, organikus linkek (nem fizetett)
- Hosszú távú, kölcsönös előny

Kérem, jelezzék, ha nyitottak az együttműködésre, és javasoljanak
megfelelő URL-t a ti oldalatokon.

Üdvözlettel,
[tm3.hu]
seo@tm3.hu
```

### 5.4 Fórum / közösség (Tier 4 — Tesla Club Hungary Facebook)

```
Poszt szövege:

🚗 Elindult a tm3.hu — Magyar Tesla Model 3 tudásbázis!

Főbb funkciók:
� Akkumulátor-degradáció kalkulátor (NCA, NCM811, LFP)
🔍 VIN dekóder (ingyenes, online)
💰 TCO kalkulátor (10 éves teljes költség)
🔧 Magyar szervizek listája
⚡ Magyar töltőhálózat térkép
❓ 18 kérdéses GYIK

850+ magyar Tesla-tulajdonos valós mérési adatai alapján, független,
CC BY-SA 4.0 licenc alatt.

Kérlek, nézzétek meg és jelezzétek, ha van javaslatotok!
https://tm3.hu
```

---

## 6. GOOGLE SEARCH CONSOLE BEÁLLÍTÁS

### Lépésről lépésre:

1. **Regisztráció:** https://search.google.com/search-console
   - "Add Property" → "URL Prefix" → `https://tm3.hu`
   - Verifikáció: HTML tag (legegyszerűbb)

2. **HTML tag verifikáció:**
   - A Search Console ad egy `<meta>` tag-et
   - Illeszd be a `<head>`-be az `index.html`-ben:
     ```html
     <meta name="google-site-verification" content="N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4" />
     ```
   - **Megjegyzés:** ez már bent van az index.html-ben (`N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4`)

3. **Sitemap beküldése:**
   - Search Console → "Sitemaps" → `https://tm3.hu/sitemap.xml`
   - Submit → Várj 24-48 órát

4. **URL Inspection:**
   - "URL Inspection" → `https://tm3.hu/` → "Request Indexing"
   - Ismételd meg a fontos oldalakra:
     - `https://tm3.hu/pages/szervizek.html`
     - `https://tm3.hu/pages/tco.html`
     - `https://tm3.hu/pages/kalkulator.html`
     - `https://tm3.hu/pages/gyik.html`

5. **Monitorozás (2-4 hét után):**
   - "Performance" → keresési lekérdezések, átkattintási arány (CTR), átlagos helyezés
   - "Coverage" → indexelt vs. nem indexelt oldalak
   - "Enhancements" → Mobile Usability, Core Web Vitals

### Bing Webmaster Tools (opcionális, de érdemes):

1. https://www.bing.com/webmasters
2. "Add Site" → `https://tm3.hu`
3. Verifikáció: BingSiteAuth.xml feltöltése (CNAME vagy meta tag)
4. Sitemap beküldése: `https://tm3.hu/sitemap.xml`

---

## 7. TARTALOM NAPTÁR (12 HETES TERV)

### Augusztus (már kész):
- ✅ Főoldal redesign + Miért készült? bento + VIN dekóder CTA
- ✅ GYIK oldal 18 kérdéssel + FAQPage schema

### Szeptember (4 hét):
- **Hét 1:** Sajtóközlemény kiküldése (Totalcar, HVG, Villanyautósok, E-cars)
- **Hét 2:** Vendégcikk #1 beküldése (Villanyautósok.hu — "Tesla télen")
- **Hét 3:** Új aloldal: `pages/osszehasonlítás.html` (Tesla Model 3 vs BMW 330i vs BYD Seal)
  - Schema: `ItemList` + `Product` + `FAQPage`
- **Hét 4:** Közösségi média kampány indítása (Facebook, Reddit, Twitter)

### Október (4 hét):
- **Hét 5-6:** Vendégcikk #2 ("TCO 10 év")
- **Hét 7:** Új aloldal: `pages/szezon.html` (szezonális tippek — tél/nyár/ősz)
- **Hét 8:** Hírlevél indítása (havi 1, feliratkozóknak)

### November (4 hét):
- **Hét 9-10:** Vendégcikk #3 ("Akkumulátor-degradáció")
- **Hét 11:** Black Friday / akció cikk (ha van Tesla akció)
- **Hét 12:** Év végi összefoglaló cikk ("2026 legjobb Tesla-élményei Magyarországon")

---

## 8. MÉRŐSZÁMOK (KPI)

### Hónap 1-3:
- Google Search Console-ban 50+ kattintás organikus keresésből
- 10+ backlink a Tier 3-4 oldalakról
- 1-2 vendégcikk elfogadva
- Indexelt oldalak: 11/12 (minden page/* megjelenik)

### Hónap 4-6:
- 500+ organikus kattintás/hó
- 30+ backlink, közte 1-2 Tier 2 (villanyautós portál)
- 3+ kulcsszó a top 10-ben
- Domain Authority (ahrefs): 10+

### Hónap 7-12:
- 2000+ organikus kattintás/hó
- 100+ backlink
- 10+ kulcsszó a top 10-ben, 5+ a top 5-ben
- Domain Authority: 25+
- Havi 10000+ organikus munkamenet

---

## 9. LEGFONTOSABB AZONNALI LÉPÉSEK (1-2 HÉT)

1. **Google Search Console regisztráció** — 30 perc
2. **Sitemap beküldése** — 5 perc
3. **URL Inspection + Request Indexing** (12 URL-re) — 30 perc
4. **Bing Webmaster Tools regisztráció** — 15 perc
5. **Sajtóközlemény kiküldése 4 Tier 2 portálnak** — 2 óra
6. **Facebook poszt a Tesla Club Hungary-ban** — 15 perc
7. **Reddit poszt (r/teslamotors, r/electricvehicles)** — 30 perc
8. **Vendégcikk megírása a Villanyautósok.hu-nak** — 4 óra

**Összesen: 1 nap munka** → 6-12 hónap múlva 100+ backlink és top 10 helyezés a fő kulcsszavakra.

---

## 10. ESZKÖZÖK ÉS LINKEK

### Ingyenes SEO eszközök:
- **Google Search Console:** https://search.google.com/search-console
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **Google Trends:** https://trends.google.com
- **Google PageSpeed Insights:** https://pagespeed.web.dev/
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/
- **Ubersuggest:** https://neilpatel.com/ubersuggest/ (3 keresés/nap ingyen)

### Fizetős (opcionális):
- **Ahrefs:** backlink monitoring, kulcsszó kutatás ($99/hó)
- **SEMrush:** hasonló ($139/hó)
- **Majestic:** backlink index ($60/hó)

### Magyar-specifikus:
- **Hvg.hu szerkesztőségi guideline** (általános PR-tanácsok)
- **Sajtószoba.hu** — sajtóközlemények ingyenes terjesztése

---

**Készítette:** tm3.hu SEO-stratégia · 2026-08-30
**Utolsó frissítés:** commit `ccf27e0` (világos design)
