/**
 * The population — the game's children, alive on the map.
 *
 * Every figure is an individual with a state machine, modeled on the atlas
 * prototype's proven NPC loop (js/game-population.js): idle → wander / hunt /
 * fight / forage, plus listen while a recital holds them. They start wild:
 * hunter-gatherers who fight each other, and the fighting kills. ORDER —
 * the meter your recitals raise — is the only thing that calms it. That is
 * the whole game stated as a rule.
 *
 * This is a live game loop, not the deterministic replay sim (packages/sim,
 * untouched elsewhere in the repo). Math.random is fine here: nothing in
 * this file is ever replayed from a log.
 */
import { drawChibi, drawDeer, drawFire } from './chibi-art.js';

/* ── Tuning ─────────────────────────────────────────────────────────────── */

export const START_POP = 56;
const START_ANIMALS = 22;
const POP_HARD_CAP = 420;

const WALK_SPEED = 0.22;          // degrees per real second, at 1x
const CAMP_RADIUS = 1.6;          // how far a villager strays from home, deg
const FIGHT_RANGE = 0.55;         // how close two hotheads must be, deg
const FIGHT_SECONDS = 2.6;
const FIGHT_DEATH_CHANCE = 0.11;  // per fight, scaled by wildness
const HUNT_RANGE = 2.2;
const ANIMAL_RESPAWN_DAYS = 1.2;

/** Camps: hand-placed inland points across the subcontinent. Presentation
 *  geography — the terrain renderer paints real land under all of them. */
const CAMPS = [
  [77.8, 23.2], [76.2, 15.1], [80.2, 26.1], [73.6, 26.2], [85.2, 23.4],
  [78.4, 11.1], [74.9, 19.6], [82.4, 21.6], [75.9, 30.6], [87.6, 24.6],
];

/** Clothes follow civilization: leaves, then plain cloth, then dyed cloth. */
const WARDROBE = [
  ['#5d7a3a', '#6f8a45', '#7a6a38', '#556b2f', '#7a5230'],          // leaves
  ['#b8a888', '#a89878', '#c0b090', '#98876a', '#b09c7c'],          // plain cloth
  ['#f4491c', '#00a085', '#fdae1c', '#7a4e8e', '#f79fb4'],          // dyed
];

/* ── State ──────────────────────────────────────────────────────────────── */

let people = [];
let animals = [];
let fires = [];          // {lon, lat} — lit by the fire card, phase 2+
let effects = [];        // {lon, lat, t, kind: 'death'|'birth'|'meat'}
let listenFocus = null;  // {lon, lat, rDeg} while a recital holds
let counters = { deathsFight: 0, deathsHunger: 0, births: 0, meat: 0 };

const rnd = Math.random;
const pick = (arr) => arr[(rnd() * arr.length) | 0];

function makePerson(camp) {
  const [clon, clat] = camp;
  return {
    camp,
    lon: clon + (rnd() - 0.5) * CAMP_RADIUS,
    lat: clat + (rnd() - 0.5) * CAMP_RADIUS,
    tlon: 0, tlat: 0,
    state: 'idle', timer: rnd() * 3,
    clothIdx: (rnd() * 5) | 0,
    phase: rnd() * Math.PI * 2,
    foe: null, prey: null,
  };
}

function makeAnimal() {
  const [clon, clat] = pick(CAMPS);
  return {
    lon: clon + (rnd() - 0.5) * 4,
    lat: clat + (rnd() - 0.5) * 3,
    tlon: 0, tlat: 0,
    state: 'graze', timer: rnd() * 4,
    phase: rnd() * Math.PI * 2,
  };
}

export function initPop() {
  people = [];
  animals = [];
  fires = [];
  effects = [];
  counters = { deathsFight: 0, deathsHunger: 0, births: 0, meat: 0 };
  for (let i = 0; i < START_POP; i++) people.push(makePerson(CAMPS[i % CAMPS.length]));
  for (let i = 0; i < START_ANIMALS; i++) animals.push(makeAnimal());
}

export const popCount = () => people.length;
export const animalCount = () => animals.length;
export const campList = () => CAMPS;

export function setListenFocus(f) { listenFocus = f; }

export function lightFire(lon, lat) { fires.push({ lon, lat }); }
export const fireCount = () => fires.length;

/** Drain the running tallies (deaths, births, meat) since last asked. */
export function takeCounters() {
  const c = counters;
  counters = { deathsFight: 0, deathsHunger: 0, births: 0, meat: 0 };
  return c;
}

/* ── The tick ───────────────────────────────────────────────────────────── */

function walkToward(p, speed, dt) {
  const dx = p.tlon - p.lon, dy = p.tlat - p.lat;
  const d = Math.hypot(dx, dy);
  if (d < 0.03) return true;
  p.lon += (dx / d) * speed * dt;
  p.lat += (dy / d) * speed * dt;
  return false;
}

/**
 * @param dt      real seconds elapsed, already multiplied by game speed
 * @param meters  { order, food } — read for behavior, never written here
 */
export function tickPop(dt, meters) {
  const wild = Math.max(0, 1 - meters.order / 100);

  // A recital gathers everyone in range: they drop what they are doing.
  if (listenFocus) {
    for (const p of people) {
      const d = Math.hypot(p.lon - listenFocus.lon, p.lat - listenFocus.lat);
      if (d < listenFocus.rDeg) {
        if (p.state !== 'listen') { p.state = 'listen'; p.foe = null; p.prey = null; }
      }
    }
  }

  for (const p of people) {
    p.timer -= dt;
    switch (p.state) {
      case 'listen':
        if (!listenFocus) { p.state = 'idle'; p.timer = 0.5 + rnd(); }
        break;

      case 'idle':
        if (p.timer > 0) break;
        // What does a wild person do next? Mostly wander and forage;
        // sometimes pick a fight (scaled by wildness); hunt if hungry times.
        if (rnd() < 0.16 * wild) {
          let foe = null, bd = FIGHT_RANGE;
          for (const q of people) {
            if (q === p || q.state === 'listen' || q.state === 'fight') continue;
            const d = Math.hypot(q.lon - p.lon, q.lat - p.lat);
            if (d < bd) { bd = d; foe = q; }
          }
          if (foe) {
            p.state = 'fight'; p.timer = FIGHT_SECONDS; p.foe = foe;
            foe.state = 'fight'; foe.timer = FIGHT_SECONDS; foe.foe = p;
            break;
          }
        }
        if (meters.food < 55 && rnd() < 0.35) {
          let prey = null, bd = HUNT_RANGE;
          for (const a of animals) {
            const d = Math.hypot(a.lon - p.lon, a.lat - p.lat);
            if (d < bd) { bd = d; prey = a; }
          }
          if (prey) { p.state = 'hunt'; p.prey = prey; break; }
        }
        p.state = 'walk';
        p.tlon = p.camp[0] + (rnd() - 0.5) * CAMP_RADIUS * 2;
        p.tlat = p.camp[1] + (rnd() - 0.5) * CAMP_RADIUS * 1.6;
        break;

      case 'walk':
        if (walkToward(p, WALK_SPEED, dt)) { p.state = 'idle'; p.timer = 1 + rnd() * 3; }
        break;

      case 'fight': {
        // stay locked on the foe; when the timer runs out, someone may die
        if (!p.foe || p.foe.state !== 'fight') { p.state = 'idle'; p.timer = 1; p.foe = null; break; }
        if (p.timer <= 0) {
          const foe = p.foe;
          p.state = 'idle'; p.timer = 1.5 + rnd(); p.foe = null;
          foe.state = 'idle'; foe.timer = 1.5 + rnd(); foe.foe = null;
          if (rnd() < FIGHT_DEATH_CHANCE * (0.35 + wild)) {
            const dead = rnd() < 0.5 ? p : foe;
            effects.push({ lon: dead.lon, lat: dead.lat, t: 0, kind: 'death' });
            people.splice(people.indexOf(dead), 1);
            counters.deathsFight++;
          }
        }
        break;
      }

      case 'hunt': {
        const a = p.prey;
        if (!a || !animals.includes(a)) { p.state = 'idle'; p.timer = 0.6; p.prey = null; break; }
        p.tlon = a.lon; p.tlat = a.lat;
        if (walkToward(p, WALK_SPEED * 1.5, dt)) {
          animals.splice(animals.indexOf(a), 1);
          effects.push({ lon: a.lon, lat: a.lat, t: 0, kind: 'meat' });
          counters.meat++;
          p.state = 'idle'; p.timer = 2 + rnd() * 2; p.prey = null;
        }
        break;
      }
    }
  }

  // Animals: graze and drift; flee a hunter who gets close.
  for (const a of animals) {
    a.timer -= dt;
    let hunter = null, bd = 0.5;
    for (const p of people) {
      if (p.state !== 'hunt' || p.prey !== a) continue;
      const d = Math.hypot(p.lon - a.lon, p.lat - a.lat);
      if (d < bd) { bd = d; hunter = p; }
    }
    if (hunter) {
      a.state = 'flee';
      const dx = a.lon - hunter.lon, dy = a.lat - hunter.lat;
      const d = Math.hypot(dx, dy) || 1;
      a.lon += (dx / d) * WALK_SPEED * 1.15 * dt;
      a.lat += (dy / d) * WALK_SPEED * 1.15 * dt;
    } else if (a.state === 'flee') {
      a.state = 'graze'; a.timer = 1;
    } else if (a.timer <= 0) {
      a.tlon = a.lon + (rnd() - 0.5) * 1.2;
      a.tlat = a.lat + (rnd() - 0.5) * 0.9;
      a.timer = 3 + rnd() * 5;
    } else {
      walkToward(a, WALK_SPEED * 0.25, dt);
    }
  }

  for (let e = effects.length - 1; e >= 0; e--) {
    effects[e].t += dt;
    if (effects[e].t > 1.6) effects.splice(e, 1);
  }
}

/** Once per game day: births, hunger, animal respawn. Returns nothing —
 *  results land in the counters the HUD drains via takeCounters(). */
export function dailyPop(meters) {
  // Births need food and a little order; hard-capped for legibility.
  if (meters.food > 30 && people.length < POP_HARD_CAP) {
    const expect = people.length * 0.012 * (0.35 + meters.order / 120);
    let n = Math.floor(expect) + (rnd() < expect % 1 ? 1 : 0);
    while (n-- > 0 && people.length < POP_HARD_CAP) {
      const baby = makePerson(pick(CAMPS));
      people.push(baby);
      effects.push({ lon: baby.lon, lat: baby.lat, t: 0, kind: 'birth' });
      counters.births++;
    }
  }
  // Starvation: an empty larder kills, quietly and fairly.
  if (meters.food <= 0 && people.length > 12) {
    const n = Math.max(1, Math.round(people.length * 0.02));
    for (let i = 0; i < n && people.length > 12; i++) {
      const dead = people[(rnd() * people.length) | 0];
      effects.push({ lon: dead.lon, lat: dead.lat, t: 0, kind: 'death' });
      people.splice(people.indexOf(dead), 1);
      counters.deathsHunger++;
    }
  }
  // The wild replenishes.
  const target = START_ANIMALS + Math.round(people.length / 12);
  if (animals.length < target && rnd() < 1 / ANIMAL_RESPAWN_DAYS) animals.push(makeAnimal());
}

/* ── Drawing ────────────────────────────────────────────────────────────── */

/**
 * @param level  civilization level 1..10 — picks the wardrobe
 */
export function drawPop(ctx, proj, dpr, now, level) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const size = 11 * dpr;
  const wardrobe = WARDROBE[level >= 9 ? 2 : level >= 4 ? 1 : 0];

  for (const f of fires) {
    const x = proj.toX(f.lon), y = proj.toY(f.lat);
    if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
    drawFire(ctx, x, y, 14 * dpr, now, f.lon * 7);
  }

  for (const a of animals) {
    const x = proj.toX(a.lon), y = proj.toY(a.lat);
    if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
    drawDeer(ctx, x, y, 10 * dpr, dpr, a.phase, now, a.state === 'flee');
  }

  for (const p of people) {
    const x = proj.toX(p.lon), y = proj.toY(p.lat);
    if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
    drawChibi(ctx, x, y, size, wardrobe[p.clothIdx], p.state, now, p.phase, dpr);
  }

  // Effects: a death mark fades dark; a birth blooms gold; meat is a brief red dot.
  for (const e of effects) {
    const x = proj.toX(e.lon), y = proj.toY(e.lat);
    const fade = 1 - e.t / 1.6;
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    if (e.kind === 'death') {
      ctx.strokeStyle = '#3e2540';
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      ctx.moveTo(x - 4 * dpr, y - 4 * dpr); ctx.lineTo(x + 4 * dpr, y + 4 * dpr);
      ctx.moveTo(x + 4 * dpr, y - 4 * dpr); ctx.lineTo(x - 4 * dpr, y + 4 * dpr);
      ctx.stroke();
    } else if (e.kind === 'birth') {
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath();
      ctx.arc(x, y, (3 + e.t * 8) * dpr, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#c63c13';
      ctx.beginPath();
      ctx.arc(x, y, 2.4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
