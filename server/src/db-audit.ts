import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * The audit trail. A third separate database, append-only.
 *
 * Append-only is enforced four ways rather than promised once:
 *   - this module exports no update and no delete;
 *   - a SQLite trigger raises on any UPDATE or DELETE, so it fails even from a
 *     direct sqlite3 shell;
 *   - the server constraint check fails the build if a mutation is added here;
 *   - every entry carries the digest of the one before it, so the trail is a
 *     chain and any alteration breaks it.
 *
 * The fourth is the one that matters to somebody outside. The first three stop
 * this server editing its own history. None of them stops it being replaced
 * wholesale by a database with a tidier past, and from the outside a rewritten
 * trail and an honest one look identical.
 *
 * A chain changes that, but only with help: the head digest has to be written
 * down somewhere we do not control. Anybody who kept yesterday's head and finds
 * it no longer on the chain has proof. That is why the head is published on a
 * fixed schedule and why an oversight body can countersign it — and why this
 * whole mechanism is worth exactly as much as the existence of somebody who
 * bothers to keep the copies. Software cannot manufacture that body, and
 * pretending otherwise is the failure this layer exists to prevent.
 *
 * Entries describe institutional actions on classes of data. They never name a
 * citizen, because an audit trail that logs who read what is itself a
 * surveillance record.
 */

const PATH = process.env.CHOWK_AUDIT_DB ?? '.data/audit.db'

mkdirSync(dirname(PATH), { recursive: true })
const db = new DatabaseSync(PATH)

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS entry (
    id      TEXT PRIMARY KEY,
    at      INTEGER NOT NULL,
    actor_kind TEXT NOT NULL,
    actor   TEXT NOT NULL,
    action  TEXT NOT NULL,
    scope   TEXT NOT NULL,
    detail  TEXT NOT NULL,
    -- Position in the chain, and the digest of everything before it.
    seq     INTEGER NOT NULL,
    prev    TEXT NOT NULL,
    digest  TEXT NOT NULL
  );

  -- Bodies entitled to countersign the head. Not a read gate: the trail is
  -- public, and gating public data behind a login would be transparency
  -- theatre. This credential exists to let somebody outside put their name to
  -- what the trail said on a given day.
  CREATE TABLE IF NOT EXISTS observer (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    public_key TEXT NOT NULL,
    added_at   INTEGER NOT NULL
  );

  -- An observer's signature over a head digest at a moment in time.
  CREATE TABLE IF NOT EXISTS attestation (
    id       TEXT PRIMARY KEY,
    observer TEXT NOT NULL,
    seq      INTEGER NOT NULL,
    digest   TEXT NOT NULL,
    at       INTEGER NOT NULL,
    sig      TEXT NOT NULL
  );

  -- Requests received, and what became of them. Counts that never go down.
  CREATE TABLE IF NOT EXISTS request (
    id           TEXT PRIMARY KEY,
    kind         TEXT NOT NULL,
    received_at  INTEGER NOT NULL,
    closed_at    INTEGER,
    outcome      TEXT,
    note         TEXT
  );

  -- Transparency reports. Materialised for every completed period whether or
  -- not anybody asked, and never revised once written.
  CREATE TABLE IF NOT EXISTS report (
    period     TEXT PRIMARY KEY,
    made_at    INTEGER NOT NULL,
    head_seq   INTEGER NOT NULL,
    head_digest TEXT NOT NULL,
    body       TEXT NOT NULL
  );

  CREATE TRIGGER IF NOT EXISTS report_no_update
    BEFORE UPDATE ON report
    BEGIN SELECT RAISE(ABORT, 'a published report is not revised'); END;

  CREATE TRIGGER IF NOT EXISTS report_no_delete
    BEFORE DELETE ON report
    BEGIN SELECT RAISE(ABORT, 'a published report is not withdrawn'); END;

  -- A request can be closed once. Recording an outcome is necessary; changing
  -- one after the fact would make the published counts a draft.
  CREATE TRIGGER IF NOT EXISTS request_close_once
    BEFORE UPDATE ON request
    WHEN OLD.closed_at IS NOT NULL
    BEGIN SELECT RAISE(ABORT, 'a closed request is not reopened or rewritten'); END;

  CREATE TRIGGER IF NOT EXISTS request_no_delete
    BEFORE DELETE ON request
    BEGIN SELECT RAISE(ABORT, 'the request register only grows'); END;

  CREATE TRIGGER IF NOT EXISTS attestation_no_update
    BEFORE UPDATE ON attestation
    BEGIN SELECT RAISE(ABORT, 'an attestation is not revised'); END;

  CREATE TRIGGER IF NOT EXISTS entry_no_update
    BEFORE UPDATE ON entry
    BEGIN SELECT RAISE(ABORT, 'audit trail is append-only'); END;

  CREATE TRIGGER IF NOT EXISTS entry_no_delete
    BEFORE DELETE ON entry
    BEGIN SELECT RAISE(ABORT, 'audit trail is append-only'); END;
`)

/* --------------------------------- the chain -------------------------------- */

function digestOf(row: {
  id: string; at: number; actor_kind: string; actor: string
  action: string; scope: string; detail: string; seq: number; prev: string
}): string {
  // Field names are in the digest, not just values, so that moving a value from
  // one column to another does not preserve the hash.
  const canonical = [
    `id=${row.id}`, `at=${row.at}`, `actorKind=${row.actor_kind}`,
    `actor=${row.actor}`, `action=${row.action}`, `scope=${row.scope}`,
    `detail=${row.detail}`, `seq=${row.seq}`, `prev=${row.prev}`,
  ].join('\n')
  return createHash('sha256').update(`chowk-audit-v1\n${canonical}`).digest('hex')
}

export interface Head {
  seq: number
  digest: string
  count: number
}

export function head(): Head {
  const row = db.prepare('SELECT seq, digest FROM entry ORDER BY seq DESC LIMIT 1').get() as
    { seq: number; digest: string } | undefined
  const count = (db.prepare('SELECT COUNT(*) AS n FROM entry').get() as { n: number }).n
  return { seq: row?.seq ?? 0, digest: row?.digest ?? 'genesis', count }
}

export function append(
  actorKind: string, actor: string, action: string, scope: string, detail: string,
): void {
  const previous = head()
  const row = {
    id: `au_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    actor_kind: actorKind, actor, action, scope, detail,
    seq: previous.seq + 1,
    prev: previous.digest,
  }
  db.prepare(`
    INSERT INTO entry (id, at, actor_kind, actor, action, scope, detail, seq, prev, digest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(row.id, row.at, row.actor_kind, row.actor, row.action, row.scope, row.detail,
    row.seq, row.prev, digestOf(row))
}

export function list(limit = 200): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM entry ORDER BY seq DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[]
}

/** The whole trail in chain order, for anybody who wants to check it themselves. */
export function chain(from = 0, limit = 1000): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM entry WHERE seq > ? ORDER BY seq LIMIT ?')
    .all(from, limit) as Record<string, unknown>[]
}

export interface ChainCheck {
  ok: boolean
  checked: number
  /** Sequence number of the first entry that does not follow from the one before. */
  brokenAt?: number
}

/**
 * Recomputes the chain.
 *
 * Run here for convenience, but the point is that anybody can run it: the
 * digest function is published above, the entries are public, and a reader who
 * disagrees with this server's answer can work it out for themselves.
 */
export function verifyChain(): ChainCheck {
  const rows = db.prepare('SELECT * FROM entry ORDER BY seq').all() as Record<string, unknown>[]
  let prev = 'genesis'
  for (const raw of rows) {
    const row = raw as unknown as Parameters<typeof digestOf>[0] & { digest: string }
    if (row.prev !== prev || digestOf(row) !== row.digest) {
      return { ok: false, checked: rows.length, brokenAt: row.seq }
    }
    prev = row.digest
  }
  return { ok: true, checked: rows.length }
}

/* -------------------------------- observers -------------------------------- */

export function addObserver(id: string, name: string, publicKey: string): boolean {
  const held = db.prepare('SELECT public_key FROM observer WHERE id = ?').get(id) as
    { public_key: string } | undefined
  if (held) return held.public_key === publicKey
  db.prepare('INSERT INTO observer (id, name, public_key, added_at) VALUES (?, ?, ?, ?)')
    .run(id, name, publicKey, Date.now())
  return true
}

export function observer(id: string): { id: string; name: string; public_key: string } | undefined {
  return db.prepare('SELECT * FROM observer WHERE id = ?').get(id) as
    { id: string; name: string; public_key: string } | undefined
}

export function observers(): Record<string, unknown>[] {
  return db.prepare('SELECT id, name, public_key, added_at FROM observer ORDER BY added_at')
    .all() as Record<string, unknown>[]
}

export function attest(id: string, observerId: string, seq: number, digest: string, sig: string): void {
  db.prepare(`
    INSERT OR IGNORE INTO attestation (id, observer, seq, digest, at, sig)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, observerId, seq, digest, Date.now(), sig)
}

export function attestations(limit = 50): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM attestation ORDER BY at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[]
}

/* --------------------------------- requests -------------------------------- */

/**
 * The kinds of thing somebody can ask of this platform.
 *
 * `disclosure-demand` is the one that matters most and the one most
 * transparency reports omit: how many times has an authority asked us to
 * identify somebody. It is reported alongside how many were fulfilled, and that
 * second number is structurally zero — not because we refuse, but because
 * joining a pseudonym to an identity is not an operation anybody here has.
 */
export type RequestKind =
  | 'access' | 'correction' | 'erasure' | 'nomination' | 'grievance'
  | 'disclosure-demand' | 'takedown-demand'

export function receiveRequest(id: string, kind: RequestKind, note = ''): void {
  db.prepare(`
    INSERT OR IGNORE INTO request (id, kind, received_at, note) VALUES (?, ?, ?, ?)
  `).run(id, kind, Date.now(), note)
}

export function closeRequest(id: string, outcome: string): boolean {
  const row = db.prepare('SELECT closed_at FROM request WHERE id = ?').get(id) as
    { closed_at: number | null } | undefined
  if (!row || row.closed_at !== null) return false
  db.prepare('UPDATE request SET closed_at = ?, outcome = ? WHERE id = ?')
    .run(Date.now(), outcome, id)
  return true
}

export interface RequestTally {
  kind: string
  received: number
  closed: number
  fulfilled: number
  refused: number
}

export function requestTally(): RequestTally[] {
  return db.prepare(`
    SELECT kind,
      COUNT(*) AS received,
      SUM(CASE WHEN closed_at IS NOT NULL THEN 1 ELSE 0 END) AS closed,
      SUM(CASE WHEN outcome = 'fulfilled' THEN 1 ELSE 0 END) AS fulfilled,
      SUM(CASE WHEN outcome = 'refused' THEN 1 ELSE 0 END) AS refused
    FROM request GROUP BY kind ORDER BY kind
  `).all() as RequestTally[]
}

/* ---------------------------------- reports -------------------------------- */

function periodOf(at: number): string {
  const d = new Date(at)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function previousPeriods(count: number, now = Date.now()): string[] {
  const out: string[] = []
  const d = new Date(now)
  for (let i = 1; i <= count; i += 1) {
    out.push(periodOf(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)))
  }
  return out.reverse()
}

/**
 * Materialises a report for every completed month, whether or not anybody asked.
 *
 * "Published on a schedule, not on request" is the deliverable, and the
 * difference is not cosmetic: a report produced when somebody asks is a report
 * that can be not produced when nobody does. These are written by the calendar,
 * are immutable once written, and carry the head of the chain at the moment of
 * writing, so a later rewrite of history contradicts a report already out.
 */
export function ensureReports(months = 6, now = Date.now()): void {
  const current = head()
  for (const period of previousPeriods(months, now)) {
    const held = db.prepare('SELECT period FROM report WHERE period = ?').get(period)
    if (held) continue

    const start = Date.UTC(Number(period.slice(0, 4)), Number(period.slice(5, 7)) - 1, 1)
    const end = Date.UTC(Number(period.slice(0, 4)), Number(period.slice(5, 7)), 1)

    const entries = db.prepare(
      'SELECT COUNT(*) AS n FROM entry WHERE at >= ? AND at < ?',
    ).get(start, end) as { n: number }
    const byAction = db.prepare(`
      SELECT action, COUNT(*) AS n FROM entry WHERE at >= ? AND at < ?
      GROUP BY action ORDER BY n DESC
    `).all(start, end) as { action: string; n: number }[]
    const requests = db.prepare(`
      SELECT kind,
        COUNT(*) AS received,
        SUM(CASE WHEN outcome = 'fulfilled' THEN 1 ELSE 0 END) AS fulfilled
      FROM request WHERE received_at >= ? AND received_at < ?
      GROUP BY kind ORDER BY kind
    `).all(start, end) as Record<string, unknown>[]

    db.prepare(`
      INSERT INTO report (period, made_at, head_seq, head_digest, body)
      VALUES (?, ?, ?, ?, ?)
    `).run(period, Date.now(), current.seq, current.digest, JSON.stringify({
      period, entries: entries.n, byAction, requests,
    }))
  }
}

export function reports(): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM report ORDER BY period DESC').all() as Record<string, unknown>[]
}

/* No update. No delete. Not restricted — absent. */
