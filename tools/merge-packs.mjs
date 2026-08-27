#!/usr/bin/env node
/**
 * Merge chunk files from data/parts/<tab>-<a|b|c>.js into data/<tab>.js.
 *
 * Each part sets:  window.INDIA_DATA_PARTS["<tab>-<chunk>"] = { states: {...} }
 * The merged pack follows data/SPEC.md. Fresh part entries win over any
 * older entries already in data/<tab>.js; older entries are kept where no
 * part covers that state. meta.coverage is computed from the real count.
 *
 * Usage: node tools/merge-packs.mjs [tab ...]   (default: all tabs)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const partsDir = join(root, "atlas-data", "parts");

const TABS = {
  soil: ["Soil Health", ["Soil Health Card portal (soilhealth.dac.gov.in)", "ICAR-IISS soil fertility reports", "State agriculture department reports"]],
  history: ["History of India", ["Encyclopaedia Britannica (state history sections)", "Archaeological Survey of India", "State/UT government portals", "UNESCO World Heritage Centre"]],
  governance: ["Political History & Governance", ["State government portals", "PRS Legislative Research", "NITI Aayog", "Press Information Bureau"]],
  community: ["Communities & Cultural History", ["Census of India language data", "State culture/tourism departments", "Ministry of Culture", "Anthropological Survey publications"]],
  art: ["Local Art & Origins", ["Sangeet Natak Akademi", "Lalit Kala Akademi", "GI Registry (ipindia.gov.in)", "UNESCO ICH lists", "State culture departments"]],
  craft: ["Local Craft & Craftsmen", ["GI Registry (ipindia.gov.in)", "Development Commissioner (Handicrafts)", "Padma awards portal", "Shilp Guru award lists"]],
  wars: ["Wars & Outcomes", ["Encyclopaedia Britannica", "Ministry of Defence history pages", "National War Memorial", "Academic military-history sources"]],
  vedas: ["Vedas & Knowledge Traditions", ["Academic Indology sources", "UNESCO (Vedic chanting ICH; Rigveda manuscripts Memory of the World)", "IGNCA", "MSRVVP Ujjain"]],
  folklore: ["Folk & Rural Lore", ["A.K. Ramanujan, Folktales from India", "Verrier Elwin's NE collections", "Sahapedia", "State folklore academies"]],
  heritage: ["Heritage Sites", ["UNESCO World Heritage Centre (whc.unesco.org)", "Archaeological Survey of India (asi.nic.in)", "Press Information Bureau", "State archaeology departments"]],
};

function loadJs(file, expectGlobal) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  try {
    vm.runInContext(readFileSync(file, "utf8"), ctx, { timeout: 5000 });
    return ctx.window[expectGlobal] || null;
  } catch {
    return null;
  }
}

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TABS);
const today = "2026-08-08";

for (const tab of wanted) {
  if (!TABS[tab]) { console.warn(`unknown tab: ${tab}`); continue; }

  // existing pack entries (kept where no fresh part covers the state)
  const packFile = join(root, "atlas-data", `${tab}.js`);
  let states = {};
  let meta = null;
  if (existsSync(packFile)) {
    const data = loadJs(packFile, "INDIA_DATA");
    if (data && data[tab] && data[tab].states) {
      states = { ...data[tab].states };
      meta = data[tab].meta || null;
    }
  }

  // overlay fresh parts
  let partCount = 0;
  if (existsSync(partsDir)) {
    for (const f of readdirSync(partsDir).filter(f => f.startsWith(`${tab}-`) && f.endsWith(".js")).sort()) {
      const parts = loadJs(join(partsDir, f), "INDIA_DATA_PARTS");
      if (!parts) { console.warn(`  ${f}: does not parse — skipped`); continue; }
      const key = Object.keys(parts).find(k => k.startsWith(`${tab}-`));
      const chunk = key ? parts[key] : null;
      if (!chunk || !chunk.states) { console.warn(`  ${f}: no states — skipped`); continue; }
      Object.assign(states, chunk.states);
      partCount++;
    }
  }

  const n = Object.keys(states).length;
  if (!n) { console.log(`${tab}: nothing to merge`); continue; }

  const [title, primarySources] = TABS[tab];
  const merged = {
    meta: {
      tab,
      title,
      compiledOn: today,
      coverage: n >= 36 ? "All 28 states + 8 union territories"
                        : `PARTIAL — ${n} of 36 states/UTs; research fleet still running`,
      primarySources: (meta && meta.primarySources) || primarySources,
      qc: { status: "pending", checkedOn: null, notes: (meta && meta.qc && meta.qc.notes) || "" },
    },
    states: Object.fromEntries(Object.entries(states).sort(([a], [b]) => a.localeCompare(b))),
  };

  const js =
    `// data/${tab}.js — ${title}\n` +
    `// Compiled from internet research; merged from chunked research parts on ${today}.\n` +
    `window.INDIA_DATA = window.INDIA_DATA || {};\n` +
    `window.INDIA_DATA.${tab} = ${JSON.stringify(merged, null, 2)};\n`;
  writeFileSync(packFile, js);
  console.log(`${tab}: merged ${partCount} part(s) → ${n}/36 states, ${Math.round(js.length / 1024)}KB`);
}
