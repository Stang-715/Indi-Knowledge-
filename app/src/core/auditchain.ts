/**
 * Checking the audit trail yourself.
 *
 * The server has a `/v1/oversight/head` route that will happily tell you the
 * chain verifies. An oversight layer whose verification is performed by the
 * party being overseen is not oversight, so this is the same computation done
 * on the reader's own machine, from entries they fetched, with a digest
 * function they can read.
 *
 * `server/src/db-audit.ts` computes it identically. The two are checked against
 * each other in the server test suite, because a disagreement here would make
 * every honest trail look tampered with — or, far worse, the other way round.
 */

export interface ChainEntry {
  id: string
  at: number
  actor_kind: string
  actor: string
  action: string
  scope: string
  detail: string
  seq: number
  prev: string
  digest: string
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Must produce the same digest as the server, for every entry. */
export async function digestOf(row: Omit<ChainEntry, 'digest'>): Promise<string> {
  const canonical = [
    `id=${row.id}`, `at=${row.at}`, `actorKind=${row.actor_kind}`,
    `actor=${row.actor}`, `action=${row.action}`, `scope=${row.scope}`,
    `detail=${row.detail}`, `seq=${row.seq}`, `prev=${row.prev}`,
  ].join('\n')
  return sha256Hex(`chowk-audit-v1\n${canonical}`)
}

export interface Verdict {
  ok: boolean
  checked: number
  /** The first entry that does not follow from the one before it. */
  brokenAt?: number
  /** What the chain ends on, for keeping and comparing later. */
  head?: string
}

/**
 * Walks the chain from the beginning.
 *
 * The result worth acting on is not `ok` — it is `head`. Kept somewhere this
 * platform does not control and compared next month, it turns a rewritten
 * history from something nobody could notice into something anybody can prove.
 */
export async function verifyChain(entries: ChainEntry[]): Promise<Verdict> {
  const ordered = [...entries].sort((a, b) => a.seq - b.seq)
  let prev = 'genesis'
  for (const row of ordered) {
    if (row.prev !== prev) return { ok: false, checked: ordered.length, brokenAt: row.seq }
    if (await digestOf(row) !== row.digest) {
      return { ok: false, checked: ordered.length, brokenAt: row.seq }
    }
    prev = row.digest
  }
  return { ok: true, checked: ordered.length, head: prev }
}
