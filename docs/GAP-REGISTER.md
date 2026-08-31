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

### G-2E-01 · Contrast is not measured anywhere — highest priority in this file
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

### G-2E-04 · `check-layout.mjs` is not in any automated run
**Severity:** minor
It needs a served build, so it was deliberately kept out of `npm test` to keep
that fast and offline. Nothing else runs it, so in practice it runs only when
someone remembers.
**Do:** add a `npm run check:release` that builds, serves, runs the layout and
contrast checks, and tears down.
**Verify:** one command runs every check, and CI runs that command.

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
