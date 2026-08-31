/**
 * Where a record came from, and how much of it can be trusted.
 *
 * Shared by every surface that reports on things that are true in the world —
 * bills, roadworks, whatever comes next — because being confidently wrong about
 * one of those is worse than saying nothing. Sources change format without
 * notice, and a parser that half-succeeds must never render as though it read
 * the whole thing. So provenance travels with the record and reaches the
 * screen, rather than living in a comment nobody reads.
 */

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
