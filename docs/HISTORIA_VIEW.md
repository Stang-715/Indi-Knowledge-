# The Historia View — UI Specification

This is the screen described in the brief: click a state, the map isolates to it, and a
long right-hand rail opens where you choose which strand of history to read, year by year.

```
┌──────────────────────────────────────────┬──────────────────────────────────┐
│                                          │  KERALA          formed 1956     │
│                                          │  ────────────────────────────────│
│                                          │  ERA   ◀ Republic: Nation-Bldg ▶ │
│         [ single state, isolated ]       │  YEAR  ├──────●───────────────┤  │
│                                          │        -50            1957  2026 │
│           map dims all other             │  ────────────────────────────────│
│           states to 8% opacity           │  ⚔  Wars & Conflicts        (4)  │
│           and zooms to bounds            │  📜 Laws & Legislature      (7)  │
│                                          │  🧵 Crafts & Making         (1)  │
│           pins mark events in            │  ★  Key Highlights          (2)  │
│           the selected year              │  📈 Development Journey     (3)  │
│                                          │  🪔 Culture & Thought       (0)  │
│                                          │  🌊 Disasters & Shocks      (2)  │
│                                          │  ✊ Movements & People      (3)  │
│                                          │  ────────────────────────────────│
│                                          │  1957 · Key Highlight            │
│                                          │  The world's first elected       │
│  ◀ back to India                         │  communist government takes...   │
│                                          │  [verified]  [read +1 Insight]   │
└──────────────────────────────────────────┴──────────────────────────────────┘
```

## Interaction

**Selecting a state.** Click on the India map → camera eases to that state's bounds
(600ms), all other states drop to 8% opacity, the rail slides in from the right. The URL
becomes `/historia/kerala/1957` so any year of any state is directly linkable.

**The year scrubber.** Its scale is *non-linear*, and deliberately so: it is segmented by
era, and each era's segment is sized by how many events it holds, not by how many years
it spans. Linear time would give three-quarters of the bar to eras with a dozen events
between them. Dragging snaps to years that have content; empty years are visibly greyed
so a player can see where the record is thin rather than assuming nothing happened.

**The rail.** Eight collapsible strands, ordered by `rail_order` in `taxonomy.json`, each
showing its event count for the current year *or* the current era when no year is
selected. Selecting a strand filters the map pins to that category.

**An event card** shows: title, year (with a precision marker — `c. 1050` for
century-resolution), summary, actors, places, a confidence chip, and its sources. Cards
are the atom of the reading experience and the unit that earns Insight.

## Rendering rules that matter

**Confidence is always visible.** A chip on every card: `verified` / `corroborated` /
`single source`. Below `corroborated` the card carries a muted "still being verified"
note. Players should always know how firm the ground is — this is a history product, and
hiding uncertainty would be the one unforgivable design choice.

**Contested events show both readings.** Where historians genuinely disagree, the card
splits into two columns rather than picking a winner.

**Sensitive events read differently.** No Insight reward, no quiz, no Scenario Card —
full context, plain presentation, sources foregrounded.

**Inherited history is labelled, never hidden.** Telangana's rail carries Kakatiya and
Nizam-era Hyderabad even though the state dates from 2014. Every era block preceding
`formed` shows a lineage ribbon: *"as part of Hyderabad State → Andhra Pradesh"*, drawn
from `lineage` in `states.json`. The inheritance model is honest on screen, not just in
the schema.

**Coverage gaps are shown.** The `coverage` block in each Historia file lists `gap_years`.
The scrubber greys them. An empty year says "no events recorded yet — help us find some",
never nothing at all.

## Historia keeps updating

The `era.digital` block is marked `live: true`. The ingest cron advances its end year
annually and appends new events, so a returning player finds the timeline extended. The
rail badges anything added since their last visit.

## Performance

- State GeoJSON simplified to ~15KB per state; full-India outline loaded once
- Historia files load per state on demand (largest seeded file is ~30KB)
- The year scrubber indexes events by year at load; scrubbing touches no network
