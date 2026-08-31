#!/usr/bin/env python3
"""
audit_pages_seo_scroll.py — Aloldalak SEO es scroll-fix auditja.

Mit ellenoriz:
- Minden aloldal <head>-jeben ott vannak-e a fooldalhoz hasonlo meta tag-ek
  (keywords, robots, og:type, og:image, twitter:card, hreflang, JSON-LD).
- A site.css nem tartalmaz '.page-hero' + 'overscroll-behavior' egyutt.
- A body es a .container tartalmaz 'touch-action: pan-y'-t.

Kimenet: tablazat + PASS/FAIL szamolo.
"""
from __future__ import annotations
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "pages")
SITE_CSS = os.path.join(ROOT, "assets/css/site.css")

REQUIRED = [
    ("title", "<title>"),
    ("description", 'name="description"'),
    ("keywords", 'name="keywords"'),
    ("author", 'name="author"'),
    ("robots", 'name="robots"'),
    ("og:type", 'property="og:type"'),
    ("og:title", 'property="og:title"'),
    ("og:description", 'property="og:description"'),
    ("og:url", 'property="og:url"'),
    ("og:image", 'property="og:image"'),
    ("og:site_name", 'property="og:site_name"'),
    ("og:locale", 'property="og:locale"'),
    ("twitter:card", 'name="twitter:card"'),
    ("twitter:title", 'name="twitter:title"'),
    ("twitter:description", 'name="twitter:description"'),
    ("twitter:image", 'name="twitter:image"'),
    ("canonical", 'rel="canonical"'),
    ("hreflang", 'rel="alternate" hreflang="hu"'),
    ("icon", 'rel="icon"'),
    ("apple-touch-icon", 'rel="apple-touch-icon"'),
    ("JSON-LD", 'application/ld+json'),
    ("BreadcrumbList", '"BreadcrumbList"'),
    ("WebPage", '"WebPage"'),
]

def audit_seo() -> tuple[int, int, list[tuple[str, list[str]]]]:
    files = sorted(f for f in os.listdir(PAGES_DIR) if f.endswith(".html"))
    n_ok = 0
    n_total = 0
    rows: list[tuple[str, list[str]]] = []
    for f in files:
        p = os.path.join(PAGES_DIR, f)
        with open(p, encoding="utf-8") as fp:
            c = fp.read()
        head = c.split("</head>")[0]
        missing: list[str] = []
        for name, needle in REQUIRED:
            if needle not in head:
                missing.append(name)
        n_total += len(REQUIRED)
        if not missing:
            n_ok += len(REQUIRED)
        else:
            n_ok += len(REQUIRED) - len(missing)
        rows.append((f, missing))
    return n_ok, n_total, rows


def audit_scroll() -> tuple[bool, list[str]]:
    """Scroll-fix audit:
    - .page-hero NEM szerepeljen az overscroll-behavior szabalyban.
    - body kapjon touch-action: pan-y-t.
    - main/.section/.container kapjon touch-action: pan-y-t.
    """
    notes: list[str] = []
    css = open(SITE_CSS, encoding="utf-8").read()
    ok = True

    # 1) .page-hero + overscroll-behavior egyutt NEM lehet
    bad = re.search(r"\.page-hero\s*\{[^}]*overscroll-behavior[^}]*\}", css)
    if bad:
        notes.append(f"FAIL: .page-hero meg tartalmaz 'overscroll-behavior'-t: {bad.group(0)[:120]}")
        ok = False
    else:
        notes.append("OK: .page-hero nem kap overscroll-behavior-t")

    # 2) body { ... touch-action: pan-y ... }
    m_body = re.search(r"body\s*\{[^}]*touch-action\s*:\s*pan-y[^}]*\}", css)
    if m_body:
        notes.append("OK: body tartalmaz 'touch-action: pan-y'-t")
    else:
        notes.append("FAIL: body NEM tartalmaz 'touch-action: pan-y'-t")
        ok = False

    # 3) main/.section/.container touch-action
    m_main = re.search(r"(?:main|\.section|\.container)[^{}]*\{[^}]*touch-action\s*:\s*pan-y[^}]*\}", css)
    if m_main:
        notes.append("OK: main/.section/.container tartalmaz 'touch-action: pan-y'-t")
    else:
        notes.append("FAIL: main/.section/.container NEM tartalmaz 'touch-action: pan-y'-t")
        ok = False

    return ok, notes


def main() -> int:
    print("=" * 70)
    print("AUDIT: aloldalak SEO + scroll-fix")
    print("=" * 70)
    n_ok, n_total, rows = audit_seo()
    print(f"\nSEO meta ellenorzes ({len(rows)} fajl, {len(REQUIRED)} kategoria):\n")
    print(f"{'fajl':<22} {'status':<8}  hianyzolista")
    print("-" * 70)
    for f, missing in rows:
        if missing:
            print(f"{f:<22} {'PARTIAL':<8}  hianyzik: {', '.join(missing)}")
        else:
            print(f"{f:<22} {'PASS':<8}  -")
    pct = 100 * n_ok / n_total if n_total else 0
    print(f"\nSEO ossz pontszam: {n_ok}/{n_total} ({pct:.1f}%)")

    print("\n" + "=" * 70)
    print("SCROLL-FIX AUDIT")
    print("=" * 70 + "\n")
    ok, notes = audit_scroll()
    for n in notes:
        print(f"  {n}")
    print(f"\nScroll-fix statusz: {'PASS' if ok else 'FAIL'}")

    overall = pct == 100 and ok
    print(f"\n{'='*70}")
    print(f"ÖSSZESÍTÉS: {'PASS' if overall else 'FAIL'}")
    print(f"{'='*70}")
    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())