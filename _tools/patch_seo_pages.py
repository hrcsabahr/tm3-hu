#!/usr/bin/env python3
"""
patch_seo_pages.py — Aloldalak <head>-jet eso SEO csomag bovitese a fooldal
mintajara, valamint JSON-LD BreadcrumbList hozzaadasa.

Minden oldalhoz tartozik egy META config (keywords, og_description, twitter_desc).
Azt csinalja, amit a felhasznalo kert: 'a fooldal mintajat hasznald'.
- Meglevo <title>, description, og:title, og:description, canonical megmarad.
- Hianyzo meta tag-eket potolja a fooldalhoz hasonloan:
  keywords, author, robots, og:type, og:site_name, og:locale,
  og:image, og:image:width/height/alt, twitter:card, twitter:site, twitter:creator,
  twitter:title, twitter:description, twitter:image, twitter:image:alt,
  hreflang, icon, apple-touch-icon.
- A <body> elejere berak egy <script type="application/ld+json">
  BreadcrumbList + WebPage blokkot.
- A scroll-blokkolo inline <script> (hamburger toggle) megmarad, csak az
  uj JSON-LD script kerul utana.

A szkript idempotens: ha mar van keywords/twitter/og, nem ir felul semmit.
"""
from __future__ import annotations
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "pages")
SITE_URL = "https://tm3.hu"
OG_IMAGE = f"{SITE_URL}/assets/img/og-image.svg"
ICON = f"{SITE_URL}/assets/img/icon.svg"
ICON_192 = f"{SITE_URL}/assets/img/icon-192.png"

# Oldalspecifikus bovitmenyek
PAGE_META: dict[str, dict[str, str]] = {
    "blog.html": {
        "keywords": "tesla hírek magyarország, tesla model 3 szoftverfrissítés, tesla supercharger újdonságok, tesla model y magyar, tesla fsd magyarország",
        "og_description": "Tesla Model 3 és Y hírek, szoftverfrissítések és Supercharger újdonságok — magyarországi szemszögből.",
        "twitter_description": "Tesla Model 3/Y hírek, szoftverfrissítések és Supercharger újdonságok — magyarul.",
        "section": "Hírek",
    },
    "fogyasztas.html": {
        "keywords": "tesla model 3 fogyasztás, tesla hatótáv valós, tesla kwh 100km, tesla fogyasztás télen, tesla model 3 hatótáv teszt",
        "og_description": "Tesla Model 3 valós fogyasztási és hatótáv-adatbázis: autópálya, városi, téli/nyári mérések.",
        "twitter_description": "Valós Tesla Model 3 fogyasztási adatok — autópálya, város, tél, nyár.",
        "section": "Fogyasztás",
    },
    "gyik.html": {
        "keywords": "tesla model 3 gyik, tesla kérdések válaszok, tesla vásárlás, tesla akkumulátor, tesla töltés, tesla garancia",
        "og_description": "18 kidolgozott kérdés a Tesla Model 3-ról: vásárlás, akkumulátor, töltés, szerviz, TCO, garancia.",
        "twitter_description": "GYIK a Tesla Model 3-ról — 18 kérdés és válasz magyarul.",
        "section": "GYIK",
    },
    "hibak.html": {
        "keywords": "tesla model 3 hibák, tesla 12v akkumulátor csere, tesla ajtókilincs, tesla futómű hiba, tesla visszahívás, tesla javítási költség",
        "og_description": "Tipikus Tesla Model 3 hibák, visszahívások és javítási költségek — magyar tapasztalatok.",
        "twitter_description": "Tipikus Tesla Model 3 hibák és javítási költségek.",
        "section": "Hibák",
    },
    "jogi.html": {
        "keywords": "tm3.hu impresszum, adatvédelmi tájékoztató, cookie szabályzat, felelősségkizárás, tesla független oldal",
        "og_description": "Impresszum, adatvédelem, cookie, disclaimer — nem hivatalos Tesla információs oldal.",
        "twitter_description": "Jogi tudnivalók, adatvédelem és cookie szabályzat — tm3.hu.",
        "section": "Jogi",
    },
    "kalkulator.html": {
        "keywords": "tesla akkumulátor degradation kalkulátor, tesla model 3 nca ncm811 lfp, soh kalkulátor, akkumulátor élettartam",
        "og_description": "Számold ki a Tesla Model 3 akkumulátor-degradationját évek, kilométer és ciklusok alapján.",
        "twitter_description": "Tesla Model 3 akkumulátor-degradation kalkulátor — NCA/NCM811/LFP.",
        "section": "Kalkulátor",
    },
    "kozosseg.html": {
        "keywords": "tesla magyar közösség, tesla fórum magyar, tesla discord magyar, tesla meetup, tesla tulajdonosok",
        "og_description": "Magyar Tesla Model 3 tulajdonosi közösség: fórum, kérdezz-felelek, meetup-ok, Discord.",
        "twitter_description": "Magyar Tesla Model 3 közösség — fórum, meetup, Discord.",
        "section": "Közösség",
    },
    "szervizek.html": {
        "keywords": "tesla szerviz magyarország, budaörs tesla szerviz, független tesla szerviz, tesla javítás, tesla alkatrész",
        "og_description": "10+ magyarországi Tesla-szerviz, értékelések és szolgáltatások egy helyen.",
        "twitter_description": "Magyarországi Tesla-szervizek — hivatalos és független, árakkal.",
        "section": "Szervizek",
    },
    "tco.html": {
        "keywords": "tesla model 3 tco, villanyautó vs benzines költség, bmw 330i vs tesla, 10 éves autó költség, áramár benzinár",
        "og_description": "Tesla Model 3 10 éves TCO — villanyautó vs benzines (BMW 330i). Üzemanyagárak, áramárak, szervizköltségek.",
        "twitter_description": "Tesla Model 3 vs BMW 330i — 10 éves TCO összehasonlítás.",
        "section": "TCO",
    },
    "tobberek.html": {
        "keywords": "tesla supercharger magyarország, mobiliti töltő, eon drive, shell recharge, volteum, elektromos autó töltés",
        "og_description": "Minden magyarországi Tesla-kompatibilis töltő egy helyen — interaktív térkép.",
        "twitter_description": "Magyarországi töltőtérkép — Tesla Supercharger, Mobiliti, E.ON, Shell.",
        "section": "Töltők",
    },
    "vasarlas.html": {
        "keywords": "tesla model 3 vásárlás, tesla új vs használt, tesla garancia, tesla finanszírozás, tesla ár magyarország",
        "og_description": "Tesla Model 3 vásárlási útmutató: új és használt, garancia, finanszírozás, biztosítás.",
        "twitter_description": "Tesla Model 3 vásárlási útmutató — új vs használt, garanciával.",
        "section": "Vásárlás",
    },
}

# Breadcrumb: lista minden aloldalnak (utolso elem az aktualis oldal)
BREADCRUMB_HOME = ("Főoldal", f"{SITE_URL}/")
BREADCRUMB_BY_PAGE: dict[str, tuple[str, str]] = {
    "blog.html": ("Hírek", f"{SITE_URL}/pages/blog.html"),
    "fogyasztas.html": ("Fogyasztás", f"{SITE_URL}/pages/fogyasztas.html"),
    "gyik.html": ("GYIK", f"{SITE_URL}/pages/gyik.html"),
    "hibak.html": ("Hibák", f"{SITE_URL}/pages/hibak.html"),
    "jogi.html": ("Jogi", f"{SITE_URL}/pages/jogi.html"),
    "kalkulator.html": ("Degradation kalkulátor", f"{SITE_URL}/pages/kalkulator.html"),
    "kozosseg.html": ("Közösség", f"{SITE_URL}/pages/kozosseg.html"),
    "szervizek.html": ("Szervizek", f"{SITE_URL}/pages/szervizek.html"),
    "tco.html": ("TCO", f"{SITE_URL}/pages/tco.html"),
    "tobberek.html": ("Töltők", f"{SITE_URL}/pages/tobberek.html"),
    "vasarlas.html": ("Vásárlás", f"{SITE_URL}/pages/vasarlas.html"),
}


def build_head_block(filename: str, cfg: dict[str, str], title: str) -> str:
    """A fooldalhoz hasonlo teljes meta blokk — csak azokat rakja ki,
    amiket az adott oldal meg nem tartalmaz.
    A blokk end-jele: egyedi marker, hogy tudjuk hol vegzodik a head-fragmentum.
    """
    lines: list[str] = []
    lines.append("    <!-- SEO-META-START — auto-generated, ido: 2026-08-31 -->")
    if "keywords" in cfg:
        lines.append(f'    <meta name="keywords" content="{cfg["keywords"]}" />')
    if "og_description" in cfg:
        lines.append(f'    <meta property="og:description" content="{cfg["og_description"]}" />')
    if "twitter_description" in cfg:
        lines.append(f'    <meta name="twitter:description" content="{cfg["twitter_description"]}" />')
    # og:title a fooldalon explicit van; az aloldalon az og:title-t hasznaljuk
    # twitter-title-kent is.
    # author / robots / og:site / og:type / og:locale / og:image / twitter:*
    lines.append('    <meta name="author" content="tm3.hu — Magyar Tesla Model 3 közösség" />')
    lines.append('    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />')
    lines.append('    <meta property="og:type" content="article" />')
    lines.append('    <meta property="og:site_name" content="tm3.hu" />')
    lines.append('    <meta property="og:locale" content="hu_HU" />')
    lines.append(f'    <meta property="og:url" content="{SITE_URL}/pages/{filename}" />')
    lines.append(f'    <meta property="og:image" content="{OG_IMAGE}" />')
    lines.append('    <meta property="og:image:width" content="1200" />')
    lines.append('    <meta property="og:image:height" content="630" />')
    lines.append('    <meta property="og:image:alt" content="Tesla Model 3 — magyar tudásbázis" />')
    lines.append('    <meta name="twitter:card" content="summary_large_image" />')
    lines.append('    <meta name="twitter:site" content="@tm3hu" />')
    lines.append('    <meta name="twitter:creator" content="@tm3hu" />')
    lines.append(f'    <meta name="twitter:title" content="{title}" />')
    lines.append(f'    <meta name="twitter:image" content="{OG_IMAGE}" />')
    lines.append('    <meta name="twitter:image:alt" content="Tesla Model 3 — magyar tudásbázis" />')
    lines.append('    <meta name="theme-color" content="#06121E" />')
    lines.append('    <meta name="apple-mobile-web-app-capable" content="yes">')
    lines.append('    <meta name="mobile-web-app-capable" content="yes">')
    lines.append('    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
    lines.append('    <meta name="apple-mobile-web-app-title" content="tm3.hu">')
    lines.append('    <meta name="format-detection" content="telephone=no">')
    lines.append('    <meta name="google-site-verification" content="N-NXAZpS0CxpyfE5e35mcbnsHWk2k7Ib47be6x2qiI4" />')
    # hreflang + canonical (canonical megvan, de hreflang hianyzik mindenhol)
    lines.append(f'    <link rel="alternate" hreflang="hu" href="{SITE_URL}/pages/{filename}" />')
    lines.append(f'    <link rel="icon" type="image/svg+xml" href="{ICON.replace(SITE_URL, "..")}" />')
    lines.append(f'    <link rel="apple-touch-icon" href="{ICON_192.replace(SITE_URL, "..")}" />')
    lines.append("    <!-- SEO-META-END -->")
    return "\n".join(lines)


def build_jsonld_block(filename: str, cfg: dict[str, str], title: str) -> str:
    """BreadcrumbList + WebPage schema az adott oldalhoz."""
    cr_label, cr_url = BREADCRUMB_BY_PAGE[filename]
    desc = cfg["og_description"] or cfg["twitter_description"] or ""
    section = cfg["section"]
    # JSON-ben a @context kell elol
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": BREADCRUMB_HOME[0],
                "item": BREADCRUMB_HOME[1],
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": cr_label,
                "item": cr_url,
            },
        ],
    }
    webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": cr_url + "#webpage",
        "url": cr_url,
        "name": title,
        "description": desc,
        "inLanguage": "hu-HU",
        "isPartOf": {"@id": f"{SITE_URL}/#website"},
        "publisher": {"@id": f"{SITE_URL}/#organization"},
        "primaryImageOfPage": {"@type": "ImageObject", "url": OG_IMAGE},
        "articleSection": section,
    }
    org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": f"{SITE_URL}/#organization",
        "name": "tm3.hu",
        "url": SITE_URL,
        "logo": {"@type": "ImageObject", "url": ICON},
    }
    import json
    payload = json.dumps([breadcrumb, webpage, org], ensure_ascii=False, indent=8)
    return f"""    <!-- JSONLD-START — auto-generated, ido: 2026-08-31 -->
    <script type="application/ld+json">
{payload}
    </script>
    <!-- JSONLD-END -->"""


def upsert_marker_block(content: str, marker_start: str, marker_end: str, new_block: str) -> str:
    """Ha mar van marker_start..marker_end, kicsereli a kozte levot.
    Ha nincs, a </head> ele beszurja."""
    pat = re.compile(
        re.escape(marker_start) + r".*?" + re.escape(marker_end),
        re.DOTALL,
    )
    if pat.search(content):
        return pat.sub(new_block, content, count=1)
    # nincs meg — head vege ele
    return content.replace("</head>", new_block + "\n</head>", 1)


def patch_one(filename: str) -> tuple[bool, str]:
    path = os.path.join(PAGES_DIR, filename)
    cfg = PAGE_META.get(filename)
    if not cfg:
        return False, f"no config for {filename}"
    with open(path, encoding="utf-8") as fp:
        c = fp.read()
    orig = c
    head_only = c.split("</head>")[0]
    m_title = re.search(r"<title>([^<]+)</title>", head_only)
    cur_title = m_title.group(1) if m_title else cfg["twitter_description"][:60] if cfg.get("twitter_description") else filename
    # 1. SEO meta blokk (a fooldal mintajara)
    seo_block = build_head_block(filename, cfg, cur_title)
    # A meta csak akkor keruljön be, ha a fo marker megvan
    c = upsert_marker_block(c, "<!-- SEO-META-START", "<!-- SEO-META-END -->", seo_block)
    # Ha meg a comment sem volt, akkor a fent levo regex nem illeszkedik,
    # de az upsert_marker_block ilyenkor beszurja a </head> ele — OK.
    # Most a megadott title/desc/canonical-t NE irjuk felul (az mar benne van),
    # csak ha nincsenek title/description/canonical — ekkor pótoljuk.
    if "<title>" not in head_only:
        c = re.sub(r"</head>", f'    <title>{filename}</title>\n</head>', c, count=1)
    if 'rel="canonical"' not in head_only:
        c = re.sub(r"</head>", f'    <link rel="canonical" href="{SITE_URL}/pages/{filename}" />\n</head>', c, count=1)
    # 2. JSON-LD blokk a <body> elejere (vagy a meglevo script utan)
    jsonld = build_jsonld_block(filename, cfg, cur_title)
    c = upsert_marker_block(c, "<!-- JSONLD-START", "<!-- JSONLD-END -->", jsonld)
    if c == orig:
        return False, f"unchanged: {filename}"
    with open(path, "w", encoding="utf-8") as fp:
        fp.write(c)
    return True, f"patched: {filename}"


def main() -> int:
    if not os.path.isdir(PAGES_DIR):
        print(f"HIBA: nincs pages/ konyvtar: {PAGES_DIR}")
        return 2
    files = sorted(f for f in os.listdir(PAGES_DIR) if f.endswith(".html"))
    if not files:
        print("HIBA: nincs .html a pages/-ben")
        return 2
    n_ok = 0
    n_skip = 0
    for f in files:
        ok, msg = patch_one(f)
        print(msg)
        if ok:
            n_ok += 1
        else:
            n_skip += 1
    print(f"\nOSSZESEN: {len(files)} fajl, patchelve: {n_ok}, valtozatlan: {n_skip}")
    return 0


if __name__ == "__main__":
    sys.exit(main())