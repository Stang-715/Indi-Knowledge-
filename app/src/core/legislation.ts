/**
 * Surface 3 — the legislative domain.
 *
 * Two rules shape every type here, and both come from the same worry: this
 * surface reports on things that are true in the world, and being confidently
 * wrong about them is worse than saying nothing.
 *
 * 1. **Provenance travels with the record.** Bill text and status come from
 *    sources that change format without notice. A parser that half-succeeds
 *    must not render a bill as though it read it properly, so every record
 *    carries how it was obtained and when, and the UI has a path that shows the
 *    source link instead of the content.
 *
 * 2. **Nothing here is derived from where a device is.** A constituency is
 *    found by asking, or from the locality the citizen already stated. There is
 *    no lookup that takes a position, because there is no position to take.
 */

/* -------------------------------- provenance ------------------------------ */

export type Provenance =
  /** Read from the official source and understood in full. */
  | 'official'
  /** Read, but part of it could not be parsed — show what is certain, link the rest. */
  | 'partial'
  /** The source could not be read at all. Show the link and nothing else. */
  | 'unreadable'
  /** Written for this build. Never presented as though it came from anywhere. */
  | 'sample'

export interface Sourced {
  provenance: Provenance
  /** Where this came from, or would have come from. Always present. */
  sourceUrl: string
  sourceName: string
  /** When the source was last read. The lag is shown, not hidden. */
  fetchedAt: number
}

/** True when the record can be shown as content rather than as a link. */
export function readable(s: Sourced): boolean {
  return s.provenance !== 'unreadable'
}

/** True when only part of it can be trusted, and the rest must point at the source. */
export function incomplete(s: Sourced): boolean {
  return s.provenance === 'partial' || s.provenance === 'unreadable'
}

const DAY = 24 * 60 * 60 * 1000

/**
 * How old this is, in days. Every figure on this surface carries its lag,
 * because a status that was true three weeks ago is a different claim from a
 * status that is true now.
 */
export function lagDays(s: Sourced, now = Date.now()): number {
  return Math.max(0, Math.floor((now - s.fetchedAt) / DAY))
}

/* ------------------------------- the pipeline ----------------------------- */

/**
 * The stages an Indian bill passes through. Deliberately the real sequence
 * rather than a generic workflow: a citizen who has followed one bill should
 * recognise the shape of the next.
 */
export type Stage =
  | 'introduced'
  | 'committee'
  | 'lower-passed'
  | 'upper-passed'
  | 'assented'
  | 'lapsed'
  | 'withdrawn'

export const STAGES: Stage[] = [
  'introduced', 'committee', 'lower-passed', 'upper-passed', 'assented',
]

/** Stages a bill can end on without reaching assent. */
export const ENDED: Stage[] = ['lapsed', 'withdrawn']

export interface StageEvent {
  stage: Stage
  at: number
  /** What actually happened, in the words a citizen would use. */
  note?: string
}

export type House = 'lok-sabha' | 'rajya-sabha' | 'both'

export interface Clause {
  id: string
  /** The clause number as printed in the bill. */
  number: string
  heading: string
  /** The clause as drafted. */
  text: string
  /** What it does, in plain words. Absent when nobody has written one yet. */
  plain?: string
  /** Marked where the public argument is actually happening. */
  disputed?: boolean
  /** Which existing law this changes, when it changes one. */
  amends?: string
}

export interface Bill extends Sourced {
  id: string
  /** The short title as introduced. */
  title: string
  /** Bill number and year, as cited. */
  citation: string
  house: House
  ministry: string
  introducedAt: number
  stage: Stage
  history: StageEvent[]
  /** One paragraph, written by a person, in plain words. */
  plainSummary?: string
  clauses: Clause[]
  /** The advisory poll attached to this bill, when one is open. */
  pollId?: string
  /** The debate thread attached to this bill. */
  topicId?: string
}

export function currentStage(bill: Bill): Stage {
  return bill.stage
}

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage)
}

export function hasEnded(bill: Bill): boolean {
  return ENDED.includes(bill.stage)
}

/** Clauses where the public argument is, so a reader can go straight to it. */
export function disputedClauses(bill: Bill): Clause[] {
  return bill.clauses.filter((c) => c.disputed)
}

/* ------------------------------ the Constitution -------------------------- */

export interface Article {
  number: string
  heading: string
  /** A summary in plain words, not the text of the Article. */
  gist: string
  partRoman: string
}

export interface Part {
  roman: string
  title: string
  subject: string
  articleRange: string
}

export interface ScheduleEntry {
  number: number
  title: string
  subject: string
}

export interface Amendment {
  number: number
  year: number
  shortTitle: string
  effect: string
}

export interface ConstitutionData extends Sourced {
  parts: Part[]
  articles: Article[]
  schedules: ScheduleEntry[]
  amendments: Amendment[]
  /** Counts as at `asOf`, stated rather than computed from a partial list. */
  counts: { articles: string; parts: number; schedules: number; amendments: number }
  asOf: string
}

/* ------------------------------- constituency ----------------------------- */

/**
 * A constituency, found by asking.
 *
 * There is no `findByPosition`, no coordinates on this type and no code path
 * that takes any. The citizen either searches for their constituency or it
 * follows from the locality they stated in settings — which is a field they
 * typed, not a reading anyone took.
 */
export interface Constituency {
  id: string
  name: string
  state: string
  house: 'lok-sabha' | 'assembly'
  /** Districts wholly or partly inside it, for matching a stated locality. */
  districts: string[]
}

export interface Representative extends Sourced {
  id: string
  name: string
  party: string
  constituencyId: string
  since: number
}

/** How a representative voted on a bill, where a division was recorded. */
export interface VoteRecord extends Sourced {
  billId: string
  representativeId: string
  /**
   * Most business in both Houses passes on a voice vote with no division, so
   * "not recorded" is the common case and must be shown as itself rather than
   * as an absence or an abstention.
   */
  position: 'for' | 'against' | 'abstained' | 'absent' | 'not-recorded'
  divisionNumber?: string
}

/** Matches a stated locality to constituencies. String matching, nothing more. */
export function constituenciesForDistrict(
  all: Constituency[], district: string,
): Constituency[] {
  const needle = district.trim().toLowerCase()
  if (!needle) return []
  return all.filter((c) => c.districts.some((d) => d.toLowerCase() === needle))
}

export function searchConstituencies(all: Constituency[], query: string): Constituency[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return all.filter((c) =>
    c.name.toLowerCase().includes(q)
    || c.state.toLowerCase().includes(q)
    || c.districts.some((d) => d.toLowerCase().includes(q)),
  )
}
