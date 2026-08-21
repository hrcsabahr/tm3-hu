# tm3.hu — Magyar Tesla Model 3 tudásbázis

Teljesen statikus, adatbázis nélküli weboldal. Minden adat JSON fájlokban, minden felhasználói
adat a böngésző localStorage-ban. Ingyenesen hosztolható (Cloudflare Pages, GitHub Pages, Netlify).

## Struktúra

```
/
├── index.html              # Főoldal (Tesla-stílusú modern dark theme)
├── CNAME                   # tm3.hu domain beállítás (GitHub Pages-hez)
├── robots.txt
├── sitemap.xml
├── manifest.json           # PWA manifest
├── README.md
├── styles.css              # Tesla.com-grade stílus rendszer
├── script.js               # Főoldali Chart.js degradation chart + reveal
├── data/                   # JSON adatbázisok
│   ├── szervizek.json      # Magyar Tesla-szervizek
│   ├── tobberek.json       # Supercharger + minden hálózat
│   ├── hibak.json          # Tipikus Model 3 hibák
│   └── blog.json           # Hírek
├── assets/
│   ├── css/
│   │   ├── design-system.css   # Design tokens (színek, spacing, animációk)
│   │   └── _legacy.css         # Page-specific stílusok
│   ├── js/
│   │   ├── site.js         # Nav + footer render + scroll reveal
│   │   └── util.js         # toast, store, formatters
│   ├── img/
│   │   ├── icon.svg
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── (leaflet, chart.js kívülről CDN-ről)
└── pages/                  # Belső oldalak
    ├── szervizek.html
    ├── tobberek.html
    ├── kalkulator.html
    ├── tco.html
    ├── hibak.html
    ├── fogyasztas.html
    ├── vasarlas.html
    ├── blog.html
    └── kozosseg.html       # Giscus integrációval
```

## Funkciók

1. **Szerviz kereső** — 10 magyarországi szerviz, szűrés város/típus/szolgáltatás/értékelés szerint,
   kiemelt "ajánlott" prémium csomag.
2. **Töltő térkép** — Leaflet + OpenStreetMap, 12 magyarországi töltőpont (Supercharger,
   Mobiliti, E.ON, Shell, Volteum), popup ablakokkal.
3. **Degradation kalkulátor** — Évjárat, km, SoC, DC arány, klíma alapján becsüli a
   kapacitás%-ot és összehasonlítja egy cohort-tal.
4. **10 éves TCO kalkulátor** — Éves km, áramár, biztosítás, szerviz → teljes költség,
   benzines referenciával.
5. **Fogyasztás adatbázis** — localStorage alapú user CRUD, statisztikák, JSON export.
6. **Tipikus hibák** — 8 kategória, tünetek/ok/javítás/szerviz/ár HUF-ban és EUR-ban.
7. **Vásárlási útmutató** — 7 lépéses interaktív checklist új és használt vásárláshoz.
8. **Hírek/Blog** — JSON-ből töltött kártyák, modal-ban olvasható cikkek, hírlevél feliratkozás.
9. **Közösség** — Giscus integráció (GitHub Discussions alapú kommentek).

## Design rendszer

A Tesla.com-ihlette modern dark theme a `assets/css/design-system.css` fájlban van definiálva:

- **Színek**: `--color-bg: #000`, `--color-accent: #0a84ff` (Tesla kék)
- **Tipográfia**: Inter (300-800), Tabular numerals a stat kijelzőkön
- **Spacing**: Bőséges whitespace, `clamp(72px, 10vw, 128px)` szekciók
- **Animációk**: `IntersectionObserver` scroll reveal, smooth hover, reduced-motion support
- **Responsive**: Mobile-first, 900px / 720px / 420px breakpointok
- **Accessibility**: `prefers-reduced-motion`, focus-visible, ARIA label-ek

## PWA támogatás

- `manifest.json` — teljes PWA manifest, magyar nyelv, Tesla-kék theme
- Custom shortcut-ok: Degradation, Töltők, Szervizek
- Ikonok: 192x192 és 512x512 (maskable)

## Deploy

### GitHub Pages (ajánlott, ingyenes)

1. **Hozz létre egy új GitHub repot** a `tm3-hu` organization alatt (vagy a saját userneved alatt):
   - Repo neve: `tm3-hu.github.io` (user/org site) VAGY `tm3-hu` (project site)
   - Visibility: **Public**
2. **Push-old a kódot**:
   ```bash
   cd tesla-model3
   git init
   git add .
   git commit -m "feat: tm3.hu initial release"
   git branch -M main
   git remote add origin https://github.com/tm3-hu/tm3-hu.github.io.git
   git push -u origin main
   ```
3. **GitHub Pages bekapcsolása**:
   - Repo → Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: `main`, folder: `/ (root)`
   - Custom domain: `tm3.hu`
   - Enforce HTTPS: ✅ (5-15 perc múlva aktív)
4. **DNS beállítás** a domain regisztrátornál (GoDaddy, Cloudflare, stb.):
   - A `tm3.hu` rekord: A – 185.199.108.153 (GitHub Pages IP)
   - A `www.tm3.hu` rekord: CNAME – `tm3-hu.github.io`
5. **Várj 5-15 percet**, amíg a HTTPS tanúsítvány elkészül.

### Cloudflare Pages alternatíva

1. Cloudflare Dashboard → Pages → Create a project → Connect to Git
2. Build settings: Framework = None, Build command = (üres), Output dir = `/`
3. Custom domain: `tm3.hu` hozzáadása → Cloudflare automatikusan beállítja a DNS-t

### Netlify

Drag-and-drop a `tesla-model3` mappát a https://app.netlify.com/drop-ra.
Custom domain: `tm3.hu` hozzáadása → DNS beállítás a regisztrátornál.

## Giscus (közösségi kommentek) beállítása

1. Hozz létre egy GitHub repot (pl. `tm3-hu/tm3-hu.github.io`).
2. Settings → Features → enable Discussions.
3. Telepítsd a [giscus.app](https://giscus.app/hu) alkalmazást.
4. A giscus.app generál egy script tag-et — másold be a `data-repo-id` és
   `data-category-id` értékeket a `pages/kozosseg.html` fájlba.

## Lokális fejlesztés

```bash
cd tesla-model3
python -m http.server 8765
# Böngészőben: http://127.0.0.1:8765/
```

## Böngésző támogatás

Minden modern böngésző (Chrome, Firefox, Safari, Edge) — Internet Explorer NEM támogatott.
Mobil reszponzív (breakpoint: 900px, 720px, 420px).

## SEO

- `sitemap.xml` — 9 URL, frissítve heti/havi gyakorisággal
- `robots.txt` — Allow: / + sitemap referencia
- OpenGraph meta tagek minden oldalon
- `og:title`, `og:description`, `og:type`, `og:url` (ahol releváns)
- Magyar nyelv (`<html lang="hu">`)

## Licence

A tartalom (szövegek, adatok) CC BY-SA 4.0.
A kód MIT.
