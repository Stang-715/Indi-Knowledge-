import type { Department, Stretch, Work } from '../core/works'

/**
 * Sample works data.
 *
 * Same rule as the legislative data: every record is invented and every record
 * says so on screen. The departments are fictional in particular — an overrun
 * record is a claim that a named body failed to do what it promised, and
 * publishing an invented one against a real authority would be a defamation
 * with a chart attached. The utility types, the shape of the record and the
 * Right to Service framing are real; the failures are not anybody's.
 *
 * The geometry is a local metre grid, not latitude and longitude. Chowk draws
 * its own map rather than fetching tiles, so there is no projection to match
 * and no third party receiving a viewport.
 */

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()
const ago = (d: number) => now - d * DAY
const ahead = (d: number) => now + d * DAY

const sourced = {
  provenance: 'sample' as const,
  sourceName: 'Sample record — invented for this build',
  sourceUrl: 'https://www.india.gov.in/topics/law-justice/right-service',
  fetchedAt: ago(1),
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'dep_water', name: 'Ward Water Supply Division', utility: 'water',
    appealOfficer: 'Designated appellate officer, Water Supply', ...sourced,
  },
  {
    id: 'dep_power', name: 'City Electricity Distribution', utility: 'power',
    appealOfficer: 'Designated appellate officer, Distribution', ...sourced,
  },
  {
    id: 'dep_telecom', name: 'Fibre Networks (licensed operator)', utility: 'telecom',
    ...sourced,
  },
  {
    id: 'dep_road', name: 'Municipal Roads Department', utility: 'road',
    appealOfficer: 'Designated appellate officer, Roads', ...sourced,
  },
  {
    id: 'dep_drain', name: 'Storm Water Drainage Cell', utility: 'drainage',
    appealOfficer: 'Designated appellate officer, Drainage', ...sourced,
  },
]

/**
 * The street network, as polylines.
 *
 * Small enough to draw at any zoom without simplification, and shaped like a
 * real ward rather than a grid: one main road, a market approach that bends, a
 * few lanes coming off it and a bypass along the top.
 */
export const STRETCHES: Stretch[] = [
  {
    id: 'str_mg', street: 'MG Road', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 60, y: 520 }, { x: 300, y: 505 }, { x: 560, y: 512 }, { x: 860, y: 500 }],
  },
  {
    id: 'str_station', street: 'Station Road', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 300, y: 505 }, { x: 315, y: 320 }, { x: 340, y: 140 }],
  },
  {
    id: 'str_market', street: 'Market Approach', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 560, y: 512 }, { x: 620, y: 640 }, { x: 700, y: 720 }, { x: 840, y: 745 }],
  },
  {
    id: 'str_nehru', street: 'Nehru Lane', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 160, y: 515 }, { x: 150, y: 700 }, { x: 165, y: 860 }],
  },
  {
    id: 'str_canal', street: 'Canal Road', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 70, y: 200 }, { x: 330, y: 175 }, { x: 640, y: 190 }, { x: 900, y: 165 }],
  },
  {
    id: 'str_school', street: 'School Lane', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 640, y: 190 }, { x: 660, y: 340 }, { x: 655, y: 505 }],
  },
  {
    id: 'str_bypass', street: 'Outer Bypass', locality: 'Ward 03', district: 'Pune',
    path: [{ x: 40, y: 70 }, { x: 460, y: 55 }, { x: 940, y: 80 }],
  },
  {
    id: 'str_temple', street: 'Temple Street', locality: 'Ward 12', district: 'Pune',
    path: [{ x: 430, y: 512 }, { x: 445, y: 660 }, { x: 470, y: 800 }],
  },
]

/**
 * Works, chosen to cover every state the surface has to render.
 *
 * Two are overrun — one badly, with three revised dates, and one by a few days.
 * One is restored late, so the record has something to count. One is planned
 * and has not started. One was cancelled, which must not count against anybody.
 * One has no permit number, because works published without one are the normal
 * case until the departmental half exists, and the surface has to say so rather
 * than leave a blank.
 */
export const WORKS: Work[] = [
  {
    id: 'wk_mg_water', stretchId: 'str_mg', departmentId: 'dep_water', utility: 'water',
    reason: 'Replacing the 1970s cast-iron main between the junction and the post office.',
    startsAt: ago(64), restoreBy: ahead(9),
    revisions: [
      { to: ago(22), at: ago(70), reason: 'Original commitment at the time of booking.' },
      { to: ahead(9), at: ago(26), reason: 'Extended: the trench found an unmapped gas line and work stopped for four days.' },
    ],
    permitNumber: 'W12/2026/0418', state: 'open', closure: 'partial', ...sourced,
  },
  {
    id: 'wk_market_fibre', stretchId: 'str_market', departmentId: 'dep_telecom', utility: 'telecom',
    reason: 'Laying fibre duct along the market approach.',
    startsAt: ago(96), restoreBy: ago(38),
    revisions: [
      { to: ago(66), at: ago(100), reason: 'Original commitment at the time of booking.' },
      { to: ago(52), at: ago(64), reason: 'Extended: contractor unavailable.' },
      { to: ago(38), at: ago(50), reason: 'Extended: awaiting reinstatement material.' },
    ],
    permitNumber: 'W12/2026/0301', state: 'open', closure: 'partial', ...sourced,
  },
  {
    id: 'wk_nehru_drain', stretchId: 'str_nehru', departmentId: 'dep_drain', utility: 'drainage',
    reason: 'Covered drainage on lanes 4 to 11, from the ward budget.',
    startsAt: ago(12), restoreBy: ago(2),
    revisions: [{ to: ago(2), at: ago(16), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W12/2026/0502', state: 'open', closure: 'full', ...sourced,
  },
  {
    id: 'wk_station_power', stretchId: 'str_station', departmentId: 'dep_power', utility: 'power',
    reason: 'Replacing a failed distribution transformer and its feeder cable.',
    startsAt: ago(30), restoreBy: ago(18), restoredAt: ago(11),
    revisions: [{ to: ago(18), at: ago(33), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W12/2026/0447', state: 'restored', closure: 'partial', ...sourced,
  },
  {
    id: 'wk_canal_road', stretchId: 'str_canal', departmentId: 'dep_road', utility: 'road',
    reason: 'Resurfacing after the monsoon, including the two junctions.',
    startsAt: ago(21), restoreBy: ago(6), restoredAt: ago(6),
    revisions: [{ to: ago(6), at: ago(25), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W03/2026/0119', state: 'restored', closure: 'partial', ...sourced,
  },
  {
    id: 'wk_school_water', stretchId: 'str_school', departmentId: 'dep_water', utility: 'water',
    reason: 'New connection to the municipal school block.',
    startsAt: ahead(6), restoreBy: ahead(20),
    revisions: [{ to: ahead(20), at: ago(3), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W12/2026/0533', state: 'planned', closure: 'partial', ...sourced,
  },
  {
    id: 'wk_temple_fibre', stretchId: 'str_temple', departmentId: 'dep_telecom', utility: 'telecom',
    reason: 'Fibre drop to the exchange. Published without a permit number.',
    startsAt: ago(5), restoreBy: ahead(2),
    revisions: [{ to: ahead(2), at: ago(8), reason: 'Original commitment at the time of booking.' }],
    state: 'open', closure: 'none', ...sourced,
  },
  {
    id: 'wk_bypass_road', stretchId: 'str_bypass', departmentId: 'dep_road', utility: 'road',
    reason: 'Shoulder widening. Called off before work began.',
    startsAt: ago(40), restoreBy: ago(10),
    revisions: [{ to: ago(10), at: ago(44), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W03/2026/0092', state: 'cancelled', closure: 'none', ...sourced,
  },
  {
    id: 'wk_mg_drain', stretchId: 'str_mg', departmentId: 'dep_drain', utility: 'drainage',
    reason: 'Gully cleaning ahead of the monsoon.',
    startsAt: ago(88), restoreBy: ago(80), restoredAt: ago(79),
    revisions: [{ to: ago(80), at: ago(92), reason: 'Original commitment at the time of booking.' }],
    permitNumber: 'W12/2026/0205', state: 'restored', closure: 'none', ...sourced,
  },
  {
    id: 'wk_market_road', stretchId: 'str_market', departmentId: 'dep_road', utility: 'road',
    reason: 'Reinstating the surface after the fibre duct.',
    startsAt: ahead(12), restoreBy: ahead(26),
    revisions: [{ to: ahead(26), at: ago(2), reason: 'Original commitment at the time of booking.' }],
    state: 'planned', closure: 'partial', ...sourced,
  },
]
