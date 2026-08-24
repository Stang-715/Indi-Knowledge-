# Indi-Knowledge

An India-only grand strategy game where the first economy is **stories**, not goods.
Seventeen spatial scales, thirteen historical eras — from the national outline down to
individual buildings, and from hunting and gathering to the modern republic.
Working title: **Paramountcy**. Pegged to Victoria 3. **Desktop-first, with a web demo.**

For roughly three thousand years of the campaign there is no money. A storyteller
recites, and is fed in grain. That is the whole market, and it is enough to build a
civilisation on.

Victoria 3 renders the whole world at 4,860 m/px. This renders one country, from
13.4 km/px down to 21 cm/px — the deepest rung is **562 million times** Victoria 3's
areal density. Rasterising that rung would take 563 TB; streaming it as vector plus
procedural generation takes about 3 MB per screen. That gap is the architecture.

The map ships mostly empty, and that is the design: the evidence for Indian history
varies in density by six orders of magnitude across those six thousand years. Data
completeness *is* the fog of war — a 3000 BCE map should be vague because it honestly is
— and pouring in real data makes the world truer without a code change or a broken save.

Sovereignty is stored as a **stack, not a colour**: every place at every moment has a
holder, a revenue claimant, a tributary superior and a paramount. For most of these six
thousand years those were different parties, and that gap is where the history happens.

And **books are never destroyed — carriers are.** A work is only ever reduced to zero
surviving copies, and its entry stays in your ledger forever, greyed, with its title and
author and the year it stopped existing. Palm leaf lasts about three hundred years in
this climate, so the whole corpus is infrastructure with running costs. Neglect will cost
you more works than every invasion combined. History is pre-routed, so **you can see the
fire coming** — the game is about making copies before it arrives.

## Docs

| | |
|---|---|
| [**00 · The Replan**](docs/00-plan.md) | Scale ladder, the survey thesis, legal constraints, system structure, roadmap. **Start here.** |
| [02 · The Data Spine](docs/02-data-spine.md) | Provenance tiers, constraint fitting, datapacks, saves that survive a data pour, source licensing |
| [03 · The Simulation](docs/03-simulation.md) | Pops on four axes, land revenue, India's goods chains, paramountcy, the Drain |
| [**04 · The Temporal Ladder**](docs/04-eras.md) | Thirteen eras, era-swappable extraction and sovereignty models, and why Victoria 3's machinery only fits 3% of the timeline |
| [**05 · The Knowledge Economy**](docs/05-knowledge-economy.md) | **The core system.** Works as goods with strange physics, the grain standard, recopying upkeep, redundancy against catastrophe, and the commentary economy |
| [06 · Pillars & Campaign](docs/06-pillars-and-campaign.md) | The eight development axes, the within-India constraint, the invasion schedule, and what winning means |
| [Map density & animation](docs/map-density-and-animation-spec.md) | The original Victoria 3 density comparison and the web performance criteria |

## Schemas

- [`packages/schema/entity.schema.json`](packages/schema/entity.schema.json) — world entity with per-field provenance
- [`packages/schema/datapack.schema.json`](packages/schema/datapack.schema.json) — versioned data bundle manifest
- [`packages/schema/scale-ladder.json`](packages/schema/scale-ladder.json) — the seventeen rungs, generated
- [`packages/schema/polity.schema.json`](packages/schema/polity.schema.json) — the sovereignty spine
- [`packages/schema/work.schema.json`](packages/schema/work.schema.json) — the corpus

## Data

- [`data/polities/polities.json`](data/polities/polities.json) — **who ruled whom, 4000 BCE to now.**
  146 polities, 70 rule relations in nine kinds, 13 eras. Schema-validated, confidence-tagged,
  and explicitly *not yet historian-reviewed*.
- [`data/corpus/works.json`](data/corpus/works.json) — **the corpus.** 89 works from rock art
  to the Constitution, 11 catastrophes, 8 pillars, and a validated derivation graph
  (47 roots, 42 derived works, 46 edges, no cycles).

## Tools

```
node tools/scale-ladder.mjs    # the seventeen rungs, resolutions, and streaming budgets
node tools/density-calc.mjs    # the Victoria 3 baseline every figure is measured against
node tools/build-polities.mjs  # rebuild and validate the sovereignty spine
node tools/build-corpus.mjs    # rebuild and validate the corpus and its derivation graph
```
