/* ============================================================
   India Knowledge Map — application logic
   Tabs, choropleth coloring, detail panel renderers, search,
   3D tilt, folklore language switching, media slots.
   ============================================================ */
(function () {
  "use strict";

  window.INDIA_DATA = window.INDIA_DATA || {};

  /* ---------------- helpers ---------------- */
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function getPack(tab) { return window.INDIA_DATA[tab]; }
  function getEntry(tab, slug) {
    var p = getPack(tab);
    return p && p.states ? p.states[slug] : null;
  }
  function count(arr) { return Array.isArray(arr) ? arr.length : 0; }

  // folk screen-print palette: off-white ground, orange working family,
  // teal / pink / marigold / aubergine accents
  var NO_DATA = "#e7e2d6";
  var SEQ = ["#fbd7b8", "#f9a76b", "#f97c3d", "#e85420", "#c93a12"]; // light → deep vermilion
  function seqColor(n, breaks) {
    for (var i = 0; i < breaks.length; i++) if (n <= breaks[i]) return SEQ[i];
    return SEQ[SEQ.length - 1];
  }

  var SOIL_COLORS = [
    ["alluvial", "#f9a76b", "Alluvial"],
    ["black", "#3b2740", "Black (Regur)"],
    ["regur", "#3b2740", "Black (Regur)"],
    ["red", "#e85420", "Red"],
    ["later", "#c93a12", "Laterite"],
    ["desert", "#f9a51f", "Desert / Arid"],
    ["arid", "#f9a51f", "Desert / Arid"],
    ["mountain", "#0f9e88", "Mountain / Forest"],
    ["forest", "#0c7f6e", "Mountain / Forest"],
    ["saline", "#a7b8b4", "Saline / Coastal"],
    ["coastal", "#a7b8b4", "Saline / Coastal"],
    ["sandy", "#f3c983", "Sandy"],
    ["peat", "#5a4363", "Peaty / Marshy"],
  ];
  function soilColor(entry) {
    if (!entry || !count(entry.soilTypes)) return null;
    var t = String(entry.soilTypes[0]).toLowerCase();
    for (var i = 0; i < SOIL_COLORS.length; i++) {
      if (t.indexOf(SOIL_COLORS[i][0]) !== -1) return SOIL_COLORS[i];
    }
    return ["other", "#d8cfc0", "Other"];
  }

  var LANG_COLORS = {
    hi: "#e85420", bn: "#0f9e88", ta: "#c93a12", te: "#f9a51f", kn: "#7a4e8e",
    ml: "#0c7f6e", mr: "#f97c3d", gu: "#f9a76b", pa: "#b0435f", or: "#3e9e8c",
    as: "#8a6fa8", ur: "#5a6e7a", ks: "#5a6e7a", ne: "#c98a3a", kok: "#f291a6",
    mni: "#b0435f", lus: "#5f8fa8", kha: "#3f7f6f", nag: "#a8783f", brx: "#7a4e8e",
    en: "#a79fae", doi: "#a8783f", sat: "#8a5a2f", mai: "#f9a51f", bho: "#f9a76b",
    raj: "#e85420", tcy: "#7a4e8e", gon: "#8a5a2f", bo: "#5a4363", dv: "#5f8fa8",
  };
  function langColor(code) {
    if (!code) return NO_DATA;
    var c = String(code).split("-")[0].toLowerCase();
    return LANG_COLORS[c] || NO_DATA;
  }

  // decorative flat-print patchwork, used only while a tab's data pack
  // hasn't loaded — keeps the map vibrant instead of off-white on off-white
  // orange-weighted per the 60/30/10 rule: mostly vermilion family, accents sparse
  var PATCH = ["#e85420", "#f9a76b", "#f97c3d", "#c93a12", "#fbd7b8", "#f9a51f",
               "#e85420", "#f9a76b", "#0f9e88", "#f97c3d", "#f291a6", "#fbd7b8"];
  function patchColor(slug) {
    var h = 0;
    for (var i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    return PATCH[h % PATCH.length];
  }

  function formationYear(entry) {
    if (!entry || !entry.formation || !entry.formation.date) return null;
    var m = String(entry.formation.date).match(/(1[89]\d\d|20\d\d)/);
    return m ? parseInt(m[1], 10) : null;
  }
  var ERA_COLORS = [
    [1950, "#c93a12", "1947–1950"],
    [1959, "#e85420", "1950s (Reorganisation)"],
    [1969, "#f97c3d", "1960s"],
    [1979, "#f9a76b", "1970s"],
    [1999, "#fbd7b8", "1980s–90s"],
    [2100, "#0f9e88", "2000s+"],
  ];
  function eraColor(y) {
    for (var i = 0; i < ERA_COLORS.length; i++) if (y <= ERA_COLORS[i][0]) return ERA_COLORS[i];
    return ERA_COLORS[ERA_COLORS.length - 1];
  }

  /* ---------------- tab registry ---------------- */
  var TABS = [
    {
      key: "soil", num: "01", icon: "🌱", label: "Soil Health",
      blurb: "District-aware soil intelligence: NPK status, micronutrients, organic carbon, and research-backed ways to heal the soil.",
      legendTitle: "Dominant soil type",
      fill: function (e) { var c = soilColor(e); return c ? c[1] : null; },
      legend: function (slugs) {
        var seen = {};
        slugs.forEach(function (s) {
          var c = soilColor(getEntry("soil", s));
          if (c) seen[c[2]] = c[1];
        });
        return Object.keys(seen).map(function (k) { return { label: k, color: seen[k] }; });
      },
      tipLine: function (e) { return e && e.soilTypes ? "Soil: " + e.soilTypes.slice(0, 2).join(", ") : null; },
    },
    {
      key: "history", num: "02", icon: "🏛️", label: "History",
      blurb: "From the first settlements to statehood — dynasties, turning points and heritage of every state.",
      legendTitle: "Key events documented",
      fill: function (e) { return e ? seqColor(count(e.keyEvents), [2, 4, 5, 6]) : null; },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.dynasties) ? "Dynasties: " + e.dynasties.slice(0, 3).join(", ") + "…" : null;
      },
    },
    {
      key: "governance", num: "03", icon: "⚖️", label: "Governance",
      blurb: "Statehood, political history, flagship policies and how district administration delivers them.",
      legendTitle: "State/UT formed (current form)",
      fill: function (e) { var y = formationYear(e); return y ? eraColor(y)[1] : null; },
      legend: function () {
        return ERA_COLORS.map(function (r) { return { label: r[2], color: r[1] }; });
      },
      tipLine: function (e) {
        var y = formationYear(e);
        return y ? "Formed: " + y + (e.capital ? " · Capital: " + e.capital : "") : null;
      },
    },
    {
      key: "community", num: "04", icon: "🪷", label: "Communities",
      blurb: "The peoples of each state — communities, languages, festivals and the making of cultural identity.",
      legendTitle: "Communities documented",
      fill: function (e) { return e ? seqColor(count(e.communities), [2, 3, 4, 5]) : null; },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.languages) ? "Languages: " + e.languages.slice(0, 2).join("; ") : null;
      },
    },
    {
      key: "art", num: "05", icon: "🎨", label: "Local Art",
      blurb: "Paintings, dance, music and theatre — every art form mapped to the soil it grew from.",
      legendTitle: "Art forms documented",
      fill: function (e) { return e ? seqColor(count(e.artForms), [2, 3, 4, 5]) : null; },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.artForms) ? "Art: " + e.artForms.slice(0, 2).map(function (a) { return a.name; }).join(", ") : null;
      },
    },
    {
      key: "craft", num: "06", icon: "🧵", label: "Local Craft",
      blurb: "GI-tagged crafts, living clusters and the master craftspeople who carry them.",
      legendTitle: "GI-tagged crafts documented",
      fill: function (e) {
        if (!e) return null;
        var gi = (e.crafts || []).filter(function (c) { return c.giTag; }).length;
        return seqColor(gi, [0, 1, 2, 3]);
      },
      legend: function () {
        return [{ label: "0 GI", color: SEQ[0] }, { label: "1–2", color: SEQ[1] }, { label: "3", color: SEQ[3] }, { label: "4+", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.crafts) ? "Craft: " + e.crafts.slice(0, 2).map(function (c) { return c.name; }).join(", ") : null;
      },
    },
    {
      key: "wars", num: "07", icon: "🛡️", label: "Wars",
      blurb: "The battles fought on this soil and what each one changed.",
      legendTitle: "Battles documented",
      fill: function (e) { return e ? seqColor(count(e.battles), [1, 2, 3, 4]) : null; },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.battles) ? "e.g. " + e.battles[0].name + " (" + e.battles[0].year + ")" : null;
      },
    },
    {
      key: "vedas", num: "08", icon: "🕉️", label: "Vedas",
      blurb: "Where the Vedic and classical knowledge traditions were composed, taught and preserved.",
      legendTitle: "Traditions + centers documented",
      fill: function (e) {
        return e ? seqColor(count(e.traditions) + count(e.knowledgeCenters), [1, 2, 4, 5]) : null;
      },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        return e && count(e.knowledgeCenters) ? "Center: " + e.knowledgeCenters[0].name : null;
      },
    },
    {
      key: "folklore", num: "09", icon: "🪔", label: "Folk Tales",
      blurb: "Dadi ki kahaniyan — documented folk tales of every state, readable in English, Hindi or the local tongue.",
      legendTitle: "Primary language of the lore",
      fill: function (e) { return e ? langColor(e.regionalLanguageCode) : null; },
      legend: function (slugs) {
        var seen = {};
        slugs.forEach(function (s) {
          var e = getEntry("folklore", s);
          if (e && e.originalLanguage) {
            var name = String(e.originalLanguage).split("(")[0].split(",")[0].trim();
            seen[name] = langColor(e.regionalLanguageCode);
          }
        });
        var out = Object.keys(seen).slice(0, 12).map(function (k) { return { label: k, color: seen[k] }; });
        if (Object.keys(seen).length > 12) out.push({ label: "…and more", color: "#e7e2d6" });
        return out;
      },
      tipLine: function (e) {
        return e && count(e.tales) ? "Tale: " + (e.tales[0].title.en || "") : null;
      },
    },
    {
      key: "heritage", num: "10", icon: "🏰", label: "Heritage",
      blurb: "UNESCO World Heritage properties and ASI-protected monuments — the built and natural memory of every state.",
      legendTitle: "Heritage sites documented",
      fill: function (e) { return e ? seqColor(count(e.sites), [2, 4, 5, 6]) : null; },
      legend: function () {
        return [{ label: "fewer", color: SEQ[0] }, { label: "…", color: SEQ[2] }, { label: "more", color: SEQ[4] }];
      },
      tipLine: function (e) {
        if (!e) return null;
        var bits = [];
        if (e.unescoCount != null) bits.push("UNESCO: " + e.unescoCount);
        if (count(e.sites)) bits.push("e.g. " + e.sites[0].name);
        return bits.join(" · ") || null;
      },
    },
  ];

  /* ---------------- app state ---------------- */
  var App = {
    tab: TABS[0],
    state: null,      // slug
    district: null,   // district name
    lang: "en",       // folklore language preference
  };

  var $panelHead = null, $panelBody = null, $legend = null, $crumb = null;

  /* ---------------- panel section builders ---------------- */
  function sec(title, inner) {
    return inner ? "<h3>" + esc(title) + "</h3>" + inner : "";
  }
  function para(txt, cls) {
    return txt ? "<p class='" + (cls || "") + "'>" + esc(txt) + "</p>" : "";
  }
  function ul(items, fmt) {
    if (!count(items)) return "";
    return "<ul class='plain'>" + items.map(function (it) {
      return "<li>" + (fmt ? fmt(it) : esc(it)) + "</li>";
    }).join("") + "</ul>";
  }
  function kvCards(pairs) {
    var cells = pairs.filter(function (p) { return p[1]; }).map(function (p) {
      return "<div class='kv'><div class='k'>" + esc(p[0]) + "</div><div class='v'>" + esc(p[1]) + "</div></div>";
    });
    return cells.length ? "<div class='kv-cards'>" + cells.join("") + "</div>" : "";
  }
  function itemCard(title, meta, body, tag) {
    return "<div class='item-card'><div class='ic-title'><span>" + title + "</span>" +
      (tag ? "<span class='ic-tag'>" + esc(tag) + "</span>" : "") + "</div>" +
      (meta ? "<div class='ic-meta'>" + meta + "</div>" : "") +
      (body ? "<div class='ic-body'>" + body + "</div>" : "") + "</div>";
  }
  function npkLevel(text) {
    var t = String(text || "").toLowerCase();
    if (t.indexOf("very low") === 0 || t.indexOf("low") === 0 || t.indexOf("deficient") === 0) return "low";
    if (t.indexOf("medium") === 0 || t.indexOf("moderate") === 0) return "medium";
    if (t.indexOf("high") === 0 || t.indexOf("adequate") === 0 || t.indexOf("sufficient") === 0) return "high";
    return "";
  }
  function npkGauges(npk) {
    if (!npk) return "";
    var cells = [["N", "Nitrogen", npk.nitrogen], ["P", "Phosphorus", npk.phosphorus], ["K", "Potassium", npk.potassium]]
      .map(function (row) {
        var lvl = npkLevel(row[2]);
        return "<div class='npk'><div class='sym'>" + row[0] + "</div>" +
          "<div class='lvl " + lvl + "'>" + esc(lvl || "status") + "</div>" +
          "<div class='note'>" + esc(row[2] || "no verified data") + "</div></div>";
      });
    return "<div class='npk-row'>" + cells.join("") + "</div>";
  }
  function sourcesList(sources) {
    if (!count(sources)) return "";
    return "<ul class='plain sources'>" + sources.map(function (s) {
      var label = esc(s.title || "Source") + (s.publisher ? " — " + esc(s.publisher) : "") + (s.year ? " (" + esc(s.year) + ")" : "");
      return "<li>" + (s.url ? "<a href='" + esc(s.url) + "' target='_blank' rel='noopener'>" + label + "</a>" : label) + "</li>";
    }).join("") + "</ul>";
  }
  function mediaSection(entry) {
    if (entry && count(entry.media)) {
      return ul(entry.media, function (m) {
        return esc(m.title || m.url || "media item") + (m.type ? " <em>(" + esc(m.type) + ")</em>" : "");
      });
    }
    return "<div class='media-slot'>🎬 No media yet. Videos & new findings enter through the moderated review pipeline — see <code>backend/README.md</code>. Nothing is published without verification.</div>";
  }
  function badges(entry, pack) {
    var out = [];
    var qc = pack && pack.meta && pack.meta.qc ? pack.meta.qc.status : "pending";
    out.push(qc === "verified"
      ? "<span class='badge qc-verified'>✓ QC verified</span>"
      : "<span class='badge qc-pending'>QC: " + esc(qc) + "</span>");
    if (entry && entry.confidence) {
      out.push("<span class='badge conf-" + esc(entry.confidence) + "'>confidence: " + esc(entry.confidence) + "</span>");
    }
    return out.join("");
  }

  /* ---------------- tab-specific renderers ---------------- */
  var RENDER = {
    soil: function (e, slug) {
      var html = "";
      html += para(e.summary, "summary");
      html += sec("NPK status", npkGauges(e.npk));
      html += sec("Soil profile", kvCards([
        ["Soil types", (e.soilTypes || []).join(", ")],
        ["Organic carbon", e.organicCarbon],
        ["Zinc", e.micronutrients && e.micronutrients.zinc],
        ["Iron", e.micronutrients && e.micronutrients.iron],
        ["Boron", e.micronutrients && e.micronutrients.boron],
        ["Sulphur", e.micronutrients && e.micronutrients.sulphur],
      ]));
      html += sec("Current state", para(e.currentState));
      html += sec("Issues", ul(e.issues));
      html += sec("How to improve this soil", ul(e.recommendations));
      if (count(e.districtHighlights)) {
        html += sec("District highlights", e.districtHighlights.map(function (d) {
          return itemCard(esc(d.district), null, esc(d.note));
        }).join(""));
      }
      html += sec("All districts (click on map or below)", districtChips(slug, e));
      return html;
    },
    history: function (e) {
      var html = para(e.summary, "summary");
      if (e.eras) {
        html += sec("Ancient", para(e.eras.ancient));
        html += sec("Medieval", para(e.eras.medieval));
        html += sec("Modern", para(e.eras.modern));
      }
      html += sec("Dynasties & powers", ul(e.dynasties));
      if (count(e.keyEvents)) {
        html += sec("Timeline", "<div class='timeline'>" + e.keyEvents.map(function (ev) {
          return "<div class='tl-item'><span class='tl-year'>" + esc(ev.year) + "</span> — " + esc(ev.event) + "</div>";
        }).join("") + "</div>");
      }
      html += sec("Heritage sites", ul(e.heritageSites));
      return html;
    },
    governance: function (e) {
      var html = para(e.summary, "summary");
      html += sec("At a glance", kvCards([
        ["Formed", e.formation && e.formation.date],
        ["Capital", e.capital],
        ["Legislature", e.legislature],
        ["Districts", e.districts],
      ]));
      html += sec("Formation", para(e.formation && e.formation.details));
      html += sec("Political history", para(e.politicalHistory));
      if (count(e.flagshipPolicies)) {
        html += sec("Flagship policies & implementation", e.flagshipPolicies.map(function (p) {
          return itemCard(esc(p.name), esc(p.area || ""), esc(p.description || "") +
            (p.implementation ? "<br><b>On the ground:</b> " + esc(p.implementation) : ""));
        }).join(""));
      }
      html += sec("District governance", para(e.districtGovernance));
      return html;
    },
    community: function (e) {
      var html = para(e.summary, "summary");
      if (count(e.communities)) {
        html += sec("Communities", e.communities.map(function (c) {
          return itemCard(esc(c.name), null, esc(c.note));
        }).join(""));
      }
      html += sec("Languages", ul(e.languages));
      if (count(e.festivals)) {
        html += sec("Festivals", e.festivals.map(function (f) {
          return itemCard(esc(f.name), null, esc(f.note));
        }).join(""));
      }
      html += sec("Cultural history", para(e.culturalHistory));
      html += sec("Cuisine", ul(e.cuisine));
      return html;
    },
    art: function (e) {
      var html = para(e.summary, "summary");
      if (count(e.artForms)) {
        html += sec("Art forms & origins", e.artForms.map(function (a) {
          return itemCard(esc(a.name), esc(a.type || ""),
            (a.origin ? "<b>Origin:</b> " + esc(a.origin) + "<br>" : "") + esc(a.description || ""),
            a.status || null);
        }).join(""));
      }
      html += sec("Classical connections", para(e.classicalConnections));
      return html;
    },
    craft: function (e) {
      var html = para(e.summary, "summary");
      if (count(e.crafts)) {
        html += sec("Crafts & clusters", e.crafts.map(function (c) {
          return itemCard(esc(c.name), esc(c.cluster || ""),
            (c.materials ? "<b>Materials:</b> " + esc(c.materials) + "<br>" : "") + esc(c.description || ""),
            c.giTag || null);
        }).join(""));
      }
      if (count(e.masterCraftspeople)) {
        html += sec("Master craftspeople", e.masterCraftspeople.map(function (m) {
          return itemCard(esc(m.name), esc(m.craft || ""), esc(m.recognition || ""));
        }).join(""));
      }
      html += sec("Artisan economy", para(e.economicNote));
      return html;
    },
    wars: function (e) {
      var html = para(e.summary, "summary");
      if (count(e.battles)) {
        html += sec("Battles on this soil", e.battles.map(function (b) {
          return itemCard(esc(b.name), esc(b.year || "") + (b.location ? " · " + esc(b.location) : ""),
            (b.belligerents ? "<b>Belligerents:</b> " + esc(b.belligerents) + "<br>" : "") +
            (b.outcome ? "<b>Outcome:</b> " + esc(b.outcome) + "<br>" : "") +
            (b.consequence ? "<b>Consequence:</b> " + esc(b.consequence) : ""));
        }).join(""));
      }
      html += sec("Military heritage", para(e.militaryHeritage));
      return html;
    },
    vedas: function (e) {
      var html = para(e.summary, "summary");
      html += sec("Vedic connection", para(e.vedicConnection));
      if (count(e.traditions)) {
        html += sec("Living traditions / shakhas", e.traditions.map(function (t) {
          return itemCard(esc(t.name), null, esc(t.note));
        }).join(""));
      }
      if (count(e.knowledgeCenters)) {
        html += sec("Knowledge centers", e.knowledgeCenters.map(function (k) {
          return itemCard(esc(k.name), null, esc(k.note));
        }).join(""));
      }
      html += sec("Texts of this region", ul(e.texts));
      return html;
    },
    folklore: function (e) {
      var html = para(e.summary, "summary");
      html += sec("Oral tradition", para(e.oralTradition));
      html += kvCards([["Original language", e.originalLanguage]]);

      var hasRegional = (e.tales || []).some(function (t) { return t.tale && t.tale.regional; });
      var pills = "<div class='lang-pills'>" +
        pill("en", "English") + pill("hi", "हिन्दी") +
        (hasRegional ? pill("regional", esc((e.originalLanguage || "Regional").split("(")[0].trim())) : "") +
        "</div>";
      html += sec("Dadi ki Kahaniyan · दादी की कहानियाँ", pills + (e.tales || []).map(function (t) {
        var L = App.lang;
        var title = (t.title && (t.title[L] || t.title.en)) || "Tale";
        var body = t.tale ? (t.tale[L] || null) : null;
        var fallback = "";
        if (!body) {
          body = t.tale ? (t.tale.en || "") : "";
          if (L !== "en") fallback = "<div class='notice'>This tale isn't available in the selected language yet — showing English. Verified translations arrive through the review pipeline.</div>";
        }
        var moral = t.moral ? (t.moral[L === "regional" ? "en" : L] || t.moral.en) : null;
        return itemCard(esc(title), esc(t.origin || ""),
          "<div class='tale-text " + (L === "hi" ? "devanagari" : "") + "'>" + esc(body) + "</div>" +
          (moral ? "<div class='tale-moral'>" + esc(moral) + "</div>" : "") + fallback);
      }).join(""));
      return html;
    },
    heritage: function (e) {
      var html = para(e.summary, "summary");
      html += sec("At a glance", kvCards([
        ["UNESCO properties", e.unescoCount != null ? String(e.unescoCount) : null],
        ["ASI monuments", e.asiNote],
      ]));
      if (count(e.sites)) {
        var order = ["UNESCO World Heritage", "UNESCO Natural", "UNESCO Tentative List",
                     "ASI Monument of National Importance", "State protected"];
        var sorted = e.sites.slice().sort(function (a, b) {
          return order.indexOf(a.designation) - order.indexOf(b.designation);
        });
        html += sec("Sites", sorted.map(function (s) {
          return itemCard(esc(s.name),
            esc(s.district || "") + (s.period ? " · " + esc(s.period) : ""),
            esc(s.note || ""), s.designation || null);
        }).join(""));
      }
      return html;
    },
  };

  function pill(code, label) {
    return "<button class='lang-pill " + (App.lang === code ? "active" : "") +
      "' data-lang='" + code + "'>" + label + "</button>";
  }

  function districtChips(slug, soilEntry) {
    var names = window.IndiaMap.listDistricts(slug);
    if (!names.length) return "";
    var known = {};
    (soilEntry && soilEntry.districtHighlights || []).forEach(function (d) {
      known[String(d.district).toLowerCase()] = true;
    });
    return "<div class='district-grid'>" + names.map(function (n) {
      var cls = "district-chip" +
        (known[n.toLowerCase()] ? " has-data" : "") +
        (App.district === n ? " active" : "");
      return "<button class='" + cls + "' data-district='" + esc(n) + "'>" + esc(n) + "</button>";
    }).join("") + "</div>";
  }

  function districtSpotlight(tab, slug, districtName) {
    var e = getEntry(tab.key, slug);
    var match = null;
    if (e && count(e.districtHighlights)) {
      match = e.districtHighlights.find(function (d) {
        return String(d.district).toLowerCase() === districtName.toLowerCase();
      });
    }
    var inner;
    if (match) {
      inner = itemCard("📍 " + esc(districtName), "verified district record", esc(match.note));
    } else {
      inner = "<div class='notice'>📍 <b>" + esc(districtName) + "</b> — no verified district-level record in this tab yet. " +
        "The schema already supports district data; new verified findings are integrated gradually through the QC pipeline (see <code>data/SPEC.md</code>).</div>";
    }
    return sec("Selected district", inner);
  }

  /* ---------------- panel rendering ---------------- */
  function renderPanel() {
    var tab = App.tab;
    var pack = getPack(tab.key);

    if (!App.state) {
      $panelHead.innerHTML =
        "<div class='tab-name'>Tab " + tab.num + " · " + esc(tab.label) + "</div>" +
        "<h2>" + tab.icon + " " + esc(pack && pack.meta ? pack.meta.title : tab.label) + "</h2>" +
        "<div class='badges'>" + (pack ? badges(null, pack) : "") + "</div>";
      var loaded = TABS.filter(function (t) { return !!getPack(t.key); }).length;
      $panelBody.innerHTML =
        "<div class='welcome'>" +
        "<div class='big'>" + esc(tab.blurb) + "</div>" +
        "<ol>" +
        "<li><b>Click any state</b> on the map to open its " + esc(tab.label) + " dossier.</li>" +
        "<li>Once inside a state, <b>click a district</b> for district-level records.</li>" +
        "<li>Switch tabs above — the map re-colors to tell that tab's story.</li>" +
        "<li>Try the <b>3D view</b> and the search box in the map toolbar.</li>" +
        "</ol>" +
        "<div class='stat-strip'>" +
        "<div class='stat'><div class='n'>36</div><div class='l'>States & UTs</div></div>" +
        "<div class='stat'><div class='n'>" + window.IndiaMap.listStates().reduce(function (a, s) { return a + window.IndiaMap.listDistricts(s.slug).length; }, 0) + "</div><div class='l'>Districts</div></div>" +
        "<div class='stat'><div class='n'>" + loaded + "/" + TABS.length + "</div><div class='l'>Data packs</div></div>" +
        "</div>" +
        (pack && pack.meta && count(pack.meta.primarySources)
          ? sec("Primary sources for this tab", ul(pack.meta.primarySources))
          : "") +
        (!pack ? "<div class='notice'>This tab's research pack hasn't been loaded. Check that <code>data/" + esc(tab.key) + ".js</code> exists.</div>" : "") +
        "</div>";
      return;
    }

    var slug = App.state;
    var mapState = window.INDIA_MAP.states[slug];
    var entry = getEntry(tab.key, slug);

    $panelHead.innerHTML =
      "<div class='tab-name'>Tab " + tab.num + " · " + esc(tab.label) + "</div>" +
      "<h2>" + esc(mapState ? mapState.name : slug) + "</h2>" +
      "<div class='badges'>" + badges(entry, pack) + "</div>";

    var html = "";
    if (App.district) html += districtSpotlight(tab, slug, App.district);

    if (!entry) {
      html += "<div class='notice'>No verified record for this state in the <b>" + esc(tab.label) +
        "</b> pack yet. Under the strict-filter policy, nothing is shown without research-backed data.</div>";
    } else {
      html += RENDER[tab.key](entry, slug);
      html += sec("Verified facts", ul(entry.facts));
      html += sec("Sources", sourcesList(entry.sources));
      html += sec("Media", mediaSection(entry));
    }
    $panelBody.innerHTML = html;
    $panelBody.scrollTop = 0;

    // wire district chips + language pills
    $panelBody.querySelectorAll(".district-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectDistrict(slug, btn.getAttribute("data-district"));
      });
    });
    $panelBody.querySelectorAll(".lang-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        App.lang = btn.getAttribute("data-lang");
        renderPanel();
      });
    });
  }

  function renderLegend() {
    var tab = App.tab;
    var slugs = window.IndiaMap.listStates().map(function (s) { return s.slug; });
    var items = getPack(tab.key) ? tab.legend(slugs) : [];
    $legend.innerHTML = "<span class='legend-title'>" + esc(tab.legendTitle) + "</span>" +
      (items.length
        ? items.map(function (it) {
            return "<span class='chip'><span class='swatch' style='background:" + it.color + "'></span>" + esc(it.label) + "</span>";
          }).join("")
        : "<span>decorative patchwork — research pack still in the pipeline</span>") +
      "<span class='chip' style='margin-left:auto'><span class='swatch' style='background:#e7e2d6'></span>no data</span>";
  }

  function renderCrumb() {
    var html = "<button data-nav='india'>🇮🇳 India</button>";
    if (App.state) {
      var name = window.INDIA_MAP.states[App.state].name;
      html += " › " + (App.district
        ? "<button data-nav='state'>" + esc(name) + "</button> › <b>" + esc(App.district) + "</b>"
        : "<b>" + esc(name) + "</b>");
    } else {
      html = "<b>🇮🇳 India</b> <span style='font-weight:400'>— click a state to explore</span>";
    }
    $crumb.innerHTML = html;
    $crumb.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-nav") === "india") window.IndiaMap.reset();
        else { App.district = null; window.IndiaMap.setActiveDistrict(null); renderCrumb(); renderPanel(); }
      });
    });
  }

  /* ---------------- selection flow ---------------- */
  function selectDistrict(slug, name) {
    App.district = name;
    window.IndiaMap.setActiveDistrict(name);
    renderCrumb();
    renderPanel();
  }

  function switchTab(tab) {
    App.tab = tab;
    App.district = null;
    document.querySelectorAll("nav.tabs button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab.key);
    });
    window.IndiaMap.recolor();
    renderLegend();
    renderCrumb();
    renderPanel();
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    $panelHead = document.getElementById("panelHead");
    $panelBody = document.getElementById("panelBody");
    $legend = document.getElementById("mapLegend");
    $crumb = document.getElementById("crumb");

    // tab bar
    var nav = document.getElementById("tabBar");
    TABS.forEach(function (t) {
      var b = document.createElement("button");
      b.setAttribute("data-tab", t.key);
      b.innerHTML = "<span>" + t.icon + "</span><span class='num'>" + t.num + "</span> " + esc(t.label);
      b.addEventListener("click", function () { switchTab(t); });
      nav.appendChild(b);
    });

    // map
    window.IndiaMap.init({
      svg: document.getElementById("indiaMap"),
      tooltip: document.getElementById("tooltip"),
      getFill: function (slug) {
        if (!getPack(App.tab.key)) return patchColor(slug);
        return App.tab.fill(getEntry(App.tab.key, slug));
      },
      getTooltip: function (slug) {
        var name = window.INDIA_MAP.states[slug].name;
        var e = getEntry(App.tab.key, slug);
        var line = e ? App.tab.tipLine(e) : "research pack in the pipeline";
        return "<div class='t-name'>" + esc(name) + "</div>" +
          (line ? "<div class='t-sub'>" + esc(line) + "</div>" : "") +
          "<div class='t-sub'>click to explore ›</div>";
      },
      getDistrictTooltip: function (slug, dn) {
        var e = getEntry("soil", slug);
        var hint = "";
        if (App.tab.key === "soil" && e && count(e.districtHighlights)) {
          var m = e.districtHighlights.find(function (d) {
            return String(d.district).toLowerCase() === dn.toLowerCase();
          });
          if (m) hint = "<div class='t-sub'>" + esc(m.note.slice(0, 90)) + (m.note.length > 90 ? "…" : "") + "</div>";
        }
        return "<div class='t-name'>" + esc(dn) + "</div>" + hint + "<div class='t-sub'>click to select district</div>";
      },
      onStateSelect: function (slug) {
        App.state = slug;
        App.district = null;
        renderCrumb();
        renderPanel();
      },
      onDistrictSelect: function (slug, dn) { selectDistrict(slug, dn); },
    });

    // search
    var search = document.getElementById("stateSearch");
    var dl = document.getElementById("stateList");
    window.IndiaMap.listStates()
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (s) {
        var o = document.createElement("option");
        o.value = s.name;
        dl.appendChild(o);
      });
    function trySearch() {
      var q = search.value.trim().toLowerCase();
      if (!q) return;
      var hit = window.IndiaMap.listStates().find(function (s) {
        return s.name.toLowerCase() === q;
      }) || window.IndiaMap.listStates().find(function (s) {
        return s.name.toLowerCase().indexOf(q) !== -1;
      });
      if (hit) { window.IndiaMap.focusState(hit.slug); search.value = ""; }
    }
    search.addEventListener("change", trySearch);
    search.addEventListener("keydown", function (e) { if (e.key === "Enter") trySearch(); });

    // 3D control: flat → tilt → orbit (drag to rotate X/Y, wheel/Q/E for Z)
    var stage = document.getElementById("mapStage");
    var btn3d = document.getElementById("btn3d");
    var btnZL = document.getElementById("btnZL");
    var btnZR = document.getElementById("btnZR");
    window.Orbit.init({ stage: stage, tiltEl: stage.querySelector(".map-tilt") });
    var MODE_LABELS = ["◈ 3D view", "◈ Tilt on", "🧊 Orbit on"];
    btn3d.addEventListener("click", function () {
      var m = (window.Orbit.getMode() + 1) % 3;
      window.Orbit.setMode(m);
      btn3d.textContent = MODE_LABELS[m];
      btn3d.classList.toggle("on", m > 0);
      btnZL.style.display = m === 2 ? "" : "none";
      btnZR.style.display = m === 2 ? "" : "none";
    });
    btnZL.style.display = "none";
    btnZR.style.display = "none";
    btnZL.addEventListener("click", function () { window.Orbit.spin(-12); });
    btnZR.addEventListener("click", function () { window.Orbit.spin(12); });
    document.getElementById("btnReset").addEventListener("click", function () {
      window.IndiaMap.reset();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") window.IndiaMap.reset();
    });

    switchTab(TABS[0]);
  });
})();
