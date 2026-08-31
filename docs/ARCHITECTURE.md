# Spec → code map

Every numbered screen in the specification, and the file that implements it.
Paths are relative to `app/src/`.

## Citizen app

| Spec | Screen | Implementation |
|---|---|---|
| 1.1 | Welcome / splash | `citizen/Onboarding.tsx` → `Welcome` |
| 1.2 | Language selection | `citizen/Onboarding.tsx` → `Language` (applies app-wide immediately) |
| 1.3 | Identity verification | `citizen/Onboarding.tsx` → `Verify`; hashing in `core/identity.ts` |
| 1.4 | Locality selection | `citizen/Onboarding.tsx` → `LocalityStep`, incl. "I move for work" |
| 1.5 | Pseudonym creation | `citizen/Onboarding.tsx` → `PseudonymStep` |
| 1.6 | Data & privacy disclosure | `citizen/Onboarding.tsx` → `Privacy`, rendered from `core/principles.ts` |
| 1.7 | Accessibility setup | `citizen/Onboarding.tsx` → `A11yControls` (shared with 6.x) |
| 2.1 | Feed with three tabs | `citizen/Home.tsx`, beneath the character |
| 2.2 | Notification inbox | `citizen/InboxSearch.tsx` → `Inbox` |
| 2.3 | Search | `citizen/InboxSearch.tsx` → `Search`; `data/repo.ts` → `search` |
| 3.1 | Notice list + locality filter | `citizen/Notices.tsx` → `NoticeList` |
| 3.2 | Notice detail | `citizen/Notices.tsx` → `NoticeDetail` |
| 3.3 | Report fake notice | `citizen/Notices.tsx` → `ReportFlow` |
| 3.4 | Notice archive | `NoticeList archive` |
| 4.1 | Active polls | `citizen/Polls.tsx` → `PollList` |
| 4.2 | Poll detail | `citizen/Polls.tsx` → `PollDetail` |
| 4.3 | Vote confirmation | `PollDetail` confirmation modal; `repo.castVote` overwrites, never appends |
| 4.4 | Results, post-vote only | `citizen/Polls.tsx` → `Results` |
| 4.5 | Past poll archive | `PollList archive` |
| 5.1 | Topic list | `citizen/Discussion.tsx` → `TopicList` |
| 5.2 | Thread view | `citizen/Discussion.tsx` → `ThreadView` |
| 5.3 | Compose opinion | `citizen/Discussion.tsx` → `Compose`; limits in `core/ratelimit.ts` |
| 5.4 | Report post | shared `ReportFlow` |
| 5.5 | Sort / filter | `core/ranking.ts`; balanced is the default |
| 6.1 | Verification status | `citizen/Profile.tsx` → `ProfileIndex` |
| 6.2 | Pseudonym management | `PseudonymSettings`, 30-day cooldown |
| 6.3 | Notification preferences | `NotificationSettings`, priority threshold |
| 6.4 | Locality update | `LocalitySettings` |
| 6.5 | Data & privacy centre | `PrivacyCentre`; reads the real store via `inspectStoredData` |
| 6.6 | Help / how this works | `Help` |
| 6.7 | Logout | `ProfileIndex` |

## Government portal

| Spec | Screen | Implementation |
|---|---|---|
| 7.0 | Institutional MFA login, roles | `gov/GovPortal.tsx`; role gating in `App.tsx` → `RequireRole` |
| 8.1–8.3 | Compose, preview, publish/schedule | `gov/Compose.tsx` → `NoticeComposer` |
| 8.4 | Edit / retract | `gov/Compose.tsx` → `RetractPanel` (retract only; there is no delete) |
| 9.1–9.5 | Bill summary, legal text, ≤4 options, duration, publish | `gov/Compose.tsx` → `PollComposer` |
| 10.1 | Poll results, aggregate | `gov/Dashboards.tsx` → `PollResults` |
| 10.2 | Discussion sentiment | `gov/Dashboards.tsx` → `SentimentPanel` |
| 10.3 | Notice reach | `gov/Dashboards.tsx` → `ReachPanel` |
| 10.4 | Export report | `gov/Dashboards.tsx` → `ExportPanel` (CSV; coverage in every row) |
| 11.1 | Reported posts queue | `gov/Moderation.tsx` → `PostQueue` |
| 11.2 | Fake notice queue | `gov/Moderation.tsx` → `NoticeQueue` |
| 11.3 | Anti-brigading flags | `gov/Moderation.tsx` → `FlagQueue` (human review, never automatic) |

## Oversight layer

| Spec | Screen | Implementation |
|---|---|---|
| 12.1 | Transparency report | `oversight/Oversight.tsx` → `TransparencyReport` |
| 12.2 | Audit log viewer | `oversight/Oversight.tsx` → `AuditLog` |

## Edge case → mitigation

| Edge case | Where it is handled |
|---|---|
| Poll looks like "everyone" but isn't | Coverage figure on every result, citizen and government side alike; flagged as advisory below 5% |
| Migrant workers in ID-mismatch limbo | "I move for work" multi-locality; no concept of one true address |
| Shared household device | Verification tied to the hashed ID, not the device; logout prompt on the profile screen |
| Coordinated brigading | Post rate limit, one reaction per account, length cap, pseudonym cooldown, pattern flags to a human |
| Government astroturfing | Oversight layer it cannot write to; gov actions append to the audit trail and cannot read it back |
| Leading question framing | Plain summary required (min. length) plus mandatory link to full text; the compose hint says why |
| Subpoena to unmask | No join exists to serve; transparency report publishes requests received vs. fulfilled |
| Writing-style de-anonymisation | Out of scope for the UI — Sarathi warns the citizen about it directly rather than letting a pseudonym read as armour |
| Spoofed notices | Institutional MFA, verified-source badge with an explainer, report flow into 11.2 |
| Notification fatigue | Priority threshold, quiet hours, per-category toggles; time-critical is the only tier that overrides |
| Load when a bill goes viral | Infrastructure, not a screen. Client side: static shell, service-worker caching, no per-view server round trip |
| Low-end phones | Low-bandwidth mode strips images and attachments; the character is SVG so he survives it; the shell is cached for offline |
| Next administration re-adds tracking | Constraints as code plus `scripts/check-constraints.mjs`; documented as needing statutory backing to matter long-term |

## Judgement calls

**Sarathi is rule-matched, not generative.** A model call could answer more
questions, but every sentence he says about privacy is a promise the code has to
keep. Improvised reassurance is a liability. He also has to work offline on a
cheap phone, and he must not be steerable by anything a user types.

**Onboarding cannot be skipped.** A pseudonym is required before anything can be
said, because the alternative is a citizen posting before understanding which of
their two identities is speaking.

**Notice publishing is one approval — the author's.** A sign-off queue between a
municipal engineer and a burst water main is a queue that hurts people. The
accountability is placed after the fact instead, in retraction being public and
permanent.

**Poll results are hidden pre-vote, and past polls are not.** The bandwagon
effect only applies while a poll can still be influenced.

**Small-cell suppression applies to breakdowns, not the headline total.**
Suppressing the total would hide the result; suppressing a four-person ward slice
protects those four people.

**Deleting an account leaves past aggregate counts intact.** They contain nothing
traceable to the person any more, so there is nothing left to remove — and
recomputing history would make published figures disagree with themselves.

## Not built, deliberately

- Legally binding e-voting. That needs a certified roll, a coercion-resistant
  secret ballot and Election Commission-grade auditability. An app cannot fake it.
- Any location or movement collection, under any framing.
- Any real-identity-to-pseudonym mapping, for any role.
- Any amplification of any account, the platform owner's included.

## Deferred work

`GAP-REGISTER.md` records what each phase promised and did not deliver, written
at the moment it was deferred so it can be picked up cold. It is the punch list
to run after the numbered phases and before any release.

A phase is not called complete until anything it left behind is recorded there.
Two entries carry a correction to a completion claim already made — Phase 2 was
reported as meeting exit criteria it had only partly met.

## Surface 3 — Bills

`core/legislation.ts` holds the domain, and two rules shape every type in it.

**Provenance travels with the record.** Bill text and status come from sources
that change format without notice, and a parser that half-succeeds must not
render a bill as though it read it properly. Every record carries how it was
obtained and when, and there is a designed path — `surfaces/bills/Sourced.tsx` —
that shows the link to the original instead of the content. `bill_transport` in
the sample data is unreadable and `bill_records` partly readable, so that path is
walked in ordinary use rather than only in a test.

**Nothing is derived from where a device is.** The constituency finder is the
one screen in the app where a coordinate would be the obvious answer, and it is
the screen the location constraint exists for. It takes a search term or the
district the citizen stated in settings, and `constituenciesForDistrict` is a
string comparison. There is no lookup that accepts a position because there is
no position to accept.

The sample data is invented and says so on screen. Constituency names are real
and stable; the people holding them are fictional, because a fabricated voting
record attached to a real name is a defamation with a search index. `not-recorded`
is a first-class position rather than a gap: most business in both Houses passes
on a voice vote with no division, and rendering that silence as an absence would
libel half of Parliament by rounding error.

## Surface 4 — Works, citizen half

`core/works.ts` holds the domain. Three rules shape it.

**A work has a location. A citizen does not.** Every coordinate in the data
belongs to a hole in a road — public infrastructure geometry, published by the
authority. None belongs to a person. "My road" is a street the citizen typed,
stored on the device, and matched by loose string comparison, because somebody
who writes "MG Rd" is telling you where they live and should not get an empty
screen because a gazetteer spells it differently.

**The map is drawn, not fetched.** This is the constraint that is easiest to
miss and the one that matters most on this surface. A tile request carries the
viewer's IP and the exact rectangle they are looking at to whoever serves the
tiles; repeat it on every open and a third party holds a movement pattern
assembled without the app ever calling a location API. "We never asked for your
location" would be true and would not matter. So `WorksMap.tsx` renders an SVG
from the stored polylines — it weighs nothing, works with no signal, and sends
nobody anything. The constraint check fails the build if a tile source or a map
SDK that fetches them appears anywhere in the tree.

**The overrun record is a duty, not an accusation.** Most states have a Right to
Service Act setting statutory timelines for notified services, with a designated
officer and an appeal when a deadline is missed. 4.6 is that record. Nothing in
it waits for a department to admit anything — `stateOf` derives overrun from the
committed date and the clock, so a work goes late the day it goes late. Every
change to a committed date is kept with its reason, because a department that
can quietly move its own deadline has no deadline. Departments are counted only
on works whose date has passed: a body is not late for a job that is not due,
and counting one would make the record disputable, which is the fastest way to
make it ignored.

## Institutional identity — Surface 4, departmental half

The hard question of Phase 7, split into the part software answers and the part
it cannot.

**What software answers.** "The Water Board filed this" is a claim anybody can
check rather than one the server asserts. A department holds a signing key on
its own device (`core/deptkey.ts`). The registry root signs an entry binding
that key to a named body. A permit is signed over the same root. The app pins
the root's public key, so the chain — pinned root, signed register entry, signed
permit — is checked on the phone of whoever is standing next to the barrier,
and this server cannot forge a link in it. `core/institution.ts` does that
verification; it deliberately does not trust the server it is talking to.

**What it cannot.** Who holds the root, and which real bodies get enrolled under
it. Whoever holds that key decides who counts as government — the exact power
the rest of this architecture refuses to take, and here it cannot be refused,
only placed somewhere accountable. Today it sits with the platform and the
enrolment gate is automatic: any body that asks is entered. Both facts are
recorded on every entry (`enrolled_by`) and shown on the citizen's permit check
beside the green tick, because a tick over an ungated register is the most
dangerous thing this surface could display.

**A department key and a voice key never meet.** An engineer at the water board
is also a citizen — posting under a pseudonym in the evening, filing works in
the morning. The two keys live in separate IndexedDB databases and the
constraint check fails the build if one module reaches both, because linking
those halves of a person would be the app doing it rather than an attacker.

**The clash check runs at filing, not at approval.** A department that learns
about a clash a week later has already ordered the barriers. Approval is refused
while a clash stands, so resolving one means a window actually moves.

The fourth database file, `server/src/db-works.ts`, is the only public store —
roadworks and permits are public records and there is no citizen in it at all.
It is still a separate file, so "the works table has a citizen column now" is a
change that cannot be made rather than one that is discouraged.

## Surface 2 — Bharat, and the figure that cannot ship bare

The exit criterion is one sentence: every number can name its source and its
age, and no figure ships without both. That is easy to write and hard to keep —
the pressure is always one more tile, the source added later, later never
arriving. The failure is not an error; it is a screen that looks authoritative
over data four months old, which is worse than an empty screen because somebody
acts on it.

So the criterion is a type. `core/figures.ts` exports a branded `Figure` that no
object literal satisfies: the only way to obtain one is `figure()`, and that
will not compile without a source, a URL and the period the number describes.
`surfaces/bharat/Figure.tsx` is the one component that prints one, and the
constraint check fails the build if any other file on the surface calls a
number-formatting API. Derived numbers inherit the oldest period and the weakest
provenance of their inputs, so a change computed from an official figure and a
sample one is not presented as official.

**A store listing carries no pseudonym, and cannot.** A shop has a name, a
stated address and opening hours; the person who listed it has a pseudonym they
post and vote under. Joining those would make every pseudonymous opinion its
owner ever expressed attributable to a named business at a known address — a
deanonymisation the platform would have performed on itself, in exchange for an
edit button. So the listing device mints a secret and sends only its digest:
a capability that proves you can edit this listing and says nothing about who
you are. Losing it means losing the edit, which is the price of having no
account; a recovery flow would be an identity by another name. The server
refuses outright any listing that arrives carrying a pseudonym.

Listings publish immediately and are marked unverified, with a report route
beside them. A queue nobody staffs is a directory with nothing in it — but the
report route is the other half of that bargain and needs a person behind it from
the day the directory opens.

## Oversight — what append-only actually buys

The audit trail was append-only from Phase 0: no update or delete exported, a
SQLite trigger that raises even from a direct shell, and a constraint check that
fails the build if a mutation appears. All three stop *this server* editing its
own history. None of them stops the whole database being replaced with a tidier
one, and from outside a rewritten trail and an honest one look identical.

So every entry now carries the digest of the one before it. Altering or removing
anything breaks the chain, and `core/auditchain.ts` recomputes it **in the
reader's browser** — an oversight layer whose verification is performed by the
party being overseen is not oversight. If the page and the server ever disagree,
the page did the arithmetic.

The number that matters is the head. Kept somewhere the platform does not
control and compared later, it turns a rewritten history from something nobody
could notice into something anybody can prove. Which is why the head is
published on a schedule, why reports are materialised by the calendar for every
completed month rather than when somebody asks, and why an enrolled observer can
countersign a head with a key we do not hold.

The request register counts what is asked of the platform, including the demand
most transparency reports omit: how many times an authority has asked us to
identify somebody. Fulfilled is structurally zero — not a refusal each time, but
an operation nobody has. A closed request cannot be reopened; a trigger says so,
because counts that can be revised after publication are a draft.

**The limit, stated rather than glossed.** All of this is worth exactly as much
as somebody outside bothering to keep the heads. Software can publish, chain and
accept a signature. It cannot make an independent body exist, and enrolment as
an observer is currently ungated in the same way department enrolment is. A
layer that implied otherwise would be the precise failure it exists to prevent.

## Field conditions

The app is for people on 2G connections and four-year-old handsets, and until
this phase nothing measured whether it worked for them.

**Route splitting.** The whole app was one 606 kB chunk — around eight seconds
of blank screen on a 2G connection, most of it code the person opening Sarathi
would never run. Every route is fetched when first opened, which halved the
entry to 72 kB gzipped. `scripts/check-bundle.mjs` budgets what crosses the wire
and says the first load in seconds at 35 kB/s, because kilobytes are not what
anybody experiences.

**A harness that can fail.** `scripts/check-field.mjs` runs Chromium with the
network throttled to 2G and the CPU divided by six. Its first version seeded the
session by navigating once before enabling the throttling, which warmed the HTTP
cache — every route "passed" 2G in a second, and the harness could not fail. The
session is seeded by an init script now and the cache is disabled. Real numbers:
about seven seconds to paint, eight to readable.

**The low-power tier.** `core/capability.ts` asks the device about itself —
small memory, few cores, a thin connection, data-saver on — and drops the two
expensive things: the mesh paints once instead of animating, and the glass
becomes a flat panel. The layout, type, colour and every word are unchanged.
The signals are read and never sent; `deviceMemory` and `hardwareConcurrency`
are fingerprinting surface, used here for one local rendering decision.

The mesh read `data-power` once at mount, which was before the session provider
had set it — so the device that most needed the animation stopped was the one
still running it. It observes the attribute now. The field check asserts the
cut actually happens: two animation frames in two and a half seconds against a
hundred and eighty, and no panel still compositing a blur.

The caricature keeps its ambient motion. A few animated transforms on one SVG is
not what makes a budget handset stutter, and the front door of the app going
dead is a real cost against a small saving.

**Assisted use.** A great many people in India use a smartphone with somebody
beside them, and that is a normal way to use a phone rather than an exception to
handle afterwards. Assisted mode enlarges targets, spaces decisions out and
turns on read-aloud. It deliberately does not make anything easier to do on
somebody's behalf, and it could not: a pseudonym is signed by a key bound to the
device that claimed it, so a helper's phone has no way to write as the person it
is helping. The mode says so on screen and a strip stays visible while it is on,
addressed to the person being helped rather than the helper.

## Not yet built

- Surfaces 2 and 4. Bharat and Works are still the planned-page stubs.
- Real ID verification. `core/identity.ts` hashes locally; in production the raw
  identifier should never reach the client at all — the service returns a digest
  and an attestation.
- Full translations. Hindi, Bengali, Tamil and Marathi cover the key surfaces;
  anything missing falls through to English rather than showing a raw key.
- Push notification delivery. The preferences and filtering logic exist and are
  applied to the in-app inbox; there is no push transport behind them.
