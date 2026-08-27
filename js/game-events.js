/* ============================================================
   GameEvents — regional challenges fought with knowledge.
   A drought is broken by reciting agriculture over it; a wave
   of despair by the Gita; a rumor by a folk tale's moral.
   Unanswered events expire and take their toll.
   ============================================================ */
(function () {
  "use strict";

  var TYPES = {
    drought: {
      label: "Drought",
      icon: "☀",
      color: "#c98a1b",
      hint: "recite an Agriculture skill over it",
      counters: function (card) { return card.kind === "skill" && card.job === "farmer"; },
      expire: function (slug, ctx) { ctx.cull(slug, 0.12); ctx.prosperityHit(slug, 20); },
      resolvedMsg: "The drought breaks — the fields drink again.",
      expiredMsg: "The drought takes its toll"
    },
    despair: {
      label: "Wave of despair",
      icon: "🌀",
      color: "#7a4e8e",
      hint: "recite the Bhagavad Gita over it",
      counters: function (card) { return card.kind === "gita"; },
      expire: function (slug, ctx) { ctx.cull(slug, 0.10); ctx.literacyHit(0.8); },
      resolvedMsg: "Hearts steady — the despair lifts.",
      expiredMsg: "Despair takes its toll"
    },
    rumor: {
      label: "Rumor & superstition",
      icon: "❗",
      color: "#6b6b64",
      hint: "recite a Folk Tale over it",
      counters: function (card) { return card.kind === "folklore"; },
      expire: function (slug, ctx) { ctx.literacyHit(1.2); ctx.prosperityHit(slug, 10); },
      resolvedMsg: "The tale's moral scatters the rumor.",
      expiredMsg: "Superstition takes its toll"
    }
  };
  var TYPE_KEYS = Object.keys(TYPES);

  var active = [];       // {type, slug, startDay, expiresDay}
  var nextEventDay = 8;
  var toasts = [];       // {msg, until} — consumed by the UI

  function spawn(day, pickStates) {
    var type = TYPE_KEYS[(Math.random() * TYPE_KEYS.length) | 0];
    var n = 1 + (Math.random() < 0.35 ? 1 : 0);
    var slugs = pickStates(n, active.map(function (e) { return e.slug; }));
    slugs.forEach(function (slug) {
      active.push({ type: type, slug: slug, startDay: day, expiresDay: day + 3 });
    });
    return slugs.length;
  }

  window.GameEvents = {
    TYPES: TYPES,
    init: function (saved) {
      active = (saved && saved.active) || [];
      nextEventDay = (saved && saved.nextEventDay) || 8;
      toasts = [];
    },
    serialize: function () {
      return { active: active, nextEventDay: nextEventDay };
    },
    active: function () { return active; },
    takeToasts: function () {
      var t = toasts;
      toasts = [];
      return t;
    },

    // 1 Hz. ctx: {cull(slug, frac), prosperityHit(slug, amt), literacyHit(amt),
    //             pickStates(n, excludeSlugs), stateName(slug)}
    step: function (day, ctx) {
      if (day >= nextEventDay) {
        if (spawn(day, ctx.pickStates) > 0) {
          nextEventDay = day + 5 + Math.random() * 5;
        } else {
          nextEventDay = day + 2;
        }
      }
      for (var i = active.length - 1; i >= 0; i--) {
        var e = active[i];
        if (day >= e.expiresDay) {
          var T = TYPES[e.type];
          T.expire(e.slug, ctx);
          toasts.push({ msg: T.expiredMsg + " in " + ctx.stateName(e.slug) + ".", kind: "bad" });
          active.splice(i, 1);
        }
      }
    },

    // called on every completed recite; returns resolved events
    onRecite: function (card, slugs) {
      var resolved = [];
      for (var i = active.length - 1; i >= 0; i--) {
        var e = active[i];
        if (slugs.indexOf(e.slug) >= 0 && TYPES[e.type].counters(card)) {
          resolved.push(e);
          toasts.push({ msg: TYPES[e.type].resolvedMsg, kind: "good" });
          active.splice(i, 1);
        }
      }
      return resolved;
    },

    // test hook
    __debugSpawn: function (type, slug, day) {
      active.push({ type: type, slug: slug, startDay: day, expiresDay: day + 3 });
    }
  };
})();
