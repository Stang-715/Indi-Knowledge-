#!/usr/bin/env node
/*
 * End-to-end: the app, in a browser, against the real API.
 *
 * The phase's exit criterion is that the client talks to the server without a
 * single screen changing, and that it keeps working when the connection does
 * not. Neither half can be shown by a unit test — the first is a claim about
 * what the repository layer does behind the same synchronous API the screens
 * already call, and the second is a claim about a browser with its network
 * turned off.
 *
 * So this starts a real API on its own databases, serves the real client, and
 * drives the real modules in a real Chromium: verify, draw blind tokens, claim
 * a pseudonym, consent, vote, post — offline and on.
 *
 * Run with `npm run check:transport`.
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { webcrypto } from 'node:crypto'
import { chromium } from 'playwright'
import { toSign } from '../src/core/canonical.ts'

/*
 * Ports are taken fresh, not fixed.
 *
 * A run that timed out once left a dev server holding 5199. The next run's own
 * server could not bind, waited for the port, found the stale one answering,
 * and tested it instead — against a database from the previous run. Two
 * assertions failed for a reason that had nothing to do with the code. So the
 * ports are checked for a listener first, and a child that dies is fatal
 * rather than quietly replaced by whatever else is listening.
 */
async function freePort(from) {
  for (let port = from; port < from + 40; port += 1) {
    try {
      await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(400) })
    } catch (err) {
      if (String(err).includes('ECONNREFUSED') || String(err).includes('fetch failed')) return port
    }
  }
  throw new Error(`no free port from ${from}`)
}

const API_PORT = Number(process.env.API_PORT ?? await freePort(8800))
const WEB_PORT = Number(process.env.WEB_PORT ?? await freePort(5300))
const API = `http://localhost:${API_PORT}`
const WEB = `http://localhost:${WEB_PORT}`
const DATA = mkdtempSync(join(tmpdir(), 'chowk-e2e-'))
const SERVER_DIR = new URL('../../server', import.meta.url).pathname

let failures = 0
const check = (name, pass, detail = '') => {
  console.log(`${pass ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!pass) failures += 1
}

async function waitFor(url, tries = 150) {
  for (let i = 0; i < tries; i += 1) {
    try { await fetch(url); return true } catch { await new Promise((r) => setTimeout(r, 200)) }
  }
  return false
}

const api = spawn(process.execPath, [
  '--experimental-strip-types', '--disable-warning=ExperimentalWarning', 'src/http.ts',
], {
  cwd: SERVER_DIR,
  env: {
    ...process.env,
    PORT: String(API_PORT),
    CHOWK_ELIGIBILITY_DB: join(DATA, 'eligibility.db'),
    CHOWK_VOICE_DB: join(DATA, 'voice.db'),
    CHOWK_AUDIT_DB: join(DATA, 'audit.db'),
    CHOWK_WORKS_DB: join(DATA, 'works.db'),
  },
  stdio: 'ignore',
})

const web = spawn('npx', ['vite', '--port', String(WEB_PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  env: { ...process.env, VITE_API_BASE: API },
  stdio: 'ignore',
})

const stop = () => {
  api.kill(); web.kill()
  rmSync(DATA, { recursive: true, force: true })
}
process.on('exit', stop)

for (const [name, child] of [['API', api], ['dev server', web]]) {
  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`\n${name} exited with ${code} — nothing was tested.\n`)
      process.exit(1)
    }
  })
}

if (!(await waitFor(`${API}/v1/audit`))) { console.error('API did not start'); stop(); process.exit(1) }
if (!(await waitFor(WEB))) { console.error('dev server did not start'); stop(); process.exit(1) }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
await page.goto(WEB, { waitUntil: 'domcontentloaded' })

/* The real modules, loaded the way the app loads them. */
const setup = await page.evaluate(async () => {
  const id = await import('/src/core/identity.ts')
  const consent = await import('/src/core/consent.ts')
  window.__chowk = {
    id,
    consent,
    repo: await import('/src/data/repo.ts'),
    sync: await import('/src/core/sync.ts'),
    pull: await import('/src/core/pull.ts'),
    deptkey: await import('/src/core/deptkey.ts'),
    institution: await import('/src/core/institution.ts'),
    api: await import('/src/core/api.ts'),
  }
  const record = await id.recordVerification('E2E-12345671', 'National ID Verification Service')
  const tokens = await id.refillTokens()
  id.setPseudonym('SteadyFerry912')
  consent.decideAll('granted', 'en')
  return { ageBand: record.ageBand, tokens }
})

console.log('\nChowk transport — the client against the API\n')
check('the verification service answers, and its band is used',
  setup.ageBand === 'adult', setup.ageBand)
check('the device holds unlinkable tokens it blinded itself',
  setup.tokens > 0, `${setup.tokens} tokens`)

/* --- a vote written offline, sent when the connection returns --- */

await context.setOffline(true)

const offline = await page.evaluate(async () => {
  const { repo, sync } = window.__chowk
  const poll = repo.listPolls()[0]
  repo.castVote(poll.id, poll.options[0].id)
  const result = await sync.flush()
  return {
    pollId: poll.id,
    optionId: poll.options[0].id,
    recorded: repo.myResponse(poll.id)?.optionId ?? null,
    pending: sync.pendingCount(),
    offline: result.offline,
    sent: result.sent,
  }
})

check('a vote cast with no connection is recorded on the device',
  offline.recorded === offline.optionId, offline.recorded ?? 'nothing')
check('and is held in the queue rather than lost',
  offline.pending > 0 && offline.sent === 0, `${offline.pending} queued`)
check('and the flush reports the connection, not an error', offline.offline === true)

await context.setOffline(false)

const online = await page.evaluate(async () => {
  const { sync } = window.__chowk
  const result = await sync.flush()
  return {
    sent: result.sent, pending: sync.pendingCount(), refused: result.refused.length,
    claim: sync.claimState(), onLine: navigator.onLine, offline: result.offline,
  }
})

check('the queue drains when the connection returns',
  online.sent > 0 && online.pending === 0,
  `${online.sent} sent, ${online.pending} left, ${online.refused} refused, ` +
  `pseudonym ${online.claim?.state ?? 'unregistered'}`)

const tally = await (await fetch(`${API}/v1/polls/aggregate?poll=${offline.pollId}`)).json()
check('the server holds the vote', tally.total === 1, `total ${tally.total}`)

/* --- a post written offline, and what the next read shows --- */

await context.setOffline(true)
const posted = await page.evaluate(async () => {
  const { repo, sync } = window.__chowk
  const topic = repo.listTopics()[0]
  const post = repo.addPost(topic.id, 'Written on a train with no signal.', 'mixed')
  await sync.flush()
  return {
    topicId: topic.id,
    id: post.id,
    visible: repo.listPosts(topic.id).some((p) => p.id === post.id),
    pending: sync.pendingCount(),
  }
})
check('a post written offline is visible immediately', posted.visible)
check('and waits in the queue', posted.pending > 0, `${posted.pending} queued`)

await context.setOffline(false)
const drained = await page.evaluate(async () => {
  const { sync } = window.__chowk
  const result = await sync.flush()
  return {
    sent: result.sent, pending: sync.pendingCount(),
    offline: result.offline, refused: result.refused.map((r) => r.reason),
    queue: sync.queue().map((o) => `${o.kind}/${o.tries}`),
  }
})
check('the post reaches the server on reconnection',
  drained.sent > 0 && drained.pending === 0,
  `${drained.sent} sent, refused=[${drained.refused}], queue=[${drained.queue}]`)

const rows = await (await fetch(`${API}/v1/posts?topic=${posted.topicId}`)).json()
check('the server stored it under the id the device chose',
  rows.posts.some((p) => p.id === posted.id), rows.posts.map((p) => p.id).join(','))

/* --- and the read side brings it back without duplicating it --- */

const reread = await page.evaluate(async (topicId) => {
  const { repo, pull } = window.__chowk
  await pull.pullPosts(topicId)
  const posts = repo.listPosts(topicId)
  return { count: posts.filter((p) => p.body === 'Written on a train with no signal.').length }
}, posted.topicId)
check('a post fetched back is the same post, not a second copy',
  reread.count === 1, `${reread.count} copies`)

/* --- consent is enforced by the server, not only by the screen --- */

const refusedWrite = await page.evaluate(async (topicId) => {
  const { consent, sync } = window.__chowk
  consent.decide(consent.loadConsent(), 'public-speech', 'refused', 'en')
  await sync.flush()                       // send the withdrawal
  // Reach past the client's own check, to prove the server refuses it too and
  // that the app is not relying on its own screens to hold the line.
  sync.enqueue('post', 'p_forced_e2e', {
    id: 'p_forced_e2e', topicId, text: 'after withdrawal', stance: 'mixed',
  })
  // A refusal that something later in the queue might fix is retried before it
  // is surfaced, so this drives it to the bound rather than reading once.
  const reasons = []
  for (let i = 0; i < 8 && sync.pendingCount() > 0; i += 1) {
    const result = await sync.flush()
    reasons.push(...result.refused.map((r) => r.reason))
  }
  return { reasons, kept: sync.pendingCount() }
}, posted.topicId)
check('a write after withdrawal is refused by the server, not only by the screen',
  refusedWrite.reasons.includes('no-consent'),
  refusedWrite.reasons.join(',') || `${refusedWrite.kept} still queued`)

const afterWithdrawal = await (await fetch(`${API}/v1/posts?topic=${posted.topicId}`)).json()
check('and the refused post is nowhere on the server',
  !afterWithdrawal.posts.some((p) => p.id === 'p_forced_e2e'),
  `${afterWithdrawal.posts.length} post(s)`)

/* --- the pseudonym is a credential, not a claim (G-4-08) --- */

const keyShape = await page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open('chowk-voice-key', 1)
    req.onsuccess = () => { resolve(req.result) }
    req.onerror = () => { reject(req.error) }
  })
  const held = await new Promise((resolve, reject) => {
    const req = db.transaction('key').objectStore('key').get('SteadyFerry912')
    req.onsuccess = () => { resolve(req.result) }
    req.onerror = () => { reject(req.error) }
  })
  return {
    found: Boolean(held),
    privateExtractable: held?.privateKey?.extractable ?? null,
    usages: held?.privateKey?.usages ?? [],
  }
})
check('the signing key is stored under the pseudonym it belongs to', keyShape.found)
check('and cannot be exported, only used',
  keyShape.privateExtractable === false && keyShape.usages.includes('sign'),
  `extractable=${keyShape.privateExtractable}`)

/* Another device, holding its own key, tries to write under the name. This is
   the attack the whole gap describes: a pseudonym is public, so anyone can
   type it. */
const other = await webcrypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'],
)
const forgedPayload = {
  topicId: posted.topicId, pseudonym: 'SteadyFerry912',
  text: 'Posted by somebody else.', stance: 'mixed', at: Date.now(),
}
const forgedSig = Buffer.from(await webcrypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' }, other.privateKey,
  Buffer.from(toSign('/v1/posts', forgedPayload)),
)).toString('hex')
const forged = await (await fetch(`${API}/v1/posts`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ...forgedPayload, sig: forgedSig }),
})).json()
check('a write from another device under this name is refused',
  forged.ok === false && forged.reason === 'bad-signature', forged.reason)

/* And a name somebody else holds cannot be adopted by this device. */
const takenName = 'HeldElsewhere42'
const takerPayload = {
  pseudonym: takenName, at: Date.now(),
  publicKey: (({ kty, crv, x, y }) => ({ kty, crv, x, y }))(
    await webcrypto.subtle.exportKey('jwk', other.publicKey),
  ),
}
const taken = await (await fetch(`${API}/v1/voice/claim`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    ...takerPayload,
    sig: Buffer.from(await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' }, other.privateKey,
      Buffer.from(toSign('/v1/voice/claim', takerPayload)),
    )).toString('hex'),
  }),
})).json()
check('another device holds the name first', taken.ok === true, taken.reason)

const collided = await page.evaluate(async (name) => {
  const { consent, id, repo, sync } = window.__chowk
  consent.decide(consent.loadConsent(), 'public-speech', 'granted', 'en')
  await sync.flush()
  id.setPseudonym(name)
  const topic = repo.listTopics()[0]
  repo.addPost(topic.id, 'Should never be stored.', 'mixed')
  const result = await sync.flush()
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open('chowk-voice-key', 1)
    req.onsuccess = () => { resolve(req.result) }
    req.onerror = () => { reject(req.error) }
  })
  const strayKey = await new Promise((resolve, reject) => {
    const req = db.transaction('key').objectStore('key').get(name)
    req.onsuccess = () => { resolve(Boolean(req.result)) }
    req.onerror = () => { reject(req.error) }
  })
  return {
    collides: sync.pseudonymCollides(), sent: result.sent,
    kept: sync.pendingCount(), strayKey,
  }
}, takenName)
check('a pseudonym somebody else holds is detected, not written through',
  collided.collides === true && collided.sent === 0 && collided.kept > 0,
  `collides=${collided.collides}, sent=${collided.sent}, kept=${collided.kept}`)
check('and the key made for it is forgotten', collided.strayKey === false)

/* --- Phase 7: a department files, a clash blocks, a permit issues --- */

const desk = await page.evaluate(async () => {
  const { deptkey } = window.__chowk
  const base = window.__chowk.api.API_BASE
  const api = (path, body) => fetch(`${base}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

  const enrol = async (id, name, utility, approver) => {
    const publicKey = await deptkey.departmentPublicKey(id)
    const payload = { id, name, utility, publicKey, approver }
    const sig = await deptkey.signAs(id, '/v1/registry/enrol', payload)
    return api('/v1/registry/enrol', { ...payload, sig })
  }

  const water = await enrol('e2e_water', 'E2E Water Division', 'water', false)
  const roads = await enrol('e2e_roads', 'E2E Roads Department', 'road', true)

  const DAY = 86400000
  const stretch = `e2e_stretch_${Date.now()}`
  const fileWork = async (dept, id, from, to) => {
    const payload = {
      id, department: dept, stretch, utility: 'water',
      reason: 'End to end.', closure: 'partial', startsAt: from, restoreBy: to,
    }
    const sig = await deptkey.signAs(dept, '/v1/works/file', payload)
    return api('/v1/works/file', { ...payload, sig })
  }

  const now = Date.now()
  const a = await fileWork('e2e_water', `e2e_a_${now}`, now + DAY, now + 10 * DAY)
  const b = await fileWork('e2e_roads', `e2e_b_${now}`, now + 5 * DAY, now + 15 * DAY)

  const decide = async (dept, filing, decision) => {
    const payload = { filing, department: dept, decision, note: 'e2e' }
    const sig = await deptkey.signAs(dept, '/v1/works/decide', payload)
    return api('/v1/works/decide', { ...payload, sig })
  }

  const blocked = await decide('e2e_roads', `e2e_b_${now}`, 'approve')
  await decide('e2e_roads', `e2e_a_${now}`, 'refuse')
  const issued = await decide('e2e_roads', `e2e_b_${now}`, 'approve')

  return {
    waterOk: water.ok === true,
    gate: water.gate,
    filedState: a.state,
    clashState: b.state,
    blockedReason: blocked.reason,
    permit: issued.permit?.number ?? null,
  }
})

check('a department enrols from the desk and the gate says it is automatic',
  desk.waterOk && desk.gate === 'automatic', desk.gate)
check('the first filing on a free stretch is filed', desk.filedState === 'filed', desk.filedState)
check('an overlapping filing comes back clashed', desk.clashState === 'clashed', desk.clashState)
check('approval is refused while the clash stands',
  desk.blockedReason === 'clash-stands', desk.blockedReason)
check('and once resolved a permit issues', Boolean(desk.permit), String(desk.permit))

/* The check a person next to the barrier makes, in their own browser, against
   a key their phone pinned rather than one the server asserted. */
const verified = await page.evaluate(async (number) => {
  const { institution } = window.__chowk
  const good = await institution.checkPermit(number)
  const missing = await institution.checkPermit('CHK-26-000000')
  return {
    found: good.found, valid: good.valid, pinning: good.pinning,
    enrolledBy: good.department?.enrolledBy ?? null,
    missingFound: missing.found,
  }
}, desk.permit)

check('a citizen can look the permit up with no account', verified.found)
check('and the phone verifies the signature itself against the pinned root',
  verified.valid === true, `pinning=${verified.pinning}`)
check('the permit names a department the register vouches for',
  verified.enrolledBy === 'automatic', String(verified.enrolledBy))
check('an invented permit number is not found', verified.missingFound === false)

await browser.close()
console.log(`\n${failures === 0 ? '✓ the client runs on the API, online and off.' : `✗ ${failures} failed`}\n`)
stop()
process.exit(failures === 0 ? 0 : 1)
