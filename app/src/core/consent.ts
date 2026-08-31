/**
 * DPDP consent.
 *
 * The Act and the 2025 Rules require consent that is free, specific, informed,
 * unconditional and given by clear affirmative action, preceded by a notice that
 * itemises the data, the purpose, how to exercise rights and how to complain to
 * the Board. Full compliance is expected by 13 May 2027.
 *
 * The architecture already does most of the work: because the two identity
 * layers cannot be joined, there is very little personal data here to consent
 * about. What this file adds is the part architecture cannot supply — a record
 * of what was agreed, per purpose, in which language, against which version of
 * the notice, and the ability to take any of it back.
 *
 * Two rules shape the design:
 *
 *  - Unconditional means purposes are not bundled. Each is granted or refused on
 *    its own, and refusing one must never block another. Where refusing costs
 *    something, the cost is stated on the toggle rather than discovered later.
 *  - Withdrawal must be as easy as granting. The same switch, in the same place,
 *    both ways.
 */

import { read, write } from './storage'
import type { LocaleCode } from '../i18n/locales'
import { enqueue } from './sync'

/**
 * Bumped whenever a purpose is added, removed, or its meaning changes.
 * A stored consent against an older version is not consent to the new one, so
 * the notice is shown again rather than silently assumed.
 */
export const NOTICE_VERSION = 1

export type PurposeId =
  | 'eligibility'
  | 'pseudonym'
  | 'locality'
  | 'poll-response'
  | 'public-speech'
  | 'reach-count'
  | 'settings'

export interface Purpose {
  id: PurposeId
  /** What is actually stored. Named as a field, not as a category. */
  dataKey: string
  purposeKey: string
  /** What refusing this costs, in plain words. Empty when it costs nothing. */
  costKey: string
  /**
   * Necessary for the app to do the thing it exists to do. Still refusable —
   * refusing degrades the app rather than being blocked — but the cost is real.
   */
  necessary: boolean
  /** Whether a government account can ever see anything derived from this. */
  seenByGov: boolean
}

/**
 * The complete list. Adding one means bumping NOTICE_VERSION, which re-asks
 * every citizen — which is the intended friction. A purpose slipped in quietly
 * is exactly what the consent requirement exists to prevent.
 */
export const PURPOSES: Purpose[] = [
  {
    id: 'eligibility',
    dataKey: 'consent.eligibility.data',
    purposeKey: 'consent.eligibility.purpose',
    costKey: 'consent.eligibility.cost',
    necessary: true,
    seenByGov: false,
  },
  {
    id: 'pseudonym',
    dataKey: 'consent.pseudonym.data',
    purposeKey: 'consent.pseudonym.purpose',
    costKey: 'consent.pseudonym.cost',
    necessary: true,
    seenByGov: true,
  },
  {
    id: 'locality',
    dataKey: 'consent.locality.data',
    purposeKey: 'consent.locality.purpose',
    costKey: 'consent.locality.cost',
    necessary: false,
    seenByGov: false,
  },
  {
    id: 'poll-response',
    dataKey: 'consent.poll.data',
    purposeKey: 'consent.poll.purpose',
    costKey: 'consent.poll.cost',
    necessary: false,
    seenByGov: false,
  },
  {
    id: 'public-speech',
    dataKey: 'consent.speech.data',
    purposeKey: 'consent.speech.purpose',
    costKey: 'consent.speech.cost',
    necessary: false,
    seenByGov: true,
  },
  {
    id: 'reach-count',
    dataKey: 'consent.reach.data',
    purposeKey: 'consent.reach.purpose',
    costKey: 'consent.reach.cost',
    necessary: false,
    seenByGov: false,
  },
  {
    id: 'settings',
    dataKey: 'consent.settings.data',
    purposeKey: 'consent.settings.purpose',
    costKey: 'consent.settings.cost',
    necessary: false,
    seenByGov: false,
  },
]

export type Decision = 'granted' | 'refused'

export interface ConsentRecord {
  /** Which version of the notice this was given against. */
  version: number
  /** The language the notice was read in — the Rules require this be offered. */
  locale: LocaleCode
  decidedAt: number
  /** Every purpose decided individually. Absence means never asked. */
  decisions: Partial<Record<PurposeId, { decision: Decision; at: number }>>
}

const KEY = 'consent'

export function loadConsent(): ConsentRecord | null {
  return read<ConsentRecord | null>('prefs', KEY, null)
}

export function saveConsent(record: ConsentRecord): void {
  write('prefs', KEY, record)
}

/** True when the citizen has decided every purpose in the current notice. */
export function isCurrent(record: ConsentRecord | null): boolean {
  if (!record || record.version !== NOTICE_VERSION) return false
  return PURPOSES.every((p) => record.decisions[p.id] !== undefined)
}

export function decisionFor(
  record: ConsentRecord | null, id: PurposeId,
): Decision | null {
  return record?.decisions[id]?.decision ?? null
}

export function hasConsent(record: ConsentRecord | null, id: PurposeId): boolean {
  return decisionFor(record, id) === 'granted'
}

/**
 * Record one decision. Granting and withdrawing take the same path on purpose:
 * the Act requires withdrawal be as easy as consent, and the surest way to
 * guarantee that is for there to be only one mechanism.
 */
export function decide(
  record: ConsentRecord | null,
  id: PurposeId,
  decision: Decision,
  locale: LocaleCode,
): ConsentRecord {
  const next: ConsentRecord = record && record.version === NOTICE_VERSION
    ? { ...record, decisions: { ...record.decisions } }
    : { version: NOTICE_VERSION, locale, decidedAt: Date.now(), decisions: {} }
  next.decisions[id] = { decision, at: Date.now() }
  next.decidedAt = Date.now()
  next.locale = locale
  saveConsent(next)
  // The server gates writes on consent too, and must hear about a withdrawal
  // as promptly as it heard about the grant.
  enqueue('consent', id, { decisions: { [id]: decision } })
  return next
}

export function decideAll(
  decision: Decision, locale: LocaleCode, only?: PurposeId[],
): ConsentRecord {
  const list = only ?? PURPOSES.map((p) => p.id)
  const now = Date.now()
  const record: ConsentRecord = {
    version: NOTICE_VERSION,
    locale,
    decidedAt: now,
    decisions: Object.fromEntries(list.map((id) => [id, { decision, at: now }])),
  }
  saveConsent(record)
  enqueue('consent', 'all', {
    decisions: Object.fromEntries(list.map((id) => [id, decision])),
  })
  return record
}

/**
 * A consent receipt — what was agreed, when, in which language, against which
 * notice. The citizen keeps this; it is the artefact that makes a later dispute
 * about what was agreed a matter of record rather than of memory.
 */
export function receipt(record: ConsentRecord | null): string {
  if (!record) return ''
  const lines = [
    'CHOWK — CONSENT RECEIPT',
    `Notice version: ${record.version}`,
    `Language of notice: ${record.locale}`,
    `Last decided: ${new Date(record.decidedAt).toISOString()}`,
    '',
    'PURPOSE, DECISION, WHEN',
  ]
  for (const p of PURPOSES) {
    const d = record.decisions[p.id]
    lines.push(
      `${p.id}: ${d ? d.decision : 'not asked'}` +
        (d ? ` (${new Date(d.at).toISOString()})` : ''),
    )
  }
  lines.push(
    '',
    'This receipt lists decisions, not personal data. Chowk holds no record',
    'linking a verified identity to a pseudonym, so there is nothing to disclose',
    'that would connect this receipt to anything said or voted on the platform.',
  )
  return lines.join('\n')
}
