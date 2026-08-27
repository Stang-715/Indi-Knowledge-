# How a New Card Pack Enters the Game

The game's Library grows the same way the atlas grows: slowly, sourced, and
reviewed. No card is fabricated in place — every pack of teachable knowledge
follows the pipeline the atlas already designed in `backend/`.

## The path of a pack

1. **Contribution.** A proposed pack — a new book, a body of regional
   literature, more folk tales, a trade — is submitted as JSON that validates
   against `backend/contribution.schema.json`.
2. **Machine checks & review.** The submission runs the pipeline described in
   `backend/README.md`: `submitted → machine-checked → in-review → verified →
   published`, with two-key publishing. Sources are checked against the
   quality order in `data/SPEC.md` (government portals, ICAR/ASI/Census,
   academic publications before anything user-editable).
3. **Emission.** A verified pack is emitted as a plain `data/<pack>.js` file
   per `data/SPEC.md`: `window.INDIA_DATA.<pack> = { meta, ... }`, sources
   named in `meta.primarySources`, ASCII quotes in code, `node --check` clean,
   loadable from `file://` with a single `<script>` tag in `index.html`.
4. **Adapter.** A small `build<Pack>Cards()` function is added to
   `js/game-cards.js` (the existing `buildGitaCards`, `buildFolkloreCards` and
   `buildSkillCards` are the templates). The adapter decides each card's
   `kind`, `weight`, `reciteSeconds`, crisp `recite` line and `releaseDay` —
   new releases automatically apply literacy pressure until taught.
5. **Combat relevance (optional).** If the knowledge counters a hardship, the
   pack's `kind` (or a predicate on its cards) is added to the event table in
   `js/game-events.js`, so reciting it over an afflicted state resolves that
   event.

## What this preserves

- **No fabrication** — the game teaches only what the atlas would publish.
- **No build step** — a pack is one script tag; the game keeps working from
  `file://`.
- **One learning loop** — every new pack is studied and recited exactly like
  the Gita and the folk tales; nothing new to learn about learning.
