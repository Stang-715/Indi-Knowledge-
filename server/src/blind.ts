import { createHash, generateKeyPairSync, randomBytes, type KeyObject } from 'node:crypto'

/**
 * Unlinkable eligibility tokens — RSA blind signatures.
 *
 * This is the piece that makes the rest of the server honest.
 *
 * On the device, the link between a verified identity and a pseudonym existed
 * only because both happened to be on the same phone. The moment there is a
 * server, every request that carries a proof of eligibility *and* a pseudonym
 * hands that server the join we spent the whole architecture refusing to store.
 * Separate tables do not help. Separate databases do not help. A promise not to
 * correlate is worth exactly as much as the next administration's opinion of it.
 *
 * So eligibility is proved with a token the issuer cannot recognise:
 *
 *   1. The client picks a random nonce and blinds it with a secret factor r.
 *   2. The server checks this ID hash has not been issued before, then signs
 *      the blinded value. It has seen only noise.
 *   3. The client divides out r, leaving a valid signature over the nonce.
 *   4. Voting presents (nonce, signature) alongside the pseudonym. The server
 *      verifies the signature and burns the nonce.
 *
 * The server therefore knows "a verified adult voted" and "pseudonym X voted",
 * and cannot tell which verified adult — not because it declines to look, but
 * because the signing transcript is statistically independent of the token.
 *
 * The known limits, stated rather than glossed:
 *   - Timing. Issue and spend must be separated, or a token spent seconds after
 *     issue is linkable by clock alone. The client holds a batch and spends
 *     later; see `BATCH`.
 *   - Network. IP addresses would re-link both halves. The server must not log
 *     them, which is enforced in http.ts and checked by the server constraint
 *     check.
 *   - This is textbook RSA blinding. A production deployment should move to a
 *     reviewed construction (RSA-BSSA, RFC 9474) rather than this file.
 */

/** How many tokens are issued at once, so spending is not one-to-one with issue. */
export const BATCH = 12

export interface IssuerKeys {
  publicKey: KeyObject
  privateKey: KeyObject
  n: bigint
  e: bigint
  d: bigint
}

function b64uToBigInt(b64u: string): bigint {
  const buf = Buffer.from(b64u, 'base64url')
  return BigInt('0x' + (buf.toString('hex') || '0'))
}

export function makeIssuer(bits = 2048): IssuerKeys {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: bits })
  const jwk = privateKey.export({ format: 'jwk' }) as {
    n: string; e: string; d: string
  }
  return {
    publicKey,
    privateKey,
    n: b64uToBigInt(jwk.n),
    e: b64uToBigInt(jwk.e),
    d: b64uToBigInt(jwk.d),
  }
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  let b = base % mod
  let e = exp
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1n
  }
  return result
}

function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n]
  const [g, x, y] = egcd(b, a % b)
  return [g, y, x - (a / b) * y]
}

function modInv(a: bigint, m: bigint): bigint {
  const [g, x] = egcd(((a % m) + m) % m, m)
  if (g !== 1n) throw new Error('no modular inverse')
  return ((x % m) + m) % m
}

/** Full-domain-ish hash of the nonce into Z_n. */
export function hashToInt(nonce: string, n: bigint): bigint {
  // Chained SHA-256 until the digest is comfortably wide, then reduced.
  let acc = ''
  for (let i = 0; acc.length < 128; i += 1) {
    acc += createHash('sha256').update(`cdp-fdh:${i}:${nonce}`).digest('hex')
  }
  return BigInt('0x' + acc) % n
}

export function newNonce(): string {
  return randomBytes(32).toString('base64url')
}

/* ------------------------------- client side ----------------------------- */

export interface Blinded {
  nonce: string
  /** Sent to the issuer. Reveals nothing about the nonce. */
  blinded: string
  /** Kept secret by the client until unblinding. */
  r: string
}

export function blind(nonce: string, n: bigint, e: bigint): Blinded {
  const m = hashToInt(nonce, n)
  let r: bigint
  // r must be invertible mod n, which is overwhelmingly likely first try.
  for (;;) {
    r = BigInt('0x' + randomBytes(256).toString('hex')) % n
    if (r > 1n) {
      try { modInv(r, n); break } catch { /* retry */ }
    }
  }
  const blindedInt = (m * modPow(r, e, n)) % n
  return { nonce, blinded: blindedInt.toString(16), r: r.toString(16) }
}

export function unblind(blindSigHex: string, rHex: string, n: bigint): string {
  const s = BigInt('0x' + blindSigHex)
  const r = BigInt('0x' + rHex)
  return ((s * modInv(r, n)) % n).toString(16)
}

/* ------------------------------- issuer side ----------------------------- */

/** Signs a blinded value. The issuer never sees the nonce this becomes. */
export function signBlinded(blindedHex: string, keys: IssuerKeys): string {
  const blinded = BigInt('0x' + blindedHex)
  return modPow(blinded, keys.d, keys.n).toString(16)
}

export function verifyToken(
  nonce: string, sigHex: string, n: bigint, e: bigint,
): boolean {
  try {
    const s = BigInt('0x' + sigHex)
    return modPow(s, e, n) === hashToInt(nonce, n)
  } catch {
    return false
  }
}
