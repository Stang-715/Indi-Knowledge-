# The Build Plan — eleven phases to a playable slice

**Companion to [`00-plan.md`](00-plan.md).** That document says *what the game is*. This one
says **what to type first, and in what order**, and explains the architecture in plain
language before the jargon starts.

---

# Part A — The codebase, explained plainly

## A.1 The one metaphor that covers everything

The game's art direction is **the Cartographer's Table** ([`08-visual-design.md`](08-visual-design.md)):
the whole world is a relief model sitting on a survey sheet, lit like a photographed object.

**The codebase has the same shape as the table.** That is not a coincidence — it is the
reason the architecture is easy to remember.

| On the table | In the code | What it does |
|---|---|---|
| The chest of documents under the table | `data/` | Everything we know. Facts. No behaviour. |
| The rulebook nobody at the table reads aloud | `packages/sim/` | Decides what happens next. Never draws anything. |
| The workshop out back where pieces get carved | `packages/worldgen/` | Invents detail on demand — a street, a hill, a hamlet. |
| The model and the lamp | `packages/render-*` | Turns numbers into something you can look at. |
| Your hands, and the ledger you write in | `packages/ui/` | How you touch the world. |
| The printing press that made the documents | `tools/` | Scripts that build the data files. Run once, not during play. |
| The box the whole thing ships in | `apps/client/` | The actual game you launch. |

If you can hold that table in your head, you can find any file in this project.

## A.2 What each part actually is

**`data/` — the facts.**
Plain JSON. 146 polities. 89 works. A coastline. 103 elevation control points. It does not
*do* anything; it is what the game is about. Today it is 1.3 MB. Eventually it is the thing
the public helps fill in.

> **Datapacks never contain code.** Data only, checked against a schema. That is what makes
> it safe for strangers to write them.

**`packages/schema/` — the contract.**
Five JSON Schema files that say what a valid polity, work, or datapack looks like. This is
the handshake between the people writing data and the people writing code, so neither has
to ask the other what a field means.

**`packages/sim/` — the brain.**
Given the state of the world and one tick of the clock, produce the next state. It is
**headless**: it has no idea a screen exists. You can run the entire 7,947-year campaign in
a terminal with no graphics at all — and in phases 3–5 below, that is exactly what we do.

**`packages/worldgen/` — the carver.**
A **pure function**: same input, same output, always, with no memory of being called before.
Ask it for the hills around Thanjavur and it computes them; ask again and you get the
identical hills. This is how the game holds 648,802 settlements without storing 648,802
settlements — it stores the *recipe* and computes the settlement when you look at it.

**`packages/render-realm/` and `packages/render-city/` — the two lamps.**
Country scale and street scale are genuinely different problems, so they are two separate
renderers that agree on one thing only: where the camera is. Realm draws terrain and
territory. City draws buildings and streets. They never share a scene graph, because the
moment they do, a change to one breaks the other.

**`packages/ui/` — the table objects.**
The ledger, the paper slips, the manuscript chest, the transparent map-mode sheets. Eighteen
components, spelled out in [`08-visual-design.md`](08-visual-design.md) §9.

**`tools/` — the press.**
Seven Node scripts, already written. They turn raw sources into the JSON in `data/`. They
run on your machine, never in the shipped game.

**`apps/client/` — the box.**
Thin. It wires the pieces together, handles input and audio, and gets out of the way.

## A.3 The fundamental rule

*(Reading "the fan-fighting rule" as the fundamental one — this is it.)*

> ```
> world = f(datapack, seed, decision_log)
> ```
>
> **The game never saves the world. It saves what you did.**

**Explained as simply as it goes:** a save file is a **recipe, not a photograph of the cake.**
To load your game, the engine starts at 6000 BCE and replays every decision you ever made,
very fast, and arrives at exactly the world you left. Nothing about the world is stored,
because everything about the world can be recomputed.

Four large things fall out of that one rule, free:

1. **Saves are tiny.** Kilobytes. A list of choices, not a 40 MB world snapshot.
2. **Multiplayer becomes possible with no extra machinery.** Everyone sends their decisions;
   every machine computes the identical world.
3. **Bug reports are perfect.** Send the log, get the exact bug, every time.
4. **Old saves survive new data.** Pour in better archaeology next year and your campaign
   replays onto the truer world instead of breaking.

**The discipline that pays for it:** the simulation may never call `Math.random()` and may
never ask what time it is. All randomness comes from the seed. Roll dice and the recipe stops
reproducing the cake. Phase 1 installs a test that fails the build if anyone forgets.

## A.4 The four boundaries that must not blur

1. `sim` is deterministic and headless — no rendering, no clock, no random.
2. `worldgen` is pure — no state, no files, no memory.
3. `render-realm` and `render-city` share a camera and nothing else.
4. Datapacks are data — never code.

Everything else in this project is negotiable. These four are not.

## A.5 How a game like this actually gets built

Not front-to-back. You do not finish the map, then finish the economy, then add art.

You build a **vertical slice**: one thin wedge that runs all the way from data, through the
simulation, to something on screen — for **one region and one century** — and you find out
whether it is any good. Then you widen the wedge.

**And you point the wedge at the scariest part first.** Here the scary part is not the map.
Every strategy game has a map; ours is already rendering. The scary part is the **knowledge
economy** — nobody has shipped a game where the thing you protect is a library.

> **So phases 3–5 build the library with no graphics at all**, and phase 5 asks one
> question: *when a book goes grey in a terminal, does it hurt?* If it does, the rest of
> this is worth years. If it doesn't, we found out in six weeks instead of three years.

---

# Part B — The eleven phases

Each phase ends in **something you can run**. Risk is front-loaded: the phase most likely to
kill the project is phase 5, not phase 11.

| # | Phase | You can... | Rough |
|--:|---|---|---|
| 1 | The workshop | build, test, and fail on non-determinism | 3–5 d |
| 2 | The spine as data | load 787 events as validated JSON | 4–6 d |
| 3 | The clock | run 7,947 years headless in a terminal | 1 w |
| 4 | The library | own, copy, and lose a book | 1.5 w |
| 5 | **The first loss** | **play 1193 as text — the go/no-go** | **1 w** |
| 6 | The table | see the terrain in the real renderer | 2 w |
| 7 | The dive | zoom L0→L9 with the tilt-shift falling away | 2 w |
| 8 | The hands | use the ledger, the slips, the chest | 1.5 w |
| 9 | The pieces | see era-correct landmarks on the terrain | 1 w |
| 10 | The exchange | barter, then coin; export knowledge and pepper | 1.5 w |
| 11 | The slice | play 20 continuous minutes, in a browser | 2 w |

**≈ 16 weeks solo · ≈ 9 weeks with two people.** Phases 6–9 parallelise cleanly against 3–5;
phases 1–5 do not parallelise and should not be rushed.

---

## Phase 1 · The workshop
*Nothing is playable. Everything after this depends on it.*

Stand up the folder structure from [`00-plan.md`](00-plan.md) §9 as real, empty packages.
Wire a test runner and CI.

**The one job that matters:** write the **determinism test**. It runs the sim twice from the
same seed and byte-compares the result, and it greps the `sim` package for `Math.random`,
`Date.now`, and `new Date()` and fails the build on a hit. Write it now, while the sim is
empty and the test trivially passes. Written later, it fails everywhere at once and gets
disabled — which is how every project that loses determinism loses it.

**Done when:** `npm test` runs green in CI and a deliberately-added `Math.random()` turns it red.

---

## Phase 2 · The spine as data
*The timeline stops being a document and becomes something the game can read.*

Per [`07-timeline.md`](07-timeline.md) §5: write `packages/schema/timeline.schema.json`,
write `tools/build-timeline.mjs`, and emit `data/timeline/timeline.json` from the 787 events
already written.

The generator enforces all seven validations, and three of them are load-bearing:

- Nothing with certainty below 0.9 may use a `dated` trigger — **uncertainty becomes
  mechanics, not a disclaimer.**
- Cadence hours sum to 210 and the pre-1300 share is ≥ 80% — asserted in code, so the
  emphasis you asked for **cannot silently drift back** toward the Mughals.
- Every `INVASION` carries a `becomes` field, even if the value is `"nothing"`.

**Done when:** `node tools/build-timeline.mjs` emits valid JSON, prints the W/M/R/m census we
have never actually computed, and names the eras that fail the 20-minute density check.

---

## Phase 3 · The clock
*Still no graphics. This is the most important unglamorous week in the project.*

The deterministic tick loop, at the five granularities in [`07-timeline.md`](07-timeline.md)
§2.5 — 5-yearly in the deep past down to daily after 1857, ~50,224 ticks total. It reads
`timeline.json`, advances, fires events when their triggers match, and writes a text log.

You run it and watch 7,947 years scroll past in a terminal.

**Done when:** two runs from one seed produce byte-identical logs, and the whole campaign
completes in under 10 seconds headless.

**Fails if:** the same seed gives different logs. Stop and fix it. Do not build on it.

---

## Phase 4 · The library
*The core system, in text.*

Implement [`05-knowledge-economy.md`](05-knowledge-economy.md) against the 89 works in
`data/corpus/works.json`:

- Works, and **carriers** — reciters, palm-leaf copies, birch bark, later paper
- **Decay**: palm leaf at a ~300-year half-life, so the corpus is standing upkeep, not research
- **Copying**: costs grain, takes a scribe's time, adds redundancy
- **Patronage**: grain to reciters, which is the entire pre-coinage knowledge economy
- **Derivation edges**, and prestige flowing backward along them
- The absolute rule: **a work is never deleted — it is reduced to zero surviving carriers**,
  and stays in the ledger forever, greyed, with its title, author, and year of loss

**Done when:** you can neglect the Rigveda for eight hundred simulated years and watch it go
grey in a text ledger — and the log tells you which century you lost it in.

---

## Phase 5 · The first loss — **the gate**
*One week. This is the phase that decides whether the project continues.*

Wire the 1193 catastrophe: Nalanda, Vikramashila, Odantapuri. Three parts:

1. **The warning.** History is pre-routed, so the player can see 1193 coming from roughly
   1000 CE. The corpus panel shows which works exist in exactly one place.
2. **The decision.** Copy texts out — to Tibet, to Sri Lanka, to the south. It costs grain
   and scribe-years you wanted for something else. This is the Aluvihare decision of 29 BCE,
   offered to the player ([`07-timeline.md`](07-timeline.md) Part 3B).
3. **The loss.** 1193 arrives. Whatever you did not copy goes grey, by name, forever.

Play it as text. No art, no map, no music.

> **The go/no-go:** if watching your own ledger go grey does not land — if it reads as a
> number changing rather than something being taken — then the differentiating system does
> not work, and we redesign now rather than after nine months of rendering. Everything from
> phase 6 onward is investment on top of this bet.

**Done when:** three people who did not build it play it and one of them replays to save
something they lost.

---

## Phase 6 · The table
*Now, and only now, graphics.*

Port `apps/basemap/index.html` — the working procedural renderer — into `render-realm` as
real code. **Nature only, in this order**, exactly as you specified: elevation and the
domain-warped ridge/swell/trough field · the 17 typed regions (Thar dunes, Rann saltflat,
Kuttanad depression, Deccan mesa terracing, badlands, deltas, fans) · the advected monsoon
and orographic rainfall · river-corridor alluvial fertility · the moisture-driven biome
tint · the two-scale hillshade.

**No borders. No polities. No units. No labels.** The land exists before anyone owns it.

Fix the four known faults while porting: Karakoram capsules, disc-like Tibet, no coastline
detail below 660 m, and height/rainfall computed on the main thread (move to a worker or
compute shader).

**Done when:** Thar reads arid, Assam and the Malabar coast read wet, the Deccan reads
seasonal, and the Kaveri and Gangetic deltas read green — verified by probing the field, not
by looking at it. That distinction is what caught the 18.7%-below-sea-level bug, which was
completely invisible on screen.

---

## Phase 7 · The dive
*The ladder becomes real.*

Camera and LOD for rungs L0–L9 (13.44 km/px down to ~26 m/px), streaming and evicting tiles
as you move. Then the piece that makes it feel like an object rather than a map:

> **The tilt-shift is a mechanic.** Depth of field is strongest fully zoomed out and falls to
> zero as you dive. The world stops being a model and becomes a place.

Landmarks in this range are **symbolic markers at fixed screen size**, deliberately out of
scale — pictorial-map grammar ([`08-visual-design.md`](08-visual-design.md) §6.3). True scale
starts at L10, which is phase 3 of the wider roadmap, not this plan.

**Done when:** you can go from the whole subcontinent to a single Chola village in one
continuous gesture at 60 fps, and the miniature-ness dissolves on the way in.

---

## Phase 8 · The hands
*The UI kit, built as a living thing rather than a spec.*

All eighteen components from [`08-visual-design.md`](08-visual-design.md) §9, as real
components in `packages/ui`: the ledger, the nested paper slips, the map-mode sheets that lay
*over* the model rather than replacing it, the corpus chest, the wax-seal notifications, the
eight incised pillar gauges.

Four rules hold across all eighteen: `--gold` means *yours* and nothing else · lost state is a
**lightness** shift, never a hue shift · nested slips are day-one, not retrofitted · every
component has an era variant driven by **material**, not colour.

**And the best idea the references gave us:** the table's materials change with the era —
bare earth and stone in 6000 BCE, palm leaf and copper, then paper and brass, then a Survey of
India lithograph and steel dividers by 1947. **The player reads the era off the desk without
being told.** No era indicator component is needed, and none is built.

**Done when:** the kit runs in a browser, both themes, all era variants, contrast validated.

---

## Phase 9 · The pieces
*Sprites. The first phase that spends your Magnific credits.*

The locked lighting rig from [`08-visual-design.md`](08-visual-design.md) §6.6 goes verbatim
into every prompt — that rig is the entire difference between a sprite sheet and a pile of
unrelated pictures.

**Do not generate 85 assets.** Generate **three** first — stupa, vimana, ashmound — pick the
one that best matches the references, and use it as the style reference for the other 82.
Then `images_remove_background`, trim, record the base-centre anchor, pack to atlas.

**Step 5 is the one nobody skips:** composite every finished sprite onto one test terrain
plate. Any asset whose shadow direction or warmth is off gets **regenerated, not
hand-corrected.**

The landmark set is the era-corrected one — ashmounds, megaliths, Dholavira's reservoirs,
Lothal's basin, Sanchi, Barabar, Nalanda, Ellora, Brihadeeswarar, Konark, Somapura,
Sisupalgarh. **The Taj Mahal is 1653 and anachronistic for 95% of this campaign.**

**Needs your explicit go before it runs.**

---

## Phase 10 · The exchange
*Trade, in the order history actually did it.*

- **Barter first.** Grain against knowledge, shell against copper, pepper against everything.
  No abstract store of value exists, and the UI should not pretend one does.
- **Then coin.** Bent-bar silver ~660 BCE → punch-marked karshapana ~550 BCE → the full
  monetary ladder. **The arrival of money is an era transition the player feels.**
- **Export knowledge, early.** A text goes out with a monk or a merchant.
- **Export spices, early.** Pepper enters long-distance trade around 300 BCE and never leaves.
- **Goods arrive by calendar, through trade.** Paper displaces palm leaf ~1350 and recopying
  costs collapse. Chilli, potato, tomato, maize and tobacco appear only after 1498 — and they
  arrive **because a ship arrived**, not because a tech unlocked.

> **The one open design question, and phase 10 is where it has to be answered:** when you
> export a text, does that also create a **surviving copy abroad**? Say yes and trade income
> and corpus survival become the same decision — which is what actually happened at
> Aluvihare, at Tibet, and with Xuanzang's 657 texts. My recommendation is **yes**, because it
> makes the game's two biggest systems into one system instead of two. It is your call and it
> should be made before this phase starts, not during.

---

## Phase 11 · The slice
*Assemble everything into twenty continuous minutes.*

One region — the Chola country. One window — 850 to 1279. Terrain, dive, ledger, library,
trade, and 1193 at the end of it. Then compile the same codebase to the web target and put it
behind a link.

The web cut is not a second product. It is the demo, and it is **nearly free** because the
sim is already headless Rust-or-TS and the renderer is already `wgpu`-shaped. For a title
nobody has heard of, with no genre precedent, a shareable twenty-minute link is the whole
marketing plan.

**Done when:** somebody who has never seen this project plays it start to finish without you
in the room, and asks what happens next.

---

# Part C — Two decisions to make before phase 1

## C.1 Language: build phases 1–5 in TypeScript, not Rust

[`00-plan.md`](00-plan.md) §11 settles the product on **Rust + wgpu**, and that is still
right — it is one codebase for desktop and web, it removes the browser memory ceiling, and it
is 1.2–2× faster on exactly our hot path.

**But phases 1–5 have no graphics at all**, and Rust's real cost is the 2–3 months of
rebuilding the map substrate that MapLibre was giving us free. That cost lands in phase 6,
not before.

> Phases 1–5 are perhaps 3,000 lines of headless logic whose entire purpose is to answer one
> question fast. Porting 3,000 proven lines to Rust in month four is a week. Discovering in
> month four that the loop is not fun is the project.

So: **TypeScript for 1–5, Rust + wgpu from 6 onward.** The one caveat is that floating-point
determinism across platforms needs care in TS — use integer or fixed-point arithmetic for
anything the decision log depends on, and the phase-1 test will catch drift immediately.

## C.2 The two legal constraints are architecture, not paperwork

Both are already load-bearing in the design and must not be quietly dropped during a phase:

- **The India outline currently in the repo is a visual emphasis mask only.** It must be
  replaced with Survey of India geometry before any India release — Criminal Law (Amendment)
  Act 1990. **Phase 6 is where this gets confronted**, because that is where the outline
  becomes shipped rendering rather than a prototype convenience.
- **Sub-metre detail (L15–L16) is procedural by design and never shipped as data** — India
  Geospatial Data Guidelines 2021, 1 m threshold. This is why `worldgen` is a pure function
  rather than a cache, and it is a design advantage rather than a limitation: the recipe is
  138 KB where the data would be gigabytes.

---

# Part D — What is already done

Nothing in phases 1–11 starts from zero. Standing today:

- **Six design documents**, settled: plan, data spine, simulation, eras, knowledge economy,
  pillars and campaign — plus timeline, visual design and procedural map.
- **Three validated datasets**: 146 polities and 70 rule relations · 89 works with an
  acyclic derivation graph and 11 catastrophes · coastline, rivers, and 103 orography control
  points with 17 typed terrain regions.
- **Five JSON schemas** — the contracts.
- **Seven working generators** in `tools/`.
- **A rendering procedural basemap** at `apps/basemap/index.html`, with a monsoon model that
  reads Thar arid at 0.23 and Assam wet at 0.77.
- **787 timeline events written**, of a ~1,150 target.

**Phase 1 starts Monday with a repo that already knows what it is.**
