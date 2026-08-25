#!/usr/bin/env node
/**
 * The datapack validator (docs/12-buildplan-2.md Phase 21).
 *
 * We are not going to author 648,802 settlements. Public, versioned datapacks
 * are the only arithmetic that fills them — Wikipedia and OpenStreetMap are the
 * model — and a contributor needs to be able to check their own work before
 * anyone looks at it.
 *
 *   node tools/validate-datapack.mjs path/to/pack
 *
 * Two rules are absolute and both are checked here:
 *
 *   **Datapacks never contain code.** Data only, so a community pack cannot
 *   execute anything. Any .js, .mjs, .wasm or function-shaped string fails.
 *
 *   **Provenance is mandatory.** Every entity states its tier and, if it claims
 *   to be SOURCED, what it is sourced from. A pack that cannot say where a fact
 *   came from is not a contribution, it is a rumour.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const TIERS = new Set(['SOURCED', 'DERIVED', 'SYNTHESIZED', 'ABSENT']);
const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.wasm', '.html', '.sh', '.py']);

/** Files a pack may contain. */
const ALLOWED_EXT = new Set(['.json', '.md', '.txt', '.csv']);

export function validate(root) {
  const errors = [], warnings = [];
  // Ids must be unique WITHIN a collection, not across the whole pack. A
  // timeline legitimately names ERA.MAURYAN in its era list and again on every
  // event that belongs to it; a global set calls that a duplicate and buries the
  // real ones.
  const seenBy = new Map();
  let files = 0, entities = 0;

  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      files++;
      const ext = extname(p).toLowerCase();
      const rel = relative(root, p);

      if (CODE_EXT.has(ext)) {
        errors.push(`${rel}: datapacks never contain code`);
        continue;
      }
      if (!ALLOWED_EXT.has(ext)) {
        warnings.push(`${rel}: unrecognised file type, will be ignored`);
        continue;
      }
      if (ext !== '.json') continue;

      let doc;
      try { doc = JSON.parse(readFileSync(p, 'utf8')); }
      catch (e) { errors.push(`${rel}: not valid JSON — ${e.message}`); continue; }

      // A JSON file can still smuggle executable-looking payloads into a field
      // something later eval()s. Refuse them at the door.
      const raw = readFileSync(p, 'utf8');
      if (/"\s*(function\s*\(|\(\s*\)\s*=>|=>\s*\{)/.test(raw))
        errors.push(`${rel}: contains a function-shaped string`);

      for (const [collection, list] of collections(doc)) {
        const key = `${rel}::${collection}`;
        if (!seenBy.has(key)) seenBy.set(key, new Set());
        for (const e of list) {
          entities++;
          checkEntity(rel, collection, e, errors, warnings, seenBy.get(key));
        }
      }
    }
  };

  try { walk(root); }
  catch (e) { errors.push(`cannot read pack: ${e.message}`); }

  if (files === 0) errors.push('the pack is empty');
  return { errors, warnings, files, entities };
}

/** Any array of objects with ids is a collection. */
function* collections(doc) {
  if (!doc || typeof doc !== 'object') return;
  for (const [k, v] of Object.entries(doc)) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null)
      yield [k, v.filter(x => x && typeof x === 'object')];
  }
}

function checkEntity(file, collection, e, errors, warnings, seen) {
  // Some collections are keyed by a match expression rather than an id.
  const id = e.id ?? e.match;
  if (!id) { warnings.push(`${file}: an entry in "${collection}" has no id`); return; }
  if (typeof id !== 'string' || !/^[A-Z]{2,5}\.[A-Z0-9_.#-]+$/i.test(id))
    warnings.push(`${file}: id "${id}" does not look like PREFIX.NAME`);
  if (seen.has(id)) errors.push(`${file}: duplicate id ${id}`);
  seen.add(id);

  // Provenance is mandatory on anything that asserts a fact about the world.
  const asserts = 'provenance' in e || 'certainty' in e || 'year' in e || 'floruit' in e;
  if (!asserts) return;

  const tier = e.provenance ?? e.member_provenance;
  if (!tier) {
    errors.push(`${file}: ${id} asserts a fact and states no provenance`);
  } else if (!TIERS.has(tier)) {
    errors.push(`${file}: ${id} has provenance "${tier}", not one of ${[...TIERS].join('/')}`);
  } else if (tier === 'SOURCED' && !(e.source || e.sources || e.evidence || e.note)) {
    errors.push(`${file}: ${id} claims SOURCED and says nothing about where from`);
  }

  if ('certainty' in e) {
    if (typeof e.certainty !== 'number' || e.certainty < 0 || e.certainty > 1)
      errors.push(`${file}: ${id} certainty must be a number in 0..1`);
    else if (e.dispute && ['occurrence', 'date'].includes(e.dispute_scope ?? 'occurrence')
             && e.certainty >= 0.9)
      errors.push(`${file}: ${id} has its ${e.dispute_scope ?? 'occurrence'} disputed and claims certainty ${e.certainty}`);
  }
  if (e.dispute && !e.dispute_scope) {
    warnings.push(`${file}: ${id} is disputed but does not say what is disputed`);
  }
}

/* ── CLI ────────────────────────────────────────────────────────────────── */

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2];
  if (!root) { console.error('usage: validate-datapack.mjs <dir>'); process.exit(2); }
  const r = validate(root);
  console.log(`\n  ${r.files} file(s), ${r.entities} entit${r.entities === 1 ? 'y' : 'ies'}`);
  for (const w of r.warnings) console.log(`    ! ${w}`);
  if (r.errors.length) {
    console.error(`\n  ✗ ${r.errors.length} error(s):`);
    for (const e of r.errors) console.error(`    ${e}`);
    process.exit(1);
  }
  console.log(`  ✓ the pack is valid\n`);
}
