/**
 * One agreed way to turn a request into bytes to sign.
 *
 * A signature is over a sequence of bytes, so the client and the server must
 * build exactly the same sequence from the same request or every write is
 * rejected. `JSON.stringify` is not that: key order follows insertion order,
 * which differs between the object a client builds and the object a server
 * parses. So keys are sorted, undefined is dropped, and the route is part of
 * what is signed — otherwise a signed vote could be replayed as a signed post.
 *
 * `server/src/canonical.ts` is the same function. The two are checked against
 * each other in the server test suite, because a silent disagreement here
 * fails every write in production and nowhere else.
 */

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stable(obj[k])}`).join(',')}}`
}

/** The bytes a write is signed over: the route it is going to, and the payload. */
export function toSign(path: string, payload: Record<string, unknown>): string {
  const { sig: _drop, ...rest } = payload
  return `chowk-v1\n${path}\n${stable(rest)}`
}
