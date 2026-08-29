"""Check that committed data/ matches what the pipeline regenerates.

A plain `git diff data/` cannot do this: every build stamps a fresh `generated_at` and
`retrieved`, so the diff is never empty and the check would cry wolf on every run. This
strips volatile fields and compares the content that actually matters.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VOLATILE = {"generated_at", "retrieved"}


def strip(o):
    if isinstance(o, dict):
        return {k: strip(v) for k, v in o.items() if k not in VOLATILE}
    if isinstance(o, list):
        return [strip(v) for v in o]
    return o


def committed(rel: str):
    r = subprocess.run(["git", "show", f"HEAD:{rel}"], capture_output=True, text=True, cwd=ROOT)
    return json.loads(r.stdout) if r.returncode == 0 else None


drift = []
for p in sorted((ROOT / "data").rglob("*.json")):
    rel = str(p.relative_to(ROOT))
    old = committed(rel)
    if old is None:
        print(f"  NEW  {rel}")
        continue
    if strip(old) != strip(json.loads(p.read_text())):
        drift.append(rel)

for d in drift:
    print(f"  DRIFT {d}")
print(f"\n{'no drift' if not drift else f'{len(drift)} file(s) drifted -- run `make all` and commit'}")
sys.exit(1 if drift else 0)
