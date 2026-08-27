# The Gap Closure — phases 34–44, and the track that is not phases

**Written against the audit of 2026-08-25: every promise in docs/00–15 checked against
the data and the code.** 1,347 events, 343 cards, 260 tests green — and a specific,
countable list of what is still missing. This document turns that list into a plan.

---

## Part A — What a master developer would say first

Three judgements before any phase list, because the ordering below falls out of them.

**1. Content is no longer the bottleneck. Play is.**
Phases 23–32 proved the pipeline: events go in, tests catch what breaks, the world gets
richer. The temptation is to keep feeding it — 53 more events, then 53 more. Resist it.
The game currently has 1,347 authored moments and roughly *zero minutes of validated
play*. Nobody has sat through an hour of the Neolithic and reported whether 29 seconds
per year is meditative or dead. Every remaining content gap is small and mechanical;
the play gaps are existential. So the plan front-loads the systems that make the hours
playable (the procedural layer, the event payload, the Indus loop) and pushes content
top-ups to the back, where they belong.

**2. The data model owes the simulation three fields, and until they are paid,
1,347 events are mechanically about twelve.**
Every CLIMATE event does the same thing to the same pillars at the same three weights.
Every event lands on one of twelve regions, no closer. The engine cannot tell the
Kalinga war from a border skirmish except by magnitude. `affects` and `where` are not
schema completeness — they are the difference between a timeline the player *reads*
and one they *feel*. This is the highest-leverage engineering in the plan and it goes
first among the build phases.

**3. Decisions rot faster than code.**
Five design rulings have been open since documents 00 and 11 — slice location, caravan
rendering, player raiding, escort micromanagement, the standing cap. Every week they
stay open, code gets written that quietly assumes an answer. A master developer closes
decisions on a schedule, in writing, even when the answer is "the cheap option, revisit
after playtest." Phase 34 is one working session and it unblocks four later phases.

The dependency shape:

```
34 Decisions ──┬─→ 37 Texture engine ──→ 38 The Indus loop ──→ 43 Playtest
               │         ↑
35 Payload ────┤         │ (texture reads affects/where)
36 Threads ────┘         │
39 Occupations & conditionals ─┘
40 Content top-up ──→ (feeds 43's build)
41 Indic text ─────→ 43
42 Card export ────→ 43
44 Housekeeping — any time, before 43 ships to a tester

External track (no phase number): the hire · the jurisdiction ruling ·
Survey of India geometry · the CDN allowlist → sprite generation
```

---

## Part B — The phases

### Phase 34 · The rulings — close every open decision *(one session, do it first)*

Six decisions, each of which gets a written ruling in the doc that opened it. The
recommendation is stated here so the session is ratification, not research:

1. **Vertical slice location** (00-plan §12.3): **slice in the Chola era, 985–1070.**
   Not colonial (best data, wrong message) and not Neolithic (the hook, but it needs
   phase 37 first). The Chola window has the densest real data, exercises every system
   — trade, temple economy, corpus, sovereignty, the fleet — and it is where a
   skeptical playtester can be won in two hours.
2. **Caravan rendering** (11-trade §10.1): **sprites in the viewport, flow lines
   elsewhere.** The camera already knows what is on screen; the cutover is a render
   flag, not an architecture.
3. **Player raiding** (11-trade §10.2): **no.** The campaign frame is custodial; the
   verb would poison the trust ladder's meaning. Revisit only if a playtest says the
   defensive game lacks teeth.
4. **Escort micromanagement** (11-trade §10.3): **standing orders per route**, manual
   control only for the caravan being watched. Two hundred hours of per-caravan
   assignment is a spreadsheet, and the plan already knew it.
5. **Standing cap** (11-trade §10.4): **yes — diminishing returns per partner per
   generation**, same curve family as the pillar fix from phase 28 (`bumpPillar`'s
   squared headroom), so the trust ladder cannot be farmed with surplus grain.
6. **The class-target arithmetic** (14-event §D.4): **the targets are retired.** The
   register served its purpose — it drove ten phases — but 1,347 events against a
   1,150 total with per-class targets summing to 1,330 is three numbers describing one
   corpus. From here the binding constraints are the *density rule* (20 min/event, per
   era, already asserted) and the *silence rule* (phase 40). Count-by-class becomes a
   report, not a target.

**Done when:** each ruling is a dated paragraph in its source document, and
`docs/00-plan.md §12` / `11-trade-network.md §10` no longer say "still open" for
anything decided here.

---

### Phase 35 · The payload — `affects`, `where`, `teaches` *(the highest-leverage build)*

Make the events mechanically distinct.

- **`affects`** on every W event (594), authored by hand where the card copy already
  implies it, generated from class defaults elsewhere — but *jittered per event by a
  seeded draw at build time*, so no two events are ever byte-identical in effect even
  before hand-tuning. The engine's `CLASS_EFFECTS` becomes the fallback, not the rule.
- **`where`** on every regional event and every W event: a list of district-grade
  place keys resolved against the skeleton (`data/skeleton/`), so an event can land on
  the map closer than one-twelfth of the subcontinent. The generator validates every
  key against the gazetteer; an unresolvable place fails the build, exactly as an
  unresolvable work does now.
- **`teaches`** on every card-bearing event: one sentence, taken from the card's
  "why it matters" where one exists (343 free), written fresh for the rest of the Ws.
- **Engine:** `fireEvent` prefers `ev.affects` over class defaults; catastrophe reach
  (`catastropheReach`) reads `where` instead of grepping titles — deleting the last
  title-regex hack in the engine along with the coinage one (moved to a `conditional`
  trigger in phase 39).

**Tests:** every W event's applied delta differs from its class default OR is
hand-authored; every `where` key resolves; the Kalinga war and a minor Pandya raid
produce measurably different worlds from the same seed.
**Trap:** hand-tuning 594 deltas invites balance drift — tune only the ~60 events the
cards make claims about ("AGRICULTURE −4"), and let the jittered defaults carry the
rest until playtests say otherwise.

---

### Phase 36 · The loom — threads become an entity

- `data/timeline/threads.json`: all fifteen threads from 07-timeline Part 4, each with
  id, name, span, a one-paragraph statement of the arc, and an *ordered* beat list.
- Tag the events: the seven empty threads get their beats (THE_RIVERS and
  THE_DOMESTICATIONS are trivially derivable from class+era; THE_ASSEMBLIES — the
  plan's "sleeper" — is hand-ordered from sabha to Uttaramerur to the Constituent
  Assembly; THE_MANDALA and THE_TEMPLE_ECONOMY likewise). Target ≥ 450 tagged events;
  every thread ≥ 8 beats; no thread empty.
- **The card footer works:** prior beat / next beat resolve and navigate. A thread
  view in the ledger — the player can read THE_ASSEMBLIES end to end, which is the
  2,300-year story most players do not know exists, and the reason this phase is
  player-facing rather than data hygiene.

**Tests:** every thread in threads.json has beats; every event's thread tag resolves;
beat order is monotonic in year; the assemblies thread runs from −1030 to 1947.

---

### Phase 37 · The texture engine — the procedural layer *(the biggest phase)*

07-timeline §5.3's unbuilt sentence: *"in the ancient eras these carry most of the
texture — 173 hours cannot run on authored events alone."*

- A new sim module (`texture.js`), fed by a datapack of **weighted incident templates**
  (`data/timeline/texture.json`, ~120 templates): a drought year, a good harvest, a
  herd lost to lions, a boundary feud, a travelling storyteller arriving, a reciter's
  student surpassing the teacher, a manuscript found rotten in its chest, a river
  shifting a ford, a wedding that settles a feud. Each template declares era range,
  region weighting, prerequisites read from *state* (a drought template needs an
  active CLIMATE shock; a rot notice needs a work below health threshold), effects
  (small, through the phase-35 `affects` machinery), and card copy slots.
- **Determinism is non-negotiable:** all draws through named `fork()` substreams keyed
  by year and region (`drawFrom(seed, 'texture', year, region)`), so the same campaign
  replays identically and a texture incident can appear in a save's decision log.
- **The m-tier lives here.** The near-empty minor-magnitude tier (4 events) is not a
  writing failure to fix with 200 more authored events — minor events are exactly what
  should be procedural. Authored data keeps W/M/R; the texture engine *is* m.
- **The silence rule, asserted in play:** a test runs a full campaign headless and
  asserts no era passes 20 minutes of *play-time-equivalent* ticks without either an
  authored event or a texture incident surfacing. This closes the 11 authored silent
  stretches (5700–4000 BCE) without writing filler events for centuries whose honest
  content is "life continued" — the texture layer says that, specifically and
  variedly, instead.
- Tier-3 year pages compose texture incidents alongside authored events; quiet years
  get *texture*, truly empty years stay honestly quiet (rare by construction).

**Trap:** template sameness. 120 templates × parameter slots (names from
`worldgen/names.js`, real goods, real works at risk) is the floor; a player seeing the
same sentence twice in an era is the failure condition, and a test greps a simulated
century's log for duplicate surface strings.

---

### Phase 38 · The emptying — the Indus era's twenty hours

The design's hardest promise, attempted at last — *after* 35 and 37, because the loop
is made of their parts.

- **The verbs already exist; this phase tunes them into an arc.** 2600–2200: growth —
  wells, reservoir levels, trade capacity to Dilmun, the texture layer running warm.
  2200–1900: the monsoon weakens (phase-35 `affects` on the climate events now bite
  per-region through `where`), and the game becomes *triage*: which settlements to
  provision, which to let drift east, when to spend grain moving people versus storing
  against next year, what the reciters carry when a town empties.
- **No villain is enforced, not just intended:** no INVASION events fire in the era
  (data already says so — a test now asserts it), and the era's reckoning screen
  (per `campaign.js`'s no-score pattern) reports what *persisted*: crops, techniques,
  the memory of towns — the dispersal framed as the record shows it, survival by
  redistribution, not defeat.
- A **scripted 90-minute Indus session** is the deliverable proof: a documented
  playthrough (headless-driven, then by a human) showing decision density ≥ one
  meaningful choice per 5 minutes through the drying.

**Trap:** making the climate *beatable*. The 4.2 kiloyear event is not a puzzle with a
win state; the design goal is that a good player exits with more carried forward, not
that the cities stand. If a playtester reports "I saved Mohenjo-daro," the tuning is
wrong.

---

### Phase 39 · The machinery of rule — occupations and conditional triggers

- **`data/timeline/occupations.json` (~35 entries)** — the entity promised in
  07-timeline §1.4 and never built: each with span, extent (`where` keys), extractive
  intensity, administrative depth, and patronage rate. The sim applies them as
  standing modifiers (a drain on grain, a patronage income to the corpus, a cap or
  boost on trust rungs), so "foreign rule" is a weather system, not an event that
  fires and vanishes. The Achaemenid satrapy, the Kushan peace, the Sultanate, the
  Company diwani and Crown rule are the anchor cases — and the `becomes` fields
  written in phase 29 are the source material.
- **`conditional` triggers get their first real users:** coinage (currently a title
  regex in the engine — delete it) fires when trade volume crosses the threshold;
  paper's cost collapse fires when the paper good exists; the Bengal Sultanate's
  literary patronage conditions on the occupation entity being active. Target: ≥ 12
  authored conditional events, with a test that each fires in a campaign engineered
  to satisfy it and not in one that does not.

---

### Phase 40 · The last events — content debt, retired for good

Everything countable, in one sweep, so no later phase is "and also some events":

- The **53 class-shortfall events** — but *only where the era/density/thread work of
  36–39 still shows a hole*, per the phase-34 ruling that retired the class targets.
  Expected real number after threads and occupations land: ~30, mostly INVASION
  (the 19) and SITE (the 13).
- The **18 remaining `becomes: "nothing"`** invasions get real consequences or get
  merged into richer neighbours.
- **`sources` on all 72 disputed events** — two citations minimum, which makes
  validation rule 5 finally enforceable and is a hard prerequisite for the specialist
  pass. (Full-corpus citations are the specialists' own pass; the disputed 72 cannot
  wait for the hire.)
- The **timeline gains its structural entities in data**: the ~62 `chapters` from the
  plan's hierarchy, generated from era + narrative clusters, so the UI can show "The
  Drying" instead of a bare year range. (Chapters are presentation grouping — this is
  deliberately late, after the systems that actually use structure.)

---

### Phase 41 · The names in their own scripts — Indic text

08-visual-design §6.5 called this mandatory from day one; it is the oldest broken
promise in the stack.

- `worldgen/names.js` returns `{ latin, native, script }`; the gazetteer and city data
  carry native forms for every named place (Devanagari, Tamil, Kannada, Telugu,
  Bengali, Odia, Gurmukhi, Perso-Arabic where the era warrants it — script follows
  *era and region*, which the table-tells-time principle demands: Thanjavur labels in
  Tamil, and Mughal-era Delhi in Nastaliq).
- **Font strategy for a single-file bundle:** subsetted WOFF2 of Noto Serif per script,
  embedded as data URIs, subset to exactly the glyphs the gazetteer uses (the subset
  is computed at build time by `build-client.mjs`, which already ASCII-escapes — this
  extends the same pass). Budget: ≤ 900 KB added, measured in CI; if a script's subset
  exceeds its share, its labels fall back to Latin with a build warning, never a tofu
  box.
- Map labels render native-first at close zoom, Latin at far zoom; the event drawer
  shows both.

**Tests:** every gazetteer entry has a native form; the rendered bundle contains no
replacement-character glyphs (Playwright pixel-probes a Tamil and a Devanagari label).

---

### Phase 42 · The card made shareable — plates and export

- The **1200×1600 fixed card** from 07-timeline §9.1, rendered to canvas and exported
  as PNG from the drawer ("keep this card") — the screenshot-and-remember artefact the
  Tier-1 copy was written for. Plates are **procedural until the CDN unblocks**: the
  locked rig's lighting as a canvas composition over era-appropriate sprite scenes
  (the 26 procedural sprites are already rig-consistent). The Magnific plate slot is
  an asset swap later, not a redesign.
- The export is the marketing loop: every card carries the game's name and era ribbon.

---

### Phase 43 · First contact — instrumentation and the cadence playtest

The phase the whole plan bends toward. Nothing above ships to a stranger before 44's
cleanup; nothing below has meaning until a stranger plays.

- **Instrumentation in the client** (local, no network): time-in-era, events opened
  vs auto-dismissed, decisions per hour, corpus losses noticed (risk panel opened
  within N years of a loss) vs unnoticed, texture incidents read. Exportable as a
  JSON blob the tester can paste back.
- **Two scripted protocols:** the Chola slice (phase 34's ruling — two hours,
  full-system) and the Indus session (phase 38's — ninety minutes, the hard promise).
  Each with a findings template: where did you stop reading events, when were you
  bored, what did you believe you were supposed to do.
- **Three testers minimum, one of whom has never heard the pitch.** The deliverable is
  a findings doc with the cadence table *revised against observed data* — the first
  time any number in 07-timeline Part 2 will have touched a human.

**Trap:** treating the first playtest as validation. It is discovery. The plan's
posture on a bad result is pre-committed: the cadence table moves, the 210 hours are
not sacred, and the 82% weighting is defended at the level of *hours that are good*,
not hours that exist.

---

### Phase 44 · The truthful repository — housekeeping

- **HANDOFF.md rewritten** from the current tree (it still says render-city does not
  exist; it is the onboarding document and it lies).
- 07-timeline's superseded numbers (event counts, the retired class targets) annotated
  rather than silently edited — the documents are the design's history; corrections
  are dated notes, deletions are vandalism.
- The duplicate-teaching-content sweep: any doc statement the audit found stale gets
  the same treatment.
- `npm run gaps` extended to report against the *new* binding constraints (density,
  silence-in-play, thread coverage, payload coverage) so the next audit is a command,
  not an afternoon.

---

## Part C — The external track (runs in parallel, owns no phase number)

These are not phases because no amount of repository work completes them. They are
listed so they cannot hide between phases:

1. **The specialist hire** — historian, archaeologist, cultural reviewer. The briefing
   is `15-specialist-pass.md`; phase 40's citations make their first week productive.
   Release gate. *Owner: you. The repo has done what a repo can.*
2. **Studio jurisdiction** (00-plan §12.1) — decides sub-metre data and P3 onward.
   A one-line answer unblocks a planning branch nothing else can touch.
3. **Survey of India geometry** — release blocker under the Criminal Law (Amendment)
   Act 1990. Needs a sourced boundary dataset ruling; pair it with the jurisdiction
   decision, they share a lawyer.
4. **The CDN allowlist** (`*.cdnpk.net`) → then the 85-sprite generation run against
   the locked rig, then the rig-consistency composite check (08-visual §7.4 step 5),
   then the phase-42 plate swap. All specified; all waiting on one settings change.

---

## Part D — Sequencing at a glance

| Order | Phase | Size | Closes |
|---|---|---|---|
| 1 | 34 Rulings | ½ day | 6 open decisions |
| 2 | 35 Payload | L | `affects`, `where`, `teaches`; title-regex hacks |
| 3 | 36 The loom | M | threads entity, 7 empty threads, card navigation |
| 4 | 37 Texture engine | XL | procedural layer, m-tier, silent stretches, Tier-3 texture |
| 5 | 38 The emptying | L | the Indus 20 hours |
| 6 | 39 Machinery of rule | M | occupations, conditional triggers |
| 7 | 40 Last events | M | 53-shortfall, 18 becomes, 72×sources, chapters |
| 8 | 41 Indic text | M | the day-one typography promise |
| 9 | 42 Card export | S | 1200×1600 plates, shareable cards |
| 10 | 43 First contact | M | instrumentation, the first human data |
| 11 | 44 Truthful repo | S | HANDOFF, stale docs, gaps tool v2 |

Each phase ends the way 23–32 did: generator green, tests extended before code is
called done, one commit that says what was learned — because the standing lesson of
this project is that **writing the content is how the simulation's bugs are found**,
and the plan expects phases 35, 37 and 38 to falsify at least one assumption each
that the current 260 tests encode.
