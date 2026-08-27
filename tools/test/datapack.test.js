import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validate } from '../validate-datapack.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;

function pack(files) {
  const dir = mkdtempSync(join(tmpdir(), 'pack-'));
  for (const [name, content] of Object.entries(files)) {
    const p = join(dir, name);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content));
  }
  return dir;
}

test("the repository's own data validates", () => {
  const r = validate(join(ROOT, 'data'));
  assert.deepEqual(r.errors, []);
  assert.ok(r.entities > 900, `only ${r.entities} entities scanned`);
});

test('the example pack validates', () => {
  const r = validate(join(ROOT, 'packs/example-kalinga'));
  assert.deepEqual(r.errors, []);
});

test('code is refused, in every form', () => {
  for (const [name, body] of [
    ['evil.js', 'export const x = 1;'],
    ['evil.mjs', 'export const x = 1;'],
    ['evil.wasm', '\0asm'],
    ['evil.html', '<script></script>'],
  ]) {
    const d = pack({ 'pack.json': { pack: 'p' }, [name]: body });
    const r = validate(d);
    assert.ok(r.errors.some(e => /never contain code/.test(e)), `${name} was allowed`);
    rmSync(d, { recursive: true });
  }
});

test('a function-shaped string inside JSON is refused', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': '{"things":[{"id":"A.B","onTick":"function(){ return 1 }"}]}' });
  assert.ok(validate(d).errors.some(e => /function-shaped/.test(e)));
  rmSync(d, { recursive: true });
});

test('asserting a fact without provenance is an error', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { events: [{ id: 'EVT.1', title: 'a', year: 900 }] } });
  assert.ok(validate(d).errors.some(e => /states no provenance/.test(e)));
  rmSync(d, { recursive: true });
});

test('SOURCED without a source is an error, not a warning', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { events: [{ id: 'EVT.1', title: 'a', year: 900, provenance: 'SOURCED' }] } });
  const r = validate(d);
  assert.ok(r.errors.some(e => /says nothing about where from/.test(e)));
  rmSync(d, { recursive: true });
});

test('a bogus tier is refused', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { events: [{ id: 'EVT.1', year: 900, provenance: 'PROBABLY' }] } });
  assert.ok(validate(d).errors.some(e => /not one of/.test(e)));
  rmSync(d, { recursive: true });
});

test('a disputed entity cannot claim near-certainty', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { events: [{ id: 'EVT.1', year: 900, provenance: 'DERIVED',
                           note: 'x', dispute: true, certainty: 0.95 }] } });
  assert.ok(validate(d).errors.some(e => /disputed and claims certainty/.test(e)));
  rmSync(d, { recursive: true });
});

test('duplicate ids within a collection are refused', () => {
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { events: [{ id: 'EVT.1', year: 1, provenance: 'DERIVED' },
                         { id: 'EVT.1', year: 2, provenance: 'DERIVED' }] } });
  assert.ok(validate(d).errors.some(e => /duplicate id/.test(e)));
  rmSync(d, { recursive: true });
});

test('the same id in two collections is fine', () => {
  // A timeline names ERA.MAURYAN in its era list and again on every event that
  // belongs to it. A global uniqueness rule calls that a duplicate and buries
  // the real ones.
  const d = pack({ 'pack.json': { pack: 'p' },
    'x.json': { eras: [{ id: 'ERA.MAURYAN', provenance: 'DERIVED', note: 'x' }],
                events: [{ id: 'ERA.MAURYAN', year: 1, provenance: 'DERIVED' }] } });
  assert.deepEqual(validate(d).errors, []);
  rmSync(d, { recursive: true });
});

test('an empty pack is an error, not a silent pass', () => {
  const d = mkdtempSync(join(tmpdir(), 'pack-'));
  assert.ok(validate(d).errors.some(e => /empty/.test(e)));
  rmSync(d, { recursive: true });
});

test('malformed JSON names the file and the reason', () => {
  const d = pack({ 'pack.json': { pack: 'p' }, 'x.json': '{ nope' });
  const r = validate(d);
  assert.ok(r.errors.some(e => /x\.json.*not valid JSON/.test(e)));
  rmSync(d, { recursive: true });
});

test('a pack ships no sub-metre geometry', () => {
  // The legal constraint, asserted against the example. India's Geospatial Data
  // Guidelines 2021 restrict data finer than 1 m; L15-L16 are procedural by
  // design and must never be shipped.
  const r = validate(join(ROOT, 'packs/example-kalinga'));
  assert.deepEqual(r.errors, []);
  const cities = JSON.parse(
    readFileSync(join(ROOT, 'packs/example-kalinga/cities.json'), 'utf8'));
  for (const c of cities.cities) {
    assert.ok(!('buildings' in c), `${c.id} ships building geometry`);
    assert.ok(!('streets' in c), `${c.id} ships street geometry`);
  }
  assert.ok(JSON.stringify(cities).length < 2000, 'a city skeleton is about 900 bytes');
});
