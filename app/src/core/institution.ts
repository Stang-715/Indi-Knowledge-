import { apiGet } from './api'
import { toSign } from './canonical'
import { read, write } from './storage'

/**
 * Checking that a department is a department, and that a permit is real.
 *
 * The point of this file is that it does not trust the server it is talking to.
 * A register entry is signed by the registry root; a permit is signed over the
 * same root. If the app holds the root's public key, it can check both without
 * the server's help — and a server that started inventing departments would be
 * caught by every phone that had ever seen the real key.
 *
 * Which makes how the root key gets here the whole question.
 *
 * In a real build it is compiled in: `VITE_REGISTRY_ROOT` carries the key and
 * changing it means shipping a new version, in public, with a version number
 * attached. Absent that, this falls back to trust on first use — it takes the
 * key the server offers the first time and refuses any different one after.
 * That is weaker and it is marked weaker: `pinning` says which of the two you
 * are relying on, and the permit screen shows it. First use is exactly when an
 * attacker would like to be the server, so a fallback that stayed quiet about
 * itself would be worse than no check at all.
 */

const ROOT_KEY = 'registry-root'

export type Pinning = 'built-in' | 'first-use' | 'none'

interface PinnedRoot {
  jwk: JsonWebKey
  pinning: Pinning
  seenAt: number
}

function builtIn(): JsonWebKey | null {
  const raw = import.meta.env.VITE_REGISTRY_ROOT as string | undefined
  if (!raw) return null
  try {
    return JSON.parse(raw) as JsonWebKey
  } catch {
    return null
  }
}

export function pinnedRoot(): PinnedRoot | null {
  const compiled = builtIn()
  if (compiled) return { jwk: compiled, pinning: 'built-in', seenAt: 0 }
  return read<PinnedRoot | null>('content', ROOT_KEY, null)
}

/**
 * Fetches the root key, and pins it the first time. A key that differs from the
 * pinned one is not adopted — it is reported, because that is either a server
 * that has been replaced or one that has been compromised, and neither is
 * something to accept quietly.
 */
export async function ensureRoot(): Promise<{ root: PinnedRoot | null; changed: boolean }> {
  const held = pinnedRoot()
  if (held?.pinning === 'built-in') return { root: held, changed: false }

  try {
    const res = await apiGet<{ publicKey?: JsonWebKey }>('/v1/registry/root')
    if (!res.publicKey) return { root: held, changed: false }

    if (!held) {
      const next: PinnedRoot = { jwk: res.publicKey, pinning: 'first-use', seenAt: Date.now() }
      write('content', ROOT_KEY, next)
      return { root: next, changed: false }
    }
    const same = JSON.stringify(held.jwk) === JSON.stringify(res.publicKey)
    return { root: held, changed: !same }
  } catch {
    return { root: held, changed: false }
  }
}

async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk', { ...jwk, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify'],
  )
}

function fromHex(hex: string): ArrayBuffer {
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2))
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out.buffer
}

async function verify(
  jwk: JsonWebKey, path: string, payload: Record<string, unknown>, sigHex: string,
): Promise<boolean> {
  try {
    if (!/^[0-9a-f]{8,256}$/.test(sigHex)) return false
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      await importKey(jwk),
      fromHex(sigHex),
      new TextEncoder().encode(toSign(path, payload)),
    )
  } catch {
    return false
  }
}

export interface RegisterEntry {
  id: string
  name: string
  utility: string
  publicKey: JsonWebKey
  registeredAt: number
  approver: boolean
  rootSig: string
  enrolledBy: string
}

/**
 * Whether the register entry for a department was really signed by the root.
 *
 * The payload is rebuilt here rather than taken from the server, so an entry
 * whose name or capability has been edited in transit fails — which is the
 * whole reason the signature covers the name in the first place.
 */
export async function verifyEntry(entry: RegisterEntry): Promise<boolean> {
  const root = pinnedRoot()
  if (!root) return false
  return verify(root.jwk, '/v1/registry/entry', {
    id: entry.id,
    name: entry.name,
    utility: entry.utility,
    publicKey: JSON.stringify(entry.publicKey),
    registeredAt: entry.registeredAt,
    approver: entry.approver,
  }, entry.rootSig)
}

export interface PermitClaim {
  number: string
  filing: string
  department: string
  stretch: string
  startsAt: number
  restoreBy: number
  issuedAt: number
}

export interface PermitCheck {
  found: boolean
  valid: boolean
  pinning: Pinning
  permit?: PermitClaim
  reason?: string
  closure?: string
  department?: RegisterEntry
}

/**
 * The check a person standing next to a barrier board actually makes.
 *
 * No account, no session, nothing about who is asking. Verified against the
 * pinned root, so "this permit is real" is something the phone concludes rather
 * than something the server says.
 */
export async function checkPermit(number: string): Promise<PermitCheck> {
  const { root } = await ensureRoot()
  const pinning: Pinning = root?.pinning ?? 'none'

  try {
    const res = await apiGet<{
      ok?: boolean; reason?: string; closure?: string
      permit?: PermitClaim; sig?: string; issuedBy?: string
    }>('/v1/permits/verify', { number })

    if (!res.ok || !res.permit || !res.sig) {
      return { found: false, valid: false, pinning, reason: res.reason }
    }

    const valid = root
      ? await verify(root.jwk, '/v1/permits/verify', res.permit as unknown as Record<string, unknown>, res.sig)
      : false

    const register = await apiGet<{ departments?: RegisterEntry[] }>('/v1/registry')
    const department = register.departments?.find((d) => d.id === res.permit!.department)

    return {
      found: true,
      valid,
      pinning,
      permit: res.permit,
      reason: res.reason,
      closure: res.closure,
      department,
    }
  } catch {
    return { found: false, valid: false, pinning, reason: 'offline' }
  }
}

export async function registry(): Promise<RegisterEntry[]> {
  try {
    const res = await apiGet<{ departments?: RegisterEntry[] }>('/v1/registry')
    return res.departments ?? []
  } catch {
    return []
  }
}
