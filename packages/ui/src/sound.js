/**
 * Sound (docs/12-buildplan-2.md Phase 20).
 *
 * **The audio is the knowledge economy.** Not a soundtrack — a state readout you
 * hear before you read it. The texture under the map is the corpus: richer as
 * more works are held, thinner as schools close, and silent in 1193.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A deliberate constraint, and it is not a technical one.
 *
 * The obvious implementation is recorded recitation. Recited Vedic text is
 * liturgy for living communities, and using a recording of it as ambience under
 * a strategy game is a decision to be made WITH those communities, not around
 * them — docs/12-buildplan-2.md flags cultural review as mandatory here and it
 * has not happened.
 *
 * So this ships synthesis: drones, struck tones and breath, generated from the
 * corpus state. It carries the information, it does not appropriate a liturgy,
 * and it can be replaced by anything a reviewer approves without the game
 * changing shape. Nothing here samples or imitates a specific tradition's
 * recitation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Era instrumentation, following the table's own materials. */
const ERA_VOICE = {
  neolithic: { base: 98,  partials: [1, 2, 3],       attack: 0.35, decay: 2.6, noise: 0.35 },
  bronze:    { base: 110, partials: [1, 2, 3, 4],    attack: 0.22, decay: 3.0, noise: 0.24 },
  iron:      { base: 123, partials: [1, 1.5, 2, 3],  attack: 0.12, decay: 3.4, noise: 0.16 },
  classical: { base: 131, partials: [1, 1.5, 2, 3, 4], attack: 0.08, decay: 4.2, noise: 0.10 },
  medieval:  { base: 146, partials: [1, 1.5, 2, 2.5, 3, 4], attack: 0.05, decay: 5.0, noise: 0.07 },
  modern:    { base: 155, partials: [1, 1.25, 1.5, 2, 3, 4], attack: 0.03, decay: 5.4, noise: 0.05 },
};

export const eraVoice = (year) =>
  year < -3300 ? 'neolithic' : year < -1300 ? 'bronze' : year < -200 ? 'iron'
  : year < 650 ? 'classical' : year < 1500 ? 'medieval' : 'modern';

/**
 * How full the sound is, from the state of the corpus.
 *
 * This is the whole design in one function: the player hears how much is being
 * held before they read the number.
 */
export function voiceOf({ extant = 0, lost = 0, schools = 0, total = 1 }) {
  const held = Math.max(0, Math.min(1, extant / Math.max(1, total * 0.35)));
  const bereft = Math.max(0, Math.min(1, lost / Math.max(1, total)));
  return {
    // How many partials sound: a fuller corpus is a fuller chord.
    voices: Math.max(1, Math.round(1 + held * 5)),
    // Schools carry the oral line; without them the texture loses its body.
    body: Math.max(0.12, Math.min(1, schools / 8)),
    // What has been lost darkens it rather than quietening it.
    darkness: bereft,
    gain: 0.05 + held * 0.10,
  };
}

/* ── Phase 52: the sound of the eras ────────────────────────────────────────
 * Audio as state, never as wallpaper. The mix budget is fixed at the pre-52
 * peak (drone ≤ 0.15 sustained, loss strike 0.10 momentary): sustained
 * additions below total ≤ 0.075 and momentary ones stay ≤ 0.05, so nothing
 * here can out-shout what already shipped.
 */

/** What the clock is made of, by era: a shadow, falling water, brass. */
export const clockVoice = (year) =>
  year < -550 ? 'gnomon' : year < 1600 ? 'water' : 'brass';

/**
 * Which family a texture incident belongs to, from its template id.
 * Weather and land / the knowledge economy / the road / the village —
 * four quiet timbres, so the m-tier is audible without being legible.
 */
export function textureFamily(id = '') {
  if (/drought|harvest|river|flood|locust|tank-silts/.test(id)) return 'weather';
  if (/manuscript|recitation|storyteller|student|lineage|copy|school|inscription|edict/.test(id)) return 'knowledge';
  if (/caravan|market|ferry|merchant|weights|boat|pilgrim|toll/.test(id)) return 'road';
  return 'village';
}

// One envelope shape per clock material. The gnomon barely sounds — a shadow
// makes no noise, and before coinage the tick should feel like a glance, not
// a mechanism.
export const CLOCK_TICK = {
  gnomon: { f0: 72,   f1: 72,   type: 'sine',     gain: 0.012, len: 0.30 },
  water:  { f0: 940,  f1: 590,  type: 'sine',     gain: 0.020, len: 0.16 },
  brass:  { f0: 1250, f1: 1250, type: 'triangle', gain: 0.018, len: 0.09 },
};

export const FAMILY_STRIKE = {
  weather:   { f: 147, type: 'sine',     gain: 0.045, len: 2.6 },
  knowledge: { f: 523, type: 'sine',     gain: 0.035, len: 1.8 },
  road:      { f: 330, type: 'triangle', gain: 0.030, len: 1.2 },
  village:   { f: 262, type: 'sine',     gain: 0.035, len: 1.5 },
};

export class Sound {
  constructor() {
    this.ctx = null; this.on = false; this.nodes = [];
    this.master = null; this.last = null;
    this.undertone = null; this.drying = null;
  }

  /** Audio must start from a gesture; this is called from the toggle. */
  async enable() {
    if (!this.ctx) {
      const AC = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.on = true;
    this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.4);
    return true;
  }

  disable() {
    if (!this.ctx) return;
    this.on = false;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  /** Rebuild the drone to match the corpus. Called when the state changes era or voice. */
  set(year, corpus) {
    if (!this.ctx || !this.on) return;
    const era = eraVoice(year);
    const v = voiceOf(corpus);
    const key = `${era}/${v.voices}/${Math.round(v.body * 8)}/${Math.round(v.darkness * 8)}`;
    if (key === this.last) return;
    this.last = key;

    const t = this.ctx.currentTime;
    for (const n of this.nodes) {
      try { n.gain.gain.setTargetAtTime(0, t, 0.5); n.stop?.(t + 2.4); } catch {}
    }
    this.nodes = [];

    const spec = ERA_VOICE[era];
    const partials = spec.partials.slice(0, v.voices);
    for (let i = 0; i < partials.length; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      // Darkness lowers the whole voice rather than muting it: a diminished
      // corpus should sound diminished, not absent.
      osc.frequency.value = spec.base * partials[i] * (1 - v.darkness * 0.12);
      osc.type = i === 0 ? 'sine' : 'triangle';
      g.gain.value = 0;
      g.gain.setTargetAtTime((v.gain / partials.length) * v.body, t, spec.attack + i * 0.3);
      osc.connect(g); g.connect(this.master);
      osc.start(t);
      this.nodes.push({ gain: g, stop: (at) => { try { osc.stop(at); } catch {} } });
    }
  }

  /** One struck tone, for a moment worth marking. */
  strike(kind = 'note') {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.value = kind === 'loss' ? 174 : kind === 'epoch' ? 392 : 294;
    osc.type = 'sine';
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(kind === 'loss' ? 0.10 : 0.07, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'loss' ? 3.4 : 1.6));
    osc.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + 4);
  }

  /** One clock tick in the era's material. The caller throttles. */
  tick(year) {
    if (!this.ctx || !this.on) return;
    const spec = CLOCK_TICK[clockVoice(year)];
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.f0, t);
    if (spec.f1 !== spec.f0) osc.frequency.exponentialRampToValueAtTime(spec.f1, t + spec.len);
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(spec.gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + spec.len);
    osc.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + spec.len + 0.05);
  }

  /** A texture incident, as one quiet strike in its family's timbre. */
  strikeFamily(family) {
    if (!this.ctx || !this.on) return;
    const spec = FAMILY_STRIKE[family] ?? FAMILY_STRIKE.village;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = spec.type;
    osc.frequency.value = spec.f;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(spec.gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + spec.len);
    osc.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + spec.len + 0.1);
  }

  /**
   * The occupation undertone: a sustained low fifth while foreign rule
   * stands. It does not announce itself — it is simply there, the way the
   * banner is, until it is not.
   */
  setUndertone(active) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (active && !this.undertone) {
      const g = this.ctx.createGain();
      g.gain.value = 0; g.connect(this.master);
      for (const [f, w] of [[55, 1], [82.5, 0.4]]) {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const og = this.ctx.createGain(); og.gain.value = w;
        o.connect(og); og.connect(g); o.start(t);
      }
      this.undertone = { g };
    }
    if (this.undertone) this.undertone.g.gain.setTargetAtTime(active ? 0.035 : 0, t, 1.2);
  }

  /**
   * The drying (phase 38's era, given a sound). `level` is the average water
   * of the standing Indus towns, 0..1; null when the era is not running.
   * The drone thins rather than fades — upper partials leave first, the way
   * the small towns empty before the great ones.
   */
  setDrying(level) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (level == null) {
      if (this.drying) this.drying.g.gain.setTargetAtTime(0, t, 1.5);
      return;
    }
    if (!this.drying) {
      const g = this.ctx.createGain();
      g.gain.value = 0; g.connect(this.master);
      const parts = [196, 294, 392].map((f) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const og = this.ctx.createGain(); og.gain.value = 0;
        o.connect(og); og.connect(g); o.start(t);
        return og;
      });
      this.drying = { g, parts };
    }
    const l = Math.max(0, Math.min(1, level));
    this.drying.parts.forEach((og, i) =>
      og.gain.setTargetAtTime(i === 0 ? 0.4 : l > i * 0.33 ? 0.3 : 0, t, 2));
    this.drying.g.gain.setTargetAtTime(this.on ? 0.012 + l * 0.028 : 0, t, 2);
  }

  /**
   * The silence.
   *
   * One deliberate silence in 1193. Everything stops, and comes back thinner.
   */
  silence(seconds = 4) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.25);
    this.master.gain.setTargetAtTime(1, t + seconds, 1.2);
    this.last = null;                        // force a rebuild on the way back
  }
}
