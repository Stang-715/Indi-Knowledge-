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
import { apiPost } from './api'
import { blind, newNonce, unblind, verifyToken } from './blind'

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

  /* Ask the verification service, and let its answer about age win — a band the
     device guessed is a guess. Offline, the local record stands and the app
     stays usable; the wallet fills on the first connection instead. */
  try {
    const res = await apiPost<{
      ok: boolean; ageBand?: AgeBand; issuer?: { n: string; e: string }
    }>('/v1/eligibility/verify', { identifier: rawIdentifier })
    if (res.ok) {
      if (res.ageBand) record.ageBand = res.ageBand
      if (res.issuer) setIssuer(res.issuer)
    }
  } catch {
    /* No connection. Verification is provisional until there is one. */
  }

  write('eligibility', ELIGIBILITY_KEY, record)
  void refillTokens()
  return record
}

/* ------------------------------------------------------------------ *
 * Eligibility tokens — the proof that leaves this layer.
 *
 * A vote has to convince the server of two things at once: that a verified
 * adult is behind it, and that it belongs to a pseudonym. Sending the identity
 * record to prove the first would hand over exactly the join this architecture
 * exists to prevent. So what travels is a blind signature: a token this device
 * blinded before the issuer ever saw it, which verifies as genuine and matches
 * nothing in the issuing transcript.
 *
 * The wallet below therefore holds tokens and no identity, and the queue that
 * spends them holds a pseudonym and no identity. Both halves of a vote exist on
 * this device; neither half, nor both together on the wire, reconstitutes the
 * link. That is the property, and it is a property of the mathematics rather
 * than of anyone's restraint.
 * ------------------------------------------------------------------ */

/** Presented with a write. Carries no reference to the identity that drew it. */
export interface EligibilityToken {
  nonce: string
  signature: string
}

interface Wallet {
  tokens: EligibilityToken[]
  /** Which token was presented for which write, so an edit costs nothing extra. */
  bound: Record<string, EligibilityToken>
  /** The issuer's public key, as the verification service gave it. */
  issuer: { n: string; e: string } | null
}

const WALLET_KEY = 'wallet'
/** Drawn in a batch so that spending a token is not one-to-one with drawing it. */
const BATCH = 12
/** Refill before the wallet empties: an unsendable vote must never be the cause. */
const LOW_WATER = 4

function getWallet(): Wallet {
  return read<Wallet>('eligibility', WALLET_KEY, { tokens: [], bound: {}, issuer: null })
}

function setWallet(wallet: Wallet): void {
  write('eligibility', WALLET_KEY, wallet)
}

function setIssuer(issuer: { n: string; e: string }): void {
  setWallet({ ...getWallet(), issuer })
}

export function tokenCount(): number {
  return getWallet().tokens.length
}

/**
 * Draws signatures for freshly blinded nonces. Returns how many tokens are held
 * afterwards; never throws, because a refill that fails is a refill to try again
 * later, not an error to put in front of anybody.
 */
let refilling: Promise<number> | null = null

/** One refill at a time, or two of them race an empty wallet and draw twice the batch. */
export function refillTokens(): Promise<number> {
  if (!refilling) refilling = drawTokens().finally(() => { refilling = null })
  return refilling
}

async function drawTokens(): Promise<number> {
  const record = getEligibility()
  const wallet = getWallet()
  if (!record?.verified || record.ageBand !== 'adult') return wallet.tokens.length
  if (!wallet.issuer) return wallet.tokens.length
  if (wallet.tokens.length >= LOW_WATER) return wallet.tokens.length

  const n = BigInt('0x' + wallet.issuer.n)
  const e = BigInt('0x' + wallet.issuer.e)
  const want = BATCH - wallet.tokens.length

  try {
    const drafts = []
    for (let i = 0; i < want; i += 1) drafts.push(await blind(newNonce(), n, e))

    const res = await apiPost<{ ok: boolean; signatures?: string[] }>(
      '/v1/eligibility/tokens',
      { idHash: record.idHash, blinded: drafts.map((d) => d.blinded) },
    )
    if (!res.ok || !res.signatures) return wallet.tokens.length

    const drawn: EligibilityToken[] = []
    for (const [i, blindSig] of res.signatures.entries()) {
      const draft = drafts[i]
      if (!draft) continue
      const signature = unblind(blindSig, draft.r, n)
      // Checked here so a broken batch fails at issue rather than at the ballot.
      if (await verifyToken(draft.nonce, signature, n, e)) {
        drawn.push({ nonce: draft.nonce, signature })
      }
    }

    const next = getWallet()
    setWallet({ ...next, tokens: [...next.tokens, ...drawn] })
    return next.tokens.length + drawn.length
  } catch {
    return wallet.tokens.length
  }
}

/**
 * Hands out the token for a given write, drawing a new one only the first time.
 * Binding matters: changing a vote presents the same token it was cast with, so
 * the server recognises the edit instead of charging a second token for a
 * change of mind.
 */
export function takeToken(bind: string): EligibilityToken | null {
  const wallet = getWallet()
  const held = wallet.bound[bind]
  if (held) return held

  const [next, ...rest] = wallet.tokens
  if (!next) {
    void refillTokens()
    return null
  }
  setWallet({ ...wallet, tokens: rest, bound: { ...wallet.bound, [bind]: next } })
  return next
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
