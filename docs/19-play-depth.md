# Play Depth — phases 45–54, the third arc

**Where the first arc built the world (1–22) and the second closed its gaps (23–44),
this arc is about the player's hands.** Everything below is repository work. The
external track — the hire, the humans, the geometry, the jurisdiction, the sprite
allowlist — stands unchanged from `16-gap-closure.md` Part C and owns no phase here.

Two facts measured before planning, so the plan stands on evidence:

- **Performance is not a problem and gets no phase.** A full deterministic recompute
  of an 8,000-year campaign with the complete 1,382-event timeline, texture layer and
  occupations costs **~150 ms at year 1900** (measured, seed `perf`). Checkpointed
  recompute would be premature machinery; it becomes a phase only if a future measure
  crosses ~400 ms, and this line is the tripwire.
- **The playtest pre-commitment holds.** Nothing in this arc retunes the cadence
  table or the Indus difficulty — that waits on `docs/18`'s human round. One phase
  (53) is explicitly **gated** on that round's outcome.

The ordering principle: the user's own founding brief for the trade system — escorts,
chokes, missions, "mini games within the game" — is the oldest unpaid design debt in
the repository, so it goes first.

---

## Phase 45 · The road, played — standing orders and the watched caravan

The phase-34 ruling said *standing orders per route, manual control only for the
caravan being watched*. Only half of that exists: `escort` and `clear-choke` are
one-shot decisions today, and there is no watched caravan at all. This phase pays
the original trade brief.

- **Standing orders per route**, as sim state and a small panel on the route row:
  escort level (none / light / heavy — a standing grain cost per caravan), hold
  priority, and a choke policy (wait / reroute / fight where the choke type allows).
  Orders persist in the decision log like everything else — one decision changes a
  policy, not a caravan.
- **The watched caravan**: click a caravan sprite and the aside follows it — days
  out, cargo value, escort, the road's danger, and, when it meets a choke, **the
  mini-game**: a small scene (not a new renderer — a composed panel with the choke's
  sprite, the odds, and the choices the choke type allows). Fight, pay, reroute,
  wait — each a decision, each with consequences the resolver already computes.
  The five choke types keep their one resolver; the scene is a skin, per `docs/11 §6`.
- **Missions to clear a choke** get a proper flow: raising the expedition, the
  march time, the resolution, the aftermath recorded in the log — instead of one
  button labelled `clear`.

**Done when:** a route can run for a century under a standing order without a click;
the watched caravan produces one legible scene per choke encounter; the escort cost
shows up in the granary; tests cover order persistence in the save/replay round-trip.
**Trap:** the mini-game swallowing the game. Time stays paused during the scene, the
scene never exceeds one panel, and the resolver stays in the sim — the client only
asks the question.

## Phase 46 · The buranji of your campaign — the chronicle export

The Ahoms kept history as a department of state; the game should too. A campaign's
`log` is already a complete annal — render it as one.

- `packages/ui/src/chronicle.js`: compose the log, era by era and chapter by
  chapter, into a written history *of this campaign* — authored events, texture
  incidents, decisions, losses noticed and unnoticed, the reckonings — in the
  game's own prose register, with the era's material as the page style.
- Exportable like the card plates (modal image pages and a copyable text form);
  a closing page renders the campaign's `reckoning()` — still no score.
- The chronicle is derived purely from `(seed, decisions)`, so sharing a save URL
  *is* sharing the chronicle.

**Done when:** a full campaign renders to a chronicle in under a second; two
campaigns with different seeds produce visibly different books; the Nalanda year
reads like a page you would keep.
**Trap:** log spam becoming book spam — the chronicle selects (era summaries,
turning points, every decision) rather than transcribing all ~2,000 lines.

## Phase 47 · The codex — the world outside the clock

1,382 events, 15 threads, 79 chapters, 343 cards, 236 places, 89 works, 87 people —
readable today only by playing past them. The codex is the reference view: a
browsable atlas of everything, from the start screen and in-game.

- Era → chapter → event navigation; thread reading rooms (the loom view already
  exists — the codex gives it a front door); the corpus shelf; the gazetteer as a
  map index with native names; full-text search over titles, cards and teaches.
- Every codex entry deep-links to its card, and cards link back. The `where`
  pulses gain a click-through.
- Marked clearly as *reference, not spoilers*: window/latent events show their
  uncertainty, not their firing year.

**Done when:** any event is reachable in three clicks from the start screen; search
returns Uttaramerur from "lot", "committee" and "உத்தரமேரூர்"; the codex adds no
second data path (it reads `timeline.json` exactly as the game does).
**Trap:** building a second UI kit. The codex is made of the ledger, slips and
cards that already exist.

## Phase 48 · The first fifteen minutes — onboarding, diegetically

The Chola baseline says the systems can sustain a decision every 2.8 minutes — for
a player who knows the verbs. The protocols will measure discoverability; this
phase gives discoverability its best honest shot *before* the humans arrive, so the
round measures the real game rather than an unlabelled panel. (This does not touch
the cadence table — the pre-commitment holds.)

- **The ledger teaches.** First-run contextual slips, in the game's voice, keyed to
  first occurrences: first surplus ("Someone could be fed to remember things"),
  first work at risk, first choke, first frontier contact, first era turn. Each
  slip appears once, is dismissible, and is a *sentence*, not a tour.
- **The campaign picker frames.** Each start states its premise in two lines and
  its first task in one ("Thanjavur, 985. The survey is unfinished and the
  Pandyas are not.").
- A `?` toggle that labels every panel with its one-line purpose, off by default.
- Telemetry gains `slipsShown` / `slipsDismissedUnread` so the human round can say
  whether the teaching landed.

**Done when:** a cold headless run scripted to *only follow slips* reaches its
first patronise, first copy-out and first route within 15 play-minutes; no slip
fires twice; all slips off = today's exact experience.
**Trap:** tutorial voice. Every slip is written in the game's register — the
worked test is reading one aloud next to a card and hearing no seam.

## Phase 49 · Sovereignty made visible

The four-claim stack (holder / revenue / tributary / paramount) and fourteen
occupations run in the sim and surface almost nowhere. This phase gives the game's
titular idea its map.

- **The mandala map-mode**: concentric shading from the player outward — held,
  revenue-claimed, tributary, paramount — with the transparent-sheet treatment the
  visual language already specifies (a sheet laid over the model, not a repaint).
- **Occupation weather**: while an occupation is active, its extraction and
  patronage render as a standing banner on the ledger and a wash on its `where`
  regions; its trust cap shows on the trust ladder as a physical stop.
- The claims panel: any site clicked shows its full stack, and the stack's history
  in this campaign.

**Done when:** the 1858 paramountcy moment is legible on the map without reading a
card; the trust ladder visibly hits the Company's ceiling; a test drives the
map-mode and asserts the four layers draw distinctly at three zoom levels.
**Trap:** colour. The stack renders in *one* hue at four lightnesses plus the gold
that always means *yours* — semantic colour stays out of the terrain palette.

## Phase 50 · The dive deepens — Thanjavur at street level

`render-city` proves the camera contract; the city under it is thin. This phase
makes the L10–L16 dive worth taking, in the one city with the data to earn it.

- The prakaram rings from `cities.json` render as walkable ground truth: gates,
  streets, the temple at the centre with its 400 named staff (the cohort data
  exists) as placed, hoverable people.
- **Three interior scenes** as composed panels (the phase-45 pattern): the
  scriptorium (the corpus at work — what is being copied right now, from the sim),
  the treasury (endowments and lending, live), the assembly (the variyam
  committees, with this campaign's members drawn by lot on schedule).
- The dive tutorialises nothing; the slips from phase 48 cover it.

**Done when:** diving from L9 to the temple floor never breaks the camera contract;
each interior reflects live sim state (a work lost yesterday is missing from the
scriptorium's desks today); frame time at L12 stays under 8 ms on the smoke rig.
**Trap:** scope. One city, three rooms, everything else stays symbolic. Madurai
and Pataliputra get city models only when Thanjavur has proven the loop.

## Phase 51 · Every pair of hands — accessibility and touch

- Keyboard: full map navigation, panel focus order, cards readable and keepable
  without a pointer; visible focus states in the kit.
- Screen reader: cards and year pages as sensible reading order with alt text on
  plates and sprites; live-region notices.
- `prefers-reduced-motion` honoured (pulses, pans, scene transitions); the
  colour-vision pass re-validated with the new map-modes from phase 49.
- Touch: pinch-zoom and two-finger pan on the map; hit targets ≥ 40 px; the
  watched-caravan scene and slips usable on a phone in portrait.

**Done when:** the Chola slice is completable keyboard-only in the smoke harness;
Lighthouse a11y ≥ 95 on the bundle; pinch-zoom verified in the touch-emulating
probe.
**Trap:** retrofitting forever. The kit components gain the states once, centrally,
in `kit.css` — not per panel.

## Phase 52 · The sound of the eras

`sound.js` already makes the corpus audible and goes silent in 1193 — the best
audio idea shipped. Extend the same philosophy: audio as state, never as wallpaper.

- Era materials get voices: the tick itself (gnomon-soft before coinage, water
  clock, brass after 1600); texture incidents as single quiet strikes by family
  (weather / knowledge / road / village); occupations as a sustained undertone
  while active.
- The drying: the Indus era's water gauges modulate a slowly thinning drone —
  the antagonist with no face gets a sound with no melody.
- All of it behind the existing sound toggle, and silent by default until the
  player opts in (unchanged).

**Done when:** a blindfolded listener can tell era, prosperity and crisis apart in
a 60-second A/B; no loop is under 3 minutes; the 1193 silence still lands.
**Trap:** loudness creep. The mix budget is fixed at today's peak; new sounds fit
under it or don't ship.

## Phase 53 · The second campaign — GATED

**Runs only after the `docs/18` human round reports.** The round arbitrates the
Indus's three remedies (more verbs / fewer hours / accept the register); this
phase implements whichever wins and then ships the second campaign start:

- **The Emptying, 2600 BCE** — a campaign that begins at the urban peak and ends
  at the -1900 reckoning, with objectives (per `campaign.js`'s pattern) about
  what is carried, never what is held.
- If the round chooses *more verbs*: water allocation between fields and towns,
  choosing which works the columns carry (the corpus hook exists), caravan
  scheduling against the drying. If *fewer hours*: the cadence table moves and
  the density tests move with it, in one commit that says so.

**Done when:** the campaign picker offers two honest starts; the Indus session
protocol re-runs green against the chosen remedy; the reckoning reads as the era's
thesis.

## Phase 54 · Ship shape — release readiness

- **Credits and licences page** (a legal requirement, not polish): the OFL
  attribution for the nine embedded Noto subsets, data source acknowledgements,
  and the dispute register's standing statement of method.
- **Save format versioning**: saves carry a schema version; the loader migrates
  or refuses legibly. A test loads a phase-38-era save against today's engine.
- **Failure surface**: a sim exception during recompute shows the era-styled
  "the record is damaged" panel with the save blob offered for copy — never a
  white screen.
- Version stamp in the ledger's colophon: commit, build date, datapack hash — the
  fingerprint the bug report needs.
- The performance tripwire from this doc's preamble wired as a test that fails
  if full recompute at 1900 exceeds 400 ms on the CI rig.

**Done when:** `npm run verify` covers save migration and the failure surface; the
credits page names every font file shipped; a deliberately corrupted save fails
kindly.

---

## Order and gating

| Order | Phase | Size | Gate |
|---|---|---|---|
| 1 | 45 The road, played | L | — |
| 2 | 46 The chronicle | M | — |
| 3 | 47 The codex | M | — |
| 4 | 48 First fifteen minutes | M | — |
| 5 | 49 Sovereignty visible | M | — |
| 6 | 50 The dive deepens | L | — |
| 7 | 51 Every pair of hands | M | — |
| 8 | 52 Sound of the eras | S | — |
| 9 | 53 Second campaign | L | **human playtest round** |
| 10 | 54 Ship shape | M | — (precedes any public build) |

45–48 before the human round if possible — they are what the testers will touch;
49–52 in any order after; 54 before anything is shown beyond the private link.
The standing rule of the first two arcs carries: tests extended before code is
called done, one commit per phase that says what was learned, and the expectation
that at least three of these phases will falsify something the current 295 tests
believe.

---

## Execution record (this arc)

Phases 45–52 and 54 executed and committed, one commit per phase with what it
taught. **Phase 53 was skipped at its gate, deliberately**: it runs only after
the docs/18 human round arbitrates the Indus remedies, and the gate is a
pre-commitment against retuning cadence on a developer's own taste. What the
arc falsified or forced, briefly:

- **45** — pillar gates silently swallow decisions on a fresh state; short-window
  tests must seed opening pillars, and now do.
- **48** — slips died in the 4-notice cap; teaching UI cannot share a queue with
  news. They got their own shelf.
- **49** — the claims click never fired because the caravan hit-test early-returned
  for everyone; one guard split, one lesson about compound conditionals on input
  paths.
- **51** — the a11y attributes were written against `#cv`; the canvas is `#map`.
  The keyboard smoke now presses real keys, which is the only reason anyone found
  out.
- **52** — the mix budget lives in a failing assertion, not a comment; the gain
  tables are exported so loudness creep trips a test.
- **54** — the credits test enumerates the font manifest the bundler embeds, so a
  future subset cannot ship uncredited; saves refuse with instructions, not
  adjectives; recompute cannot white-screen.

Suite at close: **329 tests green**, `npm run verify` clean, bundle 1.94 MB.
