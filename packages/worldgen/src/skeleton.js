/**
 * Decode the packed skeleton bundle into lon/lat rings and polylines.
 *
 * The bundle stores coordinates as uint16 quantised into the bounding box,
 * base64-packed. 138 KB for a continent's coastline, rivers and lakes at five
 * levels of detail — against Victoria 3's 34 MB of map data.
 */

function b64ToU16(s) {
  const bin = typeof atob === 'function'
    ? atob(s)
    : Buffer.from(s, 'base64').toString('binary');
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Uint16Array(u8.buffer, u8.byteOffset, u8.byteLength >> 1);
}

function unpack(a) {
  const out = [];
  let i = 0;
  const n = a[i++];
  for (let k = 0; k < n; k++) {
    const len = a[i++];
    out.push(a.subarray(i, i + len * 2));
    i += len * 2;
  }
  return out;
}

const Q = 65535;

export function loadSkeleton(bundle) {
  const bb = bundle.bbox;
  const lon = (x) => bb.w + (x / Q) * (bb.e - bb.w);
  const lat = (y) => bb.s + (y / Q) * (bb.n - bb.s);

  const toRings = (packed) => unpack(b64ToU16(packed)).map(flat => {
    const lons = new Float64Array(flat.length / 2);
    const lats = new Float64Array(flat.length / 2);
    for (let i = 0, k = 0; i < flat.length; i += 2, k++) {
      lons[k] = lon(flat[i]); lats[k] = lat(flat[i + 1]);
    }
    return { lon: lons, lat: lats };
  });

  const ranks = b64ToU16(bundle.riverRanks);
  const rivers = toRings(bundle.rivers).map((r, i) => ({ ...r, rank: ranks[i] ?? 6 }));

  return {
    bbox: bb,
    oro: bundle.oro,
    land:   toRings(bundle.land),
    india:  toRings(bundle.india),
    neigh:  toRings(bundle.neigh),
    lakes:  toRings(bundle.lakes),
    rivers,
  };
}
