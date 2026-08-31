#!/usr/bin/env python3
"""
patch_nav_gumi.py — 'Gumi' menupont beszurasa minden aloldal + a fooldal
navbar-jaba, hogy a user barmely oldalrol elerhesse a gumi-felni ajanlot.

A 'Gumi' link helye: 'Hibák' utan (megfelel a site.js NAV_ITEMS sorrendjnek).

Mit csinal:
- index.html: 8-elemu nav (Főoldal + 7) -> 9-elemu (Főoldal + 8, Gumi beszurva)
- pages/*.html: 9-elemu nav (Főoldal + 8) -> 10-elemu (Gumi beszurva)

Idempotens: ha mar van 'href="...gumi.html" aria-current="page">Gumi</a>',
akkor nem csinal semmit.
"""
from __future__ import annotations
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
PAGES_DIR = os.path.join(ROOT, "pages")

# Ket minta: fooldali (href="pages/...") es aloldali (href="gumi.html" vagy href="../pages/...")
GUMI_HREF_FOOLDAL = '<a href="pages/hibak.html">Hibák</a>\n                <a href="pages/gumi.html">Gumi</a>'
GUMI_HREF_ALOLDAL = '<a href="hibak.html">Hibák</a>\n                <a href="gumi.html">Gumi</a>'


def patch(path: str, search: str, replace: str, dry: bool = False) -> tuple[bool, str]:
    with open(path, encoding="utf-8") as fp:
        c = fp.read()
    if 'href="gumi.html"' in c and '>Gumi</a>' in c:
        return False, f"unchanged: {os.path.basename(path)} (mar van Gumi link)"
    if search in c:
        new = c.replace(search, replace, 1)
        if new != c and not dry:
            with open(path, "w", encoding="utf-8") as fp:
                fp.write(new)
        return True, f"patched: {os.path.basename(path)}"
    return False, f"NO MATCH in {os.path.basename(path)} — kerestem: {search[:60]}"


def main() -> int:
    print(f"Fo cim: {INDEX}")
    print(f"Pages:  {PAGES_DIR}")
    n_ok = 0
    n_skip = 0

    # 1. Főoldal
    ok, msg = patch(INDEX, '<a href="pages/hibak.html">Hibák</a>',
                    GUMI_HREF_FOOLDAL)
    print(msg)
    n_ok += int(ok); n_skip += int(not ok)

    # 2. Aloldalak
    if not os.path.isdir(PAGES_DIR):
        print(f"HIBA: nincs pages/ konyvtar")
        return 2
    for fn in sorted(os.listdir(PAGES_DIR)):
        if not fn.endswith(".html"):
            continue
        if fn == "gumi.html":
            # A gumi.html saját navjában mar van 'aria-current="page"' Gumi link,
            # de a search/replace ugyanugy mukodik, csak ellenorizzuk.
            ok, msg = patch(os.path.join(PAGES_DIR, fn),
                            '<a href="hibak.html">Hibák</a>\n                <a href="gumi.html" aria-current="page">Gumi</a>',
                            '<a href="hibak.html">Hibák</a>\n                <a href="gumi.html" aria-current="page">Gumi</a>')
            print(msg)
            n_ok += int(ok); n_skip += int(not ok)
            continue
        ok, msg = patch(os.path.join(PAGES_DIR, fn),
                        '<a href="hibak.html">Hibák</a>',
                        GUMI_HREF_ALOLDAL)
        print(msg)
        n_ok += int(ok); n_skip += int(not ok)

    print(f"\nOSSZESEN: {n_ok} patchelve, {n_skip} kihagyva")
    return 0


if __name__ == "__main__":
    sys.exit(main())