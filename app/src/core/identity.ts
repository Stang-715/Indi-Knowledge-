/**
 * The two identity layers (design principle 2).
 *
 * This file is the only place both namespaces are opened, and it is written so
 * that opening both buys you nothing: there is no exported function that maps
 * one layer to the other, and neither record holds a pointer to the other.
 *
 *   eligibility layer  →  "is this a citizen, and are they entitled to one vote"
 *   voice layer        →  "what name does this person speak and vote under"
 *
 * The link between them exists in exactly one place: the physical device the
 * citizen holds. It is never transmitted, never written to one record, and no
 * government or platform role can reconstruct it. Unmasking a pseudonym is
 * therefore not a permission we withhold — it is an operation nobody has.
 */

import { clearNamespace, dumpNamespace, read, write } from './storage'

/* ------------------------------------------------------------------ *
 * Layer 1 — eligibility. Used once, at onboarding. Never at speech time.
 * ------------------------------------------------------------------ */

/**
 * Age band, not date of birth.
 *
 * The DPDP Act defines a child as under eighteen and bans tracking, behavioural
 * monitoring and targeted advertising directed at children outright. Chowk does
 * none of those to anybody, but "we do not profile children" is only a claim you
 * can make if you know who is a child.
 *
 * So the verification service returns a band, never a birth date. A band answers
 * the only question the app is entitled to ask, and cannot be used to identify
 * anyone the way a date of birth can.
 */
export type AgeBand = 'adult' | 'minor' | 'unknown'

export interface EligibilityRecord {
  verified: boolean
  /** A one-way digest. The raw ID number is never stored, sent or logged. */
  idHash: string
  verifiedAt: number
  /** Which authority attested. No document image, number or scan is kept. */
  attestedBy: string
  /** From the ID service. Never derived from anything the citizen typed. */
  ageBand: AgeBand
}

const ELIGIBILITY_KEY = 'record'

export function getEligibility(): EligibilityRecord | null {
  return read<EligibilityRecord | null>('eligibility', ELIGIBILITY_KEY, null)
}

export function isVerified(): boolean {
  return getEligibility()?.verified === true
}

/**
 * Digest of the identifier. In production this is done by the verification
 * service inside its own trust boundary and the client only ever receives the
 * digest — the raw number does not cross the network to us at all.
 */
export async function digestIdentifier(raw: string): Promise<string> {
  const normalised = raw.replace(/\s+/g, '').toUpperCase()
  try {
    const bytes = new TextEncoder().encode(`cdp-v1:${normalised}`)
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    // Non-secure context. Degrade to an opaque local handle rather than ever
    // falling back to storing the raw identifier.
    return `local-${normalised.length}-${Date.now().toString(36)}`
  }
}

export async function recordVerification(
  rawIdentifier: string,
  attestedBy: string,
  ageBand: AgeBand = 'unknown',
): Promise<EligibilityRecord> {
  const record: EligibilityRecord = {
    verified: true,
    idHash: await digestIdentifier(rawIdentifier),
    verifiedAt: Date.now(),
    attestedBy,
    ageBand,
  }
  write('eligibility', ELIGIBILITY_KEY, record)
  return record
}

/**
 * Whether this citizen may take part rather than only read.
 *
 * Advisory polling is a proxy for the franchise, so eighteen is the line anyway
 * — the DPDP requirement and the product requirement happen to agree. An unknown
 * band is treated as a minor: the safe reading of an absent signal is the one
 * that profiles nobody.
 */
export function mayParticipate(): boolean {
  return getEligibility()?.ageBand === 'adult'
}

export function isMinor(): boolean {
  const band = getEligibility()?.ageBand
  return band === 'minor' || band === 'unknown'
}

/* ------------------------------------------------------------------ *
 * Layer 2 — voice. Used for every post and every vote.
 * ------------------------------------------------------------------ */

export interface VoiceRecord {
  pseudonym: string
  createdAt: number
  /** Cooldown stops pseudonym-churn being used to launder a reputation (6.2). */
  lastChangedAt: number
}

const VOICE_KEY = 'record'
export const PSEUDONYM_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function getVoice(): VoiceRecord | null {
  return read<VoiceRecord | null>('voice', VOICE_KEY, null)
}

export function getPseudonym(): string | null {
  return getVoice()?.pseudonym ?? null
}

export function setPseudonym(pseudonym: string): VoiceRecord {
  const existing = getVoice()
  const now = Date.now()
  const record: VoiceRecord = {
    pseudonym,
    createdAt: existing?.createdAt ?? now,
    lastChangedAt: now,
  }
  write('voice', VOICE_KEY, record)
  return record
}

export function pseudonymChangeAvailableAt(): number | null {
  const v = getVoice()
  if (!v) return null
  return v.lastChangedAt + PSEUDONYM_COOLDOWN_MS
}

export function canChangePseudonym(): boolean {
  const at = pseudonymChangeAvailableAt()
  return at === null || Date.now() >= at
}

const ADJECTIVES = [
  'Quiet', 'Steady', 'Northern', 'Riverside', 'Patient', 'Amber', 'Coastal',
  'Morning', 'Ironwood', 'Open', 'Distant', 'Careful', 'Monsoon', 'Bright',
]
const NOUNS = [
  'Banyan', 'Lantern', 'Ferry', 'Kite', 'Almanac', 'Compass', 'Sparrow',
  'Millstone', 'Harbour', 'Ledger', 'Cedar', 'Signal', 'Weaver', 'Bell',
]

export function suggestPseudonym(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const d = Math.floor(Math.random() * 900 + 100)
  return `${a}${n}${d}`
}

export function validatePseudonym(value: string): string | null {
  const v = value.trim()
  if (v.length < 4) return 'tooShort'
  if (v.length > 24) return 'tooLong'
  if (!/^[\p{L}\p{N}_-]+$/u.test(v)) return 'badChars'
  return null
}

/* ------------------------------------------------------------------ *
 * Account deletion (6.5)
 * ------------------------------------------------------------------ */

export function eraseEverything(): void {
  clearNamespace('eligibility')
  clearNamespace('voice')
  clearNamespace('prefs')
  clearNamespace('responses')
}

/**
 * Backing data for "what data do you have on me" (6.5). It reads the real
 * stores rather than a hand-written list, so the screen cannot drift away from
 * the truth the way a static disclosure page would.
 */
export function inspectStoredData() {
  return {
    eligibility: dumpNamespace('eligibility'),
    voice: dumpNamespace('voice'),
    prefs: dumpNamespace('prefs'),
    responses: dumpNamespace('responses'),
  }
}
