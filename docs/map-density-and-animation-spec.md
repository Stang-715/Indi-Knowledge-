# Map Density & Animation Criteria — India map game, pegged to Victoria 3

Re-run every number here with `node tools/density-calc.mjs`. Constants are named at the
top of that file so the assumptions can be argued with.

---

## 0. Three different things get called "pixel density"

The question "how dense should the map be" is really three questions, and they have
different answers and different cost curves. Separating them first, because conflating
them is how map projects blow their memory budget:

| | What it means | Set by | Cost driver |
|---|---|---|---|
| **A. Data resolution** | metres of ground per source pixel (m/px) | the raster you author | download size + VRAM |
| **B. Gameplay granularity** | how many separately clickable/ownable units exist | your design | CPU, save size, sim cost |
| **C. Display density** | device pixels per CSS pixel (DPR 1–3 on phones) | the user's screen | fragment shading — quadratic |

Victoria 3 is generous on C (it renders a 3D terrain at native res), moderate on A, and
deliberately *stingy* on B. A web game should invert that: be generous on B (that is the
product), resolution-independent on A (vector), and disciplined on C (cap DPR).

---

## 1. Victoria 3 baseline — measured, not guessed

Vanilla map rasters (`game/map_data/heightmap.png`, `provinces.png`, `rivers.png`) are
**8192 × 4096 px** covering the globe minus Antarctica; the map dimensions are declared in
`common/defines/00_defines.txt` and modders report the engine breaks above 8192 in either
axis. Province IDs are the RGB hex of each pixel in `provinces.png`.

Treating it as equirectangular — 8192 px over 360° of longitude:

| Metric | Value |
|---|---|
| Total raster | 33.6 Mpx |
| Pixels per degree | 22.76 |
| km per pixel (latitude) | **4.86 km** |
| km per pixel (longitude, equator) | 4.89 km |
| km per pixel (longitude, at 23° N — India) | 4.50 km |
| **Ground area per pixel over India** | **≈ 21.9 km²** |

Two facts that reframe the whole project:

> **All of India's land area occupies about 150,000 pixels in Victoria 3 — a 388 × 388
> square.** You could store the entire Indian subcontinent's Victoria 3 province map in a
> single 512×512 PNG with room to spare.

> **A Victoria 3 state region averages 218,000 km²** (617 state regions over ~134.7 M km²
> of land). That is *two-thirds the size of an average Indian state*, and **52× larger
> than an average Indian district**. Vic3's whole design assumes the smallest thing you
> click is enormous.

Provinces (the sub-state pixel regions that carry terrain and ownership, but are not
individually managed) average 3,400–10,400 km² depending on which public province count
you accept — public figures range from "more than 13,000" pre-release to ~40,000 in
community map tools, so treat that band as uncertain. Either way: **a Vic3 province is
roughly the size of an Indian district, and it is not a first-class gameplay unit.**

### The parity metric

An average Vic3 state region occupies **~9,975 map pixels** (a ~100 × 100 patch). That is
the empirical answer to "how much map does a clickable unit deserve in a Vic3-feeling
game." Use it as the target: give each of *your* smallest units ~10,000 pixels of map.

---

## 2. How much denser India has to be

Resolution required so each unit gets Vic3-state-region presence (~10k px):

| Smallest unit | Count | Avg area | Required m/px | Raster over India bbox | Land pixels | **Density vs Vic3** |
|---|---:|---:|---:|---|---:|---:|
| State / UT | 36 | 91,313 km² | 3,026 | 993 × 1,109 | 0.36 Mpx | **2×** |
| **District** | **780** | **4,214 km²** | **650** | **4,621 × 5,164** | **7.8 Mpx** | **52×** |
| Tehsil / sub-district | 5,924 | 555 km² | 236 | 12,734 × 14,232 | 59 Mpx | **393×** |
| Village | 640,867 | 5.1 km² | 23 | 132,444 × 148,024 | 6,393 Mpx | **42,561×** |

India's bounding box (68.11–97.42° E, 6.75–37.10° N) is ~3,003 km × 3,357 km on the ground.

**Read this way:** if your smallest clickable unit is the **district**, you need roughly
**50× Victoria 3's areal pixel density** (≈650 m/px, ~12× finer linearly). If it is the
**tehsil**, ~400× (≈236 m/px). Village-level is ~42,000× and is a *6.4-gigapixel* raster —
categorically off the table as pixels, and the reason for §3.

Single-texture cost of the raster approach, ID stored as 16-bit in RG8:

| Texture | m/px | VRAM (RG8 ID) | VRAM (RGBA8) | vs Vic3 |
|---|---:|---:|---:|---:|
| 1024² | 2,933 | 2 MB | 4 MB | 3× |
| 2048² | 1,467 | 8 MB | 16 MB | 10× |
| 4096² | 733 | 32 MB | 64 MB | 41× |
| 8192² | 367 | 128 MB | 256 MB | 163× |
| 16384² | 183 | 512 MB | 1,024 MB | 651× |

4096² is the largest single texture that is *safe everywhere* on the web (see §4). It
lands at 733 m/px — comfortably past district parity, short of tehsil parity.

---

## 3. The architectural conclusion: don't copy Vic3's raster-first design

Victoria 3 paints political geography into pixel rasters because it is a native app with
gigabytes of VRAM and a fixed, shipped map. That choice has a hard consequence: **Vic3's
political map cannot get sharper than 4.9 km/px, ever.** Zoom in and borders soften,
because there is no more data.

On the web the correct inversion is:

- **Political layer → vector.** Store district/tehsil boundaries as polygons (TopoJSON for
  the coarse tiers, Mapbox Vector Tiles for the fine ones), triangulate on the GPU, fill
  and stroke in a shader. Borders stay **mathematically crisp at every zoom, including
  sharper than Victoria 3 ever gets**, and the payload is a rounding error: ~780 district
  polygons simplified to a 50 m tolerance is a few hundred KB gzipped, versus 32 MB for
  the equivalent 4096² ID texture.
- **Terrain / height / water masks → raster, tiled, compressed.** These genuinely want to
  be pixels and they tolerate lossy compression. Ship as KTX2/Basis (transcodes to
  ASTC on mobile, BC7 on desktop) — 4–8× smaller in VRAM than RGBA8.
- **Picking → geometry, not `readPixels`.** A GPU readback stalls the pipeline and costs
  1–3 frames. Do point-in-polygon against an R-tree on the CPU (sub-millisecond for
  ~6,000 features), or render a unit-ID pass to an offscreen target and read a 1×1 region
  asynchronously via `WebGLSync` / PBO.

This is not a downgrade from Victoria 3 — for the political layer, which is the layer your
game is actually about, it is strictly better *and* ~100× cheaper. Keep raster only where
raster is genuinely the right representation.

### Tiering plan

| Tier | Zoom band | Political data | Terrain data |
|---|---|---|---|
| T1 | whole India → state | 36 state polygons, TopoJSON, ~80 KB | 2048² flatmap, KTX2, ~1.5 MB |
| T2 | state → district | 780 district polygons, ~400 KB gz | 4096² terrain tiles, streamed |
| T3 | district → tehsil | ~5,900 tehsil polygons as MVT, z6–z10 | 8192²-equivalent tiles, streamed |
| T4 | tehsil → village *(optional, phase 3)* | MVT z11–z14, load only in view | satellite/hillshade tiles |

Ship T1+T2 first. They are the Victoria 3 experience at 52× its density, and they fit in
under 3 MB.

### Projection

Author and store in EPSG:4326. Render in **Web Mercator (EPSG:3857)** if you want the
standard vector-tile toolchain (tippecanoe, maplibre-gl) to work unmodified — the ~22%
north-south area distortion across India's latitude range is acceptable for a game. If
area fidelity matters for gameplay (population density shading, area-based economics), use
**Lambert Conformal Conic with standard parallels 12.47° N / 35.17° N** — India's official
national projection — and accept writing your own tiler.

---

## 4. Web-platform hard limits — the actual criteria

These are the constraints Victoria 3 does not have and that will decide whether this ships.

**Texture limits.** WebGL2 guarantees only 2048 by spec. In practice: 4096 is safe on
essentially every device including low-end Android; 8192 holds on most modern mobile GPUs;
16384 is desktop-only. **Never depend on a single texture above 4096²** — tile instead.
Query `gl.getParameter(gl.MAX_TEXTURE_SIZE)` at boot and pick the tier.

**ID textures have rules.** If you do keep an ID raster: `NEAREST` filtering only, no
mipmaps (mip averaging invents IDs that do not exist), lossless encoding only (PNG or
lossless WebP — never JPEG or Basis), and store the 16-bit ID split across R and G.

**Memory.** A mobile browser tab that exceeds roughly 300–400 MB of combined JS heap plus
GPU allocation gets killed by the OS, silently, mid-session. Budget: **≤ 256 MB GPU
textures, ≤ 300 MB JS heap**, and evict tiles outside the view frustum plus one ring.

**Display density is quadratic.** A 3× DPR phone renders 9× the fragments. Cap the terrain
and water layers at `devicePixelRatio ≤ 2` (render to a half-res framebuffer and upscale);
render vector borders, labels, and UI at full DPR where the sharpness is actually visible.
This one setting is typically worth 2× frame rate on flagship phones.

**WebGPU where available, WebGL2 as the floor.** WebGPU gives compute shaders (useful for
border extraction and per-unit aggregation) and much cheaper draw-call submission, but as
of now it is not on enough mobile browsers to be the only path. Build on WebGL2,
feature-detect WebGPU for the fast path.

---

## 5. Animation — what Victoria 3 actually does, and the web equivalent

Victoria 3's map feels alive because of many cheap layers, not a few expensive ones. Nearly
all of it is shader work over a static mesh. Ranked by value-per-millisecond:

| Vic3 effect | Web technique | Frame cost | Priority |
|---|---|---|---|
| Animated ocean | 2 scrolling normal maps at different rates + flow map, blended | ~0.3 ms | **P0** |
| Shoreline foam | distance-field from coastline × animated noise | ~0.2 ms | **P0** |
| Map-mode transitions | cross-fade a color LUT over 250 ms — never re-upload textures | ~0 ms | **P0** |
| Selection / hover highlight | animated dash offset + pulse on border geometry | ~0.1 ms | **P0** |
| Drifting cloud shadows | one scrolling tiled noise texture multiplied onto terrain | ~0.2 ms | P1 |
| Zoom LOD blend (3D terrain → flat "paper" map) | cross-fade two shaded variants by zoom | ~0.3 ms | P1 |
| Paper/parchment grain + vignette in political mode | post-process overlay | ~0.1 ms | P1 |
| Time-of-day tint | uniform lerp on the lighting term | ~0 ms | P2 |
| Trade / army movement | instanced sprites along Catmull-Rom splines, one draw call | ~0.5 ms @ 2k instances | P2 |
| City lights, industry smoke | instanced billboards, atlas frames at **8–12 fps** (not 60) | ~0.4 ms | P2 |
| River flow | scrolling UV along the river spline's parametric axis | ~0.1 ms | P3 |

The two rules that make this work: **animate in the shader, not in JavaScript** (a
per-frame JS loop over 5,900 tehsils will cost more than the entire GPU budget), and
**animate sprite content at 8–12 fps while the camera runs at 60** — nobody perceives a
smoke plume updating at 60 Hz, and it cuts atlas size and bandwidth by 5×.

### Frame budget

At 60 fps you have **16.67 ms**. Allocate:

- JavaScript (input, culling, tile scheduling, sim tick): **≤ 4 ms**
- GPU: **≤ 8 ms**
- Headroom for GC and browser compositing: ~4 ms

Run the economy/political simulation **off the render thread** in a Web Worker on a fixed
tick (e.g. 4 Hz), and transfer results as `SharedArrayBuffer` or transferable typed arrays.
Never let a sim tick land inside a frame.

---

## 6. Acceptance criteria — the checklist to build against

**Density**
- [ ] District tier renders at ≥ 650 m/px effective (≥ 52× Victoria 3's areal density)
- [ ] Borders remain crisp at all zooms — no visible raster stair-stepping at max zoom
- [ ] Every one of ~780 districts is individually hoverable, selectable, and colorable

**Performance**
- [ ] 60 fps sustained on desktop (integrated GPU) during continuous pan + zoom
- [ ] ≥ 45 fps on a mid-tier Android (think Snapdragon 7-series) during pan + zoom
- [ ] Frame time p99 < 33 ms — no hitches on tile load or map-mode switch
- [ ] Draw calls < 150/frame; all district fills batched into ≤ 3 calls

**Load & memory**
- [ ] Time to interactive map ≤ 3 s on 4G, mid-tier Android, cold cache
- [ ] Initial critical payload ≤ 2.5 MB gzipped
- [ ] GPU texture allocation ≤ 256 MB; JS heap ≤ 300 MB steady-state
- [ ] No allocation growth over a 10-minute session (tile eviction actually works)

**Interaction**
- [ ] Hover → highlight latency < 32 ms (2 frames)
- [ ] Picking pixel-accurate at every zoom level, including across district borders
- [ ] Map-mode switch completes in ≤ 300 ms with no frame drop

**Compatibility**
- [ ] Works with `MAX_TEXTURE_SIZE == 4096` (no 8192-dependent code path)
- [ ] WebGL2 baseline; WebGPU opt-in fast path
- [ ] Correct on `devicePixelRatio` 1, 2, and 3

---

## 7. Recommended stack

- **Renderer:** MapLibre GL JS for the map substrate (vector tiles, projection, camera,
  picking, tile lifecycle all solved) with custom WebGL layers for terrain shading, water
  animation, and unit sprites. Building the tile pipeline from scratch on raw
  three.js/regl is 3–6 months of work MapLibre already did.
- **Tiling:** `tippecanoe` to build MVT from district/tehsil shapefiles; serve as PMTiles
  from static hosting/CDN (no tile server to run).
- **Boundary data:** Survey of India / Census of India administrative boundaries for
  authoritative district and sub-district geometry. Check licensing before shipping —
  this is the one genuine external dependency and worth resolving early.
- **Compression:** KTX2/Basis for terrain (`toktx`), lossless WebP for any ID rasters.
- **Simulation:** Web Worker, fixed tick, typed arrays. Consider Rust→WASM if the
  per-tick cost over 5,900+ units exceeds budget.

## 8. Suggested sequence

1. **Spike (1 week).** MapLibre + 780 district polygons + one map mode + hover/select.
   Measure it against §6 on a real mid-tier Android. This de-risks everything.
2. **Vic3 feel.** Water shader, cloud shadows, map-mode cross-fade, parchment mode,
   zoom LOD blend. This is where it stops looking like a data viz.
3. **Depth.** Tehsil tier as MVT, economy sim in a worker, unit sprites and splines.
4. **Optional.** Village tier — vector tiles only, z ≥ 12, view-bounded loading.

---

### Sources

- [Map modding — Victoria 3 Wiki](https://vic3.paradoxwikis.com/Map_modding)
- [State modding — Victoria 3 Wiki](https://vic3.paradoxwikis.com/State_modding)
- [\[Map Modding\] Increasing Map Dimensions Over 8192x4096 — Paradox Forums](https://forum.paradoxplaza.com/forum/threads/map-modding-increasing-map-dimensions-over-8192x4096.1417329/)
- [Victoria 3 Dev Diary #16 — States](https://forum.paradoxplaza.com/forum/threads/victoria-3-dev-diary-16-states.1491897/)
- [New Victoria 3 diary explains states — PCGamesN](https://www.pcgamesn.com/victoria-3/states-dynamic-us-flag)
- [Victoria 3 will most likely not have provincial-level gameplay — AltChar](https://www.altchar.com/game-news/victoria-3-will-most-likely-not-have-provincial-level-gameplay-a2kqf0V2YDxV)
- [Modding State Regions, Splines, Provinces, Cities, and Roads — Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3165669021)

India administrative counts: Census of India 2011 (5,924 sub-districts; 640,867 villages)
and current district count (~780, 2023).
