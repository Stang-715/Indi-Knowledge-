import { figure } from '../core/figures'
import type { Brand, CommodityFlow, PortThroughput, WeatherReading } from '../core/bharat'

/**
 * Sample data for 2.3 to 2.5.
 *
 * Invented, and every figure says so: `provenance: 'sample'` reaches the screen
 * as a label beside the number, next to the period it claims to describe. The
 * source names and links are the bodies that would publish the real thing —
 * IMD for weather, APEDA and DGCI&S for agricultural trade, the major port
 * authorities for throughput — so that when a feed is wired in, the shape it
 * has to fit is already on the screen.
 *
 * The lag is deliberately uneven. Weather is hours old, trade figures are a
 * quarter behind, port throughput a month. That unevenness is the honest state
 * of Indian open data and the reason every figure carries its own period rather
 * than the page carrying one date at the top.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const now = Date.now()
const ago = (ms: number) => now - ms

const IMD = {
  source: 'India Meteorological Department',
  sourceUrl: 'https://mausam.imd.gov.in/',
  provenance: 'sample' as const,
}
const APEDA = {
  source: 'APEDA — Agricultural and Processed Food Products Export Development Authority',
  sourceUrl: 'https://apeda.gov.in/',
  provenance: 'sample' as const,
}
const PORTS = {
  source: 'Major Port Authorities — monthly traffic statement',
  sourceUrl: 'https://shipmin.gov.in/',
  provenance: 'sample' as const,
}

/* --------------------------------- weather --------------------------------- */

export const WEATHER: WeatherReading[] = [
  {
    district: 'Pune', stateCode: 'MH', observedAt: ago(3 * HOUR),
    temperature: figure({ value: 27.4, unit: 'celsius', asOf: ago(3 * HOUR), precision: 1, ...IMD }),
    rainfall24h: figure({ value: 18, unit: 'mm', asOf: ago(3 * HOUR), ...IMD }),
    humidity: figure({ value: 78, unit: 'percent', asOf: ago(3 * HOUR), ...IMD }),
    advisories: [
      { kind: 'sowing', text: 'Enough moisture in the top soil for kharif sowing on medium-deep black soils. Hold off on light soils until the next spell.' },
      { kind: 'transport', text: 'Ghat sections are wet through the afternoon. Add an hour to any run over the pass.' },
    ],
    provenance: 'sample', sourceName: IMD.source, sourceUrl: IMD.sourceUrl, fetchedAt: ago(3 * HOUR),
  },
  {
    district: 'Thiruvananthapuram', stateCode: 'KL', observedAt: ago(2 * HOUR),
    temperature: figure({ value: 30.1, unit: 'celsius', asOf: ago(2 * HOUR), precision: 1, ...IMD }),
    rainfall24h: figure({ value: 42, unit: 'mm', asOf: ago(2 * HOUR), ...IMD }),
    humidity: figure({ value: 88, unit: 'percent', asOf: ago(2 * HOUR), ...IMD }),
    advisories: [
      { kind: 'flood', text: 'Low-lying wards near the canal have taken standing water twice this week. Clear the gullies before the next spell.' },
    ],
    provenance: 'sample', sourceName: IMD.source, sourceUrl: IMD.sourceUrl, fetchedAt: ago(2 * HOUR),
  },
  {
    district: 'Jaipur', stateCode: 'RJ', observedAt: ago(4 * HOUR),
    temperature: figure({ value: 41.6, unit: 'celsius', asOf: ago(4 * HOUR), precision: 1, ...IMD }),
    rainfall24h: figure({ value: 0, unit: 'mm', asOf: ago(4 * HOUR), ...IMD }),
    humidity: figure({ value: 21, unit: 'percent', asOf: ago(4 * HOUR), ...IMD }),
    advisories: [
      { kind: 'heat', text: 'Outdoor work between 11:00 and 16:00 is unsafe without shade and water. Municipal works should shift to early morning.' },
    ],
    provenance: 'sample', sourceName: IMD.source, sourceUrl: IMD.sourceUrl, fetchedAt: ago(4 * HOUR),
  },
  {
    district: 'Kamrup Metropolitan', stateCode: 'AS', observedAt: ago(5 * HOUR),
    temperature: figure({ value: 29.0, unit: 'celsius', asOf: ago(5 * HOUR), precision: 1, ...IMD }),
    rainfall24h: figure({ value: 96, unit: 'mm', asOf: ago(5 * HOUR), ...IMD }),
    humidity: figure({ value: 92, unit: 'percent', asOf: ago(5 * HOUR), ...IMD }),
    advisories: [
      { kind: 'flood', text: 'River level rising. Move stock off the low bank today rather than tomorrow.' },
      { kind: 'transport', text: 'Two approaches to the bridge are single-lane under water.' },
    ],
    provenance: 'sample', sourceName: IMD.source, sourceUrl: IMD.sourceUrl, fetchedAt: ago(5 * HOUR),
  },
]

/* ------------------------------ agri and export ---------------------------- */

const QUARTER = ago(96 * DAY)
const QUARTER_LAST_YEAR = ago((365 + 96) * DAY)

const share = (pct: number) => figure({
  value: pct, unit: 'percent', asOf: QUARTER, precision: 1,
  method: 'Share of the commodity’s export volume for the period.', ...APEDA,
})

export const FLOWS: CommodityFlow[] = [
  {
    id: 'flow_mh_grape', commodity: 'Table grapes', stateCode: 'MH',
    period: 'Quarter to March',
    volume: figure({ value: 84.2, unit: 'lakh-tonnes', asOf: QUARTER, precision: 1, ...APEDA }),
    value: figure({ value: 2140, unit: 'crore-rupees', asOf: QUARTER, ...APEDA }),
    volumeLastYear: figure({ value: 76.8, unit: 'lakh-tonnes', asOf: QUARTER_LAST_YEAR, precision: 1, ...APEDA }),
    destinations: [
      { country: 'Netherlands', share: share(31.0) },
      { country: 'United Kingdom', share: share(18.4) },
      { country: 'United Arab Emirates', share: share(12.7) },
    ],
    provenance: 'sample', sourceName: APEDA.source, sourceUrl: APEDA.sourceUrl, fetchedAt: QUARTER,
  },
  {
    id: 'flow_kl_spice', commodity: 'Pepper and spices', stateCode: 'KL',
    period: 'Quarter to March',
    volume: figure({ value: 12.6, unit: 'lakh-tonnes', asOf: QUARTER, precision: 1, ...APEDA }),
    value: figure({ value: 1890, unit: 'crore-rupees', asOf: QUARTER, ...APEDA }),
    volumeLastYear: figure({ value: 13.9, unit: 'lakh-tonnes', asOf: QUARTER_LAST_YEAR, precision: 1, ...APEDA }),
    destinations: [
      { country: 'United States', share: share(24.2) },
      { country: 'Germany', share: share(11.8) },
      { country: 'Vietnam', share: share(9.3) },
    ],
    provenance: 'sample', sourceName: APEDA.source, sourceUrl: APEDA.sourceUrl, fetchedAt: QUARTER,
  },
  {
    id: 'flow_pb_rice', commodity: 'Basmati rice', stateCode: 'PB',
    period: 'Quarter to March',
    volume: figure({ value: 156.4, unit: 'lakh-tonnes', asOf: QUARTER, precision: 1, ...APEDA }),
    value: figure({ value: 8420, unit: 'crore-rupees', asOf: QUARTER, ...APEDA }),
    volumeLastYear: figure({ value: 141.2, unit: 'lakh-tonnes', asOf: QUARTER_LAST_YEAR, precision: 1, ...APEDA }),
    destinations: [
      { country: 'Iran', share: share(22.6) },
      { country: 'Saudi Arabia', share: share(17.1) },
      { country: 'Iraq', share: share(14.8) },
    ],
    provenance: 'sample', sourceName: APEDA.source, sourceUrl: APEDA.sourceUrl, fetchedAt: QUARTER,
  },
  {
    id: 'flow_gj_cotton', commodity: 'Raw cotton', stateCode: 'GJ',
    period: 'Quarter to March',
    volume: figure({ value: 98.1, unit: 'lakh-tonnes', asOf: QUARTER, precision: 1, ...APEDA }),
    value: figure({ value: 3260, unit: 'crore-rupees', asOf: QUARTER, ...APEDA }),
    volumeLastYear: figure({ value: 112.5, unit: 'lakh-tonnes', asOf: QUARTER_LAST_YEAR, precision: 1, ...APEDA }),
    destinations: [
      { country: 'Bangladesh', share: share(38.9) },
      { country: 'China', share: share(19.2) },
      { country: 'Vietnam', share: share(8.6) },
    ],
    provenance: 'sample', sourceName: APEDA.source, sourceUrl: APEDA.sourceUrl, fetchedAt: QUARTER,
  },
]

const MONTH_AGO = ago(34 * DAY)

export const THROUGHPUT: PortThroughput[] = [
  {
    port: 'Jawaharlal Nehru Port', stateCode: 'MH', period: 'Month to April',
    containers: figure({ value: 612000, unit: 'teu', asOf: MONTH_AGO, ...PORTS }),
    cargo: figure({ value: 7420000, unit: 'tonnes', asOf: MONTH_AGO, ...PORTS }),
    provenance: 'sample', sourceName: PORTS.source, sourceUrl: PORTS.sourceUrl, fetchedAt: MONTH_AGO,
  },
  {
    port: 'Cochin Port', stateCode: 'KL', period: 'Month to April',
    containers: figure({ value: 71000, unit: 'teu', asOf: MONTH_AGO, ...PORTS }),
    cargo: figure({ value: 3180000, unit: 'tonnes', asOf: MONTH_AGO, ...PORTS }),
    provenance: 'sample', sourceName: PORTS.source, sourceUrl: PORTS.sourceUrl, fetchedAt: MONTH_AGO,
  },
  {
    port: 'Chennai Port', stateCode: 'TN', period: 'Month to April',
    containers: figure({ value: 148000, unit: 'teu', asOf: MONTH_AGO, ...PORTS }),
    cargo: figure({ value: 4260000, unit: 'tonnes', asOf: MONTH_AGO, ...PORTS }),
    provenance: 'sample', sourceName: PORTS.source, sourceUrl: PORTS.sourceUrl, fetchedAt: MONTH_AGO,
  },
]

/* ------------------------------ the directory ------------------------------ */

/**
 * Fictional firms.
 *
 * A directory entry is a claim that a named business exists and does a
 * particular thing. Inventing one against a real company's name is a claim
 * about somebody else's business, so the names here are made up and every card
 * says the entry is a sample. When this is wired to a real register — the MCA
 * company master, a state industries directory — the `registerEntry` field is
 * what carries the identifier that makes the claim checkable.
 */
const REGISTER = {
  provenance: 'sample' as const,
  sourceName: 'Sample directory entry — this business does not exist',
  sourceUrl: 'https://www.mca.gov.in/',
  fetchedAt: ago(20 * DAY),
}

export const BRANDS: Brand[] = [
  {
    id: 'br_1', name: 'Deccan Table Exports', sector: 'export-house',
    stateCode: 'MH', town: 'Nashik', since: 1994,
    what: 'Grapes and pomegranates, packed for the European retail season.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_2', name: 'Konkan Spice House', sector: 'export-house',
    stateCode: 'KL', town: 'Kochi', since: 1978,
    what: 'Pepper, cardamom and clove, graded and shipped in container lots.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_3', name: 'Sahyadri Electric', sector: 'electric-vehicle',
    stateCode: 'MH', town: 'Pune', since: 2016,
    what: 'Two-wheelers and light three-wheelers for last-mile delivery.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_4', name: 'Coromandel Drive Systems', sector: 'components',
    stateCode: 'TN', town: 'Hosur', since: 2004,
    what: 'Motors and controllers, supplied to vehicle assemblers.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_5', name: 'Nilgiri Cell Works', sector: 'battery',
    stateCode: 'KA', town: 'Bengaluru', since: 2019,
    what: 'Lithium iron phosphate packs and battery management systems.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_6', name: 'Malwa Grain Traders', sector: 'export-house',
    stateCode: 'PB', town: 'Amritsar', since: 1969,
    what: 'Basmati, milled and bagged for West Asian buyers.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_7', name: 'Saurashtra Fibre Mills', sector: 'export-house',
    stateCode: 'GJ', town: 'Rajkot', since: 1988,
    what: 'Ginned cotton and yarn.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
  {
    id: 'br_8', name: 'Brahmaputra Motors', sector: 'electric-vehicle',
    stateCode: 'AS', town: 'Guwahati', since: 2021,
    what: 'Electric three-wheelers built for the state’s roads and river ferries.',
    registerEntry: 'Sample CIN', ...REGISTER,
  },
]
