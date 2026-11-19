#!/usr/bin/env python3
"""fetch_software.py — Tesla Model 3 szoftververziók frissítése a Teslascope
publikus API-jából (ingyenes, hitelesítés nélkül).

    python3 _tools/fetch_software.py [--n 20] [--out data/software.json]

Endpontok:
    GET https://teslascope.com/api/software/latest  -> legújabb verzió + release notes
    GET https://teslascope.com/api/software          -> az összes verzió (string tömb)
    GET https://teslascope.com/api/software/{ver}     -> egy verzió részletei

Kimenet: data/software.json
    - meta.updated / forras / megjegyzes
    - latest  : a legújabb verzió teljes release notes-szal (features)
    - verziok : az utolsó N verzió összefoglaló listája (dátum, FSD, feature címek)

A script stdlib-only (urllib), hogy a GitHub Actions ubuntu runneren is fusson
külön csomagtelepítés nélkül. Idempotens: mindig ugyanazt a JSON-t írja ki,
így ha nem változott az adat, a commit lépés kihagyható (nincs diff).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

BASE = "https://teslascope.com/api/software"
UA = "tm3.hu software updater (+https://www.tm3.hu)"

_HERE = os.path.dirname(os.path.abspath(__file__))
HU_FILE = os.path.join(_HERE, "software_hu.json")


def _norm(s: str | None) -> str:
    """Whitespace-normalizálás a magyar fordítások kulcs-illesztéséhez
    (a \xa0 nem törő szóköz és a sortörések is egységes szóközzé válnak)."""
    return re.sub(r"[\s\u00a0]+", " ", s or "").strip()


def load_hu() -> dict:
    """Betölti a magyar fordításokat (cimek + leirasok). Ha a fájl hiányzik,
    üres mapot ad vissza — ilyenkor angol marad a szöveg, de a script nem száll el."""
    try:
        with open(HU_FILE, encoding="utf-8") as fp:
            data = json.load(fp)
    except (OSError, json.JSONDecodeError):
        return {"cimek": {}, "leirasok": {}}
    leirasok = {}
    for en, hu in (data.get("leirasok") or {}).items():
        leirasok[_norm(en)] = hu
    return {"cimek": data.get("cimek") or {}, "leirasok": leirasok}


_HU = load_hu()


def get(url: str, tries: int = 3) -> dict:
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
            data = json.loads(body)
            if data.get("code") == 200:
                return data
            last = RuntimeError(f"API code={data.get('code')}")
        except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, OSError) as e:
            last = e
        if i < tries - 1:
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"fetch failed after {tries} tries: {url} -> {last}")


def iso_to_date(s: str | None) -> str | None:
    if not s:
        return None
    try:
        return s[:10]
    except Exception:
        return s


def fsd_summary(r: dict) -> str | None:
    parts = []
    if r.get("fsd_hw4"):
        parts.append(f"HW4 {r['fsd_hw4']}")
    if r.get("fsd_hw3"):
        parts.append(f"HW3 {r['fsd_hw3']}")
    if r.get("fsd"):
        parts.append(str(r["fsd"]))
    return " · ".join(parts) or None


def country_names(codes) -> list:
    MAP = {
        "us": "USA", "ca": "Kanada", "mx": "Mexikó", "hu": "Magyarország", "de": "Németország",
        "at": "Ausztria", "ch": "Svájc", "gb": "Egyesült Királyság", "fr": "Franciaország",
        "it": "Olaszország", "es": "Spanyolország", "nl": "Hollandia", "be": "Belgium",
        "pl": "Lengyelország", "cz": "Csehország", "sk": "Szlovákia", "dk": "Dánia",
        "se": "Svédország", "no": "Norvégia", "fi": "Finnország", "ie": "Írország",
        "ua": "Ukrajna", "tw": "Tajvan", "au": "Ausztrália", "nz": "Új-Zéland",
        "il": "Izrael", "tr": "Törökország", "ae": "Egyesült Arab Emírségek", "my": "Malajzia",
        "sg": "Szingapúr", "ph": "Fülöp-szigetek", "co": "Kolumbia", "th": "Thaiföld",
        "hk": "Hongkong", "qa": "Katar", "kr": "Dél-Korea", "jp": "Japán", "cn": "Kína",
    }
    out = []
    for item in (codes or []):
        if isinstance(item, dict):
            code = item.get("country") or ""
            name = item.get("name")
            out.append(MAP.get(code, name or code or "?"))
        else:
            out.append(MAP.get(item, item.upper()))
    return out


def build_entry(r: dict) -> dict:
    feats = []
    for f in (r.get("features") or []):
        cim = (f.get("title") or "").strip()
        leiras = (f.get("description") or "").strip()
        cim_hu = _HU["cimek"].get(cim)
        leiras_hu = _HU["leirasok"].get(_norm(leiras))
        feats.append({
            "cim": cim,
            "leiras": leiras,
            "cim_hu": cim_hu,
            "leiras_hu": leiras_hu,
            "customer_version": f.get("customer_version"),
        })
    total = r.get("totalCount") or 0
    count = r.get("count") or 0
    pending = r.get("pending") or {}
    return {
        "version": r.get("version"),
        "datum": iso_to_date(r.get("created_at") or r.get("firstSpotted")),
        "fsd": fsd_summary(r),
        "fsd_hw3": r.get("fsd_hw3"),
        "fsd_hw4": r.get("fsd_hw4"),
        "flotta_db": count,
        "flotta_osszes": total,
        "flotta_pct": round((count / total) * 100, 1) if total else None,
        "rollout": {
            "teljes": (pending.get("total") or 0),
            "elérhető": (pending.get("available") or 0),
            "letöltés": (pending.get("downloading") or 0),
            "telepítés": (pending.get("installing") or 0),
        },
        "orszagok": country_names(r.get("countries")),
        "features": feats,
        "feature_cimek": [f["cim_hu"] or f["cim"] for f in feats if f["cim"]],
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=20, help="hány korábbi verzió kerüljön a 'verziok' listába")
    ap.add_argument("--out", default="data/software.json")
    args = ap.parse_args()

    latest = get(BASE + "/latest")["response"]
    all_versions = get(BASE)["response"]  # list of version strings, newest first

    latest_entry = build_entry(latest)

    # Az összes verzió listája a legújabbal kezdődik; az első a 'latest',
    # a többit egyesével kérjük le a részletekért.
    history = []
    seen = {latest_entry["version"]}
    for ver in all_versions:
        if len(history) >= args.n:
            break
        if ver in seen:
            continue
        try:
            detail = get(f"{BASE}/{ver}")["response"]
        except Exception as e:
            print(f"  skip {ver}: {e}", file=sys.stderr)
            continue
        history.append(build_entry(detail))
        seen.add(ver)

    doc = {
        "meta": {
            # A forrás utolsó frissítésének ideje (nem a futás ideje), így ha a
            # Teslascope adata nem változott, a JSON byte-azonos marad -> nincs
            # felesleges commit óránként.
            "updated": (latest.get("updated_at")
                        or latest.get("latest_received_at")
                        or dt.datetime.now(dt.timezone.utc).isoformat()),
            "forras": "Teslascope publikus API (teslascope.com/api/software)",
            "megjegyzes": (
                "Automatikusan frissül GitHub Actions cron-nal (naponta). "
                "A flotta-adatok (darab, %) a Teslascope közösségi flottájából származnak; "
                "az európai/magyar rollout ettől eltérhet."
            ),
        },
        "latest": latest_entry,
        "verziok": history,
    }

    with open(args.out, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, indent=2)
        fp.write("\n")

    print(f"OK -> {args.out}: latest={latest_entry['version']} ({latest_entry['datum']}), "
          f"history={len(history)} verzió")
    return 0


if __name__ == "__main__":
    sys.exit(main())
