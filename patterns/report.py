"""Run the pattern engine and print a human-readable report.

    python -m patterns.report              # summary
    python -m patterns.report --verbose    # every matched chain
    python -m patterns.report --json       # write data/patterns/patterns.json
"""
import argparse, json
from pathlib import Path

from .engine import run, ROOT


def yr(y: int) -> str:
    return f"{abs(y)} BCE" if y < 0 else str(y)


def main(argv=None):
    ap = argparse.ArgumentParser(prog="patterns.report")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)

    res = run()
    print(f"\nPATTERN RECOGNITION -- {res['n_matches']} motif instances found\n")
    print(f"PROMOTED TO GAME RULES  (recurs in >={res['thresholds']['min_states']} states, "
          f"mean strength >={res['thresholds']['min_strength']})")
    print("=" * 92)
    for r in res["promoted_to_rules"]:
        print(f"\n  {r['label']}  [{r['motif_id']}]")
        print(f"    strength {r['mean_strength']}   {r['n_instances']} instances across "
              f"{r['n_states']} states: {', '.join(r['states'])}")
        print(f"    thesis: {r['thesis']}")
        b = r["best"]
        print(f"    strongest chain -- {b['state_id']} ({yr(b['span'][0])} -> {yr(b['span'][1])}, "
              f"strength {b['strength']}):")
        for s in b["stages"]:
            print(f"        {s['stage']:<13} {yr(s['year']):>9}  {s['title'][:62]}")
        if b["skipped"]:
            print(f"        (optional stages unmatched: {', '.join(b['skipped'])})")
        print(f"    -> RULE: {r['game_rule']}")

    if res["local_patterns"]:
        print(f"\n\nLOCAL PATTERNS  (single-state so far -- not yet general enough to be a rule)")
        print("=" * 92)
        for r in res["local_patterns"]:
            print(f"  {r['label']:<26} {', '.join(r['states']):<24} strength {r['mean_strength']}")

    if a.verbose:
        print("\n\nALL MATCHES")
        print("=" * 92)
        for m in sorted(res["all_matches"], key=lambda x: (x["state_id"], x["span"][0])):
            print(f"  {m['state_id']:<13} {m['motif_id']:<22} {yr(m['span'][0]):>9} -> {yr(m['span'][1]):<9} "
                  f"str={m['strength']}  comp={m['completeness']} tight={m['tightness']} ev={m['evidence']}")

    if a.json:
        out = ROOT / "data" / "patterns"
        out.mkdir(parents=True, exist_ok=True)
        (out / "patterns.json").write_text(json.dumps(res, indent=2, ensure_ascii=False))
        print(f"\nwrote {out / 'patterns.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
