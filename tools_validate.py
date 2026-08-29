"""Validate every Historia file against the schema. Wired into CI and the Makefile."""
import json, sys
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent
schema = json.loads((ROOT / "schema" / "historia.schema.json").read_text())
v = Draft202012Validator(schema)
tax = json.loads((ROOT / "data/registry/taxonomy.json").read_text())
valid_tags = {t for g in tax["tags"].values() if isinstance(g, list) for t in g}
eras = {e["id"] for e in json.loads((ROOT / "data/registry/eras.json").read_text())["eras"]}
states = {e["id"] for e in json.loads((ROOT / "data/registry/states.json").read_text())["entities"]}

fail = 0
for f in sorted((ROOT / "data/historia").glob("*.json")):
    doc = json.loads(f.read_text())
    errs = [f"{'/'.join(map(str,e.path))}: {e.message}" for e in v.iter_errors(doc)]
    # Referential checks the JSON Schema cannot express.
    if doc["state_id"] not in states:
        errs.append(f"state_id '{doc['state_id']}' not in states.json")
    for ev in doc["events"]:
        if ev["era"] not in eras:
            errs.append(f"{ev['id']}: unknown era {ev['era']}")
        bad = [t for t in ev.get("tags", []) if t not in valid_tags]
        if bad:
            errs.append(f"{ev['id']}: tags outside taxonomy {bad}")
        if ev.get("year_end") is not None and ev["year_end"] < ev["year"]:
            errs.append(f"{ev['id']}: year_end {ev['year_end']} precedes year {ev['year']}")
    status = "OK  " if not errs else "FAIL"
    print(f"  {status} {f.name:<20} {len(doc['events']):>3} events")
    for e in errs[:6]:
        print(f"        - {e}")
    fail += bool(errs)
print(f"\n{'ALL VALID' if not fail else f'{fail} file(s) invalid'}")
sys.exit(1 if fail else 0)
