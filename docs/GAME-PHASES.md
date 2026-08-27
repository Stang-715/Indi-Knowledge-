# India Knowledge Map — Game Phase Plan

## Vision

The atlas becomes a living country. A population of tiny chibi characters roams the
map on winding footpaths — free NPCs who represent the real people of the land, each
going about their own work. Every piece of knowledge in the atlas — the Bhagavad Gita,
the folk tales, and eventually every book and craft — is a **card**. Clicking a card
reveals a summarized version of the text. The player studies it, then **holds the
SPACEBAR** to recite it aloud to the population; everyone within hearing stops,
gathers, and listens.

The central stat is the **literacy rate**. The more the population is taught, the
higher it climbs — and the lower the chance of anyone dying. When a new book appears
that has not yet been taught, the literacy rate drops until the player studies and
recites it. This is the game's core loop: **interactive combat through literacy**.
Knowledge is the weapon; ignorance is the enemy; teaching is how you fight.

## Phase 1 — Population & the Learning Loop *(implemented)*

The foundation: the population exists, and it can be taught.

- **Chibi population.** ~240 procedurally drawn chibi NPCs (big round head, small
  body, folk-palette clothes) rendered on a canvas overlay above the SVG map. They
  wander a waypoint graph built from real district centroids, walking curved
  footpaths between districts and occasionally crossing into neighboring states.
- **The Library.** A card shelf along the bottom of the map. The Bhagavad Gita is
  18 chapter cards, revealed **in order** — chapter N+1 stays locked until chapter N
  has been taught. Folk-tale cards are derived automatically from the atlas's
  `data/folklore.js` pack (tale + moral + origin).
- **Study → Recite.** Click a card to open its study view (chapter summary and a key
  sloka in Devanagari, transliteration and translation — or the tale and its moral).
  Then hold **SPACE** over the map to recite. A ripple spreads from the cursor, NPCs
  in the hearing radius stop and listen, a progress bar fills, and on completion the
  card is **taught**. Release early and the recitation is lost. Recite over empty
  land and no one can hear you.
- **Literacy & survival.** National and per-state literacy rates are computed from
  taught vs. released cards. New books release on a schedule as game-days pass; each
  untaught release drags literacy down. Low literacy raises the daily death chance of
  NPCs in that state; high literacy brings births. The population visibly thrives or
  dwindles with how well you teach.
- **Persistence.** Progress (game day, taught cards, per-state credit, population)
  saves to `localStorage` and survives reload. A 🎮 toolbar button toggles game mode;
  the atlas works untouched with the game off.

## Phase 2 — Autonomous Work & Economy *(implemented)*

Teaching becomes practical. Skill cards join the Library — agriculture, cattle
keeping, weaving, basic arithmetic — sourced from the atlas's soil/craft/community
packs. An NPC population that has been taught a skill takes up that work
autonomously: farmers appear at district nodes tending fields, herders drive cattle
along the paths, artisans work at craft centers. Each state gains a simple
food/prosperity resource produced by working NPCs, which feeds into the mortality
model: a well-taught state feeds itself. How well you teach determines how well the
population survives.

## Phase 3 — Events & Growth Pressure *(implemented; reframed — see below)*

Periodic challenges strike a region: a drought, a wave of despair, a rumor of
superstition. Each event names the knowledge that answers it — a drought by the
agriculture cards, a despair event by the Gita's chapters on duty and steadiness, a
rumor by the folk tale whose moral answers it. This game is a nurture game, not a
combat one, so **an unanswered event never kills anyone.** It stalls the affected
state's growth for a few days — prosperity stops climbing, though it never falls
below where it was — until the event passes or is taught. Answering it in time does
more than clear the problem: it lifts the stall immediately and gives that state's
population a visible growth pulse, the reward for teaching the right thing in the
right place. Event banners and pulsing state markers keep the stakes visible; the
stakes themselves are "grow slower for a while," never "lose people."

## Phase 4 — Depth of Knowledge *(implemented: decay, quizzes, scholars, literacy view)*

From coverage to mastery. Gita chapters expand into sloka-by-sloka mini-decks;
knowledge decays over time and is refreshed by recall quizzes (the game asks the
player about what they taught). Some NPCs become **scholars**: they autonomously
re-teach nearby NPCs, spreading knowledge along the paths without the player —
literacy propagates geographically. Literacy resolves from state level down to
district level, and the choropleth shows knowledge flowing outward from where you
taught.

## Phase 5 — Sharing Knowledge *(implemented: save codes & goals; pack pipeline in docs/CARD-PACKS.md)*

The population's learning leaves the single screen. Save codes let players export and
import a taught population. Community goals ("teach the whole Gita to every state")
track across saves. New card packs — more books, more folklore, regional literature —
enter through the moderated contribution pipeline designed in `backend/`, so every
new card meets the same sourcing bar as the atlas itself.

## Constraints carried through all phases

- **No build step, no dependencies.** Plain JS/CSS loaded by `<script>` tags;
  everything must keep working when `index.html` is opened from `file://`.
- **The atlas is sacred.** Game code is additive; with game mode off, every atlas
  feature behaves exactly as before.
- **SPEC.md integrity in spirit.** All authored card content (starting with
  `data/gita.js`) names its sources, fabricates nothing, passes `node --check`, and
  keeps ASCII quotes in code with Unicode inside strings.
