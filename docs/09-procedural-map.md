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

## 3. Terrain type drives texture

The first version scaled micro-relief by **slope alone**, which gives every landform the
same grain — the tell that terrain was generated. Real Indian terrain has signatures:

| Kind | Where | Signature |
|---|---|---|
| `dunes` | Thar, Cholistan | Longitudinal ridges running SW–NE, other detail suppressed |
| `saltflat` | Great and Little Rann, Sambhar | Forced flat at 3–4 m with faint polygonal cracking |
| `depression` | **Kuttanad (−2 m)**, Chilika, Vembanad | Pulled below the surrounding land |
| `mesa` | Deccan traps, Malwa, Chota Nagpur | Height quantised into terraces — flat tops, steep risers |
| `badlands` | Chambal | Deep gullying, carved as a fraction of local relief |
| `delta` | Sundarbans, Ganga, Indus, Godavari | Near sea level with braided channel texture |
| `fan` | Terai / Bhabar | Gravel-fan grain along the Himalayan foot |

17 regions, ~1 KB of authored data. Each also carries a **texture multiplier** that
suppresses the generic slope-driven grain where it supplies its own — a salt flat should
be glassy, not noisy.

## 4. The pipeline, five stages

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

## 5. Water: three models, not one

The first attempt was a single upwind ray march. It could not work, and measuring it said
so plainly: **Assam came out at 0.07 — the wettest place on earth rendering as desert.**
Three separate corrections were needed.

**Advection, not ray-marching.** Assam is wet because moist air travels up the Brahmaputra
valley from a Ganga plain that is *itself* already moist. A one-shot ray cannot know that;
the field has to propagate. Moisture now relaxes across a 220×220 grid over 90 sweeps with
sea cells as permanent sources, along **four** monsoon arms — Arabian Sea north-east, Bay
of Bengal north, the Gangetic funnel west-north-west from the delta, and the Brahmaputra
funnel east-north-east up the valley. Tracing the bay arm from the *south-east* had put
Assam behind the Myanmar ranges.

**Air moisture is not rainfall.** Moist air crossing flat desert does not rain; it needs
lifting. Separating carried moisture from delivered rain is what finally made the Thar
arid (0.66 → 0.23) while leaving the Konkan drowned — the air over both is damp, only one
has a mountain in the way. A subtropical subsidence term over the north-west does the rest.

**Rivers make land fertile independently of rain.** The Ganga plain, the Punjab doab and
the Kaveri and Krishna deltas are green because of alluvium and water on the ground, not
because it rains on them. A rank-weighted distance field off the river network supplies a
fertility belt roughly 0.6° wide. Without it the monsoon model was being asked to explain
greenery it was never going to explain — and every attempt to tune it broke somewhere else.

| | Model | Expected |
|---|---:|---:|
| Kerala / Malabar | 0.28* | high |
| Konkan | 0.80 | high |
| Deccan interior | 0.36 | low-mid |
| **Thar** | **0.23** | very low |
| Gangetic mid | 0.59 | mid |
| Bengal | 1.00 | very high |
| **Assam** | **0.77** | very high |

\* the sample sits in the Palakkad Gap, where there genuinely is little orographic lift.

**Nobody painted the Thar, the Deccan rain shadow, the Malabar strip, Assam or the green
river corridors.** They fall out of 103 control points, four wind directions and the river
network. The map is not a picture of India; it is a small model of why India looks the way
it does.

## 6. Progressive, in three senses

- **Within a frame** — renders at ⅛ scale, then ¼, ½, 1:1. Instant, then sharpens.
  Dragging drops back to ⅛ so panning stays fluid.
- **Across zoom** — five LODs, 1.3 KB to 100 KB. Below LOD 4, procedural detail takes over
  and never runs out.
- **Across the project** — terrain now; settlements, then the political layer as its own
  Survey-of-India-compliant vector set. The base map is never rebuilt, only layered on.

The generator is a pure function of `(lon, lat, seed)` — the same determinism the
simulation core already requires ([`02-data-spine.md`](02-data-spine.md) §3), so tiles
seam and multiplayer clients agree without exchanging a pixel.

## 7. Legal posture

The base map uses **land polygons, not country polygons**. It depicts no international
boundary at all, which keeps it clear of the Criminal Law (Amendment) Act 1990 issue
entirely. Political borders arrive later as a separate, SOI-compliant layer that can be
swapped per distribution region without touching the terrain.

Natural Earth is public domain. No attribution obligation, no share-alike.

## 8. Known faults

Found by rendering it and looking, not by inspection:

- **The Karakoram reads as detached capsules.** Three short ridge polylines with
  independent Gaussian falloff. Needs more control points and overlapping widths.
- **Tibet is still somewhat disc-like** despite domain warping. A radial swell is the
  wrong primitive for a plateau; it wants a polygon with a noisy edge.
- **A clamp bug, found by probing rather than by looking.** Removing `max(0,h)` so Kuttanad
  could sit below sea level let the ±120 m base noise push **18.7% of the country** under
  zero, tinting great patches of the Deccan as marsh. Only a typed region may now go
  negative; everything else floors at 2 m. It was invisible in the render until measured.
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
