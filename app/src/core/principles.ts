/**
 * Section 0 of the spec, as data.
 *
 * These are rendered in the Privacy Disclosure (1.6), the Privacy Centre (6.5)
 * and the Transparency Report (12.1) from this single source, so the three can
 * never disagree with each other. `configurable: false` is a statement about
 * the build, not a switch — nothing reads these to decide behaviour, the
 * behaviour is in the code and these describe it.
 */

export interface Principle {
  id: number
  title: string
  statement: string
  /** Where in the codebase the constraint actually lives. */
  enforcedIn: string[]
  configurable: false
}

export const PRINCIPLES: Principle[] = [
  {
    id: 1,
    title: 'No location or movement tracking',
    statement:
      'Your locality is something you type, like a postal address. The app never reads device location, and there is no code path that can — the geolocation API is not called anywhere in this build.',
    enforcedIn: ['core/prefs.ts', 'citizen/LocalityScreen.tsx'],
    configurable: false,
  },
  {
    id: 2,
    title: 'Two identity layers that cannot be joined',
    statement:
      'Your verified identity proves once that you are a citizen. Your pseudonym is what speaks and votes. They live in separate stores, and no function in this system maps one to the other — not for government, not for moderators, not for us.',
    enforcedIn: ['core/identity.ts', 'core/storage.ts'],
    configurable: false,
  },
  {
    id: 3,
    title: 'Advisory polling is not a legal vote',
    statement:
      'Polls here measure public sentiment and pass it to policymakers. They do not elect anyone and do not replace the Election Commission or the EVM system. Every poll screen says so, and the notice cannot be dismissed.',
    enforcedIn: ['components/AdvisoryBanner.tsx', 'gov/CreatePoll.tsx'],
    configurable: false,
  },
  {
    id: 4,
    title: 'Identity is stripped before data reaches government',
    statement:
      'Government dashboards are built from counts. There is no drill-down to an individual response, because the data that reaches those screens has already had identity removed and small groups suppressed.',
    enforcedIn: ['core/aggregate.ts', 'gov/Dashboards.tsx'],
    configurable: false,
  },
  {
    id: 5,
    title: 'No voice gets structural amplification',
    statement:
      'Discussions sort by diversity of viewpoint by default, not by popularity. No account — including whoever runs this platform — can be boosted, pinned or weighted.',
    enforcedIn: ['core/ranking.ts', 'citizen/ThreadView.tsx'],
    configurable: false,
  },
  {
    id: 6,
    title: 'Built to survive a change of government',
    statement:
      'Each protection above is a property of how the software is built, not a setting an administrator can turn off. A future administration that wants tracking would have to rewrite the system in public, not flip a switch in private.',
    enforcedIn: ['the absence of the settings that would allow otherwise'],
    configurable: false,
  },
]

/** Items 8.0 of the spec — rendered verbatim in the disclosure screens. */
export const OUT_OF_SCOPE: string[] = [
  'Legally binding e-voting — that needs Election Commission-grade infrastructure: voter rolls, a coercion-resistant secret ballot and formal auditability.',
  'Any location or movement data collection, under any framing.',
  'Real-identity-to-pseudonym mapping visible to any government account.',
  'Algorithmic amplification of any single account, including the platform owner’s.',
]

/** The literal list shown in 1.6 and echoed by the Privacy Centre. */
export const NOT_COLLECTED: string[] = [
  'GPS or any device location, once or continuously',
  'Your movements, or which localities you open notices from',
  'Your contacts, photos, microphone or other apps',
  'Your real name attached to anything you post or vote on',
  'A record linking your pseudonym back to your ID — nobody holds one',
  'Per-person read receipts shown to any government account',
]

/*
 * What is collected is no longer listed here.
 *
 * core/consent.ts owns it, because that is where each field is tied to the
 * purpose it was consented to and to the decision the citizen made. Two lists
 * of "what we store" is exactly the drift the privacy screen exists to catch,
 * and the DPDP notice has to match what is actually held — so there is one
 * list, and the notice and the privacy screen both read it.
 */
