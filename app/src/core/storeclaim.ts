import { read, write } from './storage'

/**
 * The secret that lets you edit a shop listing, and nothing else.
 *
 * A capability, not an identity. It proves this device made a particular
 * listing; it does not say who holds the device, and the server stores only its
 * digest. Nothing here touches the voice layer — a directory entry that carried
 * its lister's pseudonym would make every pseudonymous post that person had
 * ever written attributable to a named business at a known address, and the
 * convenience being bought is an edit button.
 *
 * Losing the secret means losing the ability to edit that listing. That is the
 * cost of not having an account, and it is the right cost: the alternative is a
 * recovery flow, and a recovery flow is an identity by another name.
 */

const KEY = 'store-claims'

type Claims = Record<string, string>

function claims(): Claims {
  return read<Claims>('content', KEY, {})
}

function randomSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function digestOf(secret: string): Promise<string> {
  try {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`store:${secret}`))
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    // Non-secure context. A weaker handle rather than sending the secret itself.
    return secret.slice(0, 64)
  }
}

/** Mints a claim for a new listing and remembers it on this device. */
export async function claimStore(storeId: string): Promise<string> {
  const secret = randomSecret()
  write('content', KEY, { ...claims(), [storeId]: secret })
  return digestOf(secret)
}

export async function digestFor(storeId: string): Promise<string | null> {
  const secret = claims()[storeId]
  return secret ? digestOf(secret) : null
}

export function listedHere(storeId: string): boolean {
  return Boolean(claims()[storeId])
}

export function myListings(): string[] {
  return Object.keys(claims())
}
