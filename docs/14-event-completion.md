# Completing the Spine — phases 23 to 33

**787 of 1,150 events written. 363 remain.** This document marks exactly which
ones, and sequences the writing.

Every figure here comes from `tools/timeline-gaps.mjs`, so the plan can be
re-derived rather than believed:

```bash
npm run gaps
```

---

## Part A — The register

### A.1 The headline

| | |
|---|---:|
| Written | **787** |
| Target | 1,150 |
| **Remaining** | **363** |
| Pre-1300 share | 93.9% |
| Disputed, flagged | 36 |
| Tier-1 authored cards | 22 of ~300 |

### A.2 Where the clock outruns the content

The rule is one authored event per twenty minutes of play
([`07-timeline.md`](07-timeline.md) §5.2 rule 7). Eight eras fail it.

| Era | Hours | Events | min/event | Short |
|---|---:|---:|---:|---:|
| Early Neolithic | 12 | 36 | 20.0 | — |
| Late Neolithic & Chalcolithic | 12 | 36 | 20.0 | — |
| Early Harappan | 11 | 37 | 17.8 | — |
| **Indus Civilisation** | 20 | 57 | 21.1 | **3** |
| Late Harappan | 10 | 31 | 19.4 | — |
| Early Vedic | 10 | 37 | 16.2 | — |
| Late Vedic | 9 | 34 | 15.9 | — |
| **Second Urbanisation** | 15 | 39 | 23.1 | **6** |
| **Mauryan** | 13 | 30 | 26.0 | **9** |
| **Classical** | 18 | 45 | 24.0 | **9** |
| **Gupta & Post-Gupta** | 15 | 36 | 25.0 | **9** |
| **Regional Kingdoms** | 10 | 26 | 23.1 | **4** |
| **The Chola Age** | 18 | 53 | 20.4 | **1** |
| **Delhi & Vijayanagara** | 14 | 15 | 56.0 | **27** |
| **Early Modern** | 10 | 11 | 54.5 | **19** |
| **Colonial** | 13 | 14 | 55.7 | **25** |
| | | | | **112** |

> **The Mauryan era is the densest in the game by clock — 5.7 minutes per
> in-game year — and one of the thinnest by content, at 26 minutes between
> events.** It is the era of the edicts, the first subcontinental state and the
> return of writing after sixteen centuries, and it currently has thirty events.
> That mismatch is the single worst one in the table.

The skim eras are thin by design, but not *this* thin: 56 minutes between events
is four minutes short of an hour in which nothing is authored at all.

### A.3 The class register — and an arithmetic problem

| Class | Have | Target | Short | Why it matters |
|---|---:|---:|---:|---|
| `SITE` | 112 | 210 | **98** | The workhorse of the ancient game |
| `REFORM` | 71 | 150 | **79** | Renouncers, bhakti, the caste question |
| `WORK` | 142 | 220 | **78** | The corpus itself |
| `CATASTROPHE` | 14 | 80 | **66** | **The core loss mechanic has 14 events** |
| `INVASION` | 41 | 95 | **54** | Each needs a `becomes` |
| `FRONTIER` | 10 | 60 | **50** | The treeline thesis rests on ten events |
| `CLIMATE` | 7 | 50 | **43** | **The antagonist with no face has seven** |
| `FOUNDATION` | 112 | 140 | 28 | |
| `COLONIAL` | 5 | 30 | 25 | |
| `TRANSITION` | 118 | 130 | 12 | |
| `TRADE` | 60 | 70 | 10 | |
| `EPOCH` | 19 | 16 | — | over |
| | | | **543** | |

> **The targets do not reconcile with the total, and this is the first time
> anyone has checked.** The per-class targets in
> [`07-timeline.md`](07-timeline.md) §1.3 sum to **1,251** against a stated
> total of **1,150** — over by 101. They were set class by class without anyone
> adding them up.
>
> So the shortfall of 543 cannot be closed by writing 363. Something gets cut,
> and the choice should be deliberate rather than accidental. Part B makes it.

### A.4 The three classes that are starved relative to their design weight

This is the finding that should drive the order of work.

- **`CLIMATE` has seven events.** The design says climate is the ancient game's
  antagonist and that it has no face — twenty hours of Indus play end with
  nobody to fight. Seven events cannot carry that.
- **`FRONTIER` has ten.** `THR.THE_INTERNAL_FRONTIER` runs 4500 BCE to 1947 and
  the thesis is that *for most of the campaign the frontier is not a border, it
  is the treeline*. Ten events across seven millennia is a footnote, which is
  exactly what the design said it must not be.
- **`CATASTROPHE` has fourteen.** The corpus-loss mechanic is the thing the whole
  game is built around, and 1193 is doing most of the work alone.

**All three are underweight because they are the hardest to write.** A site
foundation is a line in an excavation report; a climate event needs a
speleothem record and an argument about what it caused.

### A.5 Silent stretches

Eleven runs of more than sixty years with nothing authored, none over 120. All
eleven are in **6000–4000 BCE** — the Neolithic, where the record is thinnest and
the clock is fastest (29 seconds per in-game year). Those centuries pass in
about fifty seconds each, so a silent century is a survivable fifty seconds; it
is still fifty seconds of nothing.

### A.6 Regional spines

| Region | Events | Span |
|---|---:|---|
| Tamilakam | 39 | 2172 BCE – 1150 CE |
| Karnataka | 30 | 4500 BCE – 1150 CE |
| Andhra & Telangana | 22 | 2000 BCE – 1323 CE |
| Bengal & Vanga | 21 | 1500 BCE – 1352 CE |
| Assam & the Northeast | 20 | 2500 BCE – 1450 CE |
| Maharashtra & western Deccan | 20 | 1600 BCE – 1317 CE |
| Kerala | 18 | 1000 BCE – 1498 CE |
| Gujarat & Saurashtra | 18 | 3300 BCE – 1150 CE |
| Odisha & Kalinga | 17 | 1200 BCE – 1434 CE |
| Kashmir | 16 | 3000 BCE – 1339 CE |
| Sri Lanka | 15 | 900 BCE – 1160 CE |
| Rajasthan & western desert | 14 | 4500 BCE – 1192 CE |

**Nine of twelve stop before 1200 CE.** A Kannada or Gujarati player reaches the
thirteenth century and their own spine simply ends, leaving them on the
subcontinental feed — which is the failure the regional spines exist to prevent.

---

## Part B — The allocation

363 events. Where they go, and what is deliberately not closed.

| Class | Allocated | Closes the gap? |
|---|---:|---|
| `CATASTROPHE` | **66** | fully |
| `FRONTIER` | **50** | fully |
| `CLIMATE` | **43** | fully |
| `SITE` | 70 | leaves 28 |
| `WORK` | 45 | leaves 33 |
| `REFORM` | 40 | leaves 39 |
| `INVASION` | 30 | leaves 24 |
| `COLONIAL` | 19 | leaves 6 |
| | **363** | |

**The three starved classes are closed completely and first.** They are closed
first because they are hardest, because the design leans on them hardest, and
because leaving the hardest work last is how it does not get done.

`FOUNDATION`, `TRANSITION` and `TRADE` get nothing new: they are the closest to
target already and the least load-bearing. **That is the cut, made on purpose.**

---

## Part C — The phases

Each phase ends with the generator passing and the register measurably shorter.

| # | Phase | Events | What it is |
|--:|---|---:|---|
| 23 | The rivers turn | 43 | Every `CLIMATE` event |
| 24 | The treeline | 50 | Every `FRONTIER` event |
| 25 | The corpus at risk | 66 | Every `CATASTROPHE` event |
| 26 | The gazetteer | 70 | `SITE` events from excavation reports |
| 27 | The composers | 45 | `WORK` events, wired to the corpus |
| 28 | The renouncers | 40 | `REFORM`: schisms, bhakti, the caste question |
| 29 | What it became | 30 | `INVASION`, each with its `becomes` |
| 30 | The skim, rebuilt | — | Redistribute into eras 14–16 |
| 31 | The twelve spines | — | Carry every region to its real end |
| 32 | Three hundred cards | — | Tier-1 authored copy |
| 33 | The specialist pass | — | Historian and archaeologist; release gate |

Phases 30–32 write no *new* events: they place, extend and dress the ones
phases 23–29 produce.

---

### Phase 23 · The rivers turn — 43 `CLIMATE` events

The antagonist with no face, given a body of evidence.

- The **8.2 and 4.2 kiloyear events** in detail, not as single lines
- **Ghaggar-Hakra decline**, phase by phase, with the settlement drift east
- **Indus and Yamuna avulsions** — rivers that moved and took towns with them
- **Monsoon regime shifts**: the Holocene optimum, the medieval anomaly, the
  Little Ice Age as it registers in India
- **Documented famines** before the colonial series, which the record does hold
- **Kaveri and Godavari flood sequences**, which is where the Chola tank system
  was answering something

**Evidence base:** speleothem records from Indian and Omani caves, lake cores,
palaeo-channel survey on the Ghaggar-Hakra, and settlement abandonment
sequences. Every one of these events gets an `evidence` line naming which.

**Done when:** a player can lose a campaign to weather and see why in the cards.

---

### Phase 24 · The treeline — 50 `FRONTIER` events

The internal frontier, from footnote to thread.

- The **clearance line moving east** with the iron axe, century by century
- **Ashmound-builders, Bhil, Gond, Khasi, Naga, Santhal, Toda, Irula** — each
  with events of their own, not only events about them
- **Shifting cultivation against settled agriculture** as a running argument
- **Forest polities that became kingdoms** — the Gond especially, because the
  frontier is not a permanent condition and the record shows it
- **What the settled record did not write down**, marked `ABSENT`, because a
  gap the game admits is worth more than a gap it papers over

> **This is the phase most likely to be done badly.** Get it wrong and the game
> reproduces exactly the story it was built to complicate. It should not ship
> without the specialist review in phase 33.

---

### Phase 25 · The corpus at risk — 66 `CATASTROPHE` events

The core mechanic currently rests on fourteen events and one fire.

- **Library and monastery losses**: Taxila, Valabhi, Nalanda, Vikramashila,
  Odantapuri, Somapura, and the smaller ones nobody names
- **Neglect as catastrophe** — the palm-leaf half-life expressed as datable
  losses, which is the quiet lesson the design cares about most
- **Flood, fire, damp, insects**: the manuscript's real enemies
- **Colonial manuscript removal, 1784–1947** — displacement, not destruction,
  and the distinction matters mechanically because a displaced work survives
- **Recovery events**: Nambi Andar Nambi finding the Tevaram, the Aluvihare
  decision, Xuanzang's 657 texts. **Loss needs its counterweight or the ledger
  only ever goes one way.**

---

### Phase 26 · The gazetteer — 70 `SITE` events

The most mechanical phase, and the most tractable.

**Source base:** *Indian Archaeology: A Review* (ASI annual, 1953–), site
monographs, and standard excavation reports. Each excavated site yields
foundation, peak, transition and abandonment events with published dates and
error bars — four events from one report.

Priority order is the thin eras: Mauryan, Classical, Gupta, Regional Kingdoms.

---

### Phase 27 · The composers — 45 `WORK` events

Every work in `data/corpus/works.json` should have a composition event, and
does not. This phase closes that and adds the commentaries — because prestige
flows backward along derivation edges, and a commentary is what makes an
endowment keep paying.

---

### Phase 28 · The renouncers — 40 `REFORM` events

Buddhist and Jain councils and schisms · the Ajivikas · the bhakti movements
region by region · Basava and the Sharanas · the Sant tradition · **the caste
question as a 2,900-year thread**, from the four-varna hymn to Ambedkar.

`THR.THE_CASTE_QUESTION` is currently a thread with almost no events on it.

---

### Phase 29 · What it became — 30 `INVASION` events

Every `INVASION` already carries a `becomes` field, because the generator
refuses one without it. This phase makes the field earn its place:

> Kushans funded the workshops that made the first Buddha images. Turks built
> the Sultanate that produced Amir Khusrau. **A game that renders these purely
> as destruction tells a false story and throws away its best arc.**

---

### Phase 30 · The skim, rebuilt

Eras 14–16 sit at ~56 minutes between events. The skim is deliberately thin
([`07-timeline.md`](07-timeline.md)) but that is an hour of play with nothing
authored. Redistribute 71 of the events from phases 23–29 into 1279–1947 and
bring all three eras under the 20-minute rule.

**The weighting does not move.** The generator asserts pre-1300 ≥ 80% and the
test fails the build if it drifts.

---

### Phase 31 · The twelve spines

Carry every regional spine to its real end rather than stopping at 1150 or 1200.
Roughly 15 events each, weighted to the nine that currently stop early.

**Done when** no player reaches a century in which their own region has nothing
to say.

---

### Phase 32 · Three hundred cards

22 Tier-1 cards exist; ~300 `W` events want one. Bespoke copy, the evidence
slot, and dispute treatment where scholarship is divided.

**~90 words of prose per card across the four prose slots — about 27,000 words
for this phase, and roughly 104,000 for the full 1,150.** That is a short book,
and it is the single largest content task in the project.

---

### Phase 33 · The specialist pass

**The release gate.** Nothing above ships without it.

The `dispute` list is long and several entries are politically live in India
right now — Keeladi is an open Centre–State dispute as of 2025. The rule is
fixed and enforced by tests: **the game presents the argument and does not
adjudicate.** But which arguments to present, and how to frame them, needs an
archaeologist and a historian, and phase 24 needs a cultural reviewer as well.

**This is a hiring requirement, not a footnote**, and it has been stated in
every plan since the first.

---

## Part D — What is still not a phase

Stated plainly, because a plan that hides its omissions is not a plan.

1. **Survey of India geometry.** The current India outline is a visual mask and
   must be replaced before any India release — Criminal Law (Amendment) Act
   1990. A release blocker, and nobody's phase.
2. **The 85 generated sprites.** Three anchors exist; the environment's network
   policy blocks the image host, so they cannot be fetched into the build.
   Blocked on an allowlist change, not on work.
3. **The Indus era's twenty hours.** Twenty hours whose antagonist is the
   climate and which end with nobody to fight. Phase 23 supplies the events;
   nothing has yet attempted the *play*, and it remains the design's hardest
   promise.
4. **The remaining 180 class-target events** that a 1,150 total cannot hold.
   Either the target rises to ~1,330 or the cut in Part B stands.

---

## Part E — Execution record (phases 23–32 closed)

Written after the fact, because a plan that never reports back is a wish.

| Phase | Delivered | The correction it forced |
|---|---|---|
| 23 | 43 CLIMATE | Permanent pillar damage became healing shocks — 43 droughts had ground AGRICULTURE to zero |
| 24 | 50 FRONTIER | — |
| 25 | 66 CATASTROPHE, 22 of them rescues | Events gained a `corpus` field (destroy/none/preserve, with per-event severity); a timeline of losses with no Aluvihare ran the corpus to three works |
| 26 | 78 SITE | — |
| 27 | 60 WORK | Composition events name their work outright; the scriptorium stopped copying from carriers held abroad; a teacher sent abroad stopped being a permanent loss |
| 28 | 61 REFORM, 23 on the caste thread | The pillar curve gained diminishing returns — seven of eight gauges had pegged at 100 by the year 1000 |
| 29 | 51 INVASION | `becomes` finally says something: all forty-one document invasions carried the placeholder string "nothing" |
| 30 | 63 events, 1279–1947 | Two warnings became assertions (the 20-minute rule; the 82%-of-playtime weighting). The 41-event skim and the 20-minute rule were arithmetically incompatible; density won |
| 31 | 215 regional | The event-count share was restated honestly: playtime weighting holds at 82%, event count cannot also hit 80% while the density rule stands |
| 32 | 343 Tier-1 cards (~28,500 words) | 107 events written twice were collapsed; the engine keyed corpus effects off `corpus`, not class |

Final state: **1,347 events**, 88 collapsed duplicates, 72 disputed entries, 343
authored cards, all 260 tests green, and every era under the 20-minute rule.

Phase 33 remains open and is documented as a briefing in
[`15-specialist-pass.md`](15-specialist-pass.md). It is a hire.
