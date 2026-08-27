/* ============================================================
   GameUI — HUD (literacy, population, day, unread books),
   the Library card dock, the study modal and the recite bar.
   Pure DOM; reads state through the callbacks Game passes in.
   ============================================================ */
(function () {
  "use strict";

  var hud, dock, modal, bar;
  var game = null; // set by init: {getState, onArm}
  var armedId = null;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cardState(card, st) {
    if (window.GameCards.isLocked(card, st.taught)) return "locked";
    if (st.taught[card.id]) return "taught";
    if (st.studied[card.id]) return "studied";
    return "fresh";
  }

  var BADGE = { locked: "🔒", fresh: "✨", studied: "📖", taught: "✔" };

  function renderDock() {
    var st = game.getState();
    dock.innerHTML = "";
    var released = window.GameCards.released(st.day);
    var head = el("div", "dock-head",
      "<b>THE LIBRARY</b> · study a card, then hold <kbd>SPACE</kbd> over the map to recite it to the people");
    dock.appendChild(head);
    var shelf = el("div", "dock-shelf");
    released.forEach(function (card) {
      var state = cardState(card, st);
      var c = el("button", "gcard " + state + (armedId === card.id ? " armed" : ""));
      c.setAttribute("data-kind", card.kind);
      c.innerHTML =
        "<span class='gcard-badge'>" + BADGE[state] + "</span>" +
        "<span class='gcard-kind'>" + (card.kind === "gita" ? "गीता" : "लोक") + "</span>" +
        "<span class='gcard-title'>" + esc(card.title) + "</span>" +
        "<span class='gcard-sub'>" + esc(card.subtitle) + "</span>";
      if (state === "locked") {
        c.disabled = true;
        c.title = "Teach the previous chapter first";
      } else {
        c.addEventListener("click", function () { openStudy(card); });
      }
      shelf.appendChild(c);
    });
    dock.appendChild(shelf);
  }

  function openStudy(card) {
    var s = card.study;
    var body = "<div class='study-card'><button class='study-close' aria-label='Close'>✕</button>" +
      "<div class='study-kicker'>" + (card.kind === "gita" ? "BHAGAVAD GITA · CHAPTER " + card.order : "FOLK TALE · " + esc(card.subtitle)) + "</div>" +
      "<h2>" + esc(card.title) + (card.kind === "gita" ? " — " + esc(card.subtitle) : "") + "</h2>";
    if (s.nameSa) body += "<div class='study-sa'>" + esc(s.nameSa) + " · " + esc(s.nameTranslit) + " · " + s.verses + " slokas</div>";
    body += "<div class='study-recite'><div class='k'>RECITE THIS</div><p>“" + esc(s.recite) + "”</p></div>";
    body += "<p class='study-summary'>" + esc(s.summary) + "</p>";
    if (s.sloka) {
      body += "<div class='study-sloka'><div class='dev'>" + esc(s.sloka.sa) + "</div>" +
        "<div class='tr'>" + esc(s.sloka.translit) + "</div>" +
        "<div class='en'>" + esc(s.sloka.en) + " <span class='ref'>(" + esc(s.sloka.ref) + ")</span></div></div>";
    }
    if (s.moral) body += "<div class='study-moral'><b>Moral:</b> " + esc(s.moral) + "</div>";
    if (s.origin) body += "<div class='study-origin'>" + esc(s.origin) + "</div>";
    body += "<div class='study-hint'>Close this card, then <b>hold SPACE</b> over the map — the people in earshot will listen (" + card.reciteSeconds + "s).</div></div>";
    modal.innerHTML = body;
    modal.hidden = false;
    modal.querySelector(".study-close").addEventListener("click", closeStudy);
    armedId = card.id;
    game.onStudied(card.id);
    renderDock();
  }

  function closeStudy() {
    modal.hidden = true;
    renderDock();
  }

  window.GameUI = {
    init: function (g) {
      game = g;
      hud = document.getElementById("gameHud");
      dock = document.getElementById("libraryDock");
      modal = document.getElementById("studyModal");
      bar = document.getElementById("reciteBar");
      modal.addEventListener("click", function (e) { if (e.target === modal) closeStudy(); });
    },
    show: function () {
      hud.hidden = false;
      dock.hidden = false;
      renderDock();
    },
    hide: function () {
      hud.hidden = true;
      dock.hidden = true;
      modal.hidden = true;
      bar.hidden = true;
    },
    armedCard: function () { return armedId ? window.GameCards.byId(armedId) : null; },
    disarm: function () { armedId = null; renderDock(); },
    isStudyOpen: function () { return !modal.hidden; },
    closeStudy: closeStudy,
    refreshDock: renderDock,
    updateHud: function (st, trend) {
      var unread = window.GameCards.released(st.day).filter(function (c) {
        return !st.taught[c.id] && !window.GameCards.isLocked(c, st.taught);
      }).length;
      hud.innerHTML =
        "<span class='hud-item'>📖 <b>" + st.literacy.toFixed(1) + "%</b> literacy " +
        (trend > 0.01 ? "<i class='up'>▲</i>" : trend < -0.01 ? "<i class='down'>▼</i>" : "") + "</span>" +
        "<span class='hud-item'>👥 <b>" + window.GamePopulation.count() + "</b></span>" +
        "<span class='hud-item'>🗓 day <b>" + Math.floor(st.day) + "</b></span>" +
        (unread ? "<span class='hud-item unread'>🃏 <b>" + unread + "</b> untaught</span>" : "");
    },
    reciteProgress: function (frac, msg) {
      if (frac === null) { bar.hidden = true; return; }
      bar.hidden = false;
      bar.innerHTML = msg
        ? "<span class='rmsg'>" + esc(msg) + "</span>"
        : "<span class='rfill' style='width:" + Math.round(frac * 100) + "%'></span><span class='rtext'>reciting…</span>";
    }
  };
})();
