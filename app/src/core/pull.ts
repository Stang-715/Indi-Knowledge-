/**
 * The read side of the transport.
 *
 * Writes queue; reads cache. A screen asks the repository for posts and gets an
 * answer immediately — from the last copy this device fetched — and a request
 * goes out in the background to make the next answer newer. On a good
 * connection the difference is a few hundred milliseconds. On a train it is the
 * difference between a working app and a spinner.
 *
 * Only what the server actually owns is cached here: discussion posts, poll
 * tallies, and notice reach. Notices and polls are still published into local
 * content by the government screens, and are not fetched — see G-4-07.
 */

import { apiGet, online } from './api'
import { read, write } from './storage'

export interface CachedPost {
  id: string
  pseudonym: string
  body: string
  stance: string
  created_at: number
  removed_at?: number | null
  removed_reason?: string | null
  agree: number
  disagree: number
}

export interface CachedTally {
  total: number
  buckets: { key: string; count: number }[]
  suppressed: number
}

/** Fired when a background fetch changes the cache, for anything that wants to re-read. */
export const SYNC_EVENT = 'chowk:pulled'

function announce(): void {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  } catch { /* no window (tests, workers) — the cache is written either way */ }
}

/* ------------------------------- reads --------------------------------- */

export function cachedPosts(topicId: string): CachedPost[] | null {
  return read<CachedPost[] | null>('content', `srv:posts:${topicId}`, null)
}

export function cachedTally(pollId: string): CachedTally | null {
  return read<CachedTally | null>('content', `srv:tally:${pollId}`, null)
}

export function cachedReach(noticeId: string): number | null {
  return read<number | null>('content', `srv:reach:${noticeId}`, null)
}

/* ------------------------------- fetches -------------------------------- */

/**
 * One in-flight request per thing, and no more than one every few seconds.
 * A list screen that renders forty rows must not open forty sockets, and a 2G
 * connection is a resource to spend carefully rather than a pipe to fill.
 */
const MIN_INTERVAL_MS = 8_000
const lastAt = new Map<string, number>()
const inFlight = new Set<string>()

async function once(key: string, run: () => Promise<boolean>): Promise<void> {
  if (!online() || inFlight.has(key)) return
  if (Date.now() - (lastAt.get(key) ?? 0) < MIN_INTERVAL_MS) return
  inFlight.add(key)
  lastAt.set(key, Date.now())
  try {
    if (await run()) announce()
  } catch {
    /* Stale is a perfectly good answer. Nothing to report. */
  } finally {
    inFlight.delete(key)
  }
}

function changed(key: string, value: unknown): boolean {
  const next = JSON.stringify(value)
  if (read<string>('content', `${key}:etag`, '') === next) return false
  write('content', key, value)
  write('content', `${key}:etag`, next)
  return true
}

export function pullPosts(topicId: string): Promise<void> {
  const key = `srv:posts:${topicId}`
  return once(key, async () => {
    const res = await apiGet<{ posts?: CachedPost[] }>('/v1/posts', { topic: topicId })
    return Array.isArray(res.posts) ? changed(key, res.posts) : false
  })
}

export function pullTally(pollId: string): Promise<void> {
  const key = `srv:tally:${pollId}`
  return once(key, async () => {
    const res = await apiGet<CachedTally>('/v1/polls/aggregate', { poll: pollId })
    return Array.isArray(res?.buckets) ? changed(key, res) : false
  })
}

export function pullReach(noticeId: string): Promise<void> {
  const key = `srv:reach:${noticeId}`
  return once(key, async () => {
    const res = await apiGet<{ seen?: number }>('/v1/notices/reach', { notice: noticeId })
    return typeof res.seen === 'number' ? changed(key, res.seen) : false
  })
}

/* --------------------------------- stores ---------------------------------- */

export interface CachedStore {
  id: string
  name: string
  category: string
  address: string
  locality: string
  district: string
  state_code: string
  what: string
  hours?: string | null
  phone?: string | null
  at_x?: number | null
  at_y?: number | null
  listed_at: number
  verified: number
  removed_at?: number | null
}

export function cachedStores(): CachedStore[] | null {
  return read<CachedStore[] | null>('content', 'srv:stores', null)
}

export function pullStores(): Promise<void> {
  return once('srv:stores', async () => {
    const res = await apiGet<{ stores?: CachedStore[] }>('/v1/stores')
    return Array.isArray(res.stores) ? changed('srv:stores', res.stores) : false
  })
}
