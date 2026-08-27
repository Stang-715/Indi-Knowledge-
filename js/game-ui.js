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
    if (st.taught[card.id]) {
      return window.Game && window.Game.fresh(card.id) < 0.75 ? "fading" : "taught";
    }
    if (st.studied[card.id]) return "studied";
    return "fresh";
  }

  var BADGE = { locked: "🔒", fresh: "✨", studied: "📖", taught: "✔", fading: "🕯" };

  function avgProsperity(st) {
    var slugs = window.IndiaMap.listStates();
    var sum = 0;
    slugs.forEach(function (s) {
      sum += st.prosperity && st.prosperity[s.slug] != null ? st.prosperity[s.slug] : 20;
    });
    return slugs.length ? sum / slugs.length : 20;
  }

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
        "<span class='gcard-kind'>" + (card.kind === "gita" ? "गीता" : card.kind === "skill" ? "कौशल" : "लोक") + "</span>" +
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
      "<div class='study-kicker'>" + (card.kind === "gita" ? "BHAGAVAD GITA · CHAPTER " + card.order
        : card.kind === "skill" ? "SKILL · " + esc(card.subtitle)
        : "FOLK TALE · " + esc(card.subtitle)) + "</div>" +
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
    var st = game.getState();
    if (st.taught[card.id]) {
      // recall quiz: match the recite line to its teaching to refresh memory
      var released = window.GameCards.released(st.day).filter(function (c) { return c.id !== card.id; });
      var options = [card.title];
      while (options.length < 3 && released.length) {
        var pick = released.splice((Math.random() * released.length) | 0, 1)[0];
        options.push(pick.title);
      }
      options.sort(function () { return Math.random() - 0.5; });
      body += "<div class='study-quiz'><div class='k'>RECALL QUIZ</div>" +
        "<p>Which teaching is the line above from?</p>" +
        options.map(function (t) { return "<button class='quiz-opt' data-ok='" + (t === card.title ? 1 : 0) + "'>" + esc(t) + "</button>"; }).join("") +
        "<div class='quiz-msg'></div></div>";
      body += "<div class='study-hint'>Answer to refresh the people's memory — or <b>hold SPACE</b> over the map to recite it again (" + card.reciteSeconds + "s).</div></div>";
    } else {
      body += "<div class='study-hint'>Close this card, then <b>hold SPACE</b> over the map — the people in earshot will listen (" + card.reciteSeconds + "s).</div></div>";
    }
    modal.innerHTML = body;
    modal.hidden = false;
    modal.querySelector(".study-close").addEventListener("click", closeStudy);
    Array.prototype.forEach.call(modal.querySelectorAll(".quiz-opt"), function (btn) {
      btn.addEventListener("click", function () {
        var msg = modal.querySelector(".quiz-msg");
        if (btn.getAttribute("data-ok") === "1") {
          window.Game.refreshCard(card.id);
          msg.textContent = "✔ The people's memory is refreshed.";
          msg.className = "quiz-msg good";
          renderDock();
        } else {
          btn.classList.add("shake");
          msg.textContent = "Not this one — read the line again.";
          msg.className = "quiz-msg bad";
          setTimeout(function () { btn.classList.remove("shake"); }, 500);
        }
      });
    });
    armedId = card.id;
    game.onStudied(card.id);
    renderDock();
  }

  function closeStudy() {
    modal.hidden = true;
    renderDock();
  }

  function literacyRamp(L) {
    return L < 25 ? "#f3e9d2" : L < 40 ? "#cfe6da" : L < 55 ? "#9ed4c0" : L < 70 ? "#5bbba0" : "#04806c";
  }

  var toolsBuilt = false;
  function buildTools() {
    if (toolsBuilt) return;
    toolsBuilt = true;
    var tools = document.getElementById("gameTools");
    var lit = el("button", "tool-chip", "🗺 Literacy view");
    lit.addEventListener("click", function () {
      var onNow = !!window.Game.choroplethFill;
      window.Game.choroplethFill = onNow ? null : function (slug) {
        return literacyRamp(window.Game.stateLiteracy(slug));
      };
      lit.classList.toggle("active", !onNow);
      window.IndiaMap.recolor();
    });
    tools.appendChild(lit);
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
      buildTools();
      document.getElementById("gameTools").hidden = false;
      renderDock();
    },
    hide: function () {
      hud.hidden = true;
      dock.hidden = true;
      modal.hidden = true;
      bar.hidden = true;
      var banner = document.getElementById("eventBanner");
      banner.innerHTML = "";
      banner.hidden = true;
      var tools = document.getElementById("gameTools");
      tools.hidden = true;
      var lit = tools.querySelector(".tool-chip");
      if (lit) lit.classList.remove("active");
    },
    armedCard: function () { return armedId ? window.GameCards.byId(armedId) : null; },
    disarm: function () { armedId = null; renderDock(); },
    isStudyOpen: function () { return !modal.hidden; },
    closeStudy: closeStudy,
    refreshDock: renderDock,
    updateEvents: function (st, dayNow) {
      var banner = document.getElementById("eventBanner");
      var rows = window.GameEvents.active().map(function (e) {
        var T = window.GameEvents.TYPES[e.type];
        var stMap = window.INDIA_MAP.states[e.slug];
        var name = stMap ? stMap.name : e.slug;
        var left = Math.max(0, Math.ceil(e.expiresDay - dayNow));
        return "<div class='evt-row' style='border-left-color:" + T.color + "'>" +
          T.icon + " <b>" + esc(T.label) + "</b> in " + esc(name) +
          " — " + esc(T.hint) + " · " + left + " day" + (left === 1 ? "" : "s") + " left</div>";
      });
      window.GameEvents.takeToasts().forEach(function (t) {
        var el2 = el("div", "evt-row toast " + t.kind, esc(t.msg));
        banner.appendChild(el2);
        setTimeout(function () { el2.remove(); }, 4000);
      });
      // keep live toasts, replace event rows
      Array.prototype.slice.call(banner.children).forEach(function (c) {
        if (!c.classList.contains("toast")) c.remove();
      });
      banner.insertAdjacentHTML("afterbegin", rows.join(""));
      banner.hidden = banner.children.length === 0;
    },
    updateHud: function (st, trend) {
      var unread = window.GameCards.released(st.day).filter(function (c) {
        return !st.taught[c.id] && !window.GameCards.isLocked(c, st.taught);
      }).length;
      hud.innerHTML =
        "<span class='hud-item'>📖 <b>" + st.literacy.toFixed(1) + "%</b> literacy " +
        (trend > 0.01 ? "<i class='up'>▲</i>" : trend < -0.01 ? "<i class='down'>▼</i>" : "") + "</span>" +
        "<span class='hud-item'>👥 <b>" + window.GamePopulation.count() + "</b></span>" +
        "<span class='hud-item'>🌾 <b>" + avgProsperity(st).toFixed(0) + "%</b></span>" +
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
