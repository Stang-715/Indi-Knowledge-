/* ============================================================
   GamePopulation — the chibi NPC simulation.
   NPCs live in map user-units and wander a waypoint graph built
   from district centroids (via IndiaMap). Vitals run at 1 Hz:
   low literacy raises deaths, high literacy brings births.
   ============================================================ */
(function () {
  "use strict";

  var nodes = [];        // {x, y, state, edges: [nodeIdx]}
  var stateNodes = {};   // slug -> [nodeIdx]
  var npcs = [];
  var effects = [];      // {x, y, t, kind: "death"|"birth"}
  var listen = null;     // {x, y, r}
  var teachDone = [];    // state slugs where a scholar finished a mini-lesson
  var PALETTE = ["#f4491c", "#00a085", "#fdae1c", "#7a4e8e", "#f79fb4"];

  function hash(a, b) {
    var h = (a * 73856093) ^ (b * 19349663);
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }

  function dist2(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function connect(i, j) {
    if (i === j) return;
    if (nodes[i].edges.indexOf(j) < 0) nodes[i].edges.push(j);
    if (nodes[j].edges.indexOf(i) < 0) nodes[j].edges.push(i);
  }

  function nearest(idx, pool, k) {
    return pool
      .filter(function (j) { return j !== idx; })
      .sort(function (a, b) { return dist2(nodes[idx], nodes[a]) - dist2(nodes[idx], nodes[b]); })
      .slice(0, k);
  }

  function buildGraph() {
    nodes = [];
    stateNodes = {};
    var centers = {}; // slug -> center node idx
    window.IndiaMap.listStates().forEach(function (st) {
      var slug = st.slug;
      stateNodes[slug] = [];
      var c = window.IndiaMap.getStateCentroid(slug);
      if (!c) return;
      centers[slug] = nodes.length;
      nodes.push({ x: c[0], y: c[1], state: slug, edges: [] });
      stateNodes[slug].push(centers[slug]);
      window.IndiaMap.getDistrictCentroids(slug).forEach(function (dc) {
        var idx = nodes.length;
        nodes.push({ x: dc[0], y: dc[1], state: slug, edges: [] });
        stateNodes[slug].push(idx);
      });
      // districts: link to 2 nearest siblings + the state center
      stateNodes[slug].slice(1).forEach(function (idx) {
        connect(idx, centers[slug]);
        nearest(idx, stateNodes[slug].slice(1), 2).forEach(function (j) { connect(idx, j); });
      });
    });
    // state centers: link to 3 nearest neighboring centers
    var centerIdxs = Object.keys(centers).map(function (s) { return centers[s]; });
    centerIdxs.forEach(function (idx) {
      nearest(idx, centerIdxs, 3).forEach(function (j) { connect(idx, j); });
    });
  }

  // quadratic curve point for edge a->b, bowed perpendicular by a seeded offset
  function edgePoint(ai, bi, t) {
    var a = nodes[ai], b = nodes[bi];
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var bow = (hash(Math.min(ai, bi), Math.max(ai, bi)) - 0.5) * 0.22 * len;
    var cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
    var u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
      y: u * u * a.y + 2 * u * t * cy + t * t * b.y
    };
  }

  function makeNpc(nodeIdx) {
    var n = nodes[nodeIdx];
    return {
      at: nodeIdx, to: nodeIdx, t: 1,
      x: n.x, y: n.y, state: n.state,
      speed: 2 + Math.random() * 2,
      idle: Math.random() * 3,
      palette: PALETTE[(Math.random() * PALETTE.length) | 0],
      phase: Math.random() * Math.PI * 2,
      mode: "idle",
      alpha: 1
    };
  }

  function spawnInState(slug) {
    var pool = stateNodes[slug];
    if (!pool || !pool.length) return null;
    return makeNpc(pool[(Math.random() * pool.length) | 0]);
  }

  function pickNextEdge(npc) {
    var here = nodes[npc.at];
    if (!here.edges.length) return;
    var options = here.edges;
    // workers keep close to home (95%); others wander more (85%)
    var homeBias = npc.scholar ? 0.5 : npc.job ? 0.95 : 0.85;
    if (Math.random() < homeBias) {
      var same = options.filter(function (j) { return nodes[j].state === npc.state; });
      if (same.length) options = same;
    }
    npc.to = options[(Math.random() * options.length) | 0];
    npc.t = 0;
    npc.mode = "walk";
  }

  window.GamePopulation = {
    init: function (targetPop) {
      buildGraph();
      npcs = [];
      var slugs = Object.keys(stateNodes).filter(function (s) { return stateNodes[s].length; });
      // allocate proportional to district count, min 2 per state/UT
      var total = 0;
      slugs.forEach(function (s) { total += stateNodes[s].length; });
      slugs.forEach(function (s) {
        var n = Math.max(2, Math.round(targetPop * stateNodes[s].length / total));
        for (var i = 0; i < n; i++) {
          var npc = spawnInState(s);
          if (npc) npcs.push(npc);
        }
      });
    },
    npcs: function () { return npcs; },
    effects: function () { return effects; },
    count: function () { return npcs.length; },

    step: function (dt) {
      for (var i = 0; i < npcs.length; i++) {
        var p = npcs[i];
        p.phase += dt * 6;
        if (listen) {
          var dx = p.x - listen.x, dy = p.y - listen.y;
          if (dx * dx + dy * dy < listen.r * listen.r) {
            p.mode = "listen";
            continue;
          } else if (p.mode === "listen") {
            p.mode = "idle";
            p.idle = 0.5;
          }
        } else if (p.mode === "listen") {
          p.mode = "idle";
          p.idle = 0.5 + Math.random();
        }
        if (p.mode === "idle") {
          p.idle -= dt;
          if (p.idle <= 0) {
            if (p.scholar && Math.random() < 0.3) {
              p.mode = "teach";
              p.work = 5;
            } else if (p.job && Math.random() < 0.5) {
              p.mode = "work";
              p.work = 4 + Math.random() * 4;
            } else {
              pickNextEdge(p);
            }
          }
        } else if (p.mode === "work" || p.mode === "teach") {
          p.work -= dt;
          if (p.work <= 0) {
            if (p.mode === "teach") teachDone.push(p.state);
            p.mode = "idle";
            p.idle = 0.5 + Math.random();
          }
        } else if (p.mode === "walk") {
          var a = nodes[p.at], b = nodes[p.to];
          var len = Math.sqrt(dist2(a, b)) || 1;
          p.t += (p.speed * dt) / len;
          if (p.t >= 1) {
            p.t = 1;
            p.at = p.to;
            p.state = nodes[p.at].state;
            p.mode = "idle";
            p.idle = 1 + Math.random() * 3;
          }
          var pt = edgePoint(p.at, p.to, p.t);
          p.x = pt.x;
          p.y = pt.y;
        }
      }
      for (var e = effects.length - 1; e >= 0; e--) {
        effects[e].t += dt;
        if (effects[e].t > 1.2) effects.splice(e, 1);
      }
    },

    // job assignment: jobsByState[slug] = ["farmer", ...] taught there.
    // Up to 20% of a state's population works each taught job.
    assignJobs: function (jobsByState) {
      var byState = {};
      npcs.forEach(function (p) {
        (byState[p.state] = byState[p.state] || []).push(p);
      });
      Object.keys(byState).forEach(function (slug) {
        var pool = byState[slug];
        var jobs = jobsByState[slug] || [];
        var per = Math.floor(pool.length * 0.2);
        var counts = {};
        pool.forEach(function (p) {
          if (p.job) {
            if (jobs.indexOf(p.job) < 0) p.job = null; // skill no longer taught here
            else counts[p.job] = (counts[p.job] || 0) + 1;
          }
        });
        jobs.forEach(function (job) {
          var need = per - (counts[job] || 0);
          for (var i = 0; i < pool.length && need > 0; i++) {
            if (!pool[i].job) { pool[i].job = job; need--; }
          }
        });
      });
    },
    workerStats: function () {
      var out = {};
      npcs.forEach(function (p) {
        var s = out[p.state] = out[p.state] || { workers: 0, pop: 0 };
        s.pop++;
        if (p.job) s.workers++;
      });
      return out;
    },

    // vitals tick: dtDays = fraction of a game-day elapsed
    vitals: function (dtDays, literacyOfState, nationalL, prosperityOf) {
      var died = 0, born = 0;
      for (var i = npcs.length - 1; i >= 0; i--) {
        var L = literacyOfState(npcs[i].state);
        var dPerDay = 0.015 + 0.10 * Math.pow(1 - L / 100, 2);
        if (prosperityOf) {
          var P = prosperityOf(npcs[i].state);
          dPerDay *= 1.3 - 0.6 * P / 100; // a fed state dies less
        }
        if (npcs.length > 30 && Math.random() < dPerDay * dtDays) {
          effects.push({ x: npcs[i].x, y: npcs[i].y, t: 0, kind: "death" });
          npcs.splice(i, 1);
          died++;
        }
      }
      if (nationalL > 55 && npcs.length < 500) {
        var rate = ((nationalL - 55) / 45) * 0.06 * npcs.length;
        var expect = rate * dtDays;
        var n = Math.floor(expect) + (Math.random() < expect % 1 ? 1 : 0);
        for (var k = 0; k < n && npcs.length < 500; k++) {
          var slugs = Object.keys(stateNodes).filter(function (s) { return stateNodes[s].length; });
          var npc = spawnInState(slugs[(Math.random() * slugs.length) | 0]);
          if (npc) {
            npcs.push(npc);
            effects.push({ x: npc.x, y: npc.y, t: 0, kind: "birth" });
            born++;
          }
        }
      }
      return { died: died, born: born };
    },

    setListenAnchor: function (x, y, r) { listen = x === null ? null : { x: x, y: y, r: r }; },
    getListenAnchor: function () { return listen; },
    listenersCount: function () {
      if (!listen) return 0;
      var n = 0;
      for (var i = 0; i < npcs.length; i++) {
        var dx = npcs[i].x - listen.x, dy = npcs[i].y - listen.y;
        if (dx * dx + dy * dy < listen.r * listen.r) n++;
      }
      return n;
    },
    // scholars: promoted from the listeners of a completed recite
    promoteScholars: function (chance, cap) {
      if (!listen) return 0;
      var made = 0;
      var have = 0;
      npcs.forEach(function (p) { if (p.scholar) have++; });
      for (var i = 0; i < npcs.length && have + made < cap; i++) {
        var p = npcs[i];
        if (p.scholar) continue;
        var dx = p.x - listen.x, dy = p.y - listen.y;
        if (dx * dx + dy * dy < listen.r * listen.r && Math.random() < chance) {
          p.scholar = true;
          made++;
        }
      }
      return made;
    },
    markScholars: function (n) {
      for (var i = 0; i < npcs.length && n > 0; i++) {
        if (!npcs[i].scholar) { npcs[i].scholar = true; n--; }
      }
    },
    scholarCount: function () {
      var n = 0;
      npcs.forEach(function (p) { if (p.scholar) n++; });
      return n;
    },
    takeTeachEvents: function () {
      var t = teachDone;
      teachDone = [];
      return t;
    },

    // event damage: remove a fraction of one state's people (global floor 30)
    cull: function (slug, frac) {
      var mine = [];
      npcs.forEach(function (p, i) { if (p.state === slug) mine.push(i); });
      var n = Math.max(1, Math.floor(mine.length * frac));
      if (!mine.length) return;
      while (n > 0 && mine.length && npcs.length > 30) {
        var pick = mine.splice((Math.random() * mine.length) | 0, 1)[0];
        effects.push({ x: npcs[pick].x, y: npcs[pick].y, t: 0, kind: "death" });
        npcs.splice(pick, 1);
        // indices above the removed one shift down
        for (var k = 0; k < mine.length; k++) if (mine[k] > pick) mine[k]--;
        n--;
      }
    },

    // growth pulse: teaching the right card at the right place gives a state
    // a small, visible influx — the reward for resolving an event correctly,
    // not just for the problem going away.
    growthPulse: function (slug, n) {
      for (var i = 0; i < n && npcs.length < 500; i++) {
        var npc = spawnInState(slug);
        if (npc) {
          npcs.push(npc);
          effects.push({ x: npc.x, y: npc.y, t: 0, kind: "birth" });
        }
      }
    },
    setCount: function (target) {
      while (npcs.length > target) npcs.pop();
      var slugs = Object.keys(stateNodes).filter(function (s) { return stateNodes[s].length; });
      while (npcs.length < target && slugs.length) {
        var npc = spawnInState(slugs[(Math.random() * slugs.length) | 0]);
        if (npc) npcs.push(npc);
      }
    }
  };
})();
