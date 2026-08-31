# Gap register — deferred work

**Purpose.** Everything a phase left behind, recorded at the moment it was left,
so it can be picked up cold. This file is the punch list to run *after* the
numbered phases, before any release. It is written to be executable by someone —
or something — with no memory of the conversation that produced it: each entry
says what is missing, why it matters, where it lives, and how to know it is done.

**Rule for adding to it.** When a phase ships, anything that phase's plan
promised but did not deliver is recorded here *before* the phase is called
complete. A gap recorded is a gap that can be closed; a gap only mentioned in
conversation is lost by the next session.

---

## Correction to the Phase 2 completion claim

Phase 2 was reported as "exit criteria met". That was true of one of the three
criteria the build plan actually set, and overstated on the other two.

The plan's Phase 2 exit criteria were:

> Surface 1 renders correctly in a 22-language pseudo-locale at 160% text with
> no clipping; contrast audit passes AA; no hard-coded string remains.

| Criterion | Actual state |
|---|---|
| Pseudo-locale at 160%, no clipping | **Met.** Verified in a browser, Surface 1, one viewport, dark theme. |
| Contrast audit passes AA | **Not done.** No contrast was measured anywhere, by any tool, at any point. The accessibility check prints "still needs a browser: contrast against the live gradient" and that browser pass was never built or run. |
| No hard-coded string remains | **Partly.** True for `components/chowk/` and `surfaces/`. 59 hard-coded strings remain in `citizen/`, `gov/` and `oversight/`, and the CI check does not look at those directories, so it passes while they are there. |

The contrast gap is the one that matters most, because the whole design rests on
white text over a coloured mesh whose brightness changes as it drifts — which is
precisely the case where contrast fails without anyone noticing. It is recorded
as **G-2E-01** and should be treated as the highest-priority item in this file.

---

## How to read an entry

- **ID** — stable, referenced in commits that close it.
- **Severity** — `blocker` (must close before release), `major` (closes a
  promise the plan made), `minor` (quality, safe to defer).
- **Verify** — the observable condition that proves it is closed. If an entry
  has no verifiable condition, it is not specified well enough to action.

---

## Phase 2a — behavioural glass

### G-2A-01 · Pressure states are defined but applied to nothing
**Severity:** major
The `.glass--press` class in `src/design/base.css` implements the compression,
rim brightening and blur tightening that make a touch visible. It is used by
zero components — verified: `grep -r "glass--press" src --include=*.tsx` returns
nothing. So the third of Phase 2a's three claims ("pressure states") shipped as
dead CSS.
**Where:** `src/design/base.css`, and every glass surface that is also a control.
**Do:** apply to the dynamic island when tappable, sheet action rows, disclosure
summaries, and the chips on Surface 1.
**Verify:** every interactive glass surface visibly compresses on `:active`, and
a grep for `glass--press` returns at least one usage per interactive glass
component.

### G-2A-02 · Content tint reaches two surfaces out of eight
**Severity:** minor
Only `IslandNav` and the Sarathi log call `useContentTint`. The chips, the ask
input, `Sheet`, `Disclosure`, `DynamicIsland` and `ScreenState` are all glass and
all still use the static token, so they do not change with the ground beneath
them — which is visible as an inconsistency once you know to look.
**Where:** `src/components/chowk/useContentTint.ts` consumers.
**Verify:** each glass component sets `--glass-tint` from a sample; a scripted
check reads the computed variable on each and finds it non-empty on all four
surfaces.

### G-2A-03 · Never profiled on a real low-end handset
**Severity:** blocker
The build plan named this risk and its own mitigation: *"measure on a real target
handset first and drop to a static tint on that tier rather than lowering frame
rate."* Neither half happened. There is no device-tier detection anywhere, and
`backdrop-filter` plus a per-frame canvas repaint plus per-scroll pixel sampling
is the exact combination that falls off a cliff on a software renderer.
**Where:** `src/components/chowk/MeshGround.tsx`, `useContentTint.ts`, and the
`.glass` rules.
**Do:** measure on a real ₹8,000-class Android device; add a tier signal; on the
low tier drop `backdrop-filter` to a flat token, stop the mesh animation, and
disable sampling.
**Verify:** sustained 60fps scrolling Surface 1 on the named device, recorded.

### G-2A-04 · Sampling lags the drifting ground
**Severity:** minor
`useContentTint` re-samples on scroll, on resize, and otherwise every 900 ms. The
mesh drifts continuously, so between scrolls the tint is up to 900 ms stale. Not
visible today because the drift is slow; will be visible if the drift is ever
sped up.
**Verify:** tint tracks the ground with no perceptible step, or the interval is
documented as deliberate with the drift speed it assumes.

---

## Phase 2b — string catalogue

### G-2B-01 · 59 hard-coded strings outside the checked directories
**Severity:** major
`citizen/`, `gov/` and `oversight/` were never extracted — they are the legacy
civic screens, the department portal and the transparency layer. Counted:
`grep -rno '>[A-Z][a-z][^<>{}]\{8,\}<' src/citizen src/gov src/oversight` returns
59. The CI rule's `CONTENT_DIRS` is `['components/chowk/', 'surfaces/']`, so the
check reports a clean pass over a codebase that is more than half untranslated.
**Where:** `src/citizen/*`, `src/gov/*`, `src/oversight/*`;
`app/scripts/check-a11y.mjs` line ~138.
**Do:** extract as each surface is rebuilt into Chowk (Phases 5–8), then widen
`CONTENT_DIRS` to `src/` and delete the exception.
**Verify:** `CONTENT_DIRS` covers all of `src/`, and `npm run check:a11y` passes.

### G-2B-02 · Eighteen of twenty-two languages have no translation
**Severity:** blocker for the DPDP deadline, major otherwise
`status: 'pending'` appears 18 times in `src/i18n/locales.ts`. Only `en` is
complete; `hi`, `bn`, `ta`, `mr` are partial. The DPDP Rules require the *consent
notice* in English or any Eighth Schedule language, which the architecture now
supports and the content does not. This is a translation commission, not an
engineering task, and it has a date attached — 13 May 2027.
**Where:** `src/i18n/strings.ts`, `src/i18n/sarathi.en.ts` (132 keys).
**Do:** commission the consent-notice keys first (`consent.*`, `rights.*`), then
the shell, then Sarathi. Sarathi's 132 keys are the largest body and the least
legally urgent.
**Verify:** `LOCALES` reports no `pending` status for any language offered in the
picker, and the consent notice renders fully translated in a spot-check of five.

### G-2B-03 · Right-to-left never tested
**Severity:** major
Urdu, Kashmiri and Sindhi are declared `dir: 'rtl'` and `document.dir` is set
from it, but no RTL layout has ever been rendered. The island nav, the dynamic
island, the log's left/right message alignment and every `margin-inline` are all
likely wrong.
**Verify:** `check-layout.mjs` runs an RTL locale and passes; the message log
mirrors correctly; the dock's glow lands on the right tab.

### G-2B-04 · No locale-aware number, date or plural formatting
**Severity:** major
Interpolation is string substitution. `{n} characters left`, vote counts,
timestamps and countdowns all render in English conventions regardless of locale
— Indic digit shapes, lakh/crore grouping and plural categories are all
unhandled.
**Where:** `src/i18n/index.tsx` `interpolate`.
**Do:** `Intl.NumberFormat` / `Intl.DateTimeFormat` / `Intl.PluralRules` keyed on
the locale's BCP-47 tag, which is already on every `Locale` entry.
**Verify:** a Hindi locale renders ₹48,00,000 rather than ₹4,800,000, and a
plural key resolves correctly for a language with more than two plural forms.

### G-2B-05 · Pseudo-locale only ever run against Surface 1
**Severity:** major
`check-layout.mjs` visits `/s/sarathi` and nothing else, at one viewport
(390×844), in one theme (dark). Every other screen in the app is unverified
against long text.
**Verify:** the check walks all four surfaces plus onboarding and the privacy
screens, at 320px and 390px, in both themes.

---

## Phase 2c — fonts

### G-2C-01 · Three Eighth Schedule scripts have no face at all
**Severity:** blocker for those locales
`carried: false` in `src/i18n/locales.ts` for Nastaliq (Urdu, Kashmiri, Sindhi),
Ol Chiki (Santali) and Meetei Mayek (Manipuri). Those locales currently render in
whatever the system supplies, which on many Android builds is tofu. They are
named rather than hidden, which is the right first step and not a fix.
**Do:** source and self-host faces; Noto covers all three.
**Verify:** each script renders real glyphs on a stock Android device.

### G-2C-02 · Fonts load from a third-party CDN at runtime
**Severity:** major
`src/i18n/fonts.ts` injects a `<link>` to `fonts.googleapis.com`. This
contradicts three earlier decisions and one product constraint:
- The display face was deliberately embedded in the bundle precisely because a
  linked face fails silently at the wrong proportions.
- The app is meant to work offline; a locale switched to while offline gets no
  face.
- It leaks a request to a third party on locale change, which is exactly the kind
  of quiet disclosure the privacy architecture exists to avoid — and which the
  consent notice does not mention.
**Do:** self-host subset faces, served from the same origin, cached by the
service worker.
**Verify:** no third-party request on any locale change; a locale switch works
with the network disabled.

### G-2C-03 · Faces are not subset
**Severity:** minor
Full script faces are fetched. Subsetting to the glyphs the catalogue actually
uses would cut them substantially, which matters on the connections this app
targets.
**Verify:** a per-locale font payload budget is enforced in CI and met.

---

## Phase 2d — screen states

### G-2D-01 · Three of the four states are unused
**Severity:** major
`ScreenState` supports empty, loading, error and stale. Exactly one usage exists
in the codebase — the offline note on Surface 1 — verified:
`grep -rn "<ScreenState" src --include=*.tsx` returns 1. Nothing uses `empty`,
`loading` or `error`, largely because no surface fetches anything yet. The
component is therefore untested against real use.
**Where:** every list and detail screen, from Phase 4 onward when data becomes
asynchronous.
**Verify:** each of the four states is reachable in the running app, and the
layout check screenshots all four.

### G-2D-02 · Low-bandwidth mode is not honoured by any Chowk surface
**Severity:** major
`prefs.a11y.lowBandwidth` exists, is settable, and sets `data-bandwidth="low"` on
the root — but no Chowk component reads it. Verified: zero matches for
`lowBandwidth` under `src/surfaces` and `src/components/chowk`. The mesh, the
glass blur and the per-frame canvas all keep running in the mode that exists to
turn expensive things off.
**Do:** in low-bandwidth mode, replace the mesh with a flat token, drop
`backdrop-filter`, and stop sampling. This overlaps G-2A-03 and should be built
once, with the device tier and the user setting as two inputs to one decision.
**Verify:** enabling the setting measurably reduces paint cost and stops network
and canvas work.

---

## Phase 2e — accessibility in CI

### G-2E-01 · Contrast is not measured anywhere — CLOSED
**Severity:** was blocker · **closed** by `scripts/check-contrast.mjs`
Measured empirically rather than statically, because the backdrop is a drifting
gradient behind glass and is in no stylesheet: hide the ink, screenshot the real
composited backdrop, decode it in the page, and contrast each element's colour
against the *worst* pixel behind it, at three points in the mesh drift, across
five routes and both themes. Found 55, of which 25 were the checker's own bugs
(occlusion by the fixed dock, boxes straddling the viewport edge, closed
`<details>`); 30 were real and are fixed. Proven to fail by injecting a
regression. Now 460 elements measured, all AA.
Original text follows for the record.
**Severity:** blocker
No contrast checking exists. `check-a11y.mjs` cannot do it — contrast depends on
rendered colour, and the design deliberately puts white text over a *moving,
recolouring* gradient. So the one case most likely to fail AA is the one case
nothing looks at. The build plan set "contrast audit passes AA" as a Phase 2 exit
criterion and it was reported as met without being run.
**Do:** extend `check-layout.mjs` — it already has a browser. For every text
node on every surface, sample the composited backdrop behind it, compute the
contrast ratio, and fail below 4.5:1 for body text and 3:1 for large text. Sample
at several points in the mesh drift cycle, not one, because the ground moves.
**Verify:** the check runs over all four surfaces in both themes and passes; and
it has been proven to fail by deliberately lowering one colour, the same way the
five static rules were proven.

### G-2E-02 · Focus order, keyboard-only use and screen readers untested
**Severity:** blocker
None of the three has been exercised. The design system has focus styles and
`Sheet` traps focus, but no one has tabbed through a surface, and no screen
reader has read one in any script. The build plan lists screen-reader passes in
three scripts under Phase 10; the register keeps it here because the plan also
claimed an accessibility floor from Phase 2 onward.
**Verify:** every surface completable with a keyboard alone; a screen-reader pass
in Latin, Devanagari and one more script, with a real user.

### G-2E-03 · The target-size rule only inspects a hard-coded selector list
**Severity:** minor
`TARGET_SELECTORS` in `check-a11y.mjs` enumerates known interactive classes. A
new interactive class is not checked and the rule silently passes it. Discovered
while proving the rules fire: a probe on an unlisted class was not caught, which
was correct behaviour for the rule as written and a weakness in the rule.
**Do:** measure rendered target size in the browser check instead, where every
interactive element can be found by role.
**Verify:** a deliberately small new control fails the check.

### G-2E-04 · `check-layout.mjs` is not in any automated run — CLOSED
**Severity:** was minor · **closed** by `npm run check:release`, which builds,
then runs the layout and contrast checks together.
Original text follows for the record.
**Severity:** minor
It needs a served build, so it was deliberately kept out of `npm test` to keep
that fast and offline. Nothing else runs it, so in practice it runs only when
someone remembers.
**Do:** add a `npm run check:release` that builds, serves, runs the layout and
contrast checks, and tears down.
**Verify:** one command runs every check, and CI runs that command.

---

## Phase 4 — backend

### G-4-01 · The client still talks to its local mock, not the server — CLOSED
**Severity:** was blocker for Phase 4's exit criterion · **closed** by
`core/api.ts`, `core/blind.ts`, `core/sync.ts`, `core/pull.ts` and the wiring in
`data/repo.ts`, proven by `npm run check:transport`.
Writes queue and flush; reads come from a local cache that a background fetch
refreshes. The client blinds its own tokens in the browser and the server signs
them, which the suite checks by exercising the client's module against the real
issuer — if the two ever hash a nonce differently, every vote fails silently in
production, and only an interop test catches it.
The exit criterion holds: the diff touches `core/`, `data/repo.ts` and
`main.tsx`, and no component, surface or screen file at all.

Three bugs the browser found that no unit test would have:
- Two flushes could overlap, so the pseudonym was registered twice and the
  second answer — "that name exists" — stopped the queue for good. Flush and
  token refill are now single-flight.
- Registration treated "already exists" as a wall. The server cannot attribute
  a pseudonym to a requester by design, so the client cannot tell its own second
  claim from somebody else's first. What the queued writes need is that the name
  exists, which a refusal proves; the collision case is G-4-08.
- The suite itself tested a stale server twice — once a process left running
  from before an edit, once a dev server orphaned by a timed-out run. Both
  suites now start what they test, on ports they check are free.

### G-4-02 · Textbook RSA blinding, not a reviewed construction
**Severity:** major
`server/src/blind.ts` implements plain RSA blind signatures with a chained-SHA256
full-domain hash. It is correct for the property it claims and is not a
production construction. RFC 9474 (RSA-BSSA) is the reviewed one.
**Do:** replace before any real deployment; have the whole scheme reviewed by
someone who does this for a living.
**Verify:** the construction is RFC 9474 and has been externally reviewed.

### G-4-03 · Issue and spend are only separated by client behaviour
**Severity:** major
Blinding makes a token cryptographically unlinkable, but a token spent seconds
after issue is linkable by clock alone. A batch of 12 is issued so spending need
not be one-to-one with issue — but nothing enforces a delay, and the client is
free to spend immediately.
**Do:** enforce a minimum age on a token server-side, and have the client draw
its batch well before it needs one.
**Verify:** a token presented within the minimum age is rejected.

### G-4-04 · The government and oversight surfaces have no API
**Severity:** major
Only the citizen routes exist. Notice publishing, poll creation, moderation
queues and the oversight reader are still local-only, and the audit trail is
written by the server but not yet read by an independent login.
**Verify:** the oversight layer reads the server's audit database through a
login the government side does not hold.

### G-4-05 · No transport security, no deployment
**Severity:** blocker
The server listens on plain HTTP with a wildcard CORS origin, which is right for
a local test and wrong everywhere else. There is no TLS, no origin allowlist, no
deployment target — Vercel is blocked on this account, so nothing is hosted.
**Verify:** TLS enforced, origins restricted, and a named host.

### G-4-06 · Consent is enforced on the client, not the server — CLOSED
**Severity:** was major · **closed** by the `consent` table in
`server/src/db-voice.ts` and the gate in `server/src/http.ts`
Phase 3 put consent checks on the writes in `data/repo.ts`. The API does not
check them at all — it verifies eligibility and rate limits, but a request that
skips the app entirely is not asked whether the citizen consented to that
purpose. Consent enforced only in the client is the same mistake as a rate limit
enforced only in the client.
Absence is refusal: a purpose never asked about has not been consented to.
Consent is checked before the eligibility token on a vote, so a refusal does not
cost a token to discover. One write cannot be gated — marking a notice as seen
is deliberately anonymous, and adding an identifier so the check could run would
manufacture the per-citizen read receipt the consent exists to prevent. That is
a property of the data, not an oversight.
**Verified:** `server/scripts/test.ts` rejects a vote, a post and a
post-after-withdrawal; `app/scripts/check-transport.mjs` proves the refusal
holds against a write that reaches past the client's own check.


### G-4-07 · Notices, polls and moderation are still local-only
**Severity:** major
The transport carries what the server owns: responses, posts, reactions, reach
and consent. Notices and polls are still published into local content by the
government screens, so two devices do not see the same notice board — and the
seeded tallies in `data/seed.ts` are still folded into every aggregate. This is
the client half of G-4-04.
**Verify:** a notice published on one device appears on another, and
`pollAggregate` reports the server's numbers with no seeded remainder.

### G-4-08 · A pseudonym is a claim, not a credential — CLOSED
**Severity:** was blocker before any deployment · **closed** by
`app/src/core/voicekey.ts`, the shared canonical encoder in
`core/canonical.ts` / `server/src/canonical.ts`, and the signature gate in
`server/src/http.ts`.
The device generates an ECDSA P-256 key when the citizen chooses a pseudonym,
registers the public half with the claim, and signs every write under that
name. The private key is non-extractable and lives in IndexedDB: script running
in the page can sign while it is running and cannot walk away with the
identity. It belongs to the voice layer alone and never touches eligibility.

The route is part of what is signed, so a signature cannot be lifted from one
write onto another, and `at` is inside the signed payload and checked against a
15-minute window, so a captured request cannot be replayed later. Within that
window replay is harmless: every signed write is an upsert or an
insert-if-absent, deliberately.

Claiming is now idempotent for the key that holds the name, which also resolves
the ambiguity G-4-01 had to work around — a refusal means somebody else holds
it, and the onboarding screen says so while the citizen is still looking at the
field rather than leaving them with a queue that can never send.

`seen` remains unsigned, and must: it carries no pseudonym at all, because a
reach count must never become a per-citizen read receipt. The server constraint
check names it as the single exception and fails any other pseudonym-scoped
write that stops verifying a signature.

**Verified:** 11 server assertions (unsigned, wrong-key, lifted-route, stale,
repeat claim, collision, encoder parity) and 5 in the browser, each proven to
fail when the gate is removed.

### G-4-09 · A pseudonym change strands anything still queued
**Severity:** minor
A write is signed by the key that holds the name, and changing pseudonym makes
a new key. Anything still in the queue from the old name can no longer be
signed for, and sending it under the new one would put words in the new name's
mouth — so it is refused with `pseudonym-changed` and dropped. Nothing tells
the citizen that happened.
The window is small (the queue drains in seconds, and a change is on a 30-day
cooldown) but it is not nothing: a post written on a train, followed by a
rename before the connection returns, is lost silently.
**Do:** flush before a rename is committed, and if anything cannot be sent, say
what it was and let the citizen decide.
**Verify:** a rename with a pending write either sends it first or reports it.

### G-4-10 · A lost device is a lost pseudonym
**Severity:** major
Whoever holds the phone holds the signing key, and there is no recovery path:
no second factor, no way to move a pseudonym to a new device, and no way to
revoke a key that has been taken. The remedy today is to claim a new name and
lose the history attached to the old one.
Recovery is genuinely hard here — anything that lets a citizen prove ownership
of a pseudonym to the server risks becoming the join the architecture exists to
prevent. An exportable key the citizen keeps themself is the shape that does
not.
**Verify:** a pseudonym can be moved to a new device by the citizen alone, with
nothing about the transfer visible to the server beyond a key rotation.
---

## Phase 5 — Surface 3, Bills

Verified: 80 files against the six architectural constraints (including the new
rule that a file recording a poll response must render the advisory banner);
45 components and 20 stylesheets against the accessibility floor; 9 routes in
the pseudo-locale at 160% with nothing clipped; and 956 text elements across 10
routes, 2 themes and 3 points in the mesh drift, every one meeting WCAG AA
against its real composited backdrop.

Three of those checks failed first and were fixed rather than adjusted. The
layout check had only ever run one route, so a whole surface could have shipped
unmeasured; extended to nine, it failed six of them immediately. The contrast
check found the surface unreadable in light mode — seventy elements below AA,
all light-theme — because `MeshGround` paints on a dark base in both themes and
this surface had used the theme's own ink tokens.


### G-5-01 · There is no live source. Every bill is invented.
**Severity:** blocker for the phase's exit criterion
The exit criterion says a citizen can "read a live bill in plain words". They can
read a bill in plain words; it is not live. `data/bills.ts` is sample data,
marked `provenance: 'sample'` and labelled as such on screen, and nothing in the
app fetches from sansad.in, PRS or India Code.
What does exist is the machinery the fetch will need: provenance on every
record, a lag label, and a degradation path that shows the source link instead
of content. Two sample records are deliberately damaged so that path is walked
in ordinary use.
**Do:** a fetcher per source with a parser whose failure mode is `unreadable`
rather than a partial render, and a scheduled refresh that updates `fetchedAt`
whether or not the content changed.
**Verify:** a bill's stage changes in the app because it changed in Parliament,
and a deliberately broken source produces a link rather than a wrong summary.

### G-5-02 · Representatives and voting records are fictional
**Severity:** blocker before release
Constituency names and districts are real. The people are not, and every record
says so. This is deliberate: a fabricated voting record attached to a real name
is a defamation with a search index, and inventing one to fill a screen would be
the exact failure this surface exists to be an answer to.
`not-recorded` is a first-class position rather than a gap, because most business
in both Houses passes on a voice vote with no division called.
**Do:** take members and divisions from an accountable source, and treat a
mismatch as an incident rather than a data-quality metric.
**Verify:** every name on the surface traces to a published record, and a
division shown matches the House's own division list.

### G-5-03 · The Constitution is a dated subset
**Severity:** major
Twenty-five Articles of about 470, thirteen Amendments of 106, all Parts and all
twelve Schedules. The screen says so — "showing 25 of about 470" is rendered,
not buried — and every entry is a plain-words summary rather than the text,
with the source one tap away.
The snapshot is dated 29 September 2023. A constitution changes rarely, which is
exactly why an undated copy goes stale without anybody noticing.
**Do:** carry the full Article list, and check the amendment count against the
source on a schedule rather than at authoring time.
**Verify:** an Article the app does not carry is still findable, and the `asOf`
date moves when the source does.

### G-5-04 · Constituency matching is a district string comparison
**Severity:** major
A stated district is matched against the districts a constituency covers. A
district usually holds several constituencies and a constituency can span
districts, so the suggestion is a hint and the screen treats it as one — the
citizen picks, and can search instead.
This is a consequence of the location constraint, not an oversight: the precise
answer needs a ward or a polling-station number, which is more identifying than
a district, and asking for it must stay the citizen's choice.
**Do:** let a citizen state their ward if they want a precise answer, and keep
the district hint for those who do not.
**Verify:** a district with four constituencies offers all four rather than
guessing one.

### G-5-05 · The legacy poll and discussion screens still exist
**Severity:** minor
Surface 3 has Chowk-native voting and debate. `/app/polls` and `/app/discuss`
still carry the older versions, and the three polls not attached to a bill —
ward budget, night bus, street vending — are reachable only there.
**Do:** fold standalone polls into whichever surface owns them (a ward budget is
Works, not Bills) and retire the `/app` shell as Surface 4 absorbs the rest of
it.
**Verify:** every poll is reachable from a Chowk surface, and `/app/polls`
redirects rather than rendering.

### G-5-06 · Bills are not in the sync layer
**Severity:** major
`core/pull.ts` caches posts, tallies and reach. Bills, the Constitution and
constituencies are bundled with the app, so they work offline trivially and
cannot be updated without a release. This is the client half of G-4-07.
**Do:** serve legislative records from the API and cache them the same way, with
the same stale-while-revalidate read.
**Verify:** a bill updated on the server reaches an installed app without a
store release, and the app still opens on a dead connection.

---

## Phase 6 — Surface 4, Works, citizen half

Verified: 90 files against the architectural constraints, including a new rule
that fails the build if a map tile source or a map SDK that fetches them appears
anywhere in the tree — proven by planting one. 52 components against the
accessibility floor. 13 routes at 160% in the pseudo-locale with nothing
clipped. 1,226 text elements across 13 routes, 2 themes and 3 points in the mesh
drift, every one meeting WCAG AA against its real composited backdrop.

Contrast took three rounds. The first found 48 elements below AA on the new
surface, in both themes: outlined tags whose accent sat in the border and the
text at once, a pressed chip that tints its background with the hue it writes
the label in, map controls floating white over the palest road colour, and an
unselected segmented tab at a token that clears AA on violet and not on
milestone green. Twenty survived the fixes — secondary ink on glass cards over
this surface's brightest blooms — and the surface now pins brighter ink of its
own and stands its cards on a stronger scrim.

The lesson is worth keeping: milestone green is the darkest of the four hues, so
a shared token passing on three surfaces says nothing about the fourth.


### G-6-01 · No live works data, and this is the claim that depends on it
**Severity:** blocker for the phase's exit criterion
The exit criterion is "useful with zero departments signed up, purely from
published data". Everything in `data/works.ts` is invented, so the surface is
useful with zero departments and zero data — which proves the interface, not the
premise.
The premise is the risky part. Bills are published in one place in a consistent
form; roadwork permits are published by hundreds of municipal bodies, in
whatever form each chose, and in many places not at all. Whether this surface
can be built from published data is a question about Indian municipal
publishing, and it has not been answered.
**Do:** survey what three or four municipal corporations actually publish, and
build against the worst of them rather than the best.
**Verify:** one real ward's works appear from that ward's own publications, with
no department having signed up to anything.

### G-6-02 · The departments are fictional
**Severity:** blocker before release
An overrun record is a claim that a named body failed to do what it promised.
Publishing an invented one against a real authority would be a defamation with a
chart attached, so the departments here are made up and marked `sample` on
screen. The utility types, the record's shape and the Right to Service framing
are real; the failures are nobody's.
**Do:** name real bodies only against records traceable to their own
publications, and treat a disputed figure as an incident with a correction
trail rather than a support ticket.
**Verify:** every number on 4.6 traces to a published permit and a published
completion, and a department can see how its own figure was computed.

### G-6-03 · The map is schematic, not the real street network
**Severity:** major
Eight polylines in a local metre grid. Real geometry would come from a municipal
GIS layer or an OpenStreetMap extract — bundled or served by us, never fetched
per tile, for the reason the no-tiles rule exists.
The consequence is that a citizen cannot recognise their own street by its
shape, only by its name, which weakens 4.5 for anyone who does not know what
their road is called on paper.
**Do:** bundle a simplified geometry per ward, served the same way the
legislative records will be.
**Verify:** a resident recognises their junction without reading a label.

### G-6-04 · The followed-street tier has no transport
**Severity:** major
The tier exists, filters correctly on the device, and shows on the screen it
would fire from. There is no push delivery behind it — the same gap the notice
tiers have had since Phase 0. A closure alert that only appears when you open
the app is not an alert.
Delivery is the hard part here, not the filter: a push service that knows which
streets to notify about is a service holding a list of streets each person cares
about, which is a home address written down slowly. The filter has to stay on
the device, which means the push has to be contentless — a nudge to open the
app, not a message about a road.
**Verify:** a full closure on a followed street reaches a locked phone, and the
push service cannot tell which street it was about.

### G-6-05 · Street matching has no gazetteer behind it
**Severity:** minor
`normaliseStreet` folds the common abbreviations — Rd, St, Marg — and matching
is substring in both directions. A street the dataset does not carry matches
nothing and says nothing, so a citizen cannot tell "no works here" from "I have
not heard of your street".
**Do:** say which it is, and let a street be followed even when nothing is known
about it yet.
**Verify:** following an unknown street is possible and honest about being
unknown.

### G-6-06 · The departmental half is still blocked
**Severity:** blocker for the surface's purpose
4.2 file a work, 4.3 clash detection and 4.4 approval-to-permit are Phase 7 and
are blocked on institutional identity. A scheduler where anybody can file as the
Water Board is worse than no scheduler, because it launders a fake permit into a
real-looking one.
Until then the permit number on a work is whatever the publication said, and
`works.noPermit` is the common case.
**Verify:** two real departments in one ward file, clash, resolve and issue —
and a citizen can check the permit from the street.

---

## Phase 7 — Surface 4, departmental half

Verified: 94 files against the architectural constraints, including two new
rules — no module may reach both the pseudonym signing key and a department
signing key, and neither may the works store grow a citizen column — each proven
by planting a violation. 47 server assertions and 27 in a real browser, covering
the chain from enrolment through a blocked approval to a permit the citizen's
phone verifies for itself. 14 routes at 160% in the pseudo-locale with nothing
clipped. 1,260 text elements across 14 routes, 2 themes and 3 points in the mesh
drift, every one meeting WCAG AA against its real composited backdrop.

Contrast found two failures, both the same element: a field hint at the faintest
ink measured 4.13:1 over the olive part of the works bloom. It is the smallest
text on the screen and it carries the format of the thing you are about to type,
so it took the secondary ink instead.


The plan marked this phase blocked, and said the block "will not be solved by
building more screens". That is right, and it is why the work went into the
credential and the verifier rather than the forms. The exit criterion — *two
real departments in one ward file, clash, resolve and issue* — is not met and
cannot be met from here: it needs two real departments.

What is built: enrolment against a registry root, department-signed filings,
clash detection at filing time, approval refused while a clash stands, permits
signed over the root, and a citizen-side check that verifies the signature on
the phone rather than asking the server whether to believe it.

### G-7-01 · The enrolment gate does not exist
**Severity:** blocker before anything real is filed
Any body that asks is entered in the register. The signatures are real; what
they attest is that somebody held a key, not that they are the department they
name. A scheduler where a fake water board can file is worse than no scheduler,
so this is marked in the data (`enrolled_by: 'automatic'`), on the departmental
desk, and beside the green tick on the citizen's permit check.
**Do:** enrol against something that already exists and is already
accountable — the state's own notification of designated officers under its
Right to Service Act is the obvious anchor, because it is published, it names
people, and it is not ours.
**Verify:** a body that is not in that notification cannot be enrolled, and the
route by which one is enrolled is auditable by someone outside the platform.

### G-7-02 · The registry root is held by the platform
**Severity:** blocker before anything real is filed
Whoever holds the root decides who counts as government. That is the one power
this architecture otherwise refuses everywhere, and it cannot be refused here —
only placed somewhere accountable. Today it is a key file beside the server.
**Do:** decide whose key it is before the first real permit is issued, and
publish the answer. Consider more than one root, so no single body's compromise
invalidates every permit.
**Verify:** the root is held by a named body that is not the platform operator,
and rotating it is a published procedure rather than a deploy.

### G-7-03 · The root key is pinned on first use, not built in
**Severity:** major
`VITE_REGISTRY_ROOT` compiles the key into a release; absent it, the client
takes the key the server offers the first time and refuses any different one
after. First use is exactly when an attacker would like to be the server. The
permit screen says which of the two it is relying on rather than showing the
same tick for both.
**Verify:** a shipped build carries the root key inside it, and a build without
one says so on every check.

### G-7-04 · A permit cannot be checked without a connection
**Severity:** major
The signature is verified on the device, but the permit record still comes from
the server. Somebody standing next to a barrier with no signal cannot check
anything — which is most of the situations this feature exists for.
**Do:** make a permit a self-contained signed token that a QR code on the board
can carry, so the phone verifies it with no network at all.
**Verify:** a permit checks out in aeroplane mode.

### G-7-05 · Filings are not on the citizen surface yet
**Severity:** major
4.1, 4.5 and 4.6 read `data/works.ts`, which is bundled sample data. Filings
made at the desk go to the server and do not appear on the map. The two halves
of Surface 4 are correct separately and not yet joined — the same gap as G-4-07
and G-5-06, now with a third dataset in it.
**Verify:** a work filed at the desk appears on the citizen map, and its permit
number checks out from that card.

### G-7-06 · No revocation, and no key rotation
**Severity:** major
A department key that is compromised cannot be withdrawn, and a permit issued
under it stays valid forever. Nothing expires, nothing is revoked, and there is
no list of entries that have been cancelled.
**Do:** signed revocation entries under the root, and an expiry on register
entries so a stale one lapses rather than lasting indefinitely.
**Verify:** revoking a department invalidates its future filings and is visible
to a phone that only has the root key.

---

## Phase 8 — Surface 2, Bharat

Verified: 105 files against the architectural constraints, including a new rule
confining number formatting to the two files that own it — proven by planting a
`toFixed` on a trade screen. 59 components against the accessibility floor. 18
routes at 160% in the pseudo-locale. 1,632 text elements across 17 routes, 2
themes and 3 points in the mesh drift, every one meeting WCAG AA.

Contrast found six failures, all on the trade screen, all between 4.38 and 4.45
against the 4.5 needed — and all of them a figure's own label, period and age
over the harbour bloom. That is the text this entire surface exists to make
legible, so the supporting ink was raised rather than the margin argued about.
Three surfaces have now each needed their own ink: a shared token that clears AA
on violet does not clear it on milestone green, and one that clears milestone
green does not clear harbour.


### G-8-01 · No live feed behind any figure
**Severity:** blocker for the phase's exit criterion
Every number on the surface names a source and a period, and the mechanism that
makes that unavoidable is real: `Figure` cannot be constructed without both, one
component prints them, and the build fails if anything else formats a number.
What is behind them is invented. Weather is not IMD, trade is not APEDA, port
throughput is not the port authorities — the names and links are where the real
data would come from, so the shape a feed has to fit is already on screen.
The plan named data licensing as one of this phase's two non-technical risks,
and it is the live one: several of these sources publish in forms that are not
licensed for redistribution.
**Do:** settle licensing before wiring, source by source, and treat a source
that cannot be redistributed as a link rather than a figure.
**Verify:** a figure's value changes because its source published, and every
source on the page is one we are permitted to republish.

### G-8-02 · The directory entries are fictional firms
**Severity:** blocker before release
A directory entry claims a named business exists and does a particular thing.
Inventing one against a real company's name is a claim about somebody else's
business, so the firms here are made up and every card says so. `registerEntry`
is the field that will carry the identifier — an MCA company master entry, a
state industries directory listing — that makes the claim checkable.
**Verify:** every entry traces to a register, and a firm can see what is said
about it and how to correct it.

### G-8-03 · Store moderation has no human behind it
**Severity:** blocker before the directory opens
Listings auto-publish, are marked unverified, and can be reported. The report
lands in a queue on the server. Nobody reads that queue, there is no
verification tier, and nothing that would let a person work through reports at
the volume the plan expects on day one.
This is the phase's second named non-technical risk and it is not a software
problem: the moderation load the day store listings open needs staffing, a
policy for what "verified" means, and somebody accountable for applying it.
**Do:** define the verified tier, staff the queue, and do not open listings in
a locality before both exist there.
**Verify:** a report is answered by a person within a stated time, and the
directory says what verified actually checked.

### G-8-04 · A shop's map pin cannot be placed yet
**Severity:** minor
The listing form takes a stated address but no position, so a new shop is laid
out along the bottom band of the public map rather than dropped from it. That is
deliberate — an entry that vanishes because a field was left blank is an entry
its owner cannot find — but it means the map is only as useful as the sample
data until placing a pin exists.
**Do:** let the lister drag a pin on the ward map. The pin is a statement about
a business, made by its owner; nothing may read a position from the device.
**Verify:** a shop appears where its owner put it, and no code path obtains that
point any other way.

### G-8-05 · State profiles are a written snapshot, not a fetch
**Severity:** major
Formation dates, capitals and seat counts are stable public facts, written from
public record against named sources and dated. District counts carry their own
note saying they move. Nothing is fetched, so the `asOf` never advances on its
own — the same gap as G-5-03 for the Constitution, and it has the same fix.
**Verify:** the snapshot date moves when the source does.

### G-8-06 · The almanac is not in the sync layer
**Severity:** major
Stores come from the server and cache like everything else. States, weather,
trade and the directory are bundled with the app and cannot change without a
release. The client half of G-4-07, now across three surfaces.
**Verify:** a figure updated on the server reaches an installed app without a
store release.

---

## Phase 9 — Oversight transparency

The plan's exit criterion is that an operator who is neither us nor the
government can read the trail and we cannot edit it. The second half is now
enforceable from outside: the trail is a hash chain, the reader's own browser
recomputes it, and a head kept elsewhere makes a rewrite provable. The first
half is not something software delivers — it needs an operator to exist.

### G-9-01 · There is no independent body
**Severity:** blocker for the phase's exit criterion
Anybody can enrol as an observer, exactly as anybody can enrol as a department.
The credential proves possession of a key and nothing about entitlement. Until
a real body holds one, the countersignature slot is furniture.
This is the risk the plan named: the layer depends entirely on a genuinely
independent body existing, software cannot manufacture that, and pretending
otherwise is the failure the layer is meant to prevent.
**Do:** identify who. A statutory body, a court-appointed auditor, a consortium
of civil society organisations — the answer determines what the enrolment gate
checks, and it is not ours to pick alone.
**Verify:** a named body outside the platform and outside government holds an
observer key and has countersigned a head we did not choose.

### G-9-02 · Nobody is keeping the heads
**Severity:** blocker
The chain makes a rewrite detectable by anyone holding an older head. Nothing in
this system causes anyone to hold one. Published, unread, is the same as
unpublished.
**Do:** anchor the head somewhere outside — a periodic post to an append-only
public log, a transparency-log service, or simply an observer that fetches and
stores it on a schedule and publishes its own archive.
**Verify:** an independent archive of heads exists and can be compared against
this server's without our cooperation.

### G-9-03 · The transparency report counts what is easy, not what matters
**Severity:** major
Reports carry entry counts by action, request counts by kind, and the head at
publication. They do not carry what a reader would most want: how long requests
took, how many were still open at period end, which departments acted most, or
any comparison against the previous period.
**Verify:** a reader can tell from one report whether the platform is getting
better or worse at answering what is asked of it.

### G-9-04 · The government portal writes to the trail through the same server
**Severity:** major
Entries are appended by the same process that serves them. A compromised server
can therefore write plausible entries as well as decline to write real ones —
the chain proves nothing was removed after the fact, not that everything that
happened was recorded.
**Do:** have the acting party sign its own entries, the way departments already
sign filings, so an entry attests to who did it rather than to what this server
chose to write down.
**Verify:** an audit entry carries a signature from the actor named in it.

### G-9-05 · Client and server audit trails are separate
**Severity:** minor
`core/audit.ts` still keeps a local trail for actions taken in the local-only
government screens, and the oversight page reads that for the audit log tab
while reading the server for the chain. Two trails is one too many, and the one
that is not chained is the one somebody will quote.
**Verify:** one trail, chained, with the local one gone or explicitly marked as
a device-local draft.

---

## Cross-cutting

### G-X-01 · Two design systems are loaded at once
**Severity:** major
`src/styles/global.css` (legacy) and the Chowk layer both load, and Chowk
deliberately wins the tokens and control classes they share. This was the right
call to avoid a big-bang rewrite, and it is technical debt with a shelf life: two
sources of truth for `.btn`, `.chip`, `.switch` and `--ink`.
**Do:** delete `global.css` as each legacy screen is rebuilt in Phases 5–8.
**Verify:** `main.tsx` imports only the Chowk layer.

### G-X-02 · `data-text="large"` is read by one component
**Severity:** minor
Set on the root for any scale ≥ 1.3, consumed only by the island nav. Other
components that should restructure at large text — the dynamic island's expanded
state, the segmented control — do not.
**Verify:** every component that cannot simply reflow at 160% has a `large` rule.

---

## Phase 3 — DPDP consent and rights

### G-3-01 · The consent notice exists only in English
**Severity:** blocker for the 13 May 2027 deadline
The 80 `consent.*` and `rights.*` keys are the text the Act actually regulates,
and the Rules require the notice be available in English or any Eighth Schedule
language. They exist in English only. This is the highest-priority slice of
G-2B-02 and should be commissioned before Sarathi's 132 keys, which carry no
legal deadline.
**Verify:** the notice renders fully translated in a spot-check of five
languages, with no fallthrough to English.

### G-3-02 · DPO and Board contacts are placeholders
**Severity:** blocker
`GRIEVANCE.configured` is `false` and the screen says the officer is not yet
appointed. That is the honest state — a wrong grievance address silently
swallows complaints, which is worse than an obviously missing one — but it is
not compliant. The Rules require a real contact on the notice.
**Where:** `src/core/rights.ts`, the `GRIEVANCE` block.
**Do:** set when the operating entity is registered; flip `configured` to true.
**Verify:** a grievance raised in the app reaches a named person, and the Board
route is stated with a working reference.

### G-3-03 · Grievances go nowhere
**Severity:** major
`raiseGrievance` writes to device storage and starts a 90-day clock the citizen
can see. Nothing transmits it, because there is no server yet (Phase 4) and no
officer to receive it (G-3-02). The clock is therefore counting down against
nobody.
**Verify:** a raised grievance is delivered, acknowledged, and answerable, with
the response time measured against the Rules rather than a constant in the code.

### G-3-04 · Erasure clears the device, not a server
**Severity:** major
`s12` erasure is immediate and complete today because everything is on the
device. The moment Phase 4 adds a backend that stops being true, and the erasure
copy — which currently explains *why* it is instant here — becomes wrong.
**Verify:** erasure is re-specified and re-tested against the server the same
day the server exists; the copy is revised in the same change.

### G-3-05 · The age band is a demo heuristic
**Severity:** blocker
`Onboarding.tsx` derives `minor` from an identifier ending in zero, so the minor
path is exercisable without a second real identity. A real verification service
must return the band. Until then the gate is a stub with the right shape.
**Verify:** the band comes from the ID service response and nothing in the client
computes it.

### G-3-06 · Consent is not re-requested on a version bump in a running session
**Severity:** minor
`isCurrent()` compares `NOTICE_VERSION` and the notice component re-asks when it
is mounted with a stale record — but nothing forces the notice up mid-session if
the version changes under a running app. Harmless today (the version only changes
on deploy) and worth closing when consent moves server-side.
**Verify:** bumping the version while the app is open brings the notice back.

---

## Where Phase 3 stopped

Phase 3 (DPDP consent and rights) was interrupted part-way to write this file.
Committed and typechecking, but **not yet wired to any UI**:

- `src/core/consent.ts` — seven purposes, itemised and individually refusable;
  `NOTICE_VERSION` gating so a changed purpose re-asks rather than assuming;
  grant and withdrawal share one code path so withdrawal cannot be made harder
  than consent; consent receipts.
- `src/core/rights.ts` — s11 access summary read from the real store, s12
  correction and erasure, s13 grievance with a response clock, s14 nomination;
  `GRIEVANCE.configured = false` marks the DPO and Board contacts as placeholders
  rather than leaving plausible-looking fakes that would swallow complaints.
- `src/core/identity.ts` — an `AgeBand` from the verification service (band, never
  a date of birth), `mayParticipate()` and `isMinor()`, with an unknown band
  treated as a minor because the safe reading of an absent signal is the one that
  profiles nobody.
- `src/citizen/Onboarding.tsx` — verification now returns a band.

**Since resumed and completed.** The notice UI, itemised toggles, rights screens,
minor path and all 80 catalogue strings are built and verified end to end. What
Phase 3 left behind is recorded as G-3-01 to G-3-06 above.

---

## Where Phase 4 stopped

Phase 4 (backend) is complete against its exit criterion. The API holds the
identity split, consent is enforced server-side, and the client runs on it —
online and offline — with no component file changed. Three suites cover it:

- `server/scripts/test.ts` — 27 assertions, including the one that matters: a
  join across the eligibility and voice stores is not expressible in SQL.
- `app/scripts/check-transport.mjs` — 14 assertions in a real browser against a
  real API, covering the offline queue, the drain on reconnection, idempotent
  retries, and a write refused after consent was withdrawn.
- `server/scripts/check-server-constraints.mjs` — the architectural rules.

What Phase 4 leaves behind is G-4-02 through G-4-05, G-4-07, and G-4-09 and
G-4-10, which the credential work itself opened. One blocker remains before
anything is deployed to real people: there is no transport security (G-4-05).
G-4-10 — a lost device is a lost pseudonym — is the one that needs design
rather than implementation, because every obvious recovery mechanism risks
becoming the join the architecture exists to prevent.
