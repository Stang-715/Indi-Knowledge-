# Data Model

## Files

| Path | What it holds |
|---|---|
| `data/registry/states.json` | 28 states + 8 UTs: lineage, endowments, source handles |
| `data/registry/eras.json` | 14 layered eras, ancient → present, each with its own resolution |
| `data/registry/taxonomy.json` | 8 categories, 81 controlled tags, confidence bands |
| `data/historia/<state>.json` | One timeline per state — the corpus |
| `data/patterns/patterns.json` | Motif matches, promoted rules, local patterns |
| `data/quiz/questions.json` | Generated question bank |
| `schema/historia.schema.json` | The contract everything validates against |

## Three decisions worth knowing about

**Modern states inherit their territory's history.** Telangana's Historia carries
Kakatiya Warangal and the Nizams even though the state dates from 2014. The alternative —
states appearing and dissolving as you scrub — is more accurate and much harder to play.
The `lineage` array is the audit trail, and the UI renders it, so the inheritance is
never a silent fudge.

**Eras overlap, and resolution declines with depth.** Company Raj (1757–1858) sits inside
the successor-state period (1707–1818) because both are true of Bengal in 1780. Era
lookup resolves to the *narrowest containing span*, which files Plassey under Company Raj
where a player would expect it. Each era also declares a `confidence_ceiling` — no
Mauryan event can be scored above 0.75, however well attested, because the record does
not support it.

**Tags are the type system.** Categories are what players browse; **tags** are what the
pattern engine matches on. They are a closed vocabulary in `taxonomy.json`, and both the
normaliser and the seed builder assert against it — a typo'd tag fails the build rather
than silently never matching.

## Confidence

Every event carries a score in [0,1] built from date precision, source count, source
kind, causal legibility and the era ceiling. It is deliberately conservative: it is
cheaper to flag a true event for review than to let an invented one become a quiz answer.

| Band | Readable | Quizzable |
|---|---|---|
| ≥ 0.90 verified | yes | yes |
| ≥ 0.70 corroborated | yes | yes |
| ≥ 0.50 single source | yes | **no** |
| < 0.50 needs review | **no** | no |

## Idempotent ingest

Event ids are `state.year.category.hash6`, derived from content. Re-running the ingest
merges rather than duplicates, and rows marked `human_verified` are never overwritten by
a later automated pass. Human verdicts win; automation may enrich but never overrule.
