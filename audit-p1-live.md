# tesla-model3 — Élő Adataudit

**Dátum:** 2026-08-25
**Scope:** `data/szervizek.json`, `data/tobberek.json`, `data/hibak.json`, `data/blog.json`
**Módszer:** `audit_live.py` közvetlenül a `data/` mappából olvas (a korábbi `bin/Debug/net10.0/...` path elavult, .NET build maradvány).

---

## 1. Fájlonkénti állapot

### `szervizek.json`
- méret: ~7 KB
- rekordok: **10**
- meta: `{updated: 2026-08-21, ...}`
- union mezők: id, nev, tipus, varos, cim, telefon, web, idpont, services[], rating, reviews, premium, megjegyzes

### `tobberek.json`
- rekordok: **12** (Supercharger + Mobiliti + E.ON + Shell + Volteum)
- union mezők: id, tipus, operator, nev, varos, cim, lat, lng, teljesitmeny, helyek_szama, ar_huf_kwh, nyitvatartas, v3v4, megjegyzes

### `hibak.json`
- rekordok: **8** (ajtókilincs, MCU, 12V, futómű csavar, HV modul, klíma, fényezés, tetőüveg)
- union mezők: id, kategoria, cim, evjarat, gyakorisag, tunetek[], ok, javitas, ido_orak, ar_eur, ar_huf, megoldo_szerviz[], megelozes, megjegyzes

### `blog.json`
- rekordok: dinamikus (hírek)
- union mezők: id, datum, kategoria, cim, kivonat, tartalom, kep

---

## 2. FK-integritás: `hibak.megoldo_szerviz` → `szervizek.id`

| # | Hiba ID | Cím | Refs | Státusz |
|---|---|---|---|---|
| 1 | `ajtokilincs` | Ajtókilincs hiba | 4 | ✅ |
| 2 | `mcu-hiba` | MCU / eMMC kopás | 3 | ✅ |
| 3 | `12v-akkumulator` | 12V csere | 8 | ✅ |
| 4 | `futomu-csavar` | Felfüggesztés csavar lazulás | 7 | ✅ |
| 5 | `hv-modul-csere` | HV akku modul csere | 3 | ✅ |
| 6 | `klimarendszer` | Klíma kompresszor | 6 | ✅ |
| 7 | `fenyezodes` | Fényezési hibák | 2 | ✅ |
| 8 | `tetouveg` | Tetőüveg tömítés | 3 | ✅ |

**A korábbi P1 audit (`audit-p1.md`) által jelzett `budapest-bodyshop` FK-hiba javítva:**
- A `budapest-bodyshop` (Tesla Karosszéria Specialista Bp.) már létezik a `szervizek.json`-ban (10. rekord).
- Mind a 8 hiba minden `megoldo_szerviz` hivatkozása érvényes.

**FK-státusz:** ✅ **PASS** — minden hivatkozás él.

---

## 3. Duplikált ID-k

Egyik fájlban sincs duplikált `id`. Mind a 10 szerviz, 12 töltő, 8 hiba és minden blog bejegyzés egyedi azonosítóval rendelkezik.

---

## 4. Összefoglaló

- 4/4 adatfájl érvényes JSON
- FK-integritás: ✅ **PASS**
- Duplikátumok: **0**
- Státusz: **✅ PASS — production-ready adatréteg**

A P1 audit korábbi, `audit-p1.md`-ben dokumentált "feltételesen PASS" státusza most már **zöld PASS**. Az adatréteg készen áll a deploy-ra és a P2 dark theme redesign-ra.

---

_Következő lépések (felhasználói döntéstől függően):_
1. P2 dark theme redesign — Sprint 1 indítása (tokens.css + hero)
2. GitHub Pages deploy push a `tm3-hu` repoba
3. További P3+ feature work (pl. i18n, kereső, PWA offline)
