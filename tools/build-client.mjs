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
};
const inlined = Object.fromEntries(
  Object.entries(DATA).map(([k, p]) => [k, JSON.parse(readFileSync(join(ROOT, p), 'utf8'))]));

let entryCode = modules.get(ENTRY).src;
// Replace the fetch block with the inlined data.
entryCode = entryCode.replace(
  /const \[bundle, timeline, works, cityData, people\] = await Promise\.all\(\[[\s\S]*?\]\);/,
  'const { skeleton: bundle, timeline, works, cities: cityData, people } = __DATA;');
modules.set(ENTRY, { ...modules.get(ENTRY), src: entryCode });

/* ── Assemble ───────────────────────────────────────────────────────────── */

const css = readFileSync(join(ROOT, 'packages/ui/src/kit.css'), 'utf8');
const html = readFileSync(join(ROOT, 'apps/client/index.html'), 'utf8');

const body = html
  .replace(/<link rel="stylesheet"[^>]*>/, '')
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(/[\s\S]*<body[^>]*>/, '')
  .replace(/<\/body>[\s\S]*/, '');

const inlineStyle = (html.match(/<style>([\s\S]*?)<\/style>/) ?? [, ''])[1];

const out = `<title>Paramountcy</title>
<style>${css}\n${inlineStyle}</style>
${body}
<script type="module">
const __DATA = ${JSON.stringify(inlined)};
const __m = {};
${order.map(wrap).join('\n\n')}
</script>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
console.log(`  ✓ ${relative(ROOT, OUT)}  ${(out.length / 1024 / 1024).toFixed(2)} MB  ` +
            `(${order.length} modules, ${Object.keys(inlined).length} data files)`);
