import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/engine.js';
import { save, load, migrate, reconcile, toURLFragment, fromURLFragment,
         replayStops, saveSize, SAVE_VERSION } from '../src/save.js';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const DP = {
  timeline: read('../../../data/timeline/timeline.json'),
  works:    read('../../../data/corpus/works.json'),
  people:   read('../../../data/people/people.json'),
};
const campaign = () => {
  const d = [];
  for (let y = -3000; y < 1200; y += 100) d.push({ year: y, action: 'patronise' });
  for (let y = -400;  y < 1200; y +=  60) d.push({ year: y, action: 'train-scribe' });
  d.push({ year: -500, action: 'endow', person: 'PER.PANINI' });
  d.push({ year: 900, action: 'raise-soldiers', count: 10 });
  return d;
};

test('a save round-trips', () => {
  const sv = save('s1', campaign(), { year: 1200 });
  const back = load(JSON.stringify(sv));
  assert.equal(back.seed, 's1');
  assert.equal(back.d.length, sv.d.length);
});

test('a save is kilobytes, not megabytes', () => {
  const sv = save('s1', campaign(), { year: 1200 });
  const bytes = saveSize(sv);
  assert.ok(bytes < 12000, `save is ${bytes} bytes`);
  // For comparison: the world it reproduces.
  const world = run(DP, 's1', campaign(), { to: 1200 });
  assert.ok(world.corpus.size > 80 && world.districts.size > 40);
});

test('loading a save reproduces the world exactly', () => {
  const sv = save('s1', campaign(), { year: 1200 });
  const direct = run(DP, 's1', campaign(), { to: 1200 });
  const loaded = load(JSON.stringify(sv));
  const replayed = run(DP, loaded.seed, loaded.d, { to: 1200 });
  assert.equal(replayed.fingerprint, direct.fingerprint);
});

test('decision order does not change the save', () => {
  const a = campaign();
  const b = [...a].reverse();
  assert.equal(JSON.stringify(save('s', a)), JSON.stringify(save('s', b)));
});

test('a campaign fits in a URL', () => {
  const sv = save('s1', campaign(), { year: 1200 });
  const frag = toURLFragment(sv);
  assert.ok(frag.length < 16000, `fragment is ${frag.length} chars`);
  assert.ok(!/[+/=]/.test(frag), 'must be URL-safe');
  const back = fromURLFragment(frag);
  assert.equal(back.seed, sv.seed);
  assert.equal(back.d.length, sv.d.length);
});

test('a shared link opens the same campaign', () => {
  const sv = save('shared', campaign(), { year: 1193 });
  const back = fromURLFragment(toURLFragment(sv));
  assert.equal(run(DP, back.seed, back.d, { to: 1193 }).fingerprint,
               run(DP, 'shared', campaign(), { to: 1193 }).fingerprint);
});

test('a v1 save migrates forward', () => {
  const old = { v: 1, seed: 's', d: [{ t: 900, action: 'patron', person: 'PER.PANINI' }] };
  const m = migrate(old);
  assert.equal(m.v, SAVE_VERSION);
  assert.equal(m.d[0].year, 900);
  assert.equal(m.d[0].action, 'endow');
});

test('an unknown save version is refused, not half-loaded', () => {
  // Phase 54 made the refusal legible: a future version blames the build and
  // says what to do, instead of "not supported".
  assert.throws(() => migrate({ v: 99, seed: 's', d: [] }), /newer build/);
});

test('rubbish is refused with a reason', () => {
  assert.throws(() => load('{}'), /seed/);
  assert.throws(() => load('{"seed":"s"}'), /decision log/);
  assert.throws(() => load('not json'));
});

test('a renamed entity costs you that decision, not the campaign', () => {
  const sv = save('s', [...campaign(), { year: 800, action: 'endow', person: 'PER.GONE' }]);
  const r = reconcile(sv, DP);
  assert.equal(r.dropped, 1);
  assert.ok(r.d.length === sv.d.length - 1);
  // And the campaign still runs.
  assert.ok(run(DP, r.seed, r.d, { to: 1200 }).year === 1200);
});

test('an old log replayed against a newer datapack lands on the truer world', () => {
  // Simulate a datapack pour: an event moves to a better-attested date.
  const newer = structuredClone(DP);
  const ev = newer.timeline.events.find(e => e.title.includes('Nalanda sacked'));
  ev.year = 1194;
  const sv = save('pour', campaign(), { year: 1200 });
  const before = run(DP, sv.seed, sv.d, { to: 1200 });
  const after = run(newer, sv.seed, sv.d, { to: 1200 });
  assert.notEqual(before.fingerprint, after.fingerprint, 'the world should change');
  assert.equal(after.year, 1200, 'and the save should still load');
});

/* ── Replay ─────────────────────────────────────────────────────────────── */

test('replay stops cover the campaign and stay bounded', () => {
  const sv = save('s', campaign());
  const stops = replayStops(sv, { from: -6000, to: 1947 });
  assert.ok(stops.length > 5 && stops.length <= 240);
  assert.equal(stops[0], -6000);
  assert.equal(stops[stops.length - 1], 1947);
  for (let i = 1; i < stops.length; i++) assert.ok(stops[i] > stops[i-1], 'sorted, unique');
});

test('scrubbing is a pure function of the prefix', () => {
  // A replay is not a recording. Evaluating at an earlier `to` twice must give
  // the same world, and must match a campaign that only ever ran that far.
  const sv = save('scrub', campaign());
  for (const y of [-2000, 0, 900, 1193]) {
    const a = run(DP, sv.seed, sv.d, { to: y });
    const b = run(DP, sv.seed, sv.d, { to: y });
    assert.equal(a.fingerprint, b.fingerprint);
    const only = run(DP, sv.seed, sv.d.filter(d => d.year <= y), { to: y });
    assert.equal(a.fingerprint, only.fingerprint,
      `scrubbing to ${y} must equal a campaign that stopped there`);
  }
});

test('a save records where it was taken, so a replay can return to it', () => {
  const sv = save('s', campaign(), { year: 1193 });
  assert.equal(sv.at, 1193);
});

/* ── Phase 54: versioning against real history ──────────────────────────── */

test('a phase-38-era save replays against today\'s engine', () => {
  // Written exactly as the client of that build would have written it: v2,
  // Indus-era decisions included. The engine has gained systems since
  // (standing orders, occupations, conditional events); an old log must land
  // on the truer world, not break.
  const old = {
    v: 2, seed: 'p38-campaign', datapack: 'builtin', at: -1900,
    d: [
      { year: -2400, action: 'provision-town', town: 'mohenjo-daro' },
      { year: -2350, action: 'dig-wells', town: 'dholavira' },
      { year: -2200, action: 'resettle-east', town: 'kalibangan' },
      { year: -2100, action: 'resettle-east', town: 'kalibangan' },
    ],
  };
  const sv = reconcile(load(JSON.stringify(old)), DP);
  assert.equal(sv.dropped, 0, 'nothing in a phase-38 save should have gone stale');
  const world = run(DP, sv.seed, sv.d, { to: sv.at });
  assert.equal(world.year, -1900);
  assert.ok(world.indusCarried.resettled > 0, 'the resettlement decisions took effect');
});

test('a save from the future is refused legibly', () => {
  const future = { v: SAVE_VERSION + 1, seed: 's', d: [] };
  assert.throws(() => load(JSON.stringify(future)), (e) => {
    assert.match(e.message, /newer build/, 'says whose fault it is');
    assert.match(e.message, /Update the game/, 'and what to do about it');
    return true;
  });
});

test('a corrupted save fails kindly, never opaquely', () => {
  assert.throws(() => load('{"garbage":true}'), /save/i, 'a JSON blob that is not a save');
  assert.throws(() => load(JSON.stringify({ seed: 's', d: [] })), /version/i,
    'a versionless save is named as such');
  assert.throws(() => load('not json at all'), SyntaxError);
});
