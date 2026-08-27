# The Build Plan, Part Two — phases 12 to 22

**Companion to [`10-buildplan.md`](10-buildplan.md), which is done.** That plan took an empty
repo to a playable twenty-minute slice: a deterministic simulation, a procedural
subcontinent, a knowledge economy you can lose, a trade network, and a dive into
Thanjavur's streets. 124 tests green.

This one takes that slice to a **game somebody could put a hundred hours into**.

---

## Where the first plan landed

| | |
|---|---|
| **Runs** | Full 7,947-year campaign, headless, in 53 ms |
| **Paints** | 1.0 s to first paint, 1.4 s to full quality |
| **Ladder** | L0–L16 proven. Thanjavur generates 1,700 buildings from ~900 bytes |
| **Tests** | 124, including a determinism guard that fails the build on `Math.random` |
| **Data** | 789 timeline events, 89 works, 146 polities, 3 cities |

**The gate passed.** Watching a work go grey lands, and copying it out 140 years early
pays. That was the one question worth answering before spending a year on this.

## What is honestly still missing

Not features — *depth*. The slice proves the loop exists; it does not yet reward a
second campaign, and there is nobody in it.

> **The single biggest gap: the world has no people in it.** Pops are five integers.
> There are no named individuals, no patrons, no rival kingdoms with intentions. The
> Chola era is the strongest content we have precisely because it left named people
> in inscriptions — and the game currently renders none of them.

Everything below follows from that, or from the four systems the design documents
specify and the build has not yet touched: sovereignty, the survey mechanic, the
eight pillars as real constraints, and the event card.

---

# The eleven phases

| # | Phase | You can... | Rough |
|--:|---|---|---|
| 12 | The event card | read what happened and why we think so | 1.5 w |
| 13 | The survey | see the map admit what it does not know | 2 w |
| 14 | Named people | patronise a person, not a statistic | 2.5 w |
| 15 | The sovereignty stack | be ruled by three powers at once | 2.5 w |
| 16 | The pillars bite | be unable to do things, for reasons | 2 w |
| 17 | The frontier | meet the people the state does not reach | 2 w |
| 18 | Save, load, replay | leave and come back; share a campaign | 1.5 w |
| 19 | The worker | hold sixty frames while the world thinks | 1.5 w |
| 20 | Sound | hear the era you are in | 2 w |
| 21 | The pour | let other people add cities and events | 2.5 w |
| 22 | The vertical campaign | play 850–1279 end to end and want to again | 3 w |

**≈ 23 weeks solo · ≈ 13 with two.** Phases 19–21 parallelise against everything.

---

## Phase 12 · The event card
*789 events currently arrive as a line of text in a list.*

Build the nine-slot card from [`07-timeline.md`](07-timeline.md) §8.3 — year ribbon,
title, plate, *what happened*, *why it matters*, effects, **evidence**, **dispute**,
threads. Three tiers: ~300 authored `W` cards, ~600 template `M`/`R` cards, and the
year page composed at runtime for all 7,947 years.

> **`Evidence` is the whole point.** Most history games assert. This one shows its
> working — and in a campaign that is 82% pre-literate, *how we know* is routinely
> more interesting than *what happened*. It is also the slot that cannot be written
> without the historian and archaeologist, which makes this the phase that forces
> that hire.

**Done when:** 1193 arrives as a card you would screenshot, and the Keeladi card shows
both dates and who holds which position without adjudicating between them.

---

## Phase 13 · The survey
*The mechanic that turns missing data into the game.*

[`00-plan.md`](00-plan.md) §3 argues the gaps **are** the game, and nothing in the build
implements it yet. Every entity already carries a provenance tier — `SOURCED`,
`DERIVED`, `SYNTHESIZED`, `ABSENT`. Make the map render it: an unsurveyed district
shows as a blank sheet with a hand-drawn edge, and surveying it costs time and people
and turns guesses into knowledge.

**And it must cut both ways.** A survey can reveal that your assumption was wrong —
the settlement is smaller, the river moved, the mine is exhausted. A survey that only
ever improves things is a loading bar.

**Done when:** a player can look at the map and tell, at a glance, the difference
between *there is nothing there* and *we have not looked*.

---

## Phase 14 · Named people
*The largest gap, and the highest return.*

Patronage is currently `grain -= 50; reciters += 1`. It should be a person with a name,
a school, a teacher, students, a lifespan, and a body of work that outlives them.

- **Scholars, poets, reciters, scribes, architects, merchants.** Generated
  deterministically where the record is silent, real where it is not.
- **Lineage.** A teacher's students carry their tradition. Kill the lineage and the
  *shakha* is gone even though the text survives.
- **Named patronage.** Endow Panini in 400 BCE and the ledger tells you, for the next
  two thousand years, what that endowment is still paying.
- **Real names first.** The Chola inscriptions name individuals — the Thanjavur temple
  lists 400 dancers, singers and staff **by name**. Uttaramerur names its committee
  procedure. This is not decoration, it is the best-evidenced content in the project.

**Done when:** a player can name three people from their last campaign, and say what
happened to them.

---

## Phase 15 · The sovereignty stack
*`polities.json` has 146 polities and 70 rule relations. The game reads none of them.*

Sovereignty is a **stack, not a colour** ([`04-eras.md`](04-eras.md)): holder, revenue
claimant, tributary superior, paramount. For most of Indian history rule was graded and
overlapping, and a single-colour political map is a lie about it.

- Four separate claims per region, each with its own holder
- The mandala as a real gradient, not a border
- Map modes as **transparent sheets laid over the model** — one per layer of the stack
- Tribute, not conquest, as the normal relationship

**Done when:** a region can be held by you, taxed by a neighbour, owe tribute to a third
power and be inside a fourth's mandala — and the map shows all four without lying.

---

## Phase 16 · The pillars bite
*Eight gauges that currently only go up.*

Design, IT, Structure, Classicism, Networking, Trade, Cultivation, Agriculture
([`06-pillars-and-campaign.md`](06-pillars-and-campaign.md)) are decoration until they
**gate** things. Make each pillar a constraint the player feels:

| Pillar | What it should stop you doing |
|---|---|
| `IT` | Writing anything down. Below the threshold the corpus is memory only |
| `AGRICULTURE` | Feeding non-farmers. This one already bites; keep it |
| `NETWORKING` | Reaching past your kin. The trust ladder's rungs are pillar-gated |
| `STRUCTURE` | Tanks, ramparts, temples — and the tank is what makes the delta |
| `CLASSICISM` | Turning practice into *shastra*, which is what makes a work derivable |
| `CULTIVATION` | Training anyone. No gurukula, no scribes |
| `DESIGN` | Producing an export anyone wants |
| `TRADE` | Holding a route at all |

**Done when:** a player says "I can't do that yet, I need Structure" — and knows exactly
which building programme fixes it.

---

## Phase 17 · The frontier
*The internal frontier is a footnote in the build and a thesis in the design.*

`THR.THE_INTERNAL_FRONTIER` runs −4500 → 1947. **For most of the focus period the
frontier is not a border, it is the treeline.** Forest and hill peoples, shifting
cultivation against settled agriculture, the clearance line moving east with the iron
axe.

Model it honestly: these are not obstacles. They are polities with their own interests,
their own knowledge (which the corpus should be able to acquire, and largely did not),
and their own reasons to trade or refuse. The Ahom *paik* system, the Khasi megaliths,
the Naga terraces are all in the timeline already.

> **This is the phase most likely to be done badly,** and the one where the historian
> and the cultural reviewer matter most. Get it wrong and the game reproduces exactly
> the story it was built to complicate.

---

## Phase 18 · Save, load, replay
*The rule is implemented. The feature is not.*

`world = f(datapack, seed, decision_log)` already holds — the client keeps a decision
log and recomputes from it. Turn that into a product:

- Save and load, as a few kilobytes of JSON
- **Replay**: scrub the campaign like a video, because the world is a pure function of
  a prefix of the log
- **Share a campaign** by URL, which is nearly free and is the best marketing artefact
  an unknown title can have
- Migration: an old log replayed against a newer datapack, with a tombstone table for
  renamed entities

**Done when:** a player sends a friend a link that opens their exact campaign at 1193.

---

## Phase 19 · The worker
*Terrain still runs on the main thread.*

Move terrain, climate and city generation into a worker with a transferable-buffer
protocol. The purity work in Phase 6 already made this trivial — `worldgen` has no DOM
and no state, so it moves as-is.

Then the tile cache: generate at the rung above, evict behind, prefetch along the pan
vector. The dive should hold sixty frames at any rung.

**Done when:** panning at L14 across Thanjavur never drops a frame, and the main thread
is idle while the world is being built.

---

## Phase 20 · Sound
*A game about oral transmission currently makes no sound.*

The obvious and correct idea: **the game's audio is the knowledge economy.** Recitation
under the map, thinning as reciters are lost, going silent when a *shakha* dies. Not a
soundtrack — a state readout you hear before you read it.

- Era-appropriate instrumentation, changing with the table's materials
- The corpus as ambience: more works held, richer the texture
- One deliberate silence in 1193

**Cultural review is mandatory here**, same reviewer as the corpus. Recited Vedic text
is liturgy for living communities, and using it as game ambience is a decision to be
made with them and not around them.

---

## Phase 21 · The pour
*The arithmetic that fills 648,802 settlements.*

We will not author them. [`02-data-spine.md`](02-data-spine.md) §4 is right that public,
versioned datapacks are the only mechanism that scales — Wikipedia and OpenStreetMap
are the model.

- Publish the datapack format and schemas (already written)
- A validator anyone can run, with the same seven checks the timeline generator enforces
- The city skeleton format — ~900 bytes per city, which means a contributor can add
  Madurai in an afternoon
- **Datapacks never contain code**, so a community pack cannot execute anything
- Provenance is mandatory: a contributed entity states its tier and its source

**Done when:** somebody outside the project adds a city and a dozen events, and the
validator catches the two mistakes they made.

---

## Phase 22 · The vertical campaign
*Not a slice. A campaign.*

Assemble 12–21 into **850–1279, the Chola era, played end to end** — the strongest
content in the timeline, at village resolution, on real inscriptions.

- Vijayalaya to the last Chola, 429 years, 18 hours
- Uttaramerur's committee ballot as a playable institution
- The Ganges expedition and the Srivijaya fleet
- 1193 in the north, seen from the south — which is how the Cholas would have seen it
- Every named person from Phase 14 drawn from real inscriptions where they exist

> **Why this era and not the Indus.** The Indus is the better *story* — a civilisation
> that ends with no conqueror — and it is the honesty test for the whole project. But
> the Cholas left tens of thousands of published inscriptions naming individuals,
> transactions, committees and irrigation shares. It is the one era where the game can
> operate at village resolution **on real data**, so it is the one that proves the
> design rather than illustrating it.

**Done when:** somebody plays eighteen hours, finishes, and immediately starts again
with a different plan.

---

# What still has no phase

Stated plainly, because a plan that hides its omissions is not a plan.

1. **The historian and the archaeologist.** Phases 12, 14 and 17 cannot ship without
   them. The `dispute` list is long and several entries are politically live in India
   right now — Keeladi is an open Centre–State dispute as of 2025. **This is a hiring
   requirement, not a footnote.**
2. **The ~85 generated art assets.** Manifest and prompt template are written; the
   procedural sprites hold the place under the same lighting rig. Needs a credit
   decision.
3. **~360 more timeline events**, and the four eras still failing the twenty-minute
   density check.
4. **Survey of India geometry.** The current India outline is a visual mask only and
   must be replaced before any India release — Criminal Law (Amendment) Act 1990. It is
   a release blocker, and it is nobody's phase.
5. **The Indus era's twenty hours.** Twenty hours of play whose antagonist is the
   climate and which ends with nobody to fight. Nothing in either plan has attempted
   it, and it is the design's hardest promise.
6. **Multiplayer.** The determinism work means the mechanism exists. Whether the game
   wants it is unanswered.
