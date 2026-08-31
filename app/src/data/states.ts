import { figure } from '../core/figures'
import type { StateProfile, StateRef } from '../core/bharat'

/**
 * 2.1 / 2.2 — the states, and what a person from one would want said about it.
 *
 * The structural facts here are public and stable: when the state was formed,
 * its capital, how many seats it sends to the Lok Sabha and holds in its own
 * assembly. Those are sourced to the bodies that set them and dated, because
 * "as it stood in 2024" is a different claim from "now" even for a fact that
 * rarely moves.
 *
 * District counts are the exception and are marked as a snapshot in their own
 * `method`. States create and merge districts routinely — a count is true on a
 * date and quietly wrong a year later, which is precisely the failure this
 * surface is built to refuse.
 *
 * Nothing here was fetched. It is written from public record against named
 * sources, and the register records that no live feed exists yet (G-8-01).
 */

const ECI = {
  source: 'Election Commission of India',
  sourceUrl: 'https://www.eci.gov.in/',
}
const CENSUS = {
  source: 'Government of India — state administrative records',
  sourceUrl: 'https://www.india.gov.in/india-glance/about-india-glance',
}

const SNAPSHOT = Date.parse('2024-06-01T00:00:00Z')
const SNAPSHOT_NOTE = 'Counts change as states create or merge districts. A snapshot, dated.'

const seats = (n: number) => figure({
  value: n, unit: 'count', asOf: SNAPSHOT, provenance: 'official',
  method: 'Seats as fixed by the current delimitation.', ...ECI,
})
const districts = (n: number) => figure({
  value: n, unit: 'count', asOf: SNAPSHOT, provenance: 'official',
  method: SNAPSHOT_NOTE, ...CENSUS,
})

export const STATES: StateRef[] = [
  { code: 'MH', name: 'Maharashtra', capital: 'Mumbai' },
  { code: 'KL', name: 'Kerala', capital: 'Thiruvananthapuram' },
  { code: 'TN', name: 'Tamil Nadu', capital: 'Chennai' },
  { code: 'KA', name: 'Karnataka', capital: 'Bengaluru' },
  { code: 'WB', name: 'West Bengal', capital: 'Kolkata' },
  { code: 'UP', name: 'Uttar Pradesh', capital: 'Lucknow' },
  { code: 'GJ', name: 'Gujarat', capital: 'Gandhinagar' },
  { code: 'RJ', name: 'Rajasthan', capital: 'Jaipur' },
  { code: 'PB', name: 'Punjab', capital: 'Chandigarh' },
  { code: 'AS', name: 'Assam', capital: 'Dispur' },
]

const sourced = {
  provenance: 'official' as const,
  sourceName: 'Public record — state formation and administrative structure',
  sourceUrl: 'https://www.india.gov.in/india-glance/about-india-glance',
  fetchedAt: SNAPSHOT,
}

export const PROFILES: Record<string, StateProfile> = {
  MH: {
    code: 'MH', formedOn: '1 May 1960', capital: 'Mumbai',
    seats: 'Nagpur is the winter seat of the legislature.',
    districts: districts(36), lokSabhaSeats: seats(48), assemblySeats: seats(288),
    languages: ['Marathi'],
    timeline: [
      { year: 1960, what: 'Bombay State is divided on linguistic lines; Maharashtra and Gujarat are formed on the same day.' },
      { year: 1972, what: 'The Employment Guarantee Scheme begins — the state-level ancestor of the national rural employment guarantee.' },
      { year: 1993, what: 'The Latur earthquake; the rebuilding programme becomes a reference for disaster reconstruction.' },
      { year: 2005, what: 'The 26 July floods in Mumbai; the drainage failures they exposed are still being worked through.' },
    ],
    ...sourced,
  },
  KL: {
    code: 'KL', formedOn: '1 November 1956', capital: 'Thiruvananthapuram',
    districts: districts(14), lokSabhaSeats: seats(20), assemblySeats: seats(140),
    languages: ['Malayalam'],
    timeline: [
      { year: 1956, what: 'Travancore-Cochin and Malabar are joined under the States Reorganisation Act.' },
      { year: 1957, what: 'The first elected communist state government in India takes office.' },
      { year: 1991, what: 'Declared fully literate — the campaign, not the census, is what the state remembers.' },
      { year: 2018, what: 'The August floods; the relief effort is run substantially through local government.' },
    ],
    ...sourced,
  },
  TN: {
    code: 'TN', formedOn: '1 November 1956', capital: 'Chennai',
    seats: 'Renamed from Madras State in 1969.',
    districts: districts(38), lokSabhaSeats: seats(39), assemblySeats: seats(234),
    languages: ['Tamil'],
    timeline: [
      { year: 1956, what: 'Madras State is reorganised on linguistic lines.' },
      { year: 1965, what: 'The anti-Hindi agitations; the outcome shapes national language policy to this day.' },
      { year: 1969, what: 'Madras State is renamed Tamil Nadu.' },
      { year: 1982, what: 'The mid-day meal scheme is extended statewide, later becoming a national programme.' },
    ],
    ...sourced,
  },
  KA: {
    code: 'KA', formedOn: '1 November 1956', capital: 'Bengaluru',
    seats: 'Renamed from Mysore State in 1973.',
    districts: districts(31), lokSabhaSeats: seats(28), assemblySeats: seats(224),
    languages: ['Kannada'],
    timeline: [
      { year: 1956, what: 'Kannada-speaking areas of four administrations are brought together as Mysore State.' },
      { year: 1973, what: 'Renamed Karnataka.' },
      { year: 1985, what: 'Panchayat reforms give elected village bodies real budgets, years ahead of the 73rd Amendment.' },
      { year: 1999, what: 'The IT services industry in Bengaluru passes a lakh of jobs.' },
    ],
    ...sourced,
  },
  WB: {
    code: 'WB', formedOn: '15 August 1947', capital: 'Kolkata',
    districts: districts(23), lokSabhaSeats: seats(42), assemblySeats: seats(294),
    languages: ['Bengali'],
    timeline: [
      { year: 1947, what: 'Partition divides Bengal; the state is formed from its western districts.' },
      { year: 1977, what: 'Operation Barga begins registering sharecroppers — one of the few land reforms in India that measurably worked.' },
      { year: 2011, what: 'A change of government after thirty-four years.' },
    ],
    ...sourced,
  },
  UP: {
    code: 'UP', formedOn: '26 January 1950', capital: 'Lucknow',
    seats: 'The United Provinces, renamed at the commencement of the Constitution.',
    districts: districts(75), lokSabhaSeats: seats(80), assemblySeats: seats(403),
    languages: ['Hindi', 'Urdu'],
    timeline: [
      { year: 1950, what: 'The United Provinces become Uttar Pradesh.' },
      { year: 2000, what: 'Uttarakhand is separated from the hill districts.' },
    ],
    ...sourced,
  },
  GJ: {
    code: 'GJ', formedOn: '1 May 1960', capital: 'Gandhinagar',
    districts: districts(33), lokSabhaSeats: seats(26), assemblySeats: seats(182),
    languages: ['Gujarati'],
    timeline: [
      { year: 1960, what: 'Formed the same day as Maharashtra, from the division of Bombay State.' },
      { year: 1970, what: 'Gandhinagar replaces Ahmedabad as the capital.' },
      { year: 2001, what: 'The Bhuj earthquake; the rebuilding sets the state’s disaster management practice.' },
    ],
    ...sourced,
  },
  RJ: {
    code: 'RJ', formedOn: '1 November 1956', capital: 'Jaipur',
    districts: districts(33), lokSabhaSeats: seats(25), assemblySeats: seats(200),
    languages: ['Hindi', 'Rajasthani'],
    timeline: [
      { year: 1949, what: 'The princely states of Rajputana are merged in stages.' },
      { year: 1956, what: 'The present boundaries are settled under the States Reorganisation Act.' },
      { year: 2005, what: 'The state right to information campaign feeds directly into the national Act.' },
    ],
    ...sourced,
  },
  PB: {
    code: 'PB', formedOn: '1 November 1966', capital: 'Chandigarh',
    seats: 'Chandigarh is a union territory and serves as capital of two states.',
    districts: districts(23), lokSabhaSeats: seats(13), assemblySeats: seats(117),
    languages: ['Punjabi'],
    timeline: [
      { year: 1966, what: 'Punjab is reorganised; Haryana is formed and the hill areas go to Himachal Pradesh.' },
      { year: 1970, what: 'Wheat and rice yields rise sharply under the new varieties; the water cost is still being paid.' },
    ],
    ...sourced,
  },
  AS: {
    code: 'AS', formedOn: '15 August 1947', capital: 'Dispur',
    seats: 'Guwahati is the commercial centre; Dispur is a locality within it.',
    districts: districts(35), lokSabhaSeats: seats(14), assemblySeats: seats(126),
    languages: ['Assamese', 'Bodo', 'Bengali'],
    timeline: [
      { year: 1947, what: 'Assam enters the Union; several states are later formed from its territory.' },
      { year: 1963, what: 'Nagaland is separated.' },
      { year: 1972, what: 'Meghalaya, Manipur and Tripura become states.' },
    ],
    ...sourced,
  },
}
