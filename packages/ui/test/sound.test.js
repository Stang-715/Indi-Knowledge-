import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { voiceOf, eraVoice, Sound } from '../src/sound.js';

test('the era changes the voice, following the table materials', () => {
  assert.equal(eraVoice(-5000), 'neolithic');
  assert.equal(eraVoice(-2000), 'bronze');
  assert.equal(eraVoice(-500),  'iron');
  assert.equal(eraVoice(400),   'classical');
  assert.equal(eraVoice(1100),  'medieval');
  assert.equal(eraVoice(1800),  'modern');
});

test('a fuller corpus is a fuller chord', () => {
  const thin = voiceOf({ extant: 2,  lost: 0, schools: 1, total: 89 });
  const rich = voiceOf({ extant: 40, lost: 0, schools: 8, total: 89 });
  assert.ok(rich.voices > thin.voices, 'more works, more partials');
  assert.ok(rich.gain > thin.gain);
});

test('schools carry the body of the sound', () => {
  const many = voiceOf({ extant: 20, lost: 0, schools: 9, total: 89 });
  const none = voiceOf({ extant: 20, lost: 0, schools: 0, total: 89 });
  assert.ok(many.body > none.body, 'the oral line is what gives it body');
  assert.ok(none.body > 0, 'and losing every school does not mute the game');
});

test('loss darkens rather than quietens', () => {
  const kept = voiceOf({ extant: 30, lost: 0,  schools: 6, total: 89 });
  const lost = voiceOf({ extant: 30, lost: 50, schools: 6, total: 89 });
  assert.ok(lost.darkness > kept.darkness);
  assert.equal(lost.gain, kept.gain, 'a diminished corpus sounds diminished, not absent');
});

test('the voice never goes out of range', () => {
  for (const c of [{ extant: 0, lost: 0, schools: 0, total: 89 },
                   { extant: 89, lost: 0, schools: 40, total: 89 },
                   { extant: 0, lost: 89, schools: 0, total: 89 },
                   { extant: 5, lost: 5, schools: 2, total: 1 }]) {
    const v = voiceOf(c);
    assert.ok(v.voices >= 1 && v.voices <= 6, `voices ${v.voices}`);
    assert.ok(v.body > 0 && v.body <= 1, `body ${v.body}`);
    assert.ok(v.darkness >= 0 && v.darkness <= 1, `darkness ${v.darkness}`);
    assert.ok(v.gain > 0 && v.gain < 0.2, `gain ${v.gain}`);
  }
});

test('sound is inert without an audio context', () => {
  // Headless, in a locked-down embed, or before the player has gestured.
  const s = new Sound();
  assert.doesNotThrow(() => { s.set(900, { extant: 10, lost: 2, schools: 3, total: 89 }); });
  assert.doesNotThrow(() => { s.strike('loss'); });
  assert.doesNotThrow(() => { s.silence(); });
  assert.doesNotThrow(() => { s.disable(); });
  assert.equal(s.on, false);
});

test('it does not sample or name a living liturgy', () => {
  // The constraint is cultural, not technical: recited Vedic text is liturgy
  // for living communities and using a recording of it as ambience is a
  // decision to be made with them. This ships synthesis only.
  const src = readFileSync(new URL('../src/sound.js', import.meta.url), 'utf8');
  assert.ok(!/\.(mp3|wav|ogg|m4a|flac)\b/i.test(src), 'no audio files');
  assert.ok(!/decodeAudioData|createBufferSource|fetch\(/.test(src), 'no sample playback');
  assert.match(src, /cultural review|WITH those communities|liturgy/i,
    'and the reason is written down where the next person will read it');
});
