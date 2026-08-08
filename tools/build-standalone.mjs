#!/usr/bin/env node
/**
 * Build a single self-contained HTML file from the multi-file app.
 *
 * Outputs:
 *   dist/india-knowledge-map.html  — full standalone document (double-clickable,
 *                                    shareable as one file, GitHub-Pages friendly)
 *
 * Every <link rel="stylesheet"> and <script src> in index.html is inlined.
 * Missing data packs are skipped with a comment (the app degrades gracefully).
 * Any assets referenced as data URIs inside JS are already self-contained.
 *
 * Usage: node tools/build-standalone.mjs [--body-only <outfile>]
 *   --body-only also writes a variant without <!DOCTYPE>/<html>/<head>/<body>
 *   wrappers (title + style + content + scripts), for hosts that wrap pages
 *   in their own skeleton.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

function inline(src) {
  const p = join(root, src);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

let out = html;

// inline stylesheets
out = out.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
  const css = inline(href);
  return css ? `<style>\n${css}\n</style>` : `<!-- missing stylesheet: ${href} -->`;
});

// inline scripts (skip files that don't parse — e.g. packs still being written)
out = out.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const js = inline(src);
  if (!js) return `<!-- data pack not present at build time: ${src} -->`;
  try {
    new Function(js);
  } catch (e) {
    console.warn(`skipping ${src}: ${e.message}`);
    return `<!-- data pack incomplete at build time: ${src} -->`;
  }
  return `<script>\n${js}\n</script>`;
});

// footer relative links don't resolve in a single shared file — point them at the repo
out = out.replaceAll('href="data/qc-report.md"', 'href="https://github.com/stang-715/Indi-Knowledge-/blob/main/data/qc-report.md"');
out = out.replaceAll('href="backend/README.md"', 'href="https://github.com/stang-715/Indi-Knowledge-/blob/main/backend/README.md"');

mkdirSync(join(root, "dist"), { recursive: true });
const distFile = join(root, "dist", "india-knowledge-map.html");
writeFileSync(distFile, out);
console.log("wrote", distFile, Math.round(out.length / 1024) + "KB");

// optional body-only variant
const flag = process.argv.indexOf("--body-only");
if (flag !== -1 && process.argv[flag + 1]) {
  let body = out;
  const titleMatch = out.match(/<title>[\s\S]*?<\/title>/);
  // strip document skeleton, keep everything inside <body>…</body>
  const bodyMatch = out.match(/<body>([\s\S]*)<\/body>/);
  const headStyles = [...out.matchAll(/<style>[\s\S]*?<\/style>/g)].map(m => m[0]).join("\n");
  body = (titleMatch ? titleMatch[0] + "\n" : "") + headStyles + "\n" + (bodyMatch ? bodyMatch[1] : out);
  writeFileSync(process.argv[flag + 1], body);
  console.log("wrote", process.argv[flag + 1], Math.round(body.length / 1024) + "KB");
}
