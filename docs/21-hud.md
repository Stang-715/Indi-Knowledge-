# The Paramountcy HUD — every button, then the 21-phase plan

The design round that follows `docs/20-vic3-ui-census.md`. Part A lists **every button
the finished HUD will have and what it does**, marked `(exists)` / `(moves)` / `(new)`
against today's client. Part B is the **21-phase build plan**. Nothing here is executed
yet — this document is the review gate.

The census's five lessons govern everything below: fragmentation is the enemy, not
density; lenses are for **verbs**, panels for **subjects**; every eligibility state gets
a color, including "no, and you can't fix it"; predictive tooltips make buttons safe;
alert volume is tuned like gameplay. One rule is ours alone and outranks all of them:
**`--gold` means yours and nothing else**, and the HUD stays an object on the
Cartographer's Table — no floating chrome.

---

## SECTION: Part A · The button census

### A1 — Status bar (top; always visible; every readout is a click-through)

- **Era ribbon + year** — era name, current year, cadence hint; click opens the year page. `(moves — today a bare year label)`
- **Play / pause ▶** — starts and stops time. `(exists)`
- **Speed stepper** — cycles 1× / 2× / 4×. `(exists)`
- **Scrub bar** — drag to any recorded year; the world recomputes (a replay, not a recording). `(exists)`
- **Grain readout** — treasury plus weekly flow, green when gaining, red when draining; click opens the Ledger. `(new — grain today hides inside the actions panel)`
- **Corpus vitals** — `extant · at-risk · lost`; pulses red when any work is down to its last carrier; click opens the Library. `(moves — today a summary line inside the aside)`
- **Trust rung** — current rung, and the cap when under occupation; click opens the Court. `(moves)`
- **Pillar glyphs** — four mini-meters (Agriculture, Trade, Structure, Networking); click expands the full pillars view. `(moves — today a full panel)`
- **Situations button** — count badge, glows by highest tier; opens the alert list. `(new)`
- **Sound toggle ♪** `(exists)` · **Save** `(exists)` · **Share** `(exists)`

Danger states are the bar's whole job: deficit grain, last-carrier works, capped trust,
and a red situation must each be visible with **zero clicks**.

### A2 — Left rail, the six MAJOR drawers (weekly-use; one open at a time; hotkeys Q W E R T Y U)

Format per the brief: icon · purpose · primary actions · badge · open frequency.

- **The Ledger** — coin-stack icon. *Where grain comes from and where it goes.* Actions: patronage level stepper; per-route escort costs; endowment upkeep list; projections. Badge: red on deficit. Open: every session. `(new panel; data exists)`
- **The Library** — manuscript-chest icon. *The corpus you are keeping alive.* Actions: filter by at-risk / lost / carried abroad; work detail (carriers, places, copy · endow · send); copying queue. Badge: count of last-carrier works. Open: constantly — this is the game. `(moves — the chest, rebuilt)`
- **The People** — three-figures icon. *Reciters, scribes, patrons — the knowledge infrastructure.* Actions: train scribe; endow person; lineage view. Badge: a lineage about to end. Open: often. `(moves)`
- **The Land** — terraced-field icon. *Settlements, districts, survey; the Indus triage during its era.* Actions: survey; settle/clear shortcuts; Indus verbs (provision · wells · resettle). Badge: a settlement emptying. Open: era-dependent. `(moves — merges survey, frontier, indus panels)`
- **The Road** — caravan icon. *Routes, orders, missions, partners.* Actions: standing orders (escort, choke policy); start mission; Share; partner list. Badge: route losing grain, or a choke closed. Open: often after 850. `(moves)`
- **The Court** — seal-stamp icon. *Sovereignty as it actually was: the four-layer stack.* Actions: press claim; offer tribute; occupation detail; trust ladder. Badge: contested claim, or an occupation beginning. Open: occasionally, urgently. `(moves — claims panel promoted)`

### A3 — Left rail, the six MINOR buttons (reference; F-keys)

- **Codex** — the reference: eras, chapters, events, works, search. `(exists)`
- **Chronicle** — the book of this campaign; export. `(exists)`
- **Threads** — the 15 arcs with progress and next-beat navigation. `(new panel — today only visible inside event cards)`
- **Help ?** — labels every panel with its purpose. `(exists)`
- **Metrics** — local playtest telemetry copy. `(exists)`
- **Credits** — licences, sources, method, colophon. `(exists)`

### A4 — Lens tray (bottom-center; VERBS only; arm a tool → map recolors → click executes; Esc cancels)

Eligibility recolor adapted from the census palette to the Table: **gold = yours**
(unchanged, sacred), then can-act / already-so / in-progress / could-qualify /
never — six states, each a distinct treatment, hover always says why.

- **Settle lens** — verbs: settle · clear · abandon; during the Indus era: provision · dig wells · resettle east. Click a settlement or district to execute. `(moves — today buttons in the aside)`
- **Remember lens** — verbs: copy (pick work → click scriptorium) · send abroad (pick work → click route) · endow school. The corpus made spatial. `(new)`
- **Trade lens** — verbs: open route (click partner) · set orders (click route) · share surplus (click partner) · watch caravan (click sprite). `(moves — the existing tap flows, unified)`
- **Mandala lens** — verbs: press claim · offer tribute · withdraw; arming it auto-switches to the mandala map mode. `(new — mode exists, verbs scattered)`
- **Map-mode globe** — selectable, lockable modes: terrain · survey · mandala · corpus (where works live) · roads. Modes are informational; lenses are verbs — the census's cleanest line, kept. `(moves — today three tabs)`

### A5 — Outliner (right rail; the player chooses what stays visible)

- **Pin stars** — on every panel header, work row, route row, person row: pin to the outliner. `(new)`
- **Auto-pins, non-removable while ongoing** — occupation banner `(moves)`; watched caravan `(moves)`; missions in flight `(new)`; the Indus water gauge during its era `(moves)`; the campaign chapter objective `(new)`.
- **Copying queue** — works being copied, with ETA; click jumps to the scriptorium. `(new)`
- **Outliner tabs** — Pinned / All. `(new)`

### A6 — Alert shelf (tiered; volume is a tested budget)

- **Situation tiers** — **RED, loss imminent**: a work at last carrier, a town at the leaving threshold, a route collapsing. **AMBER, window closing**: a conditional event now possible, a choke shut, a latent decision expiring. **FEED, texture**: the m-tier, never louder than a line. `(new — today one flat notice stream)`
- **Dismiss / restore** — right-click dismisses; a restore counter brings back what you removed. `(new)`
- **Routing settings** — per-kind: card / notice / feed / off. `(new)`
- **Slips shelf** — onboarding slips keep their own shelf, never competing with news. `(exists — the phase-48 lesson, preserved)`

### A7 — Map & object surfaces (unchanged homes, new consistency)

- **District panel on map click** — becomes the Land drawer's sub-panel. `(moves)`
- **Interiors strip** — scriptorium · treasury · assembly dives. `(exists)`
- **Event card buttons** — keep-card, thread prev/next, chapter ribbon. `(exists)`
- **Year-page rows, chronicle rows** — click-through everywhere; no dead ends. `(exists, audited in phase 17)`

### A8 — Meta

- **Start card** — campaign picks with premise + first task. `(exists)`
- **Damaged panel, credits, colophon** — the phase-54 surfaces, untouched. `(exists)`

---

## SECTION: Part B · The 21-phase plan

The standing rules carry from all three prior arcs: tests extended before code is called
done; one commit per phase that says what was learned; the density, silence, mix-budget
and perf tripwires stay green through every phase — a HUD phase that breaks a pace test
is not done. Expect at least three phases to falsify something the current suite believes.

1. **The paper mockup.** The full HUD as a static visual — both themes, three era
   materials, all five regions with real content — reviewed before any client code.
   *Done when:* the mockup page renders every A-section button and you have approved it.
2. **The frame.** The five regions as a CSS grid over the map; every existing panel
   slotted, nothing lost; keyboard smoke extended to the new geometry.
3. **The status bar.** Vitals with click-throughs and danger states; the zero-click
   layer honest (the census guardrail applied readout by readout).
4. **The situations engine.** The alert model in `packages/ui`: tiers, sources, dismiss
   and restore, deterministic derivation from state — no new sim randomness.
5. **The alert shelf.** Situations UI + per-kind routing + the volume budget as a
   failing test (the census's hardest-won lesson, adopted before launch, not after).
6. **The major rail.** Six drawers, hotkeys, badges, one-open rule, back stack; the
   aside dissolves into them.
7. **The Ledger.** Grain itemized both directions; patronage stepper; projections with
   predictive tooltips.
8. **The Library.** The chest rebuilt around risk; work detail with actions; the last
   -carrier state unmissable.
9. **The People.** Lineages visible; train and endow in place.
10. **The Land.** Survey, frontier and Indus merged into one subject; district sub-panel
    unified with the map click.
11. **The Road.** Orders, missions, partners, Share — one home.
12. **The Court.** The sovereignty stack legible per district; occupations and the trust
    ladder in one place.
13. **The minor rail.** Codex, Chronicle, Help, Metrics, Credits migrate; the **Threads
    panel** built (the one new minor).
14. **The lens engine.** Arm → recolor → click-executes → Esc; the six-state eligibility
    treatment on the Table palette; contextual mode switching.
15. **The Settle lens.** First verb set proves the engine; Indus verbs join during the era.
16. **The Remember lens.** The corpus made spatial — copy, send, endow on the map.
17. **The Trade lens.** Existing tap flows migrate without regression (the watched
    caravan keeps its gold ring).
18. **The Mandala lens + globe.** Sovereignty verbs; the mode selector unified,
    modes lockable.
19. **The outliner.** Pin stars, auto-pins, the copying queue; non-removable rules
    tested.
20. **Parity and pace.** Keyboard/touch for every new surface; density and silence
    re-baselined with the HUD in place; alert volume tuned against the budget;
    perf tripwire re-verified.
21. **The skinned HUD ships.** Era materials on the chrome; the 32px icon set finalized;
    screenshot suite; HANDOFF and playtest protocols updated; artifact redeployed.

**Order rationale:** mockup before frame (geometry is cheap to move on paper, expensive
in code); alerts before drawers (drawers will want badges, badges need the engine);
drawers before lenses (lenses execute verbs whose subjects must have homes first);
outliner late (it pins things that must exist); pace re-baseline second-to-last because
every earlier phase can shift it; skin last so materials land on a finished frame.

---

## Execution record (the fourth arc)

All 21 phases executed, one commit each. What the arc falsified or forced:

- **1** — the plan's "both themes" line was a spec error (the kit is
  single-theme by design); the lens tray must centre on the *visible* stage.
  Both found on paper, which is the phase's whole argument.
- **3/5** — "at risk" was the wrong vital and the wrong situation: at a fresh
  start everything is technically at risk. The number that cannot wait is
  last-carrier works, and universal fragility is ONE situation at its true
  scale, not fifty-eight.
- **6** — click-throughs wired to element positions in phase 3 broke when the
  layout moved in phase 6. Navigation targets destinations, not positions.
- **7** — the ledger records flows at the till, never re-derives them; a
  listener pinned to a movable panel's home misses it when mounted elsewhere.
- **9** — the volume budget test tripped on the lineage source (11 loud at
  −2075) two phases after it was written. That is the argument for it.
- **10** — the canonical same-year decision ordering silently no-ops a survey
  clicked the same year as its scribe's training. Real, deterministic,
  recorded for a future save-format bump — not patched, because the ordering
  is what saves replay against.
- **14–18** — lenses are for verbs; the registry validates loudly; modes are
  borrowed and returned, never taken; and Baghdad is not on an India-only
  map, so 'send abroad' stayed a button.
- **20** — a guard that "protected" the number row from canvas focus was the
  keyboard smoke's one catch of the arc.

Suite at close: **348 tests green**, `npm run verify` clean, bundle 2.00 MB.
Screenshots at `tools/mockups/shots/`; the phase-1 mockup at
`tools/mockups/hud.html` remains the geometry's reference.
