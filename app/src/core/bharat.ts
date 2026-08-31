import type { Figure } from './figures'
import type { Sourced } from './provenance'

/**
 * Surface 2 — the almanac.
 *
 * Dense, and never showing off. The failure mode to design against is dashboard
 * theatre: charts that look authoritative over data that is months stale. The
 * lag label is the antidote and it is not optional, which is why every number
 * on this surface is a `Figure` and a `Figure` cannot exist without a source
 * and a period.
 *
 * One privacy decision shapes the whole store half of this surface, and it is
 * worth stating before the types: **a store listing carries no pseudonym.**
 * A shop has a name, an address and opening hours; the person who listed it has
 * a pseudonym they post and vote under. Joining those two would mean that every
 * pseudonymous opinion its owner had ever expressed became attributable to a
 * named business at a known address — a deanonymisation this platform would
 * have performed on itself, for the convenience of an edit button.
 *
 * So a listing is a public record about a business, owned by a secret the
 * device holds, and the voice layer never touches it.
 */

/* ---------------------------------- states --------------------------------- */

export interface StateRef {
  code: string
  name: string
  capital: string
  /** Where the state's own administration publishes. */
  portal?: string
}

export interface Milestone {
  year: number
  what: string
}

export interface StateProfile extends Sourced {
  code: string
  formedOn: string
  capital: string
  /** Winter capital, seat of the High Court, and so on, where they differ. */
  seats?: string
  districts: Figure
  lokSabhaSeats: Figure
  assemblySeats: Figure
  /** The dates a person from the state would name, not a summary paragraph. */
  timeline: Milestone[]
  languages: string[]
}

/* --------------------------------- weather --------------------------------- */

export interface WeatherReading extends Sourced {
  district: string
  stateCode: string
  observedAt: number
  temperature: Figure
  rainfall24h: Figure
  humidity: Figure
  /** What the reading means for somebody with a field or a lorry. */
  advisories: { kind: 'sowing' | 'transport' | 'heat' | 'flood'; text: string }[]
}

/* ------------------------------ trade and crops ---------------------------- */

export interface CommodityFlow extends Sourced {
  id: string
  commodity: string
  stateCode: string
  /** The period this covers, said as the source says it. */
  period: string
  volume: Figure
  value: Figure
  /** Same period, previous year. Present so a change can be derived honestly. */
  volumeLastYear: Figure
  destinations: { country: string; share: Figure }[]
}

export interface PortThroughput extends Sourced {
  port: string
  stateCode: string
  period: string
  containers: Figure
  cargo: Figure
}

/* ------------------------------- the directory ----------------------------- */

export type Sector = 'export-house' | 'electric-vehicle' | 'battery' | 'components'

export interface Brand extends Sourced {
  id: string
  name: string
  sector: Sector
  stateCode: string
  town: string
  /** What they actually make or ship, in plain words. */
  what: string
  since?: number
  /** Where the claim that they exist comes from — a register, not a press release. */
  registerEntry?: string
}

/* --------------------------------- stores ---------------------------------- */

export type StoreCategory =
  | 'grocery' | 'produce' | 'hardware' | 'clothing' | 'repair'
  | 'food' | 'medical' | 'services' | 'other'

/**
 * A shop, listed by whoever runs it.
 *
 * Note what is not on this type: no pseudonym, no owner id, no account. The
 * device that listed it holds a secret whose digest is stored alongside, and
 * that digest is the only thing connecting a listing to the person who made it.
 * It is a capability, not an identity — it proves you can edit this listing and
 * says nothing about who you are.
 *
 * `address` is what the shopkeeper typed on a form about their own business.
 * A shop's address is a public fact about a shop. It is not a reading taken
 * from anybody, and there is no path here that turns it into one.
 */
export interface Store {
  id: string
  name: string
  category: StoreCategory
  /** The stated address of the business, as its owner wrote it. */
  address: string
  locality: string
  district: string
  stateCode: string
  /** Where it sits on the ward map. Placed by the lister, not measured. */
  at?: { x: number; y: number }
  what: string
  hours?: string
  phone?: string
  listedAt: number
  /**
   * A human has checked this against something. False by default and shown as
   * unverified, because the alternative is a directory that implies a check
   * nobody performed.
   */
  verified: boolean
  /** Set when a report has been upheld. Kept visible rather than deleted. */
  removed?: { at: number; reason: string }
}

export const STORE_CATEGORIES: StoreCategory[] = [
  'grocery', 'produce', 'hardware', 'clothing', 'repair',
  'food', 'medical', 'services', 'other',
]

/** Loose matching for a directory people search by half-remembered names. */
export function matchesStore(store: Store, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return true
  return `${store.name} ${store.what} ${store.address} ${store.locality} ${store.category}`
    .toLowerCase()
    .includes(q)
}
