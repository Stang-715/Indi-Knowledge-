/**
 * Surface 4 — the works domain, citizen half.
 *
 * The spec's one-line version of this surface is "nobody digs before they book
 * it here". That is the departmental half, and it is blocked on institutional
 * identity. This half is the part that works with zero departments signed up:
 * everything here can be built from what authorities already publish, and it has
 * to be useful before it asks anybody to join.
 *
 * Three rules shape the types.
 *
 * 1. **A work has a location. A citizen does not.** Every coordinate in this
 *    file belongs to a hole in a road, which is public infrastructure data. None
 *    of them belongs to a person. "My road" is a street a citizen typed, and the
 *    matching is string comparison — the same answer Surface 3 gives for a
 *    constituency, for the same reason.
 *
 * 2. **The end date is the fact.** A work that says what it is and not when it
 *    ends is a sign on a barrier. The date a department committed to is the
 *    thing a citizen cannot find anywhere else, so it is the thing this surface
 *    is built around, and it is the largest text on any card.
 *
 * 3. **The overrun record is a duty, not an accusation.** Most states have a
 *    Right to Service Act creating statutory timelines with designated officers
 *    and an appeal route. Promised-against-actual is the record those Acts
 *    already oblige; publishing it is holding up a mirror, not keeping score.
 *    The framing matters because a surface that reads as adversarial never gets
 *    the second half built.
 */

import type { Sourced } from './provenance'

export type { Provenance, Sourced } from './provenance'
export { incomplete, lagDays, readable } from './provenance'

/* --------------------------------- geometry -------------------------------- */

/**
 * A point on the schematic map.
 *
 * Deliberately not latitude and longitude in a tile-server's projection. Chowk
 * draws its own map from published geometry rather than fetching tiles, because
 * a tile request carries the viewer's IP and the exact rectangle they are
 * looking at — which is a location reading taken from the person, by a third
 * party, and the fact that we did not call `getCurrentPosition` would not make
 * it anything else. Coordinates here are in a local metre grid per city.
 */
export interface Point { x: number; y: number }

/** A named stretch of road, as a polyline. Public geometry, published by the authority. */
export interface Stretch {
  id: string
  /** The street as people say it, not as a gazetteer spells it. */
  street: string
  locality: string
  district: string
  path: Point[]
}

/* ------------------------------- departments ------------------------------- */

export type Utility = 'water' | 'power' | 'telecom' | 'gas' | 'road' | 'drainage'

export interface Department extends Sourced {
  id: string
  name: string
  utility: Utility
  /** The officer a Right to Service appeal is addressed to, where one is named. */
  appealOfficer?: string
}

/* ---------------------------------- works ---------------------------------- */

export type WorkState =
  /** Booked, not started. */
  | 'planned'
  /** Under way within its window. */
  | 'open'
  /** Past its committed restoration date and still open. */
  | 'overrun'
  /** Restoration certified complete. */
  | 'restored'
  /** Booked and then called off. */
  | 'cancelled'

export interface Work extends Sourced {
  id: string
  stretchId: string
  departmentId: string
  utility: Utility
  /** Why the road is open. In the words a resident would use, not a work code. */
  reason: string
  /** When digging was due to start, and the date restoration was committed to. */
  startsAt: number
  /** The commitment. Never silently revised — a change is a new entry in `revisions`. */
  restoreBy: number
  /** When restoration was actually certified, if it has been. */
  restoredAt?: number
  /**
   * Every time the committed date moved, and why.
   *
   * Kept because a department that can quietly rewrite its own deadline has no
   * deadline. The original commitment is the first entry and cannot be edited.
   */
  revisions: { to: number; at: number; reason: string }[]
  /** Issued by 4.4 in the departmental half. Absent for works published without one. */
  permitNumber?: string
  state: WorkState
  /** Whether the road is closed to traffic, or dug but passable. */
  closure: 'full' | 'partial' | 'none'
}

const DAY = 24 * 60 * 60 * 1000

/**
 * What state a work is actually in, computed rather than trusted.
 *
 * A stored state can be stale — a work marked open stays marked open the day
 * after its restoration date unless somebody updates it, and that day is
 * exactly when the citizen most needs to be told. So overrun is derived from
 * the committed date and the clock, and no department has to admit anything for
 * it to appear.
 */
export function stateOf(work: Work, now = Date.now()): WorkState {
  if (work.state === 'cancelled') return 'cancelled'
  if (work.restoredAt) return 'restored'
  if (now > work.restoreBy) return 'overrun'
  if (now >= work.startsAt) return 'open'
  return 'planned'
}

/** Days past the committed date. Zero when it is not late. */
export function overrunDays(work: Work, now = Date.now()): number {
  const end = work.restoredAt ?? now
  return Math.max(0, Math.floor((end - work.restoreBy) / DAY))
}

/** Days until the road is due to be back. Negative once that date has passed. */
export function daysRemaining(work: Work, now = Date.now()): number {
  return Math.ceil((work.restoreBy - now) / DAY)
}

/** The commitment as first made, which is the one a department is held to. */
export function originalCommitment(work: Work): number {
  return work.revisions.length > 0 ? work.revisions[0].to : work.restoreBy
}

export function isLive(work: Work, now = Date.now()): boolean {
  const state = stateOf(work, now)
  return state === 'open' || state === 'overrun' || state === 'planned'
}

/* ------------------------------ the record --------------------------------- */

export interface DepartmentRecord {
  department: Department
  /** Works with a committed date that has passed, restored or not. */
  finished: number
  onTime: number
  late: number
  /** Median days late across the late ones. A mean is dragged by one bad job. */
  medianLateDays: number
  /** Longest single overrun, because a median hides the one that ruined a street. */
  worstLateDays: number
  /** Times a committed date was moved rather than met. */
  revisions: number
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * 4.6 — promised against actual, per department.
 *
 * Only works whose committed date has passed are counted. A department is not
 * late for a job that is not due yet, and counting one would make the record
 * something a department could dispute — which is the fastest way to make it
 * ignored.
 *
 * Works still open past their date count as late, using today as the end. A
 * record that waited for restoration before admitting an overrun would show a
 * department its best figures on the day it was worst.
 */
export function departmentRecord(
  department: Department, works: Work[], now = Date.now(),
): DepartmentRecord {
  const due = works.filter(
    (w) => w.departmentId === department.id
      && w.state !== 'cancelled'
      && (w.restoredAt !== undefined || now > w.restoreBy),
  )

  const lateDays = due
    .map((w) => overrunDays(w, now))
    .filter((d) => d > 0)

  return {
    department,
    finished: due.length,
    onTime: due.length - lateDays.length,
    late: lateDays.length,
    medianLateDays: median(lateDays),
    worstLateDays: lateDays.length > 0 ? Math.max(...lateDays) : 0,
    revisions: due.reduce((n, w) => n + w.revisions.length, 0),
  }
}

/* ------------------------------ stated streets ------------------------------ */

/**
 * Matching a work to a street the citizen typed.
 *
 * Loose on purpose: people write "MG Rd", "M.G. Road" and "Mahatma Gandhi Road"
 * for the same street, and a resident who types the name they actually use
 * should not get an empty screen because a gazetteer disagrees with them.
 */
export function normaliseStreet(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,'’]/g, '')
    .replace(/\broad\b|\brd\b/g, 'road')
    .replace(/\bstreet\b|\bst\b/g, 'street')
    .replace(/\blane\b|\bln\b/g, 'lane')
    .replace(/\bmarg\b/g, 'road')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stretchesForStreet(all: Stretch[], street: string): Stretch[] {
  const needle = normaliseStreet(street)
  if (needle.length < 2) return []
  return all.filter((s) => {
    const hay = normaliseStreet(s.street)
    return hay === needle || hay.includes(needle) || needle.includes(hay)
  })
}
