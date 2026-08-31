/**
 * The client half of the blind signature exchange.
 *
 * `server/src/blind.ts` explains why eligibility is proved with a token the
 * issuer cannot recognise. This file does the part that has to happen on the
 * device, and it has to happen here: if the blinding factor were ever chosen
 * by the server, the server could recognise the token afterwards and the whole
 * construction would be theatre.
 *
 * The two halves must agree exactly on the hash-to-integer step, or every
 * signature verifies as false. The server chains SHA-256 over
 * `cdp-fdh:<round>:<nonce>` until it has 128 hex characters and reduces mod n;
 * so does this, through Web Crypto rather than node:crypto.
 */

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

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function base64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Must produce the same integer as `hashToInt` on the server, for every nonce. */
export async function hashToInt(nonce: string, n: bigint): Promise<bigint> {
  let acc = ''
  for (let i = 0; acc.length < 128; i += 1) acc += await sha256Hex(`cdp-fdh:${i}:${nonce}`)
  return BigInt('0x' + acc) % n
}

export function newNonce(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return base64url(buf)
}

export interface Blinded {
  nonce: string
  /** Sent to the issuer. Reveals nothing about the nonce. */
  blinded: string
  /** Never leaves the device. Without it the signature cannot be unblinded. */
  r: string
}

export async function blind(nonce: string, n: bigint, e: bigint): Promise<Blinded> {
  const m = await hashToInt(nonce, n)
  let r: bigint
  for (;;) {
    r = BigInt('0x' + randomHex(256)) % n
    if (r > 1n) {
      try { modInv(r, n); break } catch { /* vanishingly rare — draw again */ }
    }
  }
  return { nonce, blinded: ((m * modPow(r, e, n)) % n).toString(16), r: r.toString(16) }
}

export function unblind(blindSigHex: string, rHex: string, n: bigint): string {
  const s = BigInt('0x' + blindSigHex)
  const r = BigInt('0x' + rHex)
  return ((s * modInv(r, n)) % n).toString(16)
}

/** Checked on the device before a token is filed, so a bad batch fails loudly at issue. */
export async function verifyToken(
  nonce: string, sigHex: string, n: bigint, e: bigint,
): Promise<boolean> {
  try {
    return modPow(BigInt('0x' + sigHex), e, n) === (await hashToInt(nonce, n))
  } catch {
    return false
  }
}
