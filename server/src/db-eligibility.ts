import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * The eligibility database.
 *
 * A separate database *file*, not a separate table — so a join against the
 * voice store is not expressible in SQL. There is no connection that can see
 * both, which means "we do not correlate them" stops being a policy someone can
 * revise and becomes something the query planner cannot do.
 *
 * What it holds, in full:
 *   - one row per verified ID hash, so a person is verified once
 *   - an age band, because the Act bans profiling under-eighteens and you
 *     cannot honour that without knowing who is one
 *   - spent token nonces, so an eligibility token is single-use
 *
 * What it does not hold: any pseudonym, any vote, any post, any IP address, any
 * raw identifier. This module is the only place this file is opened.
 */

const PATH = process.env.CHOWK_ELIGIBILITY_DB ?? '.data/eligibility.db'

mkdirSync(dirname(PATH), { recursive: true })
const db = new DatabaseSync(PATH)

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS verified (
    id_hash     TEXT PRIMARY KEY,
    age_band    TEXT NOT NULL CHECK (age_band IN ('adult','minor','unknown')),
    verified_at INTEGER NOT NULL,
    attested_by TEXT NOT NULL,
    -- How many eligibility tokens this identity has been issued. Capped, so a
    -- single verification cannot mint unlimited votes.
    issued      INTEGER NOT NULL DEFAULT 0
  );

  -- A spent nonce, and nothing else. Deliberately no timestamp: recording when
  -- a token was spent, next to when it was issued, would re-create by
  -- correlation exactly the link the blinding removes.
  CREATE TABLE IF NOT EXISTS spent (
    nonce TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS issuer_key (
    id  INTEGER PRIMARY KEY CHECK (id = 1),
    jwk TEXT NOT NULL
  );
`)

export type AgeBand = 'adult' | 'minor' | 'unknown'

export function findVerified(idHash: string):
  { age_band: AgeBand; issued: number } | undefined {
  return db.prepare('SELECT age_band, issued FROM verified WHERE id_hash = ?')
    .get(idHash) as { age_band: AgeBand; issued: number } | undefined
}

export function recordVerified(
  idHash: string, ageBand: AgeBand, attestedBy: string,
): void {
  db.prepare(`
    INSERT INTO verified (id_hash, age_band, verified_at, attested_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id_hash) DO NOTHING
  `).run(idHash, ageBand, Date.now(), attestedBy)
}

/** Caps how many tokens one verification can ever mint. */
export const MAX_ISSUED = 60

export function countIssue(idHash: string, n: number): boolean {
  const row = findVerified(idHash)
  if (!row) return false
  if (row.issued + n > MAX_ISSUED) return false
  db.prepare('UPDATE verified SET issued = issued + ? WHERE id_hash = ?').run(n, idHash)
  return true
}

export function isSpent(nonce: string): boolean {
  return db.prepare('SELECT 1 FROM spent WHERE nonce = ?').get(nonce) !== undefined
}

/** Burns a nonce. Returns false if it was already spent — that is a double vote. */
export function spend(nonce: string): boolean {
  try {
    db.prepare('INSERT INTO spent (nonce) VALUES (?)').run(nonce)
    return true
  } catch {
    return false
  }
}

export function loadIssuerJwk(): string | null {
  const row = db.prepare('SELECT jwk FROM issuer_key WHERE id = 1').get() as
    { jwk: string } | undefined
  return row?.jwk ?? null
}

export function saveIssuerJwk(jwk: string): void {
  db.prepare('INSERT OR REPLACE INTO issuer_key (id, jwk) VALUES (1, ?)').run(jwk)
}
