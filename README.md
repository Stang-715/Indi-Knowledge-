# Civic Dialogue

A civic platform in three parts: a citizen app, a government portal, and an
independent oversight layer. Government notices reach people in their own
language, bills arrive in plain words with the legal text one tap away, and
advisory polls pass public sentiment upward — under a pseudonym that this
system cannot trace back to anybody.

One codebase serves the web app and the installable mobile app (PWA).

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # constraint check → typecheck → production build
npm test           # constraint check, typecheck, lint
```

## The home page is a person

The citizen app opens on **Sarathi** — a hand-drawn SVG caricature who blinks,
follows your finger, changes expression, moves his mouth while he speaks, and
answers questions about the platform in your own words. Ask him whether this is
real voting, whether anyone can unmask you, what the government sees, or what
happens when the next administration arrives, and he will tell you — including
the parts that are not reassuring.

He is deliberately **not** a language model call. He is a few hundred lines of
matched rules that run offline on a cheap phone, cannot be prompt-injected, and
say only sentences a human wrote and can be held to. Every claim he makes about
privacy is a claim the code has to keep, so improvising them was never an option.

Optionally he speaks aloud, using the device's own voice — off by default,
because a phone that starts talking unprompted is not safe in every household.

## What makes this different from a settings page

Section 0 of the specification asks for the privacy properties to be
**architectural constraints, not configurable settings**, on the explicit
assumption that whoever runs this next may not share the current values. A
setting can be flipped in private. An absence has to be re-added in public.

So the protections are absences, and `npm run check:constraints` fails the build
if any of them comes back:

| Constraint | How it is kept | What the check catches |
|---|---|---|
| No location tracking | No device-location API is called anywhere | Any use of `navigator.geolocation`, `getCurrentPosition`, `watchPosition` |
| Two unjoinable identity layers | Separate stores; no function maps one to the other | Any module outside `core/identity.ts` touching both a real-ID field and a pseudonym |
| Advisory ≠ binding | `AdvisoryBanner` has no dismiss path | A close, hide or dismiss prop appearing on it |
| Identity stripped before government | Gov reads only aggregates, with small cells suppressed | An exported mutation on the audit trail |
| No structural amplification | The ranking function has no author term | `boost`, `weight`, `promote`, `pinned` in `core/ranking.ts` |
| Survives a change of government | All of the above are code, not config | — the five checks above are the mechanism |

The storage layer enforces the second one at runtime too: a write carrying both
a real-identity field and a pseudonym throws `IdentityJoinError` rather than
being saved.

## Layout

```
app/src/
  core/          principles, the two identity layers, storage, aggregation,
                 ranking, rate limits, append-only audit
  caricature/    Sarathi — SVG character, knowledge base, speech, conversation
  citizen/       onboarding, home, notices, polls, discussion, profile
  gov/           institutional login, compose, dashboards, moderation
  oversight/     transparency report, audit log
  i18n/          English, Hindi, Bengali, Tamil, Marathi
  data/          seed content and the repository layer (the future API surface)
scripts/         the architectural constraint check
docs/            spec-to-code map, and what is deliberately unbuilt
```

`docs/ARCHITECTURE.md` maps every numbered screen in the specification to the
file that implements it, and records the judgement calls.

## Status

Every screen in the specification is built and working. The data layer is a
local mock behind the shape a real API would take — `data/repo.ts` is written so
that swapping its bodies for HTTP calls requires no change in any caller. There
is no server, no account system and no real ID verification behind this yet;
what exists is the whole client, the whole information architecture, and the
constraints made enforceable.
