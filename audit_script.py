import json, os
from collections import Counter

BASE = r"C:\Users\hrank\.gemini\antigravity\scratch\AgentManager\AgentManagerApp\tesla-model3"
DATA_DIR = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "audit-p1.md")

# kulcs tippek - ahol a tényleges lista van
ARRAY_HINTS = {
    "szervizek.json": "szervizek",
    "tobberek.json":  "tobberek",
    "hibak.json":     None,
    "blog.json":      None,
}

EXPECTED = {
    "szervizek.json": ["id", "nev", "tipus", "varos", "cim", "telefon", "web", "idpont", "services", "rating", "reviews"],
    "tobberek.json":  ["id", "nev", "email", "uzenet", "datum"],
    "hibak.json":     ["id", "kod", "leiras", "sulyos"],
    "blog.json":      ["id", "cim", "slug", "tartalom", "datum"],
}

def load_list(path, hint=None):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, list):
        return data, None
    if isinstance(data, dict):
        if hint and hint in data and isinstance(data[hint], list):
            return data[hint], data.get("meta")
        # heurisztika: keresünk listát
        for k, v in data.items():
            if isinstance(v, list):
                return v, data.get("meta")
    return None, None

lines = []
lines.append("# tesla-model3 - Adat Audit (P1)\n")
lines.append("_Sandbox-only, nincs git push, nincs M3 action._\n")

lines.append("## 1. Rekordszámok\n")
lines.append("| Fájl | Lista kulcs | Darab | Meta? |")
lines.append("|---|---|---|---|")
records = {}
for f in ["szervizek.json", "tobberek.json", "hibak.json", "blog.json"]:
    p = os.path.join(DATA_DIR, f)
    if not os.path.exists(p):
        lines.append(f"| `{f}` | - | HIBA: fajl nem talalhato | - |")
        continue
    items, meta = load_list(p, ARRAY_HINTS.get(f))
    records[f] = (items, meta)
    if items is None:
        lines.append(f"| `{f}` | - | HIBA: nem talalhato lista | - |")
    else:
        key = ARRAY_HINTS.get(f) or "(auto-detect)"
        lines.append(f"| `{f}` | `{key}` | {len(items)} | {'igen' if meta else 'nincs'} |")
lines.append("")

def inspect_list(name, items, expected_fields, meta):
    out = [f"### `{name}`", f"- Elemszam: **{len(items)}**"]
    if meta:
        out.append(f"- Meta: `{json.dumps(meta, ensure_ascii=False)}`")
    if not items:
        out.append("- Ures lista.\n")
        return "\n".join(out)
    keys_counter = Counter()
    for it in items:
        if isinstance(it, dict):
            keys_counter.update(it.keys())
    out.append(f"- Mezok gyakorisaga: `{dict(keys_counter)}`")
    missing_records = []
    type_issues = []
    for idx, it in enumerate(items):
        if not isinstance(it, dict):
            type_issues.append((idx, type(it).__name__))
            continue
        missing = [k for k in expected_fields if k not in it or it.get(k) in (None, "", [])]
        if missing:
            missing_records.append((idx, missing))
    out.append(f"- Elvart alap mezok: `{expected_fields}`")
    out.append(f"- Hianyos rekordok szama: **{len(missing_records)}**")
    if missing_records[:10]:
        out.append("- Hianyos rekordok (max 10):")
        for idx, m in missing_records[:10]:
            out.append(f"  - idx {idx}: hianyzik/ures: {m}")
    if type_issues:
        out.append(f"- Tipusproblemek: {type_issues}")
    out.append("- Elso rekord:")
    out.append("```json")
    out.append(json.dumps(items[0], ensure_ascii=False, indent=2))
    out.append("```\n")
    return "\n".join(out)

lines.append("## 2. Mezoaudit es inkonzisztenciak\n")
for f in ["szervizek.json", "tobberek.json", "hibak.json", "blog.json"]:
    items, meta = records.get(f, (None, None))
    if items is None:
        lines.append(f"### `{f}`\n- Nem talalhato feldolgozhato lista.\n")
        continue
    lines.append(inspect_list(f, items, EXPECTED.get(f, []), meta))

lines.append("## 3. Cross-file konzisztencia\n")
def collect_ids(name, items):
    ids = []
    for it in items or []:
        if isinstance(it, dict):
            if "id" in it:
                ids.append(it["id"])
            elif "slug" in it:
                ids.append(it["slug"])
    return ids

for f in ["szervizek.json", "tobberek.json", "hibak.json", "blog.json"]:
    items, _ = records.get(f, (None, None))
    ids = collect_ids(f, items)
    if ids:
        dups = [i for i, n in Counter(ids).items() if n > 1]
        lines.append(f"- `{f}`: egyedi azonositok: {len(set(ids))} / osszes: {len(ids)}; duplikaltak: {dups}")

lines.append("")
lines.append("## 4. Osszefoglalo / Ajánlott lépések\n")
lines.append("- Hianyos mezok potlasa a fenti listak alapjan.")
lines.append("- Duplikalt azonositok/slug-ok megszuntetese.")
lines.append("- Egyseges sema kialakitasa (lasd EXPECTED tabla).")
lines.append("- Validacio beepitese a build pipeline-ba.")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("DONE ->", OUT)
