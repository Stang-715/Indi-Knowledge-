/**
 * Per-pseudonym rate limiting (5.3) — the cheap half of anti-brigading.
 * The expensive half is human review in 11.3; neither is trusted alone.
 */

import { read, write } from './storage'

interface Window {
  stamps: number[]
}

export interface Limit {
  max: number
  windowMs: number
}

export const POST_LIMIT: Limit = { max: 5, windowMs: 60 * 60 * 1000 }
export const REPORT_LIMIT: Limit = { max: 10, windowMs: 24 * 60 * 60 * 1000 }

export interface LimitState {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export function checkLimit(bucket: string, limit: Limit): LimitState {
  const now = Date.now()
  const { stamps } = read<Window>('responses', `rl:${bucket}`, { stamps: [] })
  const live = stamps.filter((s) => now - s < limit.windowMs)
  const allowed = live.length < limit.max
  const oldest = live.length > 0 ? Math.min(...live) : now
  return {
    allowed,
    remaining: Math.max(0, limit.max - live.length),
    retryAfterMs: allowed ? 0 : limit.windowMs - (now - oldest),
  }
}

export function recordUse(bucket: string, limit: Limit): void {
  const now = Date.now()
  const { stamps } = read<Window>('responses', `rl:${bucket}`, { stamps: [] })
  const live = stamps.filter((s) => now - s < limit.windowMs)
  live.push(now)
  write('responses', `rl:${bucket}`, { stamps: live })
}
