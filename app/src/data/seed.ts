import type {
  BrigadingFlag, InstitutionRef, Notice, Poll, Post, Topic,
} from '../core/types'
import type { StatedLocality } from '../core/prefs'

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

export const INSTITUTIONS: InstitutionRef[] = [
  { id: 'inst_mcw', name: 'Municipal Corporation — Ward Works', department: 'Public Works', verified: true },
  { id: 'inst_water', name: 'State Water Supply Board', department: 'Water & Sanitation', verified: true },
  { id: 'inst_health', name: 'District Health Office', department: 'Public Health', verified: true },
  { id: 'inst_leg', name: 'State Legislative Secretariat', department: 'Legislation', verified: true },
  { id: 'inst_transport', name: 'City Transport Authority', department: 'Transport', verified: true },
]

export const LOCALITY_CATALOGUE: StatedLocality[] = [
  { id: 'loc_w12', label: 'Ward 12, Shivajinagar', ward: 'Ward 12', district: 'Pune', state: 'Maharashtra' },
  { id: 'loc_w03', label: 'Ward 3, Kothrud', ward: 'Ward 3', district: 'Pune', state: 'Maharashtra' },
  { id: 'loc_w45', label: 'Ward 45, Whitefield', ward: 'Ward 45', district: 'Bengaluru Urban', state: 'Karnataka' },
  { id: 'loc_w08', label: 'Ward 8, Salt Lake', ward: 'Ward 8', district: 'North 24 Parganas', state: 'West Bengal' },
  { id: 'loc_w21', label: 'Ward 21, Adyar', ward: 'Ward 21', district: 'Chennai', state: 'Tamil Nadu' },
  { id: 'loc_r07', label: 'Panchayat 7, Baramati Rural', ward: 'Panchayat 7', district: 'Pune', state: 'Maharashtra' },
]

export const NOTICES: Notice[] = [
  {
    id: 'not_water_shut',
    title: 'Water supply suspended 14–16 March, Ward 12',
    body:
      'The main feeder line at Shivajinagar will be shut for valve replacement from 06:00 on 14 March to 20:00 on 16 March.\n\nTankers will be stationed at the ward office, the municipal school ground and the bus depot from 07:00 to 19:00 each day. Households on the ground-floor supply in lanes 4 through 11 should store water for three days.\n\nIf your building has a booster pump, switch it off for the duration — running it dry damages the motor and the corporation does not cover that repair.',
    localityIds: ['loc_w12'],
    issuedBy: INSTITUTIONS[1],
    publishedAt: now - 2 * DAY,
    priority: 'time-critical',
    category: 'Water & Sanitation',
    attachmentLabel: 'Tanker schedule (PDF, 180 KB)',
  },
  {
    id: 'not_road',
    title: 'Road resurfacing, Kothrud main road — night work only',
    body:
      'Resurfacing between the Karve Road junction and the depot begins 20 March and runs for roughly three weeks.\n\nWork is restricted to 22:00–05:00 to keep the road open in daytime. Expect noise. One lane stays open throughout for ambulances and fire vehicles.\n\nShopfronts on the stretch will not be obstructed during trading hours. Any damage to a frontage should be reported at the ward office within seven days for assessment.',
    localityIds: ['loc_w03'],
    issuedBy: INSTITUTIONS[0],
    publishedAt: now - 5 * DAY,
    priority: 'important',
    category: 'Public Works',
  },
  {
    id: 'not_health',
    title: 'Free eye screening camp, 22 March',
    body:
      'The District Health Office is running a free screening camp for cataract and refractive error at the municipal school, 09:00 to 16:00.\n\nNo appointment and no documents are needed. Bring existing spectacles if you have them. Those found to need surgery will be referred to the district hospital under the state scheme, with no fee at the point of care.',
    localityIds: ['loc_w12', 'loc_r07'],
    issuedBy: INSTITUTIONS[2],
    publishedAt: now - 8 * DAY,
    priority: 'routine',
    category: 'Public Health',
  },
  {
    id: 'not_bus',
    title: 'Route 44C diverted from 1 April',
    body:
      'Route 44C will run via the flyover instead of the market road once the resurfacing begins. Two stops are suspended for the duration: Market Gate and Old Post Office.\n\nThe nearest alternative stops are Flyover North and Depot Gate, both about 400 metres away. The concessionary pass is valid on the diverted route without re-issue.',
    localityIds: ['loc_w03', 'loc_w12'],
    issuedBy: INSTITUTIONS[4],
    publishedAt: now - 12 * DAY,
    priority: 'important',
    category: 'Transport',
  },
  {
    id: 'not_retracted',
    title: 'Property tax rebate window extended to 31 March',
    body:
      'The early-payment rebate window was announced as extended to 31 March.',
    localityIds: ['loc_w12', 'loc_w03'],
    issuedBy: INSTITUTIONS[0],
    publishedAt: now - 20 * DAY,
    priority: 'important',
    category: 'Revenue',
    retracted: {
      at: now - 18 * DAY,
      reason:
        'Issued before the standing committee approved the extension. The original 15 March deadline stands. This notice is kept visible rather than deleted so the record of the error remains public.',
    },
  },
]

export const POLLS: Poll[] = [
  {
    id: 'poll_street_vendor',
    billTitle: 'State Street Vending (Regulation) Amendment Bill',
    plainSummary:
      'The bill would give each municipal ward a fixed number of licensed vending spots, allocated by lottery among registered vendors, and make trading outside a licensed spot a fineable offence.\n\nSupporters argue it ends the current arrangement where enforcement is discretionary and vendors pay to be left alone. Critics argue the number of spots proposed is far below the number of people currently vending, so the effect is to make most existing vendors illegal overnight.\n\nThe bill does not change the fine amounts, which are set separately by municipal by-law.',
    fullTextUrl: 'https://example.gov.in/bills/street-vending-amendment/full-text',
    fullTextLabel: 'Bill No. 14 of this session — full text, 31 pages',
    options: [
      { id: 'o1', label: 'Support as drafted' },
      { id: 'o2', label: 'Support only if the number of spots is raised' },
      { id: 'o3', label: 'Oppose — regularise existing vendors instead' },
      { id: 'o4', label: 'Not enough information to say' },
    ],
    opensAt: now - 6 * DAY,
    closesAt: now + 8 * DAY,
    localityIds: 'all',
    issuedBy: INSTITUTIONS[3],
    advisoryOnly: true,
    editWindowMs: 24 * 60 * 60 * 1000,
  },
  {
    id: 'poll_night_bus',
    billTitle: 'City night bus service — funding proposal',
    plainSummary:
      'The transport authority has costed a night bus service on six routes running 23:00 to 05:00. It cannot be funded from the existing budget.\n\nThree funding routes are on the table: a small rise in the daytime fare, a cut to the frequency of the least-used daytime routes, or a levy on late-licence commercial premises. The fourth option is to not run the service.\n\nWhichever is chosen goes to the standing committee as a recommendation, not a decision.',
    fullTextUrl: 'https://example.gov.in/transport/night-service-costing',
    fullTextLabel: 'Costing note and route plan, 12 pages',
    options: [
      { id: 'o1', label: 'Fund it from a daytime fare rise' },
      { id: 'o2', label: 'Fund it by cutting low-use daytime routes' },
      { id: 'o3', label: 'Fund it from a late-licence levy' },
      { id: 'o4', label: 'Do not run a night service' },
    ],
    opensAt: now - 15 * DAY,
    closesAt: now - 2 * DAY,
    localityIds: ['loc_w12', 'loc_w03', 'loc_w45'],
    issuedBy: INSTITUTIONS[4],
    advisoryOnly: true,
    editWindowMs: 24 * 60 * 60 * 1000,
  },
  {
    id: 'poll_ward_budget',
    billTitle: 'Ward 12 discretionary budget — where should it go?',
    plainSummary:
      'Ward 12 has ₹48 lakh of discretionary capital budget for the coming year. It is enough for roughly one substantial project, or two small ones.\n\nThe four options below were shortlisted by the ward committee from 61 public submissions. The full submission list, including the ones not shortlisted and the reason each was set aside, is linked in the full text.',
    fullTextUrl: 'https://example.gov.in/ward12/budget-submissions',
    fullTextLabel: 'All 61 submissions and shortlisting notes',
    options: [
      { id: 'o1', label: 'Covered drainage on lanes 4–11' },
      { id: 'o2', label: 'Rebuild the municipal school toilet block' },
      { id: 'o3', label: 'Street lighting on the market approach' },
      { id: 'o4', label: 'Footpath widening on the main road' },
    ],
    opensAt: now - 3 * DAY,
    closesAt: now + 18 * DAY,
    localityIds: ['loc_w12'],
    issuedBy: INSTITUTIONS[0],
    advisoryOnly: true,
    editWindowMs: 24 * 60 * 60 * 1000,
  },
]

/* Two polls attached to bills in `data/bills.ts`, so the chain a citizen
   actually walks — pipeline, bill, clause, view, debate — exists end to end
   rather than stopping at a bill with nothing to answer. */
POLLS.push(
  {
    id: 'poll_water_bill',
    billTitle: 'Municipal Water Supply (Continuity of Service) Bill',
    plainSummary:
      'The bill would require seventy-two hours’ notice before a planned water cut, and a published reason and restoration time within four hours of an unplanned one.\n\nThe argument is about clause 9. Utilities say reporting every missed restoration time to the regulator turns an operational problem into a compliance one. Residents’ associations say a deadline nobody is measured against is not a deadline.\n\nThe bill is with the standing committee. Nothing you answer here changes that; it is passed upward as a view.',
    fullTextUrl: 'https://sansad.in/ls',
    fullTextLabel: 'Bill No. 118 of 2026 — full text',
    options: [
      { id: 'o1', label: 'Support as drafted' },
      { id: 'o2', label: 'Support, but drop the reporting duty in clause 9' },
      { id: 'o3', label: 'Support, and go further — publish the record openly' },
      { id: 'o4', label: 'Oppose' },
    ],
    opensAt: now - 9 * DAY,
    closesAt: now + 11 * DAY,
    localityIds: 'all',
    issuedBy: INSTITUTIONS[3],
    advisoryOnly: true,
    editWindowMs: 24 * 60 * 60 * 1000,
  },
  {
    id: 'poll_roads_bill',
    billTitle: 'Road Excavation (Coordination and Restoration) Bill',
    plainSummary:
      'The bill would make it unlawful to dig a public road without a permit, and would refuse a permit unless the work was registered a fortnight in advance and no other agency had booked the same stretch.\n\nClause 11 is the one under dispute: it requires the authority to publish restoration dates promised against dates achieved. Departments argue this will be read as a league table. The counter-argument is that it is the only clause that makes the rest enforceable.\n\nThe bill has passed both Houses and awaits assent, so this is a view on a bill that is nearly law rather than one being drafted.',
    fullTextUrl: 'https://sansad.in/ls',
    fullTextLabel: 'Bill No. 74 of 2026 — full text as passed',
    options: [
      { id: 'o1', label: 'Support, including the published record' },
      { id: 'o2', label: 'Support, but the record should stay internal' },
      { id: 'o3', label: 'Fourteen days’ notice is too long for emergency work' },
      { id: 'o4', label: 'Oppose' },
    ],
    opensAt: now - 20 * DAY,
    closesAt: now + 4 * DAY,
    localityIds: 'all',
    issuedBy: INSTITUTIONS[1],
    advisoryOnly: true,
    editWindowMs: 24 * 60 * 60 * 1000,
  },
)

export const TOPICS: Topic[] = [
  {
    id: 'top_vendor',
    title: 'Street Vending Amendment Bill',
    anchor: { kind: 'poll', id: 'poll_street_vendor' },
    createdAt: now - 6 * DAY,
  },
  {
    id: 'top_budget',
    title: 'Ward 12 discretionary budget',
    anchor: { kind: 'poll', id: 'poll_ward_budget' },
    createdAt: now - 3 * DAY,
  },
  {
    id: 'top_water_bill',
    title: 'Water Supply (Continuity of Service) Bill — clause 9',
    anchor: { kind: 'poll', id: 'poll_water_bill' },
    createdAt: now - 9 * DAY,
  },
  {
    id: 'top_roads_bill',
    title: 'Road Excavation Bill — publishing the restoration record',
    anchor: { kind: 'poll', id: 'poll_roads_bill' },
    createdAt: now - 20 * DAY,
  },
  {
    id: 'top_water',
    title: 'Three-day water shutdown in Ward 12',
    anchor: { kind: 'notice', id: 'not_water_shut' },
    createdAt: now - 2 * DAY,
  },
]

export const POSTS: Post[] = [
  /* The two bill threads. Written to be argued with rather than agreed with:
     balanced ordering only demonstrates anything on a thread that actually
     disagrees with itself. */
  {
    id: 'pb1', topicId: 'top_water_bill', authorPseudonym: 'NorthernAlmanac417',
    body: 'Clause 9 is the only part of this bill with teeth and it is the part the utilities are lobbying to remove. Three misses a quarter is not a hard bar. If they cannot clear it, the reporting is not the problem.',
    stance: 'support', createdAt: now - 8 * DAY, agree: 268, disagree: 41,
  },
  {
    id: 'pb2', topicId: 'top_water_bill', authorPseudonym: 'CarefulMillstone129',
    body: 'I work in a municipal water office. We miss restoration times because a contractor did not turn up or the part came from another district, not because nobody is watching. A report to the regulator does not put water in the pipe and it takes an engineer half a day to file.',
    stance: 'oppose', createdAt: now - 8 * DAY, agree: 191, disagree: 96,
  },
  {
    id: 'pb3', topicId: 'top_water_bill', authorPseudonym: 'RiversideCompass860',
    body: 'Both of those are true at once. Report it, but make the form take five minutes and let the reason be "contractor did not attend" — then the regulator learns something instead of collecting paperwork.',
    stance: 'mixed', createdAt: now - 7 * DAY, agree: 344, disagree: 22,
  },
  {
    id: 'pb4', topicId: 'top_water_bill', authorPseudonym: 'OpenSparrow552',
    body: 'Does clause 9 apply to a private operator running a municipal contract, or only to the utility itself? Half the supply in my ward is contracted out and I cannot tell from the drafting.',
    stance: 'question', createdAt: now - 6 * DAY, agree: 158, disagree: 3,
  },
  {
    id: 'pb5', topicId: 'top_roads_bill', authorPseudonym: 'DistantHarbour733',
    body: 'Clause 11 is the whole bill. A permit system without a published record is a filing cabinet. We have had the filing cabinet since 2011 and the road outside my house has been dug four times in two years.',
    stance: 'support', createdAt: now - 18 * DAY, agree: 402, disagree: 28,
  },
  {
    id: 'pb6', topicId: 'top_roads_bill', authorPseudonym: 'BrightLedger288',
    body: 'Fourteen days is unworkable for a burst main. The emergency exception in clause 5 is one sentence and does not say who decides what counts as an emergency, which means in practice everything will be filed as one.',
    stance: 'oppose', createdAt: now - 17 * DAY, agree: 233, disagree: 64,
  },
  {
    id: 'pb7', topicId: 'top_roads_bill', authorPseudonym: 'PatientWeaver905',
    body: 'Support the record, but publish it per stretch of road rather than per department. A league table gets argued about; a street that has been dug six times gets fixed.',
    stance: 'mixed', createdAt: now - 15 * DAY, agree: 287, disagree: 35,
  },
  {
    id: 'p1', topicId: 'top_vendor', authorPseudonym: 'QuietBanyan204',
    body: 'The lottery sounds fair until you notice there are 40 spots proposed for a ward with about 300 people vending. That is not regulation, it is eviction with extra steps.',
    stance: 'oppose', createdAt: now - 5 * DAY, agree: 214, disagree: 31,
  },
  {
    id: 'p2', topicId: 'top_vendor', authorPseudonym: 'SteadyLantern881',
    body: 'I run a shop on that road and pay rent, rates and a trade licence. Someone selling the same goods two metres from my door pays none of it. I am not against vendors, I am against there being one rule for me and none for them.',
    stance: 'support', createdAt: now - 5 * DAY, agree: 176, disagree: 88,
  },
  {
    id: 'p3', topicId: 'top_vendor', authorPseudonym: 'MonsoonFerry553',
    body: 'Both of those can be true. The honest fix is more licensed spots AND enforcement that actually applies. The bill does one and calls it both.',
    stance: 'mixed', createdAt: now - 4 * DAY, agree: 302, disagree: 19,
  },
  {
    id: 'p4', topicId: 'top_vendor', authorPseudonym: 'AmberCompass310',
    body: 'Does anyone know whether the 40 figure is fixed in the bill or set by rules afterwards? It changes the whole question and I could not find it in the 31 pages.',
    stance: 'question', createdAt: now - 4 * DAY, agree: 141, disagree: 2,
  },
  {
    id: 'p5', topicId: 'top_vendor', authorPseudonym: 'IronwoodKite742',
    body: 'Section 4(2), it is set by rules. So the number everyone is arguing about is not actually in the thing being voted on.',
    stance: 'mixed', createdAt: now - 3 * DAY, agree: 288, disagree: 6,
  },
  {
    id: 'p6', topicId: 'top_vendor', authorPseudonym: 'CoastalLedger119',
    body: 'Then the poll option "support only if spots are raised" is meaningless — you would be supporting a bill that does not set the number either way.',
    stance: 'oppose', createdAt: now - 3 * DAY, agree: 197, disagree: 24,
  },
  {
    id: 'p7', topicId: 'top_budget', authorPseudonym: 'NorthernSparrow628',
    body: 'Drainage. Every monsoon lanes 4 to 11 flood and every year we are told it is next year. The school toilets matter but they do not put water through people\'s houses.',
    stance: 'support', createdAt: now - 2 * DAY, agree: 156, disagree: 12,
  },
  {
    id: 'p8', topicId: 'top_budget', authorPseudonym: 'PatientHarbour407',
    body: 'The toilet block has been broken for two years and about 400 girls use that school. Ask them which one they would pick.',
    stance: 'oppose', createdAt: now - 2 * DAY, agree: 203, disagree: 18,
  },
  {
    id: 'p9', topicId: 'top_budget', authorPseudonym: 'OpenCedar515',
    body: 'Genuine question — is ₹48 lakh actually enough for the drainage, or does it half-fund it and then stall like the last one did?',
    stance: 'question', createdAt: now - 1 * DAY, agree: 98, disagree: 3,
  },
  {
    id: 'p10', topicId: 'top_water', authorPseudonym: 'BrightWeaver866',
    body: 'Three days is a long time on the ground floor supply. Are the tankers actually going to run to 19:00, or stop at 15:00 like in December?',
    stance: 'question', createdAt: now - 1 * DAY, agree: 87, disagree: 1,
  },
  {
    id: 'p11', topicId: 'top_water', authorPseudonym: 'DistantSignal733',
    body: 'Posting the tanker schedule as a PDF is not much use on a slow connection. The timings should be in the notice text itself.',
    stance: 'mixed', createdAt: now - 20 * 60 * 60 * 1000, agree: 164, disagree: 4,
  },
  {
    id: 'p12', topicId: 'top_water', authorPseudonym: 'CarefulBell298',
    body: 'Removed for abuse.',
    stance: 'oppose', createdAt: now - 18 * 60 * 60 * 1000, agree: 0, disagree: 0,
    removed: { at: now - 17 * 60 * 60 * 1000, reason: 'Personal abuse directed at a named official' },
  },
]

export const BRIGADING_FLAGS: BrigadingFlag[] = [
  {
    id: 'bf1',
    subject: 'Poll: State Street Vending (Regulation) Amendment Bill',
    signal: 'Response burst',
    detail:
      '340 responses arrived in 11 minutes, 92% choosing option 1, from accounts verified within the last 48 hours. Normal rate for this poll is roughly 20 an hour with no option above 45%.',
    raisedAt: now - 1 * DAY,
    status: 'awaiting-review',
  },
  {
    id: 'bf2',
    subject: 'Topic: Ward 12 discretionary budget',
    signal: 'Near-duplicate text',
    detail:
      '17 posts share 90%+ text similarity with small word substitutions. Posted across 4 hours from distinct pseudonyms.',
    raisedAt: now - 2 * DAY,
    status: 'awaiting-review',
  },
  {
    id: 'bf3',
    subject: 'Poll: City night bus service',
    signal: 'Reaction pattern',
    detail:
      'Cleared on review. The burst traced to a local radio programme discussing the poll, not coordination — response spread across options was normal.',
    raisedAt: now - 9 * DAY,
    status: 'cleared',
  },
]

/** Pre-existing aggregate weight so demo charts are not built from one vote. */
export const SEED_TALLIES: Record<string, Record<string, number>> = {
  poll_street_vendor: { o1: 1840, o2: 3120, o3: 4410, o4: 980 },
  poll_night_bus: { o1: 2210, o2: 640, o3: 3980, o4: 1170 },
  poll_ward_budget: { o1: 412, o2: 388, o3: 96, o4: 71 },
}

export const SEED_COVERAGE: Record<string, { eligible: number; reachable: number }> = {
  poll_street_vendor: { eligible: 2_400_000, reachable: 186_000 },
  poll_night_bus: { eligible: 890_000, reachable: 71_400 },
  poll_ward_budget: { eligible: 31_200, reachable: 4_900 },
}
