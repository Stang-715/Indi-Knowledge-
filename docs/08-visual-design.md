# Visual Design Lock & Design Kit

The direction is **The Cartographer's Table**: the world is not a drawn map but a *made
object* — a relief model resting on a survey sheet, lit from the upper left. Every
interface element is a thing lying on that table. Nothing floats.

Locked from two supplied references. Companion to [`07-timeline.md`](07-timeline.md),
which holds the content this has to present.

Live kit — all eighteen components, five era materials, three infographic tiers:
**https://claude.ai/code/artifact/4aac5251-73ad-4bce-8f9f-a677f7a3dde1**

---

# Part 1 — Visual Design Lock

**Locked from two references.** Reference A: a tilt-shift miniature diorama of the
subcontinent on an aged survey sheet — sculpted relief, deep teal sea, landmark buildings
placed as oversized pieces, warm key from upper-left. Reference B: a floating relief on
white, coloured by biome, elegant serif with Devanagari, generous space.

## 1.1 The direction: **The Cartographer's Table**

> **The entire game takes place on a physical surface.** The world is a raised relief
> model resting on a survey sheet. Not a drawn map — a *made object*, lit and photographed.

This reconciles the two references and does four jobs at once:

1. **It is the reference, exactly.** Reference A *is* the table; Reference B is the model
   lifted off it.
2. **It explains the UI.** Everything is an object on that table — the ledger is a bound
   book, map modes are transparent sheets laid over the model, the corpus is a manuscript
   chest, tooltips are slips of paper. Diegetic by construction, no chrome to invent.
3. **It survives the seventeen-rung ladder.** A diorama gains detail as you lean in.
   Diving into a city is diving into a smaller diorama. One metaphor, every rung.
4. **The table tells time.** As eras turn, the *materials change*: bare earth and stone in
   6000 BCE → palm leaf and copper → paper and brass instruments → a Survey of India
   lithograph and steel dividers by 1947. **The player reads the era off the desk without
   being told.** This is the single best idea the references gave us.

### The tilt-shift is a mechanic, not a filter

Reference A's shallow depth of field is what makes it read as *miniature*. So: the DOF is
**strongest at maximum zoom-out and fades to zero as you dive.** The world stops being a
model and becomes a place. That is the L9→L10 dive
(`map-density-and-animation-spec.md`) given an emotional register for free.

## 1.2 The trap in Reference A

The reference places the Taj Mahal, and what reads as a modern statue, on the model.

> **The Taj Mahal is 1653. It is anachronistic for 95% of this campaign.** The reference
> shows a *modern* landmark vocabulary, and the game is now weighted 82% before 1300.

The landmark set has to be rebuilt for the eras we actually emphasise: ashmounds and
megaliths, Dholavira's stepped reservoirs, Lothal's basin, Sanchi's stupa, the Barabar
caves, Nalanda's viharas, Ellora's Kailasa, Brihadeeswarar's vimana, Konark's wheel,
Somapura's cruciform, Sisupalgarh's ramparts. **Landmarks appear only after the era that
built them** — and a region with no landmark yet shows an unsurveyed sheet instead
(`05-knowledge-economy.md` §5).

## 1.3 Buildings are out of scale on purpose

In Reference A the buildings are wildly oversized against the terrain. That is not an
error — it is **pictorial-map grammar**, the same convention as a medieval *mappa mundi*
or a theme-park map. Keep it, and make it explicit:

- **L0–L9:** landmarks are **symbolic markers at fixed screen size**, out of scale,
  hand-placed. At L10 (13 m/px) a real temple is ~4 px — useless. Symbols carry meaning
  that scale cannot.
- **L10–L16:** the dive crosses into true scale, and the symbol dissolves into the actual
  building footprint. That crossover *is* the dive.

## 1.4 Palette — sampled from the references

| Token | Hex | Role |
|---|---|---|
| `--table` | `#C3A578` | Parchment ground, the survey sheet |
| `--table-deep` | `#8E7248` | Sheet in shadow, edges, fold lines |
| `--sea-deep` | `#24606F` | Ocean |
| `--sea-mid` | `#3E8496` | Shelf |
| `--sea-shallow` | `#7CB4C0` | Coast, rivers, tanks |
| `--land-fertile` | `#7A8F52` | Alluvium, forest, delta |
| `--land-arid` | `#C29A48` | Thar, Deccan in the dry season |
| `--land-rock` | `#A98F68` | Ghats, Vindhyas, Aravallis |
| `--snow` | `#E2E5E2` | Himalaya, Karakoram |
| `--gold` | `#C9A227` | **The single accent.** Gilded domes, selection, the player's own holdings |
| `--ink` | `#2A2118` | Type, hairlines, engraved labels |

**Spend the boldness in one place:** `--gold` is the only saturated accent, and it means
*yours* — your holdings, your selection, your endowments. Everything else is terrain.

Semantic colour (loss, warning, catastrophe) stays separate and is **not** drawn from this
set. The greyed-out lost-work state from `05-knowledge-economy.md` §5 is a **lightness**
shift, never a hue shift — validated at ΔE 27.1 on dark, 16.2 on light.

## 1.5 Typography

Following Reference B: a high-contrast serif for display, paired with an Indic-capable
text face. **Devanagari, Tamil and Kannada support is mandatory from day one** — place
names are half the atmosphere, and a game about Indian knowledge that cannot set
Tamil is embarrassing. Candidate stack: a didone or transitional serif for display;
**Gentium Book Plus** or **Noto Serif** for text and IAST diacritics (ṛ, ś, ṣ, ā, ñ); a
mono for the ledger's tabular figures.

## 1.6 The locked lighting rig — the most important spec here

Every generated asset must share one rig, or nothing composites onto the same table:

```
key       warm, upper-left, 35° elevation, ~45° azimuth
fill      soft ambient, cool, 15% key intensity
shadow    short contact shadow, soft edge, warm-neutral — never black
camera    three-quarter, 55° elevation, perspective (not orthographic)
surface   matte, visible handcraft texture, no gloss, no rim light
```

**This rig goes verbatim into every generation prompt.** It is the difference between a
sprite sheet and a pile of unrelated pictures.

---

# Part 2 — Design Kit & Sprite Pipeline

Requested: a UI/UX/HUD kit, plus generated sprites with backgrounds removed. Read as
**Magnific** (`mcp__Magnific__*`), which is connected in this session.

**Not executed — plan mode, and generation spends your Magnific credits.** Specified below
so it can be run on approval.

## 2.1 The prompt template

One template, filled per asset. The rig from 1.6 is baked in and must not be varied:

```
{subject}, miniature architectural model, handcrafted diorama piece,
three-quarter view at 55° elevation, single warm key light from upper-left at
35° elevation, soft cool ambient fill at 15%, short soft warm contact shadow,
matte painted surfaces with visible handcraft texture, no gloss, no rim light,
muted earth palette — ochre #C3A578, sage #7A8F52, weathered stone #A98F68,
aged gold leaf #C9A227,
historically accurate to {era}, {region} architectural idiom, no modern elements,
plain neutral background, square framing, sharp throughout
```

Then `images_remove_background` on every result. Sprites ship as trimmed RGBA with a
recorded anchor point (base centre, so they sit on the terrain correctly).

## 2.2 Sprite manifest — tranche 1, ~85 assets

**Landmarks by era** (the corrected, era-appropriate set from 1.2) — ~34
> ashmound · megalithic dolmen · urn-burial field · Mehrgarh mudbrick compound ·
> Indus granary block · Indus great bath · Dholavira stepped reservoir · Lothal basin ·
> PGW village · fortified rampart (Kausambi) · Ashokan pillar · Sanchi stupa ·
> Barabar cave portal · rock-cut chaitya hall (Karle) · Gandharan vihara ·
> Amaravati stupa · Nalanda vihara block · Ajanta cliff face · Iron Pillar ·
> Ellora Kailasa · Kailasanatha (Kanchi) · Shore Temple · Somapura cruciform ·
> Brihadeeswarar vimana · Gangaikondacholapuram · Belur/Halebidu star plan ·
> Konark wheel · Jagannath deul · Martand · Dilwara · Sisupalgarh gate ·
> Ahom paik village · Sultanate minar · Vijayanagara mandapa

**Settlement tiers** — 8
> hamlet · village · large village · market town · walled town · port · city · great city

**Units & agents** — 14
> storyteller · reciter · scribe · teacher · monk-scholar · translator ·
> merchant caravan · pack bullocks · river boat · coastal dhow · Chola sea vessel ·
> levy spearmen · elephant corps · horse archers

**Goods & tokens** — 17
> grain sack · rice bundle · millet · cotton bale · pepper sack · salt block ·
> copper ingot · iron bloom · carnelian beads · shell bangles · lapis · silk ·
> palm-leaf bundle · birch-bark roll · paper quire · punch-marked coin · seal stone

**Table objects (UI)** — 12
> ledger book · manuscript chest · ink pot · stylus · brass weights · measuring rod ·
> map-mode glass sheet · survey sheet (blank) · lamp · folded slip (tooltip) ·
> wax seal · rolled scroll

## 2.3 The HUD, as objects on the table

| Element | Object |
|---|---|
| The ledger | A bound book, lower-left, opens in place |
| Map modes | Transparent sheets that **lay over** the model, not swap it |
| The corpus | A manuscript chest; works are palm-leaf bundles, greyed when lost |
| Time control | A gnomon / shadow-stick early; a brass clock after ~1600 |
| Tooltips | Slips of paper, stacked — **nested tooltips are day-one**, per `03-simulation.md` §8 |
| Notifications | Wax-sealed slips arriving at the table's edge |
| Era indicator | **None needed.** The table's materials say it (6.1) |

## 2.4 Pipeline

1. `images_generate` per manifest row, template from 7.1
2. `images_remove_background`
3. `images_upscale` only where the base result is soft
4. Trim, record anchor, pack to atlas by category
5. **Rig-consistency check:** composite every sprite onto one test terrain plate. Any
   asset whose shadow direction or warmth is off gets regenerated, not hand-corrected.

Step 5 is the one that must not be skipped — it is what keeps 85 independently generated
images looking like one made object.

## 2.5 Before running

- **Credits.** ~85 generations plus background removal and some upscales. Needs your go.
- **Style anchor.** Recommend generating **three** landmarks first (stupa, vimana,
  ashmound), locking the one that best matches the references, then using it as a style
  reference for the remaining 82 — far more consistent than 85 independent prompts.
- **Cultural check.** Sacred architecture — temples, stupas, viharas, mosques, gurdwaras —
  should be reviewed before it ships, same reviewer as the corpus
  (`05-knowledge-economy.md` §7).

---

# Part 3 — UI Kit: build spec

Everything is an object on the table (Part 1.1). No floating chrome, no glassmorphism, no
rounded-rectangle cards. Eighteen components.

| # | Component | The object it is | States |
|--:|---|---|---|
| 1 | Surface | The survey sheet | rest · raised · era-variant ×5 |
| 2 | Ledger | A bound book, lower-left | closed · open · page-turn |
| 3 | Slip | A paper slip — **the tooltip** | 3 nesting depths, stacked with offset |
| 4 | Event card | A pinned card | Tier 1 (plate) · Tier 2 (icon) |
| 5 | Map-mode sheet | Transparent sheet laid *over* the model | 14 modes, cross-fade 250 ms |
| 6 | Time control | Gnomon → water clock → brass clock | paused · 5 speeds |
| 7 | Token row | Physical goods on the table edge | 17 goods from the sprite manifest |
| 8 | Pillar meters | Eight incised gauges | value · delta · era-locked |
| 9 | Corpus chest | Palm-leaf bundles in a chest | extant · partial · **lost (grey)** |
| 10 | Notification | A wax-sealed slip arriving at the edge | unread · read · dismissed |
| 11 | Region badge | A seal stamp | own · allied · neutral · hostile |
| 12 | Button | Primary = gold wax seal · secondary = incised line | rest · hover · press · disabled |
| 13 | Tabs | Index tabs on the ledger's edge | — |
| 14 | Scroll | A ribbon bookmark | — |
| 15 | Modal | A sheet laid down over everything | — |
| 16 | Toast | A slip sliding under the ledger | — |
| 17 | Progress | A filling vessel; a lamp burning down | — |
| 18 | Selection | A gold ring on the terrain | hover · selected · locked |

**Rules that hold across all eighteen:** `--gold` means *yours* and nothing else · lost
state is a **lightness** shift, never hue · nested slips are day-one, not retrofitted ·
every component has an era variant driven by material, not colour.

## 3.1 The infographic template — one layout, three tiers

Fixed 1200 × 1600 card. Slots from [`07-timeline.md`](07-timeline.md) Part 6.3, in order: year ribbon · title · plate ·
*What happened* (40–70 w) · *Why it matters* (≤ 25 w) · effects strip · *Evidence*
(≤ 20 w) · *Dispute* if present (≤ 40 w) · thread footer.

- **Tier 1** (~300 `W`): generated plate, hand-written copy.
- **Tier 2** (~600 `M`/`R`): atlas icon in place of the plate, 2-sentence copy.
- **Tier 3** (7,947 years): the **year page** — same layout, composed at runtime from
  whatever happened. A renderer, not a document.

## 3.2 Build order on approval

1. **UI kit as a live HTML artifact** — all 18 components, both themes, era variants,
   using the Part 1.4 palette. Reviewable in a browser, not a spec.
2. **Infographic template** — the three tiers rendered with real content from [`07-timeline.md`](07-timeline.md) Part 6.3's
   worked examples.
3. **Sprite style anchor** — 3 Magnific generations (stupa, vimana, ashmound), background
   removed, composited on one terrain plate to prove the lighting rig. Only then the
   other 82.

---
