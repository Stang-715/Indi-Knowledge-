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
import { getPseudonym } from '../core/identity'
import { read, write } from '../core/storage'
import type {
  BrigadingFlag, Notice, Poll, Post, Report, ReportReason, Stance, Topic,
} from '../core/types'
import {
  BRIGADING_FLAGS, NOTICES, POLLS, POSTS, SEED_COVERAGE, SEED_TALLIES, TOPICS,
} from './seed'

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
  const counts = read<Record<string, number>>('content', 'seen', {})
  counts[noticeId] = (counts[noticeId] ?? 0) + 1
  write('content', 'seen', counts)
}

const BASE_REACH: Record<string, number> = {
  not_water_shut: 14_206, not_road: 5_881, not_health: 3_402,
  not_bus: 7_733, not_retracted: 9_120,
}

export function noticeReach(noticeId: string): number {
  const counts = read<Record<string, number>>('content', 'seen', {})
  return (BASE_REACH[noticeId] ?? 0) + (counts[noticeId] ?? 0)
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
  const pseudonym = getPseudonym()
  if (!pseudonym) throw new Error('No pseudonym — cannot record a response.')
  const rows = read<Response[]>('responses', responseKey(pollId), [])
  // Overwrite, never append: one voice, one response (4.3).
  const without = rows.filter((r) => r.pseudonym !== pseudonym)
  const response: Response = { pseudonym, optionId, at: Date.now() }
  write('responses', responseKey(pollId), [...without, response])
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

  const rows = read<Response[]>('responses', responseKey(pollId), [])
  const live = aggregateBy(
    rows,
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

  return { total, buckets, suppressed: live.suppressed, coverage }
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
  const extra = read<Post[]>('content', 'posts', [])
  const removals = read<Record<string, { at: number; reason: string }>>(
    'content', 'postRemovals', {},
  )
  return [...extra, ...POSTS]
    .filter((p) => p.topicId === topicId)
    .map((p) => (removals[p.id] ? { ...p, removed: removals[p.id] } : p))
}

export function addPost(
  topicId: string, body: string, stance: Stance,
): Post {
  const pseudonym = getPseudonym()
  if (!pseudonym) throw new Error('No pseudonym — cannot post.')
  const post: Post = {
    id: `p_${Date.now().toString(36)}`,
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
  return post
}

export function react(postId: string, kind: 'agree' | 'disagree'): void {
  const pseudonym = getPseudonym()
  if (!pseudonym) return
  // One reaction per account per post — enforced by storing the choice, not a count.
  const mine = read<Record<string, 'agree' | 'disagree'>>('responses', 'reactions', {})
  const previous = mine[postId]
  if (previous === kind) delete mine[postId]
  else mine[postId] = kind
  write('responses', 'reactions', mine)
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
