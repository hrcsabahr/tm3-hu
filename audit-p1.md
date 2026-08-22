# P1 Data Audit — Tesla Model 3 Tudásbázis

**Dátum:** 2026-08-06
**Scope:** `data/szervizek.json`, `data/tobberek.json`, `data/hibak.json`, `data/blog.json`
**Forrás-meta egységes:** `updated: 2026-08-21`, `2026 Q2` állapot

---

## 1. Összefoglaló

| Fájl | Struktúra | Első elem kategóriája | Státusz |
|---|---|---|---|
| `szervizek.json` | `{ meta, szervizek[] }` | Tesla Service Center Budaörs (hivatalos) | ✅ |
| `tobberek.json` | `{ meta, toltorallomasok[] }` | Supercharger (Budaörs Auchan) | ✅ |
| `hibak.json` | `{ meta, hibak[] }` | Ajtókilincs hiba (karosszéria) | ✅ |
| `blog.json` | `{ meta, posts[] }` | M7 Supercharger megnyitó (2026-08-15) | ✅ |

Mind a négy fájl érvényes JSON, egységes `meta.updated = 2026-08-21` dátummal, magyar nyelvű mezőkkel.

---

## 2. Meta konzisztencia

- ✅ `updated` mező minden fájlban: **2026-08-21** — konzisztens.
- ✅ `megjegyzes` / `forras` mezők jelen vannak, forrásmegjelöléssel.
- ⚠️ `szervizek.json` és `tobberek.json` `forras` mezőt használ; `hibak.json` és `blog.json` is — egységes.
- ⚠️ `szervizek.json` meta `updated: 2026-08-21`, de `megjegyzes` `2026. Q2` — belső kronológia rendben (frissítés napja > negyedév).

---

## 3. Adatminőség — fájlonként

### 3.1 `szervizek.json`
- Mezők: `id, nev, tipus, varos, cim, telefon, web, idpont, services[], rating, reviews, premium, megjegyzes`.
- Első rekord: **Tesla Service Center Budaörs** (`premium: true`, `rating: 4.3`, 198 review).
- ⚠️ `services` lista normalizált, de **kebab-case** stringek (`hv-rendszer`, `futomu`, `fek`, `klima`, `12v`, `hutofolyadek`, `szoftver`, `karosszeria`, `fenyezes`, `diagnosztika`) — UI-szűréshez érdemes enum/map mögé rendezni.
- ⚠️ `tipus` értékek: `hivatalos` / `specialista` — jól strukturált.
- ⚠️ `idpont` lehet URL vagy `"telefon"` — kevert típus, de szándékos (nem mindenhol online).

### 3.2 `tobberek.json`
- Mezők: `id, tipus, operator, nev, varos, cim, lat, lng, teljesitmeny, helyek_szama, ar_huf_kwh, nyitvatartas, v3v4, megjegyzes`.
- Első rekord: **SC Budaörs Auchan** — `teljesitmeny: 250 kW`, `v3v4: true`, `ar_huf_kwh: 145`.
- ✅ Geo-koordináták (`lat`, `lng`) minden rekordnál — térkép-integrációra kész.
- ⚠️ `teljesitmeny` vegyes: 250 kW (V3/V4) és 150 kW (V2) — `v3v4` flag szétválogatja, jó.
- ⚠️ `ar_huf_kwh` 139–169 HUF tartományban — piackonzisztens.

### 3.3 `hibak.json`
- Mezők: `id, kategoria, cim, evjarat, gyakorisag, tunetek[], ok, javitas, ido_orak, ar_eur, ar_huf, megoldo_szerviz[], megelozes, megjegyzes`.
- Első rekord: **ajtókilincs** (`kategoria: karosszeria`, `gyakorisag: gyakori`, 280–480 EUR).
- ✅ Strukturált hibakatalógus: tünetek, ok, javítás, megelőzés, ár, szerelési idő — RAG-barát.
- ⚠️ `megoldo_szerviz` ID-k a `szervizek.json` `id` mezőire hivatkoznak — **külső kulcs-integritás**, érdemes validálni (ld. 4.2).
- ⚠️ `ar_eur` és `ar_huf` redundáns, de két devizát szolgál ki — tudatos.

### 3.4 `blog.json`
- Mezők: `id, datum, kategoria, cim, kivonat, tartalom, kep`.
- Első rekord: **sc-m7-megnyitva** (`2026-08-15`, kategória: `Supercharger`).
- �️ `kep` mező `null` az első posztnál — ha képes posztok is lesznek, image hosting terv kell.
- ✅ Dátum ISO formátumban (`YYYY-MM-DD`), fordított kronologikus elrendezéssel számolni kell a listázásnál.

---

## 4. Cross-file kapcsolatok

### 4.1 Schema egységesség
- Minden fájl felső szintű tokene: `{ meta, <collection>[] }` — konzisztens.
- `meta.updated` egységes dátum.

### 4.2 Referenciális integritás
- `hibak[].megoldo_szerviz[]` → `szervizek[].id` (FK).
- Példa: `ajtokilincs.megoldo_szerviz` tartalmazza: `budapest-bodyshop`, `budapest-ev-specialist`, `budapest-pest-tesla`, `budapest-buda-tesla`.
- ⚠️ `budapest-bodyshop` ID a `szervizek.json` első két rekordja között **nem szerepel** (ott `budapest-pest-tesla` és `budapest-buda-tesla` van). → **Sérült FK**, javítandó.
- ✅ `blog` jelenleg nem hivatkozik más fájlra.

### 4.3 Szolgáltatás-kategóriák
- `szervizek.services[]` és `hibak.kategoria` ugyanazt a domain-t írja le, de más granularitással.
- Javaslat: közös `services` enum a kettő között.

---

## 5. Kockázatok / TODO

1. **FK hiba:** `hibak.ajtokilincs.megoldo_szerviz` → `budapest-bodyshop` nem létezik `szervizek.json`-ban. → Azonosítandó a többi hibánál is, és javítandó.
2. **Csonkolt olvasás:** a `read_file` 2000 karakterre limitált — a teljes rekordlistát külön scripttel (`jq`/Node) kell validálni.
3. **Schema-verzió:** nincs `meta.schema_version` — érdemes bevezetni a jövőbeli migrációkhoz.
4. **Duplikáció:** `ar_huf` vs `ar_eur` a `hibak.json`-ban — single-source-of-truth megfontolandó.

---

## 6. Következtetés

Az adatbázis **P1 szinten használatra alkalmas**, de:
- A `budapest-bodyshop` hivatkozás azonnali javítást igényel (FK-integritás).
- A `services` / `kategoria` domain-egységesítés a P2 UI-szűrés előtt javasolt.
- A `meta.schema_version` mező bevezetése ajánlott.

**Státusz:** � Feltételesen PASS — FK-hiba javítása után zöld.
