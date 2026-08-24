/**
 * The city renderer — L10 to L16.
 *
 * A separate scene graph from render-realm, sharing a camera contract and
 * nothing else (docs/00-plan.md §9). The moment they share more, a change to
 * one breaks the other.
 *
 * Same lighting rig as everything on the table: warm key from the upper-left at
 * 35° elevation, cool ambient fill at 15%, short warm contact shadow, matte.
 * A building is a footprint, a set of extruded walls lit by that key, and a
 * roof — drawn in that order so it composites like a model, not a floor plan.
 */
import { generateCity, DISTRICT, STREET, metresPerDegree } from '../../worldgen/src/city.js';

const PALETTE = {
  ground:   '#C6AC7C',
  street:   '#D8C7A2',
  streetEdge:'#A98F68',
  water:    '#3E8496',
  waterDeep:'#24606F',
  wall:     '#8E7248',
  gold:     '#C9A227',
  ink:      '#2A2118',
  roof: { mud: '#B08A5E', brick: '#A9704E', stone: '#BFB39A', water: '#3E8496' },
  face: { mud: '#8A6A44', brick: '#83543A', stone: '#948973', water: '#24606F' },
  lit:  { mud: '#D3B183', brick: '#C79070', stone: '#DCD2BC', water: '#7CB4C0' },
};

/** Sun direction in plan, from the locked rig: key at 45° azimuth, upper-left. */
const SUN = { x: 0.62, y: 0.62 };        // shadow offset direction, per metre of height
const SHADOW = 'rgba(92,70,40,.26)';

export class CityRenderer {
  constructor({ cities, seed = 'paramountcy' }) {
    this.cities = new Map(cities.map(c => [c.id, c]));
    this.seed = seed;
    this.cache = new Map();
  }

  has(id) { return this.cities.has(id); }
  city(id) { return this.cities.get(id); }

  /** Generated city for a year. Cached per decade — cities do not change hourly. */
  model(id, year) {
    const c = this.cities.get(id);
    if (!c) return null;
    const bucket = Math.floor(year / 10) * 10;
    const key = `${id}@${bucket}`;
    if (!this.cache.has(key)) {
      if (this.cache.size > 24) this.cache.clear();
      this.cache.set(key, generateCity(c, bucket, this.seed));
    }
    return this.cache.get(key);
  }

  /**
   * Draw a city.
   *
   * @param {object} proj   realm projection (lon/lat → canvas px)
   * @param {number} level  ladder rung
   * @param {number} alpha  0..1 cross-fade in from the realm view
   */
  draw(ctx, proj, id, year, level, dpr, alpha = 1) {
    const M = this.model(id, year);
    if (!M) return;
    const mpd = metresPerDegree(M.lat);
    // Local metres → canvas pixels.
    const X = (m) => proj.toX(M.lon + m / mpd.lon);
    const Y = (m) => proj.toY(M.lat + m / mpd.lat);
    // Pixels per metre, for line widths and shadow lengths.
    const ppm = Math.abs(X(100) - X(0)) / 100;
    if (!isFinite(ppm) || ppm <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    const path = (poly, close = true) => {
      ctx.beginPath();
      for (let i = 0; i < poly.length; i++) {
        const x = X(poly[i][0]), y = Y(poly[i][1]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (close) ctx.closePath();
    };

    // 1. The ground the city stands on. A soft edge, not a disc — a town has
    //    fields and outskirts, and a hard circle reads as a game board.
    const cx = X(0), cy = Y(0), R = M.radius * 1.45 * ppm;
    const g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
    g.addColorStop(0, PALETTE.ground);
    g.addColorStop(1, 'rgba(198,172,124,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

    // 2. Streets, widest first, as a filled casing plus a lighter surface.
    for (const pass of [0, 1]) {
      for (const s of M.streets) {
        const spec = STREET[s.kind] ?? STREET.street;
        ctx.strokeStyle = pass === 0 ? PALETTE.streetEdge : PALETTE.street;
        ctx.lineWidth = (spec.width + (pass === 0 ? 2.2 : 0)) * ppm;
        path(s.pts, false);
        ctx.stroke();
      }
    }

    // 3. Water — tanks and channels. Deep in the middle, shallow at the edge.
    for (const w of M.water) {
      path(w);
      ctx.fillStyle = PALETTE.waterDeep; ctx.fill();
      ctx.lineWidth = 2.5 * ppm; ctx.strokeStyle = PALETTE.water; ctx.stroke();
    }

    // 4. Anchor precincts — the part of the city that is not generic.
    //
    // A temple is not a grey rectangle. It is a walled enclosure with a
    // courtyard, gopurams on the axes, and a vimana that is by a wide margin the
    // tallest thing for a hundred miles. The Thanjavur vimana is 66 m and was
    // the tallest structure in India when it was finished in 1010; if the dive
    // does not show you that, it has not shown you Thanjavur.
    for (const a of M.anchors) {
      if (a.kind === 'tank') continue;
      // Courtyard.
      path(a.poly);
      ctx.fillStyle = '#C9BC9C'; ctx.fill();
      // Enclosure wall.
      ctx.lineWidth = 5 * ppm; ctx.strokeStyle = PALETTE.wall; ctx.stroke();
      ctx.lineWidth = 1.6 * ppm; ctx.strokeStyle = 'rgba(232,220,194,.55)'; ctx.stroke();

      if (!a.vimana) continue;
      // Gopurams: gate towers at the middle of each wall.
      const [cx0, cy0] = a.at, [w0, h0] = a.size;
      for (const [gx, gy, gw, gh] of [
        [cx0, cy0 - h0 / 2, w0 * 0.20, h0 * 0.055],
        [cx0, cy0 + h0 / 2, w0 * 0.20, h0 * 0.055],
        [cx0 - w0 / 2, cy0, w0 * 0.05, h0 * 0.16],
        [cx0 + w0 / 2, cy0, w0 * 0.05, h0 * 0.16],
      ]) tower(gx, gy, gw, gh, (a.height ?? 40) * 0.38);

      // The vimana. Stepped, because that is what it is.
      const [vx, vy] = a.vimana, [vw, vh] = a.vimanaSize ?? [70, 70];
      tower(vx, vy, vw, vh, a.height ?? 50, 5);
    }

    /**
     * A stepped tower: shadow, then tiers narrowing as they rise.
     *
     * Height is exaggerated on purpose. The Thanjavur vimana really is only
     * about thirty metres square inside a courtyard four hundred metres long,
     * so at true scale it is a dot — and it was the tallest structure in India.
     * Overscaling it is the same pictorial-map grammar the landmark markers use
     * at L0 (docs/08-visual-design.md §6.3): a symbol carries meaning that scale
     * cannot.
     */
    function tower(mx, my, w, h, height, tiers = 3) {
      const lift = height * ppm * 0.95;
      const ox = SUN.x * ppm * height, oy = SUN.y * ppm * height;
      ctx.fillStyle = SHADOW;
      ctx.beginPath();
      ctx.rect(X(mx - w / 2) + ox, Y(my - h / 2) + oy,
               (X(mx + w / 2) - X(mx - w / 2)), (Y(my + h / 2) - Y(my - h / 2)));
      ctx.fill();
      for (let t = 0; t < tiers; t++) {
        const k = 1 - t / (tiers + 0.6);
        const tw = w * k, th = h * k;
        const base = lift * (t / tiers), top = lift * ((t + 1) / tiers);
        const x1 = X(mx - tw / 2), x2 = X(mx + tw / 2);
        const y1 = Y(my - th / 2), y2 = Y(my + th / 2);
        // Front wall.
        ctx.fillStyle = PALETTE.face.stone;
        ctx.beginPath();
        ctx.moveTo(x1, y2 - base); ctx.lineTo(x2, y2 - base);
        ctx.lineTo(x2, y2 - top);  ctx.lineTo(x1, y2 - top);
        ctx.closePath(); ctx.fill();
        // Lit top.
        ctx.fillStyle = t === tiers - 1 ? PALETTE.lit.stone : PALETTE.roof.stone;
        ctx.beginPath();
        ctx.rect(x1, y1 - top, x2 - x1, (y2 - y1));
        ctx.fill();
      }
      // A gilded finial, because the accent colour means something here.
      if (tiers >= 5) {
        ctx.fillStyle = PALETTE.gold;
        ctx.beginPath();
        ctx.arc(X(mx), Y(my) - lift * 1.06, Math.max(1.5, w * 0.07 * ppm), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Buildings. Shadow, then walls, then roof — the order that makes a
    //    footprint read as a solid rather than a plan.
    const showBuildings = ppm > 0.055;
    if (showBuildings) {
      const ox = SUN.x * ppm, oy = SUN.y * ppm;

      ctx.fillStyle = SHADOW;
      for (const b of M.buildings) {
        ctx.beginPath();
        for (let i = 0; i < b.poly.length; i++) {
          const x = X(b.poly[i][0]) + b.height * ox, y = Y(b.poly[i][1]) + b.height * oy;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
      }

      for (const b of M.buildings) {
        const lift = b.height * ppm * 0.42;
        // Walls: the quad between each footprint edge and its lifted twin.
        ctx.fillStyle = PALETTE.face[b.colour] ?? PALETTE.face.mud;
        for (let i = 0; i < b.poly.length; i++) {
          const p = b.poly[i], q = b.poly[(i + 1) % b.poly.length];
          const x1 = X(p[0]), y1 = Y(p[1]), x2 = X(q[0]), y2 = Y(q[1]);
          // Only faces turned away from the key light are drawn as wall.
          if ((y2 - y1) * SUN.x - (x2 - x1) * SUN.y < 0) continue;
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y2 - lift); ctx.lineTo(x1, y1 - lift);
          ctx.closePath(); ctx.fill();
        }
        // Roof, lifted.
        ctx.beginPath();
        for (let i = 0; i < b.poly.length; i++) {
          const x = X(b.poly[i][0]), y = Y(b.poly[i][1]) - lift;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = PALETTE.roof[b.colour] ?? PALETTE.roof.mud;
        ctx.fill();
        if (ppm > 0.5) { ctx.lineWidth = 0.5 * dpr; ctx.strokeStyle = 'rgba(42,33,24,.28)'; ctx.stroke(); }
      }
    } else {
      // Too far out for individual houses: blocks as tone, so the city still
      // reads as built-up rather than empty.
      for (const b of M.blocks) {
        const spec = DISTRICT[b.district] ?? DISTRICT.dwelling;
        if (spec.density <= 0) continue;
        path(b.poly);
        ctx.fillStyle = `rgba(138,106,68,${(0.25 + spec.density * 0.45).toFixed(2)})`;
        ctx.fill();
      }
    }

    // 6. The wall, if the city has one yet.
    if (M.wall) {
      path(M.wall, false);
      ctx.lineWidth = 6 * ppm; ctx.strokeStyle = PALETTE.wall; ctx.stroke();
      ctx.lineWidth = 2 * ppm; ctx.strokeStyle = 'rgba(232,220,194,.5)'; ctx.stroke();
    }

    // 7. Anchor labels, once you are close enough to read them.
    if (ppm > 0.10) {
      ctx.font = `${Math.round(12 * dpr)}px Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const put = [];
      for (const a of M.anchors) {
        if (!a.name) continue;
        const x = X(a.at[0]), y = Y(a.at[1]) + (a.size[1] / 2) * ppm + 12 * dpr;
        const w = ctx.measureText(a.name).width;
        const bx = { x0: x - w / 2, x1: x + w / 2, y0: y - 9 * dpr, y1: y + 9 * dpr };
        if (put.some(q => !(bx.x1 < q.x0 || bx.x0 > q.x1 || bx.y1 < q.y0 || bx.y0 > q.y1))) continue;
        put.push(bx);
        ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(232,220,194,.9)';
        ctx.strokeText(a.name, x, y);
        ctx.fillStyle = PALETTE.ink; ctx.fillText(a.name, x, y);
      }
      ctx.textAlign = 'start';
    }

    ctx.restore();
  }
}
