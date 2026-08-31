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

## Not yet built

- Surfaces 2 and 4. Bharat and Works are still the planned-page stubs.
- Real ID verification. `core/identity.ts` hashes locally; in production the raw
  identifier should never reach the client at all — the service returns a digest
  and an attestation.
- Full translations. Hindi, Bengali, Tamil and Marathi cover the key surfaces;
  anything missing falls through to English rather than showing a raw key.
- Push notification delivery. The preferences and filtering logic exist and are
  applied to the in-app inbox; there is no push transport behind them.
