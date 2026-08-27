/* ============================================================
   Game — orchestrator for game mode.
   Loop: rAF render + fixed-step sim (10 Hz movement, 1 Hz
   vitals/literacy/releases). 1 game-day = 60 real seconds.
   Literacy: taught vs released card weight; every untaught
   release drags the target down until it is recited.
   ============================================================ */
(function () {
  "use strict";

  var DAY_SECONDS = 60;
  var SAVE_KEY = "ikm-game-v1";

  var on = false;
  var raf = null;
  var lastT = 0, simAcc = 0, slowAcc = 0, saveAcc = 0;
  var memorySave = null; // fallback when localStorage is unavailable

  var st = {
    day: 0,
    literacy: 22,
    taught: {},      // cardId -> true
    studied: {},     // cardId -> true
    stateTaught: {}, // slug -> {cardId: true}
    prosperity: {},  // slug -> 0..100 (default 20)
    pop: 240
  };
  var prevLiteracy = 22;

  var recite = null; // {card, x, y, r, t}
  var mouse = { x: 0, y: 0, over: false };

  /* ---------- literacy model ---------- */

  function weights(cards, taughtSet) {
    var tw = 0, rw = 0;
    cards.forEach(function (c) {
      rw += c.weight;
      if (taughtSet[c.id]) tw += c.weight;
    });
    return { tw: tw, rw: rw };
  }

  function nationalTarget() {
    var w = weights(window.GameCards.released(st.day), st.taught);
    return Math.max(8, Math.min(98, 22 + 76 * w.tw / Math.max(w.rw, 1)));
  }

  function stateLiteracy(slug) {
    var released = window.GameCards.released(st.day);
    var mine = st.stateTaught[slug] || {};
    var tw = 0, rw = 0;
    released.forEach(function (c) {
      // Gita is national scripture: pressure on every state. Folklore
      // pressures its home state and any state it was recited over.
      if (c.kind === "gita" || c.stateSlug === slug || mine[c.id]) {
        rw += c.weight;
        if (mine[c.id]) tw += c.weight + (c.stateSlug === slug ? 0.5 : 0);
      }
    });
    var comp = 22 + 76 * tw / Math.max(rw, 1);
    return Math.max(5, Math.min(99, 0.65 * st.literacy + 0.35 * comp));
  }

  /* ---------- economy (Phase 2) ---------- */

  function prosperityOf(slug) {
    return st.prosperity[slug] == null ? 20 : st.prosperity[slug];
  }

  function jobsTaughtByState() {
    var deck = window.GameCards.all();
    var out = {};
    Object.keys(st.stateTaught).forEach(function (slug) {
      var jobs = [];
      deck.forEach(function (c) {
        if (c.kind === "skill" && c.job && st.stateTaught[slug][c.id] && jobs.indexOf(c.job) < 0) jobs.push(c.job);
      });
      if (jobs.length) out[slug] = jobs;
    });
    return out;
  }

  function arithBonus(slug) {
    var n = 0;
    var mine = st.stateTaught[slug] || {};
    window.GameCards.all().forEach(function (c) {
      if (c.kind === "skill" && !c.job && mine[c.id]) n++;
    });
    return 1 + 0.15 * n;
  }

  function economyTick(dtDays) {
    var stats = window.GamePopulation.workerStats();
    window.IndiaMap.listStates().forEach(function (s) {
      var slug = s.slug;
      var w = stats[slug];
      var workerFrac = w && w.pop ? w.workers / w.pop : 0;
      var P = prosperityOf(slug);
      P += dtDays * (10 * workerFrac * arithBonus(slug) - 3);
      st.prosperity[slug] = Math.max(0, Math.min(100, P));
    });
  }

  /* ---------- persistence ---------- */

  function save() {
    var data = JSON.stringify({
      v: 2, day: st.day, taught: st.taught, studied: st.studied,
      stateTaught: st.stateTaught, pop: window.GamePopulation.count(),
      literacy: st.literacy, prosperity: st.prosperity,
      events: window.GameEvents.serialize()
    });
    try { localStorage.setItem(SAVE_KEY, data); }
    catch (e) { memorySave = data; }
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = memorySave; }
    if (!raw) return;
    try {
      var d = JSON.parse(raw);
      if (d && (d.v === 1 || d.v === 2)) {
        st.day = d.day || 0;
        st.taught = d.taught || {};
        st.studied = d.studied || {};
        st.stateTaught = d.stateTaught || {};
        st.prosperity = d.prosperity || {};
        st.pop = Math.max(30, Math.min(500, d.pop || 240));
        st.literacy = d.literacy || 22;
        st.events = d.events || null;
        prevLiteracy = st.literacy;
      }
    } catch (e) { /* corrupt save: start fresh */ }
  }

  /* ---------- recite (hold SPACE) ---------- */

  function reciteAnchor() {
    var focused = window.IndiaMap.getFocused();
    if (focused) {
      var b = window.IndiaMap.getStateBBox(focused);
      var c = window.IndiaMap.getStateCentroid(focused);
      var r = Math.sqrt(Math.pow(b[2] - b[0], 2) + Math.pow(b[3] - b[1], 2)) / 2;
      return { x: c[0], y: c[1], r: r };
    }
    var m = window.GameRender.toMapCoords(mouse.x, mouse.y);
    return m ? { x: m.x, y: m.y, r: 130 } : null;
  }

  function statesInRadius(a) {
    var hit = {};
    window.IndiaMap.listStates().forEach(function (s) {
      var c = window.IndiaMap.getStateCentroid(s.slug);
      if (c && Math.pow(c[0] - a.x, 2) + Math.pow(c[1] - a.y, 2) <= a.r * a.r) hit[s.slug] = true;
    });
    var focused = window.IndiaMap.getFocused();
    if (focused) hit[focused] = true;
    return Object.keys(hit);
  }

  function startRecite() {
    if (recite) return;
    var card = window.GameUI.armedCard();
    if (!card) return; // taught cards may be re-recited (event combat, refresh)
    if (window.GameUI.isStudyOpen()) window.GameUI.closeStudy();
    var a = reciteAnchor();
    if (!a) return;
    recite = { card: card, x: a.x, y: a.y, r: a.r, t: 0 };
    window.GamePopulation.setListenAnchor(a.x, a.y, a.r);
    window.GameRender.setRipple(a.x, a.y, a.r);
  }

  function endRecite(completed) {
    if (!recite) return;
    if (completed) {
      var card = recite.card;
      var slugs = statesInRadius(recite);
      st.taught[card.id] = true;
      slugs.forEach(function (slug) {
        st.stateTaught[slug] = st.stateTaught[slug] || {};
        st.stateTaught[slug][card.id] = true;
      });
      // the home state of a folk tale always gets credit for its own tale
      if (card.stateSlug) {
        st.stateTaught[card.stateSlug] = st.stateTaught[card.stateSlug] || {};
        st.stateTaught[card.stateSlug][card.id] = true;
      }
      // knowledge as a weapon: a matching recite over an afflicted state resolves it
      window.GameEvents.onRecite(card, slugs).forEach(function (e) {
        st.prosperity[e.slug] = Math.min(100, prosperityOf(e.slug) + 10);
      });
      window.GameUI.disarm();
      window.GameUI.refreshDock();
      save();
    }
    recite = null;
    window.GamePopulation.setListenAnchor(null);
    window.GameRender.setRipple(null);
    window.GameUI.reciteProgress(null);
  }

  function stepRecite(dt) {
    if (!recite) return;
    if (window.GamePopulation.listenersCount() === 0) {
      window.GameUI.reciteProgress(0, "no one can hear you — recite near the people");
      recite.t = 0;
      return;
    }
    recite.t += dt;
    var need = recite.card.reciteSeconds;
    if (recite.t >= need) endRecite(true);
    else window.GameUI.reciteProgress(recite.t / need);
  }

  /* ---------- loop ---------- */

  function is3dModel() {
    var stage = document.getElementById("mapStage");
    return stage && stage.classList.contains("mode3d");
  }

  function frame(t) {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.1, (t - lastT) / 1000 || 0);
    lastT = t;
    if (document.hidden || is3dModel()) {
      window.GameRender.hide();
      return;
    }
    window.GameRender.show();

    // 10 Hz movement
    simAcc += dt;
    while (simAcc >= 0.1) {
      simAcc -= 0.1;
      window.GamePopulation.step(0.1);
      stepRecite(0.1);
    }

    // 1 Hz: clock, vitals, literacy easing, HUD
    slowAcc += dt;
    if (slowAcc >= 1) {
      var slow = slowAcc;
      slowAcc = 0;
      var dtDays = slow / DAY_SECONDS;
      var prevDay = Math.floor(st.day);
      st.day += dtDays;
      var target = nationalTarget();
      var maxStep = 3 * dtDays;
      prevLiteracy = st.literacy;
      st.literacy += Math.max(-maxStep, Math.min(maxStep, target - st.literacy));
      window.GamePopulation.assignJobs(jobsTaughtByState());
      economyTick(dtDays);
      window.GameEvents.step(st.day, {
        cull: function (slug, frac) { window.GamePopulation.cull(slug, frac); },
        prosperityHit: function (slug, amt) { st.prosperity[slug] = Math.max(0, prosperityOf(slug) - amt); },
        literacyHit: function (amt) { st.literacy = Math.max(8, st.literacy - amt); },
        pickStates: function (n, exclude) {
          var candidates = window.IndiaMap.listStates()
            .map(function (s) { return s.slug; })
            .filter(function (slug) { return exclude.indexOf(slug) < 0; })
            .sort(function (a, b) { return stateLiteracy(a) - stateLiteracy(b); })
            .slice(0, 10); // events prey on the least literate states
          var out = [];
          while (out.length < n && candidates.length) {
            out.push(candidates.splice((Math.random() * candidates.length) | 0, 1)[0]);
          }
          return out;
        },
        stateName: function (slug) {
          var s = window.INDIA_MAP.states[slug];
          return s ? s.name : slug;
        }
      });
      window.GamePopulation.vitals(dtDays, stateLiteracy, st.literacy, prosperityOf);
      if (Math.floor(st.day) !== prevDay) window.GameUI.refreshDock();
      window.GameUI.updateHud(st, st.literacy - prevLiteracy);
      window.GameUI.updateEvents(st, st.day);
      saveAcc += slow;
      if (saveAcc >= 10) { saveAcc = 0; save(); }
    }

    window.GameRender.frame(dt);
  }

  /* ---------- toggle & input ---------- */

  function start() {
    on = true;
    document.body.classList.add("game-on");
    load();
    window.GameCards.init();
    window.GameEvents.init(st.events);
    window.GamePopulation.init(st.pop);
    window.GameUI.show();
    window.GameUI.updateHud(st, 0);
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    on = false;
    if (raf) cancelAnimationFrame(raf);
    endRecite(false);
    save();
    document.body.classList.remove("game-on");
    window.GameRender.hide();
    window.GameUI.hide();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.GameCards || !window.IndiaMap) return;
    window.GameUI.init({
      getState: function () { return st; },
      onStudied: function (id) { st.studied[id] = true; save(); }
    });

    var btn = document.getElementById("btnGame");
    btn.addEventListener("click", function () {
      if (on) { stop(); btn.classList.remove("active"); }
      else { start(); btn.classList.add("active"); }
    });

    document.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      var stage = document.getElementById("mapStage");
      var r = stage.getBoundingClientRect();
      mouse.over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });

    document.addEventListener("keydown", function (e) {
      if (!on || e.code !== "Space" || e.repeat) return;
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (!mouse.over && !window.IndiaMap.getFocused()) return;
      e.preventDefault();
      startRecite();
    });
    document.addEventListener("keyup", function (e) {
      if (e.code === "Space" && recite) {
        e.preventDefault();
        endRecite(false); // released early: the recitation is lost
      }
    });
    // keep Space from scrolling the page while the game is on
    document.addEventListener("keydown", function (e) {
      if (on && e.code === "Space") {
        var tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") e.preventDefault();
      }
    });
    window.addEventListener("beforeunload", function () { if (on) save(); });
  });
})();
