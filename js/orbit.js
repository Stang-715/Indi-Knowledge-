/* ============================================================
   Orbit — X/Y/Z rotation for the map, pointer-driven.
   Modes: 0 flat · 1 tilt (fixed) · 2 orbit (drag to rotate).
   CSS 3D transforms keep the SVG fully clickable while rotated.
   ============================================================ */
(function () {
  "use strict";

  var mode = 0;
  var rx = 32, ry = -12, rz = 0;          // orbit angles (deg)
  var DEFAULTS = { rx: 32, ry: -12, rz: 0 };
  var stage = null, tiltEl = null, raf = null;
  var dragging = false, moved = false, lastX = 0, lastY = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function apply() {
    raf = null;
    if (mode === 2) {
      tiltEl.style.transform =
        "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg) scale(0.98)";
    } else {
      tiltEl.style.transform = ""; // css classes (.tilted) take over
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(apply); }

  function onDown(e) {
    if (mode !== 2) return;
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.classList.add("grabbing");
  }
  function onMove(e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    lastX = e.clientX;
    lastY = e.clientY;
    ry = clamp(ry + dx * 0.25, -50, 50);
    rx = clamp(rx - dy * 0.25, -10, 60);
    schedule();
    e.preventDefault();
  }
  function onUp() {
    dragging = false;
    stage.classList.remove("grabbing");
  }
  // a drag must not register as a state/district click
  function onClickCapture(e) {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  }
  function onWheel(e) {
    if (mode !== 2) return;
    rz = clamp(rz + e.deltaY * 0.06, -180, 180);
    schedule();
    e.preventDefault();
  }
  function spin(delta) {
    if (mode !== 2) return;
    rz = clamp(rz + delta, -180, 180);
    schedule();
  }
  function resetAngles() {
    rx = DEFAULTS.rx; ry = DEFAULTS.ry; rz = DEFAULTS.rz;
    schedule();
  }

  window.Orbit = {
    init: function (opts) {
      stage = opts.stage;
      tiltEl = opts.tiltEl;
      stage.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      stage.addEventListener("click", onClickCapture, true);
      stage.addEventListener("wheel", onWheel, { passive: false });
      stage.addEventListener("dblclick", function (e) {
        if (mode === 2) { resetAngles(); e.preventDefault(); }
      });
      document.addEventListener("keydown", function (e) {
        if (mode !== 2) return;
        if (e.key === "q" || e.key === "Q") spin(-8);
        if (e.key === "e" || e.key === "E") spin(8);
        if (e.key === "r" || e.key === "R") resetAngles();
      });
    },
    setMode: function (m) {
      mode = m;
      stage.classList.toggle("tilted", m === 1);
      stage.classList.toggle("orbit3d", m === 2);
      if (m === 2) resetAngles(); else apply();
    },
    getMode: function () { return mode; },
    spin: spin,
  };
})();
