"""Turn the authored seed corpus into schema-valid Historia files.

The seed exists so the pattern engine and the game layer are exercisable before the
scrapers ever run. Every seeded row is marked `kind: "authored"` and carries a
verification target, so the first live ingest corroborates rather than overwrites.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "seed"))

from scrapers import normalize as N     # noqa: E402
from scrapers import config             # noqa: E402

import seed_kerala_bengal_gujarat as A  # noqa: E402
import seed_jharkhand_tn_punjab as B    # noqa: E402

CORPUS = {
    "kerala": A.KERALA, "west-bengal": A.WEST_BENGAL, "gujarat": A.GUJARAT,
    "jharkhand": B.JHARKHAND, "tamil-nadu": B.TAMIL_NADU, "punjab": B.PUNJAB,
}

REG = {e["id"]: e for e in json.loads((config.REGISTRY / "states.json").read_text())["entities"]}
TAX = json.loads((config.REGISTRY / "taxonomy.json").read_text())
VALID_TAGS = {t for g in TAX["tags"].values() if isinstance(g, list) for t in g}
VALID_CATS = {c["id"] for c in TAX["categories"]}
CHANNEL = {c["id"]: c["sim_channel"] for c in TAX["categories"]}


def build(state_id: str, rows: list) -> dict:
    ent = REG[state_id]
    wiki = ent["sources"]["wikipedia_title"]
    events = []
    for (year, year_end, precision, category, title, summary, tags,
         magnitude, confidence, actors, places, flags) in rows:
        assert category in VALID_CATS, f"{state_id}: bad category {category}"
        bad = [t for t in tags if t not in VALID_TAGS]
        assert not bad, f"{state_id} '{title}': tags outside taxonomy: {bad}"

        era = N.era_for(year)
        ceiling = N.era_meta(era)["confidence_ceiling"]
        conf = round(min(confidence, ceiling), 3)

        flags = list(flags)
        if conf < config.FLAG_BELOW and "low_confidence" not in flags:
            flags.append("low_confidence")
        status = "flagged" if flags else "auto"

        events.append({
            "id": N.event_id(state_id, year, category, title),
            "year": year, "year_end": year_end, "year_precision": precision,
            "era": era, "category": category,
            "title": title, "summary": summary,
            "tags": sorted(tags), "places": places, "actors": actors,
            "magnitude": magnitude,
            "causes": [], "effects": [],
            "confidence": conf,
            "review": {
                "status": status, "flags": flags,
                "note": "Seed corpus v1: authored from general historical knowledge. "
                        "Corroborate against the cited article on first live ingest.",
                "reviewer": None,
            },
            "contested": "contested_history" in flags,
            "sim": {"channel": CHANNEL[category], "deltas": {}, "scenario": None},
            "sources": [{
                "kind": "authored",
                "ref": f"seed/v1 -> verify at https://en.wikipedia.org/wiki/{wiki}",
                "retrieved": N.now(), "license": "CC0-1.0", "quote": None,
            }],
        })

    events = N.dedupe(events)
    return {
        "state_id": state_id, "schema_version": "1.0.0",
        "generated_at": N.now(),
        "provenance": "seed-v1-authored-pending-verification",
        "coverage": N.coverage(events),
        "events": events,
    }


def main():
    config.HISTORIA.mkdir(parents=True, exist_ok=True)
    total = 0
    for sid, rows in CORPUS.items():
        doc = build(sid, rows)
        (config.HISTORIA / f"{sid}.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        total += len(doc["events"])
        span = f"{doc['events'][0]['year']}..{doc['events'][-1]['year']}"
        print(f"  {sid:<14} {len(doc['events']):>3} events  {span:<12} "
              f"eras={len(doc['coverage'])}  flagged={sum(1 for e in doc['events'] if e['review']['status']=='flagged')}")
    print(f"\n{total} events across {len(CORPUS)} states")


if __name__ == "__main__":
    main()
