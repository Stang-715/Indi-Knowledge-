# The Replan — an India-only grand strategy game at seventeen scales

Working title: **Paramountcy**. Peg: Victoria 3. Scope: the Indian subcontinent, and
nothing else, rendered from national outline down to individual buildings.

> Every number in this document is recomputable: `node tools/scale-ladder.mjs` and
> `node tools/density-calc.mjs`.

---

## 1. Reading the brief

**"From the North Arctic to Antarctica"** — I'm reading this as: *take the entire
pixel budget Victoria 3 spends on the whole planet, and spend all of it on India.*
The whole canvas, pole to pole, is India. That is the right instinct, and the
answer is stronger than it sounds, because once the map is only India you are no
longer bounded by a single canvas at all. You get a **ladder**.

There is still a world outside. It stays — as an **abstraction layer**, not a map:
Britain, China, the Gulf, the Straits, and the Atlantic economy exist as trade
partners, price-setters, and political pressure, rendered at Victoria 3 fidelity or
coarser on a small inset. All the depth goes into India. Everything outside India is
a market and a diplomatic actor, not a place you zoom into.

**"Maximum pixel density, every city has street-level minimaps"** — this is not one
map at high resolution. It is a seventeen-rung pyramid where each rung has its own
canonical gameplay unit, its own data source, and its own renderer. Victoria 3 lives
on exactly one of those rungs.

**"Pour data in, leave the gaps, fill later"** — this is the most important sentence
in the brief, and §3 turns it from a production compromise into the game's core
mechanic.

---

## 2. The scale ladder

A quadtree over a 3,440 km square canvas covering India including the Andamans and
Lakshadweep. Level *L* has 256 · 2^L pixels across.

| L | Rung | m/px | Canonical unit | Count | vs Vic 3 (areal) |
|---:|---|---:|---|---:|---:|
| 0 | Subcontinent | 13.44 km | Nation | 1 | 0.1× |
| 1 | Region | 6.72 km | Presidency / Region | 8 | 0.5× |
| **—** | **← Victoria 3 sits here, at 4,860 m/px —** | | | | **1×** |
| 2 | State | 3.36 km | State / princely state | 36 | 2× |
| 3 | Division | 1.68 km | Division | 102 | 8× |
| 4 | District | 840 m | District | 780 | 33× |
| 5 | Tehsil | 420 m | Tehsil / taluk | 5,924 | 134× |
| 6 | Block | 210 m | Block | 6,500 | 536× |
| 7 | Panchayat | 105 m | Gram panchayat | 255,000 | 2,143× |
| 8 | Settlement | 52 m | Village / town | 648,802 | 8,573× |
| 9 | Approach | 26 m | *(city outline)* | — | 34,291× |
| 10 | Cityscape | 13 m | City | 4,041 | 137,163× |
| 11 | Ward | 6.6 m | Municipal ward | ~90,000 | 548,650× |
| 12 | Neighbourhood | 3.3 m | Locality | ~400,000 | 2.2 M× |
| 13 | Block face | 1.6 m | Street block | — | 8.8 M× |
| 14 | Street | 0.82 m | Street segment | — | 35.1 M× |
| 15 | Plot | 0.41 m | Parcel | — | 140.5 M× |
| 16 | Kerb | 0.21 m | Building | 24,000,000 | **561.8 M×** |

The ladder splits cleanly into three **worlds**, each with its own renderer, its own
data model, and its own simulation tick rate:

- **L0–L8 · The Realm.** Territory, pops, land revenue, armies, politics. This is the
  Victoria 3 game, at up to 8,500× its density. Vector admin boundaries + raster terrain.
- **L9–L12 · The City.** You dive out of the map into a place. Wards, localities,
  the street grid, the municipal layer. New verbs Victoria 3 doesn't have.
- **L13–L16 · The Ground.** Individual streets, plots, buildings. Almost entirely
  procedural (see §5 — this is a legal requirement as well as an engineering one).

---

## 3. The thesis: the gaps *are* the game

The brief says: pour in what data we have, leave the rest, fill it later. The obvious
worry is that a half-empty map is a broken game. It isn't — because of a historical
accident that is almost too convenient.

**In 1836, India was not surveyed.** The Great Trigonometrical Survey ran from 1802 to
1871. The first synchronous all-India census was 1871–72. Cadastral settlement
operations crawled district by district across the century. A map of British India in
1836 had blank interiors, hachured guesses at hills, and rivers that stopped where the
surveyor turned back.

So:

> **The completeness of our dataset *is* the fog of war.**
>
> Unsurveyed territory renders as a period survey sheet — linen ground, blank
> interiors, marginal annotations. The player spends money and years to **commission a
> survey**, and the region resolves into detail. Where we have poured real data, the
> survey reveals real data. Where we haven't, it reveals deterministic procedural
> data. The player cannot tell the difference, and neither can the simulation.
>
> When datapack v2 ships with 40,000 more real villages, those villages quietly stop
> being invented. Nothing breaks. No save is invalidated. The map just gets truer.

This buys four things at once:

1. **We can ship at 5% data completeness** and it reads as a design choice, because it
   is historically accurate.
2. **Survey becomes a real strategic verb** — a budget line, a political fight
   (surveys precede taxation, and everyone knew it), and a genuine mechanic.
3. **Data contribution has somewhere to go.** Every pour makes the world truer without
   a code change.
4. **The art direction writes itself.** Company School painting and Survey of India map
   sheets, not generic fantasy-strategy parchment.

---

## 4. What dies and what survives at these scales

One number settles the architecture. Rasterising level 16 across India, at two bytes
per pixel:

| Rung | As one raster | Streamed as vector tiles |
|---|---:|---:|
| L4 District | 34 MB | ~0.2 MB / screen |
| L8 Settlement | 8.6 GB | ~0.9 MB / screen |
| L12 Neighbourhood | 2.2 TB | ~2.6 MB / screen |
| **L16 Kerb** | **563 TB** | **~3 MB / screen** |

Raster is not a slow option at these scales; it is not an option. Every rung below L4
is vector, procedural, or both. Concretely:

- **Terrain, elevation, water, land cover → raster**, tiled, KTX2/Basis compressed,
  and it stops at about L8. Below that, terrain is irrelevant; you're looking at streets.
- **Everything political and everything built → vector**, as PMTiles, streamed per view.
- **Everything below 1 m (L15–L16) → procedural**, generated deterministically from the
  vector data above it. Never stored, never shipped. Generated on the client, identically
  every time, from a seed.

That last rule is the one that makes 563 TB collapse to nothing. A building at L16 is
not a stored polygon; it is `f(plot_id, seed, era, ward_wealth, community, trade)` —
a pure function that returns the same courtyard house in Shahjahanabad every time
anyone anywhere loads that plot.

---

## 5. The legal constraint that shapes the whole design

Two findings that are load-bearing, not footnotes:

**India's Geospatial Data Guidelines (2021) set a threshold of 1 m horizontal
accuracy.** Geospatial data finer than 1 m may only be created or owned by Indian
entities, and must be stored and processed in India. Foreign-owned entities may license
finer data only to serve customers in India, and derived data shared abroad must be
degraded below the threshold.

Levels 15 and 16 are 0.41 m and 0.21 m. **They are below the threshold.**

The resolution is exactly the architecture we already wanted: **at and below 1 m, we
ship no surveyed data at all — only procedural generation.** Invented buildings are not
geospatial data about India; they are fiction seeded by coarser public data. The law
and the engineering agree, which almost never happens. Concretely:

- L0–L14 (≥ 1 m): real data, public sources, shippable anywhere.
- L15–L16 (< 1 m): 100% procedural, seeded from L14. No survey data enters.
- If the studio is an Indian entity and wants true cadastral data later, that becomes a
  separate India-hosted datapack — a *later* option the architecture already supports,
  not a dependency.

**Boundary depiction is a criminal matter in India.** Incorrect depiction of India's
international boundaries is an offence under the Criminal Law (Amendment) Act 1990,
and the proposed Geospatial Information Regulation Bill contemplated far heavier
penalties. Survey of India actively reports apps to app stores over this. Jammu &
Kashmir, Ladakh, and the India–China frontier are the sensitive cases.

**Therefore: the present-day political boundary layer must follow Survey of India
depiction, without exception, in any build distributed in India.** This is separable
from the historical layer — an 1836 map showing Company territory, princely states and
the Sikh Empire is a historical depiction, not a claim about current borders — but the
separation must be explicit in the data model, and legal review is required before any
India release. Budget for it now, not at launch.

---

## 6. The data spine

Full specification in [`docs/02-data-spine.md`](02-data-spine.md). The four rules:

1. **Every entity has a stable ID and a provenance tier.**
   `SOURCED` (real, cited) · `DERIVED` (computed from real) · `SYNTHESIZED`
   (procedurally invented, deterministic) · `ABSENT` (explicitly unknown → renders as
   unsurveyed). Provenance is a first-class field the UI can surface in a debug mode
   and the historian mode can show to players who want it.

2. **Synthesized children must sum to sourced parents.** If a district's 1881
   population is known but its tehsil breakdown isn't, the invented tehsil populations
   are fitted to the known district total by iterative proportional fitting. The world
   is never internally inconsistent, only under-detailed. This is the discipline that
   makes "pour data in later" survive contact with a simulation.

3. **Saves store decisions, never generated world state.** World = f(datapack version,
   world seed, decision log). A new datapack replays the decision log onto a truer
   world. Stable IDs plus a tombstone/remap table carry saves across pours.

4. **Datapacks are public and versioned.** The format is documented, the schema is in
   the repo, and anyone can author one. This is not generosity — it is the *only*
   arithmetic that fills 648,802 villages and 24 million buildings. We will not do it
   in-house. Wikipedia and OpenStreetMap are the model.

---

## 7. The simulation — Victoria 3 depth, Indian bones

Full specification in [`docs/03-simulation.md`](03-simulation.md). The design stance:
this is not Victoria 3 reskinned. The period gives India mechanics that have no Vic 3
equivalent, and those should be the spine.

**Period: 4000 BCE → present.** Six thousand years, thirteen eras. Victoria 3's machinery
fits roughly 1757–1947 — about 3% of that span — so the simulation is **era-layered**: the
entities stay constant and the rules that govern them swap. Full design in
[`docs/04-eras.md`](04-eras.md); the sovereignty spine is already built in
[`data/polities/polities.json`](../data/polities/polities.json).

**Five axes of depth:**

| Axis | Victoria 3 | Here |
|---|---|---|
| Economic | Goods → production methods → buildings → market | Same, plus **land revenue system** (zamindari / ryotwari / mahalwari) as a building-level modifier deciding *who captures the surplus* |
| Social | Pops = culture + religion + profession | Pops = **language + religion + jati-cluster + profession** — four axes, because occupation and mobility in this period ran on all four |
| Political | You are a sovereign state | **You may not be sovereign.** Paramountcy, Residents, subsidiary alliance, the right of lapse |
| Spatial | One rung | **Seventeen rungs.** Buildings sited on real streets in real cities |
| Sovereign | One province, one owner | **A stack, not a colour.** Holder, revenue claimant, tributary superior, paramount — graded overlordship, six thousand years of it |
| Temporal | 1836–1936, one rule-set | **4000 BCE–present, thirteen rule-sets** |

**The central tension: the Drain.** Home Charges, Council Bills, the guaranteed 5%
return to British railway investors, a trade surplus that never comes home. Model it as
a literal budget outflow you cannot remove while under Crown rule — the thing every
campaign is ultimately about. (Its magnitude is historiographically contested; the
model exposes its assumptions in the tooltip and lets modders retune them.)

**Who you play.** The Company / the Raj; a Presidency; a princely state under
paramountcy (Mysore, Hyderabad, Travancore, Baroda, Gwalior); later, a political
movement rather than a state. *Playing under someone* — with a Resident reading your
mail and a tribute you cannot refuse — is the verb Victoria 3 does not have, and it
should be the flagship campaign.

**Goods chains that are India's, not Europe's.** Raw cotton → yarn → cloth (and the
deindustrialisation of the handloom). Jute → sacking, a near-world-monopoly out of
Bengal. Indigo → dye, and its collapse when synthetic dyes arrive around 1900. Opium →
China, and what it did to the Company's balance sheet. Tea in Assam. Salt, its
monopoly, and its tax. Coal at Raniganj. Steel at Jamshedpur from 1907.

**On caste.** It is not optional — it is the single largest determinant of occupation
and mobility in this period, and a game that omits it is telling a false story about
Indian economic history. It is modelled the way the game models every other structure:
as a system with real mechanical consequences (occupational access, mobility friction,
credit access), and with the historical reform movements as the mechanic that changes
it — Brahmo Samaj, Satyashodhak Samaj, temple entry, Ambedkar's constitutionalism.
Never as an inherent modifier on a pop's competence. This needs historian review before
it ships, and that review should be commissioned early, not treated as a compliance
step at the end.

---

## 8. The vibe

Victoria 3's feel is *a living ledger*: a painterly map you can read like a document,
with numbers everywhere and a tooltip inside every tooltip. Two commitments:

**Nested tooltips are a day-one UI primitive**, not a late feature. Every number traces
to the chain that produced it, recursively. This is the single thing that makes
Victoria 3 feel deep rather than opaque, and it cannot be retrofitted onto a UI that
wasn't built for it.

**Visual register: Company School painting, Survey of India map sheets, Bengal School.**
Not generic strategy parchment. The palette comes from period pigment — indigo, madder,
orpiment, lamp black — on aged survey linen. Devanagari- and Tamil-capable typography
from day one, because place names are half the atmosphere. Ambient score built on raga
that shifts by region and era.

Animation follows the layering in
[`docs/map-density-and-animation-spec.md`](map-density-and-animation-spec.md), plus one
new signature moment: **the dive**. Crossing L9→L10, the map does not zoom — it
descends, the flat political fill resolving into roofs and streets. Get this transition
right and it sells the entire premise in three seconds.

---

## 9. System structure

```
apps/
  client/            game client — shell, UI, input, audio
  studio/            internal tool for authoring and validating datapacks
packages/
  schema/            entity IDs, provenance, datapack manifest  (JSON Schema — in repo now)
  sim/               deterministic simulation core (Rust → WASM)
  worldgen/          deterministic procedural fill, L13–L16
  render-realm/      L0–L8  — MapLibre substrate + custom WebGL layers
  render-city/       L9–L16 — separate scene graph, streamed per city
  ui/                nested-tooltip primitive, map modes, ledger panels
data/
  pipelines/         ingest: census, boundaries, footprints, OSM
  datapacks/         versioned, content-addressed, publicly documented
docs/
tools/
```

Four boundaries that must not blur:

- **`sim` is deterministic and headless.** No rendering, no wall clock, no `Math.random`.
  Same seed plus same decision log equals same world, on every machine. This is what
  makes multiplayer, replay, and datapack migration all possible with one mechanism.
- **`worldgen` is a pure function.** No state, no I/O, no persistence. It can be called
  identically on the client, in the studio, and in a test.
- **`render-realm` and `render-city` never share a scene graph.** They share a camera
  contract and nothing else.
- **Datapacks never contain code.** Data only, validated against the schema, so
  community packs can't execute anything.

---

## 10. Roadmap

Honest framing: this is a multi-year project, and the ladder is what makes it *possible*
rather than what makes it huge — each rung ships independently and the game is playable
from P1 onward.

**P0 · Vertical slice — 6 to 8 weeks.** One district, end to end, desktop build. Pick
**Thanjavur** (ryotwari, dense settlement, excellent 19th-century records) or **Pune**.
Ladder L2→L12 including one full city dive. Three goods, pops on all four axes, one map
mode, the survey mechanic on a single tehsil, one era transition. No simulation depth —
this exists to prove the ladder, the dive, the era swap and the provenance model on real
hardware. **If the dive doesn't feel good here, the premise is wrong and we find out for
the price of two months.** Ships a web cut as the demo.

**P1 · One presidency, real game.** Madras Presidency at L0–L8. Simulation core: pops,
goods, buildings, market, land revenue. Survey mechanic complete. Playable 1836–1870.

**P2 · All-India realm.** L0–L8 nationwide, all 780 districts, all princely states.
Politics: interest groups, paramountcy, the Drain. Campaign to 1900. **This is the
minimum shippable game** and it is a complete Victoria 3–class experience at 8,500× its
map density, with cities as pins rather than places.

**P3 · The cities.** L9–L16 for the top 50 cities. Municipal layer, the dive, procedural
ground. Campaign to 1947. This is the version that is unlike anything else.

**P4 · The long pour.** Public datapack SDK, contributor tooling, community fills the
tail. Cities 51–4,041 arrive as data, not as releases. The polity spine deepens from 146
entries to several thousand, with georeferenced extents.

**Running alongside, from P0: the sovereignty spine.** Already begun —
[`data/polities/polities.json`](../data/polities/polities.json) holds 146 polities and 70
rule relations across all thirteen eras, schema-validated. It is a skeleton, not
scholarship (see [`04-eras.md`](04-eras.md) §7), and it grows continuously rather than
per-phase.

---

## 11. Platform: desktop as the product, web as the demo

**Settled: desktop-first.** The original brief was web-first, and at 1836–1947 with a
Victoria 3-shaped map that was defensible. At 4000 BCE–present with seventeen spatial
rungs, city interiors and thirteen simulation rule-sets, it is not. The reasons, in
order of weight:

1. **The memory ceiling is the binding constraint.** A mobile browser tab dies somewhere
   around 300–400 MB of combined heap and GPU allocation. A six-millennium campaign
   holding 146+ polities, thirteen rule-sets, 648,802 settlements and a city scene graph
   does not fit under that ceiling. Desktop gives us 4–8 GB and the problem disappears.
2. **WASM costs 1.2–2× on exactly our hot path.** The simulation is a wide numeric sweep
   over hundreds of thousands of entities. That is where WASM is furthest from native,
   and where thread-portability is worst.
3. **Grand strategy is played in four-hour sessions, on Steam.** That is where the
   audience for this genre is, where discovery and wishlists work, and where mods —
   which this genre lives on — are a solved problem rather than an awkward one.
4. **The whole of §4's constraint list evaporates.** No `MAX_TEXTURE_SIZE` of 4096, no
   DPR quadratic, no tile-eviction tightrope. L13–L16 stop being a fight.

**The honest cost:** we lose MapLibre GL JS, which was giving us camera, tiling,
projection, picking and tile lifecycle for free. Rebuilding that map substrate in Rust is
roughly **2–3 months** of work that the web path did not require. That is the price, and
it is worth paying once rather than fighting the browser forever.

**But web is not abandoned — it is nearly free if we choose the stack correctly.**

> **Rust + wgpu, one codebase, two targets.** `wgpu` abstracts Vulkan / Metal / DX12
> *and* WebGPU / WebGL2. The simulation core is already specified as deterministic,
> headless Rust (§9), which compiles to native and WASM without change.

So the plan becomes:

- **The product is the desktop build.** Full ladder, full timeline, full simulation.
- **The demo is a web build**: one district, one century, twenty minutes, no install,
  shareable by link. Which is *exactly the P0 vertical slice* — so the demo costs almost
  nothing extra and doubles as the marketing artifact for an unknown title.
- **The web build stays a demo**, deliberately. It is not a second product to maintain at
  feature parity.

This also matters for reach in India specifically, where PC gaming penetration is lower
than mobile: the web demo is how someone without a gaming PC meets the game at all.

### What this changes elsewhere

- [`docs/map-density-and-animation-spec.md`](map-density-and-animation-spec.md) §4's web
  limits now apply **only to the demo build**. The density arithmetic and the animation
  layering in that document are platform-independent and still hold.
- §9's `render-realm` / `render-city` are Rust + wgpu, not MapLibre + custom WebGL layers.
- PMTiles still works — there are Rust readers — so the tiling and datapack story is
  unchanged.

## 12. Still open

1. **Studio jurisdiction.** Is the entity Indian-owned? This decides whether sub-metre
   data is ever an option (§5) and it changes P3 onward. Unanswered.
2. **Historian engagement.** Two areas now need a specialist early rather than late:
   caste across six millennia, and the contested ground in the polity spine (Vedic
   chronology, the Indus decline, Aryan migration, "Indian feudalism"). Who, and when?
3. **Where the vertical slice sits in time.** The colonial era has by far the best data
   and is the natural P0 target — but it is no longer the headline era. Slice there
   anyway for the data, or slice somewhere that shows off the 6,000-year hook?
