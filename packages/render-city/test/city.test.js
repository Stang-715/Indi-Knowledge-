import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateCity, DISTRICT } from '../../worldgen/src/city.js';

const { cities } = JSON.parse(readFileSync(
  new URL('../../../data/cities/cities.json', import.meta.url), 'utf8'));
const thanjavur = cities.find(c => c.id === 'thanjavur');

test('a city is a pure function of (city, year, seed)', () => {
  const a = generateCity(thanjavur, 1200, 's');
  const b = generateCity(thanjavur, 1200, 's');
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('a different seed gives a different city', () => {
  const a = generateCity(thanjavur, 1200, 's1');
  const b = generateCity(thanjavur, 1200, 's2');
  assert.notEqual(JSON.stringify(a), JSON.stringify(b));
});

test('the city grows with age and then stops', () => {
  const r = (y) => generateCity(thanjavur, y, 's').radius;
  assert.ok(r(900) < r(1100), 'a young city should grow');
  assert.ok(r(1100) < r(1500));
  // Growth saturates: the last four centuries add less than the first two.
  assert.ok(r(1900) - r(1500) < r(1100) - r(900));
});

test('nothing exists before the city is founded', () => {
  const c = generateCity(thanjavur, 700, 's');   // founded 850
  assert.equal(c.radius, thanjavur.minRadius);
});

test('anchors appear only after their date', () => {
  const before = generateCity(thanjavur, 1000, 's');
  const after  = generateCity(thanjavur, 1050, 's');
  const named = (c) => c.anchors.map(a => a.name).sort();
  assert.ok(!named(before).includes('Brihadeeswarar'), 'the temple is 1010');
  assert.ok(named(after).includes('Brihadeeswarar'));
});

test('the wall appears only once the city is walled', () => {
  assert.equal(generateCity(thanjavur, 1000, 's').wall, null);
  assert.ok(generateCity(thanjavur, 1100, 's').wall);
});

test('a city has streets, blocks and buildings', () => {
  const c = generateCity(thanjavur, 1200, 's');
  assert.ok(c.streets.length >= 12);
  assert.ok(c.blocks.length > 100);
  assert.ok(c.buildings.length > 500, `only ${c.buildings.length} buildings`);
});

test('every building has a valid footprint and a height', () => {
  const c = generateCity(thanjavur, 1200, 's');
  for (const b of c.buildings) {
    assert.equal(b.poly.length, 4);
    for (const [x, y] of b.poly) assert.ok(Number.isFinite(x) && Number.isFinite(y));
    assert.ok(b.height > 0 && b.height < 40, `height ${b.height}`);
  }
});

test('buildings stay inside the city', () => {
  const c = generateCity(thanjavur, 1200, 's');
  for (const b of c.buildings)
    for (const [x, y] of b.poly)
      assert.ok(Math.hypot(x, y) < c.radius * 2.2, `building at ${x},${y} outside radius ${c.radius}`);
});

test('no building is placed on water', () => {
  const c = generateCity(thanjavur, 1200, 's');
  assert.ok(c.buildings.every(b => b.district !== 'tank'));
  assert.equal(DISTRICT.tank.density, 0);
});

test('plots are narrow and deep, not square', () => {
  // Frontage is the scarce thing, so plots run back from the street. If this
  // ever inverts, the city will render as a field of sheds.
  const c = generateCity(thanjavur, 1200, 's');
  let narrow = 0;
  for (const b of c.buildings.slice(0, 300)) {
    const w = Math.hypot(b.poly[1][0] - b.poly[0][0], b.poly[1][1] - b.poly[0][1]);
    const d = Math.hypot(b.poly[3][0] - b.poly[0][0], b.poly[3][1] - b.poly[0][1]);
    if (d > w) narrow++;
  }
  assert.ok(narrow > 150, `only ${narrow}/300 plots are deeper than wide`);
});

test('all three cities generate', () => {
  for (const c of cities) {
    const m = generateCity(c, 1600, 's');
    assert.ok(m.buildings.length > 100, `${c.id} produced ${m.buildings.length} buildings`);
  }
});

test('sub-metre detail is generated, never stored', () => {
  // The legal constraint, asserted. India's Geospatial Data Guidelines 2021
  // restrict data finer than 1 m; ladder levels 15-16 are 0.41 m and 0.21 m.
  // So the data file must carry no geometry at that resolution — only anchors.
  const raw = JSON.stringify(cities);
  assert.ok(raw.length < 6000, `city data is ${raw.length} bytes — too much to be skeleton only`);
  for (const c of cities) {
    assert.ok(!('buildings' in c), `${c.id} ships buildings as data`);
    assert.ok(!('streets' in c),   `${c.id} ships streets as data`);
  }
});
