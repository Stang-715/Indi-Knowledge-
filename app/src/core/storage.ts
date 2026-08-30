/**
 * Namespaced storage.
 *
 * Namespaces are not a nicety — they are the mechanism that keeps the two
 * identity layers apart (design principle 2). Each namespace is opened by
 * exactly one module, and no module opens both `eligibility` and `voice`.
 */

export type Namespace =
  | 'eligibility'   // verified-identity layer. Opened ONLY by identity.ts.
  | 'voice'         // pseudonym layer.        Opened ONLY by identity.ts.
  | 'prefs'         // language, a11y, notification toggles
  | 'content'       // notices, polls, threads (would be server-side in production)
  | 'responses'     // poll responses, keyed by pseudonym only
  | 'audit'         // append-only oversight trail
  | 'gov'           // government portal session

const PREFIX = 'cdp'

/**
 * Fields that must never appear in the same stored object. Checked on every
 * write, in production too — a build that trips this is a build that has
 * grown the join table.
 */
const REAL_ID_FIELDS = ['idHash', 'realName', 'documentNumber', 'eligibilityToken']
const PSEUDONYM_FIELDS = ['pseudonym', 'authorPseudonym']

export class IdentityJoinError extends Error {
  constructor(ns: Namespace, key: string) {
    super(
      `Refused write to ${ns}/${key}: the value carries both a real-identity ` +
        `field and a pseudonym field. Joining these two layers is prohibited ` +
        `by design principle 2 and is not a configurable behaviour.`,
    )
    this.name = 'IdentityJoinError'
  }
}

function scan(value: unknown, fields: string[]): boolean {
  if (value === null || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some((v) => scan(v, fields))
  const obj = value as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    if (fields.includes(key) && obj[key] !== undefined && obj[key] !== null) return true
    if (scan(obj[key], fields)) return true
  }
  return false
}

export function assertNoIdentityJoin(ns: Namespace, key: string, value: unknown): void {
  if (scan(value, REAL_ID_FIELDS) && scan(value, PSEUDONYM_FIELDS)) {
    throw new IdentityJoinError(ns, key)
  }
}

function full(ns: Namespace, key: string) {
  return `${PREFIX}:${ns}:${key}`
}

function backing(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null // private mode, blocked site data — the app still has to work
  }
}

export function read<T>(ns: Namespace, key: string, fallback: T): T {
  try {
    const raw = backing()?.getItem(full(ns, key))
    return raw === null || raw === undefined ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function write<T>(ns: Namespace, key: string, value: T): void {
  assertNoIdentityJoin(ns, key, value)
  try {
    backing()?.setItem(full(ns, key), JSON.stringify(value))
  } catch {
    /* quota or blocked storage — a lost preference must never break a flow */
  }
}

export function remove(ns: Namespace, key: string): void {
  try {
    backing()?.removeItem(full(ns, key))
  } catch {
    /* ignore */
  }
}

export function clearNamespace(ns: Namespace): void {
  const store = backing()
  if (!store) return
  const prefix = `${PREFIX}:${ns}:`
  const doomed: string[] = []
  for (let i = 0; i < store.length; i += 1) {
    const k = store.key(i)
    if (k && k.startsWith(prefix)) doomed.push(k)
  }
  doomed.forEach((k) => store.removeItem(k))
}

/** Everything the app holds, for the Privacy Centre (6.5) to render honestly. */
export function dumpNamespace(ns: Namespace): Record<string, unknown> {
  const store = backing()
  const out: Record<string, unknown> = {}
  if (!store) return out
  const prefix = `${PREFIX}:${ns}:`
  for (let i = 0; i < store.length; i += 1) {
    const k = store.key(i)
    if (!k || !k.startsWith(prefix)) continue
    try {
      out[k.slice(prefix.length)] = JSON.parse(store.getItem(k) as string)
    } catch {
      out[k.slice(prefix.length)] = store.getItem(k)
    }
  }
  return out
}
