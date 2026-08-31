import { toSign } from './canonical'

/**
 * A department's signing key, held on the department's own device.
 *
 * Separate from `voicekey.ts` in every way that matters, and deliberately so.
 * An engineer at the water board is also a citizen; they post under a pseudonym
 * in the evening and file works in the morning. If those two used one key, or
 * even one key store, the two halves of that person would be one signature
 * apart — and the whole architecture exists to make that link unavailable to
 * anybody, including to somebody who compromises this device.
 *
 * So: a different IndexedDB database, a different key per department, and no
 * function anywhere that can see both stores.
 *
 * The private half never leaves the device. The register holds the public half
 * and the root's signature over it, which is what lets a citizen's phone check
 * a permit without asking anybody's permission.
 */

const DB = 'chowk-department-key'
const STORE = 'key'

const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' } as const
const SIGNING = { name: 'ECDSA', hash: 'SHA-256' } as const

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

async function keyFor(departmentId: string): Promise<CryptoKeyPair | null> {
  try {
    const held = await idb<CryptoKeyPair | undefined>('readonly', (s) => s.get(departmentId))
    if (held) return held
    const pair = await crypto.subtle.generateKey(ALGORITHM, false, ['sign', 'verify'])
    await idb('readwrite', (s) => s.put(pair, departmentId))
    return pair
  } catch {
    return null
  }
}

export async function departmentPublicKey(departmentId: string): Promise<JsonWebKey | null> {
  const pair = await keyFor(departmentId)
  if (!pair) return null
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function signAs(
  departmentId: string, path: string, payload: Record<string, unknown>,
): Promise<string | null> {
  const pair = await keyFor(departmentId)
  if (!pair) return null
  return hex(await crypto.subtle.sign(
    SIGNING, pair.privateKey, new TextEncoder().encode(toSign(path, payload)),
  ))
}

export async function forgetDepartmentKey(departmentId?: string): Promise<void> {
  try {
    await idb('readwrite', (s) => (departmentId ? s.delete(departmentId) : s.clear()))
  } catch { /* nothing stored */ }
}
