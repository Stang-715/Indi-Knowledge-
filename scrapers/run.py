"""Historia ingest CLI.

    python -m scrapers.run --state kerala
    python -m scrapers.run --all --workers 4
    python -m scrapers.run --all --dry-run          # report reachability, write nothing

Ingest is idempotent: event ids are content-derived, so re-running merges rather than
duplicates, and hand-verified rows (review.status == 'human_verified') are never
overwritten by a later automated pass.
"""
import argparse, json, sys, traceback
from concurrent.futures import ThreadPoolExecutor

from . import config, sources
from . import normalize as N
from .http import Blocked


def load_registry() -> list[dict]:
    return json.loads((config.REGISTRY / "states.json").read_text())["entities"]


def existing(state_id: str) -> dict:
    p = config.HISTORIA / f"{state_id}.json"
    if p.exists():
        return json.loads(p.read_text())
    return {"state_id": state_id, "schema_version": "1.0.0", "events": []}


def harvest(entity: dict) -> list[dict]:
    """All source adapters for one state. Failures in one source never sink the others."""
    sid, title = entity["id"], entity["sources"]["wikipedia_title"]
    events: list[dict] = []

    # --- Wikipedia prose -------------------------------------------------
    try:
        for sec in sources.article_sections(title):
            text = sources.clean_wikitext(sec["wikitext"])
            for sent in sources.sentences(text):
                ev = N.make_event(
                    state_id=sid, text=sent,
                    sources=[{"kind": "wikipedia",
                              "ref": f"https://en.wikipedia.org/wiki/{title}#{sec['section'].replace(' ', '_')}",
                              "retrieved": N.now(),
                              "license": config.LICENSES["wikipedia"],
                              "quote": sent[:300]}],
                )
                if ev:
                    events.append(ev)
    except Blocked:
        raise
    except Exception:
        print(f"  ! wikipedia prose failed for {sid}", file=sys.stderr)
        traceback.print_exc(limit=1, file=sys.stderr)

    # --- Wikidata structured claims --------------------------------------
    try:
        qid = entity["sources"].get("wikidata_qid") or sources.resolve_qid(title)
        if qid:
            entity["sources"]["wikidata_qid"] = qid
            for query in (sources.SPARQL_BATTLES, sources.SPARQL_EVENTS):
                for row in sources.sparql(query, qid):
                    label = row.get("itemLabel", "")
                    if not label or label.startswith("Q"):
                        continue          # unlabelled entity: no player value
                    year = N.iso_to_year(row.get("date") or row.get("start"))
                    if year is None:
                        continue
                    ev = N.make_event(
                        state_id=sid, text=label, title=label,
                        year=year, year_end=N.iso_to_year(row.get("end")),
                        precision="exact",
                        places=[row["placeLabel"]] if row.get("placeLabel") else [],
                        sources=[{"kind": "wikidata", "ref": row.get("item", qid),
                                  "retrieved": N.now(),
                                  "license": config.LICENSES["wikidata"], "quote": None}],
                    )
                    if ev:
                        events.append(ev)
    except Blocked:
        raise
    except Exception:
        print(f"  ! wikidata failed for {sid}", file=sys.stderr)
        traceback.print_exc(limit=1, file=sys.stderr)

    return events


def merge(prior: dict, fresh: list[dict]) -> dict:
    """Human verdicts win. An automated pass may add and enrich, never overrule."""
    locked = {e["id"]: e for e in prior.get("events", [])
              if e.get("review", {}).get("status") in ("human_verified", "rejected")}
    incoming = [e for e in fresh if e["id"] not in locked]
    carried = [e for e in prior.get("events", []) if e["id"] not in locked]
    merged = N.dedupe(carried + incoming)
    merged = [e for e in merged if locked.get(e["id"], {}).get("review", {}).get("status") != "rejected"]
    merged += [e for e in locked.values() if e["review"]["status"] == "human_verified"]
    merged = sorted({e["id"]: e for e in merged}.values(), key=lambda x: (x["year"], x["category"]))

    prior["events"] = merged
    prior["generated_at"] = N.now()
    prior["coverage"] = N.coverage(merged)
    return prior


def ingest_one(entity: dict, *, dry_run: bool) -> dict:
    sid = entity["id"]
    try:
        fresh = harvest(entity)
    except Blocked as e:
        return {"state": sid, "status": "blocked", "detail": str(e)}
    except Exception as e:
        return {"state": sid, "status": "error", "detail": repr(e)}

    if dry_run:
        return {"state": sid, "status": "ok", "harvested": len(fresh), "written": 0}

    doc = merge(existing(sid), fresh)
    config.HISTORIA.mkdir(parents=True, exist_ok=True)
    (config.HISTORIA / f"{sid}.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False))
    flagged = sum(1 for e in doc["events"] if e["review"]["status"] == "flagged")
    return {"state": sid, "status": "ok", "harvested": len(fresh),
            "written": len(doc["events"]), "flagged": flagged}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="scrapers.run")
    ap.add_argument("--state", action="append", help="state id; repeatable")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args(argv)

    reg = load_registry()
    if a.all:
        targets = reg
    elif a.state:
        want = set(a.state)
        targets = [e for e in reg if e["id"] in want]
        missing = want - {e["id"] for e in targets}
        if missing:
            ap.error(f"unknown state id(s): {sorted(missing)}")
    else:
        ap.error("pass --state <id> or --all")

    print(f"Ingesting {len(targets)} entities (workers={a.workers}, dry_run={a.dry_run})")
    with ThreadPoolExecutor(max_workers=a.workers) as pool:
        results = list(pool.map(lambda e: ingest_one(e, dry_run=a.dry_run), targets))

    blocked = [r for r in results if r["status"] == "blocked"]
    errored = [r for r in results if r["status"] == "error"]
    ok = [r for r in results if r["status"] == "ok"]

    for r in ok:
        print(f"  {r['state']:<40} harvested={r['harvested']:<5} written={r.get('written',0):<5} flagged={r.get('flagged',0)}")
    for r in errored:
        print(f"  {r['state']:<40} ERROR {r['detail']}", file=sys.stderr)
    if blocked:
        print(f"\n{len(blocked)} state(s) blocked by network policy.", file=sys.stderr)
        print(f"  {blocked[0]['detail']}", file=sys.stderr)
        return 2
    return 1 if errored else 0


if __name__ == "__main__":
    raise SystemExit(main())
