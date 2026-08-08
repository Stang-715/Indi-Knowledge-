/* ============================================================
   IndiaMap — renders window.INDIA_MAP (states → district polygons)
   as interactive SVG. No external libraries.
   ============================================================ */
(function () {
  "use strict";

  var W = 1000; // viewBox width in user units
  var PAD = 14;

  var M = {
    svg: null,
    tooltip: null,
    hooks: {},
    proj: null,
    H: 0,
    stateBBox: {},   // slug -> [x0,y0,x1,y1]
    stateEls: {},    // slug -> <g>
    distInfo: {},    // slug -> [{n, c:[x,y], w}]
    dLabelsG: null,  // district labels layer (rebuilt per focus)
    focused: null,
    activeDistrict: null,
    anim: null,
  };

  function makeProjection(bbox) {
    var minLon = bbox[0], minLat = bbox[1], maxLon = bbox[2], maxLat = bbox[3];
    var midLat = (minLat + maxLat) / 2 * Math.PI / 180;
    var kx = Math.cos(midLat);
    var spanX = (maxLon - minLon) * kx;
    var spanY = (maxLat - minLat);
    var s = (W - PAD * 2) / spanX;
    M.H = spanY * s + PAD * 2;
    return function (lon, lat) {
      return [
        PAD + (lon - minLon) * kx * s,
        PAD + (maxLat - lat) * s,
      ];
    };
  }

  function flatToPath(flat) {
    var d = "";
    for (var i = 0; i < flat.length; i += 2) {
      var p = M.proj(flat[i], flat[i + 1]);
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2);
    }
    return d + "Z";
  }

  function polyCentroidAndBBox(polysFlat) {
    // centroid of the largest ring + bbox over all rings (projected coords)
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    var best = null, bestN = -1;
    polysFlat.forEach(function (flat) {
      if (flat.length > bestN) { bestN = flat.length; best = flat; }
      for (var i = 0; i < flat.length; i += 2) {
        var p = M.proj(flat[i], flat[i + 1]);
        if (p[0] < x0) x0 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[0] > x1) x1 = p[0];
        if (p[1] > y1) y1 = p[1];
      }
    });
    var cx = 0, cy = 0, n = 0;
    for (var i = 0; i < best.length; i += 2) {
      var p = M.proj(best[i], best[i + 1]);
      cx += p[0]; cy += p[1]; n++;
    }
    return { c: [cx / n, cy / n], b: [x0, y0, x1, y1] };
  }

  function el(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------------- tooltip ---------------- */
  function showTip(evt, html) {
    var t = M.tooltip;
    t.innerHTML = html;
    t.classList.add("show");
    moveTip(evt);
  }
  function moveTip(evt) {
    var t = M.tooltip;
    var x = evt.clientX + 14, y = evt.clientY + 14;
    var r = t.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - 10;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - 10;
    t.style.left = x + "px";
    t.style.top = y + "px";
  }
  function hideTip() { M.tooltip.classList.remove("show"); }

  /* ---------------- viewBox animation ---------------- */
  function animateViewBox(target, ms) {
    if (M.anim) cancelAnimationFrame(M.anim);
    var svg = M.svg;
    var from = svg.getAttribute("viewBox").split(" ").map(Number);
    var t0 = null;
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function step(ts) {
      if (!t0) t0 = ts;
      var t = Math.min(1, (ts - t0) / ms);
      var e = ease(t);
      var vb = from.map(function (v, i) { return v + (target[i] - v) * e; });
      svg.setAttribute("viewBox", vb.join(" "));
      if (t < 1) M.anim = requestAnimationFrame(step);
    }
    M.anim = requestAnimationFrame(step);
  }

  function nationalViewBox() { return [0, 0, W, M.H]; }

  function stateViewBox(slug) {
    var b = M.stateBBox[slug];
    var w = b[2] - b[0], h = b[3] - b[1];
    var padX = w * 0.18 + 4, padY = h * 0.18 + 4;
    return [b[0] - padX, b[1] - padY, w + padX * 2, h + padY * 2];
  }

  /* ---------------- rendering ---------------- */
  function build() {
    var data = window.INDIA_MAP;
    M.proj = makeProjection(data.bbox);
    var svg = M.svg;
    svg.setAttribute("viewBox", "0 0 " + W + " " + M.H);

    var root = el("g", { "class": "map-shadow" });
    svg.appendChild(root);

    var statesG = el("g", {});
    root.appendChild(statesG);
    var outlinesG = el("g", {});
    root.appendChild(outlinesG);
    var labelsG = el("g", { "class": "state-labels", "pointer-events": "none" });
    root.appendChild(labelsG);
    M.dLabelsG = el("g", { "class": "district-labels", "pointer-events": "none" });
    root.appendChild(M.dLabelsG);

    Object.keys(data.states).forEach(function (slug) {
      var st = data.states[slug];
      var g = el("g", { "class": "state", "data-state": slug });
      var allPolys = [];
      M.distInfo[slug] = [];

      st.districts.forEach(function (d) {
        d.p.forEach(function (flat) { allPolys.push(flat); });
        var dPath = "";
        d.p.forEach(function (flat) { dPath += flatToPath(flat); });
        var path = el("path", { d: dPath, "data-district": d.n });
        g.appendChild(path);
        var di = polyCentroidAndBBox(d.p);
        M.distInfo[slug].push({ n: d.n, c: di.c, w: di.b[2] - di.b[0] });
      });

      var info = polyCentroidAndBBox(allPolys);
      M.stateBBox[slug] = info.b;

      // label (national view only; halo via paint-order)
      var w = info.b[2] - info.b[0];
      var label = el("text", {
        x: info.c[0], y: info.c[1],
        "text-anchor": "middle",
        "font-size": Math.max(7, Math.min(13, w * 0.09)),
        "font-family": "Georgia, serif",
        fill: "#3b2740",
        stroke: "rgba(246,244,238,0.9)",
        "stroke-width": 2.5,
        "paint-order": "stroke",
        "data-label": slug,
      });
      label.textContent = st.name;
      if (w > 55) labelsG.appendChild(label);

      if (st.outline) {
        var oPath = "";
        st.outline.forEach(function (flat) { oPath += flatToPath(flat); });
        outlinesG.appendChild(el("path", { d: oPath, "class": "state-outline" }));
      }

      M.stateEls[slug] = g;
      statesG.appendChild(g);

      /* events */
      g.addEventListener("mousemove", function (evt) {
        var target = evt.target;
        if (M.focused === slug) {
          var dn = target.getAttribute && target.getAttribute("data-district");
          if (dn) {
            var tip = M.hooks.getDistrictTooltip ? M.hooks.getDistrictTooltip(slug, dn) : null;
            showTip(evt, tip || "<div class='t-name'>" + dn + "</div>");
          }
        } else if (!M.focused) {
          var tipS = M.hooks.getTooltip ? M.hooks.getTooltip(slug) : null;
          showTip(evt, tipS || "<div class='t-name'>" + st.name + "</div>");
        }
      });
      g.addEventListener("mouseenter", function () {
        if (!M.focused) g.classList.add("hovered");
      });
      g.addEventListener("mouseleave", function () {
        g.classList.remove("hovered");
        hideTip();
      });
      g.addEventListener("click", function (evt) {
        var dn = evt.target.getAttribute && evt.target.getAttribute("data-district");
        if (M.focused === slug && dn) {
          setActiveDistrict(dn);
          if (M.hooks.onDistrictSelect) M.hooks.onDistrictSelect(slug, dn);
        } else {
          focusState(slug);
        }
        evt.stopPropagation();
      });
    });

    // click on empty space resets
    svg.addEventListener("click", function () {
      if (M.focused) reset();
    });

    recolor();
  }

  function recolor() {
    Object.keys(M.stateEls).forEach(function (slug) {
      var fill = (M.hooks.getFill && M.hooks.getFill(slug)) || "#e7e2d6";
      M.stateEls[slug].querySelectorAll("path").forEach(function (p) {
        p.setAttribute("fill", fill);
      });
    });
  }

  function setActiveDistrict(name) {
    M.activeDistrict = name;
    if (!M.focused) return;
    M.stateEls[M.focused].querySelectorAll("path").forEach(function (p) {
      p.classList.toggle("district-active", p.getAttribute("data-district") === name);
    });
  }

  function clearDistrictLabels() {
    while (M.dLabelsG.firstChild) M.dLabelsG.removeChild(M.dLabelsG.firstChild);
  }

  function buildDistrictLabels(slug) {
    clearDistrictLabels();
    var b = M.stateBBox[slug];
    var stateW = b[2] - b[0], stateH = b[3] - b[1];
    var fs = Math.max(1.6, Math.min(stateW, stateH) / 26);
    M.distInfo[slug].forEach(function (d) {
      // skip labels that clearly overflow their district
      if (d.w < d.n.length * fs * 0.5) return;
      var t = el("text", {
        x: d.c[0], y: d.c[1],
        "text-anchor": "middle",
        "font-size": fs,
        "font-family": "'Segoe UI', system-ui, sans-serif",
        "font-weight": 600,
        fill: "#3b2740",
        stroke: "rgba(246,244,238,0.92)",
        "stroke-width": fs * 0.18,
        "paint-order": "stroke",
      });
      t.textContent = d.n;
      M.dLabelsG.appendChild(t);
    });
  }

  function focusState(slug) {
    M.focused = slug;
    M.activeDistrict = null;
    Object.keys(M.stateEls).forEach(function (s) {
      var g = M.stateEls[s];
      g.classList.toggle("focus", s === slug);
      g.classList.toggle("dim", s !== slug);
      g.classList.remove("hovered");
      g.querySelectorAll("path").forEach(function (p) { p.classList.remove("district-active"); });
    });
    var lbls = M.svg.querySelectorAll(".state-labels text");
    lbls.forEach(function (t) { t.style.display = "none"; });
    buildDistrictLabels(slug);
    animateViewBox(stateViewBox(slug), 650);
    if (M.hooks.onStateSelect) M.hooks.onStateSelect(slug);
  }

  function reset() {
    M.focused = null;
    M.activeDistrict = null;
    Object.keys(M.stateEls).forEach(function (s) {
      var g = M.stateEls[s];
      g.classList.remove("focus", "dim");
      g.querySelectorAll("path").forEach(function (p) { p.classList.remove("district-active"); });
    });
    M.svg.querySelectorAll(".state-labels text").forEach(function (t) { t.style.display = ""; });
    clearDistrictLabels();
    animateViewBox(nationalViewBox(), 650);
    if (M.hooks.onStateSelect) M.hooks.onStateSelect(null);
  }

  window.IndiaMap = {
    init: function (opts) {
      M.svg = opts.svg;
      M.tooltip = opts.tooltip;
      M.hooks = opts;
      build();
    },
    recolor: recolor,
    focusState: focusState,
    setActiveDistrict: setActiveDistrict,
    reset: reset,
    getFocused: function () { return M.focused; },
    listStates: function () {
      return Object.keys(window.INDIA_MAP.states).map(function (slug) {
        return { slug: slug, name: window.INDIA_MAP.states[slug].name };
      });
    },
    listDistricts: function (slug) {
      var st = window.INDIA_MAP.states[slug];
      return st ? st.districts.map(function (d) { return d.n; }) : [];
    },
  };
})();
