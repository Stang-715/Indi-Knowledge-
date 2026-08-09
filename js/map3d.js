/* ============================================================
   Map3D — real 3D India, built from the actual district polygons.

   Every state is extruded into a solid: triangulated top face plus
   side walls, lit by a fixed world light so shading stays correct
   through a full 360° orbit. Height is data-driven per tab.

   WebGL1, no libraries, no external assets — runs from file://.
   Picking is done with an offscreen id-colour pass, so clicks and
   hovers hit the real geometry at any camera angle.
   ============================================================ */
(function () {
  "use strict";

  var BASE_H = 0.105;      // every state has thickness, even with no data
  var SPAN_H = 0.22;       // extra height the tab metric can add
  var LIGHT = [-0.55, 0.83]; // world-space light direction in the XZ plane

  var M = {
    gl: null, canvas: null, prog: null, fbo: null, fboTex: null, fboDepth: null,
    buf: {}, loc: {},
    slugs: [], idx: {},
    nVert: 0,
    arr: {},                 // cpu-side attribute arrays
    heights: {}, colors: {},
    centroids: {},           // slug -> [x,z]
    az: -0.16, el: 0.92, dist: 2.85,   // radians / world units
    target: null,            // animation target
    center: [0, 0],
    hover: -1, selected: -1,
    hooks: {}, dirty: true, raf: null, ready: false,
    drag: null, moved: false,
  };

  /* ---------------- small matrix helpers (column-major) ---------------- */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] +
                       a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    var o = new Float32Array(16);
    o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf;
    o[11] = -1; o[14] = 2 * far * near * nf;
    return o;
  }
  function lookAt(eye, ctr, up) {
    var zx = eye[0] - ctr[0], zy = eye[1] - ctr[1], zz = eye[2] - ctr[2];
    var zl = Math.hypot(zx, zy, zz); zx /= zl; zy /= zl; zz /= zl;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    var xl = Math.hypot(xx, xy, xz) || 1; xx /= xl; xy /= xl; xz /= xl;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    var o = new Float32Array(16);
    o[0] = xx; o[1] = yx; o[2] = zx;
    o[4] = xy; o[5] = yy; o[6] = zy;
    o[8] = xz; o[9] = yz; o[10] = zz;
    o[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    o[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    o[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    o[15] = 1;
    return o;
  }

  /* ---------------- geometry: ear-clipping triangulation ---------------- */
  function shoelace(xy) {
    var a = 0, n = xy.length / 2;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      a += xy[j * 2] * xy[i * 2 + 1] - xy[i * 2] * xy[j * 2 + 1];
    }
    return a / 2;
  }
  function inTri(ax, ay, bx, by, cx, cy, px, py) {
    var d1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    var d2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
    var d3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
    return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0);
  }
  function snip(xy, u, v, w, nv, V) {
    var ax = xy[V[u] * 2], ay = xy[V[u] * 2 + 1];
    var bx = xy[V[v] * 2], by = xy[V[v] * 2 + 1];
    var cx = xy[V[w] * 2], cy = xy[V[w] * 2 + 1];
    if (((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) <= 1e-12) return false;
    for (var p = 0; p < nv; p++) {
      if (p === u || p === v || p === w) continue;
      if (inTri(ax, ay, bx, by, cx, cy, xy[V[p] * 2], xy[V[p] * 2 + 1])) return false;
    }
    return true;
  }
  function triangulate(xy) {
    var n = xy.length / 2, out = [];
    if (n < 3) return out;
    var V = new Array(n), i;
    if (shoelace(xy) > 0) { for (i = 0; i < n; i++) V[i] = i; }
    else { for (i = 0; i < n; i++) V[i] = (n - 1) - i; }
    var nv = n, guard = 2 * nv, v = nv - 1;
    while (nv > 2 && guard-- > 0) {
      var u = v; if (nv <= u) u = 0;
      v = u + 1; if (nv <= v) v = 0;
      var w = v + 1; if (nv <= w) w = 0;
      if (snip(xy, u, v, w, nv, V)) {
        out.push(V[u], V[v], V[w]);
        for (var s = v, t = v + 1; t < nv; s++, t++) V[s] = V[t];
        nv--; guard = 2 * nv;
      }
    }
    return out;
  }

  /* ---------------- build vertex arrays from INDIA_MAP ---------------- */
  function build() {
    var data = window.INDIA_MAP, bbox = data.bbox;
    var minLon = bbox[0], minLat = bbox[1], maxLon = bbox[2], maxLat = bbox[3];
    var midLat = (minLat + maxLat) / 2 * Math.PI / 180;
    var kx = Math.cos(midLat);
    var spanX = (maxLon - minLon) * kx, spanY = (maxLat - minLat);
    var scale = 2 / Math.max(spanX, spanY);
    var cx0 = (minLon + maxLon) / 2, cy0 = (minLat + maxLat) / 2;
    function px(lon) { return (lon - cx0) * kx * scale; }
    function pz(lat) { return -(lat - cy0) * scale; }   // north = -Z

    var pos = [], yy = [], shade = [], sidx = [];
    var slugs = Object.keys(data.states);
    M.slugs = slugs;
    slugs.forEach(function (s, i) { M.idx[s] = i; });

    var ll = Math.hypot(LIGHT[0], LIGHT[1]);
    var lx = LIGHT[0] / ll, lz = LIGHT[1] / ll;

    slugs.forEach(function (slug, si) {
      var st = data.states[slug];
      var sumX = 0, sumZ = 0, nPts = 0;
      // Extrude the STATE silhouette, not each district: internal district
      // walls would otherwise show through as coincident spikes.
      var rings = [];
      if (st.outline && st.outline.length) {
        st.outline.forEach(function (flat) { rings.push(flat); });
      } else {
        st.districts.forEach(function (d) {
          d.p.forEach(function (flat) { rings.push(flat); });
        });
      }

      rings.forEach(function (flat) {
        var n = flat.length / 2;
        if (n < 4 || Math.abs(shoelace(flat)) < 1e-7) return;   // needles / degenerate
        var xy = new Float64Array(flat.length);
        for (var i = 0; i < n; i++) {
          xy[i * 2] = px(flat[i * 2]);
          xy[i * 2 + 1] = pz(flat[i * 2 + 1]);
          sumX += xy[i * 2]; sumZ += xy[i * 2 + 1]; nPts++;
        }
        // top face
        var tris = triangulate(xy);
        for (var t = 0; t < tris.length; t++) {
          var k = tris[t] * 2;
          pos.push(xy[k], xy[k + 1]); yy.push(1); shade.push(1.0); sidx.push(si);
        }
        // side walls: one quad per edge, shaded by its outward normal
        for (var e = 0; e < n; e++) {
          var i0 = e * 2, i1 = ((e + 1) % n) * 2;
          var x0 = xy[i0], z0 = xy[i0 + 1], x1 = xy[i1], z1 = xy[i1 + 1];
          var ex = x1 - x0, ez = z1 - z0;
          var el2 = Math.hypot(ex, ez) || 1;
          var nx = ez / el2, nz = -ex / el2;                 // edge normal
          var lam = Math.max(0, nx * lx + nz * lz);
          var sh = 0.40 + 0.42 * lam;
          // (x0,0) (x1,0) (x1,1) / (x0,0) (x1,1) (x0,1)
          pos.push(x0, z0); yy.push(0); shade.push(sh); sidx.push(si);
          pos.push(x1, z1); yy.push(0); shade.push(sh); sidx.push(si);
          pos.push(x1, z1); yy.push(1); shade.push(sh); sidx.push(si);
          pos.push(x0, z0); yy.push(0); shade.push(sh); sidx.push(si);
          pos.push(x1, z1); yy.push(1); shade.push(sh); sidx.push(si);
          pos.push(x0, z0); yy.push(1); shade.push(sh); sidx.push(si);
        }
      });
      M.centroids[slug] = [sumX / nPts, sumZ / nPts];
    });

    M.nVert = yy.length;
    M.arr.pos = new Float32Array(pos);
    M.arr.y = new Float32Array(yy);
    M.arr.shade = new Float32Array(shade);
    M.arr.state = new Float32Array(sidx);
    M.arr.height = new Float32Array(M.nVert);
    M.arr.color = new Uint8Array(M.nVert * 3);
  }

  /* ---------------- GL setup ---------------- */
  // Precision of anything shared with the fragment shader must match it
  // exactly (mediump), or the program fails to link. Position maths stays highp.
  var VS = [
    "precision highp float;",
    "attribute vec2 aPos;",
    "attribute float aY;",
    "attribute float aShade;",
    "attribute float aState;",
    "attribute float aHeight;",
    "attribute vec3 aColor;",
    "uniform mat4 uMVP;",
    "uniform float uHover;",
    "uniform float uSel;",
    "uniform mediump float uPick;",
    "uniform mediump float uFlat;",
    "varying mediump vec3 vColor;",
    "varying mediump float vShade;",
    "varying mediump vec2 vW;",
    "void main(){",
    "  float lift = 0.0;",
    "  if (abs(aState-uSel) < 0.5) lift = 0.055;",
    "  else if (abs(aState-uHover) < 0.5) lift = 0.028;",
    "  float y = aY * aHeight + lift;",
    "  vec2 p = aPos;",
    "  if (uFlat > 0.5) { y = -0.004; p = aPos + vec2(0.055, 0.055); }",
    "  gl_Position = uMVP * vec4(p.x, y, p.y, 1.0);",
    "  if (uPick > 0.5) {",
    "    float id = aState + 1.0;",
    "    vColor = vec3(mod(id,256.0)/255.0, floor(id/256.0)/255.0, 0.0);",
    "    vShade = 1.0;",
    "  } else { vColor = aColor; vShade = aShade; }",
    "  vW = aPos;",
    "}",
  ].join("\n");

  var FS = [
    "precision mediump float;",
    "varying vec3 vColor;",
    "varying float vShade;",
    "varying vec2 vW;",
    "uniform float uPick;",
    "uniform float uFlat;",
    "void main(){",
    "  if (uPick > 0.5) { gl_FragColor = vec4(vColor,1.0); return; }",
    "  if (uFlat > 0.5) { gl_FragColor = vec4(0.244,0.145,0.251,0.16); return; }",
    // fine paper/clay grain so faces read as printed material, not plastic
    "  float g = fract(sin(dot(vW*90.0, vec2(12.9898,78.233)))*43758.545);",
    "  vec3 c = vColor * vShade + (g-0.5)*0.032;",
    "  gl_FragColor = vec4(clamp(c,0.0,1.0), 1.0);",
    "}",
  ].join("\n");

  function shader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error("shader: " + gl.getShaderInfoLog(s));
    }
    return s;
  }

  function initGL() {
    var gl = M.canvas.getContext("webgl", { antialias: true, alpha: false }) ||
             M.canvas.getContext("experimental-webgl", { antialias: true, alpha: false });
    if (!gl) return false;
    M.gl = gl;

    var p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error("link: " + gl.getProgramInfoLog(p));
    }
    M.prog = p;
    gl.useProgram(p);

    ["aPos", "aY", "aShade", "aState", "aHeight", "aColor"].forEach(function (n) {
      M.loc[n] = gl.getAttribLocation(p, n);
    });
    ["uMVP", "uHover", "uSel", "uPick", "uFlat"].forEach(function (n) {
      M.loc[n] = gl.getUniformLocation(p, n);
    });

    function mk(data, usage) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
      return b;
    }
    M.buf.pos = mk(M.arr.pos);
    M.buf.y = mk(M.arr.y);
    M.buf.shade = mk(M.arr.shade);
    M.buf.state = mk(M.arr.state);
    M.buf.height = mk(M.arr.height, gl.DYNAMIC_DRAW);
    M.buf.color = mk(M.arr.color, gl.DYNAMIC_DRAW);

    gl.enable(gl.DEPTH_TEST);
    // No culling: ring winding varies across the source data, and a dropped
    // top face reads as a hole. Double-siding costs little at this vertex count.
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  }

  function makeFBO(w, h) {
    var gl = M.gl;
    if (M.fbo) { gl.deleteFramebuffer(M.fbo); gl.deleteTexture(M.fboTex); gl.deleteRenderbuffer(M.fboDepth); }
    M.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, M.fbo);
    M.fboTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, M.fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, M.fboTex, 0);
    M.fboDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, M.fboDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, M.fboDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    M.fboW = w; M.fboH = h;
  }

  /* ---------------- per-tab data (colour + height) ---------------- */
  function hex2rgb(h) {
    h = String(h || "#dcdcd7").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function setData(colorsBySlug, metricsBySlug) {
    var maxV = 0;
    M.slugs.forEach(function (s) { maxV = Math.max(maxV, metricsBySlug[s] || 0); });
    if (!maxV) maxV = 1;
    var rgb = {}, hgt = {};
    M.slugs.forEach(function (s) {
      rgb[s] = hex2rgb(colorsBySlug[s]);
      hgt[s] = BASE_H + SPAN_H * Math.pow((metricsBySlug[s] || 0) / maxV, 0.75);
    });
    M.colors = rgb; M.heights = hgt;

    var st = M.arr.state, col = M.arr.color, hb = M.arr.height;
    for (var i = 0; i < M.nVert; i++) {
      var slug = M.slugs[st[i]];
      var c = rgb[slug];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      hb[i] = hgt[slug];
    }
    if (M.gl) {
      var gl = M.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, M.buf.color);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, col);
      gl.bindBuffer(gl.ARRAY_BUFFER, M.buf.height);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, hb);
    }
    M.dirty = true;
  }

  /* ---------------- draw ---------------- */
  function camera(aspect) {
    var ce = [M.center[0], 0, M.center[1]];
    var ey = [
      ce[0] + M.dist * Math.sin(M.az) * Math.cos(M.el),
      ce[1] + M.dist * Math.sin(M.el),
      ce[2] + M.dist * Math.cos(M.az) * Math.cos(M.el),
    ];
    return mul(perspective(0.72, aspect, 0.05, 20), lookAt(ey, ce, [0, 1, 0]));
  }

  function bindAttribs() {
    var gl = M.gl;
    function at(name, buf, size, type, norm) {
      var l = M.loc[name];
      if (l < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, size, type || gl.FLOAT, !!norm, 0, 0);
    }
    at("aPos", M.buf.pos, 2);
    at("aY", M.buf.y, 1);
    at("aShade", M.buf.shade, 1);
    at("aState", M.buf.state, 1);
    at("aHeight", M.buf.height, 1);
    at("aColor", M.buf.color, 3, gl.UNSIGNED_BYTE, true);
  }

  function draw() {
    if (!M.ready) return;
    var gl = M.gl, c = M.canvas;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(c.clientWidth * dpr));
    var h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; makeFBO(w, h); }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.906, 0.906, 0.890, 1);   // slightly deeper than --card so pale states read
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mvp = camera(w / h);
    gl.useProgram(M.prog);
    bindAttribs();
    gl.uniformMatrix4fv(M.loc.uMVP, false, mvp);
    gl.uniform1f(M.loc.uHover, M.hover);
    gl.uniform1f(M.loc.uSel, M.selected);
    gl.uniform1f(M.loc.uPick, 0);

    // contact shadow (flattened silhouette, offset along the light)
    gl.uniform1f(M.loc.uFlat, 1);
    gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES, 0, M.nVert);
    gl.depthMask(true);

    // the model
    gl.uniform1f(M.loc.uFlat, 0);
    gl.drawArrays(gl.TRIANGLES, 0, M.nVert);

    M.dirty = false;
    if (M.hooks.onFrame) M.hooks.onFrame();
  }

  function loop() {
    M.raf = requestAnimationFrame(loop);
    if (M.target) stepAnim();
    if (M.dirty) draw();
  }

  function stepAnim() {
    var t = M.target, k = 0.16, done = true;
    ["az", "el", "dist"].forEach(function (p) {
      if (t[p] === undefined) return;
      var d = t[p] - M[p];
      if (Math.abs(d) > 1e-4) { M[p] += d * k; done = false; } else M[p] = t[p];
    });
    if (t.center) {
      for (var i = 0; i < 2; i++) {
        var d2 = t.center[i] - M.center[i];
        if (Math.abs(d2) > 1e-4) { M.center[i] += d2 * k; done = false; } else M.center[i] = t.center[i];
      }
    }
    M.dirty = true;
    if (done) M.target = null;
  }

  /* ---------------- picking ---------------- */
  function pickAt(clientX, clientY) {
    if (!M.ready || !M.fbo) return -1;
    var gl = M.gl, r = M.canvas.getBoundingClientRect();
    var dpr = M.canvas.width / r.width;
    var x = Math.round((clientX - r.left) * dpr);
    var y = Math.round((r.bottom - clientY) * dpr);
    if (x < 0 || y < 0 || x >= M.canvas.width || y >= M.canvas.height) return -1;

    gl.bindFramebuffer(gl.FRAMEBUFFER, M.fbo);
    gl.viewport(0, 0, M.canvas.width, M.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(M.prog);
    bindAttribs();
    gl.uniformMatrix4fv(M.loc.uMVP, false, camera(M.canvas.width / M.canvas.height));
    gl.uniform1f(M.loc.uHover, M.hover);
    gl.uniform1f(M.loc.uSel, M.selected);
    gl.uniform1f(M.loc.uFlat, 0);
    gl.uniform1f(M.loc.uPick, 1);
    gl.drawArrays(gl.TRIANGLES, 0, M.nVert);

    var px = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var id = px[0] + px[1] * 256;
    return id > 0 ? id - 1 : -1;
  }

  /* ---------------- interaction ---------------- */
  function wire() {
    var c = M.canvas;

    c.addEventListener("pointerdown", function (e) {
      M.drag = { x: e.clientX, y: e.clientY };
      M.moved = false;
      c.setPointerCapture && c.setPointerCapture(e.pointerId);
      c.classList.add("grabbing");
    });

    c.addEventListener("pointermove", function (e) {
      if (M.drag) {
        var dx = e.clientX - M.drag.x, dy = e.clientY - M.drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) M.moved = true;
        M.drag.x = e.clientX; M.drag.y = e.clientY;
        M.az -= dx * 0.008;                                   // full 360°, no clamp
        M.el = Math.max(0.08, Math.min(1.45, M.el + dy * 0.006));
        M.target = null;
        M.dirty = true;
        return;
      }
      var id = pickAt(e.clientX, e.clientY);
      if (id !== M.hover) {
        M.hover = id;
        M.dirty = true;
        if (M.hooks.onHover) M.hooks.onHover(id >= 0 ? M.slugs[id] : null, e);
      } else if (id >= 0 && M.hooks.onHover) {
        M.hooks.onHover(M.slugs[id], e);
      }
    });

    window.addEventListener("pointerup", function () {
      if (M.drag) { M.drag = null; c.classList.remove("grabbing"); }
    });

    c.addEventListener("pointerleave", function () {
      if (M.hover !== -1) { M.hover = -1; M.dirty = true; }
      if (M.hooks.onHover) M.hooks.onHover(null);
    });

    c.addEventListener("click", function (e) {
      if (M.moved) { M.moved = false; return; }   // a drag is not a click
      var id = pickAt(e.clientX, e.clientY);
      M.selected = id;
      M.dirty = true;
      if (M.hooks.onSelect) M.hooks.onSelect(id >= 0 ? M.slugs[id] : null, e);
    });

    c.addEventListener("wheel", function (e) {
      M.dist = Math.max(0.8, Math.min(6, M.dist + e.deltaY * 0.0016));
      M.target = null; M.dirty = true;
      e.preventDefault();
    }, { passive: false });

    c.addEventListener("dblclick", function (e) { api.home(); e.preventDefault(); });

    window.addEventListener("resize", function () { M.dirty = true; });
  }

  /* ---------------- public API ---------------- */
  var api = {
    supported: function () {
      try {
        var t = document.createElement("canvas");
        return !!(t.getContext("webgl") || t.getContext("experimental-webgl"));
      } catch (e) { return false; }
    },
    init: function (opts) {
      M.canvas = opts.canvas;
      M.hooks = opts;
      try {
        build();
        if (!initGL()) return false;
      } catch (err) {
        if (window.console) console.error("Map3D init failed:", err.message);
        return false;
      }
      M.ready = true;
      wire();
      loop();
      return true;
    },
    setData: setData,
    invalidate: function () { M.dirty = true; },
    select: function (slug) {
      M.selected = slug && M.idx[slug] !== undefined ? M.idx[slug] : -1;
      M.dirty = true;
    },
    focus: function (slug) {
      var c = M.centroids[slug];
      if (!c) return;
      M.target = { center: [c[0], c[1]], dist: 1.5, el: Math.max(M.el, 0.6) };
    },
    home: function () {
      M.target = { center: [0, 0], dist: 2.85, az: -0.16, el: 0.92 };
    },
    spin: function (d) { M.az += d; M.target = null; M.dirty = true; },
    // screen position of a state's top centre, for anchoring labels/popups
    project: function (slug) {
      var c = M.centroids[slug];
      if (!c || !M.ready) return null;
      var r = M.canvas.getBoundingClientRect();
      var mvp = camera(M.canvas.width / M.canvas.height);
      var h = (M.heights[slug] || BASE_H) + (M.idx[slug] === M.selected ? 0.055 : 0);
      var x = c[0], y = h, z = c[1];
      var cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
      var cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
      var cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
      if (cw <= 0) return null;
      return {
        x: r.left + (cx / cw * 0.5 + 0.5) * r.width,
        y: r.top + (0.5 - cy / cw * 0.5) * r.height,
      };
    },
    stats: function () { return { vertices: M.nVert, states: M.slugs.length }; },
  };
  window.Map3D = api;
})();
