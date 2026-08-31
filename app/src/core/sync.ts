import { read, write } from './storage'
import { apiPost, online } from './api'
import { getPseudonym, takeToken } from './identity'

/**
 * The transport.
 *
 * `data/repo.ts` is synchronous and every screen calls it that way. Making it
 * async to reach an HTTP API would change every caller, which the phase's exit
 * criterion forbids — and, more to the point, would be the wrong architecture
 * anyway. This app is for people on 2G and intermittent connections; a screen
 * that cannot render until a request returns is a screen that often does not
 * render.
 *
 * So reads come from a local cache, synchronously, and writes are queued and
 * flushed. Offline is not an error state here, it is the normal one. A vote cast
 * on a train is recorded locally, shown immediately, and reaches the server when
 * there is a connection.
 *
 * Conflict rules, one per operation, chosen so a retry is never harmful:
 *
 *   vote      last write wins per (poll, pseudonym). Queued votes for the same
 *             poll collapse to the newest, so voting three times sends one.
 *   reaction  last write wins per (post, pseudonym). Collapses the same way.
 *   post      append-only. Never collapsed, never reordered; each is distinct.
 *   seen      idempotent per notice. Deduped, because a retried increment would
 *             inflate a reach count that offices read as reality.
 *   consent   last write wins per purpose. Collapses, so a withdrawal that
 *             follows a grant in the same queue sends only the withdrawal.
 *
 * Claiming the pseudonym is not one of these. It is a precondition rather than
 * a write the citizen made — the server refuses everything from a name it has
 * never heard of — so it is done at the head of a flush, once, and not queued.
 */

export type OpKind = 'consent' | 'vote' | 'post' | 'reaction' | 'seen'

export interface Op {
  id: string
  kind: OpKind
  at: number
  /** Identifies the thing being written, for collapsing and deduping. */
  key: string
  body: Record<string, unknown>
  /** Attempts made. Used to back off, never to drop silently. */
  tries: number
}

const QUEUE = 'queue'

/** Attempts before a deferrable refusal is surfaced instead of retried. */
const MAX_TRIES = 6

export function queue(): Op[] {
  return read<Op[]>('responses', QUEUE, [])
}

function setQueue(ops: Op[]): void {
  write('responses', QUEUE, ops)
}

/** How a kind collapses. `null` means never collapse. */
const COLLAPSE: Record<OpKind, 'replace' | 'dedupe' | null> = {
  vote: 'replace',
  reaction: 'replace',
  consent: 'replace',
  seen: 'dedupe',
  post: null,
}

/**
 * Send order, which is a correctness rule rather than a nicety. A post the
 * server refuses because consent has not reached it yet is a post the citizen
 * wrote and lost. Consent therefore goes first, whatever order the citizen
 * happened to do things in.
 */
const ORDER: Record<OpKind, number> = {
  consent: 0, vote: 1, post: 1, reaction: 1, seen: 1,
}

/**
 * A refusal the server will give again no matter how long we wait — the write
 * is malformed, or the citizen is not entitled to make it. Retrying these
 * forever would hide them; they are surfaced instead.
 */
const TERMINAL = new Set([
  'invalid', 'incomplete', 'too-long', 'bad-token', 'bad-batch',
  'not-verified', 'not-adult', 'exhausted', 'taken',
])

export function enqueue(kind: OpKind, key: string, body: Record<string, unknown>): void {
  const ops = queue()
  const rule = COLLAPSE[kind]

  if (rule === 'dedupe' && ops.some((o) => o.kind === kind && o.key === key)) {
    return   // already pending; a second increment would double-count
  }
  const kept = rule === 'replace'
    ? ops.filter((o) => !(o.kind === kind && o.key === key))
    : ops

  kept.push({
    id: `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    kind, key, body, at: Date.now(), tries: 0,
  })
  setQueue(kept)
}

const ROUTE: Record<OpKind, string> = {
  vote: '/v1/polls/respond',
  post: '/v1/posts',
  reaction: '/v1/reactions',
  seen: '/v1/notices/seen',
  consent: '/v1/voice/consent',
}

/**
 * Registers the pseudonym with the server the first time it is used, so the
 * writes that follow are not refused as coming from a name nobody has claimed.
 *
 * A refusal here means the name already exists on the server, and the client
 * cannot tell whether that is a genuine collision or its own earlier claim
 * arriving twice — a pseudonym is deliberately not something the server can
 * attribute to a requester. So it is recorded and the queue goes out either
 * way: the precondition the writes actually need is that the name exists, and
 * a refusal proves it does. Treating it as a wall to stop at instead is how a
 * device ends up unable to send anything it wrote, which is what happened the
 * second time this ran. The collision case is real but separate; it needs the
 * pseudonym to be something a device can prove it holds (G-4-08).
 */
const CLAIM_KEY = 'claim'

interface ClaimState { name: string; state: 'claimed' | 'existed' }

export function claimState(): ClaimState | null {
  return read<ClaimState | null>('responses', CLAIM_KEY, null)
}

async function ensureRegistered(pseudonym: string): Promise<boolean> {
  if (claimState()?.name === pseudonym) return true
  try {
    const res = await apiPost<{ ok?: boolean }>('/v1/voice/claim', { pseudonym })
    write('responses', CLAIM_KEY, {
      name: pseudonym, state: res.ok ? 'claimed' : 'existed',
    })
    return true
  } catch {
    return false   // unreachable; the queue keeps
  }
}

export interface FlushResult {
  sent: number
  kept: number
  /** Server refusals, surfaced rather than silently retried forever. */
  refused: { op: Op; reason: string }[]
  offline: boolean
}

/**
 * Sends what is queued. Never throws: a failed flush leaves the queue intact and
 * the app carries on, because losing a vote to a network blip would be worse
 * than sending it late.
 */
let flushing: Promise<FlushResult> | null = null

/**
 * One flush at a time.
 *
 * The periodic drain and a screen asking for one can land together, and two
 * flushes reading the same queue send everything twice — including the claim,
 * which the second one then reads back as "that name is taken" and refuses
 * everything after it. Found exactly that way, in the browser, on the second
 * run of the transport check.
 */
export function flush(): Promise<FlushResult> {
  if (!flushing) flushing = run().finally(() => { flushing = null })
  return flushing
}

async function run(): Promise<FlushResult> {
  const ops = queue()
  if (ops.length === 0) return { sent: 0, kept: 0, refused: [], offline: false }
  if (!online()) return { sent: 0, kept: ops.length, refused: [], offline: true }

  const pseudonym = getPseudonym()
  if (!pseudonym) return { sent: 0, kept: ops.length, refused: [], offline: false }

  if (!(await ensureRegistered(pseudonym))) {
    // The server is not answering. Nothing to send into.
    return { sent: 0, kept: ops.length, refused: [], offline: true }
  }

  const remaining: Op[] = []
  const refused: FlushResult['refused'] = []
  let sent = 0

  const ordered = [...ops].sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.at - b.at)

  for (const op of ordered) {
    const body: Record<string, unknown> = { pseudonym, ...op.body }

    /* A vote carries an eligibility token as well as a pseudonym. The token is
       a blind signature, so presenting the two together tells the server that
       some verified adult voted and that this pseudonym did — and leaves it
       unable to say those are the same statement. */
    if (op.kind === 'vote') {
      const token = takeToken(op.key)
      if (!token) {
        remaining.push({ ...op, tries: op.tries + 1 })
        continue
      }
      body.nonce = token.nonce
      body.signature = token.signature
    }

    try {
      const json = await apiPost<{ ok?: boolean; reason?: string }>(ROUTE[op.kind], body)
      if (json.ok) { sent += 1; continue }

      const reason = json.reason ?? 'refused'
      if (TERMINAL.has(reason) || op.tries + 1 >= MAX_TRIES) {
        refused.push({ op, reason })
        continue
      }
      /* Everything else is refused for a reason something later in this queue
         may fix — consent not yet recorded, a pseudonym not yet claimed, a rate
         limit that lifts. Those are kept and tried again, up to a bound, so a
         write is never dropped quietly and never retried forever. */
      remaining.push({ ...op, tries: op.tries + 1 })
    } catch {
      remaining.push({ ...op, tries: op.tries + 1 })   // network — keep and retry
    }
  }

  setQueue(remaining)
  return { sent, kept: remaining.length, refused, offline: false }
}

/** Flushes when a connection returns, and periodically while there is one. */
export function startSync(onResult?: (r: FlushResult) => void): () => void {
  const run = () => { void flush().then((r) => onResult?.(r)) }
  window.addEventListener('online', run)
  const timer = window.setInterval(run, 30_000)
  run()
  return () => {
    window.removeEventListener('online', run)
    window.clearInterval(timer)
  }
}

export function pendingCount(): number {
  return queue().length
}

/** Whether a particular write is still waiting to be sent. */
export function isPending(kind: OpKind, key: string): boolean {
  return queue().some((o) => o.kind === kind && o.key === key)
}
