// data/skills.js — Practical skill cards for the game's Library
// Each card teaches the population a trade. Content is general, well-established
// practice drawn from the same institutions the atlas packs cite; no per-state
// claims are made here.
window.INDIA_DATA = window.INDIA_DATA || {};
window.INDIA_DATA.skills = {
  meta: {
    tab: "skills",
    title: "Skills of the Land",
    compiledOn: "2026-08-27",
    coverage: "8 foundational skills",
    primarySources: [
      "Soil Health Card portal (soilhealth.dac.gov.in)",
      "ICAR — Indian Council of Agricultural Research (icar.org.in)",
      "NDDB — National Dairy Development Board / Operation Flood (nddb.coop)",
      "Development Commissioner (Handicrafts) & Development Commissioner (Handlooms), Ministry of Textiles",
      "Geographical Indications Registry (ipindia.gov.in)",
      "Aryabhata, Aryabhatiya (c. 499 CE); Brahmagupta, Brahmasphutasiddhanta (628 CE); Bhaskara II, Lilavati (c. 1150 CE) — public-domain classics of Indian mathematics"
    ],
    qc: { status: "pending", checkedOn: null, notes: "General agronomic, husbandry, craft and arithmetic practice; institutions named above." }
  },
  cards: [
    {
      id: "skill-agri-1", job: "farmer", releaseDay: 3,
      title: "Soil & the Seed", subtitle: "Agriculture I",
      recite: "Know your soil before you sow. Feed the earth, and it feeds you.",
      summary: "A field begins with its soil. Test it — the Soil Health Card tells a farmer the nitrogen, phosphorus, potassium and organic carbon under their feet — and return to it what the harvest removes: compost, green manure, crop residue. Rotate legumes into the cycle so the soil's own life fixes nitrogen. A farmer who reads the soil sows the right seed at the right depth at the right time.",
      source: "Soil Health Card portal; ICAR-IISS soil fertility guidance"
    },
    {
      id: "skill-agri-2", job: "farmer", releaseDay: 7,
      title: "Water & the Field", subtitle: "Agriculture II",
      recite: "Hold the rain where it falls. A bund, a pond, a mulch — the field drinks all year.",
      summary: "Water is the second harvest. Bund the field so rain soaks in instead of carrying the topsoil away; keep a farm pond for the dry weeks; mulch the rows so the sun cannot steal the moisture. Where canals or wells allow, water the root, not the road — drip and furrow beat flooding. Cover crops hold the slope through the monsoon.",
      source: "ICAR natural-resource management recommendations"
    },
    {
      id: "skill-cattle-1", job: "herder", releaseDay: 11,
      title: "The Cattle Keeper", subtitle: "Husbandry I",
      recite: "A clean stall, clean water, a milked cow at the same hour daily.",
      summary: "Dairy is discipline. Keep the stall dry and clean, water always within reach, and milk at the same hours every day with washed hands and vessels — the milk stays sweet and the cow stays calm. Cooperative dairying, the lesson of Operation Flood, turns every household's few litres into a village's steady income.",
      source: "NDDB — Operation Flood; dairy husbandry practice"
    },
    {
      id: "skill-cattle-2", job: "herder", releaseDay: 15,
      title: "Fodder & Herd", subtitle: "Husbandry II",
      recite: "Grow the fodder before you grow the herd.",
      summary: "An animal is only as good as its feed. Sow fodder crops and store the surplus as hay and silage before adding animals; a small well-fed herd outyields a large hungry one. Deworm and vaccinate on the calendar, not on the crisis — prevention costs a day's milk, disease costs the herd.",
      source: "ICAR animal husbandry guidance"
    },
    {
      id: "skill-craft-1", job: "artisan", releaseDay: 19,
      title: "The Loom", subtitle: "Craft I",
      recite: "Warp holds firm, weft carries the story — the loom feeds the house.",
      summary: "The handloom is a household economy in a wooden frame. A well-dressed warp, evenly beaten weft, and dyes fixed fast make cloth that markets trust; a Geographical Indication tag on a region's weave protects its name and its price. The craft passes hand to hand — an artisan who teaches an apprentice doubles the loom.",
      source: "DC (Handlooms), Ministry of Textiles; GI Registry"
    },
    {
      id: "skill-craft-2", job: "artisan", releaseDay: 23,
      title: "Clay, Cane & Bamboo", subtitle: "Craft II",
      recite: "What grows nearby, shaped well, sells far.",
      summary: "The nearest material is the honest one: river clay thrown and fired, cane and bamboo split, soaked and woven into wares every household needs. Finish decides the price — a smooth rim, a tight weave, a fast colour. Sell together: a craft cluster bargains where a lone artisan begs.",
      source: "DC (Handicrafts), Ministry of Textiles"
    },
    {
      id: "skill-arith-1", job: null, releaseDay: 5,
      title: "Counting the Harvest", subtitle: "Arithmetic I",
      recite: "Nine digits and zero write every number under heaven.",
      summary: "Place value is the people's greatest tool: with nine digits and the zero — the gift of India's mathematicians, set down by Aryabhata's school and made whole in Brahmagupta's rules — any harvest, herd or debt can be written and checked. Count what comes in, count what goes out, and no trader's thumb can tip the scale unseen.",
      source: "Aryabhatiya (c. 499 CE); Brahmasphutasiddhanta (628 CE)"
    },
    {
      id: "skill-arith-2", job: null, releaseDay: 9,
      title: "The Bazaar's Arithmetic", subtitle: "Arithmetic II",
      recite: "Rule of three: if this buys that, what buys the other?",
      summary: "Bhaskara's Lilavati taught the arithmetic of daily life in verse: proportion — the rule of three — settles every bazaar question of price and quantity; fractions divide the field fairly among heirs; simple interest shows what a loan truly costs before it is taken. Arithmetic is the poor family's lawyer.",
      source: "Bhaskara II, Lilavati (c. 1150 CE)"
    }
  ]
};
