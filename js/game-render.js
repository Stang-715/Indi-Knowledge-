/* ============================================================
   GameRender — canvas overlay above the SVG map.
   Draws procedural chibi sprites (big round head, small body,
   waddle legs), the recite ripple and the hearing radius.
   NPC positions are in map user-units; each frame the animated
   SVG viewBox is read to derive the unit->pixel transform, so
   zoom and state focus work automatically.
   ============================================================ */
(function () {
  "use strict";

  var canvas = null, ctx = null, wrap = null, svg = null;
  var dpr = 1;
  var ripple = null; // {x, y, r, t0} while reciting
  var sortClock = 0;

  function ensureCanvas() {
    if (canvas) return;
    wrap = document.getElementById("svgWrap");
    svg = document.getElementById("indiaMap");
    canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);
    ctx = canvas.getContext("2d");
    var ro = new ResizeObserver(resize);
    ro.observe(svg);
    resize();
  }

  function resize() {
    if (!canvas) return;
    var r = svg.getBoundingClientRect();
    var wr = wrap.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.width = r.width + "px";
    canvas.style.height = r.height + "px";
    canvas.style.left = (r.left - wr.left) + "px";
    canvas.style.top = (r.top - wr.top) + "px";
  }

  function transform() {
    var vb = window.IndiaMap.getViewBox();
    var sx = canvas.width / vb.w;
    var sy = canvas.height / vb.h;
    var s = Math.min(sx, sy);
    // the svg preserves aspect ratio (xMidYMid): center the shorter axis
    var ox = (canvas.width - vb.w * s) / 2 - vb.x * s;
    var oy = (canvas.height - vb.h * s) / 2 - vb.y * s;
    return { s: s, ox: ox, oy: oy };
  }

  function drawChibi(p, T, now) {
    var x = p.x * T.s + T.ox;
    var y = p.y * T.s + T.oy;
    // chibi height clamped in screen px so they stay tiny at national
    // view and don't become giants when a state is focused
    var h = Math.max(9, Math.min(18, 1.6 * T.s)) * dpr;
    var headR = h * 0.30;
    var bodyW = h * 0.34, bodyH = h * 0.42;
    var walk = p.mode === "walk" ? Math.sin(p.phase) : 0;
    var bob = p.mode === "listen" ? Math.sin(now * 5 + p.phase) * h * 0.06 : 0;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.globalAlpha = p.alpha;

    // legs (waddle)
    ctx.strokeStyle = "#3e2540";
    ctx.lineWidth = Math.max(1, h * 0.08);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.25, 0);
    ctx.lineTo(-bodyW * 0.25 + walk * h * 0.06, h * 0.14);
    ctx.moveTo(bodyW * 0.25, 0);
    ctx.lineTo(bodyW * 0.25 - walk * h * 0.06, h * 0.14);
    ctx.stroke();

    // body
    ctx.fillStyle = p.palette;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-bodyW / 2, -bodyH, bodyW, bodyH, bodyW * 0.35);
    else ctx.rect(-bodyW / 2, -bodyH, bodyW, bodyH);
    ctx.fill();

    // head
    var hy = -bodyH - headR * 0.75;
    ctx.fillStyle = "#f7e7d3";
    ctx.strokeStyle = "#3e2540";
    ctx.lineWidth = Math.max(0.6, h * 0.05);
    ctx.beginPath();
    ctx.arc(0, hy, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // eyes
    ctx.fillStyle = "#3e2540";
    ctx.beginPath();
    ctx.arc(-headR * 0.35, hy, headR * 0.14, 0, Math.PI * 2);
    ctx.arc(headR * 0.35, hy, headR * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // job props
    if (p.job === "herder") {
      // a little cow companion, bobbing at the herder's side
      var cb = Math.sin(now * 4 + p.phase) * h * 0.03;
      ctx.fillStyle = "#f7f7f5";
      ctx.strokeStyle = "#3e2540";
      ctx.lineWidth = Math.max(0.5, h * 0.04);
      ctx.beginPath();
      ctx.ellipse(bodyW * 1.3, h * 0.02 + cb, h * 0.16, h * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3e2540";
      ctx.beginPath();
      ctx.arc(bodyW * 1.3 + h * 0.12, h * 0.02 + cb - h * 0.05, h * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.mode === "work" && p.job === "farmer") {
      // hoe raised and falling, wheat-gold arc at the feet
      var swing = Math.abs(Math.sin(now * 3 + p.phase));
      ctx.strokeStyle = "#7a5230";
      ctx.lineWidth = Math.max(1, h * 0.07);
      ctx.beginPath();
      ctx.moveTo(bodyW * 0.5, -bodyH * 0.6);
      ctx.lineTo(bodyW * 0.5 + h * 0.28, -bodyH * 0.6 - swing * h * 0.3);
      ctx.stroke();
      ctx.strokeStyle = "#fdae1c";
      ctx.lineWidth = Math.max(1, h * 0.06);
      ctx.beginPath();
      ctx.arc(0, h * 0.16, h * 0.3, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
    if (p.mode === "work" && p.job === "artisan") {
      // a tiny loom with a shuttling thread
      var sh = Math.sin(now * 6 + p.phase);
      ctx.strokeStyle = "#7a4e8e";
      ctx.lineWidth = Math.max(0.8, h * 0.05);
      ctx.strokeRect(-bodyW * 1.4, -h * 0.05, h * 0.32, h * 0.2);
      ctx.beginPath();
      ctx.moveTo(-bodyW * 1.4, h * 0.05 + sh * h * 0.06);
      ctx.lineTo(-bodyW * 1.4 + h * 0.32, h * 0.05 - sh * h * 0.06);
      ctx.stroke();
    }

    // listening glyph
    if (p.mode === "listen") {
      ctx.fillStyle = "#f4491c";
      ctx.font = Math.round(h * 0.55) + "px serif";
      ctx.textAlign = "center";
      ctx.fillText("ॐ", headR * 1.2, hy - headR * 1.1);
    }
    ctx.restore();
  }

  function drawEffect(fx, T) {
    var x = fx.x * T.s + T.ox, y = fx.y * T.s + T.oy;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - fx.t / 1.2);
    if (fx.kind === "death") {
      ctx.strokeStyle = "#9a9a94";
      ctx.lineWidth = 1.2 * dpr;
      var r = (2 + fx.t * 8) * dpr;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.6, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#00a085";
      ctx.font = Math.round(10 * dpr) + "px serif";
      ctx.textAlign = "center";
      ctx.fillText("✦", x, y - fx.t * 14 * dpr);
    }
    ctx.restore();
  }

  window.GameRender = {
    show: function () {
      ensureCanvas();
      canvas.style.display = "block";
      resize();
    },
    hide: function () {
      if (canvas) canvas.style.display = "none";
    },
    setRipple: function (x, y, r) {
      ripple = x === null ? null : { x: x, y: y, r: r, t0: performance.now() / 1000 };
    },
    toMapCoords: function (clientX, clientY) {
      if (!canvas) return null;
      var rect = canvas.getBoundingClientRect();
      var T = transform();
      return {
        x: ((clientX - rect.left) * dpr - T.ox) / T.s,
        y: ((clientY - rect.top) * dpr - T.oy) / T.s
      };
    },
    frame: function (dt) {
      if (!canvas || canvas.style.display === "none") return;
      var now = performance.now() / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var T = transform();

      // hearing radius + ripple while reciting
      if (ripple) {
        var cx = ripple.x * T.s + T.ox, cy = ripple.y * T.s + T.oy;
        var rr = ripple.r * T.s;
        ctx.save();
        ctx.fillStyle = "rgba(244,73,28,0.06)";
        ctx.strokeStyle = "rgba(244,73,28,0.45)";
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        var age = (now - ripple.t0) % 1.4;
        ctx.globalAlpha = 1 - age / 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, rr * (age / 1.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // afflicted states: pulsing disc + glyph at the centroid
      if (window.GameEvents) {
        window.GameEvents.active().forEach(function (e) {
          var c = window.IndiaMap.getStateCentroid(e.slug);
          var b = window.IndiaMap.getStateBBox(e.slug);
          if (!c || !b) return;
          var T2 = window.GameEvents.TYPES[e.type];
          var r = Math.sqrt(Math.pow(b[2] - b[0], 2) + Math.pow(b[3] - b[1], 2)) / 2 * T.s;
          var ex = c[0] * T.s + T.ox, ey = c[1] * T.s + T.oy;
          ctx.save();
          ctx.globalAlpha = 0.1 + 0.06 * Math.sin(now * 3);
          ctx.fillStyle = T2.color;
          ctx.beginPath();
          ctx.arc(ex, ey, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.85;
          ctx.font = Math.round(16 * dpr) + "px serif";
          ctx.textAlign = "center";
          ctx.fillText(T2.icon, ex, ey - r * 0.2);
          ctx.restore();
        });
      }

      var npcs = window.GamePopulation.npcs();
      sortClock += dt;
      if (sortClock > 1) {
        sortClock = 0;
        npcs.sort(function (a, b) { return a.y - b.y; });
      }
      for (var i = 0; i < npcs.length; i++) drawChibi(npcs[i], T, now);
      var fx = window.GamePopulation.effects();
      for (var e = 0; e < fx.length; e++) drawEffect(fx[e], T);
    }
  };
})();
