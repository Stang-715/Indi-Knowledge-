/**
 * Data access. Everything the UI reads goes through here.
 *
 * This is a local mock standing in for the server API, but the shape is the
 * contract: note that no function takes or returns a real identity, and the
 * government-facing reads (`pollAggregate`, `noticeReach`, `sentiment`) return
 * aggregates rather than rows. Swapping the body of this file for HTTP calls
 * should not require any caller to change.
 */

import { appendAudit } from '../core/audit'
import { aggregateBy, type Aggregate, type Coverage } from '../core/aggregate'
import { getPseudonym, mayParticipate } from '../core/identity'
import { hasConsent, loadConsent, type PurposeId } from '../core/consent'

/**
 * Consent enforced at the data layer rather than in the screens.
 *
 * A check in a component is a check one new code path walks around. Putting it
 * on the write itself means a refusal holds however the app grows — the same
 * reasoning as the architectural constraints, applied to the thing the citizen
 * actually decided.
 */
export class ConsentRequiredError extends Error {
  readonly purpose: PurposeId

  constructor(purpose: PurposeId) {
    super(`Refused: no consent recorded for "${purpose}".`)
    this.name = 'ConsentRequiredError'
    this.purpose = purpose
  }
}

export class ParticipationError extends Error {
  constructor() {
    super('Reading only: participation begins at eighteen.')
    this.name = 'ParticipationError'
  }
}

function requireConsent(purpose: PurposeId): void {
  if (!hasConsent(loadConsent(), purpose)) throw new ConsentRequiredError(purpose)
}

/** Whether the app should offer an action at all, so it can explain instead of failing. */
export function canDo(purpose: PurposeId): boolean {
  return mayParticipate() && hasConsent(loadConsent(), purpose)
}
import { read, write } from '../core/storage'
import { enqueue, isPending } from '../core/sync'
import {
  cachedPosts, cachedReach, cachedStores, cachedTally, pullPosts, pullReach,
  pullStores, pullTally,
} from '../core/pull'
import type {
  BrigadingFlag, Notice, Poll, Post, Report, ReportReason, Stance, Topic,
} from '../core/types'
import {
  BRIGADING_FLAGS, NOTICES, POLLS, POSTS, SEED_COVERAGE, SEED_TALLIES, TOPICS,
} from './seed'
import { BILLS, CONSTITUENCIES, REPRESENTATIVES, VOTE_RECORDS } from './bills'
import { CONSTITUTION } from './constitution'
import { BRANDS, FLOWS, THROUGHPUT, WEATHER } from './bharat'
import { PROFILES, STATES } from './states'
import type {
  Brand, CommodityFlow, PortThroughput, Sector, StateProfile, StateRef, Store,
  StoreCategory, WeatherReading,
} from '../core/bharat'
import { DEPARTMENTS, STRETCHES, WORKS } from './works'
import {
  departmentRecord, isLive, stateOf, stretchesForStreet,
  type Department, type DepartmentRecord, type Stretch, type Work,
} from '../core/works'
import {
  constituenciesForDistrict, hasEnded, searchConstituencies, STAGES,
  type Bill, type Clause, type Constituency, type ConstitutionData,
  type Representative, type Stage, type VoteRecord,
} from '../core/legislation'

/* ---------------------------------- notices --------------------------------- */

export function listNotices(localityIds?: string[]): Notice[] {
  const extra = read<Notice[]>('content', 'notices', [])
  const all = [...extra, ...NOTICES]
  const scoped =
    localityIds && localityIds.length > 0
      ? all.filter((n) => n.localityIds.some((l) => localityIds.includes(l)))
      : all
  return scoped.sort((a, b) => b.publishedAt - a.publishedAt)
}

export function getNotice(id: string): Notice | undefined {
  return listNotices().find((n) => n.id === id)
}

export function publishNotice(notice: Notice): void {
  const extra = read<Notice[]>('content', 'notices', [])
  write('content', 'notices', [notice, ...extra])
  appendAudit({
    actorKind: 'gov',
    actor: notice.issuedBy.name,
    action: 'notice.publish',
    scope: notice.localityIds.join(', ') || 'all',
    detail: `Published "${notice.title}" at priority ${notice.priority}`,
  })
}

export function retractNotice(id: string, reason: string): void {
  const extra = read<Notice[]>('content', 'notices', [])
  const idx = extra.findIndex((n) => n.id === id)
  const retraction = { at: Date.now(), reason }
  if (idx >= 0) {
    extra[idx] = { ...extra[idx], retracted: retraction }
    write('content', 'notices', extra)
  } else {
    // Seed notice — record the retraction as an overlay rather than mutating.
    const overlay = read<Record<string, { at: number; reason: string }>>(
      'content', 'retractions', {},
    )
    overlay[id] = retraction
    write('content', 'retractions', overlay)
  }
  appendAudit({
    actorKind: 'gov',
    actor: getNotice(id)?.issuedBy.name ?? 'unknown institution',
    action: 'notice.retract',
    scope: id,
    detail: 'Notice retracted. Kept publicly visible, marked retracted.',
  })
}

export function retractionOverlay(): Record<string, { at: number; reason: string }> {
  return read('content', 'retractions', {})
}

/* -------------------------------- seen counts -------------------------------- */

/**
 * Acknowledgement is stored as a bare counter plus a local flag. There is no
 * per-citizen read receipt anywhere, because there is no per-citizen row here
 * to build one from (3.2).
 */
export function markSeen(noticeId: string): void {
  // A reach count is the mildest thing here and still asked for separately.
  requireConsent('reach-count')
  const counts = read<Record<string, number>>('content', 'seen', {})
  counts[noticeId] = (counts[noticeId] ?? 0) + 1
  write('content', 'seen', counts)
  enqueue('seen', noticeId, { noticeId })
}

const BASE_REACH: Record<string, number> = {
  not_water_shut: 14_206, not_road: 5_881, not_health: 3_402,
  not_bus: 7_733, not_retracted: 9_120,
}

export function noticeReach(noticeId: string): number {
  void pullReach(noticeId)
  const counts = read<Record<string, number>>('content', 'seen', {})
  // The server's counter is authoritative once it has been fetched; before
  // that, the local tally is the best this device can honestly say.
  const seen = cachedReach(noticeId) ?? counts[noticeId] ?? 0
  return (BASE_REACH[noticeId] ?? 0) + seen
}

/* ----------------------------------- polls ---------------------------------- */

export function listPolls(): Poll[] {
  const extra = read<Poll[]>('content', 'polls', [])
  return [...extra, ...POLLS].sort((a, b) => b.opensAt - a.opensAt)
}

export function getPoll(id: string): Poll | undefined {
  return listPolls().find((p) => p.id === id)
}

export function publishPoll(poll: Poll): void {
  if (poll.options.length > 4) {
    throw new Error('A poll may carry at most 4 options (spec 9.3).')
  }
  const extra = read<Poll[]>('content', 'polls', [])
  write('content', 'polls', [poll, ...extra])
  appendAudit({
    actorKind: 'gov',
    actor: poll.issuedBy.name,
    action: 'poll.publish',
    scope: poll.id,
    detail: `Advisory poll opened: "${poll.billTitle}"`,
  })
}

export function isOpen(poll: Poll): boolean {
  const t = Date.now()
  return t >= poll.opensAt && t <= poll.closesAt
}

/* ---------------------------------- voting ---------------------------------- */

export interface Response {
  /** The only identity on a response. Never an ID hash, never a device id. */
  pseudonym: string
  optionId: string
  at: number
}

function responseKey(pollId: string) {
  return `poll:${pollId}`
}

export function myResponse(pollId: string): Response | null {
  const pseudonym = getPseudonym()
  if (!pseudonym) return null
  const rows = read<Response[]>('responses', responseKey(pollId), [])
  return rows.find((r) => r.pseudonym === pseudonym) ?? null
}

export function castVote(pollId: string, optionId: string): Response {
  if (!mayParticipate()) throw new ParticipationError()
  requireConsent('poll-response')
  const pseudonym = getPseudonym()
  if (!pseudonym) throw new Error('No pseudonym — cannot record a response.')
  const rows = read<Response[]>('responses', responseKey(pollId), [])
  // Overwrite, never append: one voice, one response (4.3).
  const without = rows.filter((r) => r.pseudonym !== pseudonym)
  const response: Response = { pseudonym, optionId, at: Date.now() }
  write('responses', responseKey(pollId), [...without, response])
  // Queued rather than sent: the vote is recorded here and now, whether or not
  // there is a connection, and travels when there is one.
  enqueue('vote', responseKey(pollId), { pollId, optionId })
  return response
}

export function withinEditWindow(poll: Poll, response: Response | null): boolean {
  if (!response) return false
  return Date.now() - response.at < poll.editWindowMs && isOpen(poll)
}

/**
 * The aggregation boundary for a poll. Callers on the government side get this
 * and only this — there is no exported function returning individual responses.
 */
export function pollAggregate(pollId: string): Aggregate {
  const poll = getPoll(pollId)
  if (!poll) return { total: 0, buckets: [], suppressed: 0 }

  void pullTally(pollId)
  const server = cachedTally(pollId)
  const rows = read<Response[]>('responses', responseKey(pollId), [])

  /* Where the server has answered, its tally is everyone's; this device's own
     response is already inside it, and adding the local row again would count
     one citizen twice. The exception is a vote still sitting in the queue —
     that one is real, and nowhere else yet. */
  const local = server
    ? (isPending('vote', responseKey(pollId)) ? rows.slice(-1) : [])
    : rows

  const live = aggregateBy(
    local,
    (r) => r.pseudonym,
    (r) => {
      const opt = poll.options.find((o) => o.id === r.optionId)
      return { key: r.optionId, label: opt?.label ?? r.optionId }
    },
  )

  // Fold in the historical tally so the demo reads like a real poll.
  const seeded = SEED_TALLIES[pollId] ?? {}
  const merged = new Map<string, { key: string; label: string; count: number }>()
  for (const option of poll.options) {
    merged.set(option.id, {
      key: option.id,
      label: option.label,
      count: seeded[option.id] ?? 0,
    })
  }
  for (const bucket of server?.buckets ?? []) {
    const target = merged.get(bucket.key)
    if (target) target.count += bucket.count
  }
  for (const bucket of live.buckets) {
    const target = merged.get(bucket.key)
    if (target) target.count += bucket.count
    else merged.set(bucket.key, bucket)
  }

  const buckets = [...merged.values()].sort((a, b) => b.count - a.count)
  const total = buckets.reduce((s, b) => s + b.count, 0)
  const base = SEED_COVERAGE[pollId]
  const coverage: Coverage | undefined = base
    ? { ...base, responded: total }
    : undefined

  return {
    total,
    buckets,
    suppressed: (server?.suppressed ?? 0) + live.suppressed,
    coverage,
  }
}

/* -------------------------------- discussion -------------------------------- */

export function listTopics(): Topic[] {
  const extra = read<Topic[]>('content', 'topics', [])
  return [...extra, ...TOPICS].sort((a, b) => b.createdAt - a.createdAt)
}

export function getTopic(id: string): Topic | undefined {
  return listTopics().find((t) => t.id === id)
}

export function topicForAnchor(kind: 'notice' | 'poll', id: string): Topic | undefined {
  return listTopics().find((t) => t.anchor.kind === kind && t.anchor.id === id)
}

export function listPosts(topicId: string): Post[] {
  void pullPosts(topicId)
  const extra = read<Post[]>('content', 'posts', [])
  const removals = read<Record<string, { at: number; reason: string }>>(
    'content', 'postRemovals', {},
  )

  /* Server rows win over the local copy of the same post, because they carry
     everyone's reactions rather than only this device's optimistic zero. They
     match by id because the id was chosen here before the post was sent. */
  const byId = new Map<string, Post>()
  for (const p of extra) if (p.topicId === topicId) byId.set(p.id, p)
  for (const row of cachedPosts(topicId) ?? []) {
    byId.set(row.id, {
      id: row.id,
      topicId,
      authorPseudonym: row.pseudonym,
      body: row.body,
      stance: row.stance as Stance,
      createdAt: row.created_at,
      agree: row.agree,
      disagree: row.disagree,
      ...(row.removed_at
        ? { removed: { at: row.removed_at, reason: row.removed_reason ?? '' } }
        : {}),
    })
  }

  const merged = [...byId.values()].sort((a, b) => b.createdAt - a.createdAt)
  return [...merged, ...POSTS.filter((p) => p.topicId === topicId)]
    .map((p) => (removals[p.id] ? { ...p, removed: removals[p.id] } : p))
}

export function addPost(
  topicId: string, body: string, stance: Stance,
): Post {
  if (!mayParticipate()) throw new ParticipationError()
  requireConsent('public-speech')
  const pseudonym = getPseudonym()
  if (!pseudonym) throw new Error('No pseudonym — cannot post.')
  const post: Post = {
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    topicId,
    authorPseudonym: pseudonym,
    body,
    stance,
    createdAt: Date.now(),
    agree: 0,
    disagree: 0,
  }
  const extra = read<Post[]>('content', 'posts', [])
  write('content', 'posts', [post, ...extra])
  // The id is chosen here and sent with the post, so a retry after a dropped
  // connection is the same post rather than a second one.
  enqueue('post', post.id, { id: post.id, topicId, text: body, stance })
  return post
}

export function react(postId: string, kind: 'agree' | 'disagree'): void {
  if (!canDo('public-speech')) return
  const pseudonym = getPseudonym()
  if (!pseudonym) return
  // One reaction per account per post — enforced by storing the choice, not a count.
  const mine = read<Record<string, 'agree' | 'disagree'>>('responses', 'reactions', {})
  const previous = mine[postId]
  if (previous === kind) delete mine[postId]
  else mine[postId] = kind
  write('responses', 'reactions', mine)
  enqueue('reaction', postId, { postId, kind: mine[postId] ?? 'none' })
}

export function myReaction(postId: string): 'agree' | 'disagree' | undefined {
  return read<Record<string, 'agree' | 'disagree'>>('responses', 'reactions', {})[postId]
}

export function reactionDelta(post: Post): { agree: number; disagree: number } {
  const mine = myReaction(post.id)
  return {
    agree: post.agree + (mine === 'agree' ? 1 : 0),
    disagree: post.disagree + (mine === 'disagree' ? 1 : 0),
  }
}

export function removePost(postId: string, reason: string): void {
  const removals = read<Record<string, { at: number; reason: string }>>(
    'content', 'postRemovals', {},
  )
  removals[postId] = { at: Date.now(), reason }
  write('content', 'postRemovals', removals)
  appendAudit({
    actorKind: 'gov',
    actor: 'Moderation console',
    action: 'post.remove',
    scope: postId,
    detail: `Post removed. Reason recorded: ${reason}`,
  })
}

/**
 * Sentiment summary for 10.2. Stance counts and nothing else — no post bodies,
 * no pseudonyms, no per-author breakdown crosses this line.
 */
export function sentiment(topicId: string): Aggregate {
  const posts = listPosts(topicId).filter((p) => !p.removed)
  const labels: Record<Stance, string> = {
    support: 'Support', oppose: 'Oppose', mixed: 'Mixed', question: 'Question',
  }
  return aggregateBy(
    posts,
    (p) => p.id,
    (p) => ({ key: p.stance, label: labels[p.stance] }),
  )
}

/* --------------------------------- reports ---------------------------------- */

export function fileReport(
  target: { kind: 'notice' | 'post'; id: string },
  reason: ReportReason,
  note: string,
): void {
  const reports = read<Report[]>('content', 'reports', [])
  reports.unshift({
    id: `r_${Date.now().toString(36)}`,
    target, reason, note,
    createdAt: Date.now(),
    status: 'open',
  })
  write('content', 'reports', reports)
  appendAudit({
    actorKind: 'automated',
    actor: 'Report intake',
    action: 'report.filed',
    scope: `${target.kind}:${target.id}`,
    detail: `Report queued for human review (${reason}). Reporter identity not recorded.`,
  })
}

export function listReports(kind?: 'notice' | 'post'): Report[] {
  const stored = read<Report[]>('content', 'reports', [])
  const seeded: Report[] = [
    {
      id: 'r_seed1',
      target: { kind: 'notice', id: 'not_water_shut' },
      reason: 'fake-notice',
      note: 'Circulating on messaging apps with different tanker timings and a payment link.',
      createdAt: Date.now() - 6 * 60 * 60 * 1000,
      status: 'open',
    },
    {
      id: 'r_seed2',
      target: { kind: 'post', id: 'p12' },
      reason: 'abuse',
      note: 'Names an official and threatens them.',
      createdAt: Date.now() - 19 * 60 * 60 * 1000,
      status: 'removed',
    },
    {
      id: 'r_seed3',
      target: { kind: 'post', id: 'p2' },
      reason: 'coordinated',
      note: 'Reported 40 times in 5 minutes.',
      createdAt: Date.now() - 30 * 60 * 60 * 1000,
      status: 'dismissed',
    },
  ]
  const all = [...stored, ...seeded]
  return kind ? all.filter((r) => r.target.kind === kind) : all
}

export function resolveReport(id: string, status: 'removed' | 'dismissed'): void {
  const stored = read<Report[]>('content', 'reports', [])
  const idx = stored.findIndex((r) => r.id === id)
  if (idx >= 0) {
    stored[idx] = { ...stored[idx], status }
    write('content', 'reports', stored)
  } else {
    const overrides = read<Record<string, 'removed' | 'dismissed'>>(
      'content', 'reportOverrides', {},
    )
    overrides[id] = status
    write('content', 'reportOverrides', overrides)
  }
  appendAudit({
    actorKind: 'gov',
    actor: 'Moderation console',
    action: `report.${status}`,
    scope: id,
    detail: `Report resolved as ${status} by a human moderator.`,
  })
}

export function reportOverrides(): Record<string, 'removed' | 'dismissed'> {
  return read('content', 'reportOverrides', {})
}

/* ------------------------------- anti-brigading ------------------------------ */

export function listFlags(): BrigadingFlag[] {
  const overrides = read<Record<string, BrigadingFlag['status']>>(
    'content', 'flagStatus', {},
  )
  return BRIGADING_FLAGS.map((f) =>
    overrides[f.id] ? { ...f, status: overrides[f.id] } : f,
  )
}

export function setFlagStatus(id: string, status: BrigadingFlag['status']): void {
  const overrides = read<Record<string, BrigadingFlag['status']>>(
    'content', 'flagStatus', {},
  )
  overrides[id] = status
  write('content', 'flagStatus', overrides)
  appendAudit({
    actorKind: 'gov',
    actor: 'Moderation console',
    action: 'brigading.review',
    scope: id,
    detail: `Flag marked ${status} after human review. No automated action was taken.`,
  })
}

/* ---------------------------------- search ---------------------------------- */

export interface SearchHit {
  kind: 'notice' | 'poll' | 'topic'
  id: string
  title: string
  snippet: string
}

export function search(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits: SearchHit[] = []

  for (const n of listNotices()) {
    if (`${n.title} ${n.body} ${n.category}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'notice', id: n.id, title: n.title, snippet: n.category })
    }
  }
  for (const p of listPolls()) {
    if (`${p.billTitle} ${p.plainSummary}`.toLowerCase().includes(q)) {
      hits.push({
        kind: 'poll', id: p.id, title: p.billTitle,
        snippet: p.plainSummary.slice(0, 120) + '…',
      })
    }
  }
  for (const t of listTopics()) {
    if (t.title.toLowerCase().includes(q)) {
      hits.push({ kind: 'topic', id: t.id, title: t.title, snippet: 'Discussion' })
    }
  }
  return hits
}

/* -------------------------- Surface 3 — legislation ------------------------- */

/**
 * The legislative reads.
 *
 * Same rule as everything else here: aggregates and records out, no identity in
 * or out. Two additions specific to this surface —
 *
 *   - every record carries its provenance and the time it was read, so a screen
 *     can show what it is looking at rather than implying certainty it does not
 *     have;
 *   - nothing takes a position, a coordinate or a device signal. A constituency
 *     is found by asking or from a locality the citizen typed.
 */

export function listBills(): Bill[] {
  return [...BILLS].sort((a, b) => b.introducedAt - a.introducedAt)
}

export function getBill(id: string): Bill | undefined {
  return BILLS.find((b) => b.id === id)
}

/** Bills grouped by where they are, in the order the stages actually happen. */
export function pipeline(): { stage: Stage; bills: Bill[] }[] {
  const live = listBills().filter((b) => !hasEnded(b))
  return STAGES.map((stage) => ({
    stage,
    bills: live.filter((b) => b.stage === stage),
  }))
}

export function endedBills(): Bill[] {
  return listBills().filter(hasEnded)
}

export function getClause(billId: string, clauseId: string): Clause | undefined {
  return getBill(billId)?.clauses.find((c) => c.id === clauseId)
}

/** Full-text-ish search across bills, for the surface's own search. */
export function searchBills(query: string): Bill[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return listBills().filter((b) =>
    `${b.title} ${b.citation} ${b.ministry} ${b.plainSummary ?? ''}`.toLowerCase().includes(q),
  )
}

/* ---- the Constitution ---- */

export interface ConstitutionHit {
  kind: 'part' | 'article' | 'schedule' | 'amendment'
  id: string
  title: string
  detail: string
}

export function constitution(): ConstitutionData {
  return CONSTITUTION
}

export function searchConstitution(query: string): ConstitutionHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits: ConstitutionHit[] = []

  for (const p of CONSTITUTION.parts) {
    if (`part ${p.roman} ${p.title} ${p.subject}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'part', id: p.roman, title: `Part ${p.roman} — ${p.title}`, detail: p.subject })
    }
  }
  for (const a of CONSTITUTION.articles) {
    if (`article ${a.number} ${a.heading} ${a.gist}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'article', id: a.number, title: `Article ${a.number} — ${a.heading}`, detail: a.gist })
    }
  }
  for (const s of CONSTITUTION.schedules) {
    if (`${s.title} ${s.subject}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'schedule', id: String(s.number), title: s.title, detail: s.subject })
    }
  }
  for (const a of CONSTITUTION.amendments) {
    if (`${a.shortTitle} ${a.effect} ${a.year} ${a.number}`.toLowerCase().includes(q)) {
      hits.push({
        kind: 'amendment', id: String(a.number),
        title: `${a.shortTitle} (${a.year})`, detail: a.effect,
      })
    }
  }
  return hits
}

/* ---- constituency and representation ---- */

export function listConstituencies(): Constituency[] {
  return CONSTITUENCIES
}

export function findConstituencies(query: string): Constituency[] {
  return searchConstituencies(CONSTITUENCIES, query)
}

/**
 * Constituencies suggested from the localities the citizen stated in settings.
 *
 * This is a string match against a district they typed. It is not a lookup, not
 * a geocode, and there is nothing on the device it could read instead — which
 * is the whole point of storing a stated locality in the first place.
 */
export function constituenciesFromStatedLocalities(districts: string[]): Constituency[] {
  const seen = new Set<string>()
  const out: Constituency[] = []
  for (const district of districts) {
    for (const c of constituenciesForDistrict(CONSTITUENCIES, district)) {
      if (!seen.has(c.id)) { seen.add(c.id); out.push(c) }
    }
  }
  return out
}

export function getConstituency(id: string): Constituency | undefined {
  return CONSTITUENCIES.find((c) => c.id === id)
}

export function representativeFor(constituencyId: string): Representative | undefined {
  return REPRESENTATIVES.find((r) => r.constituencyId === constituencyId)
}

/**
 * How a representative voted, per bill.
 *
 * A bill with no row is not an abstention and not an absence — it is a bill on
 * which no division was called, which is how most business passes. The caller
 * gets `not-recorded` for those, explicitly, so no screen can render silence as
 * a position.
 */
export function votingRecord(representativeId: string): {
  bill: Bill; record: VoteRecord | null
}[] {
  return listBills().map((bill) => ({
    bill,
    record: VOTE_RECORDS.find(
      (v) => v.representativeId === representativeId && v.billId === bill.id,
    ) ?? null,
  }))
}

/** The pseudonymous view on a bill, where one is attached. */
export function billAggregate(bill: Bill): Aggregate | null {
  return bill.pollId ? pollAggregate(bill.pollId) : null
}

/* ---------------------------- Surface 4 — works ---------------------------- */

/**
 * The works reads.
 *
 * Every function here takes a street name or an id. None takes a position, and
 * there is nothing on the device it could read instead — which is the point of
 * asking a citizen to type their street rather than offering to find it.
 */

export function listWorks(): Work[] {
  return [...WORKS].sort((a, b) => a.restoreBy - b.restoreBy)
}

export function getWork(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id)
}

export function listStretches(): Stretch[] {
  return STRETCHES
}

export function getStretch(id: string): Stretch | undefined {
  return STRETCHES.find((s) => s.id === id)
}

export function listDepartments(): Department[] {
  return DEPARTMENTS
}

export function getDepartment(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id)
}

/** 4.1 — what is dug, closed or planned right now. */
export function liveWorks(): Work[] {
  return listWorks().filter((w) => isLive(w))
}

/**
 * 4.5 — what is happening on the streets a citizen follows.
 *
 * Matching is loose on purpose. Somebody who types "MG Rd" is telling you the
 * street they live on; answering with an empty screen because the gazetteer
 * says "Mahatma Gandhi Road" teaches them the app does not know their area.
 */
export function worksOnStreet(street: string): Work[] {
  const ids = new Set(stretchesForStreet(STRETCHES, street).map((s) => s.id))
  return listWorks().filter((w) => ids.has(w.stretchId))
}

export function worksOnFollowed(streets: { name: string }[]): Work[] {
  const seen = new Set<string>()
  const out: Work[] = []
  for (const street of streets) {
    for (const work of worksOnStreet(street.name)) {
      if (!seen.has(work.id)) { seen.add(work.id); out.push(work) }
    }
  }
  return out.sort((a, b) => a.restoreBy - b.restoreBy)
}

/**
 * Works worth interrupting somebody for: a full closure starting on a followed
 * street, or a commitment on one that has just been missed. The filter runs on
 * the device against streets stored on the device.
 */
export function alertsOnFollowed(streets: { name: string }[]): Work[] {
  return worksOnFollowed(streets).filter((w) => {
    const state = stateOf(w)
    return (state === 'open' && w.closure === 'full') || state === 'overrun'
  })
}

export function streetSuggestions(query: string): Stretch[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const seen = new Set<string>()
  return STRETCHES.filter((s) => {
    if (!`${s.street} ${s.locality} ${s.district}`.toLowerCase().includes(q)) return false
    if (seen.has(s.street)) return false
    seen.add(s.street)
    return true
  })
}

/**
 * 4.6 — the overrun record.
 *
 * Published per department, permanently, and framed as what it is: the Right to
 * Service record those bodies already owe. Nothing here is computed from a
 * department's own admission — an overrun appears the day a committed date
 * passes, whether or not anybody updates a status.
 */
export function overrunRecord(): DepartmentRecord[] {
  return DEPARTMENTS
    .map((d) => departmentRecord(d, WORKS))
    .filter((r) => r.finished > 0)
    .sort((a, b) => b.late - a.late || b.medianLateDays - a.medianLateDays)
}

/* --------------------------- Surface 2 — Bharat ---------------------------- */

/**
 * The almanac reads.
 *
 * Every number that leaves here is a `Figure`, which cannot exist without a
 * source and the period it describes. That is the surface's exit criterion
 * expressed as a type rather than as a rule somebody remembers.
 */

export function listStates(): StateRef[] {
  return STATES
}

export function stateProfile(code: string): StateProfile | undefined {
  return PROFILES[code]
}

export function weatherFor(code: string): WeatherReading[] {
  return WEATHER.filter((w) => w.stateCode === code)
}

export function flowsFor(code: string): CommodityFlow[] {
  return FLOWS.filter((f) => f.stateCode === code)
}

export function portsFor(code: string): PortThroughput[] {
  return THROUGHPUT.filter((p) => p.stateCode === code)
}

export function brandsFor(code: string, sector?: Sector): Brand[] {
  return BRANDS.filter((b) => b.stateCode === code && (!sector || b.sector === sector))
}

/** Every source named on the surface, so a reader can see the whole provenance at once. */
export function sourcesUsed(code: string): { name: string; url: string }[] {
  const seen = new Map<string, string>()
  for (const w of weatherFor(code)) seen.set(w.sourceName, w.sourceUrl)
  for (const f of flowsFor(code)) seen.set(f.sourceName, f.sourceUrl)
  for (const p of portsFor(code)) seen.set(p.sourceName, p.sourceUrl)
  for (const b of brandsFor(code)) seen.set(b.sourceName, b.sourceUrl)
  const profile = stateProfile(code)
  if (profile) seen.set(profile.sourceName, profile.sourceUrl)
  return [...seen].map(([name, url]) => ({ name, url }))
}

/* ---- stores (2.6 / 2.7 / 2.8) ---- */

/**
 * Store listings, cached like everything else the server owns.
 *
 * Reads are synchronous from the cache and a fetch runs in the background, so
 * the directory opens instantly on a bad connection and is a little behind
 * rather than absent.
 */
export function listStores(): Store[] {
  void pullStores()
  const rows = cachedStores() ?? []
  return rows
    .filter((r) => !r.removed_at)
    .map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as StoreCategory,
      address: r.address,
      locality: r.locality,
      district: r.district,
      stateCode: r.state_code,
      what: r.what,
      hours: r.hours ?? undefined,
      phone: r.phone ?? undefined,
      at: typeof r.at_x === 'number' && typeof r.at_y === 'number'
        ? { x: r.at_x, y: r.at_y }
        : undefined,
      listedAt: r.listed_at,
      verified: r.verified === 1,
    }))
}

export function getStore(id: string): Store | undefined {
  return listStores().find((s) => s.id === id)
}

export function storesFor(code: string): Store[] {
  return listStores().filter((s) => s.stateCode === code)
}
