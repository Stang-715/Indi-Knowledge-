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
