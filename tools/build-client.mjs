#!/usr/bin/env node
/**
 * Bundle the client into one self-contained HTML file.
 *
 * No bundler dependency: the module graph is small and known, so this resolves
 * it, wraps each module in an IIFE that returns its exports, and registers it
 * under its path. Wrapping rather than concatenating means module-private names
 * — there are several `inset`, `sample` and `mix` — cannot collide.
 *
 * Data is inlined too, so the result runs from a file:// URL or anywhere that
 * blocks fetch.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = join(ROOT, 'apps/client/src/main.js');
const OUT = join(ROOT, 'dist/paramountcy.html');

/* ── Resolve the module graph ───────────────────────────────────────────── */

const modules = new Map();          // absolute path → { code, deps: Map<spec, path> }
const order = [];

function load(file) {
  if (modules.has(file)) return;
  const src = readFileSync(file, 'utf8');
  const deps = new Map();
  // Only static, relative imports — that is all this codebase uses.
  for (const m of src.matchAll(/^\s*import\s+([^;]+?)\s+from\s+['"](\.[^'"]+)['"];?/gm)) {
    deps.set(m[2], resolve(dirname(file), m[2]));
  }
  modules.set(file, { src, deps });
  for (const dep of deps.values()) load(dep);
  order.push(file);                 // post-order: dependencies first
}
load(ENTRY);

/* ── Rewrite each module ────────────────────────────────────────────────── */

const id = (f) => relative(ROOT, f).replace(/\\/g, '/');

function wrap(file) {
  const { src, deps } = modules.get(file);
  const names = new Set();
  let out = src;

  // import { a, b as c } from './x.js'   →   const { a, b: c } = __m['x'];
  out = out.replace(/^\s*import\s+\{([^}]+)\}\s+from\s+['"](\.[^'"]+)['"];?/gm,
    (_, spec, path) => `const {${spec.replace(/\bas\b/g, ':')}} = __m[${JSON.stringify(id(deps.get(path)))}];`);
  // import X from './x.js'  →  const X = __m['x'].default;
  out = out.replace(/^\s*import\s+(\w+)\s+from\s+['"](\.[^'"]+)['"];?/gm,
    (_, name, path) => `const ${name} = __m[${JSON.stringify(id(deps.get(path)))}].default;`);

  // Collect and strip export keywords.
  out = out.replace(/^\s*export\s+(const|let|var|function|class)\s+(\w+)/gm,
    (_, kind, name) => { names.add(name); return `${kind} ${name}`; });
  out = out.replace(/^\s*export\s*\{([^}]+)\};?/gm, (_, spec) => {
    for (const part of spec.split(',')) {
      const n = part.trim().split(/\s+as\s+/).pop().trim();
      if (n) names.add(n);
    }
    return '';
  });

  return `__m[${JSON.stringify(id(file))}] = (() => {\n${out}\nreturn { ${[...names].join(', ')} };\n})();`;
}

/* ── Inline data ────────────────────────────────────────────────────────── */

const DATA = {
  'skeleton':  'data/skeleton/bundle.json',
  'timeline':  'data/timeline/timeline.json',
  'works':     'data/corpus/works.json',
  'cities':    'data/cities/cities.json',
  'people':    'data/people/people.json',
  'cards':     'data/timeline/cards.json',
  'gazetteer': 'data/gazetteer/places.json',
  'texture':   'data/timeline/texture.json',
  'occupations': 'data/timeline/occupations.json',
  'fonts':     'data/fonts/manifest.json',
};
const inlined = Object.fromEntries(
  Object.entries(DATA).map(([k, p]) => [k, JSON.parse(readFileSync(join(ROOT, p), 'utf8'))]));

let entryCode = modules.get(ENTRY).src;
// Replace the fetch block with the inlined data.
entryCode = entryCode.replace(
  /const \[bundle, timeline, works, cityData, people, cardsDoc, gazetteer, texture, occupations, fontManifest\] = await Promise\.all\(\[[\s\S]*?\]\);/,
  'const { skeleton: bundle, timeline, works, cities: cityData, people, cards: cardsDoc, gazetteer, texture, occupations, fonts: fontManifest } = __DATA;');
modules.set(ENTRY, { ...modules.get(ENTRY), src: entryCode });

/* ── Assemble ───────────────────────────────────────────────────────────── */

const css = readFileSync(join(ROOT, 'packages/ui/src/kit.css'), 'utf8');

/* ── Indic fonts (phase 41): exact-subset woff2, embedded as data URIs ──── */
let fontCSS = '';
try {
  const fm = JSON.parse(readFileSync(join(ROOT, 'data/fonts/manifest.json'), 'utf8'));
  for (const [script, info] of Object.entries(fm.fonts)) {
    for (const part of info.parts) {
      const b64 = readFileSync(join(ROOT, 'data/fonts', part.file)).toString('base64');
      fontCSS += `@font-face{font-family:'PI-${script}';` +
        `src:url(data:font/woff2;base64,${b64}) format('woff2');` +
        `unicode-range:${part.range};font-display:swap;}\n`;
    }
  }
  console.log(`  fonts: ${Object.keys(fm.fonts).length} scripts, ${(fm.total / 1024).toFixed(1)} KB embedded`);
} catch { console.warn('  ! no Indic fonts embedded (run tools/fetch-fonts.mjs)'); }
const html = readFileSync(join(ROOT, 'apps/client/index.html'), 'utf8');

const body = html
  .replace(/<link rel="stylesheet"[^>]*>/, '')
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(/[\s\S]*<body[^>]*>/, '')
  .replace(/<\/body>[\s\S]*/, '');

const inlineStyle = (html.match(/<style>([\s\S]*?)<\/style>/) ?? [, ''])[1];

/* ── Colophon (phase 54): the fingerprint a bug report needs ────────────── */
let commit = 'unstamped';
try { commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
const dpJSON = JSON.stringify(inlined);
let dpHash = 0x811c9dc5;                        // FNV-1a over the inlined datapack
for (let i = 0; i < dpJSON.length; i++) {
  dpHash ^= dpJSON.charCodeAt(i);
  dpHash = Math.imul(dpHash, 0x01000193) >>> 0;
}
const BUILD = { commit, date: new Date().toISOString().slice(0, 10),
                datapack: dpHash.toString(16).padStart(8, '0') };

const out = `<title>Paramountcy</title>
<style>${fontCSS}${css}\n${inlineStyle}</style>
${body}
<script type="module">
globalThis.__BUILD = ${JSON.stringify(BUILD)};
const __DATA = ${JSON.stringify(inlined)};
const __m = {};
${order.map(wrap).join('\n\n')}
</script>`;

/**
 * Escape every non-ASCII character, so the file cannot mojibake.
 *
 * The published artifact is wrapped in a head that declares UTF-8, so it is
 * safe there — but a `file://` open can still fall back to windows-1252 and a
 * host that sends no charset will too. That turns the play button into
 * "\u00e2\u0096\u00b6 play". Escaping makes the bundle pure ASCII, which no
 * decoder can get wrong.
 *
 * HTML text takes numeric entities; the script block takes \uXXXX, which is
 * valid inside string literals and harmless inside comments. Identifiers in
 * this codebase are all ASCII, so nothing in executable position is touched.
 */
function asciify(html) {
  const cut = html.indexOf('<script type="module">');
  const head = html.slice(0, cut), tail = html.slice(cut);
  const esc = (s, fn) => s.replace(/[^\x00-\x7F]/g, (c) => fn(c.codePointAt(0)));
  return esc(head, (n) => `&#${n};`) +
         esc(tail, (n) => '\\u' + n.toString(16).padStart(4, '0'));
}

const asciiOut = asciify(out);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, asciiOut);
console.log(`  ✓ ${relative(ROOT, OUT)}  ${(asciiOut.length / 1024 / 1024).toFixed(2)} MB  ` +
            `(${order.length} modules, ${Object.keys(inlined).length} data files)`);
