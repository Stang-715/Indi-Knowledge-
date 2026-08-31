import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { webcrypto } from 'node:crypto'
import { blind, unblind, newNonce, verifyToken, hashToInt } from '../src/blind.ts'
import { toSign } from '../src/canonical.ts'
import { toSign as clientToSign } from '../../app/src/core/canonical.ts'

/**
 * End-to-end proof that the server cannot join the two identity layers.
 *
 * The test that matters is the last one: two citizens verify, both vote, and we
 * check that nothing the server stored lets anyone say which pseudonym belongs
 * to which verified identity.
 */

/*
 * The suite starts its own server, against its own databases, and stops it
 * afterwards.
 *
 * It did not, once. It talked to whatever was already listening on 8787, and a
 * server left running from before an edit reported two assertions as passing
 * that the edited code had not yet been asked to do. A test that can pass
 * against last week's build is not a test, so the process under test is now
 * one this file starts.
 */

const PORT = Number(process.env.PORT ?? 8788)
const API = `http://localhost:${PORT}`
const DATA = mkdtempSync(join(tmpdir(), 'chowk-test-'))

const server = spawn(process.execPath, [
  '--experimental-strip-types', '--disable-warning=ExperimentalWarning',
  new URL('../src/http.ts', import.meta.url).pathname,
], {
  env: {
    ...process.env,
    PORT: String(PORT),
    CHOWK_ELIGIBILITY_DB: join(DATA, 'eligibility.db'),
    CHOWK_VOICE_DB: join(DATA, 'voice.db'),
    CHOWK_AUDIT_DB: join(DATA, 'audit.db'),
  },
  stdio: 'ignore',
})

process.on('exit', () => { server.kill() })

for (let i = 0; i < 100; i += 1) {
  try {
    await fetch(`${API}/v1/audit`)
    break
  } catch {
    await new Promise((r) => setTimeout(r, 100))
  }
}

let failures = 0

const check = (name: string, pass: boolean, detail = '') => {
  console.log(`${pass ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!pass) failures += 1
}

const post = async (path: string, body: unknown) =>
  (await fetch(API + path, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })).json()

const get = async (path: string) => (await fetch(API + path)).json()

/* ---------------------------- signing devices ----------------------------
 *
 * A pseudonym is a credential now, so the tests need devices rather than bare
 * names. Each holds an ECDSA key and signs its writes exactly as the client
 * does — through the client's own canonical encoder, so a disagreement between
 * the two shows up here rather than in production.
 */

interface Device {
  publicKey: Record<string, unknown>
  sign: (path: string, payload: Record<string, unknown>) => Promise<string>
}

const devices = new Map<string, Device>()

async function newDevice(pseudonym?: string): Promise<Device> {
  const pair = await webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'],
  )
  const jwk = await webcrypto.subtle.exportKey('jwk', pair.publicKey)
  const device: Device = {
    publicKey: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y },
    sign: async (path, payload) => Buffer.from(await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey,
      Buffer.from(clientToSign(path, payload)),
    )).toString('hex'),
  }
  if (pseudonym) devices.set(pseudonym, device)
  return device
}

async function claim(pseudonym: string, device: Device) {
  const payload = { pseudonym, publicKey: device.publicKey, at: Date.now() }
  return post('/v1/voice/claim', {
    ...payload, sig: await device.sign('/v1/voice/claim', payload),
  })
}

/** A write signed by the device that holds the pseudonym it names. */
async function signedPost(path: string, body: Record<string, unknown>) {
  const device = devices.get(String(body.pseudonym))
  if (!device) throw new Error(`no device for ${body.pseudonym}`)
  const payload = { at: Date.now(), ...body }
  return post(path, { ...payload, sig: await device.sign(path, payload) })
}

/** One citizen: verify, draw unlinkable tokens, claim a pseudonym, vote. */
async function citizen(identifier: string, pseudonym: string) {
  const v = await post('/v1/eligibility/verify', { identifier })
  if (!v.ok) return { verify: v }

  const n = BigInt('0x' + v.issuer.n)
  const e = BigInt('0x' + v.issuer.e)

  // Blind a batch. The server signs noise.
  const blinds = Array.from({ length: 4 }, () => blind(newNonce(), n, e))
  const signed = await post('/v1/eligibility/tokens', {
    idHash: v.idHash, blinded: blinds.map((b) => b.blinded),
  })
  const tokens = signed.ok
    ? blinds.map((b, i) => ({ nonce: b.nonce, signature: unblind(signed.signatures[i], b.r, n) }))
    : []

  await claim(pseudonym, await newDevice(pseudonym))
  return { verify: v, tokens, n, e }
}

/** Records consent decisions against a pseudonym. */
const consent = (pseudonym: string, decisions: Record<string, string>) =>
  signedPost('/v1/voice/consent', { pseudonym, decisions })

console.log('\nChowk API — end to end\n')

const stamp = Date.now()
const a = await citizen(`1111 2222 ${stamp % 10000}`, `AlphaTester${stamp % 1000}`)
const b = await citizen(`3333 4444 ${(stamp + 1) % 10000}`, `BetaTester${stamp % 1000}`)

check('verification returns an adult band', a.verify.ageBand === 'adult', a.verify.ageBand)
check('tokens issued', (a.tokens?.length ?? 0) === 4)
check('token verifies against the issuer key',
  verifyToken(a.tokens![0].nonce, a.tokens![0].signature, a.n!, a.e!))

const alpha = `AlphaTester${stamp % 1000}`
const beta = `BetaTester${stamp % 1000}`

/* ---- consent is enforced by the server, not only by the app ---- */

const pollId = `poll_test_${stamp}`

const beforeConsent = await signedPost('/v1/polls/respond', {
  pollId, optionId: 'o1', pseudonym: alpha,
  nonce: a.tokens![3].nonce, signature: a.tokens![3].signature,
})
check('a vote without recorded consent is refused',
  beforeConsent.ok === false && beforeConsent.reason === 'no-consent', beforeConsent.reason)

const stillUnspent = await signedPost('/v1/polls/respond', {
  pollId, optionId: 'o1', pseudonym: alpha,
  nonce: a.tokens![3].nonce, signature: a.tokens![3].signature,
})
check('refusing consent did not burn the token',
  stillUnspent.reason === 'no-consent', stillUnspent.reason)

await consent(alpha, { 'poll-response': 'granted', 'public-speech': 'granted' })
await consent(beta, { 'poll-response': 'granted', 'public-speech': 'refused' })

const speechRefused = await signedPost('/v1/posts', {
  topicId: 'top_test', pseudonym: beta, text: 'This should not be stored.', stance: 'mixed',
})
check('a post from a pseudonym that refused speech is rejected',
  speechRefused.ok === false && speechRefused.reason === 'no-consent', speechRefused.reason)

const speechAllowed = await signedPost('/v1/posts', {
  topicId: 'top_test', pseudonym: alpha, text: 'This one is consented to.', stance: 'support',
})
check('a post from a pseudonym that granted speech is stored', speechAllowed.ok === true)

// Withdrawal must take effect immediately, through the same mechanism.
await consent(alpha, { 'public-speech': 'refused' })
const afterWithdrawal = await signedPost('/v1/posts', {
  topicId: 'top_test', pseudonym: alpha, text: 'After withdrawing.', stance: 'support',
})
check('withdrawing consent blocks the next write immediately',
  afterWithdrawal.ok === false && afterWithdrawal.reason === 'no-consent', afterWithdrawal.reason)
await consent(alpha, { 'public-speech': 'granted' })

const r1 = await signedPost('/v1/polls/respond', {
  pollId, optionId: 'o1', pseudonym: alpha,
  nonce: a.tokens![0].nonce, signature: a.tokens![0].signature,
})
check('a valid token casts a vote', r1.ok === true, r1.reason ?? '')

const replay = await signedPost('/v1/polls/respond', {
  pollId: `${pollId}_other`, optionId: 'o1', pseudonym: beta,
  nonce: a.tokens![0].nonce, signature: a.tokens![0].signature,
})
check('a spent token cannot be reused', replay.ok === false, replay.reason)

const forged = await signedPost('/v1/polls/respond', {
  pollId, optionId: 'o2', pseudonym: beta,
  nonce: newNonce(), signature: a.tokens![1].signature,
})
check('a forged token is rejected', forged.ok === false, forged.reason)

const changed = await signedPost('/v1/polls/respond', {
  pollId, optionId: 'o3', pseudonym: alpha,
  nonce: a.tokens![2].nonce, signature: a.tokens![2].signature,
})
check('changing a vote does not cost a second token', changed.ok === true, changed.reason ?? '')

const agg = await get(`/v1/polls/aggregate?poll=${pollId}`)
check('aggregate returns counts, not rows',
  Array.isArray(agg.buckets) && agg.buckets.every((x: Record<string, unknown>) => !('pseudonym' in x)))
check('small cells are suppressed', agg.suppressed >= 1, `total ${agg.total}, suppressed ${agg.suppressed}`)

const minor = await citizen(`5555 6666 7770`, `MinorTester${stamp % 1000}`)
check('a minor is banded as such', minor.verify.ageBand === 'minor')
check('a minor is issued no tokens', (minor.tokens?.length ?? 0) === 0)

/* ---- the one that matters ---- */

const { DatabaseSync } = await import('node:sqlite')
const eligDb = new DatabaseSync(join(DATA, 'eligibility.db'))
const voiceDb = new DatabaseSync(join(DATA, 'voice.db'))

const eligTables = (eligDb.prepare(
  "SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[])
  .map((r) => r.name)
const voiceTables = (voiceDb.prepare(
  "SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[])
  .map((r) => r.name)

check('eligibility store holds no pseudonym column',
  !eligTables.some((t) => {
    const cols = eligDb.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]
    return cols.some((c) => /pseudonym|voice|post|response/i.test(c.name))
  }), eligTables.join(','))

check('voice store holds no identity column',
  !voiceTables.some((t) => {
    const cols = voiceDb.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]
    return cols.some((c) => /id_hash|identity|aadhaar|verified/i.test(c.name))
  }), voiceTables.join(','))

let joinFailed = false
try {
  eligDb.prepare('SELECT * FROM verified v JOIN response r ON 1=1 LIMIT 1').all()
} catch {
  joinFailed = true
}
check('a join across the two stores is not expressible', joinFailed)

const spent = eligDb.prepare('PRAGMA table_info(spent)').all() as { name: string }[]
check('spent tokens carry no timestamp to correlate with issue',
  !spent.some((c) => /at|time|when/i.test(c.name)), spent.map((c) => c.name).join(','))

/* ---- client interoperability ----
 *
 * The app blinds tokens in the browser with Web Crypto; the server signs them
 * with node:crypto. If the two hash a nonce even slightly differently, every
 * signature verifies as false and voting fails for everybody — silently, and
 * only in production. So the client's own module is exercised here against the
 * real issuer rather than a copy of it. */

const client = await import('../../app/src/core/blind.ts')

const issuerRes = await post('/v1/eligibility/verify', { identifier: 'INTEROP-11111111' })
const issuerKey = (issuerRes as { issuer: { n: string; e: string } }).issuer
const cn = BigInt('0x' + issuerKey.n)
const ce = BigInt('0x' + issuerKey.e)

const clientNonce = client.newNonce()
const clientBlinded = await client.blind(clientNonce, cn, ce)
const clientSig = await post('/v1/eligibility/tokens', {
  idHash: (issuerRes as { idHash: string }).idHash,
  blinded: [clientBlinded.blinded],
}) as { ok: boolean; signatures: string[] }
const clientToken = client.unblind(clientSig.signatures[0], clientBlinded.r, cn)

check('the browser hash-to-integer matches the server\'s',
  await client.hashToInt(clientNonce, cn) === hashToInt(clientNonce, cn))
check('a token blinded in the client verifies on the server',
  verifyToken(clientNonce, clientToken, cn, ce))

await claim('InteropKite404', await newDevice('InteropKite404'))
await signedPost('/v1/voice/consent', {
  pseudonym: 'InteropKite404', decisions: { 'poll-response': 'granted' },
})
const interopVote = await signedPost('/v1/polls/respond', {
  pollId: 'poll_interop', optionId: 'yes',
  pseudonym: 'InteropKite404', nonce: clientNonce, signature: clientToken,
}) as { ok: boolean }
check('a vote carrying a client-issued token is accepted', interopVote.ok)

/* ---- idempotent posts ---- */

const postId = 'p_interop_retry'
await signedPost('/v1/voice/consent', {
  pseudonym: 'InteropKite404', decisions: { 'public-speech': 'granted' },
})
const firstSend = await signedPost('/v1/posts',
  { id: postId, topicId: 't_interop', pseudonym: 'InteropKite404', text: 'once' }) as { ok: boolean }
const retrySend = await signedPost('/v1/posts',
  { id: postId, topicId: 't_interop', pseudonym: 'InteropKite404', text: 'once' }) as { ok: boolean }
const interopPosts = await get('/v1/posts?topic=t_interop') as { posts: { id: string }[] }
// Both halves matter. One row alone would also be what a retry that errored
// looks like, and a client cannot tell "already have it" from "server broke".
check('a retried post is answered, not errored', firstSend.ok && retrySend.ok,
  `${firstSend.ok} then ${retrySend.ok}`)
check('a retried post is one post, not two', interopPosts.posts.length === 1,
  `${interopPosts.posts.length} row(s)`)

await claim('InteropOther77', await newDevice('InteropOther77'))
await signedPost('/v1/voice/consent', {
  pseudonym: 'InteropOther77', decisions: { 'public-speech': 'granted' },
})
const stolen = await signedPost('/v1/posts', {
  id: postId, topicId: 't_interop', pseudonym: 'InteropOther77', text: 'shadow',
}) as { ok: boolean; id: string }
check('an id aimed at somebody else\'s post gets a new one instead',
  stolen.ok && stolen.id !== postId, stolen.id)

/* ---- a pseudonym is a credential, not a claim (G-4-08) ---- */

check('the client and server canonical encoders agree',
  toSign('/v1/posts', { z: 1, a: [2, { c: 'ऐ', b: null }], at: 7 })
  === clientToSign('/v1/posts', { at: 7, a: [2, { b: null, c: 'ऐ' }], z: 1 }))

const impersonator = await newDevice()
const kite = devices.get('InteropKite404')!
const topicId = 't_credential'

const unsigned = await post('/v1/posts',
  { topicId, pseudonym: 'InteropKite404', text: 'no signature', at: Date.now() })
check('an unsigned write is rejected',
  unsigned.ok === false && unsigned.reason === 'bad-signature', unsigned.reason)

const wrongKeyPayload = { topicId, pseudonym: 'InteropKite404', text: 'not mine', at: Date.now() }
const wrongKey = await post('/v1/posts', {
  ...wrongKeyPayload, sig: await impersonator.sign('/v1/posts', wrongKeyPayload),
})
check('a write signed by the wrong key is rejected',
  wrongKey.ok === false && wrongKey.reason === 'bad-signature', wrongKey.reason)

// The route is inside what is signed, so a valid signature cannot be moved.
const liftedPayload = { topicId, pseudonym: 'InteropKite404', text: 'lifted', at: Date.now() }
const lifted = await post('/v1/posts', {
  ...liftedPayload, sig: await kite.sign('/v1/reactions', liftedPayload),
})
check('a signature lifted from another route is rejected',
  lifted.ok === false && lifted.reason === 'bad-signature', lifted.reason)

const stalePayload = {
  topicId, pseudonym: 'InteropKite404', text: 'yesterday',
  at: Date.now() - 24 * 60 * 60 * 1000,
}
const stale = await post('/v1/posts', {
  ...stalePayload, sig: await kite.sign('/v1/posts', stalePayload),
})
check('a signature replayed outside the freshness window is rejected',
  stale.ok === false && stale.reason === 'stale', stale.reason)

const rows = await get(`/v1/posts?topic=${topicId}`) as { posts: unknown[] }
check('none of the rejected writes were stored', rows.posts.length === 0,
  `${rows.posts.length} row(s)`)

const reclaim = await claim('InteropKite404', kite)
check('a repeat claim from the holding key is accepted', reclaim.ok === true, reclaim.reason)

const collision = await claim('InteropKite404', impersonator)
check('a claim on a held name from another key is refused',
  collision.ok === false && collision.reason === 'taken', collision.reason)

console.log(`\n${failures === 0 ? '✓ all passed' : `✗ ${failures} failed`}\n`)

eligDb.close()
voiceDb.close()
server.kill()
rmSync(DATA, { recursive: true, force: true })
process.exit(failures === 0 ? 0 : 1)
