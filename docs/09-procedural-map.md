# The Base Map — Procedural, Not Painted

**Live:** https://claude.ai/code/artifact/9083912f-b4cc-4cdb-868a-ac0fcd13abb8
**Build:** `node tools/build-skeleton.mjs && node tools/bundle-skeleton.mjs 4 && node tools/build-basemap.mjs`

---

## 1. The contradiction in "procedural India", and how it resolves

You cannot procedurally *generate* India. Noise produces *a* landmass; it will never
produce the Kathiawar peninsula or the Rann of Kutch. Any honest procedural map of a real
place has to split:

> **The shape is data. The detail is code.**

| | Source | Size |
|---|---|---|
| Coastline, rivers, lakes | Natural Earth 10m, clipped and simplified | 100 KB |
| Orography | **103 authored control points** — ridges, swells, river troughs | 3.4 KB |
| Terrain, rainfall, biome, shading | **Generated. A pure function of (lon, lat, seed)** | 0 |

Everything you see is computed at the moment you look at it. No PNG, no mesh, no baked
art. The entire base map is **138 KB**.

## 2. Why not the alternatives

| Approach | Used by | Base size | Zoom past source | Verdict |
|---|---|---:|---|---|
| Pre-rendered raster | Victoria 3 — 8192×4096 | 34 MB | Blurs; hard stop at 4.9 km/px | Rejected — cannot reach L16 |
| 3D mesh + textures | Civilization, Total War | 100s of MB | Good, but LODs are authored | Rejected — asset pipeline |
| Vector tiles | Mapbox, MapLibre | streamed | Crisp everywhere | Right for borders; gives no terrain |
| Pure noise | Minecraft, No Man's Sky | ~0 | Infinite | Rejected — not *this* subcontinent |
| **Skeleton + field** | **This** | **138 KB** | **Infinite** | **Chosen** |

**~250× smaller than Victoria 3's map, and it never blurs** — there is no resolution to
run out of. Down to ~660 m the coastline is real geometry; below that, deterministic noise
adds detail that is *plausible* rather than surveyed. Which is exactly where India's
Geospatial Data Guidelines 2021 draw the line at one metre: **the legal boundary and the
technical boundary are the same boundary** (see [`00-plan.md`](00-plan.md) §5).

## 3. The pipeline, five stages

1. **Rasterise.** 302 coastline rings filled to a mask. Exact where the data is exact —
   no noise ever touches the outline.
2. **Coast field.** Two-pass chamfer distance transform, computed for land *and* sea, so
   elevation tapers to sea level at the shore and the ocean gets a depth gradient.
3. **Height.** 15 ridges, 7 swells, 7 river troughs. Gaussian falloff off each control
   polyline, ridged noise multiplied on top, troughs carved afterward. Domain-warped so
   ridges do not read as capsules.
4. **Rainfall.** See §4 — the part worth reading.
5. **Shade and tint.** Hillshade from the height gradient using the locked rig from
   [`08-visual-design.md`](08-visual-design.md) — warm key, upper-left, 35°, fill at 15%,
   never black — then a biome ramp keyed on height, rainfall and latitude.

## 4. Rainfall is derived, not painted

For every cell the model walks **upwind** and totals the terrain rise the air had to climb
to get there. More climbing upwind means it already rained. India has two monsoon
branches — Arabian Sea from the south-west, Bay of Bengal from the south-east — so both
are traced and blended by a soft-max.

A local escarpment is weighted far more heavily than a distant range, which is what
separates the Konkan from the Deccan.

**Nobody painted the Thar, the Deccan rain shadow, the wet Malabar strip or Assam.** They
fall out of 103 control points and a monsoon direction. That is the argument for the whole
approach: the map is not a picture of India, it is a small model of why India looks the
way it does.

## 5. Progressive, in three senses

- **Within a frame** — renders at ⅛ scale, then ¼, ½, 1:1. Instant, then sharpens.
  Dragging drops back to ⅛ so panning stays fluid.
- **Across zoom** — five LODs, 1.3 KB to 100 KB. Below LOD 4, procedural detail takes over
  and never runs out.
- **Across the project** — terrain now; settlements, then the political layer as its own
  Survey-of-India-compliant vector set. The base map is never rebuilt, only layered on.

The generator is a pure function of `(lon, lat, seed)` — the same determinism the
simulation core already requires ([`02-data-spine.md`](02-data-spine.md) §3), so tiles
seam and multiplayer clients agree without exchanging a pixel.

## 6. Legal posture

The base map uses **land polygons, not country polygons**. It depicts no international
boundary at all, which keeps it clear of the Criminal Law (Amendment) Act 1990 issue
entirely. Political borders arrive later as a separate, SOI-compliant layer that can be
swapped per distribution region without touching the terrain.

Natural Earth is public domain. No attribution obligation, no share-alike.

## 7. Known faults in v1

Found by rendering it and looking, not by inspection:

- **The Karakoram reads as detached capsules.** Three short ridge polylines with
  independent Gaussian falloff. Needs more control points and overlapping widths.
- **Tibet is still somewhat disc-like** despite domain warping. A radial swell is the
  wrong primitive for a plateau; it wants a polygon with a noisy edge.
- **No coastline detail below ~660 m.** The procedural sub-LOD layer described in §5 is
  specified but not yet implemented — LOD 4 is currently the floor.
- Both height and rainfall run on the main thread. They belong in a worker before this
  goes near the game.

Four bugs were found and fixed the same way during the build, and they are worth recording
because each was invisible in the code and obvious in the image: rainfall normalised by
its maximum (the Himalayan outlier flattened everywhere else to zero); the sea distance
field initialised to zero, so every ocean pixel read as shoreline; `heightAt` not knowing
where the sea was, so the upwind trace counted the Arabian Sea as land and no wet air ever
reached Kerala; and ray-march aliasing that striped the entire rainfall field until the
per-cell phase was jittered.
