/* ============================================================
   GameShare — save codes and community goals.
   A save code is "IKM2." + unicode-safe base64 of the save JSON,
   so a taught population can travel between browsers by paste.
   ============================================================ */
(function () {
  "use strict";

  var PREFIX = "IKM2.";

  window.GameShare = {
    exportCode: function (saveObj) {
      var json = JSON.stringify(saveObj);
      return PREFIX + btoa(unescape(encodeURIComponent(json)));
    },
    importCode: function (code) {
      code = (code || "").trim();
      if (code.indexOf(PREFIX) !== 0) throw new Error("Not a save code — it should start with " + PREFIX);
      var obj;
      try {
        obj = JSON.parse(decodeURIComponent(escape(atob(code.slice(PREFIX.length)))));
      } catch (e) {
        throw new Error("That code is damaged — copy it again in one piece.");
      }
      if (!obj || (obj.v !== 1 && obj.v !== 2)) throw new Error("Unknown save version.");
      return obj;
    },

    // community goals, computed from the save
    goals: function (st, scholarCount, popCount, avgProsperity) {
      var deck = window.GameCards.all();
      var gitaTaught = deck.filter(function (c) { return c.kind === "gita" && st.taught[c.id]; }).length;
      var skillsTaught = deck.filter(function (c) { return c.kind === "skill" && st.taught[c.id]; }).length;
      var slugs = window.IndiaMap.listStates().map(function (s) { return s.slug; });
      var heardFolk = 0, heardGita = 0;
      slugs.forEach(function (slug) {
        var mine = st.stateTaught[slug] || {};
        var ids = Object.keys(mine);
        if (ids.some(function (id) { return id.indexOf("folk-") === 0; })) heardFolk++;
        if (ids.some(function (id) { return id.indexOf("gita-") === 0; })) heardGita++;
      });
      return [
        { label: "Teach the whole Bhagavad Gita", done: gitaTaught >= 18, progress: gitaTaught + "/18" },
        { label: "Every state hears the Gita", done: heardGita >= slugs.length, progress: heardGita + "/" + slugs.length },
        { label: "Every state hears a folk tale", done: heardFolk >= slugs.length, progress: heardFolk + "/" + slugs.length },
        { label: "Teach all eight skills", done: skillsTaught >= 8, progress: skillsTaught + "/8" },
        { label: "Average prosperity above 60", done: avgProsperity >= 60, progress: Math.round(avgProsperity) + "/60" },
        { label: "Raise five scholars", done: scholarCount >= 5, progress: scholarCount + "/5" },
        { label: "A population of four hundred", done: popCount >= 400, progress: popCount + "/400" }
      ];
    }
  };
})();
