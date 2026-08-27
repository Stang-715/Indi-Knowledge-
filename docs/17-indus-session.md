# The Indus Session — the scripted 90-minute playthrough, first findings

**Phase 38's deliverable proof.** A headless-driven session of the Indus era
(2600–1900 BCE, 20 hours of the campaign at full cadence), played as a
*reasonable* player, not an optimal one: wells early at the famous cities,
provisioning the big two through the drying, deliberate resettlement of the
Ghaggar line once the signs are clear, plus the standing verb set — patronage,
a Meluhha route, caravans, gifts to kin.

Driver: the scripted session in `packages/sim/test/indus.test.js` (the suite
runs a compressed version every build); full script preserved in this doc's
history.

## What the era does now

- **The arc holds.** Growth to ~2300, then the drying bites per-river:
  the Ghaggar towns go first (Kalibangan around 2130), the Indus towns after,
  and under any strategy at most Dholavira still stands at 1900 — its
  rain-fed reservoirs genuinely buy centuries, which is the model honouring
  the archaeology.
- **There is no win state, by test.** Maximum effort — provisioning and
  wells at every town every generation with an absurd treasury — ends with
  ≤2 towns standing, asserted in the suite. "I saved Mohenjo-daro" is a bug
  report. (The first two implementations failed exactly this test: a
  too-gentle decline table, then a wells-as-threshold exploit that granted
  immunity. The test found both before any player could.)
- **The real verb is the column east.** Managed resettlement carries more
  than twice the techniques of unmanaged drift, plus the seed grain and the
  songs; the reckoning — no score, per the campaign's rule — reports what
  persisted and says plainly that the dispersal was survival.

## The numbers, honestly

| Measure | Session result | Target | Verdict |
|---|---|---|---|
| Worst silent stretch | 17.1 play-minutes | ≤ 20 | passes — and 17.1 is the two-tick floor at 5-year granularity |
| Decision density | one applied decision per **18.5** play-minutes | one per ~5 | **misses, by 3–4×** |
| Reckoning | 6 of 7 emptied, 22 columns east | dispersal, not defeat | passes |

## The finding that matters

**Twenty hours is not yet earned.** The era's *events* and *texture* now meet
the reading cadence, but its *decisions* do not: even an active player finds
a meaningful choice only every ~18 minutes, against the plan's one-per-five.
Three honest options for phase 43's human playtest to arbitrate:

1. **More era verbs** — water allocation between fields and towns, caravan
   scheduling against the drying, choosing *which works* the columns carry
   (the corpus hook exists and is not yet wired to resettlement).
2. **Fewer hours** — drop the Indus from 20 to ~14 in the cadence table and
   give the difference to the Second Urbanisation, which has verbs to spare.
3. **Accept the register** — the era is deliberately quieter, closer to a
   walking simulator through a civilisation's evening; some players will
   treat that as the point.

The pre-commitment from `16-gap-closure.md` stands: the cadence table moves
on playtest evidence, and the 210 hours are not sacred. This page is the
first entry in that evidence file.
