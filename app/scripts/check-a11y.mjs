#!/usr/bin/env node
/*
 * Accessibility floor, checked in CI rather than audited at the end.
 *
 * The plan sets WCAG 2.1 AA and GIGW 3.0 as a pass mark, not an aspiration. An
 * audit at the end of a project finds the same problems for ten times the cost,
 * because by then every screen repeats the mistake. These are the checks that
 * can be made statically; the ones that need a running page — contrast against
 * a live gradient, focus order, screen-reader output — belong in the browser
 * pass and are listed at the bottom so they are not quietly forgotten.
 *
 * Run: npm run check:a11y
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else out.push(path)
  }
  return out
}

const files = walk(ROOT)
const tsx = files.filter((f) => f.endsWith('.tsx')).map((path) => ({
  path,
  rel: relative(ROOT, path).replace(/\\/g, '/'),
  src: readFileSync(path, 'utf8'),
}))
const css = files.filter((f) => f.endsWith('.css')).map((path) => ({
  path,
  rel: relative(ROOT, path).replace(/\\/g, '/'),
  src: readFileSync(path, 'utf8'),
}))

const problems = []
const add = (rule, where, detail) => problems.push({ rule, where, detail })

/* ---- 1. An icon-only control must carry an accessible name ------------- */
for (const f of tsx) {
  // <button ...> with no text child and no aria-label / aria-labelledby.
  const buttons = f.src.match(/<button[\s\S]{0,600}?<\/button>/g) ?? []
  for (const b of buttons) {
    const open = b.slice(0, b.indexOf('>') + 1)
    const inner = b.slice(b.indexOf('>') + 1, b.lastIndexOf('</button>'))
    const named = /aria-label|aria-labelledby|title=/.test(open)
    // Text content, a translated string, or an interpolated label all count.
    const hasText = /[A-Za-z]{2,}/.test(
      inner
        .replace(/<svg[\s\S]*?<\/svg>/g, '')   // paired
        .replace(/<svg[\s\S]*?\/>/g, '')        // self-closing
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, ''),
    )
    if (!named && !hasText) {
      add('name', f.rel, `icon-only <button> with no accessible name: ${open.slice(0, 90)}…`)
    }
  }
}

/* ---- 2. Every form control needs a label ------------------------------- */
for (const f of tsx) {
  // A control wrapped in <label>…</label> is labelled implicitly, which is a
  // perfectly good association — the switch component relies on it. Blank those
  // regions out before looking for unlabelled controls, or the rule reports
  // correct code and gets switched off.
  const withoutWrapped = f.src.replace(
    /<label[\s\S]*?<\/label>/g,
    (block) => block.replace(/<(input|select|textarea)/g, '<labelled-$1'),
  )
  const controls = withoutWrapped.match(/<(input|select|textarea)[\s\S]{0,400}?\/?>/g) ?? []
  for (const c of controls) {
    if (/type=['"]hidden['"]/.test(c)) continue
    const hasId = /\bid=/.test(c)
    const selfNamed = /aria-label|aria-labelledby/.test(c)
    // An id lets a <label htmlFor> elsewhere in the file name it.
    if (!selfNamed && !hasId) {
      add('label', f.rel, `form control with neither an id nor an aria-label: ${c.slice(0, 90)}…`)
    }
  }
}

/* ---- 3. Interactive targets must clear 44px ---------------------------- */
const TARGET_SELECTORS = /(\.btn|\.chip|\.inav__tab|\.inav__act|\.sar__mic|\.sar__send|\.switch|\.seg button|button)\b[^{]*\{([^}]*)\}/g
for (const f of css) {
  let m
  while ((m = TARGET_SELECTORS.exec(f.src)) !== null) {
    const body = m[2]
    const h = /(?:^|;|\s)height:\s*(\d+)px/.exec(body)
    const minH = /min-height:\s*(\d+)px/.exec(body)
    // A fixed height under 44 with no min-height override is a small target.
    if (h && Number(h[1]) < 44 && !minH) {
      add('target', f.rel, `${m[1]} sets height ${h[1]}px with no min-height (44px floor)`)
    }
  }
}

/* ---- 4. Focus must stay visible ---------------------------------------- */
for (const f of css) {
  if (/outline:\s*(none|0)\s*;/.test(f.src)) {
    // Removing the outline is only acceptable if focus is restyled right there.
    const chunks = f.src.split('}').filter((c) => /outline:\s*(none|0)\s*;/.test(c))
    for (const chunk of chunks) {
      if (!/:focus-visible|box-shadow|border-color/.test(chunk)) {
        add('focus', f.rel, 'outline removed with no visible focus style in the same rule')
      }
    }
  }
}

/* ---- 5. Motion must be escapable --------------------------------------- */
/* The guard is global and uses !important, so it covers every stylesheet. The
   check is therefore that the guard exists at all — flagging each animated file
   individually would report correct code, and a noisy check is a dead check. */
{
  const anyAnimation = css.some((f) => /animation:\s*[a-z-]+\s/i.test(f.src))
  const globalGuard = css.some(
    (f) =>
      /prefers-reduced-motion/.test(f.src) &&
      /data-motion=['"]reduced['"]/.test(f.src) &&
      /animation-duration:\s*\.?0*1?ms\s*!important/.test(f.src),
  )
  if (anyAnimation && !globalGuard) {
    add(
      'motion',
      'design/base.css',
      'animations exist but no global prefers-reduced-motion / data-motion guard was found',
    )
  }
}

/* ---- 6. No string may be hard-coded into a component ------------------- */
const CONTENT_DIRS = ['components/chowk/', 'surfaces/']
const ALLOWED = /^(zz|OK|—|·|→|←|↗|✓|▲|▼|\d+%?)$/
for (const f of tsx) {
  if (!CONTENT_DIRS.some((d) => f.rel.startsWith(d))) continue
  const text = f.src
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<svg[\s\S]*?\/>/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  const literals = text.match(/>\s*([A-Z][A-Za-z][^<>{}]{3,})\s*</g) ?? []
  for (const lit of literals) {
    const value = lit.replace(/^>\s*|\s*<$/g, '').trim()
    if (ALLOWED.test(value)) continue
    add('i18n', f.rel, `literal text outside the catalogue: “${value.slice(0, 60)}”`)
  }
}

/* ------------------------------- report --------------------------------- */

const RULES = {
  name: 'Icon-only controls need an accessible name (WCAG 4.1.2)',
  label: 'Form controls need a label (WCAG 3.3.2)',
  target: 'Touch targets need 44px (WCAG 2.5.5)',
  focus: 'Focus must remain visible (WCAG 2.4.7)',
  motion: 'Animation must honour reduced motion (WCAG 2.3.3)',
  i18n: 'User-visible text belongs in the catalogue, not the component',
}

if (problems.length > 0) {
  console.error('\nAccessibility floor not met:\n')
  const byRule = new Map()
  for (const p of problems) {
    if (!byRule.has(p.rule)) byRule.set(p.rule, [])
    byRule.get(p.rule).push(p)
  }
  for (const [rule, items] of byRule) {
    console.error(`  ${RULES[rule]}`)
    for (const i of items.slice(0, 8)) console.error(`    ✗ ${i.where} — ${i.detail}`)
    if (items.length > 8) console.error(`    … and ${items.length - 8} more`)
    console.error('')
  }
  process.exit(1)
}

console.log(
  `✓ ${tsx.length} components and ${css.length} stylesheets checked — ` +
    'accessibility floor holds.',
)
console.log(
  '  Still needs a browser: contrast against the live gradient, focus order,\n' +
    '  screen-reader output in three scripts, and the pseudo-locale layout pass.',
)
