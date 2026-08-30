#!/usr/bin/env node
/*
 * Architectural constraint check.
 *
 * Section 0 of the spec says the privacy properties must be hard constraints
 * rather than configurable settings, on the assumption that the next
 * administration may not share the current one's values. A comment saying so
 * is not a constraint. This is: it fails the build.
 *
 * Run with `npm run check:constraints` (and as part of `npm test`).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else if (/\.(ts|tsx)$/.test(path)) out.push(path)
  }
  return out
}

const files = walk(ROOT).map((path) => ({
  path,
  rel: relative(ROOT, path),
  // Strip comments and string literals: we are checking what the code *does*,
  // not what it says about itself. The principle text names these APIs on
  // purpose, and that must not trip the check.
  code: readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``'),
}))

const failures = []

/* Principle 1 — no location or movement tracking, under any framing. */
const LOCATION_APIS = [
  /navigator\s*\.\s*geolocation/,
  /getCurrentPosition\s*\(/,
  /watchPosition\s*\(/,
  /\bGeolocationPosition\b/,
]
for (const file of files) {
  for (const pattern of LOCATION_APIS) {
    if (pattern.test(file.code)) {
      failures.push(
        `[principle 1] ${file.rel} calls a device-location API (${pattern}). ` +
          `Locality is a stated field; there is no framing under which this is allowed.`,
      )
    }
  }
}

/* Principle 2 — the two identity layers must not be joined. */
const REAL_ID = /\b(idHash|realName|documentNumber|eligibilityToken)\b/
const PSEUDO = /\b(pseudonym|authorPseudonym)\b/
const IDENTITY_OWNERS = ['core/identity.ts', 'core/storage.ts', 'core/principles.ts']
for (const file of files) {
  if (IDENTITY_OWNERS.includes(file.rel.replace(/\\/g, '/'))) continue
  if (REAL_ID.test(file.code) && PSEUDO.test(file.code)) {
    failures.push(
      `[principle 2] ${file.rel} references both a real-identity field and a pseudonym. ` +
        `Only core/identity.ts may see both, and even it exposes no mapping between them.`,
    )
  }
}

/* Principle 3 — the advisory disclaimer must not be dismissible. */
const banner = files.find((f) => f.rel.replace(/\\/g, '/') === 'components/ui.tsx')
if (banner) {
  const fn = banner.code.slice(banner.code.indexOf('function AdvisoryBanner'))
  const body = fn.slice(0, fn.indexOf('\n}\n') + 1)
  if (/dismiss|onClose|hidden|collapsed/i.test(body)) {
    failures.push(
      `[principle 3] AdvisoryBanner has gained a way to be dismissed or hidden. ` +
        `Every poll surface must carry it, permanently.`,
    )
  }
}

/* Principle 4 — the audit trail is append-only. */
const audit = files.find((f) => f.rel.replace(/\\/g, '/') === 'core/audit.ts')
if (audit && /export function (delete|remove|edit|update|clear)/i.test(audit.code)) {
  failures.push(
    `[principle 4] core/audit.ts exports a mutation. The oversight trail is append-only: ` +
      `an institution may add to its record by acting and do nothing else to it.`,
  )
}

/* Principle 5 — no author term in the ranking function. */
const ranking = files.find((f) => f.rel.replace(/\\/g, '/') === 'core/ranking.ts')
if (ranking && /\b(boost|weight|promote|pinned|featured|authorScore)\b/i.test(ranking.code)) {
  failures.push(
    `[principle 5] core/ranking.ts has gained an amplification term. Sorting may read a ` +
      `post's stance and engagement, never who wrote it.`,
  )
}

if (failures.length > 0) {
  console.error('\nArchitectural constraints violated:\n')
  for (const failure of failures) console.error(`  ✗ ${failure}\n`)
  console.error(
    'These are constraints from Section 0 of the specification, not preferences.\n' +
      'If one genuinely needs to change, that is a decision to take in public with the\n' +
      'spec open — not a check to delete.\n',
  )
  process.exit(1)
}

console.log(`✓ ${files.length} files checked — all six architectural constraints hold.`)
