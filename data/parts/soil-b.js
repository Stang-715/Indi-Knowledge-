// data/parts/soil-b.js — Soil Health (part B: 12 states/UTs, himachal-pradesh ... mizoram)
// Compiled from internet research on 2026-08-08. Every numeric fact is tied to a consulted source.
// Research constraint: as with part A, direct fetch of publisher and government domains was
// blocked by the egress proxy, so all content was obtained via web-search result content.
// Where a state/UT-level figure could not be verified, the entry says so explicitly and
// confidence is lowered. No numbers were invented.
// Key bulk sources consulted: ICAR-AICRP micro/secondary-nutrient survey (Shukla et al.,
// Scientific Reports 11:19760, 2021 — 2,42,827 samples, 615 districts, 28 states; all-India
// deficiency incl. latent: S 58.6%, Zn 51.2%, B 44.7%), CSE/Down To Earth analyses of Soil
// Health Card data (2025 CSE assessment: 64% of samples low in N, 48.5% low in organic carbon;
// 47% B-, 39% Zn-, 37% Fe- and 36% S-deficient; 15 states/UTs with N deficiency in 99-100% of
// samples), ICAR state profiles, state agriculture department portals (Kerala, Meghalaya) and
// state agricultural university studies.
window.INDIA_DATA_PARTS = window.INDIA_DATA_PARTS || {};
window.INDIA_DATA_PARTS["soil-b"] = {
  states: {

    "himachal-pradesh": {
      name: "Himachal Pradesh",
      summary: "Himachal's soils range from neutral coarse-textured alluvium in the Una-Indora-Paonta floodplains to acidic hill soils in Kangra, Shimla and parts of Chamba, Kullu and Mandi, where toxic aluminium, iron and manganese accompany the acidity. The ICAR-AICRP national survey found more than 60% of the state's soils deficient in available boron — its most severe verified micronutrient gap. District summaries of soil-testing data report low nitrogen in Una and Hamirpur and low phosphorus in Kangra, Una and Shimla, with erosion on steep slopes a recurring driver of nutrient loss.",
      soilTypes: [
        "Acidic brown hill soils of the mid-hills (Kangra, Shimla, parts of Chamba, Kullu, Mandi; Al/Fe/Mn toxicity reported)",
        "Alluvial floodplain soils of Una, Indora (Kangra) and Paonta (Sirmaur) — loamy sand to sandy loam, low organic matter, neutral (pH above 6.5)",
        "Forest and mountain soils of the higher Himalayan ranges (shallow, skeletal on steep slopes)"
      ],
      npk: {
        nitrogen: "Low to medium — district summaries of soil-test data report low N in Una and Hamirpur and moderate N in Kangra, Bilaspur, Shimla and Sirmaur; no verified state-wide SHC aggregate in consulted sources",
        phosphorus: "Low to medium — low P reported for Kangra, Una and Shimla; medium P in Hamirpur, Solan, Kinnaur, Kullu, Mandi and Sirmaur",
        potassium: "Medium — K deficiency is listed among the state's nutrient gaps in consulted summaries, but no state-wide tested share was verifiable"
      },
      micronutrients: {
        zinc: "Deficiency reported among the state's nutrient gaps in consulted district summaries; a verified state-wide percentage was not found",
        iron: "Not reported at state level in consulted sources; acid hill soils generally keep Fe available",
        boron: "High deficiency — more than 60% of Himachal Pradesh soils are boron-deficient (including latent) per the ICAR-AICRP survey (Shukla et al. 2021)",
        sulphur: "Deficiency flagged in consulted district summaries; no verified state-wide percentage"
      },
      organicCarbon: "Variable — floodplain alluvium is low in organic matter while site studies report high organic carbon under forest cover (e.g. Bilaspur forest nurseries); no verified state-wide SHC aggregate in consulted sources",
      currentState: "A mountain state whose mid-hill acidic soils (with Al/Fe/Mn toxicity) and severely eroding slopes coexist with productive neutral valley alluvium; boron deficiency in over 60% of soils is the state's strongest verified soil-health signal.",
      issues: [
        "Boron deficiency in more than 60% of soils (ICAR-AICRP 2021)",
        "Soil acidity with aluminium/iron/manganese toxicity in Kangra, Shimla and parts of Chamba, Kullu and Mandi",
        "Severe soil erosion on steep cultivated slopes driving N-P-K depletion",
        "Low nitrogen (Una, Hamirpur) and low phosphorus (Kangra, Una, Shimla) in district soil-test summaries"
      ],
      recommendations: [
        "Soil-test-based boron application (borax) in deficient blocks per AICRP findings",
        "Liming of strongly acidic mid-hill soils to counter Al/Fe/Mn toxicity",
        "Erosion control — terracing, cover crops and contour bunds on sloping fields",
        "Balanced NPK per Soil Health Card recommendations, with district-specific N and P correction"
      ],
      districtHighlights: [
        { district: "Kangra", note: "Acidic soils with low phosphorus; includes the Indora alluvial floodplain belt" },
        { district: "Una", note: "Alluvial floodplain soils, coarse-textured and low in nitrogen and organic matter" },
        { district: "Hamirpur", note: "Low-nitrogen soils flagged in district soil-test summaries" },
        { district: "Shimla", note: "Acidic hill soils, low phosphorus; core apple belt of the state" },
        { district: "Sirmaur", note: "Paonta valley alluvium (neutral, coarse-textured) alongside mid-hill soils with moderate N and medium P" }
      ],
      facts: [
        "More than 60% of Himachal Pradesh soils are deficient in available boron per the ICAR-AICRP survey of 2,42,827 samples (Shukla et al. 2021).",
        "Kangra and Shimla districts, plus parts of Chamba, Kullu and Mandi, have mainly acidic soils where toxic aluminium, iron and manganese hamper plant growth.",
        "Alluvial soils of Una, Indora (Kangra) and Paonta (Sirmaur) floodplains are loamy sand to sandy loam, low in organic matter and neutral (pH above 6.5).",
        "District soil-test summaries report low N in Una and Hamirpur, and low P in Kangra, Una and Shimla.",
        "Severe soil erosion is cited in consulted summaries as a key driver of the state's N, P, K, S and Zn depletion."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "Characterization of the soils of lower Himalayas of Himachal Pradesh, India", publisher: "ResearchGate (journal preprint record)", url: "https://www.researchgate.net/publication/287592619_Characterization_of_the_soils_of_lower_Himalayas_of_Himachal_Pradesh_India" },
        { title: "Type of Soil in Himachal Pradesh (district nutrient summaries)", publisher: "Jokta Academy (secondary summary of state soil-test reporting)", url: "https://joktacademy.com/type-of-soil-in-himachal-pradesh/" },
        { title: "Soil Health Card portal (state dashboards)", publisher: "Dept. of Agriculture & Farmers Welfare, GoI", url: "https://soilhealth.dac.gov.in/" }
      ],
      confidence: "medium",
      media: []
    },

    "jammu-kashmir": {
      name: "Jammu & Kashmir",
      summary: "Jammu & Kashmir's farm soils span the alluvial outer plains of Jammu, the lacustrine karewa (silty clay-loam) uplands of the Kashmir valley famed for saffron, and mountain forest soils. The ICAR-AICRP survey found boron the UT's most deficient micronutrient — over 60% of soils deficient, 12.1% acutely so — with manganese deficient in more than 20%. Orchard-belt studies report low-to-medium nitrogen, medium-to-high phosphorus and high potassium, with organic carbon 1.52-2.78% in Kulgam apple soils.",
      soilTypes: [
        "Alluvial soils of the Jammu outer plains and kandi belt",
        "Karewa (lacustrine) silty clay-loam soils of the Kashmir valley uplands — saffron and orchard belt",
        "Mountain forest and meadow soils of the middle and higher Himalayas"
      ],
      npk: {
        nitrogen: "Low to medium — available N was low to medium in Kashmir pear- and apple-orchard soil studies; no UT-wide SHC aggregate was verifiable in consulted sources",
        phosphorus: "Medium to high — orchard-belt studies report medium to high available P; declining available P is however linked to falling saffron yield on karewas",
        potassium: "High — available K tested high in Kashmir orchard soil studies"
      },
      micronutrients: {
        zinc: "Not verified at UT level in consulted sources; a Bhimber (PoJK) district survey found Zn low at 26.66% of sites",
        iron: "Not reported at UT level in consulted sources",
        boron: "High deficiency — more than 60% of J&K soils are boron-deficient (including latent), 12.1% acutely deficient (ICAR-AICRP, Shukla et al. 2021)",
        sulphur: "Not reported at UT level in consulted sources; manganese, by contrast, is deficient in more than 20% of soils (3.5% acute) per the same survey"
      },
      organicCarbon: "Medium to high in the orchard belt — Kulgam apple-orchard soils recorded organic carbon of 1.52-2.78% with pH 4.97-6.24; decline in soil organic matter is reported on saffron karewas",
      currentState: "Orchard and saffron soils of the Kashmir valley remain inherently fertile but karewa lands are being lost to construction and show declining organic matter and phosphorus, while boron deficiency (over 60% of soils) is the UT's most widespread verified nutrient gap.",
      issues: [
        "Boron deficiency in more than 60% of soils, 12.1% acute (ICAR-AICRP 2021)",
        "Manganese deficiency in more than 20% of soils",
        "Declining soil organic matter and available phosphorus on saffron karewas, associated with falling saffron output",
        "Loss of fertile karewa soils to brick kilns and infrastructure (documented by Mongabay-India)"
      ],
      recommendations: [
        "Soil-test-based boron application in orchard and field crops per AICRP findings",
        "Organic-matter restoration (FYM, residue mulch) on karewa saffron soils",
        "Protect karewa agricultural land from excavation and construction",
        "Balanced fertilisation in apple belts — N correction where low, avoiding excess P and K which already test medium-high"
      ],
      districtHighlights: [
        { district: "Pulwama", note: "Pampore karewa uplands — India's saffron heartland on lacustrine silty soils" },
        { district: "Kulgam", note: "Apple-orchard soils with pH 4.97-6.24 and organic carbon 1.52-2.78% (silty clay loam to loam)" },
        { district: "Baramulla", note: "North Kashmir high-density apple belt; orchard soil characterisation studies" },
        { district: "Jammu", note: "Outer-plain alluvial and kandi-belt soils, distinct from the valley's karewa lands" }
      ],
      facts: [
        "More than 60% of J&K soils are boron-deficient (12.1% acutely) and more than 20% manganese-deficient (3.5% acutely) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "Kulgam apple-orchard soils range from silty clay loam to loam with pH 4.97-6.24 and organic carbon 1.52-2.78%.",
        "Kashmir orchard studies report available N low to medium, P medium to high and K high.",
        "Kashmir's karewas — lacustrine silt-clay uplands at about 1,585-1,677 m — support the country's only saffron cultivation, and declining soil organic matter and available P is associated with declining saffron yield.",
        "Mongabay-India documents ongoing destruction of nutrient-rich karewa soils by excavation for construction."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "Effect of Physico-Chemical Properties of Soil on Available Soil Nutrients in Apple Orchards of District Kulgam", publisher: "Current World Environment", url: "http://www.cwejournal.org/vol13no2/effect-of-physico-chemical-properties-of-soil-on-available-soil-nutrients-in-apple-orchards-of-district-kulgam" },
        { title: "Geochemical Characterization of Saffron Growing Karewa Soils of Kashmir Valley, Western Himalaya", publisher: "Earth Systems and Environment (Springer)", url: "https://link.springer.com/article/10.1007/s41748-024-00482-1", year: 2024 },
        { title: "Nourishing soils of Kashmir's karewas crumble under infrastructure", publisher: "Mongabay-India", url: "https://india.mongabay.com/2023/01/nourishing-soils-of-kashmirs-karewas-crumble-under-infrastructure/", year: 2023 }
      ],
      confidence: "medium",
      media: []
    },

    "jharkhand": {
      name: "Jharkhand",
      summary: "Red soils blanket about 90% of Jharkhand — the hot subhumid East India Plateau (agro-ecological zone 12) of red and lateritic soils — with exceptions only in the Damodar trough and the Rajmahal trap country. These acidic soils have low cation-exchange capacity, poor inherent fertility, strong phosphorus fixation and aluminium toxicity. The ICAR-AICRP survey found more than 60% of the state's soils sulphur-deficient, and boron deficiency stands at 60% — among the highest in India.",
      soilTypes: [
        "Red soils (about 90% of the state; dominant on the Chotanagpur plateau)",
        "Lateritic soils on plateau summits and interfluves",
        "Alluvial/colluvial soils of the Damodar trough and river basins",
        "Trap-derived soils of the Rajmahal hills area"
      ],
      npk: {
        nitrogen: "Low — red and lateritic soils of the plateau are deficient in nitrogen and organic matter per consulted characterisations; no verified state-wide SHC percentage in consulted sources",
        phosphorus: "Low — poor inherent fertility with strong P fixation is listed among the region's major constraints (acid soils rich in Fe/Al oxides)",
        potassium: "Medium — K was not among the flagged constraints in consulted East India Plateau studies; no state-wide tested share verified"
      },
      micronutrients: {
        zinc: "Deficiency present but below the worst states — Jharkhand is not in the ICAR-AICRP list of states with more than 50% zinc-deficient soils",
        iron: "Not reported as a state-level constraint in consulted sources (acid soils generally keep Fe available)",
        boron: "High deficiency — 60.0% of Jharkhand soils are boron-deficient (PwC 2019 compilation of AICRP data); B deficiency is characteristic of the state's acid red and lateritic soils",
        sulphur: "High deficiency — more than 60% of Jharkhand soils are sulphur-deficient (including latent) per the ICAR-AICRP survey (Shukla et al. 2021)"
      },
      organicCarbon: "Low — red-lateritic plateau soils are characterised as low in organic matter, with surface crusting and erosion further depleting carbon; no verified state-wide SHC aggregate in consulted sources",
      currentState: "An acid red-soil plateau state where sulphur (>60%) and boron (60%) deficiencies, P fixation and aluminium toxicity constrain rainfed agriculture; Birsa Agricultural University runs acidity-tolerance trials for rainfed rice lands.",
      issues: [
        "Sulphur deficiency in more than 60% of soils and boron deficiency in 60% (AICRP data)",
        "Soil acidity with aluminium toxicity and 'poor inherent fertility' on red-lateritic soils",
        "Strong phosphorus fixation by iron/aluminium oxides",
        "Surface crusting and soil erosion on the undulating plateau (toposequence fertility gradients documented on the East India Plateau)"
      ],
      recommendations: [
        "Liming of acid soils to reduce aluminium toxicity and unlock phosphorus",
        "Soil-test-based sulphur (gypsum/SSP) and boron (borax) application per AICRP findings",
        "Grow acidity-tolerant genotypes in rainfed medium-lowlands (Birsa Agricultural University trials at ZARS Dumka)",
        "Organic-matter build-up and erosion control (bunding, cover crops) along plateau toposequences"
      ],
      districtHighlights: [
        { district: "Ranchi", note: "Seat of Birsa Agricultural University on the red-lateritic Chotanagpur plateau" },
        { district: "Dumka", note: "Zonal Agricultural Research Station running trials of acidity-tolerant rice genotypes (kharif 2018)" },
        { district: "Khunti", note: "District-level assessment of available micro, secondary and pollutant elements published for its soils" },
        { district: "Dhanbad", note: "Damodar trough — one of the few tracts outside the state's red-soil blanket" },
        { district: "Sahibganj", note: "Rajmahal hills trap country — the other main exception to the red-soil cover" }
      ],
      facts: [
        "Red soil covers about 90% of Jharkhand, except the narrow Damodar trough and the Rajmahal area.",
        "More than 60% of Jharkhand soils are sulphur-deficient per the ICAR-AICRP survey (Shukla et al. 2021).",
        "Boron deficiency stands at 60.0% of soils (PwC 2019 compilation), among the highest in India, concentrated in acid red and lateritic soils.",
        "Major constraints of the region's red-lateritic soils: surface crusting, poor inherent fertility, P fixation, aluminium toxicity and erosion.",
        "Jharkhand falls in agro-ecological zone 12 — hot subhumid East India Plateau with red and lateritic soils."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "All for a good harvest: Addressing micronutrient deficiencies", publisher: "PwC India", url: "https://www.pwc.in/assets/pdfs/research-insights/2019/all-for-a-good-harvest.pdf", year: 2019 },
        { title: "Soil fertility along toposequences of the East India Plateau and implications for productivity, fertiliser use, and sustainability", publisher: "SOIL (Copernicus)", url: "https://soil.copernicus.org/articles/6/325/2020/", year: 2020 },
        { title: "Assessing the Status of Available Micro, Secondary and Pollutant Elements in Soil of Khunti District, Jharkhand", publisher: "International Journal of Ecology and Environmental Sciences", url: "https://nieindia.org/Journal/index.php/ijees/article/view/1351" }
      ],
      confidence: "medium",
      media: []
    },

    "karnataka": {
      name: "Karnataka",
      summary: "Karnataka's four soil families — red soils over the largest area, black soils across the northern districts, laterites on the coast and Malnad, and coastal alluvium — carry one of India's heaviest multi-nutrient deficiency loads. The ICAR-AICRP survey lists Karnataka among the 13 states with more than 50% of soils zinc-deficient and flags it (with Bihar, Goa and Odisha) for high combined S+Zn+B deficiency, and (with Gujarat, Maharashtra and Rajasthan) for high combined Zn+Fe deficiency. In the Malaprabha right-bank command more than 95% of analysed samples were zinc-deficient.",
      soilTypes: [
        "Red soils (largest area; red loamy and red sandy of the southern maidan)",
        "Black cotton soils of the northern districts (basalt- and gneiss-derived Vertisols)",
        "Laterite and lateritic soils of coastal Karnataka and the Malnad",
        "Coastal alluvial soils"
      ],
      npk: {
        nitrogen: "Low — black soils of the north are deficient in nitrogen and organic matter, and red soils carry little humus per consulted characterisations; no verified state-wide SHC percentage found",
        phosphorus: "Low to medium — P deficiency accompanies the low-OC red and black soils in consulted fertility summaries; no state-wide tested share verified",
        potassium: "Medium to high — black soils are reported deficient in potash in consulted summaries, but red-soil tracts generally test medium-high; no state-wide aggregate verified"
      },
      micronutrients: {
        zinc: "High deficiency — Karnataka is among the 13 states with more than 50% of soils zinc-deficient (ICAR-AICRP 2021); over 95% of samples in the Malaprabha right-bank command tested Zn-deficient",
        iron: "Deficient — Karnataka is one of four states (with Gujarat, Maharashtra, Rajasthan) flagged for relatively high combined Zn+Fe deficiency",
        boron: "Deficient — Karnataka is one of four states (with Bihar, Goa, Odisha) flagged for high combined S+Zn+B deficiency",
        sulphur: "Deficient — same AICRP combined-deficiency flag (S+Zn+B); no separate state percentage verified in consulted sources"
      },
      organicCarbon: "Low — a consulted Karnataka fertility summary (KVK/SHC-based) reports about 64% of samples deficient in organic carbon (below 0.5%) and 21% medium (0.5-0.75%)",
      currentState: "Intensive cropping on low-OC red and black soils has produced stacked deficiencies — zinc in over half the state's soils plus sulphur, boron and iron — making Karnataka one of the AICRP survey's most multi-deficient states.",
      issues: [
        "Zinc deficiency in more than 50% of soils; over 95% of samples Zn-deficient in the Malaprabha right-bank command",
        "High combined S+Zn+B and Zn+Fe deficiencies (among the worst four states on both AICRP combinations)",
        "Organic carbon deficient in about 64% of samples in consulted SHC-based summaries",
        "Low nitrogen and potash in northern black-soil districts"
      ],
      recommendations: [
        "Soil-test-based zinc sulphate application, especially in command-area rice and maize",
        "Sulphur and boron correction (gypsum, borax) in oilseed, pulse and plantation systems",
        "Organic-carbon restoration via residue recycling, FYM and green manure on red soils",
        "Balanced NPK per Soil Health Card recommendations instead of urea-heavy dosing"
      ],
      districtHighlights: [
        { district: "Belagavi", note: "Malaprabha right-bank command, where more than 95% of analysed soil samples were zinc-deficient" },
        { district: "Vijayapura", note: "Northern black-cotton-soil district, low in N, potash and organic matter" },
        { district: "Dakshina Kannada", note: "Coastal laterite belt — acidic, leached soils of the high-rainfall coast" },
        { district: "Bengaluru Rural", note: "Red loamy soils characterised by UAS Bangalore; grape-belt soils are deep, dark red with low-medium organic carbon" }
      ],
      facts: [
        "Karnataka is among the 13 states where the ICAR-AICRP survey found more than 50% of soils zinc-deficient.",
        "The AICRP survey flags Karnataka for high combined S+Zn+B deficiency (with Bihar, Goa, Odisha) and high combined Zn+Fe deficiency (with Gujarat, Maharashtra, Rajasthan).",
        "More than 95% of soil samples in the Malaprabha right-bank command were zinc-deficient (meta-analysis of Karnataka zinc studies).",
        "A consulted Karnataka fertility summary reports about 64% of samples deficient in organic carbon (<0.5%).",
        "Red soils cover the largest part of Karnataka; black soils dominate the northern districts and laterites the coast and Malnad."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "Zinc Status in the Soils of Karnataka and Response of Horticultural Crops to Zinc Application: A Meta-analysis", publisher: "Journal (via Redalyc)", url: "https://www.redalyc.org/journal/5770/577062030002/html/" },
        { title: "Soil zinc surveillance frameworks can inform human nutrition studies: opportunities in India", publisher: "Frontiers in Soil Science", url: "https://www.frontiersin.org/journals/soil-science/articles/10.3389/fsoil.2024.1421652/full", year: 2024 },
        { title: "Soils & Their Fertility Status", publisher: "KLE KVK (Karnataka)", url: "https://www.klekvk.org/soils-their-fertility-status/" }
      ],
      confidence: "high",
      media: []
    },

    "kerala": {
      name: "Kerala",
      summary: "Laterite and associated red soils spread over about 70% of Kerala, and the state's defining soil-health fact is acidity: more than 90% of Kerala soils have acid reaction, with 54% extremely to strongly acidic (pH 3.5-5.5). Sesquioxide-rich profiles fix 90-95% of applied phosphorus, and extensive deficiencies of calcium, magnesium and boron are documented, while available P and K in soils generally test medium to high. The CSE/SHC assessment also places Kerala among the 15 states/UTs with nitrogen deficiency in 99-100% of tested samples.",
      soilTypes: [
        "Laterite soils (dominant; with associated red soils about 70% of the state's area)",
        "Coastal sandy soils (including the Onattukara sandy tract)",
        "Riverine and coastal alluvium",
        "Kuttanad acid saline / acid sulphate soils (below-sea-level farmlands)",
        "Black soil pocket of Chittur (Palakkad) and forest loams of the high ranges"
      ],
      npk: {
        nitrogen: "Low — Kerala is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        phosphorus: "Medium to high in available terms, but acid sesquioxide-rich soils fix 90-95% of applied P, so response to fresh P is poor without liming (Kerala soil-fertility portal)",
        potassium: "Medium to high — available K is in the medium-to-high range per the Kerala soil-fertility portal"
      },
      micronutrients: {
        zinc: "Deficiency present in pockets — zinc sulphate application is among Kerala Agricultural University's correction recommendations; no verified state-wide percentage in consulted sources",
        iron: "Generally adequate to excessive in acid laterites; toxicity rather than deficiency is the concern in waterlogged acid-sulphate tracts (not verified as a state-wide figure)",
        boron: "Deficient — extensive boron deficiency is documented; KAU recommends borax at 1.5 kg/ha for correction",
        sulphur: "Not reported as a leading state-wide deficiency in consulted sources; Ca and Mg (secondary nutrients) are the documented extensive deficiencies"
      },
      organicCarbon: "Medium to high in high-rainfall laterite and forest tracts, but rapid decomposition and leaching keep fertility low; no verified state-wide SHC aggregate in consulted sources",
      currentState: "Kerala's humid-tropical laterite soils are chronically acid (more than 90% of soils), phosphorus-fixing and depleted of bases — calcium and magnesium deficiency is near-universal — so liming plus Mg and B correction now headline the state's soil-health agenda.",
      issues: [
        "Acidity in over 90% of soils; 54% extremely to strongly acidic (pH 3.5-5.5)",
        "Phosphorus fixation of 90-95% by sesquioxide-rich acid profiles",
        "Extensive calcium and magnesium deficiency; magnesium deficient at almost all tested locations",
        "Boron and copper deficiency documented across the state",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis); acid-sulphate stress in Kuttanad paddy lands"
      ],
      recommendations: [
        "Liming (lime/dolomite) for soils below pH 5.5, per Kerala Agricultural University package of practices",
        "Magnesium supplementation (dolomite or magnesium sulphate) wherever deficiency is confirmed",
        "Borax at 1.5 kg/ha and copper/zinc sulphate where deficient, per KAU recommendations",
        "Split, soil-test-based N and P management to beat fixation losses on laterites"
      ],
      districtHighlights: [
        { district: "Alappuzha", note: "Kuttanad below-sea-level acid saline/acid sulphate paddy soils; also part of the Onattukara sandy tract" },
        { district: "Palakkad", note: "Kerala's granary; includes the Chittur black-soil pocket, an outlier among laterites" },
        { district: "Kasaragod", note: "Deep laterite terrain typical of the northern Kerala laterite belt studied for soil acidity" },
        { district: "Wayanad", note: "High-range forest-loam and hill soils under plantation agriculture" }
      ],
      facts: [
        "More than 90% of Kerala soils have acid reaction; 54% are extremely to strongly acidic (pH 3.5-5.5).",
        "Kerala's acid, sesquioxide-rich soils fix applied phosphorus to the tune of 90-95%.",
        "Red and laterite associated soils are distributed over about 70% of Kerala's geographical area.",
        "Extensive deficiencies of Ca, Mg and boron are documented; Mg is deficient at almost all tested locations, and KAU recommends borax at 1.5 kg/ha.",
        "Kerala is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE/DTE analysis)."
      ],
      sources: [
        { title: "Soil Related Constraints — Laterites", publisher: "Kerala Soil Fertility portal, Dept. of Agriculture Development & Farmers' Welfare, Govt. of Kerala", url: "https://www.keralasoilfertility.net/en/laterites.jsp" },
        { title: "Soils of Kerala", publisher: "Kerala Soil Survey Organisation, Govt. of Kerala", url: "https://www.keralasoils.gov.in/en/soils-kerala" },
        { title: "CSE assessment: Indian soils severely deficient in key nutrients", publisher: "Down To Earth / Centre for Science and Environment", url: "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients", year: 2025 },
        { title: "KAU Package of Practices Recommendations: Crops — Appendices", publisher: "Kerala Agricultural University", url: "https://pop.kau.in/appendix14.htm", year: 2011 }
      ],
      confidence: "high",
      media: []
    },

    "ladakh": {
      name: "Ladakh",
      summary: "Ladakh's cold-arid desert soils are sandy to sandy-loam, gravelly, shallow and weakly formed, with very low organic carbon (0.16-0.58%) and low cation-exchange capacity (2.6-3.6 cmol(p+)/kg). Over 90% of tested samples fall between pH 7 and 9 — a predominantly alkaline high-altitude desert profile (Leh sites range pH 5.65-10.12, Kargil 6.57-9.47). Available phosphorus and potassium are low, and deficiencies of iron, zinc and manganese are reported; systematic soil-survey coverage of the UT remains thin, so confidence is low.",
      soilTypes: [
        "Cold-arid desert soils — sandy to sandy loam with gravels and pebbles (dominant)",
        "Weakly developed alluvial/colluvial valley soils along the Indus and side valleys",
        "Barren scree and moraine material at higher elevations"
      ],
      npk: {
        nitrogen: "Low — organic-matter-poor desert soils supply little nitrogen; no UT-wide SHC aggregate was verifiable in consulted sources",
        phosphorus: "Low — availability of phosphorus is reported low in cold-arid Ladakh soil studies",
        potassium: "Low — availability of potash is likewise reported low in the same studies"
      },
      micronutrients: {
        zinc: "Deficient — Leh and Kargil soils are reported deficient in zinc",
        iron: "Deficient — iron deficiency reported for Leh and Kargil soils (alkaline calcareous conditions)",
        boron: "Not reported in consulted sources for the UT",
        sulphur: "Not reported in consulted sources for the UT"
      },
      organicCarbon: "Very low — 0.16-0.58% organic carbon reported, with low CEC (2.6-3.6 cmol(p+)/kg); conversion of barren land to tree plantation and agriculture measurably raises SOC (2025 Trans-Himalayan land-use study)",
      currentState: "A high-altitude cold desert where shallow, alkaline, gravelly soils with almost no organic matter support small irrigated oases; greening (plantations, polyhouse agriculture) is documented to improve soil carbon and nutrient status, but published soil-testing coverage is sparse.",
      issues: [
        "Very low organic carbon (0.16-0.58%) and low CEC in cold-arid soils",
        "Alkalinity — over 90% of samples between pH 7 and 9 — restricting Fe, Zn and Mn availability",
        "Low available phosphorus and potassium",
        "Shallow, friable, erosion-prone soil formation under extreme aridity; thin soil-survey coverage since UT formation (2019)"
      ],
      recommendations: [
        "Build organic matter with FYM/compost in oasis fields and polyhouses (documented fertility gains under polyhouse cultivation)",
        "Convert suitable barren land to tree plantation/agriculture, which raises SOC and nutrient status (2025 study)",
        "Chelated or soil-applied Fe and Zn correction on alkaline soils where crops show deficiency",
        "Expand Soil Health Card sampling to build a UT-wide fertility baseline"
      ],
      districtHighlights: [
        { district: "Leh", note: "Soil pH at tested sites spans 5.65-10.12; polyhouse soil-fertility studies conducted here" },
        { district: "Kargil", note: "Soil pH 6.57-9.47; sandy to sandy-loam gravelly soils described in the district profile" }
      ],
      facts: [
        "Ladakh soils are sandy to sandy loam with gravels, low in organic carbon (0.16-0.58%) and low in CEC (2.6-3.6 cmol(p+)/kg).",
        "Over 90% of soil samples from the region test between pH 7 and 9 — a predominantly alkaline cold-desert profile.",
        "Leh and Kargil soils are reported deficient in iron, zinc and manganese, with low available phosphorus and potash.",
        "A 2025 Trans-Himalayan study found tree-plantation and agricultural land richer in SOC and nutrients than barren land, showing restoration potential.",
        "Ladakh (UT since 2019) lay outside the 28-state ICAR-AICRP micronutrient survey frame; published soil-testing data remain thin."
      ],
      sources: [
        { title: "Soil Nutrient Status Under Different Agro-Climatic Zones of Kashmir and Ladakh, India", publisher: "Current World Environment", url: "http://www.cwejournal.org/vol11no1/soil-nutrient-status-under-different-agro-climatic-zones-of-kashmir-and-ladakh-india" },
        { title: "Status of available nutrients in soils of Cold Arid region of Ladakh", publisher: "ResearchGate (journal record)", url: "https://www.researchgate.net/publication/281288082_Status_of_available_nutrients_in_soils_of_Cold_Arid_region_of_Ladakh" },
        { title: "Influence of vegetation and land use on soil organic carbon (SOC) and nutrient status in the cold, arid climate of Ladakh Trans-Himalayan region, India", publisher: "Discover Soil (Springer)", url: "https://link.springer.com/article/10.1007/s44378-025-00122-8", year: 2025 },
        { title: "About District — Kargil", publisher: "District Kargil, UT of Ladakh (kargil.nic.in)", url: "https://kargil.nic.in/about-district/" }
      ],
      confidence: "low",
      media: []
    },

    "lakshadweep": {
      name: "Lakshadweep",
      summary: "Lakshadweep's soils form from fragmentation of coral limestone — carbonate-rich, near-neutral in reaction and inherently poor in plant nutrients. The islands were declared organic decades ago; coconut, the mainstay crop, receives no external fertiliser, yet productivity is among India's highest because biomass recycling by soil microbiota returns roughly twice the palms' nitrogen requirement, an extra 20% phosphorus to already P-rich soils and 43-45% of potassium needs. The UT lies outside the ICAR-AICRP micronutrient survey and published soil-testing data are minimal, so confidence is low.",
      soilTypes: [
        "Coral-derived calcareous sandy soils (dominant; carbonate-rich, formed from coral limestone fragmentation)",
        "Shallow coral-sand loams under coconut groves and settlement gardens"
      ],
      npk: {
        nitrogen: "Low inherently — calcareous coral soils generally lack nitrogen, but coconut residue recycling is documented to return about twice the palms' N requirement",
        phosphorus: "High — the islands' soils are described as already P-rich, with biomass recycling adding a further ~20%",
        potassium: "Medium — 43-45% of the coconut palms' K requirement is met by recycled biomass; no UT-wide tested aggregate exists in consulted sources"
      },
      micronutrients: {
        zinc: "Not reported — outside the ICAR-AICRP survey; calcareous soils are generically prone to Zn deficiency (FAO), but no UT-specific measurement was found",
        iron: "Not reported for the UT; iron availability is generically constrained in calcareous soils (FAO)",
        boron: "Not reported in consulted sources for the UT",
        sulphur: "Not reported in consulted sources for the UT"
      },
      organicCarbon: "Not verified UT-wide — coconut biomass residues returned to the soil add substantial organic carbon per the 2022 nutrient-recycling study, but no SHC-style aggregate was found",
      currentState: "A fully organic coral-atoll UT where nutrient-poor calcareous sands nonetheless sustain some of India's highest coconut productivity through internal nutrient cycling; formal soil-testing coverage is minimal.",
      issues: [
        "Inherently nutrient-poor, carbonate-rich coral sands (low N, low water/nutrient retention)",
        "Generic calcareous-soil constraints on iron, zinc and phosphorus availability (FAO)",
        "Very thin published soil-testing and micronutrient data — outside the AICRP survey frame",
        "Soil erosion limits are a concern on small low-lying atolls (dedicated erosion-limits study exists)"
      ],
      recommendations: [
        "Continue returning coconut biomass residues to the soil — documented to meet most palm nutrient needs",
        "Compost/green-manure enrichment for vegetable gardens on coral sands, consistent with the UT's organic status",
        "Monitor Fe/Zn nutrition of crops given generic calcareous-soil constraints",
        "Extend Soil Health Card sampling to island farms to create a baseline dataset"
      ],
      districtHighlights: [
        { district: "Lakshadweep (single district)", note: "The UT is one district; Kavaratti is the headquarters island" },
        { district: "Minicoy (island subdivision)", note: "Southern atoll; coconut-dominated coral-sand soils like the rest of the UT" },
        { district: "Andrott (island subdivision)", note: "Coconut groves on coral-derived calcareous soils; no external fertiliser used" }
      ],
      facts: [
        "Lakshadweep soils form from fragmentation of coral limestone — carbonate-rich, neutral pH, poor in plant nutrients (2022 study).",
        "The islands were declared organic decades ago; coconut is grown without external fertiliser or major plant protection.",
        "Coconut biomass recycling returns about twice the needed nitrogen, an extra 20% phosphorus to already P-rich soils, and 43-45% of potassium requirements.",
        "Lakshadweep has one of the highest coconut productivities among Indian coconut-growing regions despite nutrient-poor soils.",
        "The UT lies outside the 28-state ICAR-AICRP micronutrient survey; published soil-test data are minimal."
      ],
      sources: [
        { title: "Autochthonous nutrient recycling driven by soil microbiota could be sustaining high coconut productivity in Lakshadweep Islands sans external fertilizer application", publisher: "PubMed (indexed journal article)", url: "https://pubmed.ncbi.nlm.nih.gov/36053362/", year: 2022 },
        { title: "Calcareous soils — management of problem soils", publisher: "FAO Soils Portal", url: "https://www.fao.org/soils-portal/soil-management/management-of-some-problem-soils/calcareous-soils/en/" },
        { title: "Soil erosion limits for Lakshadweep Archipelago", publisher: "ResearchGate (journal record)", url: "https://www.researchgate.net/publication/264086707_Soil_erosion_limits_for_Lakshadweep_Archipelago" }
      ],
      confidence: "low",
      media: []
    },

    "madhya-pradesh": {
      name: "Madhya Pradesh",
      summary: "Madhya Pradesh — home of ICAR-IISS Bhopal — is India's black-soil heartland: state agriculture-department figures put deep-medium black soils at 36.53% of area across 33 districts, shallow-medium black at 6.91%, mixed red-and-black at 18.30% and alluvium at 7.57%, with red-yellow soils across the east. The ICAR-AICRP survey found more than 60% of MP soils sulphur-deficient and more than 50% zinc-deficient (20.3% acutely), and the CSE/SHC analysis places MP among the 15 states with nitrogen deficiency in 99-100% of samples.",
      soilTypes: [
        "Deep and medium black soils (36.53% of area, 33 districts — Narmada valley, Malwa plateau, Satpura belt)",
        "Mixed red and black soils (18.30%)",
        "Red and yellow soils of eastern MP (Baghelkhand tract)",
        "Alluvial soils of the north-west (7.57% — Morena, Bhind, Gwalior, Shivpuri)",
        "Shallow and medium black soils (6.91%)"
      ],
      npk: {
        nitrogen: "Low — MP is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        phosphorus: "Low to medium — Vertisols of MP are reported increasingly deficient in phosphorus in consulted fertility reviews",
        potassium: "Medium to high — smectitic black soils are inherently K-rich; K was not flagged among MP's leading deficiencies in consulted sources"
      },
      micronutrients: {
        zinc: "High deficiency — more than 50% of MP soils zinc-deficient, 20.3% acutely deficient (ICAR-AICRP, Shukla et al. 2021)",
        iron: "Deficiency present in calcareous black-soil tracts but below the levels of S and Zn; no verified state percentage in consulted sources",
        boron: "Not among MP's flagged top deficiencies in consulted AICRP reporting; no state percentage verified",
        sulphur: "High deficiency — more than 60% of MP soils sulphur-deficient (including latent), critical for the soybean belt (ICAR-AICRP 2021)"
      },
      organicCarbon: "Low in intensively cropped tracts — MP's near-universal SHC nitrogen deficiency tracks low organic carbon; no separate verified state OC percentage in consulted sources",
      currentState: "The soybean-wheat engine on Malwa and Narmada-valley Vertisols is drawing down sulphur (deficient in over 60% of soils) and zinc (over 50%), while SHC data show nitrogen deficient in virtually all samples — balanced fertilisation is the state's central soil-health task.",
      issues: [
        "Sulphur deficiency in more than 60% of soils — acute for the soybean-based cropping system",
        "Zinc deficiency in more than 50% of soils (20.3% acute)",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis)",
        "Phosphorus decline reported in intensively cropped Vertisols; seasonal waterlogging/cracking behaviour of deep black soils"
      ],
      recommendations: [
        "Sulphur fertilisation (gypsum/SSP/elemental S) in soybean-wheat rotations per AICRP findings",
        "Soil-test-based zinc sulphate application in deficient blocks",
        "Residue retention, FYM and green manuring to rebuild organic carbon and N supply",
        "Follow Soil Health Card dose recommendations; ICAR-IISS Bhopal maintains state fertility maps (e-Atlas)"
      ],
      districtHighlights: [
        { district: "Narmadapuram", note: "Deep black soils of the Narmada valley — among the state's most productive Vertisol tracts" },
        { district: "Indore", note: "Malwa plateau black soils; core of the soybean belt facing S and Zn drawdown" },
        { district: "Bhopal", note: "Headquarters of ICAR-Indian Institute of Soil Science, which led the 2,42,827-sample AICRP survey" },
        { district: "Morena", note: "North-western alluvial soil tract (with Bhind, Gwalior and Shivpuri)" },
        { district: "Gwalior", note: "Alluvial soils of the Gird region, distinct from the state's black-soil core" }
      ],
      facts: [
        "MP agriculture-department figures: deep-medium black soils 36.53% of area (33 districts), shallow-medium black 6.91%, mixed red-black 18.30%, alluvial 7.57%.",
        "More than 60% of MP soils are sulphur-deficient and more than 50% zinc-deficient (20.3% acutely) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "MP is among the 15 states/UTs with nitrogen deficiency in 99-100% of SHC samples (CSE/DTE analysis).",
        "Medium and deep black soils dominate the Narmada valley, Malwa plateau and Satpura range, with 20-60% clay and 1-2 m depth.",
        "ICAR-IISS, the national soil-science institute that runs the AICRP micronutrient network, is headquartered at Bhopal."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "Soil of Madhya Pradesh: types, features (relaying Dept. of Farmer Welfare & Agriculture Development, GoMP data)", publisher: "Testbook (secondary summary of MP agriculture dept. figures)", url: "https://testbook.com/mppsc-preparation/types-of-soil-in-madhya-pradesh" },
        { title: "CSE assessment: Indian soils severely deficient in key nutrients", publisher: "Down To Earth / Centre for Science and Environment", url: "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients", year: 2025 },
        { title: "ICAR-IISS Soil Fertility e-Atlas", publisher: "ICAR-Indian Institute of Soil Science, Bhopal", url: "https://www.iiss.res.in/e-Atlas/" }
      ],
      confidence: "high",
      media: []
    },

    "maharashtra": {
      name: "Maharashtra",
      summary: "More than 90% of Maharashtra is Deccan basalt, and black soils derived from it cover roughly three-fourths of the state, with laterites on the Konkan-Sahyadri fringe and saline patches in several districts. The ICAR-AICRP survey places Maharashtra among the 13 states with more than 50% of soils zinc-deficient (9.9% acutely) and finds more than 60% of its soils sulphur-deficient; it is also flagged (with Gujarat, Karnataka, Rajasthan) for high combined Zn+Fe deficiency. Consulted fertility reviews report the Vertisols increasingly deficient in phosphorus and zinc.",
      soilTypes: [
        "Black cotton soils (Vertisols) from Deccan basalt — about three-fourths of the state per consulted summaries",
        "Laterite and lateritic soils of the Konkan coast and Sahyadri crest",
        "Coarse shallow (murrum) soils on basalt uplands",
        "Saline-alkaline patches (reported in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule, Solapur) and coastal saline soils"
      ],
      npk: {
        nitrogen: "Low — black soils are inherently low in nitrogen and organic matter per consulted characterisations; no verified state-wide SHC percentage found",
        phosphorus: "Low — Vertisols of Maharashtra are reported increasingly deficient in phosphorus in consulted fertility reviews",
        potassium: "Medium to high — smectitic black soils are generally well supplied with K; K was not flagged among the state's leading deficiencies in consulted sources"
      },
      micronutrients: {
        zinc: "High deficiency — Maharashtra is among the 13 states with more than 50% of soils zinc-deficient; 9.9% acutely deficient (ICAR-AICRP 2021)",
        iron: "Deficient — Maharashtra is one of four states flagged for relatively high combined Zn+Fe deficiency (calcareous black-soil chemistry limits Fe)",
        boron: "Not flagged among Maharashtra's leading deficiencies in consulted AICRP reporting; no state percentage verified",
        sulphur: "High deficiency — more than 60% of Maharashtra soils sulphur-deficient (including latent) per the ICAR-AICRP survey"
      },
      organicCarbon: "Low in cropped black-soil tracts — low organic matter is part of the standard characterisation of the state's Vertisols; no verified state-wide SHC aggregate in consulted sources",
      currentState: "Maharashtra's basalt-derived black soils, farmed intensively for cotton, soybean and sugarcane, now show sulphur deficiency in over 60% and zinc deficiency in over half of surveyed soils, with irrigation-linked salinity patches in sugarcane districts adding a degradation front.",
      issues: [
        "Sulphur deficiency in more than 60% of soils (ICAR-AICRP 2021)",
        "Zinc deficiency in more than 50% of soils (9.9% acute); combined Zn+Fe deficiency among India's highest",
        "Phosphorus and organic-matter decline in intensively cropped Vertisols",
        "Saline/alkaline soil patches in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule and Solapur; erosion on basalt uplands"
      ],
      recommendations: [
        "Sulphur sources (gypsum/SSP) in oilseed-pulse-cotton systems per AICRP findings",
        "Soil-test-based zinc sulphate and iron management on calcareous black soils",
        "Organic-carbon build-up (residue retention, FYM, green manure) on Vertisols",
        "Drainage and gypsum-based reclamation of saline-alkaline patches in irrigated sugarcane belts"
      ],
      districtHighlights: [
        { district: "Nagpur", note: "Headquarters of ICAR-NBSS&LUP, the national bureau that maps India's soils; Vidarbha black-cotton belt" },
        { district: "Ratnagiri", note: "Konkan laterite belt — acidic, leached coastal soils contrasting with the Deccan Vertisols" },
        { district: "Solapur", note: "Dry black-soil district with reported saline soil patches under canal irrigation" },
        { district: "Ahmednagar", note: "Among districts with reported saline-alkaline patches; rain-shadow black soils" },
        { district: "Akola", note: "Vidarbha deep-black-soil cotton district in the state's Zn/S-deficient dryland core" }
      ],
      facts: [
        "More than 90% of Maharashtra's terrain is basalt, and black soil covers roughly three-fourths of the state per consulted summaries.",
        "More than 60% of Maharashtra soils are sulphur-deficient and over 50% zinc-deficient (9.9% acute) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "The AICRP survey flags Maharashtra (with Gujarat, Karnataka, Rajasthan) for relatively high combined Zn+Fe deficiency.",
        "Black cotton soils of Maharashtra are reported increasingly deficient in phosphorus and zinc in consulted fertility reviews.",
        "Saline soil patches are reported in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule and Solapur districts."
      ],
      sources: [
        { title: "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India", publisher: "Scientific Reports (Nature) / ICAR-IISS AICRP", url: "https://www.nature.com/articles/s41598-021-99040-2", year: 2021 },
        { title: "Soil Fertility Status in India: Challenges and Solutions", publisher: "Agriculture.Institute (secondary review)", url: "https://agriculture.institute/agriculture-fundamentals/soil-fertility-challenges-solutions-india/" },
        { title: "Types of Soil in Maharashtra and Distribution", publisher: "Testbook (secondary summary for state geography)", url: "https://testbook.com/mpsc-preparation/types-of-soil-in-maharashtra" },
        { title: "Soil Health Card portal (state dashboards)", publisher: "Dept. of Agriculture & Farmers Welfare, GoI", url: "https://soilhealth.dac.gov.in/" }
      ],
      confidence: "medium",
      media: []
    },

    "manipur": {
      name: "Manipur",
      summary: "Manipur is crested hills around the alluvial Imphal valley, with only about 10% of its area cultivated (ICAR state profile). The red and yellow hill soils are moderately deep, acidic and phosphorus-deficient, while the valley alluvium is fertile and carries the state's rice. Site surveys report surface soils from extremely acidic (pH below 4.5) to strongly acidic with low organic carbon (below 0.4%) and low potassium at sampled locations, and the CSE/SHC analysis puts Manipur among the 15 states with nitrogen deficiency in 99-100% of samples.",
      soilTypes: [
        "Red and yellow hill soils (dominant; moderately deep, acidic, P-deficient)",
        "Alluvial soils of the Imphal valley (fertile, rice-growing)",
        "Organic-rich lacustrine/marshy soils around Loktak and other wetlands"
      ],
      npk: {
        nitrogen: "Low — Manipur is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        phosphorus: "Low — the red and yellow soils are explicitly characterised by ICAR as deficient in phosphorus; acid soils fix P strongly",
        potassium: "Low to medium — sericulture-zone surveys measured low available K (below 34 kg/ha) at acidic sites; valley soils test better"
      },
      micronutrients: {
        zinc: "Not verified at state level in consulted sources (Manipur was covered by the AICRP survey but state-specific percentages were not retrievable this session)",
        iron: "Not reported as deficient — strongly acid soils generally carry high available Fe, with aluminium and iron toxicity the greater risk",
        boron: "Deficiency characteristic of NE acid soils reported in regional reviews; no verified Manipur percentage found",
        sulphur: "Not verified at state level in consulted sources"
      },
      organicCarbon: "Mixed — hill soils under forest are OC-rich, but sericulture-zone surveys found low OC (below 0.4%) at extremely-to-strongly acidic sampled sites",
      currentState: "A classic NE-India acid-soil state: extremely to strongly acidic hill soils with P fixation and near-universal SHC nitrogen deficiency ring a fertile but flood-prone Imphal valley, while jhum and slope erosion keep degrading hill fertility.",
      issues: [
        "Extreme-to-strong soil acidity (pH below 4.5 to 5.5) with associated aluminium toxicity",
        "Phosphorus deficiency in the red-yellow hill soils (ICAR state profile)",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis); low OC and K at surveyed acidic sites",
        "Soil erosion on sloping lands and fertility loss under shifting (jhum) cultivation"
      ],
      recommendations: [
        "Liming of acid soils (as practised in Imphal West acid-soil nutrient-management studies)",
        "Phosphorus management adapted to P-fixing acid soils (band placement, rock phosphate on strongly acid soils)",
        "Organic-matter restoration on jhum and sericulture lands; longer fallows or settled terracing",
        "Erosion control on slopes and balanced NPK per Soil Health Card recommendations"
      ],
      districtHighlights: [
        { district: "Imphal West", note: "Acid-soil nutrient-management studies published for this valley district" },
        { district: "Imphal East", note: "Imphal valley alluvium — the state's fertile rice tract" },
        { district: "Thoubal", note: "Valley agriculture district adjoining Loktak's wetland soils" },
        { district: "Churachandpur", note: "Hill district on acidic red-yellow soils with jhum cultivation" },
        { district: "Senapati", note: "Northern hill district; off-season vegetable production on acidic hill soils" }
      ],
      facts: [
        "Only about 10% of Manipur's area is cultivated; the state is crested hills with widely spaced valleys (ICAR state profile).",
        "The red and yellow soils are moderately deep, acidic and deficient in phosphorus (ICAR).",
        "Surface soils surveyed in Manipur's sericulture zones were extremely acidic (pH below 4.5) to strongly acidic with organic carbon below 0.4% and available K below 34 kg/ha.",
        "Manipur is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE/DTE analysis).",
        "Soil erosion on sloping land and traditional shifting cultivation are flagged as key land constraints (ICAR)."
      ],
      sources: [
        { title: "Manipur — state profile", publisher: "Indian Council of Agricultural Research", url: "https://icar.org.in/en/node/17274" },
        { title: "Assessment of Nutritional Status of the Acidic Soils of Manipur Vanya Sericulture: Levels and Spatial Distributions", publisher: "Journal of Soil Salinity and Water Quality (ICAR ePubs)", url: "https://epubs.icar.org.in/index.php/JoSSWQ/article/view/140147" },
        { title: "CSE assessment: Indian soils severely deficient in key nutrients", publisher: "Down To Earth / Centre for Science and Environment", url: "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients", year: 2025 },
        { title: "Acid Soils' nutrient management of Imphal West district", publisher: "The Pharma Innovation Journal", url: "https://www.thepharmajournal.com/archives/2023/vol12issue6/PartO/12-5-294-388.pdf", year: 2023 }
      ],
      confidence: "medium",
      media: []
    },

    "meghalaya": {
      name: "Meghalaya",
      summary: "Meghalaya's high-rainfall plateau soils are acidic (pH 5.0-6.0) to strongly acidic (pH 4.5-5.0) with base saturation under 35%, the acidity intensifying with altitude and leaching. A GIS-based state fertility mapping exercise found phosphorus the weak link — 18.73% of the state low and 69.89% medium in available P — while organic carbon is high across 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas. An ICAR Complex (Shillong) study found about 40% of the state's soils below critical micronutrient levels.",
      soilTypes: [
        "Red and lateritic acidic upland soils of the Khasi-Jaintia plateau (dominant)",
        "Red-loamy and yellow soils of hill slopes under high rainfall",
        "Alluvial and colluvial soils of valley floors and the Garo foothills"
      ],
      npk: {
        nitrogen: "Medium — soils are rich in organic carbon, ICAR's stated measure of nitrogen-supplying potential, though heavy leaching under high rainfall limits realised availability",
        phosphorus: "Low to medium — 18.73% of the state's soil area is low and 69.89% medium in available P, with only 11.38% high (state fertility mapping)",
        potassium: "Medium — no state-wide K aggregate was verifiable in consulted sources; acid leached soils of high-rainfall belts typically test medium"
      },
      micronutrients: {
        zinc: "About 40% of the state's soils carry micronutrients below critical levels (ICAR Complex Shillong study); Zn is among the NE region's reported gaps",
        iron: "Generally adequate in strongly acid soils; not reported deficient in consulted sources",
        boron: "Deficient — boron deficiency is reported for Meghalaya among the acid red-lateritic soil states (regional boron reviews)",
        sulphur: "Not verified separately in consulted sources; falls within the ~40% below-critical micronutrient/secondary finding"
      },
      organicCarbon: "High — organic carbon is high over 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas (state fertility mapping)",
      currentState: "One of India's most acid soilscapes — strongly leached, base-poor (below 35% saturation) plateau soils where high organic carbon coexists with phosphorus limitation, boron/micronutrient gaps and jhum-linked degradation on slopes.",
      issues: [
        "Strong soil acidity (pH 4.5-6.0) with base saturation below 35%, worsening with altitude and rainfall",
        "Phosphorus limitation — under 12% of the state's soils high in available P",
        "About 40% of soils below critical micronutrient levels (ICAR Shillong)",
        "Fertility decline and erosion under shifting (jhum) cultivation, documented in West Garo Hills fallow studies"
      ],
      recommendations: [
        "Liming (furrow application) of strongly acid soils to raise base saturation and unlock P",
        "Soil-test-based P management suited to P-fixing acid soils",
        "Boron and zinc correction where confirmed, per NE-region acid-soil recommendations",
        "Longer jhum fallows or settled terrace/agroforestry systems to hold the high native organic carbon"
      ],
      districtHighlights: [
        { district: "West Jaintia Hills", note: "Jaintia Hills region where organic carbon is high across 99.45% of the area — the state's highest" },
        { district: "East Khasi Hills", note: "Strongly acidic high-rainfall plateau around Shillong/Sohra; intense leaching and low base saturation" },
        { district: "West Garo Hills", note: "Jhum fallow-period effects on soil physicochemical properties documented here" },
        { district: "Ri-Bhoi", note: "Home of the ICAR Research Complex for NEH Region (Umiam), the lead soils institution for the state" }
      ],
      facts: [
        "Meghalaya soils are acidic (pH 5.0-6.0) to strongly acidic (pH 4.5-5.0), with base saturation below 35%; acidity is strongest on high-altitude, high-rainfall belts.",
        "Available phosphorus: 18.73% of the state low, 69.89% medium, 11.38% high (GIS-based fertility mapping).",
        "Organic carbon is high across 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas.",
        "An ICAR Complex (Shillong) study found about 40% of Meghalaya's soils contain micronutrients below critical levels.",
        "Boron deficiency in India is reported mostly from acid red-lateritic soils of Assam, Bihar, Meghalaya, West Bengal, Jharkhand and Odisha."
      ],
      sources: [
        { title: "Extent and Distribution of Soil Acidity in Agriculture Lands of Meghalaya (survey map 2021)", publisher: "Dept. of Agriculture, Govt. of Meghalaya (megagriculture.gov.in)", url: "http://megagriculture.gov.in/public/dwd_docs/survey_map2021.pdf", year: 2021 },
        { title: "Soil Fertility Mapping Using GIS in Meghalaya Plateau", publisher: "International Journal of Current Microbiology and Applied Sciences", url: "https://www.ijcmas.com/11-3-2022/Pratibha%20Thakuria%20Das,%20et%20al.pdf", year: 2022 },
        { title: "Boron in Indian agriculture — A review", publisher: "ResearchGate (journal record)", url: "https://www.researchgate.net/publication/286648588_Boron_in_indian_agriculture_-_A_review" },
        { title: "Effects of jhum (shifting) Cultivation Fallow Period on Soil Physicochemical Properties, West Garo Hills District", publisher: "Indian Journal of Science and Technology", url: "https://indjst.org/articles/effects-of-jhum-shifting-cultivation-fallow-period-on-soil-physicochemical-properties-west-garo-hills-district-meghalaya-india" }
      ],
      confidence: "high",
      media: []
    },

    "mizoram": {
      name: "Mizoram",
      summary: "Entirely mountainous Mizoram has sandy-loam to clay-loam soils that are rich in organic carbon and moderately rich in available potash but acidic (pH 4.5-5.6) under the heavy May-September rains, and low to very low in available phosphorus across all surveyed soil orders. Jhum (shifting) cultivation drives the state's soil-health cycle: slash burning briefly lifts P and cations while depleting carbon and nitrogen, and fertility falls through the cropping years, recovering only under longer fallows of 7-15 years. The CSE/SHC analysis lists Mizoram among the 15 states with nitrogen deficiency in 99-100% of samples.",
      soilTypes: [
        "Red and yellow hill soils, sandy-loam to clay-loam (dominant; acidic, P-deficient)",
        "Deep loamy soils of narrow inter-mountain valleys and river terraces",
        "Young colluvial soils on steep, erosion-prone slopes"
      ],
      npk: {
        nitrogen: "Low in tested SHC terms — Mizoram is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE analysis), though field studies found available N high in 42-77% of profiles by soil order under forested land uses",
        phosphorus: "Low — all surveyed soils (Entisols, Inceptisols, Ultisols) tested low to very low in available P; acid soils fix P strongly",
        potassium: "Medium to high — soils are moderately rich in available potash; 71-100% of surveyed profiles by soil order tested high in K"
      },
      micronutrients: {
        zinc: "Not verified at state level in consulted sources",
        iron: "Not reported deficient — strongly acid high-OM soils generally maintain available Fe",
        boron: "Deficiency characteristic of NE acid soils in regional reviews; no verified Mizoram percentage found",
        sulphur: "Not verified at state level in consulted sources"
      },
      organicCarbon: "High under forest and long fallows — soils are characterised as organic-carbon-rich, with SOC up to 1.53-2.79% pre-monsoon in land-use studies; jhum burning and short fallows deplete it",
      currentState: "An acid-soil hill state where organic-carbon-rich but phosphorus-starved soils on steep slopes are cycled through jhum; shortened fallows are eroding the fertility recovery that 7-15-year fallows once provided.",
      issues: [
        "Soil acidity (pH 4.5-5.6, sites 4.7-5.4) from heavy monsoon leaching",
        "Available phosphorus low to very low in all surveyed soil orders",
        "Jhum slash-burning depletes soil carbon and nitrogen; fertility declines through first and second cropping years",
        "Shortening jhum fallows undercut the OC/N-P-K recovery documented under 7-15-year fallows; steep-slope erosion"
      ],
      recommendations: [
        "Lengthen jhum fallows (7-15 years) or transition to settled terrace/agroforestry systems — longer fallows measurably restore OC, N, P and K",
        "P management adapted to acid P-fixing soils (placement, rock phosphate, liming of croplands)",
        "Soil amendments trialled at Lengpui (Mamit) improve rice productivity under shortened fallows",
        "Protect organic-carbon stocks — minimise burning intensity and retain residues where possible"
      ],
      districtHighlights: [
        { district: "Aizawl", note: "Land-use soil-property studies (pH 4.7-5.4 across land uses) conducted in this district's hills" },
        { district: "Mamit", note: "Lengpui site of the fallow-length and soil-amendment study on jhum rice productivity" },
        { district: "Lunglei", note: "Southern hill district typifying the state's steep, acidic, jhum-cycled terrain" }
      ],
      facts: [
        "Mizoram's sandy-loam and clay-loam soils are rich in organic carbon, moderately rich in available potash, and acidic (pH 4.5-5.6) due to high May-September rainfall (ICAR state profile).",
        "All surveyed soils — Entisols, Inceptisols and Ultisols — tested low to very low in available phosphorus; 71-100% by order tested high in available K.",
        "Slash burning in jhum depletes soil acidity, carbon and nitrogen while temporarily elevating phosphorus and cations; fertility declines through the cropping phases.",
        "Fallows of 7-15 years restore finer soil texture, organic carbon and available N, P and K on jhum lands.",
        "Mizoram is among the 15 states/UTs with nitrogen deficiency in 99-100% of SHC samples (CSE/DTE analysis)."
      ],
      sources: [
        { title: "Mizoram — state profile", publisher: "Indian Council of Agricultural Research", url: "https://icar.org.in/en/node/17277" },
        { title: "Soil fertility and rice productivity in shifting cultivation: impact of fallow lengths and soil amendments in Lengpui, Mizoram", publisher: "Heliyon (ScienceDirect)", url: "https://www.sciencedirect.com/science/article/pii/S2405844021009373", year: 2021 },
        { title: "Soil properties under different land use systems of Mizoram, North East India", publisher: "Journal of Applied and Natural Science", url: "https://journals.ansfoundation.org/index.php/jans/article/view/1999" },
        { title: "CSE assessment: Indian soils severely deficient in key nutrients", publisher: "Down To Earth / Centre for Science and Environment", url: "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients", year: 2025 }
      ],
      confidence: "medium",
      media: []
    }

  }
};
