import type { Bill, Constituency, Representative, VoteRecord } from '../core/legislation'

/**
 * Sample legislative data.
 *
 * Every bill here is invented, and every record says so: `provenance: 'sample'`
 * reaches the screen as a visible label, not as a comment in a file nobody
 * reads. The alternative — plausible-looking summaries of real bills, written
 * by nobody in particular — is the exact failure this surface is supposed to
 * be an answer to. A civic app that misdescribes a bill has done more damage
 * than one that has no bills in it.
 *
 * The shapes are real: the stage sequence, the citation format, the ministry
 * names and the way most business passes without a recorded division. Two
 * records are deliberately damaged — one partially parsed, one unreadable — so
 * the path that shows a source link instead of content is exercised in the
 * ordinary course of using the app rather than only in a test.
 */

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()
const ago = (days: number) => now - days * DAY

export const BILLS: Bill[] = [
  {
    id: 'bill_water',
    title: 'The Municipal Water Supply (Continuity of Service) Bill',
    citation: 'Bill No. 118 of 2026',
    house: 'lok-sabha',
    ministry: 'Ministry of Jal Shakti',
    provenance: 'sample',
    sourceName: 'Sample record — not a real bill',
    sourceUrl: 'https://sansad.in/ls',
    fetchedAt: ago(2),
    introducedAt: ago(96),
    stage: 'committee',
    history: [
      { stage: 'introduced', at: ago(96), note: 'Introduced in the Lok Sabha and read a first time.' },
      { stage: 'committee', at: ago(61), note: 'Referred to the Standing Committee on Housing and Urban Affairs. Report expected within three months.' },
    ],
    plainSummary:
      'Would require a water utility to give seventy-two hours’ notice before a planned supply cut, and to publish the reason and the restoration time for an unplanned one. Utilities that miss a published restoration time twice in a quarter would have to report it to the state regulator.',
    pollId: 'poll_water_bill',
    topicId: 'top_water_bill',
    clauses: [
      {
        id: 'c_water_2', number: '2', heading: 'Definitions',
        text: 'In this Act, unless the context otherwise requires, “planned interruption” means any suspension of supply of which the utility has notice not less than seventy-two hours in advance.',
        plain: 'Sets out what counts as a planned cut: one the utility knew about at least three days ahead.',
      },
      {
        id: 'c_water_4', number: '4', heading: 'Notice of planned interruption',
        text: 'Every utility shall, not less than seventy-two hours before a planned interruption, publish notice of the interruption specifying the area affected, the expected duration and the reason.',
        plain: 'Three days’ notice, saying where, how long, and why.',
      },
      {
        id: 'c_water_7', number: '7', heading: 'Unplanned interruption',
        text: 'Where an interruption occurs otherwise than under section 4, the utility shall within four hours publish the reason and an expected time of restoration, and shall publish a revised time whenever the previous one is not met.',
        plain: 'For a burst main or a pump failure: say what happened within four hours, and say when it will be back. Say it again every time that estimate slips.',
        disputed: true,
      },
      {
        id: 'c_water_9', number: '9', heading: 'Reporting of repeated failure',
        text: 'A utility which fails to restore supply by a published time on more than two occasions in any quarter shall report each such failure to the State regulator in the prescribed form.',
        plain: 'Miss your own deadline three times in three months and the regulator has to be told.',
        disputed: true,
        amends: 'Water (Prevention and Control of Pollution) Act, 1974 — reporting schedule',
      },
      {
        id: 'c_water_12', number: '12', heading: 'Power to make rules',
        text: 'The Central Government may, by notification, make rules for carrying out the provisions of this Act.',
        plain: 'The usual clause letting the ministry fill in the detail later. What "prescribed" in clause 9 ends up meaning is decided here, not in Parliament.',
      },
    ],
  },
  {
    id: 'bill_roads',
    title: 'The Road Excavation (Coordination and Restoration) Bill',
    citation: 'Bill No. 74 of 2026',
    house: 'both',
    ministry: 'Ministry of Road Transport and Highways',
    provenance: 'sample',
    sourceName: 'Sample record — not a real bill',
    sourceUrl: 'https://sansad.in/ls',
    fetchedAt: ago(1),
    introducedAt: ago(210),
    stage: 'upper-passed',
    history: [
      { stage: 'introduced', at: ago(210) },
      { stage: 'committee', at: ago(174), note: 'Standing Committee reported with amendments to clauses 5 and 11.' },
      { stage: 'lower-passed', at: ago(58), note: 'Passed by the Lok Sabha with the committee’s amendments.' },
      { stage: 'upper-passed', at: ago(12), note: 'Passed by the Rajya Sabha without further amendment. Awaiting assent.' },
    ],
    plainSummary:
      'Would require any agency digging a public road — water, power, telecom or the road authority itself — to register the work, its window and its restoration date before starting, and would make a permit conditional on no other agency having booked the same stretch.',
    pollId: 'poll_roads_bill',
    topicId: 'top_roads_bill',
    clauses: [
      {
        id: 'c_roads_5', number: '5', heading: 'Prior registration of excavation',
        text: 'No person shall excavate any part of a public road except under a permit issued under section 8, and no permit shall be issued unless the excavation has been registered under this section not less than fourteen days in advance.',
        plain: 'Book it a fortnight ahead or you do not get a permit, and without a permit the dig is unlawful.',
        disputed: true,
      },
      {
        id: 'c_roads_8', number: '8', heading: 'Permit and conditions',
        text: 'A permit shall specify the stretch, the window, the restoring agency and the date by which restoration shall be completed.',
        plain: 'The permit names the road, the dates, who fills the hole back in, and by when.',
      },
      {
        id: 'c_roads_11', number: '11', heading: 'Publication of record',
        text: 'The authority shall maintain and publish a record of permits issued, restoration dates specified and dates on which restoration was certified complete.',
        plain: 'Promised against actual, published. This is the clause that makes the rest of it mean anything.',
        disputed: true,
      },
    ],
  },
  {
    id: 'bill_records',
    title: 'The Public Records (Digital Access) Amendment Bill',
    citation: 'Bill No. 31 of 2026',
    house: 'lok-sabha',
    ministry: 'Ministry of Culture',
    /* Parsed in part: the stage history read cleanly, the clause text did not.
       Showing the clauses we did read while linking the rest is honest; showing
       four of eleven clauses as though they were the bill is not. */
    provenance: 'partial',
    sourceName: 'Lok Sabha bill text (sample source)',
    sourceUrl: 'https://sansad.in/ls',
    fetchedAt: ago(9),
    introducedAt: ago(40),
    stage: 'introduced',
    history: [{ stage: 'introduced', at: ago(40) }],
    plainSummary:
      'Would extend the Public Records Act to records held in digital form and set a period after which they must be transferred to the National Archives.',
    clauses: [
      {
        id: 'c_rec_3', number: '3', heading: 'Application to digital records',
        text: 'The provisions of the principal Act shall apply to records created or received in digital form as they apply to records in any other form.',
        plain: 'Digital records are public records, with the same duties attached.',
      },
    ],
  },
  {
    id: 'bill_transport',
    title: 'The Inter-State Transport Facilitation Bill',
    citation: 'Bill No. 9 of 2026',
    house: 'rajya-sabha',
    ministry: 'Ministry of Road Transport and Highways',
    /* The source responded with something this build could not read at all.
       There is nothing to show but the link, and that is what the screen does. */
    provenance: 'unreadable',
    sourceName: 'Rajya Sabha bill text (sample source)',
    sourceUrl: 'https://sansad.in/rs',
    fetchedAt: ago(4),
    introducedAt: ago(31),
    stage: 'introduced',
    history: [{ stage: 'introduced', at: ago(31) }],
    clauses: [],
  },
  {
    id: 'bill_lapsed',
    title: 'The Municipal Solid Waste (Segregation at Source) Bill',
    citation: 'Bill No. 202 of 2024',
    house: 'lok-sabha',
    ministry: 'Ministry of Housing and Urban Affairs',
    provenance: 'sample',
    sourceName: 'Sample record — not a real bill',
    sourceUrl: 'https://sansad.in/ls',
    fetchedAt: ago(30),
    introducedAt: ago(690),
    stage: 'lapsed',
    history: [
      { stage: 'introduced', at: ago(690) },
      { stage: 'committee', at: ago(640), note: 'Referred to the Standing Committee. Report presented.' },
      { stage: 'lapsed', at: ago(120), note: 'Lapsed on the dissolution of the House. A bill pending in the Lok Sabha does not survive it.' },
    ],
    plainSummary:
      'Would have required households and bulk generators to segregate waste at source, with municipal collection refused for unsegregated waste after a transition period.',
    clauses: [],
  },
]

/* ------------------------------ constituencies ---------------------------- */

/**
 * Real constituencies. The representatives below are not.
 *
 * Constituency names and the districts they cover are public and stable, so
 * they are given as they are. Who holds a seat, and how they voted on a
 * division, is exactly the kind of fact that must never be invented — a
 * fabricated voting record attached to a real name is a defamation with a
 * search index. So the people here are fictional, each marked `sample`, and
 * the screen says so above the record rather than in a footnote.
 */
export const CONSTITUENCIES: Constituency[] = [
  { id: 'con_pune', name: 'Pune', state: 'Maharashtra', house: 'lok-sabha', districts: ['Pune'] },
  { id: 'con_baramati', name: 'Baramati', state: 'Maharashtra', house: 'lok-sabha', districts: ['Pune'] },
  { id: 'con_mumbai_s', name: 'Mumbai South', state: 'Maharashtra', house: 'lok-sabha', districts: ['Mumbai City'] },
  { id: 'con_varanasi', name: 'Varanasi', state: 'Uttar Pradesh', house: 'lok-sabha', districts: ['Varanasi'] },
  { id: 'con_lucknow', name: 'Lucknow', state: 'Uttar Pradesh', house: 'lok-sabha', districts: ['Lucknow'] },
  { id: 'con_tvm', name: 'Thiruvananthapuram', state: 'Kerala', house: 'lok-sabha', districts: ['Thiruvananthapuram'] },
  { id: 'con_blr_s', name: 'Bangalore South', state: 'Karnataka', house: 'lok-sabha', districts: ['Bengaluru Urban'] },
  { id: 'con_blr_c', name: 'Bangalore Central', state: 'Karnataka', house: 'lok-sabha', districts: ['Bengaluru Urban'] },
  { id: 'con_kol_d', name: 'Kolkata Dakshin', state: 'West Bengal', house: 'lok-sabha', districts: ['Kolkata'] },
  { id: 'con_chennai_s', name: 'Chennai South', state: 'Tamil Nadu', house: 'lok-sabha', districts: ['Chennai'] },
  { id: 'con_jaipur', name: 'Jaipur', state: 'Rajasthan', house: 'lok-sabha', districts: ['Jaipur'] },
  { id: 'con_guwahati', name: 'Guwahati', state: 'Assam', house: 'lok-sabha', districts: ['Kamrup Metropolitan'] },
]

const sampleSource = {
  provenance: 'sample' as const,
  sourceName: 'Sample record — this person does not exist',
  sourceUrl: 'https://sansad.in/ls/members',
  fetchedAt: ago(6),
}

export const REPRESENTATIVES: Representative[] = [
  { id: 'rep_1', name: 'Aruna Deshmukh', party: 'Sample Party (A)', constituencyId: 'con_pune', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_2', name: 'Vikram Sathe', party: 'Sample Party (B)', constituencyId: 'con_baramati', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_3', name: 'Nafisa Qureshi', party: 'Sample Party (C)', constituencyId: 'con_mumbai_s', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_4', name: 'Ramesh Tiwari', party: 'Sample Party (A)', constituencyId: 'con_varanasi', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_5', name: 'Sunita Yadav', party: 'Sample Party (B)', constituencyId: 'con_lucknow', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_6', name: 'Thomas Varghese', party: 'Sample Party (C)', constituencyId: 'con_tvm', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_7', name: 'Kavya Rao', party: 'Sample Party (A)', constituencyId: 'con_blr_s', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_8', name: 'Imran Pasha', party: 'Sample Party (B)', constituencyId: 'con_blr_c', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_9', name: 'Sudeshna Ghosh', party: 'Sample Party (C)', constituencyId: 'con_kol_d', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_10', name: 'Meena Rajan', party: 'Sample Party (A)', constituencyId: 'con_chennai_s', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_11', name: 'Devendra Shekhawat', party: 'Sample Party (B)', constituencyId: 'con_jaipur', since: Date.parse('2024-06-04'), ...sampleSource },
  { id: 'rep_12', name: 'Bhaskar Kalita', party: 'Sample Party (C)', constituencyId: 'con_guwahati', since: Date.parse('2024-06-04'), ...sampleSource },
]

/**
 * Voting records.
 *
 * `not-recorded` is the majority, and that is not a gap in the data — most
 * business in both Houses passes on a voice vote with no division called, so
 * there is no individual record to publish. A surface that quietly showed
 * those as absences would libel half of Parliament by rounding error.
 */
export const VOTE_RECORDS: VoteRecord[] = [
  { billId: 'bill_roads', representativeId: 'rep_1', position: 'for', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_2', position: 'against', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_3', position: 'absent', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_4', position: 'for', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_5', position: 'for', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_6', position: 'abstained', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_roads', representativeId: 'rep_7', position: 'against', divisionNumber: 'LS/2026/41', ...sampleSource },
  { billId: 'bill_water', representativeId: 'rep_1', position: 'not-recorded', ...sampleSource },
  { billId: 'bill_water', representativeId: 'rep_4', position: 'not-recorded', ...sampleSource },
  { billId: 'bill_lapsed', representativeId: 'rep_1', position: 'not-recorded', ...sampleSource },
]
