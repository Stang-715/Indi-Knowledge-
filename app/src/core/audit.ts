/**
 * Append-only audit trail feeding the Oversight Layer (12.2).
 *
 * Two properties matter more than the contents:
 *  1. There is no delete or update function. Government roles can write entries
 *     as a side effect of acting, and read nothing back.
 *  2. Entries describe *what class of data was touched*, never whose it was.
 */

import { read, write } from './storage'

export type AuditActorKind = 'gov' | 'platform' | 'oversight' | 'automated'

export interface AuditEntry {
  id: string
  at: number
  actorKind: AuditActorKind
  /** Institution or system component. Never a citizen. */
  actor: string
  action: string
  scope: string
  detail: string
}

const KEY = 'entries'
const LIMIT = 500

export function listAudit(): AuditEntry[] {
  return read<AuditEntry[]>('audit', KEY, [])
}

export function appendAudit(entry: Omit<AuditEntry, 'id' | 'at'>): void {
  const entries = listAudit()
  entries.unshift({
    ...entry,
    id: `au_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
  })
  write('audit', KEY, entries.slice(0, LIMIT))
}

/* There is intentionally no removeAudit / editAudit. See the header. */
