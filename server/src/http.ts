import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createHash } from 'node:crypto'
import * as elig from './db-eligibility.ts'
import * as voice from './db-voice.ts'
import * as audit from './db-audit.ts'
import { BATCH, makeIssuer, signBlinded, verifyToken, type IssuerKeys } from './blind.ts'

/**
 * The Chowk API.
 *
 * Shaped to match `app/src/data/repo.ts` so the client's transport can be swapped
 * without any caller changing.
 *
 * Two things this file must never do, both checked by the server constraint
 * check rather than left to review:
 *
 *   - Log or store an IP address. Blinding makes the eligibility token
 *     unlinkable, and an access log keyed by IP would re-link both halves in one
 *     line. There is no request logging here for that reason.
 *   - Import both db-eligibility and db-voice into one module that could query
 *     across them. This file imports both, so it is the one place the rule has
 *     to be held by hand — it passes an idHash to one and a pseudonym to the
 *     other, and never a value derived from both.
 */

/* ------------------------------ issuer key ------------------------------- */

let issuer: IssuerKeys
{
  const stored = elig.loadIssuerJwk()
  if (stored) {
    // Rehydrating a key from JWK across restarts keeps tokens issued before a
    // restart valid — otherwise every deploy silently invalidates every vote in
    // flight.
    const { createPrivateKey, createPublicKey } = await import('node:crypto')
    const key = createPrivateKey({ key: JSON.parse(stored), format: 'jwk' })
    const jwk = key.export({ format: 'jwk' }) as { n: string; e: string; d: string }
    const toInt = (s: string) => BigInt('0x' + Buffer.from(s, 'base64url').toString('hex'))
    issuer = {
      privateKey: key, publicKey: createPublicKey(key),
      n: toInt(jwk.n), e: toInt(jwk.e), d: toInt(jwk.d),
    }
  } else {
    issuer = makeIssuer(2048)
    elig.saveIssuerJwk(JSON.stringify(issuer.privateKey.export({ format: 'jwk' })))
  }
}

/* -------------------------------- helpers -------------------------------- */

const json = (res: ServerResponse, code: number, body: unknown) => {
  const payload = JSON.stringify(body)
  res.writeHead(code, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'cache-control': 'no-store',
  })
  res.end(payload)
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

const hashId = (raw: string) =>
  createHash('sha256').update(`cdp-v1:${raw.replace(/\s+/g, '').toUpperCase()}`).digest('hex')

/** k-anonymity: a breakdown cell below this is suppressed, never the total. */
const MIN_CELL = 5

/** Bumped in lockstep with the client's NOTICE_VERSION. */
const NOTICE_VERSION = 1

/**
 * Which writes the server checks consent for, and which it cannot.
 *
 * Only writes that already carry a pseudonym are checkable here. Marking a
 * notice as seen is deliberately anonymous — it increments a counter and
 * carries no identifier at all — so there is nothing for the server to look
 * consent up against. Adding one so the check could run would manufacture the
 * per-citizen read receipt the consent is there to prevent, which is a worse
 * outcome than enforcing that particular purpose on the client alone.
 *
 * So: attributable writes are gated here; anonymous ones are gated in the app,
 * and that asymmetry is a property of the data rather than an oversight.
 */
const GATED = {
  'poll-response': 'casting or changing a vote',
  'public-speech': 'posting or reacting',
} as const

/* -------------------------------- routes --------------------------------- */

const routes: Record<string, (body: Record<string, unknown>, url: URL) => unknown> = {

  /* --- eligibility: verify once, then draw a batch of blind signatures --- */

  'POST /v1/eligibility/verify': (body) => {
    const raw = String(body.identifier ?? '')
    if (raw.replace(/\s/g, '').length < 8) return { ok: false, reason: 'invalid' }
    const idHash = hashId(raw)
    // In production the band comes from the ID service. Here it stands in.
    const ageBand: elig.AgeBand = raw.replace(/\s/g, '').endsWith('0') ? 'minor' : 'adult'
    elig.recordVerified(idHash, ageBand, 'National ID Verification Service')
    audit.append('automated', 'Eligibility service', 'verify', 'one identity',
      'A citizen verified. No pseudonym is known to this store.')
    return {
      ok: true, ageBand,
      // The client keeps this. The server keeps only the hash.
      idHash,
      issuer: { n: issuer.n.toString(16), e: issuer.e.toString(16) },
      batch: BATCH,
    }
  },

  /**
   * Signs a batch of blinded values. The server sees noise, and learns only
   * that this identity drew tokens — never which tokens.
   */
  'POST /v1/eligibility/tokens': (body) => {
    const idHash = String(body.idHash ?? '')
    const blinded = Array.isArray(body.blinded) ? (body.blinded as string[]) : []
    const row = elig.findVerified(idHash)
    if (!row) return { ok: false, reason: 'not-verified' }
    if (row.age_band !== 'adult') return { ok: false, reason: 'not-adult' }
    if (blinded.length === 0 || blinded.length > BATCH) return { ok: false, reason: 'bad-batch' }
    if (!elig.countIssue(idHash, blinded.length)) return { ok: false, reason: 'exhausted' }
    return { ok: true, signatures: blinded.map((b) => signBlinded(b, issuer)) }
  },

  /* --- voice: a pseudonym, claimed without presenting any eligibility --- */

  'POST /v1/voice/claim': (body) => {
    const name = String(body.pseudonym ?? '').trim()
    if (name.length < 4 || name.length > 24) return { ok: false, reason: 'invalid' }
    return { ok: voice.claimPseudonym(name), reason: 'taken' }
  },

  /* --- voting: eligibility token + pseudonym, unlinkable to each other --- */

  'POST /v1/polls/respond': (body) => {
    const { pollId, optionId, pseudonym, nonce, signature } = body as Record<string, string>
    if (!pollId || !optionId || !pseudonym || !nonce || !signature) {
      return { ok: false, reason: 'incomplete' }
    }
    if (!voice.pseudonymExists(pseudonym)) return { ok: false, reason: 'unknown-pseudonym' }
    // Consent before eligibility: a refusal should not cost a token to discover.
    if (!voice.hasConsent(pseudonym, 'poll-response', NOTICE_VERSION)) {
      return { ok: false, reason: 'no-consent', purpose: 'poll-response' }
    }
    if (!verifyToken(nonce, signature, issuer.n, issuer.e)) {
      return { ok: false, reason: 'bad-token' }
    }
    const existing = voice.myResponse(pollId, pseudonym)
    // Changing a vote must not cost a second token, or the edit window becomes
    // a tax on changing your mind.
    if (!existing && !elig.spend(nonce)) return { ok: false, reason: 'token-spent' }
    voice.upsertResponse(pollId, pseudonym, optionId)
    return { ok: true }
  },

  'GET /v1/polls/aggregate': (_b, url) => {
    const pollId = url.searchParams.get('poll') ?? ''
    const rows = voice.tally(pollId)
    const total = rows.reduce((s, r) => s + r.n, 0)
    // No small-total escape: a breakdown is most identifying precisely when
    // there are fewest responses.
    const kept = rows.filter((r) => r.n >= MIN_CELL)
    return {
      total,
      buckets: kept.map((r) => ({ key: r.option_id, count: r.n })),
      suppressed: rows.length - kept.length,
    }
  },

  /* --- discussion --- */

  'POST /v1/posts': (body) => {
    const { topicId, pseudonym, text, stance } = body as Record<string, string>
    if (!topicId || !pseudonym || !text) return { ok: false, reason: 'incomplete' }
    if (!voice.pseudonymExists(pseudonym)) return { ok: false, reason: 'unknown-pseudonym' }
    if (!voice.hasConsent(pseudonym, 'public-speech', NOTICE_VERSION)) {
      return { ok: false, reason: 'no-consent', purpose: 'public-speech' }
    }
    if (text.length > 600) return { ok: false, reason: 'too-long' }
    // The client rate-limits as a courtesy; this is the control.
    if (!voice.rateAllows(`post:${pseudonym}`, 5, 60 * 60 * 1000)) {
      return { ok: false, reason: 'rate-limited' }
    }
    /* The client may name the post. It has to be able to: a post written
       offline is shown immediately under an id the device chose, and if the
       server minted a different one on arrival the same post would come back
       from the next fetch as a second copy. An id is accepted only in the shape
       ids take, and only if it is free or already this pseudonym's — a retry is
       then idempotent, while an id aimed at somebody else's post is simply
       replaced rather than allowed to shadow it. */
    const given = String(body.id ?? '')
    const owner = /^p_[a-z0-9_]{3,40}$/.test(given) ? voice.postAuthor(given) : undefined
    const usable = /^p_[a-z0-9_]{3,40}$/.test(given) && (owner === undefined || owner === pseudonym)
    const id = usable
      ? given
      : `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
    voice.insertPost(id, topicId, pseudonym, text, stance || 'mixed')
    return { ok: true, id }
  },

  'GET /v1/posts': (_b, url) =>
    ({ posts: voice.listPosts(url.searchParams.get('topic') ?? '') }),

  'POST /v1/reactions': (body) => {
    const { postId, pseudonym, kind } = body as Record<string, string>
    if (!voice.pseudonymExists(pseudonym)) return { ok: false, reason: 'unknown-pseudonym' }
    if (!voice.hasConsent(pseudonym, 'public-speech', NOTICE_VERSION)) {
      return { ok: false, reason: 'no-consent', purpose: 'public-speech' }
    }
    voice.setReaction(postId, pseudonym, kind === 'none' ? null : kind)
    return { ok: true }
  },

  /* --- consent --- */

  'POST /v1/voice/consent': (body) => {
    const pseudonym = String(body.pseudonym ?? '')
    const decisions = body.decisions as Record<string, string> | undefined
    if (!voice.pseudonymExists(pseudonym)) return { ok: false, reason: 'unknown-pseudonym' }
    if (!decisions) return { ok: false, reason: 'incomplete' }
    for (const [purpose, decision] of Object.entries(decisions)) {
      if (decision !== 'granted' && decision !== 'refused') continue
      voice.setConsent(pseudonym, purpose, decision, NOTICE_VERSION)
    }
    audit.append('automated', 'Consent intake', 'consent.record', 'one pseudonym',
      `Decisions recorded against notice version ${NOTICE_VERSION}. ` +
      'Which identity this pseudonym belongs to is not known to this server.')
    return { ok: true, gated: Object.keys(GATED) }
  },

  'GET /v1/voice/consent': (_b, url) =>
    ({ decisions: voice.listConsent(url.searchParams.get('pseudonym') ?? '') }),

  /* --- notices: reach is a counter, never a list of readers --- */

  'POST /v1/notices/seen': (body) => {
    voice.bumpReach(String(body.noticeId ?? ''))
    return { ok: true }
  },

  'GET /v1/notices/reach': (_b, url) =>
    ({ seen: voice.reach(url.searchParams.get('notice') ?? '') }),

  /* --- oversight --- */

  'GET /v1/audit': () => ({ entries: audit.list() }),
}

/* -------------------------------- server --------------------------------- */

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})

  const url = new URL(req.url ?? '/', 'http://localhost')
  const key = `${req.method} ${url.pathname}`
  const handler = routes[key]
  if (!handler) return json(res, 404, { error: 'no such route' })

  try {
    const body = req.method === 'POST' ? await readBody(req) : {}
    return json(res, 200, handler(body, url))
  } catch (err) {
    // The message only, never the request: a stack trace with a body in it is
    // a log of what somebody said.
    return json(res, 500, { error: (err as Error).message })
  }
})

const PORT = Number(process.env.PORT ?? 8787)
server.listen(PORT, () => {
  console.log(`Chowk API on :${PORT} — eligibility, voice and audit in separate databases`)
})
