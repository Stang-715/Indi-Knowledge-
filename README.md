# Paramountcy

An India-only grand strategy game, **6000 BCE → 1947**, with its centre of
gravity in the deep past: **82% of a 210-hour campaign falls before 1300 CE.**

Its first economy is not goods but **stories**. For roughly three thousand years
there is no money, and a storyteller recites and is fed in grain. Works are
economic entities that are never deleted, only reduced to zero surviving
carriers — so the corpus is maintained infrastructure with running costs, and
**neglect destroys more of it than any invasion.**

The map is generated from 138 KB of control data rather than shipped as an image.

## Run it

```bash
npm run serve      # → http://localhost:8420/
```

```bash
npm run campaign            # the whole campaign, as text
npm run campaign -- --gate  # the 1193 scenario: copy out, or don't
npm run campaign -- --tend --color
npm test                    # 247 tests
npm run check               # the determinism guard
```

No build step, no dependencies. Node 22+.

## The one rule

```
world = f(datapack, seed, decision_log)
```

The game never saves the world — it saves **what you did**, and replays it. A
save file is a recipe, not a photograph of the cake. Saves are kilobytes,
multiplayer needs no extra machinery, bug reports are exact, and old saves
survive new data.

The price: `packages/sim` may never call `Math.random()` and never ask what time
it is. `npm run check` fails the build if it does.

## Layout

| | |
|---|---|
| `docs/` | The design. Start with [`10-buildplan.md`](docs/10-buildplan.md), then [`HANDOFF.md`](docs/HANDOFF.md) |
| `packages/sim/` | Deterministic, headless simulation core |
| `packages/worldgen/` | Pure terrain, climate and rasterisation |
| `packages/render-realm/` | Camera, the seventeen-rung ladder, the renderer |
| `packages/ui/` | The Cartographer's Table kit and landmark sprites |
| `apps/client/` | The playable game |
| `apps/cli/` | The campaign as text |
| `data/` | 789 timeline events, 89 works, 146 polities, the map skeleton |
| `tools/` | Generators. Every number in the docs is recomputable |

## Two legal constraints that shaped the architecture

1. **India's Geospatial Data Guidelines 2021** restrict data finer than 1 m.
   Ladder levels 15–16 are 0.41 m and 0.21 m, so they are **procedural by
   design, never shipped as data.** The legal line and the technical line turned
   out to be the same line.
2. **Boundary depiction is a criminal matter** under the Criminal Law
   (Amendment) Act 1990. The base map uses land polygons, not country polygons,
   and carries no international boundary at all. The India outline exists only
   as a visual emphasis mask and **must be replaced with Survey of India
   geometry before any India release.**

## Two campaigns

**The Chola Age**, 850–1279 — the era the record actually documents, played at
village resolution on real inscriptions. Six chapters, eight objectives, and a
reckoning at the end that reports what survived and what it cost without adding
them up.

**The long campaign**, 6000 BCE – 1947 — all 7,947 years.

## Status

Both build plans are implemented and tested: 22 phases, **247 tests**. A full
campaign runs headless in 53 ms; the client paints in 0.25 s and dives from the
whole subcontinent to the streets of Thanjavur.

Not built: the ~85 generated sprite assets (procedural stand-ins hold their
place), roughly 360 more timeline events, and the historian and archaeologist
review that phases 12, 14 and 17 need before release. See `docs/HANDOFF.md` §6.

## The Atlas & the Education Layer

This repository also carries a second, self-contained app: the **India Knowledge
Map** — a research-backed atlas of 36 states and 720+ districts with nine layers
of sourced knowledge, plus a game mode where a chibi population is taught the
Bhagavad Gita, folk tales and practical skills by recitation, and literacy
decides survival. Open it at [`/index.html`](index.html) (it also runs straight
from `file://`), or read its design in
[`docs/GAME-PHASES.md`](docs/GAME-PHASES.md). Its education mechanics are being
folded into Paramountcy natively: the `people` map mode, the Teach lens, and the
`recite` decision — see `packages/sim/src/teaching.js`.

<details>
<summary>The atlas's own README</summary>

# 🇮🇳 India Knowledge Map · भारत

An interactive, research-backed knowledge atlas of India. One clickable map,
**36 states & union territories, 720+ district polygons**, and **nine layers of
knowledge** — from the NPK values in the soil to the folk tales told above it.

> Built with Claude Code — researched by a fleet of Claude agents and re-checked by a
> QC agent. Map boundaries by the Datameet community (via
> [udit-001/india-maps-data](https://github.com/udit-001/india-maps-data)); data from
> Government of India portals, ICAR, ASI, UNESCO, the GI Registry and the national
> academies. **Made in India.**

## Open it

No build step, no server, no dependencies:

1. Clone or download this repository.
2. **Double-click `index.html`.** That's it — it runs fully offline from `file://`.

(Optional) serve it instead: `python3 -m http.server` → http://localhost:8000

## The nine tabs

| # | Tab | What it maps |
|---|-----|--------------|
| 01 | 🌱 Soil Health | Soil types, NPK status, micronutrients (Zn/Fe/B/S), organic carbon, current condition, improvement recommendations, district highlights |
| 02 | 🏛️ History | Ancient → medieval → modern eras, dynasties, dated timelines, heritage sites |
| 03 | ⚖️ Governance | Statehood formation, political history, flagship policies and their district-level implementation |
| 04 | 🪷 Communities | Communities & tribes, languages, festivals, cultural history, cuisine |
| 05 | 🎨 Local Art | Art forms with their origin district/region, classical connections, status (GI/UNESCO/living/declining) |
| 06 | 🧵 Local Craft | Craft clusters, materials, GI tags, nationally recognized master craftspeople |
| 07 | 🛡️ Wars | Battles fought on each state's soil — belligerents, outcomes, consequences |
| 08 | 🕉️ Vedas | Vedic connections, shakhas & living traditions, knowledge centers, regional texts |
| 09 | 🪔 Folk Tales | Documented folk tales ("Dadi ki kahaniyan") readable in **English / हिन्दी / regional language** |
| 10 | 🏰 Heritage | UNESCO World Heritage properties and ASI-protected monuments, state by state |

## How to use

- **Click a state** → it zooms in; the side panel opens that state's dossier for the active tab.
- **Click a district** (inside a zoomed state) → district-level records where verified data exists.
- **Switch tabs** → the map re-colors (soil types, formation era, GI-craft density, lore language…).
- **◈ 3D view** → cycles flat → tilt → **3D model** (real WebGL geometry): drag to orbit a
  full 360°, scroll to zoom, ⟲⟳ or Q/E to spin, double-click to reset. Every state is a
  solid whose height encodes that tab's data, and clicking one opens a popup card.
- **⛰ Relief** (in 3D mode) → swaps data-height for **measured elevation**: the Himalaya,
  Western Ghats and the flat Gangetic plain rendered from real terrain data, hill-shaded
  from the height gradient. The legend states the vertical exaggeration.
- **Search box** jumps to any state; **Esc** returns to India.

## 🎮 Game mode — teach the population

The **🎮 Game** button in the map toolbar brings the atlas to life: a population of tiny
chibi characters wanders the map on winding footpaths between districts, and your job is
to **educate them**. The Library shelf along the bottom holds the books as cards — the
Bhagavad Gita revealed chapter by chapter, and the folk tales of the atlas. Click a card
to study its crisp recitable summary, then **hold SPACE** over the map to recite it; the
people in earshot stop and listen. Teaching raises the **literacy rate**; every new book
that appears untaught drags it down; and literacy decides survival — low literacy raises
deaths, high literacy brings births. Progress saves in your browser. The full multi-phase
design is in [docs/GAME-PHASES.md](docs/GAME-PHASES.md).

## Data integrity (the strict filter)

This is *not* an open wiki. Every entry ships with:

- `sources[]` — the actual documents/portals each fact came from (linked in the UI),
- `confidence` — high / medium / low, set honestly by the research pass,
- a pack-level `qc` stamp — a separate QC agent re-checked the compiled data pool
  and wrote [`data/qc-report.md`](data/qc-report.md).

New findings and media (videos etc.) are integrated **slowly and deliberately** through
the moderation pipeline described in [`backend/README.md`](backend/README.md) —
schema-validated, source-checked, human-approved, and committed with an audit trail.
Entries without verified data say so instead of guessing.

## Editing / contributing data

Everything is plain, readable JavaScript:

```
index.html          the app shell
css/style.css       theme (warm paper / poster look)
js/map-data.js      simplified state & district boundaries (~330 KB)
js/terrain-data.js  measured elevation heightmap + per-state mask (PNG data URIs)
js/map3d.js         WebGL 3D engine: extruded states, real relief, orbit, picking
js/map.js           map engine: projection, zoom, hover, districts
js/app.js           tabs, choropleths, panel renderers, language switcher
data/<tab>.js       one research pack per tab — the files you'd edit
data/SPEC.md        the data schema every pack follows
backend/            moderation pipeline design + contribution JSON schema
```

To fix or extend data: edit the relevant `data/<tab>.js`, keep the schema from
`data/SPEC.md` (sources required!), and open a PR — the PR review is the moderation
step for now.

## Elevation note

Relief mode uses Mapzen/Nextzen **terrarium** terrain tiles from the AWS Open Data
registry (SRTM/ETOPO derived), resampled to a regular lon/lat grid and stored as an
8-bit heightmap. Heights are real measurements; the vertical scale is exaggerated
(~×39) so relief reads at country scale — the legend says so on screen.

## Boundaries note

Map geometry is simplified community data (Datameet-derived, via udit-001/india-maps-data)
used for visualization only — not an authoritative representation of national or internal
boundaries.

## License

See [LICENSE](LICENSE).

</details>
