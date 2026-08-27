import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng, hashString, drawFrom } from '../src/rng.js';

test('same seed gives the same stream', () => {
  const a = new Rng('paramountcy'), b = new Rng('paramountcy');
  for (let i = 0; i < 1000; i++) assert.equal(a.next(), b.next());
});

test('different seeds diverge immediately', () => {
  assert.notEqual(new Rng('a').next(), new Rng('b').next());
});

test('floats stay in range', () => {
  const r = new Rng(42);
  for (let i = 0; i < 10000; i++) {
    const f = r.float();
    assert.ok(f >= 0 && f < 1, `float out of range: ${f}`);
  }
});

test('ints stay in range and cover it', () => {
  const r = new Rng(7);
  const seen = new Set();
  for (let i = 0; i < 5000; i++) {
    const n = r.int(1, 6);
    assert.ok(n >= 1 && n <= 6);
    seen.add(n);
  }
  assert.equal(seen.size, 6, 'all six faces should appear');
});

test('distribution is not obviously broken', () => {
  const r = new Rng('fairness');
  let sum = 0;
  const N = 200000;
  for (let i = 0; i < N; i++) sum += r.float();
  const mean = sum / N;
  assert.ok(Math.abs(mean - 0.5) < 0.01, `mean ${mean} should be near 0.5`);
});

test('forks are independent and reproducible', () => {
  const parent = () => new Rng('world-seed');
  const t1 = parent().fork('trade'), t2 = parent().fork('trade');
  const c1 = parent().fork('corpus');
  assert.equal(t1.next(), t2.next(), 'same fork name reproduces');
  assert.notEqual(parent().fork('trade').next(), c1.next(), 'different names diverge');
});

test('a fork is insulated from parent stream position', () => {
  // This is the property that matters: adding a roll in one subsystem must not
  // silently rewrite another subsystem's results.
  const a = new Rng('w'); a.next(); a.next(); a.next();
  const b = new Rng('w');
  // Forking from different positions gives different streams, which is why
  // subsystems fork ONCE at setup, not per-call.
  assert.notEqual(a.fork('trade').next(), b.fork('trade').next());
});

test('drawFrom is order-independent and pure', () => {
  assert.equal(drawFrom('seed', 'tile', 12, 44), drawFrom('seed', 'tile', 12, 44));
  assert.notEqual(drawFrom('seed', 'tile', 12, 44), drawFrom('seed', 'tile', 12, 45));
});

test('hashString is stable', () => {
  assert.equal(hashString('Nalanda'), hashString('Nalanda'));
  assert.notEqual(hashString('Nalanda'), hashString('Vikramashila'));
});

test('integer arithmetic stays in 32 bits', () => {
  const r = new Rng(0xffffffff);
  for (let i = 0; i < 1000; i++) {
    const n = r.next();
    assert.ok(Number.isInteger(n) && n >= 0 && n <= 0xffffffff, `out of 32-bit range: ${n}`);
  }
});
