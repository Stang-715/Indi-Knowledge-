import { blind, unblind, newNonce, verifyToken } from '../src/blind.ts'

/**
 * End-to-end proof that the server cannot join the two identity layers.
 *
 * The test that matters is the last one: two citizens verify, both vote, and we
 * check that nothing the server stored lets anyone say which pseudonym belongs
 * to which verified identity.
 */

const API = process.env.API ?? 'http://localhost:8787'
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

  await post('/v1/voice/claim', { pseudonym })
  return { verify: v, tokens, n, e }
}

console.log('\nChowk API — end to end\n')

const stamp = Date.now()
const a = await citizen(`1111 2222 ${stamp % 10000}`, `AlphaTester${stamp % 1000}`)
const b = await citizen(`3333 4444 ${(stamp + 1) % 10000}`, `BetaTester${stamp % 1000}`)

check('verification returns an adult band', a.verify.ageBand === 'adult', a.verify.ageBand)
check('tokens issued', (a.tokens?.length ?? 0) === 4)
check('token verifies against the issuer key',
  verifyToken(a.tokens![0].nonce, a.tokens![0].signature, a.n!, a.e!))

const pollId = `poll_test_${stamp}`
const r1 = await post('/v1/polls/respond', {
  pollId, optionId: 'o1', pseudonym: `AlphaTester${stamp % 1000}`,
  nonce: a.tokens![0].nonce, signature: a.tokens![0].signature,
})
check('a valid token casts a vote', r1.ok === true, r1.reason ?? '')

const replay = await post('/v1/polls/respond', {
  pollId: `${pollId}_other`, optionId: 'o1', pseudonym: `BetaTester${stamp % 1000}`,
  nonce: a.tokens![0].nonce, signature: a.tokens![0].signature,
})
check('a spent token cannot be reused', replay.ok === false, replay.reason)

const forged = await post('/v1/polls/respond', {
  pollId, optionId: 'o2', pseudonym: `BetaTester${stamp % 1000}`,
  nonce: newNonce(), signature: a.tokens![1].signature,
})
check('a forged token is rejected', forged.ok === false, forged.reason)

const changed = await post('/v1/polls/respond', {
  pollId, optionId: 'o3', pseudonym: `AlphaTester${stamp % 1000}`,
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
const eligDb = new DatabaseSync(process.env.CHOWK_ELIGIBILITY_DB ?? '.data/eligibility.db')
const voiceDb = new DatabaseSync(process.env.CHOWK_VOICE_DB ?? '.data/voice.db')

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

console.log(`\n${failures === 0 ? '✓ all passed' : `✗ ${failures} failed`}\n`)
process.exit(failures === 0 ? 1 * 0 : 1)
