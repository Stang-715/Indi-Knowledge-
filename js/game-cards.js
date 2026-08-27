/* ============================================================
   GameCards — builds the Library deck from the data packs.
   Gita chapters unlock in order; folk tales come from
   data/folklore.js. Card releases are a pure function of the
   game-day, so saves only need the clock and the taught set.
   ============================================================ */
(function () {
  "use strict";

  var deck = [];

  function firstSentence(s, max) {
    if (!s) return "";
    var cut = s.indexOf(". ");
    var out = cut > 0 && cut < max ? s.slice(0, cut + 1) : s;
    return out.length > max ? out.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : out;
  }

  function buildGitaCards() {
    var pack = window.INDIA_DATA && window.INDIA_DATA.gita;
    if (!pack || !pack.chapters) return [];
    return pack.chapters.map(function (ch, i) {
      return {
        id: "gita-" + String(ch.n).padStart(2, "0"),
        kind: "gita",
        order: ch.n,
        title: "Gita Ch. " + ch.n,
        subtitle: ch.name.en,
        stateSlug: null,
        weight: 2,
        reciteSeconds: 4,
        // Gita releases: ch.1 on day 0, then one every 2 days regardless of
        // the alternating folklore stream (both streams share the cadence).
        releaseDay: i === 0 ? 0 : i * 4 - 2,
        study: {
          recite: ch.recite,
          summary: ch.summary,
          sloka: ch.sloka,
          nameSa: ch.name.sa,
          nameTranslit: ch.name.translit,
          verses: ch.verses
        }
      };
    });
  }

  function buildFolkloreCards() {
    var pack = window.INDIA_DATA && window.INDIA_DATA.folklore;
    if (!pack || !pack.states) return [];
    var cards = [];
    var slugs = Object.keys(pack.states).filter(function (s) {
      var e = pack.states[s];
      return e && e.tales && e.tales.length;
    });
    // first tale of every state with tales, then second tales, until ~18 cards
    for (var round = 0; round < 2 && cards.length < 18; round++) {
      for (var i = 0; i < slugs.length && cards.length < 18; i++) {
        var e = pack.states[slugs[i]];
        var tale = e.tales[round];
        if (!tale) continue;
        cards.push({
          id: "folk-" + slugs[i] + "-" + (round + 1),
          kind: "folklore",
          order: cards.length + 1,
          title: tale.title.en,
          subtitle: e.name + " folk tale",
          stateSlug: slugs[i],
          weight: 1,
          reciteSeconds: 3,
          releaseDay: cards.length === 0 ? 0 : (cards.length === 1 ? 0 : cards.length * 4 - 4),
          study: {
            recite: firstSentence(tale.moral && tale.moral.en, 140),
            summary: firstSentence(tale.tale.en, 420),
            moral: tale.moral && tale.moral.en,
            origin: tale.origin,
            titleHi: tale.title.hi
          }
        });
      }
    }
    return cards;
  }

  window.GameCards = {
    init: function () {
      deck = buildGitaCards().concat(buildFolkloreCards());
      return deck;
    },
    all: function () { return deck; },
    byId: function (id) {
      for (var i = 0; i < deck.length; i++) if (deck[i].id === id) return deck[i];
      return null;
    },
    released: function (gameDay) {
      return deck.filter(function (c) { return c.releaseDay <= gameDay; });
    },
    // a Gita chapter is locked until the previous chapter is taught
    isLocked: function (card, taughtSet) {
      if (card.kind !== "gita" || card.order === 1) return false;
      return !taughtSet["gita-" + String(card.order - 1).padStart(2, "0")];
    },
    nextReleaseDay: function (gameDay) {
      var best = null;
      deck.forEach(function (c) {
        if (c.releaseDay > gameDay && (best === null || c.releaseDay < best)) best = c.releaseDay;
      });
      return best;
    }
  };
})();
