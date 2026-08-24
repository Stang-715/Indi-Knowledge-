# Indi-Knowledge

An India-only grand strategy game at seventeen scales — from the national outline down
to individual buildings. Working title: **Paramountcy**. Pegged to Victoria 3.

Victoria 3 renders the whole world at 4,860 m/px. This renders one country, from
13.4 km/px down to 21 cm/px — the deepest rung is **562 million times** Victoria 3's
areal density. Rasterising that rung would take 563 TB; streaming it as vector plus
procedural generation takes about 3 MB per screen. That gap is the architecture.

The map ships mostly empty, and that is the design: in 1836 India was not surveyed
either. Data completeness *is* the fog of war, and pouring in real data makes the world
truer without a code change or a broken save.

## Docs

| | |
|---|---|
| [**00 · The Replan**](docs/00-plan.md) | Scale ladder, the survey thesis, legal constraints, system structure, roadmap. **Start here.** |
| [02 · The Data Spine](docs/02-data-spine.md) | Provenance tiers, constraint fitting, datapacks, saves that survive a data pour, source licensing |
| [03 · The Simulation](docs/03-simulation.md) | Pops on four axes, land revenue, India's goods chains, paramountcy, the Drain |
| [Map density & animation](docs/map-density-and-animation-spec.md) | The original Victoria 3 density comparison and the web performance criteria |

## Schemas

- [`packages/schema/entity.schema.json`](packages/schema/entity.schema.json) — world entity with per-field provenance
- [`packages/schema/datapack.schema.json`](packages/schema/datapack.schema.json) — versioned data bundle manifest
- [`packages/schema/scale-ladder.json`](packages/schema/scale-ladder.json) — the seventeen rungs, generated

## Tools

```
node tools/scale-ladder.mjs    # the seventeen rungs, resolutions, and streaming budgets
node tools/density-calc.mjs    # the Victoria 3 baseline every figure is measured against
```
