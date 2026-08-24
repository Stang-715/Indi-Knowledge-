# Handoff — Indi-Knowledge / *Paramountcy*

Everything built so far, what each file is, and where to pick up. Written so a fresh
session can start from this document alone.

**Repo:** `Stang-715/Indi-Knowledge-` · branch `claude/amazing-hopper-q6g8s7`
**Live base map:** https://claude.ai/code/artifact/5dab2ff0-b275-492e-9927-b1225ae2f789
**Live UI kit:** https://claude.ai/code/artifact/4aac5251-73ad-4bce-8f9f-a677f7a3dde1

---

## 1. What the game is, in five sentences

An India-only grand strategy game, 6000 BCE → 1947, pegged to Victoria 3 but with its
centre of gravity in the deep past — **82% of a 210-hour campaign falls before 1300 CE.**
Its first economy is not goods but **stories**: for roughly three thousand years there is
no money, and a storyteller recites and is fed in grain. Works are economic entities that
are never deleted, only reduced to zero surviving carriers, so the corpus is maintained
infrastructure with running costs and **neglect destroys more of it than any invasion**.
Sovereignty is a **stack, not a colour** — holder, revenue claimant, tributary superior,
paramount — because for most of Indian history rule was graded and overlapping. The map
is generated from 138 KB of control data rather than shipped as an image.

---

## 2. Every file

### Design documents — read in this order

| File | What it is |
|---|---|
| `docs/00-plan.md` | **Master plan.** Seventeen-rung spatial ladder, the survey thesis, legal constraints, system structure, roadmap, platform decision |
| `docs/02-data-spine.md` | Provenance tiers, constraint fitting, datapacks, saves that survive a data pour, source licensing |
| `docs/03-simulation.md` | Pops on four axes, land revenue systems, India's goods chains, paramountcy, the Drain |
| `docs/04-eras.md` | Thirteen eras, era-swappable extraction and sovereignty models, why Victoria 3's machinery fits only 3% of the timeline |
| `docs/05-knowledge-economy.md` | **The core system.** Works as goods with strange physics, the grain standard, recopying upkeep, redundancy, the commentary economy |
| `docs/06-pillars-and-campaign.md` | Eight development pillars, within-India constraint, invasion schedule, win condition |
| `docs/07-timeline.md` | **787 events across sixteen eras.** Information architecture, 210-hour cadence, twelve regional spines, event-card spec |
| `docs/08-visual-design.md` | **The design MD.** The Cartographer's Table — palette, lighting rig, 18 UI components, sprite manifest, generation pipeline |
| `docs/09-procedural-map.md` | The base map: skeleton-plus-field approach, terrain types, the water model |
| `docs/map-density-and-animation-spec.md` | The original Victoria 3 density comparison and web performance criteria |

### Data — all generated and validated

| File | Contents |
|---|---|
| `data/polities/polities.json` | **146 polities, 70 rule relations, 13 eras.** Who ruled whom, 4000 BCE → now |
| `data/corpus/works.json` | **89 works, 11 catastrophes, 8 pillars.** Validated acyclic derivation graph |
| `data/skeleton/india-skeleton.json` | Coastline, rivers, lakes, India and neighbour outlines at 5 LODs |
| `data/skeleton/orography.json` | **103 elevation control points + 17 typed terrain regions.** The whole landform model, ~16 KB |
| `data/skeleton/bundle.json` | LOD 4 packed base64 for the renderer |

### Schemas

`packages/schema/` — `entity`, `datapack`, `polity`, `work`, `scale-ladder`

### Tools — every number in the docs is recomputable

```
node tools/density-calc.mjs     # the Victoria 3 baseline
node tools/scale-ladder.mjs     # the seventeen spatial rungs
node tools/build-polities.mjs   # rebuild + validate the sovereignty spine
node tools/build-corpus.mjs     # rebuild + validate the corpus
node tools/build-skeleton.mjs   # clip Natural Earth to India, simplify to 5 LODs
node tools/bundle-skeleton.mjs 4
node tools/build-basemap.mjs    # → dist/basemap.html
```

### Apps

- `apps/basemap/index.html` — the procedural map renderer (source, with a data placeholder)
- `dist/basemap.html` — built, self-contained, opens in any browser

---

## 3. Decisions locked

| | |
|---|---|
| Period | 6000 BCE → **1947** (Independence) |
| Campaign length | **210 hours**, ~127 s per in-game year |
| Weighting | **82% of playtime before 1300 CE**; Mauryan era is the densest in the game |
| Platform | **Desktop-first** (Rust + wgpu), web build as the demo |
| Core system | The knowledge economy — not the map |
| Flagship campaign | A princely state under paramountcy |
| Base map | Procedural: shape is data, detail is code |
| Art direction | The Cartographer's Table — the world as a made object on a survey sheet |

## 4. Two legal findings that shaped the architecture

1. **India's Geospatial Data Guidelines 2021** restrict data finer than 1 m. Ladder levels
   15–16 are 0.41 m and 0.21 m, so they are **procedural by design, never shipped as
   data**. The legal line and the technical line turned out to be the same line.
2. **Boundary depiction is a criminal matter** under the Criminal Law (Amendment) Act
   1990. The base map therefore uses **land polygons, not country polygons**, and carries
   no international boundary at all. The India outline exists only as a visual emphasis
   mask and **must be replaced with Survey of India geometry before any India release.**

## 5. Where to pick up

**Unbuilt, and the next thing:** the **trade and export system**. Barter before coinage,
one-click export of knowledge and spices, and the goods list itself growing as history
brings new things to the map — paper ~1350 (which halves recopying cost), then chilli,
potato, tomato, maize, tobacco after 1498.

**One open design question:** should exporting a text also create a copy of it abroad? If
yes, trade income and corpus survival become a single decision — which is what actually
happened, since the *Abhidharmakosha* survives only because it reached Tibet. If no, they
stay two competing budgets.

**Also outstanding**
- ~363 more timeline events to reach the ~1,150 target; eras 1, 2 and 5 fail the density check
- Sprite generation — manifest and prompt template are written, nothing generated (spends Magnific credits)
- P0 prototype has two unverified fixes: map redraw during play, and site-label collision
- The historian and archaeologist review — now a hiring requirement, not a footnote

## 6. Known faults in the base map

- Karakoram reads as detached capsules; Tibet is still somewhat disc-like
- No coastline detail below ~660 m — the procedural sub-LOD layer is specified, not built
- Height and rainfall run on the main thread; they belong in a worker
- Neighbours are computed in full then desaturated — correct-looking but wasteful
