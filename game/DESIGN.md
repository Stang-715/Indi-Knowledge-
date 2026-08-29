# Historia — Game Design

**A map-first India state-builder where the real history is the rulebook.**

---

## 1. The core loop

You take one state. The map isolates to it. You govern it from its earliest recorded
era to the present, one turn at a time — and the turn is a *year* in the modern eras,
a *decade* in the medieval ones, and a *quarter-century* in the ancient ones. The tempo
of play scales with the density of the record, so the game teaches the shape of the
archive without ever saying so.

Each turn runs five phases:

| Phase | What happens |
|---|---|
| **Historia** | The right rail opens on this year. Read what actually happened here. Reading earns Insight. |
| **Decide** | Spend Treasury and Insight. Build, legislate, patronise, tax, reform. |
| **Resolve** | Real events for this year fire as Scenario Cards. You choose; the real outcome stays hidden until you commit. |
| **Consequence** | Deltas apply. Scars, if any, are permanent. |
| **Omen** | The pattern engine warns you when your last several moves match a motif that ended badly somewhere else. |

The Omen phase is the game. Everything else is bookkeeping around it.

---

## 2. Why knowledge is the currency

The decisive choice in this design: **Insight — earned by reading and answering
Historia — is what unlocks build options.** Not gold. Gold buys the building; Insight
unlocks the *right to build it*.

This resolves the usual educational-game problem, where the learning is a minigame
bolted onto a loop that runs fine without it. Here a player who skips the history
simply cannot access the mid-game tech. They will notice by turn thirty.

| Action | Insight |
|---|---|
| Read one Historia event | +1 |
| Read a full era | +8 |
| Answer a quiz question | +2 easy · +4 medium · +7 hard · +12 expert |
| **Name a pattern before it completes** | **+25** |

That last line is the skill ceiling. Once you have seen the Revenue Ratchet play out in
Bengal, you can spot it forming in Madras and call it before the famine card turns over.
Calling it correctly is worth more than any building.

---

## 3. Resources

Nine visible, one hidden.

- **Treasury** — revenue net of spending; goes negative, and debt costs Legitimacy
- **Grain** — food buffer; zero plus a shock is a famine
- **Labour** — working population
- **Artisanry** — craft capacity; slow to build, fast to lose, expensive to revive
- **Literacy** — the compounding resource; pays nothing for fifteen turns
- **Legitimacy** — consent to be governed; gates which reforms you may *attempt*
- **Infrastructure** — ports, canals, rail, power
- **Unrest** — above 7 an insurgency spawns
- **Water Table** — *hidden until you build irrigation.* Then visible, and falling.
- **Insight** — the knowledge currency

Water being hidden until you irrigate is the design in miniature: the cost of the Green
Revolution was not on the balance sheet at the time either.

---

## 4. Scars

Some outcomes are permanent. You cannot buy your way out of a scar, only build around it.

| Scar | Effect |
|---|---|
| `famine_memory` | Legitimacy can never again reach 100 |
| `craft_lost` | Artisanry regrows at ⅓ rate; the tradition needs a Revival project to return at all |
| `insurgency_zone` | District closed to all building until cleared by Accord — **never by force** |
| `severed_border` | Every trade adjacency through that border is deleted, permanently |
| `external_dependency` | Treasury swings with a foreign economy you do not control |

Scars are what make this a history game rather than a scoreboard. A state that starved
in 1770 should still read differently in 1900.

---

## 5. The pattern engine as game rules

`patterns/motifs.py` holds twelve causal shapes mined from the real timelines. A motif
that recurs across enough states with enough evidence is **promoted to a game rule** —
the simulation's causal model is derived from the record, not invented.

Examples of promoted rules:

- **The Revenue Ratchet** — Setting Revenue to Fixed gives +2 Treasury/turn and removes
  your harvest-failure buffer. A drought while Fixed triggers Famine: −30% population,
  −2 Legitimacy, permanent scar. *(Bengal 1757→1765→1770; Madras 1801→1876)*
- **Identity Becomes a Border** — Governing a population whose language or identity you
  do not share adds +1 Unrest/turn, compounding. At 10, the territory secedes — and in
  multiplayer, becomes another player's state.
- **The Long Dividend** — Human-capital spend returns nothing for 15 turns, then pays 3×
  indefinitely. The AI opponents never build it. It is how a resource-poor state wins.
- **The Resource Curse** — Every Mine on tribal-tenure land: +3 Treasury, +1 *permanent*
  Unrest. Above 7, insurgency closes the district until resolved by Accord or Autonomy.
- **The Irrigation Trap** — +50% yield, and a hidden Water Table draining every turn. At
  zero, yields fall *below* the pre-irrigation baseline and the fix costs more than the
  original works.

When a motif has only been observed in one state it stays a **local pattern** — a
curiosity in that state's codex, not a law of the world. Promotion requires recurrence.
This is the honest epistemics of the thing, encoded as a threshold.

---

## 6. Layers of play

Five layers, each shipping independently. Layer 1 is a complete product on its own.

**Layer 1 — Historia Codex** *(content only; no simulation)*
The map, the state isolation, the year scrubber, the eight-strand right rail. Read the
history of any state, any year. Bookmarks, search, era jump. This is the data product,
and it is worth shipping first because it validates the corpus in front of real readers
before a single game mechanic exists.

**Layer 2 — Quiz & Trivia** *(the retention layer)*
Six question types, all generated from the corpus — nothing hand-authored:
`year_of`, `which_state`, `category`, `sequence`, `what_followed`, `pattern_transfer`.
Daily challenge, era gauntlets, state mastery badges, streaks.
`what_followed` and `pattern_transfer` are the ones worth having: they test *causation*,
and their distractors are real outcomes that simply did not follow from that cause.

**Layer 3 — The State Builder** *(the main game)*
The five-phase turn loop. Single state, full sweep, Divergence scoring against the real
historical baseline that `game/simulate.py` produces.

**Layer 4 — Counterfactual Mode**
Change one decision and run the state forward. What if the Permanent Settlement had been
temporary? What if Kerala had not passed the 1969 Land Reforms? The pattern engine
answers with the chains that would and would not have fired. This is the most
educationally valuable mode in the design and the most demanding to build.

**Layer 5 — Multiplayer: The Confederation**
Each player takes a state; all run the same eras concurrently. Trade, river-water
disputes, migration, language policy, and the seceding-territory rule from
*Identity Becomes a Border* all become inter-player. Historia is the shared fact base
and the tiebreaker.

---

## 7. Scoring: Divergence, not victory

There is no win condition. There is a **Divergence Score** against the real trajectory,
reported across four axes at the end of a run:

- **Prosperity** — Treasury and Infrastructure vs. the historical baseline
- **Wellbeing** — Literacy, Labour, Grain
- **Cohesion** — Legitimacy, inverse Unrest
- **Continuity** — Artisanry and scars avoided

Beating history on Prosperity while collapsing Cohesion is a legible, interesting
outcome — and it is the outcome most first-time players get. The end screen names the
motifs you triggered and the ones you dodged, with the real chains beside them.

---

## 8. Content safety

Enforced in code (`tests_eligibility.py`), not left to editorial discretion:

- Events marked `contested` — where historians genuinely disagree — are shown in the
  rail **with both readings**, and are never quiz answers. There is no answer key.
- Events flagged `sensitive` — communal violence, massacres, insurgency casualties —
  appear in the reading rail with full context and **never** in a scored quiz or as a
  Scenario Card. A body count is not a puzzle.
- Below the `corroborated` confidence band, an event is readable but not quizzable.

The regression test exists because the quiz bank is regenerated on every ingest, and a
rule that is not executable will not survive contact with new data. It has already
caught one real leak.

---

## 9. Build order

1. **Historia Codex** on the six seeded states — validate the corpus with readers
2. Verification pass on the seed corpus, then ingest the remaining 30 entities
3. **Quiz layer** — it is already generated; it needs a front end
4. **State Builder** on modern eras only (1947→) where the data is year-dense
5. Extend backward era by era as coverage fills
6. Counterfactual, then multiplayer

The order matters: each layer is shippable, and each one stress-tests the corpus that
the next one depends on.
