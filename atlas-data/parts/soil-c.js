// data/parts/soil-c.js — Soil Health (part C: final 12 states/UTs, nagaland ... west-bengal)
// Compiled from internet research on 2026-08-09. Every numeric fact is tied to a consulted source.
//
// RESEARCH CONSTRAINT (important for QC): in this environment the egress proxy blocked direct
// fetching of nearly every publisher and government domain used for Indian soil data —
// nature.com, ncbi/PMC, data.gov.in, static.pib.gov.in, icar.org.in, iiss.res.in, cseindia.org,
// downtoearth.org.in, jetir.org, oar.icrisat.org, agris.fao.org and others all returned
// EGRESS_BLOCKED. Content was therefore obtained from web-search result content (snippets and
// search-engine summaries of those same pages), plus one PDF that could be fetched and parsed
// directly (the Unnao district, Uttar Pradesh micronutrient survey). Where a state/UT-level
// figure could not be verified, the entry SAYS SO EXPLICITLY in the field itself and confidence
// is lowered to "low". No numbers were invented, and no state-level percentage is quoted unless
// a consulted source actually gave it for that state.
//
// Bulk multi-state sources used as shared context:
//  - CSE assessment of Soil Health Card data (Oct 2025): 64% of samples low in nitrogen,
//    48.5% low in organic carbon; boron 47%, zinc 39%, iron 37%, sulphur 36% deficient;
//    27 states/UTs with nitrogen deficiency in 90% of samples; ~1.3 crore samples tested 2023-25.
//  - ICAR-AICRP on Micro- and Secondary Nutrients (Shukla et al., Scientific Reports 2021):
//    2,42,827 surface samples, 615 districts, 28 states; national deficiency assessed at
//    S 40.5%, Zn 36.5%, B 23.2%, Fe 12.8%, Mn 7.1%, Cu 4.2%.
//  - Soil Health Card scheme design: 12 parameters (N, P, K, S; Zn, Fe, Cu, Mn, B; pH, EC, OC);
//    cards issued every 3 years; scheme launched 19 Feb 2015 at Suratgarh, Rajasthan.
window.INDIA_DATA_PARTS = window.INDIA_DATA_PARTS || {};
window.INDIA_DATA_PARTS["soil-c"] = {
  states: {

    "nagaland": {
      name: "Nagaland",
      summary: "Nagaland is almost entirely hill country farmed largely under jhum (shifting cultivation), and the peer-reviewed soil science available for the state is organised around that cycle rather than around state-wide soil-test aggregates. Work in Mokokchung district shows that as jhum fallows lengthen, soil organic carbon, available nitrogen, available phosphorus and exchangeable potassium all rise while soil pH and bulk density fall. Alder-based jhum — the indigenous system best documented at Khonoma in Kohima district — outperforms traditional non-alder jhum on most soil parameters. No Nagaland-specific Soil Health Card or state-wide soil-test aggregate could be verified in this research pass.",
      soilTypes: [
        "Hill soils under jhum and secondary forest (dominant; consulted studies measure pH, organic carbon and NPK across these, but no verified state-wide soil classification or area breakdown was obtainable)",
        "Alder-based jhum fallow soils — the indigenous system of Khonoma and neighbouring areas, measurably more fertile than non-alder jhum",
        "Wet terrace paddy soils in valley pockets (one of the three traditional land-use systems compared in the Khonoma study)",
        "Natural forest soils, used as the fertility benchmark in the Khonoma comparison"
      ],
      npk: {
        nitrogen: "Low but not verified at state level — consulted Nagaland studies report available nitrogen rising with longer jhum fallows rather than a state-wide status; no Soil Health Card aggregate for Nagaland was obtainable. Nationally 64% of SHC samples test low in nitrogen (CSE 2025 analysis).",
        phosphorus: "Not verified at state level — available phosphorus increases with increasing fallow length in the Mokokchung district study; no state-wide tested share was obtainable.",
        potassium: "Not verified at state level — exchangeable potassium increases with increasing fallow length in the Mokokchung district study; no state-wide tested share was obtainable."
      },
      micronutrients: {
        zinc: "Not verified for Nagaland in consulted sources; nationally zinc deficiency is assessed at 36.5% of samples (ICAR-AICRP) and 39% in the CSE analysis of Soil Health Card data.",
        iron: "Not verified for Nagaland in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Nagaland in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Nagaland in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Rises with jhum fallow length (Mokokchung district soil-quality-index study) and is higher under natural forest and alder-based fallow than under cropped jhum in the Khonoma comparison; no verified state-wide figure was obtainable.",
      currentState: "A hill state whose soil health is governed by the jhum cycle: shortening fallows drive fertility decline and land degradation, while the indigenous alder-based jhum documented around Khonoma keeps soils measurably more fertile than non-alder shifting cultivation.",
      issues: [
        "Declining soil fertility and ongoing land degradation from traditional shifting cultivation, identified as a key threat in the uplands of Northeast India",
        "Shortened jhum fallows — soil organic carbon and available N, P and exchangeable K all fall as fallow length shrinks",
        "Steep-slope cultivation with associated erosion risk",
        "No verified state-wide or district-level soil-test aggregate published in accessible form, which leaves nutrient management without a quantified baseline"
      ],
      recommendations: [
        "Lengthen jhum fallows — organic carbon and available N, P and exchangeable K all increase with fallow period (Mokokchung soil-quality-index study)",
        "Promote alder-based jhum, which showed significant improvement over traditional non-alder jhum on most soil parameters across varied fallow lengths",
        "Shift steeper jhum plots towards wet terrace paddy and tree-based systems — the other traditional land uses studied at Khonoma",
        "Build and publish district-level soil-test aggregates so nutrient advice can replace inference with measurement"
      ],
      districtHighlights: [
        { district: "Kohima", note: "Khonoma village here is the site of the study comparing natural forest, alder-based jhum fallow and wet terrace paddy for pH, N, P, K, soil organic carbon and organic matter" },
        { district: "Mokokchung", note: "Soil quality index study of shifting cultivation and fallow: organic carbon and available N, P and exchangeable K rise with fallow length while pH and bulk density fall" }
      ],
      facts: [
        "In Mokokchung district, longer jhum fallows raised soil organic carbon, available nitrogen, available phosphorus and exchangeable potassium, while soil pH and bulk density decreased.",
        "Alder-based shifting cultivation showed significant improvement over traditional non-alder jhum in most soil parameters across varied fallow lengths in the Eastern Indian Himalayas.",
        "The Khonoma study (Kohima district) compared three traditional land-use systems — natural forest, alder-based jhum fallow and wet terrace paddy — for pH, nitrogen, phosphorus, potassium, soil organic carbon and soil organic matter.",
        "Declining soil fertility and land degradation from traditional shifting cultivation are named as central sustainability problems for upland Northeast India.",
        "Gap: no Nagaland Soil Health Card aggregate or state-wide soil-test summary could be verified here, so the NPK and micronutrient fields above are deliberately left unquantified."
      ],
      sources: [
        { title: "Soil Nutrients and Fertility in Three Traditional Land Use Systems of Khonoma, Nagaland, India", publisher: "Resources and Environment (Scientific and Academic Publishing)", url: "http://article.sapub.org/10.5923.j.re.20140404.01.html", year: 2014 },
        { title: "Effect of shifting cultivation and fallow on soil quality index in Mokokchung district, Nagaland, India", publisher: "Ecological Processes (Springer)", url: "https://ecologicalprocesses.springeropen.com/articles/10.1186/s13717-022-00386-w", year: 2022 },
        { title: "The comparative soil fertility in traditional and alder-based shifting cultivation of varied fallow lengths in Eastern Indian Himalayas", publisher: "Soil Science and Plant Nutrition 67(6)", url: "https://www.tandfonline.com/doi/abs/10.1080/00380768.2021.2009741", year: 2021 },
        { title: "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data", publisher: "Centre for Science and Environment", url: "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908", year: 2025 }
      ],
      confidence: "low",
      media: []
    },

    "odisha": {
      name: "Odisha",
      summary: "Odisha is an acid-soil state. Red soils cover about 7.14 million hectares — the largest area of any soil group in the state — and are strongly to moderately acidic, while laterite soils cover about 0.70 million hectares at pH roughly 4.5-5.8. High exchangeable aluminium and manganese accompany the acidity, and both groups are deficient in nitrogen and phosphorus and highly deficient in boron and molybdenum, with low organic matter in the lateritic tracts. Lime, paper-mill sludge, organic manure, green manuring and balanced fertilisation are the standard corrective package in consulted Odisha soil-management summaries.",
      soilTypes: [
        "Red soils — about 7.14 million ha, the largest area in the state (Koraput, Rayagada, Nabarangpur, Malkangiri, Keonjhar, Ganjam, Kalahandi, Nuapada, Balangir, Dhenkanal, Mayurbhanj); strongly to moderately acidic",
        "Laterite soils — about 0.70 million ha (Puri, Khordha, Nayagarh, Cuttack, Dhenkanal, Keonjhar, Mayurbhanj, Sambalpur); slightly to strongly acidic at pH about 4.5-5.8, poor in fertility, low in organic matter",
        "Other groups (deltaic and coastal alluvium, black and brown forest soils) appear in Odisha soil classifications, but no verified areas for them were obtainable in this research pass"
      ],
      npk: {
        nitrogen: "Low — both the red and the laterite groups are described as deficient in nitrogen, with laterite soils specifically low in available nitrogen alongside low organic matter. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis). No verified Odisha-wide tested share was obtainable.",
        phosphorus: "Low — red and laterite soils alike are reported deficient in phosphorus, in soils carrying high exchangeable aluminium and manganese.",
        potassium: "Not verified at state level — consulted Odisha soil summaries emphasise nitrogen, phosphorus, boron and molybdenum shortages and do not give a potassium status share."
      },
      micronutrients: {
        zinc: "Not verified for Odisha in consulted sources; nationally zinc deficiency is 36.5% (ICAR-AICRP) and 39% in the CSE analysis of Soil Health Card data.",
        iron: "Not verified for Odisha in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "High deficiency — both laterite and red soils of Odisha are described as highly deficient in boron (and in molybdenum), which makes boron the state's leading micronutrient gap in consulted sources.",
        sulphur: "Not verified for Odisha in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Low in the lateritic tracts — laterite soils of Odisha are characterised as poor in fertility with low organic matter content; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of SHC samples test low in organic carbon (CSE 2025).",
      currentState: "Odisha's defining soil problem is acidity: strongly to moderately acidic red soils across about 7.14 million ha and laterite soils at pH 4.5-5.8 across about 0.70 million ha, carrying high exchangeable aluminium and manganese and short of nitrogen, phosphorus and boron. Neutralising acidity with lime and rebuilding organic matter are the central soil-health tasks.",
      issues: [
        "Soil acidity — laterite soils at pH about 4.5-5.8, red soils strongly to moderately acidic",
        "High exchangeable aluminium and manganese driving the acidity and constraining root growth",
        "Nitrogen and phosphorus deficiency across both the red and the laterite groups",
        "High deficiency of boron and molybdenum",
        "Low organic matter and generally poor fertility in the lateritic tracts"
      ],
      recommendations: [
        "Lime application to neutralise soil acidity — the first-line correction in consulted Odisha soil-management guidance",
        "Paper-mill sludge at 1-2 tonnes per hectare as an alternative acidity amendment",
        "Organic manure to lift fertility and organic matter on lateritic and red soils",
        "Green-manure crops in the rotation",
        "Balanced fertiliser use that addresses boron and molybdenum alongside nitrogen and phosphorus"
      ],
      districtHighlights: [
        { district: "Koraput", note: "Part of the southern red-soil belt (with Rayagada, Nabarangpur, Malkangiri) — strongly to moderately acidic soils deficient in nitrogen and phosphorus" },
        { district: "Keonjhar", note: "Carries both red and laterite soils; laterite here is slightly to strongly acidic with high exchangeable aluminium and manganese" },
        { district: "Mayurbhanj", note: "Listed for both the red-soil and laterite groups — acidic, boron- and molybdenum-deficient soils" },
        { district: "Khordha", note: "Core of the coastal laterite tract (with Puri and Nayagarh) at pH about 4.5-5.8, low in organic matter" },
        { district: "Sambalpur", note: "Western laterite district in the 0.70 million ha laterite group; lime and organic amendment are the standard corrections" }
      ],
      facts: [
        "Red soils cover about 7.14 million hectares of Odisha — the largest area of any soil group in the state — and are strongly to moderately acidic.",
        "Laterite soils cover about 0.70 million hectares, chiefly in Puri, Khordha, Nayagarh, Cuttack, Dhenkanal, Keonjhar, Mayurbhanj and Sambalpur, with pH between about 4.5 and 5.8.",
        "Higher amounts of exchangeable aluminium and manganese make these soils slightly to strongly acidic.",
        "Both red and laterite soils of Odisha are deficient in nitrogen and phosphorus and highly deficient in boron and molybdenum.",
        "Recommended corrections include lime, 1-2 tonnes per hectare of paper-mill sludge, organic manure, green-manure crops and balanced fertilisation."
      ],
      sources: [
        { title: "Status of Odisha's Soils, Chapter 4: Management of Acidic Soils", publisher: "ICRISAT Open Access Repository", url: "https://oar.icrisat.org/11941/1/Ch4-(Management%20of%20acidic%20soils).pdf" },
        { title: "Soils of Odisha — soil groups, areas, pH and districts", publisher: "Odisha Geography", url: "https://odishageography.com/soils-of-odisha/" },
        { title: "Soils in Odisha: Classification and Management", publisher: "ObjectiveIAS", url: "https://objectiveias.in/geography-of-odisha/soils-in-odisha/" },
        { title: "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data", publisher: "Centre for Science and Environment", url: "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908", year: 2025 }
      ],
      confidence: "medium",
      media: []
    },

    "puducherry": {
      name: "Puducherry",
      summary: "Puducherry is a four-part coastal UT — Puducherry and Karaikal on the Coromandel coast adjoining Tamil Nadu, Yanam on the Godavari in Andhra Pradesh, and Mahe on the Malabar coast in Kerala — so its soils are coastal rather than continental. Red earth with sandy and silty loams, clays and pebbles is the major soil type, alongside black, alluvial and colluvial soils. Soils derived from coastal and deltaic alluvium are described as fine-textured, alkaline or saline and low in fertility, waterlogged in the rainy season and highly saline in the dry season. No UT-level Soil Health Card nutrient aggregate for Puducherry could be verified in this research pass.",
      soilTypes: [
        "Red earth with sandy and silty loam soils, clays and pebbles — the major soil type of the UT",
        "Coastal and deltaic alluvium — fine-textured, alkaline/saline, low in fertility, waterlogged in the rains and strongly saline in the dry season",
        "Black soils",
        "Colluvial soils"
      ],
      npk: {
        nitrogen: "Not verified at UT level in consulted sources — Puducherry's coastal and deltaic alluvium-derived soils are described broadly as low in fertility rather than by tested nutrient class. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis).",
        phosphorus: "Not verified at UT level in consulted sources.",
        potassium: "Not verified at UT level in consulted sources."
      },
      micronutrients: {
        zinc: "Not verified for Puducherry in consulted sources; nationally 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        iron: "Not verified for Puducherry in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Puducherry in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Puducherry in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Not verified at UT level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      currentState: "A small coastal UT whose binding soil problems are salinity and alkalinity rather than nutrient mining: coastal and deltaic alluvial soils swing between rainy-season waterlogging and dry-season salinity, and groundwater-quality assessment for the Puducherry region treats irrigation-water suitability as a linked constraint.",
      issues: [
        "Alkaline/saline coastal and deltaic alluvial soils of low fertility",
        "Waterlogging in the rainy season followed by high salinity in the dry season",
        "Groundwater quality constraints on irrigation in the Puducherry region",
        "A UT split across four separated coastal enclaves with very different soil settings, which prevents any single soil prescription",
        "No verifiable UT-level soil-test or Soil Health Card aggregate published in accessible form"
      ],
      recommendations: [
        "Drainage improvement to break the rainy-season waterlogging then dry-season salinity cycle on deltaic alluvium",
        "Salinity and alkalinity management on coastal alluvial soils, coupled to irrigation-water quality monitoring",
        "Organic matter addition on low-fertility red earths and coastal alluvium",
        "Publish district-level Soil Health Card aggregates for all four districts so nutrient status is documented, not inferred"
      ],
      districtHighlights: [
        { district: "Puducherry", note: "Coromandel-coast district adjoining Tamil Nadu; red earth with sandy and silty loams, clays and pebbles, and the area covered by the region's groundwater-quality assessment for domestic and agricultural use" },
        { district: "Karaikal", note: "Also on the Coromandel coast adjoining Tamil Nadu, in the Cauvery delta setting where coastal/deltaic alluvium is fine-textured, alkaline or saline and low in fertility" },
        { district: "Yanam", note: "Enclave on the Godavari in Andhra Pradesh — deltaic alluvium with the same waterlogging-then-salinity seasonal cycle" },
        { district: "Mahe", note: "Malabar-coast enclave adjoining Kerala; a wholly different high-rainfall coastal soil setting from the Coromandel districts" }
      ],
      facts: [
        "Puducherry consists of four unconnected districts: Puducherry and Karaikal on the Coromandel coast next to Tamil Nadu, Yanam on the Godavari next to Andhra Pradesh, and Mahe on the Malabar coast next to Kerala.",
        "The major soil type is red earth, with sandy and silty loam soils, clays and pebbles; red, black, alluvial and colluvial soils all occur.",
        "Soils derived from coastal and deltaic alluvium are fine, alkaline or saline and low in fertility, with waterlogging in the rainy season and high salinity in the dry season.",
        "Groundwater quality in the Puducherry region has been formally assessed for domestic and agricultural suitability, linking soil salinity management to irrigation-water quality.",
        "Gap: no Puducherry-specific Soil Health Card nutrient aggregate could be verified in this research pass, so NPK, micronutrient and organic carbon fields are left unquantified."
      ],
      sources: [
        { title: "Puducherry — state/UT agricultural profile", publisher: "Indian Council of Agricultural Research", url: "https://icar.org.in/en/node/17282" },
        { title: "Groundwater quality assessment for domestic and agriculture purposes in Puducherry region", publisher: "Applied Water Science (Springer)", url: "https://link.springer.com/article/10.1007/s13201-017-0556-y", year: 2017 },
        { title: "Puducherry (Chapter 28) — Geotechnical Characteristics of Soils and Rocks of India", publisher: "CRC Press / Taylor & Francis", url: "https://www.taylorfrancis.com/chapters/edit/10.1201/9781003177159-28/puducherry-saravanan-kaviarasu-ramesh-premkumar" },
        { title: "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data", publisher: "Centre for Science and Environment", url: "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908", year: 2025 }
      ],
      confidence: "low",
      media: []
    },

    "punjab": {
      name: "Punjab",
      summary: "Punjab's soil problem is over-use, not natural poverty. The state has India's highest per-hectare chemical fertiliser consumption — 253.94 kg/ha in 2021-22 — applied to a rice-wheat monoculture that takes about 85% of accessible groundwater. Mapping of intensively cultivated Punjab soils found more than 90% low to medium in organic carbon and 50% low to medium in available phosphorus, while potassium remains comfortable (only about 3% of samples low) and about 11% of samples tested low in zinc. Water tables in central Punjab have fallen at accelerating rates and about 79% of groundwater assessment blocks are over-exploited or critical, even as wheat yields have slipped.",
      soilTypes: [
        "Intensively cultivated alluvial soils of the Indo-Gangetic plain under the rice-wheat system (dominant; the subject of the state fertility mapping study)",
        "Arid-tract sandy soils of south-western Punjab — the Mansa study recorded organic carbon of 0.02-0.40% with a mean of 0.29%",
        "Northern and central Punjab soils surveyed at Punjab Agricultural University regional research stations (Gurdaspur, Kapurthala)"
      ],
      npk: {
        nitrogen: "Low in effective terms despite the heaviest fertiliser use in India — Punjab applies 253.94 kg/ha of chemical fertiliser (2021-22), the highest in the country, yet consulted analyses report soil fertility still declining and organic content driven towards near-zero by excessive chemical fertiliser use. No verified Punjab-wide Soil Health Card nitrogen share was obtainable; nationally 64% of SHC samples test low in nitrogen.",
        phosphorus: "Low to medium — 50% of intensively cultivated Punjab soils tested low to medium in available phosphorus in the state fertility mapping study.",
        potassium: "Medium to high — available potassium is generally medium to high, with only about 3% of soil samples testing low; one arid-tract study recorded 176.34-271.77 kg/ha, described as sufficient."
      },
      micronutrients: {
        zinc: "Deficient in a minority of soils — about 11% of samples from intensively cultivated Punjab soils tested low in zinc (national figure 36.5%, ICAR-AICRP). Consulted Soil Health Card material reports that zinc application alone can raise rice and wheat yields 15-20% on deficient soils.",
        iron: "Iron is named among the micronutrients whose deficiency causes yield loss in high-fertiliser states, but no verified Punjab-specific tested share was obtainable; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Punjab in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Punjab in consulted sources; sulphur is listed among the deficiencies produced by over-application of urea alongside under-application of other nutrients. National figure 40.5% (ICAR-AICRP)."
      },
      organicCarbon: "Low to medium in more than 90% of Punjab's soils per the mapping of intensively cultivated soils; in the arid south-western tract (Mansa) organic carbon ranged 0.02-0.40% with a mean of 0.29%. Agricultural experts quoted in consulted reporting say overuse of chemical fertilisers has brought the organic component of the soil to almost zero.",
      currentState: "Punjab is India's clearest case of soil health degraded by over-fertilisation: the highest fertiliser use per hectare in the country, more than 90% of soils low to medium in organic carbon, falling wheat yields, and a central-Punjab water table whose decline accelerated from about 18 cm a year in 1982-87 to 75 cm in 2002-06, with about 79% of groundwater assessment blocks over-exploited or critical.",
      issues: [
        "Highest per-hectare chemical fertiliser consumption in India — 253.94 kg/ha in 2021-22 — with imbalanced NPK use",
        "More than 90% of soils low to medium in organic carbon; consulted reporting describes the organic component as driven to almost zero by fertiliser overuse",
        "Falling productivity despite rising inputs — wheat output fell from 178 lakh tonnes (2017-18) to 149 lakh tonnes (2021-22), and wheat yield from 5,077 to 4,216 kg/ha, as reported by The Tribune",
        "Groundwater depletion — about 79% of assessment blocks over-exploited or critical, with central-Punjab water-table decline accelerating from about 18 cm/yr (1982-87) to 42 cm/yr (1997-2002) to 75 cm (2002-06)",
        "Rice-wheat monoculture consuming about 85% of accessible groundwater, sustained by tube wells and electricity subsidy",
        "Soil acidification reported in high-urea states including Punjab and Haryana",
        "Available phosphorus low to medium in half of intensively cultivated soils; about 11% of soils zinc-deficient"
      ],
      recommendations: [
        "Replace blanket urea doses with Soil Health Card-based recommendations — consulted scheme material reports average yield gains of 8-10% for farmers who follow SHC advice",
        "Rebuild organic carbon through residue retention instead of burning, farmyard manure and green manuring, given more than 90% of soils are low to medium in organic carbon",
        "Diversify out of rice-wheat monoculture to cut groundwater draft, since about 85% of accessible groundwater goes to those two crops",
        "Correct phosphorus on the half of soils testing low to medium, and apply zinc only where soil tests show deficiency (about 11% of samples) rather than uniformly",
        "Address the acidification risk that continued heavy urea use creates in Punjab and Haryana"
      ],
      districtHighlights: [
        { district: "Mansa", note: "Arid-tract district where soil organic carbon ranged 0.02-0.40% with a mean of 0.29% — among the lowest recorded in the state" },
        { district: "Gurdaspur", note: "PAU Regional Research Station soils here have been formally assessed for fertility status, part of the station-level baseline network" },
        { district: "Kapurthala", note: "PAU Regional Research Station soil fertility status published separately, giving a central-Punjab reference point" }
      ],
      facts: [
        "Punjab has the highest per-hectare consumption of chemical fertilisers in India: 253.94 kg per hectare in 2021-22.",
        "Mapping of intensively cultivated Punjab soils found more than 90% low to medium in soil organic carbon, 50% low to medium in available phosphorus, only about 3% low in available potassium, and about 11% low in zinc.",
        "Soils of the arid tract around Mansa recorded organic carbon of 0.02-0.40% with a mean of 0.29%.",
        "About 79% of Punjab's groundwater assessment blocks are classed over-exploited or critical, and the central-Punjab water table fell about 18 cm/yr in 1982-87, 42 cm/yr in 1997-2002 and 75 cm in 2002-06.",
        "Roughly 85% of the state's accessible groundwater is used to grow rice and wheat.",
        "The Tribune reported Punjab's wheat production falling from 178 lakh metric tonnes in 2017-18 to 149 lakh metric tonnes in 2021-22, with wheat yield down from 5,077 to 4,216 kg/ha."
      ],
      sources: [
        { title: "Mapping of Chemical Characteristics and Fertility Status of Intensively Cultivated Soils of Punjab, India", publisher: "Communications in Soil Science and Plant Analysis 47(15)", url: "https://www.tandfonline.com/doi/full/10.1080/00103624.2016.1208756", year: 2016 },
        { title: "Fertiliser overuse: wheat yield, soil fertility decrease in Punjab", publisher: "The Tribune", url: "https://www.tribuneindia.com/news/punjab/fertiliser-overuse-wheat-yield-soil-fertility-decrease-in-punjab-521065/amp" },
        { title: "Punjab, India — groundwater depletion and the rice-wheat system", publisher: "Columbia Water Center, Columbia University", url: "https://water.columbia.edu/content/punjab-india" },
        { title: "Accelerating rate of groundwater depletion in Punjab worries farmers and experts", publisher: "Mongabay India", url: "https://india.mongabay.com/2022/06/accelerating-rate-of-groundwater-depletion-in-punjab-worries-farmers-and-experts/", year: 2022 }
      ],
      confidence: "medium",
      media: []
    },

    "rajasthan": {
      name: "Rajasthan",
      summary: "Rajasthan is India's arid-soil state: sandy soils are the most extensive, and semi-arid tracts commonly carry high exchangeable sodium, producing sodic soils. Salinity here is largely irrigation-induced — canal water in the arid north-west (Sri Ganganagar, Hanumangarh and Bikaner through the Indira Gandhi Nahar Pariyojana) and the south-west (Sanchore-Jalore and Barmer through the Narmada canal) has produced high-NaCl soils described as the least fertile in the state. Fittingly, the national Soil Health Card scheme was launched at Suratgarh in Rajasthan on 19 February 2015. Verified state-wide nutrient aggregates for Rajasthan were not obtainable in this research pass.",
      soilTypes: [
        "Sandy desert and arid soils — the most extensive soil type in Rajasthan",
        "Sodic soils of the semi-arid tracts, marked by high exchangeable sodium",
        "Irrigation-induced saline soils with high sodium chloride — the IGNP command in Sri Ganganagar, Hanumangarh and Bikaner, and the Narmada canal command around Sanchore-Jalore and Barmer — described as the least fertile soils of the state"
      ],
      npk: {
        nitrogen: "Not verified at state level in consulted sources — Rajasthan's arid sandy and saline soils are characterised as low in fertility rather than by a tested nitrogen class. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis), and 27 states/UTs show nitrogen deficiency in 90% of samples.",
        phosphorus: "Not verified at state level in consulted sources; imbalanced fertiliser application is reported to have caused deficiency of primary nutrients (NPK) in most parts of the country.",
        potassium: "Not verified at state level in consulted sources."
      },
      micronutrients: {
        zinc: "Not verified for Rajasthan in consulted sources; zinc is named among the micronutrients made deficient by imbalanced fertiliser use in most parts of the country. National figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        iron: "Not verified for Rajasthan in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Rajasthan in consulted sources; boron is named among the deficient micronutrients nationally. National figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Rajasthan in consulted sources; sulphur is named among the deficient secondary nutrients nationally. National figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Not verified at state level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis). Rajasthan's arid sandy and saline soils are described as least fertile in consulted state soil descriptions.",
      currentState: "An arid state whose binding soil constraints are texture and chemistry rather than nutrient mining: extensive sandy soils with little water- and nutrient-holding capacity, sodicity from high exchangeable sodium in the semi-arid tracts, and secondary salinisation in the IGNP and Narmada canal command areas.",
      issues: [
        "Extensive sandy desert soils with poor fertility and low water-holding capacity",
        "Sodic soils in semi-arid tracts, produced by high exchangeable sodium",
        "Irrigation-induced salinity in canal commands — Sri Ganganagar, Hanumangarh and Bikaner under the IGNP, and Sanchore-Jalore and Barmer under the Narmada canal — with high NaCl content and the lowest fertility in the state",
        "Imbalanced fertiliser application causing deficiency of NPK, sulphur and micronutrients including boron, zinc and copper (national finding applied to Rajasthan by consulted scheme material)",
        "No verified state-wide Soil Health Card nutrient aggregate available in accessible form"
      ],
      recommendations: [
        "Salinity and sodicity diagnosis and management in irrigated tracts — the approach of the ICAR salinity/sodicity/fertility indices study of south-eastern Jodhpur soils",
        "Irrigation-water and drainage management in the IGNP and Narmada canal commands to limit further secondary salinisation",
        "Soil Health Card-based balanced fertilisation to correct the NPK, sulphur and micronutrient imbalances that consulted scheme material attributes to unbalanced fertiliser use",
        "Organic matter addition and moisture-conserving practices on sandy arid soils"
      ],
      districtHighlights: [
        { district: "Sri Ganganagar", note: "Suratgarh here is where the national Soil Health Card scheme was launched on 19 February 2015; the district also lies in the IGNP command where irrigation has produced saline soils" },
        { district: "Hanumangarh", note: "IGNP command district where excessive irrigation in an arid setting has produced high-NaCl saline soils" },
        { district: "Bikaner", note: "Third of the IGNP-command districts named for irrigation-induced salinity" },
        { district: "Jalore", note: "Sanchore-Jalore tract, where Narmada canal irrigation has produced saline soils described as the least fertile in the state" },
        { district: "Jodhpur", note: "South-eastern Jodhpur soils are the subject of a published evaluation of salinity, sodicity and fertility indices in the ICAR Journal of Soil Salinity and Water Quality" }
      ],
      facts: [
        "Sandy soil is the most widespread soil type in Rajasthan.",
        "Semi-arid Rajasthan often shows high exchangeable sodium, producing sodic soils.",
        "Saline soils formed by excessive irrigation in arid areas occur in Sri Ganganagar, Hanumangarh and Bikaner via the Indira Gandhi Nahar Pariyojana, and in Sanchore-Jalore and Barmer via the Narmada canal; they carry high NaCl and are the least fertile soils of the state.",
        "The national Soil Health Card scheme was launched on 19 February 2015 at Suratgarh, Rajasthan.",
        "Gap: no state-wide Rajasthan Soil Health Card aggregate for NPK, organic carbon or micronutrients could be verified in this research pass, so those fields are left unquantified."
      ],
      sources: [
        { title: "Soil Health Card — factsheet (scheme launched 19 February 2015 at Suratgarh, Rajasthan)", publisher: "Press Information Bureau, Government of India", url: "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2" },
        { title: "Evaluation of Salinity, Sodicity and Fertility Indices of Soils of South-Eastern Jodhpur (Rajasthan), India", publisher: "Journal of Soil Salinity and Water Quality (ICAR ePubs)", url: "https://epubs.icar.org.in/index.php/JoSSWQ/article/view/166633" },
        { title: "Soil — Rajasthan: soil types, saline and sodic tracts", publisher: "RajEdu (Rajasthan geography reference)", url: "https://rajedu.in/rajasthan/3_geography/soils" },
        { title: "Soil Health Card Scheme (Swasth Dhara Khet Hara) — Rajasthan Agriculture Department", publisher: "Government of Rajasthan", url: "https://www.tourism.rajasthan.gov.in/content/dam/agriculture/Agriculture%20Department/programs-scheme/schemes-programs/soil_123-11.pdf" }
      ],
      confidence: "low",
      media: []
    },

    "sikkim": {
      name: "Sikkim",
      summary: "Sikkim became India's first fully organic state in January 2016, after the state government and contracted agencies certified more than 75,000 hectares of farmland; the state now reports more than 76,000 hectares under organic management with over 66,000 farming families inside the system. All farming is carried out without synthetic fertilisers or pesticides, so soil fertility is maintained by organic inputs rather than mineral fertiliser. The enabling instruments were the State Policy on Organic Farming (2004) and the Sikkim Organic Mission (2010), which together won the Future Policy Gold Award in 2018 against 50 other nominated policies. Verified state-wide soil-test data — pH, organic carbon, NPK, micronutrients — was not obtainable in this research pass.",
      soilTypes: [
        "Mountain and hill soils across the state's steep Himalayan terrain, farmed entirely organically since the 2016 declaration (no verified state-wide soil-classification or area breakdown was obtainable in this pass)",
        "Terraced cropland soils on hill slopes, managed with compost and manure in place of mineral fertiliser"
      ],
      npk: {
        nitrogen: "Not verified at state level in consulted sources — Sikkim's nitrogen supply comes from organic inputs, since no synthetic fertiliser is used anywhere in the state; no Soil Health Card aggregate for Sikkim was obtainable. Nationally 64% of SHC samples test low in nitrogen (CSE 2025 analysis).",
        phosphorus: "Not verified at state level in consulted sources.",
        potassium: "Not verified at state level in consulted sources."
      },
      micronutrients: {
        zinc: "Not verified for Sikkim in consulted sources; national figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        iron: "Not verified for Sikkim in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Sikkim in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Sikkim in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Not verified at state level in consulted sources. The mechanism is documented even where the measurement is not: all Sikkim farming operates without synthetic fertilisers or pesticides, so organic inputs are the sole nutrient and carbon source across more than 76,000 hectares.",
      currentState: "The world's first fully organic state. Since January 2016 all of Sikkim's roughly 76,000 hectares of farmland has been certified organic and worked without synthetic fertilisers or pesticides, making soil-carbon and biological fertility management the state's default practice rather than an intervention.",
      issues: [
        "No verified state-wide soil-test data (pH, organic carbon, NPK, micronutrients) is published in accessible form, so the soil-chemistry outcomes of the organic transition are undocumented here",
        "Steep Himalayan terrain limits cultivable area and exposes terraced soils to erosion",
        "The practical uniformity of the 100% organic claim has been re-examined critically in national reporting (Down To Earth), so on-the-ground consistency across all districts should not be assumed"
      ],
      recommendations: [
        "Publish district-level soil-test aggregates so organic carbon and nutrient trends under the organic system can be tracked, not just certified",
        "Continue compost and manure-based nutrient cycling, which substitutes for mineral fertiliser statewide",
        "Erosion control on steep terraced slopes, where soil loss undercuts organically built fertility",
        "Extend the certification record system to cover nutrient status, not only organic status"
      ],
      districtHighlights: [
        { district: "Gangtok (formerly East Sikkim)", note: "Administrative core of the Sikkim Organic Mission; organic certification is statewide, and no district-level soil-test aggregate was verifiable in consulted sources" },
        { district: "Namchi (formerly South Sikkim)", note: "Southern farming district inside the statewide organic certification covering more than 76,000 hectares" },
        { district: "Gyalshing (formerly West Sikkim)", note: "Western district within the fully organic system; no synthetic fertiliser or pesticide use is permitted anywhere in the state" },
        { district: "Mangan (formerly North Sikkim)", note: "High-altitude northern district; organic certification applies here too, but no district soil-test aggregate was obtainable" }
      ],
      facts: [
        "In January 2016 Sikkim was declared India's first 100% organic state.",
        "More than 75,000 hectares had been certified organic by 2016 when the declaration was made; the state now reports more than 76,000 hectares of organic farmland.",
        "Over 66,000 farming families are part of Sikkim's organic ecosystem.",
        "The Sikkim Organic Mission, formed in 2010, was the nodal agency implementing the state's organic policy; the State Policy on Organic Farming (2004) and the Mission won the Future Policy Gold Award in 2018, beating 50 other nominated policies.",
        "All farming in Sikkim is carried out without synthetic fertilisers and pesticides.",
        "Gap: no Sikkim-specific Soil Health Card or state-wide soil-test aggregate could be verified in this research pass, so NPK, micronutrient and organic carbon values are left unquantified."
      ],
      sources: [
        { title: "Sikkim — the first 100% organic state in the world", publisher: "IFOAM Organics International (Organic Without Boundaries)", url: "https://www.organicwithoutboundaries.bio/2018/10/17/sikkim/", year: 2018 },
        { title: "Sikkim's organic farming policy and Sikkim Organic Mission win the Future Policy Gold Award", publisher: "FAO Agroecology Knowledge Hub", url: "https://www.fao.org/agroecology/slideshow/news-article/en/c/1157015", year: 2018 },
        { title: "Sikkim is 100% organic! Take a second look", publisher: "Down To Earth", url: "https://www.downtoearth.org.in/agriculture/organic-trial-57517" },
        { title: "How Sikkim in India became the world's first fully organic state", publisher: "Forbes", url: "https://www.forbes.com/sites/indrabatilahiri/2025/05/18/how-sikkim-in-india-became-the-worlds-first-fully-organic-state/", year: 2025 }
      ],
      confidence: "medium",
      media: []
    },

    "tamil-nadu": {
      name: "Tamil Nadu",
      summary: "Tamil Nadu's cultivated soils are dominated by red soils and black (regur) soils, with deltaic alluvium in the Cauvery basin. The recurring soil-test signature is low nitrogen against adequate or high phosphorus and potassium: 45% of surveyed paddy-farming households reported low nitrogen on their Soil Health Cards while high phosphorus and potassium were recorded. District appraisals sharpen the picture — Villupuram is predominantly alkaline and non-saline with low organic carbon, low nitrogen, high phosphorus, medium potassium and predominantly deficient zinc, while Kancheepuram shows low nitrogen and potassium with almost all secondary and micronutrients deficient and iron alone sufficient.",
      soilTypes: [
        "Red soils — dominant across the uplands; rich in calcium carbonate, magnesium and potash but low in nitrogen and phosphorus",
        "Black (regur) soils — rich in potash, deficient in nitrogen and phosphorus, with high water retention capacity",
        "Deltaic and riverine alluvium of the Cauvery basin (Thanjavur and the delta districts)",
        "Coastal sandy and laterite soils along the seaboard and uplands"
      ],
      npk: {
        nitrogen: "Low — 45% of surveyed paddy-farming households in Tamil Nadu reported low nitrogen on their Soil Health Cards, and district appraisals for Villupuram, Thanjavur and Kancheepuram all found low available nitrogen.",
        phosphorus: "Medium to high but variable — high phosphorus was recorded in the Soil Health Card survey and available P was high in Villupuram; Thanjavur farm soils tested medium to low, and in Kancheepuram phosphorus was low in acidic soils and high in alkaline soils.",
        potassium: "Medium to high in general, with sharp exceptions — medium in Villupuram, but low in both Thanjavur research-farm soils and Kancheepuram."
      },
      micronutrients: {
        zinc: "Deficient in parts of the state — predominantly deficient in Villupuram and among the deficient micronutrients in Kancheepuram, while Thanjavur farm soils tested sufficient in available zinc.",
        iron: "Generally sufficient — sufficient in both Villupuram and Thanjavur, and the one micronutrient that remained in sufficient status in Kancheepuram.",
        boron: "Patchy — sufficient in Villupuram but deficient in Kancheepuram; no verified state-wide share was obtainable. National figure 23.2% (ICAR-AICRP).",
        sulphur: "Patchy — sufficient in Villupuram but low in Kancheepuram along with calcium and magnesium. National figure 40.5% (ICAR-AICRP)."
      },
      organicCarbon: "Low in the appraised districts — Villupuram soils were low in organic carbon; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      currentState: "Tamil Nadu's soils are characteristically nitrogen-poor but phosphorus- and potassium-adequate, with alkaline rather than acidic reaction the norm in districts like Villupuram. Micronutrient status is highly local, ranging from zinc-deficient-only Villupuram to Kancheepuram, where nearly all secondary nutrients and micronutrients test low and only iron remains sufficient.",
      issues: [
        "Low available nitrogen across appraised districts and in 45% of surveyed farmers' Soil Health Cards",
        "Low organic carbon in appraised districts such as Villupuram",
        "Alkaline soil reaction in districts like Villupuram, which constrains micronutrient availability",
        "Zinc deficiency in red and alkaline soils; near-complete secondary- and micronutrient depletion reported for Kancheepuram (Ca, Mg, S, Zn, Mn, Cu, B all low)",
        "Potassium depletion in specific tracts — Thanjavur research-farm soils and Kancheepuram — despite generally adequate state-level potassium",
        "A gap between soil-test recommendations and actual farmer fertiliser practice, the subject of a dedicated Tamil Nadu survey"
      ],
      recommendations: [
        "Nitrogen-focused, soil-test-based fertiliser recommendations instead of blanket doses, since phosphorus already tests high in much of the state",
        "Cut phosphorus application where soil tests read high (Villupuram, alkaline Kancheepuram soils) to stop further build-up",
        "Targeted zinc application only in districts where zinc tests deficient, and a full secondary/micronutrient package for tracts like Kancheepuram",
        "Raise organic carbon through organic manures and residue incorporation, particularly on low-OC alkaline soils",
        "Close the soil-testing-to-practice gap through extension, since the consulted survey found farmer fertiliser decisions diverging from soil-test recommendations"
      ],
      districtHighlights: [
        { district: "Villupuram", note: "Soil fertility appraisal found the district predominantly alkaline and non-saline, with low organic carbon, low available nitrogen, high available phosphorus, medium potassium, predominantly deficient zinc and sufficient Cu, S, Fe, Mn and B" },
        { district: "Thanjavur", note: "Cauvery delta district; soils of the TNAU Agricultural College and Research Institute tested low in available nitrogen, medium to low in phosphorus and low in available potassium, with sufficient Zn, Cu, Mn and Fe" },
        { district: "Kancheepuram", note: "Available nitrogen and potassium low; phosphorus low in acidic soils and high in alkaline soils; almost all secondary nutrients (Ca, Mg, S) and micronutrients (Zn, Mn, Cu, B) deficient, with iron alone sufficient" }
      ],
      facts: [
        "Among surveyed paddy-farming households in Tamil Nadu, 45% reported low nitrogen content on their soil health cards, while high phosphorus and potassium content was recorded.",
        "Villupuram district soils are predominantly alkaline and non-saline, with low organic carbon, low available nitrogen, high available phosphorus and medium available potassium; zinc is predominantly deficient while copper, sulphur, iron, manganese and boron are sufficient.",
        "Soils of the TNAU Agricultural College and Research Institute, Thanjavur, were low in available nitrogen, medium to low in phosphorus and low in available potassium, but sufficient in zinc, copper, manganese and iron.",
        "In Kancheepuram district, available nitrogen and potassium were low, phosphorus was low in acidic and high in alkaline soils, and almost all secondary and micronutrients were deficient with iron alone sufficient.",
        "Tamil Nadu's red soils are rich in calcium carbonate, magnesium and potash but low in nitrogen and phosphorus; its black soils are rich in potash yet deficient in nitrogen and phosphorus, with high water retention."
      ],
      sources: [
        { title: "Soil Fertility Appraisal for Villupuram District of Tamil Nadu", publisher: "Indian Society of Soil Science", url: "https://www.isss-india.org/downloads/05-R-Santhi.pdf" },
        { title: "Status of Soil Testing and Fertilizer Recommendations by the Farmers of Tamil Nadu", publisher: "Agricultural Science Digest (ARCC Journals)", url: "https://arccjournals.com/journal/agricultural-science-digest/D-5018" },
        { title: "Soil fertility status of Agricultural College and Research Institute, Thanjavur, Tamil Nadu, India", publisher: "peer-reviewed paper (ResearchGate record)", url: "https://www.researchgate.net/publication/372915068_Soil_fertility_status_of_Agricultural_College_and_Research_Institute_Thanjavur_Tamil_Nadu_India", year: 2023 },
        { title: "Fertiliser Consumption and Soil Health Status in Tamil Nadu", publisher: "research paper (Academia.edu record)", url: "https://www.academia.edu/38872670/Fertiliser_Consumption_and_Soil_Health_Status_in_Tamil_Nadu" }
      ],
      confidence: "medium",
      media: []
    },

    "telangana": {
      name: "Telangana",
      summary: "Telangana's cultivated area is dominated by red soils, including the light red chalka sandy soils that are poor in nitrogen and phosphorus, with black cotton (regur) soils in pockets. Soil-test work on paddy-growing red soils of the Central Telangana Zone is stark: of 59 samples, 97% were low in available nitrogen, 90% were high in available phosphorus and 47% were high in available potassium — a textbook picture of nitrogen mining alongside phosphorus build-up. Micronutrient deficiency is comparatively modest where measured: forage-growing soils of Yadadri Bhuvanagiri district were deficient in available zinc in 9.4% and available iron in 10.6% of samples.",
      soilTypes: [
        "Red soils including light red chalka (sandy) soils — dominant; red sandy soils are poor in nitrogen and phosphorus and less fertile",
        "Red loamy and red sandy paddy soils of the Central Telangana Zone, the subject of the state's most detailed published fertility survey",
        "Black cotton (regur) soils — higher in iron and calcium but lower in phosphorus, nitrogen and organic matter"
      ],
      npk: {
        nitrogen: "Low — 97% of 59 paddy-growing red-soil samples from Central Telangana Zone districts tested low in available nitrogen, and red chalka and red sandy soils are separately described as poor in nitrogen.",
        phosphorus: "High — 90% of the same samples tested high in available phosphorus, indicating build-up from continued phosphatic fertiliser application.",
        potassium: "Medium to high — 47% of the Central Telangana Zone paddy soil samples tested high in available potassium."
      },
      micronutrients: {
        zinc: "Deficient in about 9.4% of forage-growing soils sampled in Yadadri Bhuvanagiri district; no verified state-wide share was obtainable. National figure 36.5% (ICAR-AICRP).",
        iron: "Deficient in about 10.6% of the same Yadadri Bhuvanagiri forage soils. National figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Telangana in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Telangana in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Low in the black cotton soils, which are described as containing less organic material along with less phosphorus and nitrogen; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025).",
      currentState: "Telangana's red-soil paddy belts show near-universal nitrogen deficiency — 97% of tested samples low — alongside phosphorus that has built up to high levels in 90% of them. The state's fertiliser problem is therefore one of composition rather than quantity.",
      issues: [
        "Near-universal nitrogen deficiency in paddy-growing red soils — 97% of tested samples low in available nitrogen",
        "Phosphorus build-up: 90% of the same samples high in available phosphorus, implying continued unnecessary phosphatic application",
        "Inherently low fertility of red chalka and red sandy soils, poor in both nitrogen and phosphorus",
        "Low organic matter in black cotton (regur) soils",
        "Localised zinc and iron deficiency — 9.4% and 10.6% of forage-growing soils in Yadadri Bhuvanagiri district"
      ],
      recommendations: [
        "Sharply reduce or stop phosphatic fertiliser on the 90% of red-soil paddy fields testing high in available phosphorus, and redirect spend to nitrogen and organic matter",
        "Soil-test-based, split nitrogen scheduling in paddy on red soils, where 97% of samples test low",
        "Build organic matter on red chalka and black cotton soils to lift their weak nitrogen and organic carbon base",
        "Apply zinc and iron only where soil tests confirm deficiency, as in parts of Yadadri Bhuvanagiri, rather than uniformly",
        "Extend village-level fertility mapping of the kind carried out at Gudur village, Ranga Reddy district"
      ],
      districtHighlights: [
        { district: "Ranga Reddy", note: "Red chalka soil localities including Rajendranagar, Hayathnagar and Saroornagar; also the site of village-level soil fertility status and mapping work at Gudur" },
        { district: "Yadadri Bhuvanagiri", note: "Forage-growing soils here were deficient in available zinc in 9.4% and available iron in 10.6% of samples" },
        { district: "Medchal-Malkajgiri", note: "Medchal, Shameerpet and Quthbullapur are listed among the state's red chalka soil localities — light, sandy, poor in nitrogen and phosphorus" }
      ],
      facts: [
        "Of 59 soil samples from paddy-growing red soils of Central Telangana Zone districts, 97% were low in available nitrogen, 90% were high in available phosphorus and 47% were high in available potassium.",
        "Red chalka soils occur at Medchal, Shameerpet, Quthbullapur, Hayathnagar, Saroornagar and Rajendranagar; red sandy soils are poor in nitrogen and phosphorus and less fertile.",
        "Black cotton (regur) soils of Telangana have higher iron and calcium content but less phosphorus, nitrogen and organic material.",
        "In forage-growing soils of Yadadri Bhuvanagiri district, 9.4% of samples were deficient in available zinc and 10.6% in available iron.",
        "PJTSAU has published district- and village-level fertility surveys for Telangana, including soil fertility status and mapping for Gudur village in Ranga Reddy district."
      ],
      sources: [
        { title: "Soil fertility status of paddy growing red soils of Central Telangana Zone districts of Telangana State, India", publisher: "The Journal of Research PJTSAU (ICAR ePubs)", url: "https://epubs.icar.org.in/index.php/TJRP/article/view/136017" },
        { title: "Soil fertility status of forage growing soils of Yadadri Bhuvanagiri district", publisher: "The Pharma Innovation Journal", url: "https://www.thepharmajournal.com/archives/2022/vol11issue8/PartP/11-8-111-215.pdf", year: 2022 },
        { title: "Soil fertility status and mapping in Gudur Village of Ranga Reddy district", publisher: "The Pharma Innovation Journal", url: "https://www.thepharmajournal.com/archives/2023/vol12issue6/PartAM/12-6-318-690.pdf", year: 2023 },
        { title: "Red Soils of Telangana: types, properties and distribution", publisher: "KPIAS Academy (Telangana geography reference)", url: "https://kpiasacademy.com/red-soils-telangana-types-properties-agriculture/" }
      ],
      confidence: "medium",
      media: []
    },

    "tripura": {
      name: "Tripura",
      summary: "Tripura's soils are acidic, medium in available nitrogen, low in available phosphorus and medium in available potassium, according to the published fertility survey of selected Tripura soils. Available zinc was low in every sample analysed, which the study attributes to the strongly acidic soil reaction. Liming to raise soil pH into the 5.5-7.8 range required for crop productivity is the standard recommendation. The state's red and laterite-group soils are separately described as poor in lime, magnesia, phosphates, nitrogen and humus. No district-level or state-wide Soil Health Card aggregate for Tripura could be verified in this research pass.",
      soilTypes: [
        "Acidic cultivated soils across the state — the surveyed Tripura soils are acidic in reaction (dominant)",
        "Red and laterite-group soils of the eastern-India type — poor in lime, magnesia, phosphates, nitrogen and humus",
        "Valley and terrace soils between the state's north-south hill ranges (no verified area breakdown was obtainable)"
      ],
      npk: {
        nitrogen: "Medium — Tripura soils are medium in available nitrogen content in the consulted state fertility survey, an unusual result against the national picture in which 64% of Soil Health Card samples test low in nitrogen.",
        phosphorus: "Low — the surveyed Tripura soils are low in available phosphorus, consistent with strong phosphorus fixation in acid soils and with the red/laterite group being poor in phosphates.",
        potassium: "Medium — the surveyed Tripura soils are medium in available potassium."
      },
      micronutrients: {
        zinc: "Low in all soil samples analysed in the consulted Tripura fertility survey, which attributes this to the strongly acidic nature of the soils — the state's clearest verified micronutrient gap.",
        iron: "Not reported as deficient in consulted sources; national figure 12.8% (ICAR-AICRP).",
        boron: "Not verified for Tripura in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not verified for Tripura in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Not verified at state level in consulted sources; the state's red and laterite-group soils are described as poor in humus. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      currentState: "An acid-soil hill state whose nitrogen and potassium test medium but whose phosphorus is low and whose zinc was deficient in every sample analysed — a nutrient pattern driven by soil acidity, for which liming to pH 5.5-7.8 is the recommended correction.",
      issues: [
        "Acidic soil reaction across the state's cultivated soils, the underlying driver of its nutrient problems",
        "Low available phosphorus in surveyed soils",
        "Zinc deficiency in all samples analysed, explicitly linked to strong acidity",
        "Red and laterite-group soils poor in lime, magnesia, phosphates, nitrogen and humus",
        "No verified district-level or state-wide soil-test aggregate published in accessible form"
      ],
      recommendations: [
        "Apply agricultural lime to raise soil pH into the 5.5-7.8 range required for crop productivity",
        "Zinc application on the acidic soils where available zinc tested uniformly low",
        "Phosphorus management adapted to acid, phosphorus-fixing soils rather than blanket doses",
        "Combine liming with organic matter addition — raising pH increases microbial activity and improves potassium availability in acidic red soils",
        "Publish district-level soil-test aggregates for the state's districts, which are absent from accessible sources"
      ],
      districtHighlights: [
        { district: "West Tripura", note: "The state-level survey findings (acidic reaction, medium nitrogen, low phosphorus, medium potassium, uniformly low zinc) are reported without district breakdowns; no West Tripura-specific soil-test aggregate was verifiable" },
        { district: "Gomati", note: "Southern-central district within the same acidic red/laterite-group soil belt; no district-level soil-test aggregate was verifiable in consulted sources" },
        { district: "Dhalai", note: "Interior hill district where the state's acidity and low-phosphorus pattern applies; no district-level soil-test aggregate was verifiable in consulted sources" }
      ],
      facts: [
        "Tripura soils are acidic in nature, medium in available nitrogen, low in available phosphorus and medium in available potassium.",
        "Available zinc was low in all Tripura soil samples analysed, which the study attributes to the strongly acidic nature of the soils.",
        "Agricultural lime is recommended to raise soil pH to the 5.5-7.8 level required for crop productivity.",
        "The red and laterite soils of eastern India, the group Tripura belongs to, are poor in lime, magnesia, phosphates, nitrogen and humus.",
        "Liming raises soil pH and microbial activity and improves potassium availability to meet crop uptake in acidic red soils.",
        "Gap: no Tripura Soil Health Card aggregate or district-level soil-test summary could be verified in this research pass."
      ],
      sources: [
        { title: "Fertility Status of Some Selected Soils of Tripura", publisher: "Annals of Plant Sciences", url: "https://www.annalsofplantsciences.com/index.php/aps/article/download/1008/pdf" },
        { title: "Soil pH effects on potassium and phosphorus fertilizer availability and management", publisher: "Nutrien eKonomics", url: "https://nutrien-ekonomics.com/news/soil-ph-effects-potassium-and-phosphorus-fertilizer-availability-and-management/" },
        { title: "Major soil types of India: red soils, lateritic soils and alkaline soils", publisher: "PMF IAS (soil geography reference)", url: "https://www.pmfias.com/indian-soil-types-red-soils-laterite-lateritic-soils-forest-mountain-soils-arid-desert-soils-saline-alkaline-soils-peaty-marshy-soils/" },
        { title: "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data", publisher: "Centre for Science and Environment", url: "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908", year: 2025 }
      ],
      confidence: "low",
      media: []
    },

    "uttar-pradesh": {
      name: "Uttar Pradesh",
      summary: "Uttar Pradesh's farmland sits on Indo-Gangetic alluvium under intensive continuous rice-wheat cropping, and the best-documented soil problem is micronutrient depletion driven by decades of high-analysis NPK fertiliser use. A 200-sample survey of the Hasanganj and Auras blocks of Unnao district in 2020-21 found 39.5% of soils deficient in zinc and 32.5% deficient in boron, and the consulted literature reports that most Uttar Pradesh district soils are zinc-deficient, with copper deficiency in certain pockets. India's NPK consumption ratio of about 6.7:2.4:1 against the ideal 4:2:1 is the mechanism the authors identify. No state-wide Soil Health Card aggregate for Uttar Pradesh could be verified in this research pass.",
      soilTypes: [
        "Indo-Gangetic alluvial soils under intensive continuous rice-wheat cropping — dominant across the plains and the setting of the consulted Unnao and eastern-UP surveys",
        "Eastern Uttar Pradesh alluvial soils, surveyed separately for primary and cationic micronutrient status",
        "Gap: no verified state-wide soil-classification or area breakdown for Uttar Pradesh was obtainable in this research pass"
      ],
      npk: {
        nitrogen: "Not verified at state level in consulted sources — nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis), and India's NPK use ratio of about 6.7:2.4:1 against the ideal 4:2:1 reflects heavy urea application relative to phosphorus and potassium.",
        phosphorus: "Not verified at state level — consulted UP work identifies farmers using more urea and phosphatic fertilisers while neglecting micronutrients as the driver of the state's depletion, rather than giving a tested phosphorus share.",
        potassium: "Not verified at state level in consulted sources."
      },
      micronutrients: {
        zinc: "High deficiency — 39.5% of 200 soil samples from the Hasanganj and Auras blocks of Unnao district were zinc-deficient, and consulted literature reports most Uttar Pradesh district soils deficient in zinc. National figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        iron: "Measured in the Unnao survey, with samples distributed across low, critical and high classes; no state-wide deficiency share was obtainable. National figure 12.8% (ICAR-AICRP).",
        boron: "High deficiency — 32.5% of the Unnao samples were boron-deficient, above the national ICAR-AICRP figure of 23.2%.",
        sulphur: "Not verified for Uttar Pradesh in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      organicCarbon: "Not verified at state level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025). Consulted UP work attributes fertility depletion to continuous intensive cropping, residue burning and inadequate organic and micronutrient inputs.",
      currentState: "The Gangetic-alluvium heartland of the rice-wheat system, where decades of high-analysis NPK fertiliser without micronutrient replacement have made zinc and boron the binding constraints — 39.5% and 32.5% of sampled soils deficient in the Unnao survey — while residue burning and low organic input continue to draw down the nutrient pool.",
      issues: [
        "Zinc deficiency in 39.5% and boron deficiency in 32.5% of sampled soils in Unnao district; most Uttar Pradesh district soils reported zinc-deficient",
        "Copper deficiency observed in certain pockets of the state",
        "Skewed NPK use — India's ratio of about 6.7:2.4:1 against the ideal 4:2:1 — with micronutrients neglected",
        "Intensive continuous rice-wheat cropping with high-yielding varieties exhausting the soil nutrient pool",
        "Residue burning and lower subsidy for micronutrient fertilisers accelerating micronutrient decline",
        "Farmers choosing fertilisers by cost, subsidy and local availability rather than soil-test values, identified as a direct cause of poor soil health",
        "No verified state-wide Soil Health Card aggregate available in accessible form for India's largest agricultural state"
      ],
      recommendations: [
        "Soil-specific, balanced nutrient recommendations in place of cost- and subsidy-driven fertiliser choice",
        "Zinc and boron correction across the alluvial rice-wheat belt, where nearly two-fifths of sampled soils tested zinc-deficient",
        "Shift the NPK ratio towards the ideal 4:2:1 by reducing urea dominance",
        "Stop residue burning and add organic matter to rebuild the soil nutrient pool depleted by continuous cropping",
        "Expand soil testing and farmer awareness of recommendation guidelines, named in the consulted study as a direct lever on soil health"
      ],
      districtHighlights: [
        { district: "Unnao", note: "200 surface soil samples from five villages in each of the Hasanganj and Auras blocks (2020-21) found 39.5% zinc-deficient and 32.5% boron-deficient soils, with copper, iron and manganese also mapped across low, critical and high classes" }
      ],
      facts: [
        "A 200-sample survey of the Hasanganj and Auras blocks of Unnao district in 2020-21 found significant deficiencies, particularly zinc at 39.5% and boron at 32.5% of samples.",
        "Most Uttar Pradesh district soils are reported deficient in zinc, and copper deficiency has been observed in certain pockets of the state.",
        "India's NPK consumption ratio is about 6.7:2.4:1 against the ideal 4:2:1, reflecting urea dominance over phosphorus, potassium and micronutrients.",
        "Intensive continuous rice-wheat cropping with high-yielding varieties, absent micronutrient fertilisers and manures, plus residue burning and low micronutrient subsidy, are identified as the causes of micronutrient depletion in these soils.",
        "Farmers often decide fertiliser use on cost, subsidy and local availability without knowing soil fertility status or crop requirement, which the study identifies as adversely affecting soil health.",
        "Gap: no state-wide Uttar Pradesh Soil Health Card aggregate for NPK or organic carbon could be verified in this research pass, so only the Unnao district survey supplies quantified state evidence here."
      ],
      sources: [
        { title: "Assessment of Micronutrient Deficiencies in Agricultural Soils of Hasanganj and Auras Blocks, Unnao District, Uttar Pradesh: Implications for Sustainable Farming", publisher: "Journal of Experimental Agriculture International", url: "https://sdiopr.s3.ap-south-1.amazonaws.com/2025/JANUARY/16-Jan-2025/JEAI_128378/Revised-ms_JEAI_128378_v1.pdf", year: 2025 },
        { title: "Primary and Cationic Micronutrient Status of Soils in Few Districts of Eastern Uttar Pradesh", publisher: "AGRIS (FAO bibliographic record)", url: "https://agris.fao.org/search/es/records/64747354bf943c8c79830976" },
        { title: "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data", publisher: "Centre for Science and Environment", url: "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908", year: 2025 },
        { title: "CSE assessment finds Indian soils severely deficient in key nutrients", publisher: "Down To Earth", url: "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients", year: 2025 }
      ],
      confidence: "low",
      media: []
    },

    "uttarakhand": {
      name: "Uttarakhand",
      summary: "Uttarakhand's soils are low to medium in fertility overall and split sharply by terrain: Bhabar soils are coarse-textured, sandy to gravelly, highly porous and largely infertile; Tarai soils are rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane; and hill soils range from slightly to extremely acidic on constantly eroding slopes. The state micronutrient mapping study recorded deficiency in 12.0% of samples for iron, 9.7% for molybdenum, 8.3% for zinc and 7.3% for manganese, with 8.0% for sulphur, 4.0% for potassium and 2.3% for calcium. Decreasing organic carbon, imbalanced fertiliser use, water scarcity and high nutrient mining are the constraints named for the state.",
      soilTypes: [
        "Hill soils of the mid and upper Himalaya — slightly to extremely acidic, constantly eroding on steep slopes (dominant by area)",
        "Tarai soils — mostly rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane cultivation",
        "Bhabar soils — coarse-textured, sandy to gravelly, highly porous and largely infertile"
      ],
      npk: {
        nitrogen: "Low to medium — Uttarakhand soils are described as low to medium in fertility status, with low soil organic carbon and high nutrient mining among the state's named constraints; the consulted state micronutrient mapping study did not report a nitrogen deficiency share.",
        phosphorus: "Not quantified at state level in consulted sources.",
        potassium: "Mostly adequate — potassium deficiency was recorded in only 4.0% of samples in the Uttarakhand micronutrient mapping study, alongside calcium at 2.3%."
      },
      micronutrients: {
        zinc: "Deficient in 8.3% of samples in the Uttarakhand micronutrient mapping study — well below the national figure of 36.5% (ICAR-AICRP).",
        iron: "Deficient in 12.0% of samples — the most widespread micronutrient deficiency recorded for the state, close to the national 12.8% (ICAR-AICRP).",
        boron: "Not covered by the consulted Uttarakhand mapping study, which reported zinc, iron, manganese and molybdenum; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Deficient in 8.0% of samples in the same study; molybdenum 9.7% and manganese 7.3% were also mapped."
      },
      organicCarbon: "Declining and low — decreasing organic carbon content in soils is named among the state's major production constraints, alongside low soil organic carbon status in both the hills and the Tarai. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025).",
      currentState: "A two-tier state: fertile Tarai clayey loams supporting rice and sugarcane set against coarse, infertile Bhabar gravels and acidic, constantly eroding hill soils. Organic carbon is declining statewide, and iron (12.0%) and molybdenum (9.7%) are the leading mapped micronutrient gaps.",
      issues: [
        "Decreasing soil organic carbon content and imbalanced fertiliser use, named as major production constraints",
        "Constant soil erosion on steep hill slopes, which reduces fertility further",
        "Soil reaction ranging from slightly to extremely acidic in hill areas",
        "Coarse, sandy to gravelly, highly porous and largely infertile Bhabar soils",
        "Water scarcity in both hill and Tarai areas, plus high nutrient mining",
        "Mapped deficiencies of iron (12.0%), molybdenum (9.7%), zinc (8.3%), sulphur (8.0%), manganese (7.3%), potassium (4.0%) and calcium (2.3%)"
      ],
      recommendations: [
        "Precise, mapping-based micronutrient management — the explicit purpose of the Uttarakhand micronutrient deficiency mapping work",
        "Organic carbon restoration through manures, compost and residue return, since declining OC is a named state constraint",
        "Liming and acid-soil management in the hill districts where reaction runs slight to extremely acidic",
        "Slope stabilisation, terracing and erosion control to stop the fertility loss that steep-slope erosion causes",
        "Village-cluster soil nutrient evaluation and crop planning of the kind carried out for the Patiya cluster in Almora"
      ],
      districtHighlights: [
        { district: "Almora", note: "Soil nutrient evaluation and crop management study for the Patiya village cluster — a hill-district example of cluster-level nutrient assessment feeding crop choice" },
        { district: "Udham Singh Nagar", note: "Tarai district: rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane, but flagged for water scarcity and low organic carbon" },
        { district: "Nainital", note: "Spans the Bhabar foothill belt of coarse, sandy to gravelly, highly porous and largely infertile soils and the acidic mid-hill soils above it" }
      ],
      facts: [
        "Uttarakhand's soils are low to medium in fertility status overall.",
        "Bhabar soils are coarse-textured, sandy to gravelly, highly porous and largely infertile, while Tarai soils are mostly rich clayey loams mixed with fine sand and humus and suited to rice and sugarcane.",
        "Soil reaction in Uttarakhand's hill areas varies from slightly to extremely acidic, and steep slopes cause constant erosion.",
        "The state micronutrient mapping study recorded macronutrient/secondary deficiency in 4.0% of samples for potassium, 2.3% for calcium and 8.0% for sulphur, and micronutrient deficiency in 8.3% for zinc, 12.0% for iron, 7.3% for manganese and 9.7% for molybdenum.",
        "Decreasing organic carbon content and imbalanced fertiliser use are named as major constraints on production, together with water scarcity in the hills and Tarai and high nutrient mining."
      ],
      sources: [
        { title: "Mapping Current Micronutrients Deficiencies in Soils of Uttarakhand for Precise Micronutrient Management", publisher: "peer-reviewed paper (ResearchGate record)", url: "https://www.researchgate.net/publication/286194353_Mapping_Current_Micronutrients_Deficiencies_in_Soils_of_Uttarakhand_for_Precise_Micronutrient_Management" },
        { title: "Soil Nutrient Status of Bhabhar and Hill Areas of Uttarakhand", publisher: "peer-reviewed paper (ResearchGate record)", url: "https://www.researchgate.net/publication/344157655_SOIL_NUTRIENT_STATUS_Of_BHABHAR_AND_HILL_AREAS_Of_UTTARAKHAND", year: 2020 },
        { title: "Uttarakhand — state agricultural profile", publisher: "Indian Council of Agricultural Research", url: "https://icar.org.in/en/node/17293" },
        { title: "Soil Nutrient Evaluation and Crop Management for Sustainable Growth of Patiya Village Cluster in Almora, Uttarakhand", publisher: "Current World Environment", url: "https://www.cwejournal.org/vol16no3/soil-nutrient-evaluation-and-crop-management-for-sustainable-growth-of-patiyavillage-cluster-in-almora--uttarakhand" }
      ],
      confidence: "medium",
      media: []
    },

    "west-bengal": {
      name: "West Bengal",
      summary: "West Bengal's soils split between the Gangetic alluvium of the central and northern plains and the red-laterite plateau of the west. A district-level study of soil status found 65.7% of tested soil acidic and 25.7% alkaline. The lateritic west — Birbhum, Bankura, Purulia, Bardhaman and Paschim Medinipur — has coarse-textured, highly drained, erosion-prone soils at pH about 5.5-6.5, poor in organic matter, calcium, phosphates and nitrogen. Insufficient organic carbon and unbalanced NPK fertilisation are reported across both the alluvial and lateritic zones, and organic carbon correlates positively with the availability of nitrogen, phosphorus, sulphur, boron and manganese, making it the pivotal parameter for the state.",
      soilTypes: [
        "Gangetic alluvial soils — old and new alluvium of the central and northern plains (dominant cultivated group; the old alluvial zone has its own published fertility evaluation)",
        "Red and laterite soils of the western plateau (Birbhum, Bankura, Purulia, Bardhaman, Paschim Medinipur) — coarse-textured, highly drained, erosion-prone, acidic at pH about 5.5-6.5, poor in organic matter, calcium, phosphates and nitrogen",
        "Tarai soils of the northern districts, the subject of separate studies on organic carbon and nitrogen distribution"
      ],
      npk: {
        nitrogen: "Low — the red and laterite soils of the western plateau are specifically poor in nitrogen, and insufficient organic carbon with unbalanced NPK fertilisation is reported across both alluvial and lateritic zones. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025). No verified state-wide tested share was obtainable.",
        phosphorus: "Low in the red-laterite zone, which is described as poor in phosphates; organic carbon correlates positively with available phosphorus, tying P supply to the state's carbon deficit. No verified state-wide tested share was obtainable.",
        potassium: "Not verified at state level in consulted sources; unbalanced NPK fertilisation is reported as a state-wide problem."
      },
      micronutrients: {
        zinc: "Deficiency reported among the state's widespread micronutrient gaps, alongside copper, boron and iron; the figures in the consulted source were given in an ambiguous unit, so no percentage is quoted here. National figure 36.5% (ICAR-AICRP).",
        iron: "Reported among the widespread micronutrient deficiencies of the state, but without an interpretable state-wide percentage in consulted sources. National figure 12.8% (ICAR-AICRP).",
        boron: "Reported among the widespread micronutrient deficiencies of the state; organic carbon correlates positively with available boron. National figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        sulphur: "Not separately quantified for West Bengal; organic carbon correlates positively with available sulphur, tying sulphur supply to the state's organic carbon deficit. National figure 40.5% (ICAR-AICRP)."
      },
      organicCarbon: "Insufficient across both alluvial and lateritic regions, with the red-laterite zone specifically poor in organic matter. Organic carbon shows a significant positive correlation with the availability of nitrogen, phosphorus, sulphur, boron and manganese, which makes it the compelling parameter for maintaining balanced soil health in the state.",
      currentState: "A predominantly acidic-soil state — 65.7% of tested samples acidic against 25.7% alkaline — where the organic carbon deficit is the central problem, because it simultaneously limits nitrogen, phosphorus, sulphur, boron and manganese availability. The deficit is worst on the coarse, well-drained, erosion-prone red-laterite soils of the western districts.",
      issues: [
        "65.7% of tested soils acidic, against 25.7% alkaline, in the district-level state soil status study",
        "Insufficient organic carbon in both alluvial and lateritic zones, coupled with unbalanced NPK fertilisation",
        "Coarse-textured, highly drained, erosion-prone red-laterite soils of the western plateau, poor in available nutrients",
        "Poor calcium, phosphate and nitrogen status in the laterite belt (pH about 5.5-6.5)",
        "Widespread micronutrient deficiencies reported for copper, boron, zinc and iron",
        "Soil fertility degradation identified as a constraint on the state's agricultural productivity"
      ],
      recommendations: [
        "Raise organic carbon as the primary lever, since it governs available nitrogen, phosphorus, sulphur, boron and manganese simultaneously",
        "Liming and acidity management on the 65.7% of soils testing acidic, especially the western laterite belt",
        "Erosion control and organic matter retention on the coarse, well-drained lateritic soils",
        "Replace the unbalanced NPK application reported for both alluvial and lateritic zones with soil-test-based balanced fertilisation",
        "Correct copper, boron, zinc and iron where soil tests confirm deficiency, rather than blanket micronutrient application"
      ],
      districtHighlights: [
        { district: "Birbhum", note: "Red-laterite belt district: coarse-textured, highly drained, erosion-prone soils at pH about 5.5-6.2, poor in available nutrients" },
        { district: "Bankura", note: "Western plateau laterite district, red in colour and acidic, poor in organic matter, calcium, phosphates and nitrogen" },
        { district: "Purulia", note: "Westernmost plateau district in the laterite group, with the same acidic, coarse, nutrient-poor profile" },
        { district: "Paschim Medinipur", note: "Southern edge of the red-laterite zone (listed as West Midnapore in consulted sources), erosion-prone and acidic" }
      ],
      facts: [
        "A district-level study of West Bengal soil status found 65.7% of tested soil acidic and 25.7% alkaline.",
        "Laterite soil occurs in the western plateau region — parts of Birbhum, Bardhaman, Bankura, Purulia and Paschim Medinipur — is red, acidic at roughly pH 5.5-6.5, and poor in organic matter, calcium, phosphates and nitrogen.",
        "Red laterite soils of Birbhum, Bankura and Paschim Medinipur are coarse in texture, highly drained, erosion-prone, acidic at pH 5.5-6.2 and poor in available nutrients.",
        "Insufficient organic carbon and unbalanced NPK fertilisation are prevalent across both the alluvial and lateritic regions of West Bengal.",
        "Organic carbon has a significant positive correlation with the availability of nitrogen, phosphorus, sulphur, boron and manganese, indicating its compelling role in maintaining balanced soil health.",
        "Widespread micronutrient deficiencies were recorded for copper, boron, zinc and iron in the consulted West Bengal soil-fertility work."
      ],
      sources: [
        { title: "A Geographical Study on District Level Soil Status of West Bengal", publisher: "Journal of Emerging Technologies and Innovative Research (JETIR)", url: "https://www.jetir.org/papers/JETIR1808324.pdf", year: 2018 },
        { title: "Evaluation of Soil Fertility Status in Old Alluvial Zone of West Bengal", publisher: "peer-reviewed paper (Academia.edu record)", url: "https://www.academia.edu/29849208/EVALUATION_OF_SOIL_FERTILITY_STATUS_IN_OLD_ALLUVIAL_ZONE_OF_WEST_BENGAL" },
        { title: "Soil Fertility Degradation and Agricultural Productivity in West Bengal", publisher: "EAS Publisher", url: "https://www.easpublisher.com/get-articles/5254" },
        { title: "Constraints in Agricultural Productivity of Lateritic Soil of West Bengal", publisher: "Redshine Archive", url: "https://chapters.redshine.in/index.php/redshine/article/view/39" }
      ],
      confidence: "medium",
      media: []
    }

  }
};
