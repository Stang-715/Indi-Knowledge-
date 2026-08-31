import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * The audit trail. A third separate database, append-only.
 *
 * Append-only is enforced three ways rather than promised once:
 *   - this module exports no update and no delete;
 *   - a SQLite trigger raises on any UPDATE or DELETE, so it fails even from a
 *     direct sqlite3 shell;
 *   - the server constraint check fails the build if a mutation is added here.
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
    detail  TEXT NOT NULL
  );

  CREATE TRIGGER IF NOT EXISTS entry_no_update
    BEFORE UPDATE ON entry
    BEGIN SELECT RAISE(ABORT, 'audit trail is append-only'); END;

  CREATE TRIGGER IF NOT EXISTS entry_no_delete
    BEFORE DELETE ON entry
    BEGIN SELECT RAISE(ABORT, 'audit trail is append-only'); END;
`)

export function append(
  actorKind: string, actor: string, action: string, scope: string, detail: string,
): void {
  db.prepare(`
    INSERT INTO entry (id, at, actor_kind, actor, action, scope, detail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `au_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    Date.now(), actorKind, actor, action, scope, detail,
  )
}

export function list(limit = 200): Record<string, unknown>[] {
  return db.prepare('SELECT * FROM entry ORDER BY at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[]
}

/* No update. No delete. Not restricted — absent. */
