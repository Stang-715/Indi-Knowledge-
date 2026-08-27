import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url).pathname;
const GUARD = `${ROOT}tools/check-determinism-rules.mjs`;
const TRIPWIRE = `${ROOT}packages/sim/src/__tripwire.js`;

function runGuard() {
  try {
    execFileSync('node', [GUARD], { encoding: 'utf8', stdio: 'pipe' });
    return { ok: true };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
  }
}

test('the guard passes on the real sim', () => {
  assert.ok(runGuard().ok, 'sim package should be clean');
});

test('the guard catches Math.random', () => {
  writeFileSync(TRIPWIRE, 'export const x = () => Math.random();\n');
  try {
    const r = runGuard();
    assert.equal(r.ok, false, 'guard must fail when Math.random is introduced');
    assert.match(r.out, /Math\.random/);
  } finally { unlinkSync(TRIPWIRE); }
});

test('the guard catches a wall-clock read', () => {
  writeFileSync(TRIPWIRE, 'export const t = () => Date.now();\n');
  try {
    assert.equal(runGuard().ok, false, 'guard must fail on Date.now()');
  } finally { unlinkSync(TRIPWIRE); }
});

test('the guard catches DOM access in the sim', () => {
  writeFileSync(TRIPWIRE, 'export const d = () => document.body;\n');
  try {
    assert.equal(runGuard().ok, false, 'guard must fail on DOM access');
  } finally { unlinkSync(TRIPWIRE); }
});

test('the guard is clean again after the tripwire is removed', () => {
  assert.ok(runGuard().ok);
});
