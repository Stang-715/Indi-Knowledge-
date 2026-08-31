import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto'
import { toSign } from './canonical.ts'

/**
 * Institutional identity.
 *
 * This is the question Phase 7 was blocked on, and it is worth being exact
 * about which part of it software can answer.
 *
 * The part software can answer: making "the Water Board filed this" a claim
 * anybody can check rather than one this server asserts. A department holds a
 * signing key. The registry root signs an entry binding that key to a named
 * body. A permit is signed by an approving authority whose own entry is in the
 * register. The app pins the root's public key rather than fetching it, so the
 * chain — pinned root, signed register entry, signed permit — can be checked on
 * a phone with no network, and this server cannot forge a link in it.
 *
 * The part software cannot answer: who holds the root, and which real bodies
 * get enrolled under it. That is an institutional arrangement. Whoever holds
 * this key decides who counts as government, which is precisely the power the
 * rest of this architecture refuses to take — and it cannot be refused here,
 * only placed somewhere accountable. Today it sits with the platform, which is
 * the wrong home, and the enrolment gate is automatic, which is worse. Both are
 * marked in the data (`enrolled_by`) and on screen rather than glossed.
 *
 * A scheduler where a fake Water Board can file is worse than no scheduler. The
 * mechanism below is what makes a real one possible; it does not make the
 * arrangement exist.
 */

export interface Keys {
  privateJwk: string
  publicJwk: string
}

export function makeKeys(): Keys {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
  return {
    privateJwk: JSON.stringify(privateKey.export({ format: 'jwk' })),
    publicJwk: JSON.stringify(publicKey.export({ format: 'jwk' })),
  }
}

/** The public half, as the client will hold it: curve point only. */
export function publicOf(privateJwk: string): string {
  const jwk = JSON.parse(privateJwk) as Record<string, string>
  return JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y })
}

export function signPayload(
  privateJwk: string, path: string, payload: Record<string, unknown>,
): string {
  const key = createPrivateKey({ key: JSON.parse(privateJwk), format: 'jwk' })
  return sign('sha256', Buffer.from(toSign(path, payload)),
    { key, dsaEncoding: 'ieee-p1363' }).toString('hex')
}

export function verifyPayload(
  publicJwk: string, path: string, payload: Record<string, unknown>, sigHex: string,
): boolean {
  try {
    if (!/^[0-9a-f]{8,256}$/.test(sigHex)) return false
    const key = createPublicKey({ key: JSON.parse(publicJwk), format: 'jwk' })
    return verify('sha256', Buffer.from(toSign(path, payload)),
      { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(sigHex, 'hex'))
  } catch {
    return false
  }
}

/**
 * What the registry root signs to enrol a department, and what anyone verifies
 * to check the enrolment. Kept as one function so the two can never drift —
 * a verifier that builds the payload slightly differently from the signer
 * rejects every genuine entry, and only in production.
 */
export function entryPayload(row: {
  id: string; name: string; utility: string; public_key: string
  registered_at: number; approver: number
}): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    utility: row.utility,
    publicKey: row.public_key,
    registeredAt: row.registered_at,
    approver: row.approver === 1,
  }
}

/** What an approving authority signs to issue a permit. */
export function permitPayload(row: {
  number: string; filing: string; department: string; stretch: string
  startsAt: number; restoreBy: number; issuedAt: number
}): Record<string, unknown> {
  return { ...row }
}

/** Short enough to read off a barrier board and check on a phone. */
export function permitNumber(seed: string, at: number): string {
  const year = new Date(at).getFullYear().toString().slice(2)
  let hash = 0
  for (const ch of `${seed}:${at}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return `CHK-${year}-${hash.toString(16).toUpperCase().padStart(6, '0').slice(0, 6)}`
}
