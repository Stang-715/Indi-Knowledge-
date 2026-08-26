# Handoff — Indi-Knowledge / *Paramountcy*

Everything built so far, what each file is, and where to pick up. Written so a fresh
session can start from this document alone. **Rewritten in phase 44 from the actual
tree** — the previous version predated phases 12–43 and lied to newcomers.

**Repo:** `Stang-715/Indi-Knowledge-` · branch `claude/amazing-hopper-q6g8s7`
**The game, live:** https://claude.ai/code/artifact/fccc9042-9f5e-49dd-87a4-3e73e46ee8a6
**Tests:** `npm test` (329, all green) · `npm run verify` · `npm run gaps` (coverage report)
**Build:** `node tools/build-timeline.mjs` → `node tools/build-client.mjs` → `dist/paramountcy.html` (single file, ~1.9 MB, colophon-stamped)

---

## 1. What the game is, in five sentences

An India-only grand strategy game, 6000 BCE → 1947, pegged to Victoria 3 but with its
centre of gravity in the deep past — **82% of a 210-hour campaign falls before 1300 CE.**
Its first economy is not goods but **stories**: for roughly three thousand years there is
no money, and a storyteller recites and is fed in grain. Works are economic entities that
are never deleted, only reduced to zero surviving carriers, so the corpus is maintained
infrastructure with running costs and **neglect destroys more of it than any invasion**.
Sovereignty is a **stack, not a colour** — holder, revenue claimant, tributary superior,
paramount — because for most of Indian history rule was graded and overlapping. The map
is generated from 138 KB of control data rather than shipped as an image.

## 2. The fundamental rule

`world = f(datapack, seed, decision_log)` — the game never saves the world, only what
you did. Four boundaries must not blur: `sim` is deterministic and headless (a
build-failing grep enforces it); `worldgen` is a pure function; the two renderers share
only a camera contract; datapacks never contain code.

## 3. The tree, honestly

### Data (`data/`)
| Path | What it is |
|---|---|
| `timeline/timeline.json` | **Generated.** 1,382 events with `where`, `affects`, `teaches`, `threads`, `chapter`, `sources` on disputes. Regenerate with `tools/build-timeline.mjs`; never hand-edit |
| `timeline/supplement/*.json` | The authored event supplements (phases 23–40) the generator merges |
| `timeline/cards.json` | 343 authored Tier-1 cards |
| `timeline/threads.json` | The 15 threads with declarative auto-tag rules |
| `timeline/texture.json` | The procedural layer: 36 incident templates, 74 surface variants |
| `timeline/occupations.json` | 14 standing states of rule (extraction, patronage, trust caps) |
| `timeline/affects.json` · `sources.json` | Hand-authored pillar claims; citations for the 72 disputes |
| `gazetteer/places.json` | 236 places with coordinates; 203 carry native names in 9 Indic scripts |
| `fonts/*.woff2` + `manifest.json` | Exact-subset Indic fonts, 159.5 KB total (`tools/fetch-fonts.mjs`) |
| `corpus/works.json` · `people/people.json` · `polities/polities.json` · `cities/` · `skeleton/` · `art/sprites.json` | The works (89), named people (87), polities, Thanjavur city model, map skeleton, sprite manifest (85 prompts, 3 anchors generated) |

### Simulation (`packages/sim/src/`)
`engine.js` (the loop; canonical decision ordering; edge-year pass) · `state.js`
(pillars with squared-headroom diminishing returns; shocks that heal) · `corpus.js`
(carriers, scriptorium, catastrophe/preserve, the missionary vector) · `texture.js`
(the m-tier: deficit-paced, cadence-aware, never-repeating) · `indus.js` (the
no-villain era: unbeatable water, triage verbs, scored-nothing reckoning) ·
`occupations.js` · `events.js` (dated/window/latent/conditional triggers) ·
`trade.js` (routes, chokes, caravans, the capped trust ladder) · `sovereignty.js` ·
`pillars.js` · `frontier.js` · `people.js` · `survey.js` · `save.js` · `campaign.js` ·
`clock.js` · `rng.js` · `effects.js`

### UI & client
`packages/ui/src/`: `eventcard.js` (three tiers + thread navigation) · `cardplate.js`
(the exportable 1200×1600 card) · `telemetry.js` (local playtest metrics) ·
`sprites.js` (26 procedural, rig-consistent) · `sound.js` · `kit.css`.
`packages/render-realm` (L0–L9) and `render-city` (the Thanjavur dive) share a camera
contract. `apps/client/` is the assembled game; `tools/build-client.mjs` bundles
everything into one ASCII-safe HTML file.

## 4. Current state (third arc, docs/19-play-depth.md, phases 45–54)

Phases 1–52 and 54 are executed and committed, each with the correction it forced —
the standing lesson is that **writing content is how the sim's bugs get found**.
**Phase 53 (the second campaign) is the one open phase, gated on the docs/18 human
playtest round** — it implements whichever Indus remedy the round chooses, and the
gate is a pre-commitment: do not retune cadence before humans report. The third arc
shipped: standing orders and watched caravans on the road; the chronicle; the codex;
onboarding slips; the mandala map mode; the deeper Thanjavur dive; keyboard/touch/
reduced-motion access; era-material audio; and ship-shape (OFL credits, legible save
versioning, the damage panel, colophon, 400 ms perf tripwire). Binding constraints:
the **20-minute density rule**, the **silence-in-play rule**, the **audio mix
budget**, and the **perf tripwire** — all tests.

**Headless baselines** (docs/18-playtest-protocols.md): the Chola slice runs at one
decision per 2.8 minutes, worst silence 7.6 — the slice ruling holds. The Indus runs
at one per 18.5 against a one-per-five target — the known miss, with three remedies
waiting on human data (docs/17-indus-session.md).

## 5. Still open, and whose it is

1. **The specialist pass** — historian, archaeologist, cultural reviewer. Briefing at
   `docs/15-specialist-pass.md`; citations exist on all 72 disputes so their first week
   is review. **Release gate. A hire, not a task.**
2. **Human playtesting** — protocols and baselines ready (`docs/18`); needs three
   humans, one unbriefed. A repository cannot playtest itself.
3. **Survey of India geometry** — the outline is a visual mask; release blocker under
   the Criminal Law (Amendment) Act 1990. Pair with the jurisdiction question.
4. **Studio jurisdiction** (00-plan §12.1) — unanswered; decides sub-metre data and P3.
5. **The 85 real sprites** — blocked on allowlisting `*.cdnpk.net`; manifest and
   locked lighting rig are ready; phase 42's plate takes the swap when they land.
6. **Nastaliq** — Perso-Arabic place forms were deliberately deferred in phase 41;
   the affected places fall back to Latin.

## 6. How to pick up

```
npm test                    # 295 green before you touch anything
node tools/build-timeline.mjs   # after any data/doc change
node tools/build-client.mjs     # then rebuild the bundle
npm run gaps                # the coverage report, targets retired
```

Read `docs/16-gap-closure.md` for the plan that got here and the external track that
remains. Every phase ends the same way: generator green, tests extended before code is
called done, one commit that says what was learned.
