/**
 * Where the server is, and the two shapes of talking to it.
 *
 * Kept in one file so that "which host does this app trust" is a single
 * answer rather than a string repeated in four modules. Nothing here retries,
 * caches or throws: callers decide what a failure means, because the right
 * answer differs — a failed write is queued, a failed read is simply an old
 * cache, and neither is an error the citizen should be shown.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8787'

/** Requests are given a ceiling so a hanging socket cannot wedge a flush. */
const TIMEOUT_MS = 12_000

export function online(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

async function send(path: string, init: RequestInit): Promise<unknown> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(API_BASE + path, { ...init, signal: abort.signal })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export function apiPost<T = Record<string, unknown>>(
  path: string, body: Record<string, unknown>,
): Promise<T> {
  return send(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as Promise<T>
}

export function apiGet<T = Record<string, unknown>>(
  path: string, params: Record<string, string> = {},
): Promise<T> {
  const query = new URLSearchParams(params).toString()
  return send(query ? `${path}?${query}` : path, { method: 'GET' }) as Promise<T>
}
