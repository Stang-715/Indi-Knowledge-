"""Motif matcher.

Finds ordered, time-windowed instances of each motif inside a state's Historia, scores
them, then looks across states to decide which motifs are general enough to become
game rules.

Scoring, in words:
  completeness -- fraction of stages actually matched (optional stages count only if hit)
  tightness    -- how comfortably the gaps sit inside their windows; a chain that only
                  just squeaks in is weaker evidence than one that is causally snug
  evidence     -- mean confidence of the matched events
  strength     -- their weighted product

A motif is PROMOTED to a game rule when it recurs in >= MIN_STATES states with mean
strength >= MIN_STRENGTH. Anything below that stays a curiosity: a single state's
story, not a law of the world.
"""
import json
from dataclasses import dataclass, field, asdict
from pathlib import Path

from .motifs import MOTIFS

ROOT = Path(__file__).resolve().parent.parent
HISTORIA = ROOT / "data" / "historia"
REGISTRY = ROOT / "data" / "registry"

MIN_STATES = 2
MIN_STRENGTH = 0.35
W_COMPLETE, W_TIGHT, W_EVIDENCE = 0.45, 0.20, 0.35
MAX_COMPOUNDS = 1          # at most one stage pair may be folded into a single event
MIN_DISTINCT_EVENTS = 2    # a chain resting on one event is not a chain


@dataclass
class Match:
    motif_id: str
    motif_label: str
    state_id: str
    stages: list = field(default_factory=list)   # [{stage, event_id, year, title}]
    span: tuple = (0, 0)
    completeness: float = 0.0
    tightness: float = 0.0
    evidence: float = 0.0
    strength: float = 0.0
    skipped: list = field(default_factory=list)


def _hits(event: dict, stage: dict) -> bool:
    tags = set(event.get("tags", []))
    if stage.get("category") and event["category"] != stage["category"]:
        return False
    if stage.get("all_tags") and not set(stage["all_tags"]) <= tags:
        return False
    any_tags = stage.get("any_tags")
    if any_tags and not (tags & set(any_tags)):
        return False
    return True


def _candidates(events, from_idx, cursor_year, window, stage, cap=5):
    out = []
    for k in range(from_idx, len(events)):
        ev = events[k]
        if ev["year"] - cursor_year > window:
            break
        if ev["year"] < cursor_year:
            continue
        if _hits(ev, stage):
            out.append((k, ev))
            if len(out) >= cap:
                break
    return out


def match_motif(motif: dict, state: dict, endowments: set[str]) -> list[Match]:
    """Search, not a greedy walk.

    Two things a greedy walk got wrong and this does not:

    1. OPTIONAL STAGES MUST BACKTRACK. Greedily filling an optional stage can consume
       the very event a later required stage needs -- which is exactly how Bengal
       1757 -> 1765 -> 1770 was being missed, the optional 'shock' stage eating the
       1770 famine. We branch on both taking and skipping every optional stage.

    2. COMPOUND EVENTS. Summarised history routinely records cause and effect in one
       sentence ('Partition; ten million crossed the border'). One event may therefore
       satisfy two consecutive stages -- but it is weaker evidence than two
       independently attested events, so a compound stage counts half.

    Branching is capped at `cap` candidates per stage, which keeps the search linear in
    practice while still escaping the greedy trap.
    """
    need = motif.get("requires_endowment")
    if need and not (endowments & set(need)):
        return []

    events = sorted(state["events"], key=lambda e: e["year"])
    stages = motif["stages"]

    def walk(si, ei, cursor, prev_idx, chain, gaps, compounds):
        """-> best (score, chain, gaps, compounds, skipped) from stage si onward."""
        if si == len(stages):
            if not _valid(chain, compounds):
                return None
            return (_score(chain, gaps, compounds), chain, gaps, compounds, [])

        stage = stages[si]
        window = stage.get("max_gap", 100)
        best = None

        for k, ev in _candidates(events, ei, cursor, window, stage):
            gap = max(ev["year"] - cursor, 0)
            r = walk(si + 1, k + 1, ev.get("year_end") or ev["year"], k,
                     chain + [{"stage": stage["name"], "event_id": ev["id"],
                               "year": ev["year"], "title": ev["title"],
                               "confidence": ev["confidence"], "compound": False}],
                     gaps + [gap / window if window else 0.0], compounds)
            if r and (best is None or r[0] > best[0]):
                best = r

        # Compound: the event already matched by the previous stage also satisfies this one.
        if prev_idx is not None and compounds < MAX_COMPOUNDS and _hits(events[prev_idx], stage):
            ev = events[prev_idx]
            r = walk(si + 1, prev_idx + 1, ev.get("year_end") or ev["year"], prev_idx,
                     chain + [{"stage": stage["name"], "event_id": ev["id"],
                               "year": ev["year"], "title": ev["title"],
                               "confidence": ev["confidence"], "compound": True}],
                     gaps + [0.0], compounds + 1)
            if r and (best is None or r[0] > best[0]):
                best = r

        if stage.get("optional"):
            r = walk(si + 1, ei, cursor, prev_idx, chain, gaps, compounds)
            if r:
                score, ch, g, c, sk = r
                r = (score, ch, g, c, [stage["name"]] + sk)
                if best is None or r[0] > best[0]:
                    best = r

        return best

    def _valid(chain, compounds):
        return (compounds <= MAX_COMPOUNDS
                and len({c["event_id"] for c in chain}) >= MIN_DISTINCT_EVENTS)

    def _score(chain, gaps, compounds):
        if not chain:
            return 0.0
        credit = len(chain) - 0.5 * compounds
        completeness = min(credit / len(stages), 1.0)
        tightness = 1.0 - (sum(gaps) / len(gaps)) if gaps else 1.0
        evidence = sum(c["confidence"] for c in chain) / len(chain)
        return round(W_COMPLETE * completeness + W_TIGHT * tightness + W_EVIDENCE * evidence, 3)

    out, used = [], set()
    for i, start in enumerate(events):
        if not _hits(start, stages[0]) or start["id"] in used:
            continue
        r = walk(1, i + 1, start.get("year_end") or start["year"], i,
                 [{"stage": stages[0]["name"], "event_id": start["id"],
                   "year": start["year"], "title": start["title"],
                   "confidence": start["confidence"], "compound": False}], [], 0)
        if not r:
            continue
        score, chain, gaps, compounds, skipped = r
        credit = len(chain) - 0.5 * compounds
        out.append(Match(
            motif_id=motif["id"], motif_label=motif["label"], state_id=state["state_id"],
            stages=chain, span=(chain[0]["year"], chain[-1]["year"]),
            completeness=round(min(credit / len(stages), 1.0), 3),
            tightness=round(1.0 - (sum(gaps) / len(gaps)) if gaps else 1.0, 3),
            evidence=round(sum(c["confidence"] for c in chain) / len(chain), 3),
            strength=score, skipped=skipped,
        ))
        used.add(start["id"])
    return out


def load_states() -> tuple[list[dict], dict]:
    docs = [json.loads(p.read_text()) for p in sorted(HISTORIA.glob("*.json"))]
    reg = {e["id"]: e for e in json.loads((REGISTRY / "states.json").read_text())["entities"]}
    return docs, reg


def run() -> dict:
    docs, reg = load_states()
    matches: list[Match] = []
    for doc in docs:
        endow = set(reg.get(doc["state_id"], {}).get("endowments", []))
        for motif in MOTIFS:
            matches.extend(match_motif(motif, doc, endow))

    by_motif: dict[str, list[Match]] = {}
    for m in matches:
        by_motif.setdefault(m.motif_id, []).append(m)

    promoted, local = [], []
    for motif in MOTIFS:
        ms = by_motif.get(motif["id"], [])
        if not ms:
            continue
        states = sorted({m.state_id for m in ms})
        mean = round(sum(m.strength for m in ms) / len(ms), 3)
        rec = {
            "motif_id": motif["id"], "label": motif["label"], "thesis": motif["thesis"],
            "game_rule": motif["game_rule"],
            "states": states, "n_states": len(states), "n_instances": len(ms),
            "mean_strength": mean,
            "best": asdict(max(ms, key=lambda m: m.strength)),
        }
        (promoted if (len(states) >= MIN_STATES and mean >= MIN_STRENGTH) else local).append(rec)

    promoted.sort(key=lambda r: (-r["n_states"], -r["mean_strength"]))
    local.sort(key=lambda r: -r["mean_strength"])
    return {
        "thresholds": {"min_states": MIN_STATES, "min_strength": MIN_STRENGTH},
        "n_matches": len(matches),
        "promoted_to_rules": promoted,
        "local_patterns": local,
        "all_matches": [asdict(m) for m in matches],
    }
