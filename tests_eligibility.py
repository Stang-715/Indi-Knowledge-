"""Content-safety regression test.

The rule this enforces: no contested and no `sensitive` event may ever reach a scored
quiz item -- not as an answer, not as a distractor, and not inside a pattern chain
quoted back to the player. Communal violence, massacres and insurgency casualties
belong in the reading rail with context, never in a game with a score attached.

This is a test rather than a review note because the quiz bank is regenerated on every
ingest, and a rule that is not executable will not survive contact with new data.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
events = {}
for f in (ROOT / "data/historia").glob("*.json"):
    for e in json.loads(f.read_text())["events"]:
        events[e["id"]] = e

barred = {i for i, e in events.items()
          if e["contested"] or "sensitive" in e["review"]["flags"]}

qs = json.loads((ROOT / "data/quiz/questions.json").read_text())["questions"]
referenced = set()
for q in qs:
    src = q.get("source_event")
    if isinstance(src, list):
        referenced |= set(src)
    elif src:
        referenced.add(src)

leaked = referenced & barred

# Titles can also leak in as distractor options without being cited as source_event.
barred_titles = {events[i]["title"] for i in barred}
option_leak = []
for q in qs:
    for o in q["options"]:
        if o in barred_titles:
            option_leak.append((q["type"], o))

print(f"{len(events)} events, {len(barred)} barred (contested or sensitive)")
print(f"{len(qs)} questions referencing {len(referenced)} events")
print(f"  barred events cited as sources : {len(leaked)}")
print(f"  barred titles used as options  : {len(option_leak)}")
for t, o in option_leak[:5]:
    print(f"      {t}: {o}")
for i in sorted(leaked)[:5]:
    print(f"      cited: {i} -- {events[i]['title']}")

ok = not leaked and not option_leak
print("\nPASS" if ok else "\nFAIL")
sys.exit(0 if ok else 1)
