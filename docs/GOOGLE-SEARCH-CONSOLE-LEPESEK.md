# Google Search Console + Sitemap + Request Indexing
## Lépésről lépésre, 30 + 5 + 30 perc

**Verzió:** 2026-08-30 · **Cél:** a tm3.hu-t a Google indexébe juttatni 1 óra alatt.

---

## Előfeltételek (1 perc)

- ✅ A `N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4` meta tag **már bent van** az `index.html` `<head>` blokkjában (commit `ccf27e0`, 2026-08-30).
- ✅ A `sitemap.xml` **már fent van** a `https://tm3.hu/sitemap.xml` címen (12 URL, heti/havi frissítés).
- ✅ A `robots.txt` már `Allow: /` és tartalmazza a `Sitemap: https://tm3.hu/sitemap.xml` direktívát.
- ✅ A Google Fonts és Chart.js CDN-ek működnek (külső erőforrások, a Google crawler eléri).
- ❌ Kell: Google fiók (Gmail). Ha nincs, csinálj egyet a `seo@tm3.hu` címre (a domain saját, így professzionális).

---

## 1. LÉPÉS: GOOGLE SEARCH CONSOLE REGISZTRÁCIÓ (30 perc)

### 1.1 Belépés (1 perc)

1. Nyisd meg: **https://search.google.com/search-console**
2. Kattints a **"Start now"** gombra
3. Jelentkezz be a Google fiókoddal (ajánlott: `seo@tm3.hu` ha be van állítva)
4. Ha elfogadod a Terms of Service-t, pipáld be és **Accept**

### 1.2 Property hozzáadása (2 perc)

1. A bal felső sarokban van egy **"Add property"** (vagy "Select property" ha már van) legördülő
2. Válaszd a **"URL Prefix"** opciót (ne a "Domain" opciót, mert az DNS-verifikációt kér, ami bonyolultabb)
3. Írd be: `https://tm3.hu` (pontosan így, https-sel, trailing slash NÉLKÜL)
4. Kattints a **"Continue"** gombra

### 1.3 Verifikáció HTML tag-gel (5 perc)

1. A Google felajánl több verifikációs módot:
   - HTML file (feltöltöd a fájlt a webtárhelyre)
   - **HTML tag** ← EZT VÁLASZD
   - Domain name provider (DNS)
   - Google Analytics
   - Google Tag Manager
2. Kattints a **"HTML tag"** fülre
3. Látni fogsz egy ilyen meta tag-et:
   ```html
   <meta name="google-site-verification" content="abc123XYZ..." />
   ```
4. **FONTOS:** A tm3.hu-nál a verifikációs tag **MÁR BENT VAN**, és a tartalma:
   ```
   N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4
   ```
5. A Google Search Console-ban:
   - Válaszd az **"HTML tag"** opciót
   - Kattints a **"Verify"** gombra
   - A Google lekéri a `https://tm3.hu/` oldalt, megnézi a meta tag-et, és ha megvan, **"Ownership confirmed"** zöld pipát mutat

### 1.4 Ha a verifikáció nem sikerül (hibaelhárítás, 5 perc)

Ha a Google azt mondja, hogy "Verification failed":

1. **Böngészőben nyisd meg:** `https://tm3.hu/` → View Source (Ctrl+U) → Keresd meg: `google-site-verification`
2. Ha **megtalálod** a meta taget, de a Google mégsem találja:
   - Várj 5-10 percet (a Google cache frissítése)
   - Kattints a **"Verify"** gombra újra
3. Ha **nem találod** a meta taget:
   - A `index.html` 12. sorában kell lennie: `<meta name="google-site-verification" content="N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4" />`
   - Ha a GitHub Pages (`hrcsabahr.github.io`) frissítve van, de a Rackhost (`tm3.hu`) még nem, akkor a `tm3.hu` cache-ből a régi CSS-t tölti. Adj neki 5-15 percet.
4. Ha **minden rendben** van, de a Google továbbra sem találja:
   - A Search Console-ban a **"Verify"** gombra kattintva a Google 30 másodpercet vár, majd újrapróbálkozik
   - Ha többszöri próba után sem megy, használd a **DNS verifikációt** (Google Search Console-ban váltsd át a verifikációs módot, és a Rackhost DNS-ben adj hozzá egy TXT rekordot)

### 1.5 Sikeres verifikáció után (1 perc)

Ha zöld pipa, a tm3.hu property megjelenik a Search Console bal oldali menüjében. Minden további funkció (Performance, Coverage, Enhancements, URL Inspection) elérhető.

---

## 2. LÉPÉS: SITEMAP BEKÜLDÉSE (5 perc)

### 2.1 Sitemaps menüpont (1 perc)

1. A bal oldali menüben görgetve keresd meg a **"Sitemaps"** opciót (az "Index" szekció alatt)
2. Kattints rá

### 2.2 Új sitemap hozzáadása (2 perc)

1. Az oldal tetején van egy **"Add a new sitemap"** beviteli mező
2. A legördülőben válaszd a **"https://tm3.hu"**-t (vagy írd be manuálisan a domain prefixet)
3. A szöveges mezőbe írd: **`sitemap.xml`** (vagy `https://tm3.hu/sitemap.xml`)
4. Kattints a **"Submit"** gombra

### 2.3 Várakozás és ellenőrzés (2 perc)

1. A Submit után a Google megjeleníti a sitemap státuszát:
   - **"Success"** (zöld) — a Google elfogadta
   - **"Couldn't fetch"** (sárga) — a Google nem tudja elérni (CDN cache, várj 5-10 percet)
   - **"Has errors"** (piros) — XML hiba
2. Kattints a sitemap sorára a részletekért:
   - **"Discovered URLs"** — hány URL-t talált a Google a sitemap-ben (12-nek kell lennie)
   - **"Last read"** — mikor olvasta utoljára
3. 24-48 óra múlva ellenőrizd újra — ekkorra a Google feldolgozza és megkezdi az URL-ek feltérképezését

### 2.4 Opcionális: extra sitemapek

Ha később bővíted az oldalt (pl. új aloldal), frissítsd a `sitemap.xml`-t, és küldd be újra a Search Console-ba. A Google minden alkalommal újra feldolgozza.

---

## 3. LÉPÉS: URL INSPECTION + REQUEST INDEXING (30 perc)

### 3.1 Mi ez?

A Google csak akkor indexeli az oldalakat, ha:
1. A Googlebot felfedezte (a sitemap-ből vagy más linkről)
2. Az oldal "indexelhető" (nincs `noindex`, nincs blokkolva a `robots.txt`-ben)
3. Az oldal mobilon is működik (Mobile Usability)

A **Request Indexing** kényszeríti a Googlebot-ot, hogy **azonnal** feltérképezze az adott URL-t (nem kell napokat/heteket várni).

### 3.2 Első URL: a főoldal (5 perc)

1. A Search Console tetején van egy **"URL Inspection"** keresőmező (vagy a bal menüben "URL Inspection")
2. Írd be: **`https://tm3.hu/`**
3. Nyomj Entert
4. A Google ellenőrzi az URL-t:
   - **"URL is on Google"** (zöld) — már indexelve van
   - **"URL is on Google, but has issues"** (sárga) — indexelve, de problémák
   - **"URL is not on Google"** (sárga) — még nincs indexelve
5. Ha nincs indexelve, kattints a **"Request Indexing"** gombra
6. A Google megjeleníti: **"Indexing requested"** (kék) — a kérés elment
7. Várj néhány másodpercet, majd kattints a **"URL is on Google"** linkre — ha minden rendben, most már zöld

### 3.3 Többi fontos URL — egymás után (25 perc, 2 perc/URL)

Az alábbi 11 URL-t ismételd meg egyenként (minden URL-re: beírod → Enter → Request Indexing):

**Tier 1 — legfontosabb, pénzügyi szándék:**
1. `https://tm3.hu/pages/szervizek.html`
2. `https://tm3.hu/pages/tco.html`
3. `https://tm3.hu/pages/kalkulator.html`
4. `https://tm3.hu/pages/vasarlas.html`
5. `https://tm3.hu/pages/gyik.html`

**Tier 2 — fontos kiegészítő:**
6. `https://tm3.hu/pages/hibak.html`
7. `https://tm3.hu/pages/tobberek.html`
8. `https://tm3.hu/pages/fogyasztas.html`
9. `https://tm3.hu/pages/blog.html`

**Tier 3 — kiegészítő:**
10. `https://tm3.hu/pages/kozosseg.html`
11. `https://tm3.hu/pages/jogi.html`

### 3.4 Mit jelent a "Request Indexing" státusz?

A Google minden URL-re 3 lehetséges választ ad:

| Státusz | Mit jelent | Teendő |
|---|---|---|
| **"URL is on Google"** | A Google már indexelte | Kész, lépj a következőre |
| **"URL is not on Google"** | Nincs indexelve | Kattints "Request Indexing" |
| **"Crawled, currently blocked"** | A Google már feltérképezte, de valami blokkolja | Nézd meg a "Coverage" szekciót a részletekért |
| **"Redirected"** | Átirányítás van | Ellenőrizd, hogy a végső URL jó helyre mutat |
| **"Alternate page with proper canonical tag"** | Van kanonikus URL, de nem ez az elsődleges | OK, lépj tovább |

### 3.5 Request Indexing limit (FONTOS!)

A Google **napi 10-12 URL Request Indexing**-et engedélyez **URL-prefix property**-nként. Ha 12 URL-t akarsz indexelni, akkor:

- **1. nap:** Főoldal + 9 legfontosabb URL
- **2. nap:** A maradék 2 URL

Vagy használd a sitemap.xml-t a maradék URL-ekhez — a Google azokat is feldolgozza, csak lassabban (1-2 hét).

### 3.6 Időkeret

A Request Indexing **NEM** azonnali indexelést jelent. A Google:
- 1-3 nap múlva **feltérképezi** (crawl) az oldalt
- 3-7 nap múlva **indexeli** (felveszi az adatbázisába)
- 1-4 hét múlva megjelenik a keresési találatokban (SERP)

Ez normális. A Google nem ígér gyorsaságot.

---

## 4. ELLENŐRZÉS 24-48 ÓRA MÚLVA (5 perc)

### 4.1 URL Inspection újra

1. Nyisd meg a Search Console-t
2. Menj a **"URL Inspection"** → `https://tm3.hu/`
3. Ha **"URL is on Google"** (zöld) — kész, sikeres
4. Ha még mindig **"URL is not on Google"**:
   - Kattints a **"Coverage"** menüpontra a bal oldalon
   - Nézd meg, van-e hibaüzenet (pl. "Blocked by robots.txt", "Crawl allowed? No")
   - Ha hiba van, javítsd a `robots.txt`-ben vagy a HTML-ben

### 4.2 Coverage menüpont

1. Bal menü → **"Index" → "Coverage"**
2. 4 kategória:
   - **"Excluded"** — a Google kihagyta valamiért
   - **"Valid"** — indexelve (jó!)
   - **"Warning"** — van figyelmeztetés
   - **"Error"** — hiba
3. Az első nap általában minden "Pending" vagy "Excluded" státuszban van — ez normális, várj 3-7 napot

### 4.3 Sitemaps menüpont

1. Bal menü → **"Sitemaps"**
2. Ellenőrizd:
   - **"Discovered URLs"**: 12 (minden page URL a sitemap-ben)
   - **"Last read"**: friss (24 órán belül)
   - Ha "Couldn't read" — a CDN cache miatt van, várj

---

## 5. PERFORMANCE MONITOROZÁS (hetente 5 perc)

### 5.1 Első valós adatok: 3-7 nap múlva

A Google Search Console **Performance** szekciója 3-7 nap múlva mutat valós adatokat:

1. Bal menü → **"Performance" → "Search results"**
2. Látható:
   - **Total clicks** — hányszor kattintottak a tm3.hu-ra a Google találatokból
   - **Total impressions** — hányszor jelent meg a tm3.hu a találatok között
   - **Average CTR** — átkattintási arány (%)
   - **Average position** — átlagos helyezés a kulcsszavakra

### 5.2 Mit nézz az első héten?

- **Top queries** — mely kulcsszavakra jelenik meg az oldal?
- **Top pages** — mely URL-ek kapják a legtöbb kattintást?
- **Countries** — Magyarország a legnagyobb? (100%-nak kell lennie, ha magyar nyelvű)
- **Devices** — mobil vs. desktop

### 5.3 Első hónap céljai

| Metrika | 1. hónap cél | Megjegyzés |
|---|---|---|
| Impressions | 500+ | Megjelenés a Google-ben |
| Clicks | 20-50 | Kattintások a tm3.hu-ra |
| Avg. CTR | 3-5% | Tipikus új domain |
| Avg. Position | 30-50 | Lassan javul |

---

## 6. SPECIÁLIS BEÁLLÍTÁSOK (opcionális, 10 perc)

### 6.1 Target Country

1. **Settings** (fogaskerék ikon) → **"International Targeting"**
2. **"Target users in:"** → `Hungary`
3. **"Hreflang:"** ha multi-language → `hu` (magyar)
4. Save

### 6.2 Crawl Rate

1. **Settings** → **"Crawl rate"**
2. Alapértelmezetten a Google saját döntése — **NE MÓDOSÍTSD**, mert lassabb indexeléshez vezethet

### 6.3 Disavow Tool (káros backlinkek)

Ha később kapsz spam backlinkeket:
1. **"Links" → "Disavow links"**
2. Töltsd fel a `.txt` fájlt a spam domain-ekkel

---

## 7. HIBAELHÁRÍTÁS — GYIK

### "A Google nem találja a verification meta tag-et"

1. Ellenőrizd: `https://tm3.hu/` → Ctrl+U → keresd: `google-site-verification`
2. Ha a GitHub Pages frissítve van (`hrcsabahr.github.io/tm3-hu/`) de a `tm3.hu` nem, akkor a Rackhost CDN cache-eli a régit. Várj 5-15 percet, vagy a Rackhost adminban kényszerítsd a cache törlést.
3. Ha a meta tag tényleg hiányzik, ellenőrizd az `index.html` 12. sorát.

### "A sitemap 'Couldn't fetch' státuszban van"

1. Ellenőrizd böngészőben: `https://tm3.hu/sitemap.xml` — betöltődik?
2. Ha 404-et ad, a `sitemap.xml` nincs fent a Rackhost-on (csak a GitHub Pages-en). Töltsd fel FTP-n vagy a Rackhost fájlkezelőben.
3. Ha betöltődik, de a Google nem találja, várj 5-10 percet (cache).

### "Az URL Inspection 'Crawled, currently blocked'-ot mutat"

1. A Google feltérképezte, de valami blokkolja az indexelést.
2. Ellenőrizd a `robots.txt`-t: `https://tm3.hu/robots.txt` → biztosan `Allow: /`
3. Ellenőrizd az oldal forrását: nincs `<meta name="robots" content="noindex">` ?
4. Ha minden rendben, kattints a **"Request Indexing"** újra 24 óra múlva.

### "A Performance szekció üres 1 hét után"

1. Ellenőrizd, hogy a tm3.hu **publikus** (nem jelszóval védett)
2. A Google nem indexel `noindex` oldalakat
3. Lehet, hogy túl kevés a backlink — a Google "felfedezési" problémája
4. Várj 2-4 hetet — a Google először feltérképez, aztán indexel, aztán megjelenít

### "Rankings nagyon alacsonyak (50+ helyezés)"

Ez normális az első 1-3 hónapban. A SEO lassú folyamat:
- **0-3 hónap**: indexelés + első megjelenések
- **3-6 hónap**: top 30-ba kerülés a fő kulcsszavakra
- **6-12 hónap**: top 10-be kerülés
- **12+ hónap**: top 3-5 stabil helyezés

A türelem és a folyamatos tartalomgyártás a kulcs.

---

## ÖSSZEFOGLALÓ — MIT CSINÁLTÁL, MIKOR LESZ EREDMÉNYE

| Lépés | Idő | Eredmény |
|---|---|---|
| 1. Regisztráció | 30 perc | Google tud a tm3.hu-ról |
| 2. Sitemap beküldés | 5 perc | Google tudja, milyen oldalak vannak |
| 3. URL Inspection × 12 | 30 perc | Google 1-3 napon belül feltérképezi |
| **Összesen** | **1 óra** | **1-2 héten belül megjelennek a Google találatokban** |

### Utána (hetente):
- Performance monitorozás (5 perc)
- Új oldalak sitemap-be vétele (5 perc)
- Search Console hibák javítása (10-30 perc, ha van)

### 6 hónap múlva:
- 500-2000 organikus kattintás/hó
- 30+ backlink
- 5-10 kulcsszó a top 20-ban
- Domain Authority: 15-25

---

**Készítette:** tm3.hu · 2026-08-30 · commit `6f8ac88`
