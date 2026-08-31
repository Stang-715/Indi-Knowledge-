/**
 * The key that makes a pseudonym a credential rather than a claim.
 *
 * Until now the server accepted any write from any name it had heard of, which
 * meant one citizen could post and vote as another simply by typing their
 * pseudonym. A name is not a secret — it is printed next to every post — so it
 * cannot also be the proof of who is speaking.
 *
 * The device therefore generates a signing key when the citizen chooses their
 * pseudonym, registers the public half with the claim, and signs every write.
 * The key is:
 *
 *   non-extractable   — it lives in IndexedDB as a CryptoKey the page can use
 *                       and cannot read. Script that gets into this app can
 *                       sign while it is running; it cannot walk away with the
 *                       identity.
 *   voice-layer only  — nothing here touches the eligibility layer, and the
 *                       key is bound to the pseudonym, not to the citizen. It
 *                       is destroyed with the pseudonym and again on erasure.
 *
 * What this does not do is defend a lost device: whoever holds the phone holds
 * the key. That is the same property as the pseudonym itself, and the remedy is
 * the same — claim a new one.
 */

import { toSign } from './canonical'

const DB = 'chowk-voice-key'
const STORE = 'key'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
    req.onsuccess = () => { resolve(req.result) }
    req.onerror = () => { reject(req.error) }
  })
}

function idb<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => { resolve(req.result as T) }
    req.onerror = () => { reject(req.error) }
  }))
}

const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' } as const
const SIGNING = { name: 'ECDSA', hash: 'SHA-256' } as const

/**
 * The key for a pseudonym, generated the first time it is needed.
 *
 * Keys are held per name rather than in one slot. Choosing a pseudonym means
 * making a key and offering it to the server, and the offer can be refused —
 * so trying a name that turns out to be taken must not destroy the key for the
 * name already held. A change of pseudonym is a new identity to everyone else
 * and gets its own key; the old one is forgotten explicitly.
 */
async function keyFor(pseudonym: string): Promise<CryptoKeyPair | null> {
  try {
    const held = await idb<CryptoKeyPair | undefined>('readonly', (s) => s.get(pseudonym))
    if (held) return held

    const pair = await crypto.subtle.generateKey(ALGORITHM, false, ['sign', 'verify'])
    await idb('readwrite', (s) => s.put(pair, pseudonym))
    return pair
  } catch {
    // No IndexedDB (private mode in some browsers, blocked site data). The app
    // stays usable for reading; writes will be refused by the server, which is
    // the honest outcome — better than a write nobody can attribute.
    return null
  }
}

/** The public half, as a JWK, to register with the pseudonym. */
export async function publicKey(pseudonym: string): Promise<JsonWebKey | null> {
  const pair = await keyFor(pseudonym)
  if (!pair) return null
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  // Only the curve point. Nothing here identifies the device or the citizen.
  return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Signs one write. Returns null when there is no key, and the write is not sent. */
export async function sign(
  pseudonym: string, path: string, payload: Record<string, unknown>,
): Promise<string | null> {
  const pair = await keyFor(pseudonym)
  if (!pair) return null
  const bytes = new TextEncoder().encode(toSign(path, payload))
  return hex(await crypto.subtle.sign(SIGNING, pair.privateKey, bytes))
}

/**
 * Erasure, and the key for a name this device turned out not to hold. Called
 * with a name it drops that one; called with nothing it drops them all.
 */
export async function forgetVoiceKey(pseudonym?: string): Promise<void> {
  try {
    await idb('readwrite', (s) => (pseudonym ? s.delete(pseudonym) : s.clear()))
  } catch { /* nothing stored, nothing to forget */ }
}
