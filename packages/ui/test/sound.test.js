import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { voiceOf, eraVoice, Sound, clockVoice, textureFamily,
         CLOCK_TICK, FAMILY_STRIKE } from '../src/sound.js';

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

test('the clock is made of the era: shadow, water, brass', () => {
  assert.equal(clockVoice(-3000), 'gnomon', 'before coinage the tick is a glance at a stick');
  assert.equal(clockVoice(-100),  'water');
  assert.equal(clockVoice(1000),  'water');
  assert.equal(clockVoice(1700),  'brass');
  // The gnomon is the quietest voice — a shadow makes no sound.
  assert.ok(CLOCK_TICK.gnomon.gain < CLOCK_TICK.water.gain);
  assert.ok(CLOCK_TICK.gnomon.gain < CLOCK_TICK.brass.gain);
});

test('every texture template lands in one of the four families', () => {
  const doc = JSON.parse(readFileSync(new URL('../../../data/timeline/texture.json', import.meta.url), 'utf8'));
  const counts = { weather: 0, knowledge: 0, road: 0, village: 0 };
  for (const t of doc.templates) {
    const fam = textureFamily(t.id);
    assert.ok(fam in counts, `${t.id} → ${fam}`);
    counts[fam]++;
  }
  for (const [fam, n] of Object.entries(counts)) {
    assert.ok(n > 0, `family ${fam} claims no template — a timbre nobody will ever hear`);
  }
  // Spot checks pin the classifier against drift.
  assert.equal(textureFamily('drought-bites'), 'weather');
  assert.equal(textureFamily('manuscript-rot'), 'knowledge');
  assert.equal(textureFamily('caravan-late'), 'road');
  assert.equal(textureFamily('hero-stone'), 'village');
});

test('the mix budget holds: nothing new out-shouts what shipped', () => {
  // Pre-52 peak: the loss strike at 0.10, the drone under 0.15. New momentary
  // sounds stay at or under 0.05; the loudest is the weather strike.
  for (const [k, s] of Object.entries(FAMILY_STRIKE)) {
    assert.ok(s.gain <= 0.05, `${k} strike ${s.gain} breaks the budget`);
  }
  for (const [k, s] of Object.entries(CLOCK_TICK)) {
    assert.ok(s.gain <= 0.025, `${k} tick ${s.gain} is not a background sound any more`);
  }
});

test('the phase-52 voices are inert without an audio context', () => {
  const s = new Sound();
  assert.doesNotThrow(() => { s.tick(-2500); });
  assert.doesNotThrow(() => { s.strikeFamily('weather'); });
  assert.doesNotThrow(() => { s.setUndertone(true); s.setUndertone(false); });
  assert.doesNotThrow(() => { s.setDrying(0.5); s.setDrying(null); });
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
