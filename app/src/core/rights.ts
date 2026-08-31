/**
 * Data principal rights, DPDP Act 2023 sections 11 to 14.
 *
 *   s11  access      — a summary of the data held, the processing, and by whom
 *   s12  correction  — correct, complete, update; and erasure once the purpose ends
 *   s13  grievance   — a mechanism to register one, answered within the prescribed time
 *   s14  nomination  — name someone to exercise these rights on death or incapacity
 *
 * The unusual part of exercising these here is how little there is to exercise
 * them against. Section 11 asks for the identity of processors; Chowk has none.
 * Section 12 erasure is immediate rather than a request, because nothing is held
 * anywhere a request would have to travel to.
 */

import { dumpNamespace, read, write } from './storage'
import { loadConsent, PURPOSES, type ConsentRecord } from './consent'
import type { LocaleCode } from '../i18n/locales'

/* ---------------------------- s13 grievance ----------------------------- */

/**
 * The Rules require a Data Protection Officer contact, or an authorised person,
 * on the notice itself — and a route to the Data Protection Board when the
 * fiduciary's own answer does not satisfy.
 *
 * These are placeholders until the operating entity exists. They are marked so
 * rather than left as plausible-looking fakes: a wrong grievance address is
 * worse than an obviously missing one, because it silently swallows complaints.
 */
export const GRIEVANCE = {
  officerTitle: 'Data Protection Officer',
  officerContact: 'PENDING — set when the operating entity is registered',
  responseDays: 90,
  boardName: 'Data Protection Board of India',
  boardRoute: 'A complaint may be made to the Board if this answer does not satisfy you.',
  configured: false,
} as const

export type GrievanceStatus = 'open' | 'answered' | 'escalated'

export interface Grievance {
  id: string
  raisedAt: number
  subject: string
  detail: string
  status: GrievanceStatus
  /** Set when answered; the citizen sees the clock either way. */
  answeredAt?: number
  answer?: string
}

const G_KEY = 'grievances'

export function listGrievances(): Grievance[] {
  return read<Grievance[]>('prefs', G_KEY, [])
}

export function raiseGrievance(subject: string, detail: string): Grievance {
  const g: Grievance = {
    id: `g_${Date.now().toString(36)}`,
    raisedAt: Date.now(),
    subject,
    detail,
    status: 'open',
  }
  write('prefs', G_KEY, [g, ...listGrievances()])
  return g
}

export function grievanceDueAt(g: Grievance): number {
  return g.raisedAt + GRIEVANCE.responseDays * 24 * 60 * 60 * 1000
}

/* ---------------------------- s14 nomination ---------------------------- */

export interface Nomination {
  name: string
  relationship: string
  contact: string
  setAt: number
}

const N_KEY = 'nomination'

export function getNomination(): Nomination | null {
  return read<Nomination | null>('prefs', N_KEY, null)
}

export function setNomination(n: Omit<Nomination, 'setAt'>): Nomination {
  const record = { ...n, setAt: Date.now() }
  write('prefs', N_KEY, record)
  return record
}

export function clearNomination(): void {
  write('prefs', N_KEY, null)
}

/* ------------------------------ s11 access ------------------------------ */

export interface AccessSummary {
  /** Every field actually held, read from the store rather than a written list. */
  held: { namespace: string; values: Record<string, unknown> }[]
  /** What each purpose is doing with it, and whether it was agreed to. */
  processing: {
    purposeId: string
    decision: 'granted' | 'refused' | 'not asked'
    seenByGov: boolean
  }[]
  /** s11 requires naming processors and other fiduciaries data was shared with. */
  processors: string[]
  sharedWith: string[]
  consent: ConsentRecord | null
}

/**
 * Section 11 in one call.
 *
 * `held` reads the actual namespaces rather than a hand-maintained list, which
 * is the only version of this screen that cannot quietly drift away from the
 * truth as the app grows.
 */
export function accessSummary(): AccessSummary {
  const consent = loadConsent()
  return {
    held: [
      { namespace: 'eligibility', values: dumpNamespace('eligibility') },
      { namespace: 'voice', values: dumpNamespace('voice') },
      { namespace: 'prefs', values: dumpNamespace('prefs') },
      { namespace: 'responses', values: dumpNamespace('responses') },
    ],
    processing: PURPOSES.map((p) => ({
      purposeId: p.id,
      decision: consent?.decisions[p.id]?.decision ?? 'not asked',
      seenByGov: p.seenByGov,
    })),
    // Both empty, and both stated rather than omitted: an empty list is an
    // answer to s11, a missing section is not.
    processors: [],
    sharedWith: [],
    consent,
  }
}

/**
 * A portable copy, for the citizen rather than for us. Plain text because it has
 * to be readable on a cheap phone with no spreadsheet app.
 */
export function exportEverything(locale: LocaleCode): string {
  const s = accessSummary()
  const lines = [
    'CHOWK — EVERYTHING HELD ABOUT YOU',
    `Generated: ${new Date().toISOString()}`,
    `Language: ${locale}`,
    '',
    '1. DATA HELD (read from the store, not from a written list)',
  ]
  for (const group of s.held) {
    lines.push(`  [${group.namespace}]`)
    const keys = Object.keys(group.values)
    if (keys.length === 0) lines.push('    (nothing)')
    for (const k of keys) lines.push(`    ${k}: ${JSON.stringify(group.values[k])}`)
  }
  lines.push('', '2. PROCESSING, BY PURPOSE')
  for (const p of s.processing) {
    lines.push(`  ${p.purposeId}: ${p.decision}` +
      (p.seenByGov ? ' — visible publicly under your pseudonym' : ' — never seen by a government account'))
  }
  lines.push(
    '', '3. PROCESSORS AND SHARING',
    '  Processors: none. Chowk runs on your device.',
    '  Shared with: nobody. Aggregate counts leave, individual responses do not.',
    '',
    '4. WHAT DOES NOT EXIST',
    '  There is no record linking your verified identity to your pseudonym.',
    '  No location has ever been read. No processor holds a copy of any of this.',
  )
  return lines.join('\n')
}
