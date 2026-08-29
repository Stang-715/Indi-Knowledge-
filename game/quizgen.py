"""Generate quiz and trivia items directly from Historia + the pattern engine.

Nothing here is hand-written per question: the corpus is the question bank. Add a state
to Historia and its quizzes exist the same day.

Eligibility rules -- these are ethical, not technical, and they are enforced here rather
than left to whoever writes content later:
  * never quiz a `contested` event (historians disagree; there is no answer key)
  * never quiz below the `quizzable` confidence band
  * never quiz an event flagged `sensitive` (communal violence, massacres, insurgency
    casualties). Those belong in the reading rail, not in a scored game.
"""
import argparse, json, random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HISTORIA = ROOT / "data" / "historia"
REGISTRY = ROOT / "data" / "registry"
PATTERNS = ROOT / "data" / "patterns" / "patterns.json"

TAX = json.loads((REGISTRY / "taxonomy.json").read_text())
QUIZ_FLOOR = min(b["min"] for b in TAX["confidence_bands"] if b["quizzable"])
CATS = {c["id"]: c["label"] for c in TAX["categories"]}


def eligible(ev: dict) -> bool:
    if ev.get("contested"):
        return False
    if ev["confidence"] < QUIZ_FLOOR:
        return False
    if "sensitive" in ev.get("review", {}).get("flags", []):
        return False
    return True


def yr(y: int) -> str:
    return f"{abs(y)} BCE" if y < 0 else str(y)


def load():
    docs = {p.stem: json.loads(p.read_text()) for p in sorted(HISTORIA.glob("*.json"))}
    names = {e["id"]: e["name"] for e in json.loads((REGISTRY / "states.json").read_text())["entities"]}
    pats = json.loads(PATTERNS.read_text()) if PATTERNS.exists() else {"promoted_to_rules": [], "local_patterns": []}
    return docs, names, pats


# ------------------------------------------------------------- generators

def q_year(ev, name, rng):
    """Distractors are drawn NEAR the true year -- a plausible-looking spread teaches
    something; a spread of 1200 years is a giveaway, not a question."""
    spread = {"exact": 12, "decade": 40, "century": 200}.get(ev["year_precision"], 60)
    opts = {ev["year"]}
    while len(opts) < 4:
        d = rng.choice([-1, 1]) * rng.randint(2, spread)
        cand = ev["year"] + d
        if cand != 0:
            opts.add(cand)
    return {
        "type": "year_of", "difficulty": "medium" if spread <= 12 else "hard",
        "state": name, "era": ev["era"],
        "prompt": f"In which year did this happen in {name} — “{ev['title']}”?",
        "options": [yr(o) for o in sorted(opts)],
        "answer": yr(ev["year"]),
        "explain": ev["summary"][:280],
        "source_event": ev["id"],
    }


def q_which_state(ev, name, other_names, rng):
    opts = [name] + rng.sample([n for n in other_names if n != name], 3)
    rng.shuffle(opts)
    return {
        "type": "which_state", "difficulty": "easy",
        "state": name, "era": ev["era"],
        "prompt": f"Which state's history includes this? “{ev['title']}” ({yr(ev['year'])})",
        "options": opts, "answer": name,
        "explain": ev["summary"][:280],
        "source_event": ev["id"],
    }


def q_order(evs, name, rng):
    """Chronological ordering. Harder and far better at building a sense of period
    than any single-fact recall question."""
    picked = rng.sample(evs, 4)
    correct = [e["title"] for e in sorted(picked, key=lambda e: e["year"])]
    shuffled = correct[:]
    while shuffled == correct:
        rng.shuffle(shuffled)
    return {
        "type": "sequence", "difficulty": "hard",
        "state": name, "era": None,
        "prompt": f"Put these four moments in {name}'s history in order, earliest first.",
        "options": shuffled, "answer": correct,
        "explain": " → ".join(f"{yr(e['year'])} {e['title']}" for e in sorted(picked, key=lambda e: e["year"])),
        "source_event": [e["id"] for e in picked],
    }


def q_category(ev, name, rng):
    wrong = rng.sample([c for c in CATS if c != ev["category"]], 3)
    opts = [CATS[c] for c in [ev["category"]] + wrong]
    rng.shuffle(opts)
    return {
        "type": "category", "difficulty": "easy",
        "state": name, "era": ev["era"],
        "prompt": f"“{ev['title']}” ({name}, {yr(ev['year'])}) — which strand of Historia does this belong to?",
        "options": opts, "answer": CATS[ev["category"]],
        "explain": ev["summary"][:280],
        "source_event": ev["id"],
    }


def _index(docs):
    return {e["id"]: e for d in docs.values() for e in d["events"]}


def _chain_ok(rec, idx) -> bool:
    """A pattern question quotes its whole chain back to the player, so EVERY event in
    the chain must clear the same eligibility bar as a directly-quizzed one. Filtering
    only the distractor pool let Operation Blue Star and the Jharkhand insurgency
    surface as quiz content."""
    for st in rec["best"]["stages"]:
        ev = idx.get(st["event_id"])
        if ev is None or not eligible(ev):
            return False
    return True


def q_what_followed(rec, docs, names, rng, idx):
    """The pattern-derived question -- the one that teaches causation rather than dates.
    Distractors are the *terminal stages of other motifs*, so every wrong answer is a real
    historical outcome that simply did not follow from this cause."""
    if not _chain_ok(rec, idx):
        return None
    best = rec["best"]
    if len(best["stages"]) < 2:
        return None
    cause, effect = best["stages"][0], best["stages"][-1]
    state = names.get(best["state_id"], best["state_id"])

    pool = []
    for doc in docs.values():
        for e in doc["events"]:
            if eligible(e) and e["id"] != effect["event_id"] and e["category"] == "development":
                pool.append(e["title"])
    if len(pool) < 3:
        return None
    opts = [effect["title"]] + rng.sample(sorted(set(pool)), 3)
    rng.shuffle(opts)
    return {
        "type": "what_followed", "difficulty": "hard",
        "state": state, "era": None, "pattern": rec["motif_id"],
        "prompt": (f"In {state}, {yr(cause['year'])}: “{cause['title']}”. "
                   f"Following the “{rec['label']}” pattern, what followed by {yr(effect['year'])}?"),
        "options": opts, "answer": effect["title"],
        "explain": f"{rec['thesis']}  Chain: " +
                   " → ".join(f"{yr(s['year'])} {s['title']}" for s in best["stages"]),
        "source_event": [s["event_id"] for s in best["stages"]],
    }


def q_pattern_transfer(rec, names, rng, idx):
    """Show a chain in one state, ask which other state repeated it. This is the
    question the whole pattern system exists to make possible."""
    if rec["n_states"] < 2 or not _chain_ok(rec, idx):
        return None
    a, b = rng.sample(rec["states"], 2)
    wrong = [n for sid, n in names.items() if sid not in rec["states"]]
    if len(wrong) < 3:
        return None
    opts = [names[b]] + rng.sample(sorted(wrong), 3)
    rng.shuffle(opts)
    return {
        "type": "pattern_transfer", "difficulty": "expert",
        "state": names[a], "era": None, "pattern": rec["motif_id"],
        "prompt": (f"{names[a]} shows the “{rec['label']}” pattern — {rec['thesis'].split('.')[0].lower()}. "
                   f"Which of these states repeats the same pattern?"),
        "options": opts, "answer": names[b],
        "explain": f"Confirmed in: {', '.join(names[s] for s in rec['states'])}.",
        "source_event": None,
    }


# ------------------------------------------------------------------ build

def build(seed: int = 7, per_state: int = 6):
    rng = random.Random(seed)
    docs, names, pats = load()
    idx = _index(docs)
    all_names = [names.get(s, s) for s in docs]
    out = []

    for sid, doc in docs.items():
        name = names.get(sid, sid)
        ok = [e for e in doc["events"] if eligible(e)]
        if len(ok) < 5:
            continue
        picks = rng.sample(ok, min(per_state, len(ok)))
        for i, ev in enumerate(picks):
            if i % 3 == 0:
                out.append(q_year(ev, name, rng))
            elif i % 3 == 1:
                out.append(q_which_state(ev, name, all_names, rng))
            else:
                out.append(q_category(ev, name, rng))
        if len(ok) >= 4:
            out.append(q_order(ok, name, rng))

    for rec in pats.get("promoted_to_rules", []) + pats.get("local_patterns", []):
        q = q_what_followed(rec, docs, names, rng, idx)
        if q:
            out.append(q)
    for rec in pats.get("promoted_to_rules", []):
        q = q_pattern_transfer(rec, names, rng, idx)
        if q:
            out.append(q)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(prog="game.quizgen")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--per-state", type=int, default=6)
    ap.add_argument("--show", type=int, default=5)
    ap.add_argument("--out", default="data/quiz/questions.json")
    a = ap.parse_args(argv)

    qs = build(a.seed, a.per_state)
    p = ROOT / a.out
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps({"count": len(qs), "questions": qs}, indent=2, ensure_ascii=False))

    by_type: dict[str, int] = {}
    for q in qs:
        by_type[q["type"]] = by_type.get(q["type"], 0) + 1
    print(f"{len(qs)} questions generated -> {a.out}")
    for t, n in sorted(by_type.items(), key=lambda x: -x[1]):
        print(f"   {t:<18} {n}")
    print()
    for q in qs[:a.show]:
        print(f"  [{q['type']}/{q['difficulty']}] {q['prompt']}")
        for o in q["options"]:
            if isinstance(q["answer"], list):
                mark = f"{q['answer'].index(o) + 1}."
            else:
                mark = " * " if o == q["answer"] else "   "
            print(f"      {mark} {o}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
