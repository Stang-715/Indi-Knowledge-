import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * The voice database.
 *
 * The other half of the split. Everything a citizen says or votes lives here,
 * keyed by pseudonym and nothing else. This module is the only place this file
 * is opened, and it never imports the eligibility store — a rule the server
 * constraint check enforces rather than trusts.
 *
 * There is no `citizen_id`, no `user_id` and no foreign key to anything in the
 * other database, because there is no other database as far as this connection
 * is concerned.
 */

const PATH = process.env.CHOWK_VOICE_DB ?? '.data/voice.db'

mkdirSync(dirname(PATH), { recursive: true })
const db = new DatabaseSync(PATH)

db.exec(`
  PRAGMA journal_mode = WAL;

  -- The public half of the key the device signs its writes with. A pseudonym
  -- with no key is a name anybody could use; a pseudonym with one is a name
  -- only the device that claimed it can write under.
  CREATE TABLE IF NOT EXISTS pseudonym (
    name       TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    public_key TEXT
  );

  CREATE TABLE IF NOT EXISTS response (
    poll_id   TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    option_id TEXT NOT NULL,
    at        INTEGER NOT NULL,
    PRIMARY KEY (poll_id, pseudonym)
  );

  CREATE TABLE IF NOT EXISTS post (
    id         TEXT PRIMARY KEY,
    topic_id   TEXT NOT NULL,
    pseudonym  TEXT NOT NULL,
    body       TEXT NOT NULL,
    stance     TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    removed_at INTEGER,
    removed_reason TEXT
  );

  CREATE TABLE IF NOT EXISTS reaction (
    post_id   TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    kind      TEXT NOT NULL CHECK (kind IN ('agree','disagree')),
    PRIMARY KEY (post_id, pseudonym)
  );

  -- Reach is a counter, never a list. There is no row per reader to turn into
  -- a per-citizen read receipt later.
  CREATE TABLE IF NOT EXISTS reach (
    notice_id TEXT PRIMARY KEY,
    seen      INTEGER NOT NULL DEFAULT 0
  );

  -- Consent, recorded against the pseudonym.
  --
  -- It lives here rather than in the eligibility store because the writes it
  -- gates are pseudonym-scoped, and putting it here means checking it teaches
  -- the server nothing it did not already know from the write itself.
  CREATE TABLE IF NOT EXISTS consent (
    pseudonym TEXT NOT NULL,
    purpose   TEXT NOT NULL,
    decision  TEXT NOT NULL CHECK (decision IN ('granted','refused')),
    version   INTEGER NOT NULL,
    at        INTEGER NOT NULL,
    PRIMARY KEY (pseudonym, purpose)
  );

  CREATE TABLE IF NOT EXISTS rate (
    bucket TEXT NOT NULL,
    at     INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS rate_bucket ON rate (bucket, at);
`)

/**
 * Claims a name for a key.
 *
 * Idempotent for the device that already holds it — a retried claim from the
 * same key is the same claim, which is what lets a client tell its own repeat
 * from somebody else's collision. A claim on a held name with a different key
 * is refused, and nothing about the holder is disclosed by the refusal.
 */
const pseudonymColumns = (db.prepare('PRAGMA table_info(pseudonym)').all() as { name: string }[])
  .map((c) => c.name)
if (!pseudonymColumns.includes('public_key')) {
  db.exec('ALTER TABLE pseudonym ADD COLUMN public_key TEXT')
}

export function claimPseudonym(name: string, publicKey: string): boolean {
  const held = db.prepare('SELECT public_key FROM pseudonym WHERE name = ?').get(name) as
    { public_key: string | null } | undefined

  if (!held) {
    db.prepare('INSERT INTO pseudonym (name, created_at, public_key) VALUES (?, ?, ?)')
      .run(name, Date.now(), publicKey)
    return true
  }
  // A name claimed before keys existed binds to the first key that asks. There
  // is no such deployment, and leaving the row unusable would be worse.
  if (held.public_key === null) {
    db.prepare('UPDATE pseudonym SET public_key = ? WHERE name = ?').run(publicKey, name)
    return true
  }
  return held.public_key === publicKey
}

/** The key a write from this name must be signed with, if the name has one. */
export function publicKeyFor(name: string): string | undefined {
  const row = db.prepare('SELECT public_key FROM pseudonym WHERE name = ?').get(name) as
    { public_key: string | null } | undefined
  return row?.public_key ?? undefined
}

export function pseudonymExists(name: string): boolean {
  return db.prepare('SELECT 1 FROM pseudonym WHERE name = ?').get(name) !== undefined
}

/** One response per pseudonym per poll. Voting again replaces, never appends. */
export function upsertResponse(
  pollId: string, pseudonym: string, optionId: string,
): void {
  db.prepare(`
    INSERT INTO response (poll_id, pseudonym, option_id, at) VALUES (?, ?, ?, ?)
    ON CONFLICT(poll_id, pseudonym) DO UPDATE SET option_id = excluded.option_id, at = excluded.at
  `).run(pollId, pseudonym, optionId, Date.now())
}

export function myResponse(pollId: string, pseudonym: string) {
  return db.prepare('SELECT option_id, at FROM response WHERE poll_id = ? AND pseudonym = ?')
    .get(pollId, pseudonym) as { option_id: string; at: number } | undefined
}

/**
 * Counts per option. This is the only read of the response table the API
 * exposes — there is deliberately no endpoint that returns rows, so a
 * government client cannot drill into who answered what.
 */
export function tally(pollId: string): { option_id: string; n: number }[] {
  return db.prepare('SELECT option_id, COUNT(*) AS n FROM response WHERE poll_id = ? GROUP BY option_id')
    .all(pollId) as { option_id: string; n: number }[]
}

export function insertPost(
  id: string, topicId: string, pseudonym: string, body: string, stance: string,
): void {
  // OR IGNORE, because a client that retries a post after a dropped connection
  // is resending one post, not writing a second one.
  db.prepare(`
    INSERT OR IGNORE INTO post (id, topic_id, pseudonym, body, stance, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, topicId, pseudonym, body, stance, Date.now())
}

/** Who wrote a given post, so a client-supplied id cannot overwrite somebody else's. */
export function postAuthor(id: string): string | undefined {
  const row = db.prepare('SELECT pseudonym FROM post WHERE id = ?').get(id) as
    { pseudonym: string } | undefined
  return row?.pseudonym
}

export function listPosts(topicId: string) {
  return db.prepare(`
    SELECT p.id, p.pseudonym, p.body, p.stance, p.created_at, p.removed_at, p.removed_reason,
      (SELECT COUNT(*) FROM reaction r WHERE r.post_id = p.id AND r.kind = 'agree')    AS agree,
      (SELECT COUNT(*) FROM reaction r WHERE r.post_id = p.id AND r.kind = 'disagree') AS disagree
    FROM post p WHERE p.topic_id = ? ORDER BY p.created_at DESC
  `).all(topicId) as Record<string, unknown>[]
}

export function removePost(id: string, reason: string): void {
  db.prepare('UPDATE post SET removed_at = ?, removed_reason = ? WHERE id = ?')
    .run(Date.now(), reason, id)
}

/** One reaction per pseudonym per post, enforced by the primary key. */
export function setReaction(postId: string, pseudonym: string, kind: string | null): void {
  if (kind === null) {
    db.prepare('DELETE FROM reaction WHERE post_id = ? AND pseudonym = ?').run(postId, pseudonym)
    return
  }
  db.prepare(`
    INSERT INTO reaction (post_id, pseudonym, kind) VALUES (?, ?, ?)
    ON CONFLICT(post_id, pseudonym) DO UPDATE SET kind = excluded.kind
  `).run(postId, pseudonym, kind)
}

/**
 * Records one decision. Granting and withdrawing take the same path, because
 * the Act requires withdrawal be as easy as consent and one mechanism is the
 * only way to guarantee that.
 */
export function setConsent(
  pseudonym: string, purpose: string, decision: string, version: number,
): void {
  db.prepare(`
    INSERT INTO consent (pseudonym, purpose, decision, version, at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(pseudonym, purpose) DO UPDATE SET
      decision = excluded.decision, version = excluded.version, at = excluded.at
  `).run(pseudonym, purpose, decision, version, Date.now())
}

/**
 * Whether a write may proceed.
 *
 * Absence is a refusal, not a default. A purpose never asked about has not been
 * consented to, and treating silence as agreement is the whole failure mode the
 * consent requirement exists to prevent.
 */
export function hasConsent(
  pseudonym: string, purpose: string, version: number,
): boolean {
  const row = db.prepare(
    'SELECT decision, version FROM consent WHERE pseudonym = ? AND purpose = ?',
  ).get(pseudonym, purpose) as { decision: string; version: number } | undefined
  return row?.decision === 'granted' && row.version === version
}

export function listConsent(pseudonym: string) {
  return db.prepare('SELECT purpose, decision, version, at FROM consent WHERE pseudonym = ?')
    .all(pseudonym) as Record<string, unknown>[]
}

export function bumpReach(noticeId: string): void {
  db.prepare(`
    INSERT INTO reach (notice_id, seen) VALUES (?, 1)
    ON CONFLICT(notice_id) DO UPDATE SET seen = seen + 1
  `).run(noticeId)
}

export function reach(noticeId: string): number {
  const row = db.prepare('SELECT seen FROM reach WHERE notice_id = ?').get(noticeId) as
    { seen: number } | undefined
  return row?.seen ?? 0
}

/**
 * Server-side rate limiting. The client has its own, which is a courtesy; this
 * one is the control, because a limit that lives in the app is a limit anybody
 * who can write an HTTP request ignores.
 */
export function rateAllows(bucket: string, max: number, windowMs: number): boolean {
  const since = Date.now() - windowMs
  db.prepare('DELETE FROM rate WHERE at < ?').run(since)
  const row = db.prepare('SELECT COUNT(*) AS n FROM rate WHERE bucket = ? AND at >= ?')
    .get(bucket, since) as { n: number }
  if (row.n >= max) return false
  db.prepare('INSERT INTO rate (bucket, at) VALUES (?, ?)').run(bucket, Date.now())
  return true
}
