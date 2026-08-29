"""Replay a state's real history through the simulation.

This is the calibration harness, and it earns its place: if replaying what actually
happened produces a state that looks nothing like the real one, the mechanics are wrong.
It also produces the game's baseline -- the player's Divergence score is measured
against this run.

    python -m game.simulate --state kerala
    python -m game.simulate --all --compare
"""
import argparse, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MECH = json.loads((ROOT / "game" / "mechanics.json").read_text())
HISTORIA = ROOT / "data" / "historia"
REGISTRY = ROOT / "data" / "registry"


def new_state() -> dict:
    return {k: v["start"] for k, v in MECH["resources"].items()}


def clamp(res: dict, scars: set) -> dict:
    for k, spec in MECH["resources"].items():
        lo, hi = spec["min"], spec["max"]
        if k == "legitimacy" and "famine_memory" in scars:
            hi += MECH["scars"]["famine_memory"]["legitimacy_cap"]
        res[k] = max(lo, min(hi, round(res[k], 1)))
    return res


def recover(res: dict, years: int, scars: set):
    """Apply per-year drift toward a baseline over the gap between two events.

    Exponential approach, not linear: recovery is fast right after a shock and slows as
    the state nears its baseline, which is how populations and grievances actually behave.
    Scars damp the rate -- an insurgency zone's unrest fades at a quarter speed.
    """
    if years <= 0:
        return
    rec = MECH["recovery"]
    damp = rec["scar_damping"]
    for key, spec in rec.items():
        if key.startswith("$") or key == "scar_damping":
            continue
        rate, target = spec["rate"], spec["toward"]
        for scar in scars:
            rate *= damp.get(scar, {}).get(key, 1.0)
        # 1 - (1-rate)^years, capped so long gaps cannot overshoot the target.
        frac = 1.0 - (1.0 - min(rate, 0.95)) ** min(years, 200)
        res[key] += (target - res[key]) * frac


def replay(doc: dict) -> dict:
    res, scars, log = new_state(), set(), []
    prev_year = None
    for ev in sorted(doc["events"], key=lambda e: e["year"]):
        if prev_year is not None:
            recover(res, ev["year"] - prev_year, scars)
        prev_year = ev.get("year_end") or ev["year"]
        mag = ev.get("magnitude") or 0.5
        applied = {}
        for tag in ev.get("tags", []):
            eff = MECH["tag_effects"].get(tag)
            if not eff:
                continue
            for k, v in eff.items():
                if k == "scar":
                    scars.add(v)
                    continue
                # Craft rebuilds slowly once the tradition is lost.
                if k == "artisanry" and v > 0 and "craft_lost" in scars:
                    v *= MECH["scars"]["craft_lost"]["artisanry_regrowth"]
                res[k] = res.get(k, 0) + v * mag
                applied[k] = round(applied.get(k, 0) + v * mag, 1)
        clamp(res, scars)
        if applied:
            log.append({"year": ev["year"], "title": ev["title"],
                        "deltas": applied, "after": dict(res)})
    # Carry the state forward to the present so a timeline ending in 1970 is not
    # compared against one ending in 2020.
    if prev_year is not None:
        recover(res, 2026 - prev_year, scars)
        clamp(res, scars)
    return {"final": res, "scars": sorted(scars), "log": log}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="game.simulate")
    ap.add_argument("--state")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--compare", action="store_true")
    ap.add_argument("--trace", action="store_true")
    a = ap.parse_args(argv)

    names = {e["id"]: e["name"] for e in json.loads((REGISTRY / "states.json").read_text())["entities"]}
    files = sorted(HISTORIA.glob("*.json")) if (a.all or a.compare) else [HISTORIA / f"{a.state}.json"]
    if not a.all and not a.compare and not a.state:
        ap.error("pass --state <id>, --all, or --compare")

    runs = {}
    for f in files:
        doc = json.loads(f.read_text())
        runs[doc["state_id"]] = replay(doc)

    if a.trace:
        for sid, r in runs.items():
            print(f"\n{names.get(sid, sid)}")
            for step in r["log"]:
                d = " ".join(f"{k}{v:+g}" for k, v in step["deltas"].items())
                print(f"  {step['year']:>6}  {step['title'][:46]:<46} {d}")

    keys = ["treasury", "grain", "labour", "artisanry", "literacy", "legitimacy", "infrastructure", "unrest", "water"]
    print(f"\n{'STATE':<14} " + " ".join(f"{k[:5]:>6}" for k in keys) + "   SCARS")
    print("-" * 104)
    for sid, r in sorted(runs.items()):
        row = " ".join(f"{r['final'][k]:>6g}" for k in keys)
        print(f"{names.get(sid, sid):<14} {row}   {', '.join(r['scars']) or '-'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
