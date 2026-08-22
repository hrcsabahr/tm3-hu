"""Audit script for tesla-model3/data/*.json files."""
import json, os, sys, collections, re

FILES = ["szervizek.json", "tobberek.json", "hibak.json", "blog.json"]
BASE = os.path.join("bin", "Debug", "net10.0", "tesla-model3", "data")

def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def top_type(obj):
    if isinstance(obj, list):
        return "list"
    if isinstance(obj, dict):
        return "dict"
    return type(obj).__name__

def collect_keys(obj, prefix=""):
    """Yield (path, value) for every leaf node; for objects also yield key-set."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield prefix + k, v
            yield from collect_keys(v, prefix + k + ".")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            yield f"{prefix}[{i}]", item
            yield from collect_keys(item, prefix + f"[{i}].")
    else:
        yield prefix.rstrip("."), obj

report = {}
for fname in FILES:
    src = os.path.join(BASE, fname)
    raw_text_size = os.path.getsize(src)
    try:
        data = load(src)
        parse_ok = True
        parse_err = None
    except Exception as e:
        parse_ok = False
        parse_err = repr(e)
        data = None

    block = {"file": fname, "size_bytes": raw_text_size, "parse_ok": parse_ok, "parse_err": parse_err}
    if not parse_ok:
        report[fname] = block
        continue

    top = top_type(data)
    block["top_type"] = top

    if top == "dict":
        items = [data]
    else:
        items = data  # list of dicts expected

    block["count"] = len(items)

    # Collect keys per item
    if all(isinstance(it, dict) for it in items):
        all_keys = set()
        per_item_keys = []
        missing_fields = collections.Counter()
        type_issues = []
        for idx, it in enumerate(items):
            keys = set(it.keys())
            per_item_keys.append((idx, keys))
            all_keys.update(keys)
        block["union_keys"] = sorted(all_keys)
        block["total_items"] = len(items)
        # missing fields per item
        for idx, keys in per_item_keys:
            missing = all_keys - keys
            if missing:
                for m in sorted(missing):
                    missing_fields[m] += 1
        block["missing_field_counts"] = dict(missing_fields)

        # Sample first item (truncated)
        if items:
            sample = {k: (v if not isinstance(v, (dict, list)) else f"<{type(v).__name__} len={len(v)}>") for k, v in items[0].items()}
            block["first_item_sample"] = sample

        # Type checks for numeric/text hints
        for idx, it in enumerate(items):
            for k, v in it.items():
                if "ar" in k.lower() or "price" in k.lower() or "koltseg" in k.lower() or "osszeg" in k.lower():
                    if not (isinstance(v, (int, float)) or (isinstance(v, str) and re.search(r"\d", v))):
                        type_issues.append((idx, k, type(v).__name__))
                if "datum" in k.lower() or "date" in k.lower():
                    if isinstance(v, str) and not re.match(r"^\d{4}-\d{2}-\d{2}", v):
                        type_issues.append((idx, k, v))
        if type_issues:
            block["type_or_format_issues_sample"] = type_issues[:10]

    # Duplicates by 'id' or 'slug' if present
    dup = collections.Counter()
    if top == "dict":
        if "id" in data:
            dup[data["id"]] += 1
        candidates = [data]
    else:
        candidates = data
    id_keys = ["id", "slug", "code", "nev", "name"]
    for kk in id_keys:
        ids = []
        for it in candidates:
            if isinstance(it, dict) and kk in it:
                ids.append(it[kk])
        if ids and len(ids) >= 2:
            c = collections.Counter(ids)
            dups = {k: v for k, v in c.items() if v > 1}
            if dups:
                block.setdefault("duplicates_by_" + kk, dups)

    # Encoding check (look for replacement char or mojibake)
    with open(src, "r", encoding="utf-8") as f:
        raw = f.read()
    block["has_replacement_char"] = "\ufffd" in raw
    block["mojibake_sample"] = []
    for m in re.finditer(r"Ã©|Ã¡|Ã³|Ã¼|Ã¶|Ãº|Å\u0171", raw):
        block["mojibake_sample"].append(raw[max(0, m.start()-15):m.end()+15])
        if len(block["mojibake_sample"]) >= 3:
            break

    report[fname] = block

print(json.dumps(report, indent=2, ensure_ascii=False, default=str))
