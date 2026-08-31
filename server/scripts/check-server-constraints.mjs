#!/usr/bin/env node
/*
 * Server-side architectural constraints.
 *
 * The client has its own check. This is the other half, and it matters more:
 * every promise the client makes about not joining the identity layers is one
 * the server can quietly break, and nobody would see it from the outside.
 *
 * Run: npm run check:constraints
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|js|mjs)$/.test(p)) out.push(p)
  }
  return out
}

const files = walk(ROOT).map((path) => ({
  rel: relative(ROOT, path).replace(/\\/g, '/'),
  raw: readFileSync(path, 'utf8'),
  code: readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``'),
}))

const problems = []
const add = (rule, where, detail) => problems.push({ rule, where, detail })

/* 1. Only http.ts may see both stores, and only to hand each its own key.
 *
 * Matched against the raw source, not the comment-and-string-stripped copy:
 * an import path IS a string literal, so the stripped version cannot see it.
 * The first version of this rule scanned the stripped copy and passed a file
 * that imported both stores. */
const BOTH_ALLOWED = ['http.ts']
const importsFrom = (raw, mod) =>
  new RegExp(`from\\s+['"][^'"]*${mod}`).test(raw)
for (const f of files) {
  // A file reaches a store either by importing it or by being it. The first
  // version tested "imports both", which could never catch db-voice.ts
  // importing db-eligibility — a store does not import itself.
  const reachesElig = f.rel === 'db-eligibility.ts' || importsFrom(f.raw, 'db-eligibility')
  const reachesVoice = f.rel === 'db-voice.ts' || importsFrom(f.raw, 'db-voice')
  if (reachesElig && reachesVoice && !BOTH_ALLOWED.includes(f.rel)) {
    add('split', f.rel,
      'can reach both the eligibility and the voice store. Only http.ts may, and ' +
      'only to pass an idHash to one and a pseudonym to the other.')
  }
}

/* 2. Neither store may grow a column belonging to the other side. */
const CROSS = {
  'db-eligibility.ts': /\b(pseudonym|post|response|reaction|option_id)\b/,
  'db-voice.ts': /\b(id_hash|identity|aadhaar|age_band|attested_by)\b/,
}
/* The schema lives inside a template literal, which the stripped copy blanks —
 * so the CREATE TABLE text is pulled out of the raw source and scanned directly.
 * Scanning the whole raw file instead would fire on the prose in the comments. */
const schemaOf = (raw) => {
  const m = raw.match(/db\.exec\(`([\s\S]*?)`\)/g) ?? []
  return m.join('\n')
}
for (const f of files) {
  const pattern = CROSS[f.rel]
  if (pattern && pattern.test(schemaOf(f.raw))) {
    add('schema', f.rel,
      `references a column belonging to the other identity layer (${pattern}). ` +
      'The two stores are separate database files precisely so this cannot be joined.')
  }
}

/* 3. The audit trail stays append-only. */
const auditFile = files.find((f) => f.rel === 'db-audit.ts')
if (auditFile) {
  if (/export function (delete|remove|update|edit|clear|purge)/i.test(auditFile.code)) {
    add('audit', auditFile.rel, 'exports a mutation. The trail is append-only.')
  }
  if (!/RAISE\(ABORT/.test(auditFile.raw)) {
    add('audit', auditFile.rel,
      'has lost the triggers that block UPDATE and DELETE at the database level. ' +
      'Absent them, append-only is a convention rather than a guarantee.')
  }
}

/* 4. No IP address may be read, logged or stored. */
for (const f of files) {
  if (/remoteAddress|x-forwarded-for|socket\.address\(\)/i.test(f.code)) {
    add('network', f.rel,
      'touches the client address. Blinding makes an eligibility token unlinkable, ' +
      'and one access log keyed by IP re-links both halves.')
  }
}

/* 5. Aggregation must suppress small cells with no escape clause. */
const http = files.find((f) => f.rel === 'http.ts')
if (http) {
  if (!/MIN_CELL/.test(http.code)) {
    add('aggregate', 'http.ts', 'no small-cell suppression found in the aggregate route.')
  }
  if (/total\s*<\s*MIN_CELL/.test(http.code)) {
    add('aggregate', 'http.ts',
      'suppression has regained a small-total escape. That clause inverts the rule — ' +
      'a breakdown is most identifying precisely when there are fewest responses.')
  }
  // A route returning response rows would defeat the aggregation boundary.
  if (/SELECT[^;]*FROM\s+response(?![^;]*GROUP BY)/i.test(http.raw)) {
    add('aggregate', 'http.ts',
      'reads individual response rows. Only counts may leave this boundary.')
  }
}

/* 6. Spent tokens must carry nothing that correlates them with issue. */
const eligFile = files.find((f) => f.rel === 'db-eligibility.ts')
if (eligFile && /CREATE TABLE IF NOT EXISTS spent[\s\S]*?\)/.test(eligFile.raw)) {
  const spent = eligFile.raw.match(/CREATE TABLE IF NOT EXISTS spent[\s\S]*?\);/)[0]
  if (/\b(at|spent_at|created_at|timestamp)\b/i.test(spent)) {
    add('unlinkability', 'db-eligibility.ts',
      'the spent-token table has gained a timestamp. Recording when a token was spent, ' +
      'beside when it was issued, re-creates by correlation the link blinding removes.')
  }
}

/* 7. Every write that speaks under a pseudonym must be signed.
 *
 * A name is printed next to every post, so it cannot also be the proof of who
 * is speaking. A route that takes a pseudonym and writes without checking a
 * signature accepts that write from anybody who can type the name.
 *
 * `seen` is the one deliberate exception: it carries no pseudonym at all,
 * because a reach count must never become a per-citizen read receipt. It is
 * listed here by name so that dropping the signature from a route that does
 * name a pseudonym cannot pass by being quietly added to an exception list. */
const UNSIGNED_BY_DESIGN = new Set(['POST /v1/notices/seen'])
if (http) {
  const routeBlocks = http.raw.split(/\n  '(?=POST |GET )/).slice(1)
  for (const block of routeBlocks) {
    const key = block.slice(0, block.indexOf("'"))
    if (!key.startsWith('POST ') || UNSIGNED_BY_DESIGN.has(key)) continue
    /* Comments and string literals are stripped before the test. The first
       version scanned the raw block and accused the two eligibility routes,
       which mention a pseudonym only to say they have never seen one. */
    const body = block
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
      .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
      .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    // Only routes that act on a pseudonym; the eligibility routes have none.
    if (!/\bpseudonym\b/.test(body)) continue
    if (!/signedBy\(|checkSignature\(/.test(body)) {
      add('credential', `http.ts ${key}`,
        'writes under a pseudonym without verifying the signature of the key that ' +
        'claimed it. Without that check the name is a claim anyone can make, not a ' +
        'credential — see G-4-08.')
    }
  }
}

const RULES = {
  split: 'The two identity layers must not meet',
  credential: 'A pseudonym is proved by a key, not by knowing the name',
  schema: 'Neither store may carry the other side’s columns',
  audit: 'The audit trail is append-only',
  network: 'No IP address is read, logged or stored',
  aggregate: 'Only aggregates cross the boundary',
  unlinkability: 'Nothing may correlate token issue with token spend',
}

if (problems.length > 0) {
  console.error('\nServer constraints violated:\n')
  const grouped = new Map()
  for (const p of problems) {
    if (!grouped.has(p.rule)) grouped.set(p.rule, [])
    grouped.get(p.rule).push(p)
  }
  for (const [rule, items] of grouped) {
    console.error(`  ${RULES[rule]}`)
    for (const i of items) console.error(`    ✗ ${i.where} — ${i.detail}`)
    console.error('')
  }
  process.exit(1)
}

console.log(`✓ ${files.length} server files checked — the identity split holds.`)
