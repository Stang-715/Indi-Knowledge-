# Indi-Knowledge — Historia

**A map-first India state-builder where the real history is the rulebook.**

Click a state → the map isolates to it → a right-hand rail opens where you read that
state's history year by year, across eight strands: wars, legislature, crafts, key
highlights, the development journey, culture, disasters, and movements. Then you govern
that state — and the patterns the real history contains are the rules the simulation
plays by.

---

## What is here

| Piece | What it does | Status |
|---|---|---|
| **Registries** | 36 entities (28 states + 8 UTs), 14 layered eras ancient→present, 81-tag taxonomy | complete |
| **Schema** | The Historia event contract everything validates against | complete |
| **Scrapers** | Wikipedia + Wikidata ingest, cached, rate-limited, idempotent | **written, not yet run** — see below |
| **Seed corpus** | 103 hand-authored events across 6 states | complete, **pending verification** |
| **Pattern engine** | 12 causal motifs; matches, scores, promotes them to game rules | complete |
| **Quiz generator** | 6 question types, all generated from the corpus | complete — 54 questions |
| **Simulation** | Historical replay for calibration and Divergence scoring | complete |
| **Design** | Gameplay, layers, UI spec | complete |

```
make install && make all
```

---

## The scrapers have not been run

The environment this was built in blocks `en.wikipedia.org` and `query.wikidata.org` at
the egress proxy (HTTP 403). The pipeline is written, its failure path is tested, and it
reports the block with an actionable message:

```
$ make ingest-dry
1 state(s) blocked by network policy.
  Egress proxy refused https://en.wikipedia.org/w/api.php. This environment's network
  policy likely does not allow this host. Run the ingest where the host is reachable,
  or pre-populate cache/ from a machine that can reach it.
```

Run `make ingest` anywhere with network access and it will populate all 36 entities.
Everything downstream — patterns, quizzes, simulation — already works, because the seed
corpus stands in for the scraped data with the same schema.

**The seed corpus is unverified.** 103 events written from general historical knowledge
so the rest of the system could be tested on real content. See [`seed/README.md`](seed/README.md).

---

## The pattern engine

The interesting part. `patterns/motifs.py` defines causal shapes — ordered, time-windowed
sequences of tagged events. The engine finds them in each state's timeline, scores each
match on completeness, tightness and evidence, then asks whether the motif **recurs
across enough states to be promoted to a game rule**.

```
$ make patterns

PROMOTED TO GAME RULES  (recurs in >=2 states, mean strength >=0.35)

  Identity Becomes a Border          5 states   str=0.892
      1937  The anti-Hindi agitations
      1967  The DMK takes power
      1969  Madras State is renamed Tamil Nadu
   -> RULE: Governing a population whose language or identity you do not share adds
      +1 Unrest/turn, compounding. At 10 the territory secedes.

  The Revenue Ratchet                2 states   str=0.819
      1757  Battle of Plassey
      1765  The Company obtains the Diwani of Bengal
      1770  The Great Bengal Famine
   -> RULE: Revenue set to Fixed gives +2 Treasury/turn and removes your harvest-failure
      buffer. A drought while Fixed triggers Famine: -30% population, permanent scar.

LOCAL PATTERNS  (single-state so far -- not yet general enough to be a rule)
  Insurgency and Accord   punjab        0.961
  The Long Dividend       kerala        0.913
  The Resource Curse      jharkhand     0.889
  ... 7 more
```

With only six states seeded, **two motifs generalise and ten do not**. That is the
promotion threshold doing its job, not a shortfall: a pattern seen once is a state's
story, not a law of the world. It also tells you exactly which states to ingest next —
ingest Bihar and Odisha and the Resource Curse will cross the threshold.

---

## Calibration: does the model reproduce reality?

`make simulate` replays each state's *real* history through the simulation. If replaying
what actually happened yields a state that looks nothing like the real one, the mechanics
are wrong. With no per-state tuning:

```
STATE           treas  grain  labou  artis  liter  legit  infra  unres  water   SCARS
Gujarat          74.6   49.5     19   81.2     10   35.7   53.6    9.6   76.7   -
Jharkhand        65.7   50.4   53.1   16.9   12.6     23   73.2   19.3   76.7   insurgency_zone
Kerala           18.4   42.4   43.1   45.8   68.2     68   19.4    2.6     80   external_dependency
Punjab           18.9   43.4   16.6   45.9   14.9   19.2   27.6   16.7   20.2   insurgency_zone, severed_border
Tamil Nadu       52.6   35.2   43.7   83.8   45.6   30.2   19.5    8.5   72.6   famine_memory
West Bengal      17.3   54.9   35.5      0     10      8   25.1   18.3     80   craft_lost, famine_memory, ...
```

Kerala tops literacy and legitimacy with the lowest unrest and an `external_dependency`
scar from Gulf remittances. Punjab's water table sits at 20 while everyone else is near
80. Jharkhand has the highest infrastructure and treasury alongside the lowest legitimacy
and artisanry — the resource curse, falling out of the events themselves.

---

## Quizzes are generated, not written

54 questions from 103 events, in six types. The two that matter test **causation**:

> **what_followed** — *In Tamil Nadu, 1937: "The anti-Hindi agitations". Following the
> "Identity Becomes a Border" pattern, what followed by 1969?*
> Distractors are real outcomes that simply did not follow from this cause.

> **pattern_transfer** — *Kerala shows the "Long Dividend" pattern. Which of these states
> repeats it?*

Add a state to Historia and its quizzes exist the same day.

### Content safety is a test, not a policy

`make test` enforces, in code, that no `contested` and no `sensitive` event ever reaches
a scored quiz — not as answer, distractor, or inside a quoted pattern chain. It has
already caught one real leak (Operation Blue Star surfacing through a pattern question).
Sensitive history belongs in the reading rail with context, never in a game with a score.

---

## Layout

```
data/registry/     states, eras, taxonomy
data/historia/     one timeline per state — the corpus
schema/            the event contract
scrapers/          config, polite HTTP, source adapters, normaliser, CLI
seed/              hand-authored corpus + builder
patterns/          motif library, matching engine, report
game/              mechanics, simulation, quiz generator, DESIGN.md
docs/              data model, sources & licensing, Historia UI spec
```

**Read next:** [`game/DESIGN.md`](game/DESIGN.md) for gameplay ·
[`docs/HISTORIA_VIEW.md`](docs/HISTORIA_VIEW.md) for the UI ·
[`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) for the schema decisions ·
[`docs/SOURCES.md`](docs/SOURCES.md) for licensing obligations

---

## Where this goes next

1. **Verify the seed corpus** — walk the flagged queue (10 contested, 4 sensitive, 10 low-confidence)
2. **Run the ingest** on a network-enabled box; all 36 entities
3. **Ship the Historia Codex** (Layer 1) — read-only, no simulation, validates the corpus with real readers
4. Quiz layer, then the state builder on modern eras where the data is year-dense
