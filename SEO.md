# SEO és Google Search Console — tm3.hu

Utolsó frissítés: 2026-08-29.

## Google Search Console verifikáció (kettős: meta tag + DNS TXT)

A `tm3.hu` domain Google Search Console-ban két független módon van verifikálva:

### 1. HTML meta tag (URL-prefix property) — MÁR KÉSZ, a kódban

Minden nyilvános HTML oldal `<head>` szekciójában (a viewport meta után) szerepel:

```html
<meta name="google-site-verification" content="N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4" />
```

**Lefedett oldalak** (11 db):
- `index.html`
- `pages/blog.html`
- `pages/fogyasztas.html`
- `pages/hibak.html`
- `pages/jogi.html`
- `pages/kalkulator.html`
- `pages/kozosseg.html`
- `pages/szervizek.html`
- `pages/tco.html`
- `pages/tobberek.html`
- `pages/vasarlas.html`

A Google Search Console-ban hozzáadandó property: **URL-prefix** `https://tm3.hu/` —
verifikációs módszer: **HTML tag**. 5 percen belül validálható.

### 2. DNS TXT rekord (Domain property) — a Rackhost DNS-zónában kell felvenni

A domain property (`tm3.hu` — minden aldomainre kiterjed) verifikálásához a
**Rackhost DNS-zónájában** TXT rekordot kell elhelyezni a `tm3.hu` apex-en:

| Mező (Hostname / Name) | Típus | Érték / Value | TTL |
|---|---|---|---|
| `tm3.hu` (vagy `@`, vagy üres) | TXT | `google-site-verification=N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4` | 300 (5 perc) — propagáció idejére, utána 3600 |

**Megjegyzés:** a TXT rekordot a `tm3.hu` **apex**-re kell tenni, nem `www.tm3.hu` alá.
A Rackhost DNS-kezelőjében a "Hostname" / "Host" mező általában `@` vagy üres az apex-re.

#### Rackhost DNS-zóna szerkesztés lépései

1. Lépj be a https://www.rackhost.hu/ ügyfélkapuba.
2. Domainek → `tm3.hu` → DNS kezelés (vagy "DNS zóna szerkesztése").
3. Új rekord hozzáadása:
   - **Típus:** `TXT`
   - **Név / Host:** `@` (vagy üres, vagy `tm3.hu` — szolgáltatófüggő)
   - **Érték / Value:** `google-site-verification=N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4`
   - **TTL:** `300` (5 perc) a propagáció gyorsításához; sikeres verifikáció után visszaállítható `3600`-ra.
4. Mentsd a rekordot.
5. **Propagáció ellenőrzése** (lásd lent).
6. Google Search Console → Property hozzáadása → Domain → `tm3.hu` → TXT rekord
   módszer → "Verify".

#### Propagáció ellenőrzése

A `tools/check-google-verification.ps1` PowerShell script futtatja a Google
(`8.8.8.8`) és Cloudflare (`1.1.1.1`) authoritative DNS szerverein a TXT lekérdezést.

Vagy manuálisan (bármely online DNS-tool is jó, pl. https://dnschecker.org ):

```bash
# Google Public DNS
nslookup -type=TXT tm3.hu 8.8.8.8

# Cloudflare
nslookup -type=TXT tm3.hu 1.1.1.1
```

A válaszban a `google-site-verification=N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4`
sort kell látni. A propagáció tipikusan **5–30 perc**, de a Google akár **48 órát**
is várhat.

## Sitemap és robots.txt

- **Sitemap:** `https://tm3.hu/sitemap.xml` — 9 URL (index + 8 belső oldal).
  Google Search Console → Sitemap menü → `sitemap.xml` beküldése.
- **Robots.txt:** `https://tm3.hu/robots.txt` — `Allow: /`, sitemap hivatkozással.
  A legacy `_idx.html`, `service-worker.js` és a backup fájlok `Disallow:`-olva.

## Egyéb SEO asset-ek (már élők)

- `manifest.json` — PWA manifest, magyar nyelv, Tesla-kék theme.
- OpenGraph meta tagek (`og:title`, `og:description`, `og:image`, `og:url`) minden oldalon.
- Twitter Card meta tagek (`twitter:card=summary_large_image`).
- `<html lang="hu">` minden oldalon.
- JSON-LD structured data: `WebSite`, `Organization`, `ItemList`, `FAQPage`,
  `BreadcrumbList` sémák a `seo-head.js`-ben + extra blokk az `index.html`-ben.
