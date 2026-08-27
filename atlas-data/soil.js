// data/soil.js — Soil Health
// Compiled from internet research; merged from chunked research parts on 2026-08-08.
window.INDIA_DATA = window.INDIA_DATA || {};
window.INDIA_DATA.soil = {
  "meta": {
    "tab": "soil",
    "title": "Soil Health",
    "compiledOn": "2026-08-08",
    "coverage": "All 28 states + 8 union territories",
    "primarySources": [
      "Soil Health Card portal (soilhealth.dac.gov.in)",
      "ICAR-IISS soil fertility reports",
      "State agriculture department reports"
    ],
    "qc": {
      "status": "pending",
      "checkedOn": null,
      "notes": ""
    }
  },
  "states": {
    "andaman-nicobar": {
      "name": "Andaman & Nicobar Islands",
      "summary": "ICAR characterises the islands' soils as moderately deep, acidic and low in fertility, formed under a humid tropical, high-rainfall forested setting. Profile studies report strongly acidic reaction (pH about 4.7-5.7 on uplands) with organic carbon from 0.2% to 1.2%, yet a Down To Earth analysis of Soil Health Card samples (2015-19) placed this UT among the seven states/UTs with more than 90% of tested samples deficient in organic carbon. The UT lies outside the 28-state ICAR-AICRP micronutrient survey, so no verified micronutrient percentages exist for it.",
      "soilTypes": [
        "Acidic ferruginous/red loamy island soils on uplands (dominant; pH about 4.7-5.7)",
        "Sandy coastal soils",
        "Alluvial valley soils and marshy mangrove-fringe soils"
      ],
      "npk": {
        "nitrogen": "Low to medium — ICAR describes island soils as low in fertility; no UT-wide Soil Health Card aggregate for available N was verifiable in consulted sources",
        "phosphorus": "Low — strongly acidic, high-rainfall island soils fix phosphorus; a UT-specific tested share was not published in consulted sources",
        "potassium": "Medium (unverified) — no UT-wide figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported — the UT lies outside the 28-state ICAR-AICRP micronutrient survey (Shukla et al. 2021)",
        "iron": "Not reported in sources consulted for this UT",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "Profile studies report 0.2-1.2% organic carbon (medium to high under forest cover), but SHC 2015-19 sample analysis (Down To Earth) listed A&N among seven states/UTs with over 90% of tested farm samples deficient in organic carbon",
      "currentState": "Agriculture occupies a narrow band between forest and coast on acidic upland and coastal soils; soil-testing coverage is small, and ICAR-CIARI (Port Blair) is the islands' soil and land-resource research institution.",
      "issues": [
        "Strong soil acidity (upland pH about 4.7-5.7) limiting phosphorus and base availability",
        "Organic-carbon deficiency in more than 90% of SHC-tested farm samples (2015-19 analysis) despite forest-rich surroundings",
        "Soil erosion on sloping island terrain (assessed by an RMMF-based GIS study of the Andaman ecosystem)",
        "Very thin published soil-testing data compared with mainland states"
      ],
      "recommendations": [
        "Soil-test-based liming and phosphorus management on acidic uplands",
        "Organic-matter recycling (plantation residues, compost) to rebuild carbon in cultivated plots",
        "Use the Soil Health Card portal's UT dashboard for current sample aggregates before fertiliser planning",
        "Erosion control (cover crops, contour measures) on sloping cultivated land per CIARI soil-conservation research"
      ],
      "districtHighlights": [
        {
          "district": "South Andaman",
          "note": "Seat of ICAR-CIARI (Port Blair), the islands' agricultural and soil research institute"
        },
        {
          "district": "North & Middle Andaman",
          "note": "Main farming belt of the Andaman group; acidic upland and valley soils"
        },
        {
          "district": "Nicobar",
          "note": "Remote island district with minimal published soil-testing data; coconut-dominated coastal soils"
        }
      ],
      "facts": [
        "ICAR's state profile describes Andaman & Nicobar soils as moderately deep, acidic and low in fertility.",
        "Upland island soils are strongly acidic (pH about 4.7-5.7) with organic carbon ranging 0.2-1.2% in profile studies.",
        "A Down To Earth analysis of SHC samples (2015-19) placed A&N among the seven states/UTs with >90% of samples deficient in organic carbon.",
        "The 2021 ICAR-AICRP micronutrient survey (2,42,827 samples) covered 615 districts in 28 states — this UT was outside its coverage.",
        "ICAR-CIARI, Port Blair runs the islands' soil and water conservation research."
      ],
      "sources": [
        {
          "title": "Andaman and Nicobar Islands — state profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17297"
        },
        {
          "title": "How nutrient-deficient are Indian soils? (SHC 2015-19 analysis)",
          "publisher": "Down To Earth",
          "url": "https://www.downtoearth.org.in/agriculture/how-nutrient-deficient-are-indian-soils--82732"
        },
        {
          "title": "Application of RMMF-Based GIS Model for Soil Erosion Assessment in Andaman Ecosystem",
          "publisher": "Land (MDPI)",
          "url": "https://www.mdpi.com/2073-445X/12/5/1083",
          "year": 2023
        },
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "andhra-pradesh": {
      "name": "Andhra Pradesh",
      "summary": "Red and laterite soils cover about 66% of Andhra Pradesh, with black soils (25%), deltaic alluvium (5%) and coastal sands (3%); the Krishna-Godavari delta alluvium is the state's most fertile tract. Red soils are inherently low in nitrogen and humus, and micronutrient pressure is heavy: the ICAR-AICRP national survey lists AP among states with more than 50% of soils zinc-deficient, while ICRISAT documents widespread sulphur, boron and zinc deficiency in its semi-arid drylands.",
      "soilTypes": [
        "Red and laterite soils (about 66% of area; red loamy and red sandy, dominant in Rayalaseema)",
        "Black cotton soils (about 25% of area)",
        "Deltaic alluvial soils of the Krishna-Godavari deltas (about 5%)",
        "Coastal sandy and saline soils (about 3%)"
      ],
      "npk": {
        "nitrogen": "Low — red soils covering two-thirds of the state are low in nitrogenous material and humus, and black-soil tracts also test low in N; ANGRAU village fertility surveys flag available N among the key constraints",
        "phosphorus": "Low to medium — black cotton soils are reported low in phosphorus; deltaic alluvium is better supplied",
        "potassium": "High to medium — potassium was not among the constraints flagged in consulted AP surveys, in line with the generally potash-rich pattern of Indian soils"
      },
      "micronutrients": {
        "zinc": "High deficiency — more than 50% of AP soils are zinc-deficient per the ICAR-AICRP national survey (Shukla et al. 2021); digital soil maps built from 2016-17 SHC data put about 32% of cultivated land zinc-deficient",
        "iron": "Deficiency flagged alongside N, S and Zn as a constraint in ANGRAU village-level fertility surveys",
        "boron": "Deficient in dryland tracts — ICRISAT reports widespread boron deficiency in semi-arid-tropic dryland soils including AP; SHC-era estimates put about 33% of samples deficient",
        "sulphur": "Deficient — about 20-24% of SHC samples deficient, and ICRISAT dryland surveys flag S among the region's principal deficiencies"
      },
      "organicCarbon": "Low in red-soil and dryland tracts — low organic matter is cited (with high clay and CaCO3) as a driver of the state's zinc deficiency",
      "currentState": "Intensively cropped deltas remain productive while red-soil and dryland (Rayalaseema-type) tracts show multi-nutrient depletion (N, S, Zn, B, Fe); AP ran one of India's larger zinc-sulphate input-subsidy programmes in response.",
      "issues": [
        "Zinc deficiency in more than half of surveyed soils (ICAR-AICRP 2021)",
        "Widespread sulphur and boron deficiency in semi-arid dryland tracts (ICRISAT)",
        "Low nitrogen and humus in the red soils that cover about two-thirds of the state",
        "Iron deficiency reported in village fertility surveys"
      ],
      "recommendations": [
        "Soil-test-based zinc sulphate application in deficient blocks (AP has run zinc input-subsidy programmes)",
        "Sulphur sources (gypsum/SSP) in dryland oilseed-pulse systems per ICRISAT findings",
        "Organic-carbon build-up via residue recycling and FYM to improve micronutrient availability",
        "Balanced NPK per Soil Health Card recommendations rather than N-heavy dosing"
      ],
      "districtHighlights": [
        {
          "district": "Anantapur",
          "note": "Semi-arid Rayalaseema dryland district in the tract where ICRISAT documents widespread S, B and Zn deficiency"
        },
        {
          "district": "Sri Potti Sriramulu Nellore",
          "note": "Red and associated soils studied under the Somasila project; zinc and iron constraints reported in profile studies"
        },
        {
          "district": "East Godavari",
          "note": "Godavari delta alluvium — part of the state's most fertile soil tract"
        },
        {
          "district": "Guntur",
          "note": "Krishna delta and black-soil belt; intensive chilli-cotton cropping on Vertisol-type soils"
        }
      ],
      "facts": [
        "Red and laterite (66%), black (25%), alluvial (5%) and coastal (3%) soils make up Andhra Pradesh's soil cover.",
        "AP is among the 13 states where the ICAR-AICRP survey found more than 50% of soils zinc-deficient.",
        "Digital soil maps from 2016-17 SHC data estimated about 32% of AP's cultivated land zinc-deficient; SHC-era estimates put boron deficiency near 33% and sulphur near 20-24% of samples.",
        "ICRISAT reports widespread deficiencies of sulphur, boron and zinc in dryland soils of the Indian semi-arid tropics, which include large parts of AP.",
        "Red soils of the state are described as light, well-drained but low in nitrogenous material and humus."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Widespread deficiencies of sulphur, boron and zinc in dryland soils of the Indian semi-arid tropics",
          "publisher": "ICRISAT (OAR repository)",
          "url": "https://oar.icrisat.org/2471/"
        },
        {
          "title": "Designing better input support programs: Lessons from zinc subsidies in Andhra Pradesh, India",
          "publisher": "PLoS ONE (via PubMed Central)",
          "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7714421/",
          "year": 2020
        },
        {
          "title": "Soils of Andhra Pradesh",
          "publisher": "Andhra Pradesh PSC Exam Notes (soil-group shares)",
          "url": "https://andhrapradesh.pscnotes.com/andhra-general-studies/soils-of-andhra-pradesh/"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "arunachal-pradesh": {
      "name": "Arunachal Pradesh",
      "summary": "Arunachal Pradesh's mountain soils are moderately deep, acidic and low in phosphorus (ICAR state profile), but rich in organic carbon and nitrogen under dense forest cover. Surveyed agroecosystems show organic carbon of 0.92-3.09%, total N of 0.19-0.37%, low available phosphorus (about 10-16 kg/ha) and moderate potassium (about 123-213 kg/ha). Shifting (jhum) cultivation, soil acidity and slope erosion are the defining constraints; state-level AICRP micronutrient percentages were not retrievable.",
      "soilTypes": [
        "Acidic mountain/forest soils (Inceptisol-Entisol associations; dominant)",
        "Alluvial soils of river-valley terraces (Siang, Lohit, Subansiri belts)",
        "Steep-slope skeletal soils at higher elevations"
      ],
      "npk": {
        "nitrogen": "Medium to high — soils are reported rich in organic carbon and nitrogen (total N 0.19-0.37% in surveyed agroecosystems), though inorganic N is low to medium",
        "phosphorus": "Low — ICAR characterises the state's soils as acidic and low in phosphorus; available P measured about 10.2-16.0 kg/ha across surveyed land uses",
        "potassium": "Medium — available K about 123-213 kg/ha (moderate) in surveyed agroecosystems"
      },
      "micronutrients": {
        "zinc": "Not verified — Arunachal Pradesh was within the 28-state ICAR-AICRP survey, but its state-wise figure was not retrievable in this compilation",
        "iron": "Not verified for this state in consulted sources",
        "boron": "Not verified for this state in consulted sources",
        "sulphur": "Not verified for this state in consulted sources"
      },
      "organicCarbon": "High — 0.92-3.09% across surveyed land-use systems; jhum-fallow dynamics studied under a National Mission for Sustainable Himalayan Ecosystem project",
      "currentState": "Farming splits between settled valley terraces and jhum slopes; acidity and terrain rather than intensive nutrient mining define soil condition, and organic-carbon stocks remain comparatively high under forest.",
      "issues": [
        "Soil acidity limiting phosphorus, calcium and magnesium availability",
        "Erosion and fertility decline on jhum-cultivated slopes with shortened (3-5 year) cycles",
        "Sparse soil-testing coverage relative to mainland states"
      ],
      "recommendations": [
        "Lime-based amelioration of strongly acidic cultivated soils, guided by soil tests",
        "Phosphorus management (including P-solubilising biofertilisers trialled in the state's acid soils)",
        "Agroforestry, terracing and longer jhum cycles to protect slope soils and organic carbon",
        "Use the SHC portal's state dashboard for current sample aggregates"
      ],
      "districtHighlights": [
        {
          "district": "East Siang",
          "note": "Pasighat area — Siang valley terraces; subject of a dedicated agricultural-landscape soil study"
        },
        {
          "district": "Lower Subansiri",
          "note": "Ziro valley's terraced wet-rice system, a long-standing indigenous soil-fertility management landscape"
        },
        {
          "district": "Papum Pare",
          "note": "Capital-region district mixing settled valley agriculture with jhum on slopes"
        }
      ],
      "facts": [
        "ICAR describes Arunachal soils as moderately deep, acidic and low in phosphorus, with jhum cultivation and acidity the major production constraints.",
        "Surveyed agroecosystems report organic carbon 0.92-3.09%, total N 0.19-0.37%, available P about 10.2-16.0 kg/ha and available K about 123-213 kg/ha.",
        "Soils are rich in organic carbon and nitrogen but low in phosphorus, calcium and magnesium.",
        "Soil erosion is a recognised problem where jhum is practised on hill slopes in 3-5 year cycles.",
        "The state's AICRP micronutrient figures could not be verified from accessible sources; the entry flags this gap."
      ],
      "sources": [
        {
          "title": "Arunachal Pradesh — state profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17258"
        },
        {
          "title": "Soil physico-chemical properties under four agroecosystems in Arunachal Pradesh, Eastern Himalaya",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/286559928_Soil_physico-chemical_properties_under_four_agroecosystems_in_Arunachal_Pradesh_Eastern_Himalaya"
        },
        {
          "title": "Dynamics of soil organic carbon of jhum agriculture land-use system in the heterogeneous hill of Arunachal Pradesh, India",
          "publisher": "Scientific Reports (Nature)",
          "url": "https://www.nature.com/articles/s41598-023-38421-1",
          "year": 2023
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "assam": {
      "name": "Assam",
      "summary": "Assam farms the alluvial plains of the Brahmaputra and Barak valleys, flanked by acidic hill and lateritic soils. Acidity is the defining chemical constraint — a lower-Brahmaputra survey found a majority (51%) of samples very strongly acidic (pH 4.5-5.0) — while the ICAR-AICRP national survey lists Assam among states with more than 50% of soils zinc-deficient, and about 44% of the state's alluvial soils are boron-deficient (34% of lateritic soils).",
      "soilTypes": [
        "Alluvial soils of the Brahmaputra and Barak valleys (dominant)",
        "Acidic piedmont and hill soils",
        "Lateritic soils",
        "Peaty/marshy lowland (beel) soils"
      ],
      "npk": {
        "nitrogen": "Medium — valley soils are comparatively organic-matter- and nitrogen-rich; AAU zone studies record the highest available N and organic carbon in the Upper Brahmaputra Valley Zone",
        "phosphorus": "Low to medium — strong acidity (51% of surveyed lower-valley samples at pH 4.5-5.0) constrains phosphorus availability",
        "potassium": "Medium (state aggregate unverified) — zone studies show wide variation, with lighter-textured floodplain soils testing lower"
      },
      "micronutrients": {
        "zinc": "High deficiency — Assam is among the states where more than 50% of soils are zinc-deficient (ICAR-AICRP survey, Shukla et al. 2021)",
        "iron": "Not a flagged deficiency in consulted Assam studies (strongly acidic soils keep Fe available)",
        "boron": "High deficiency — about 44% of Assam's alluvial soils and 34% of lateritic soils are boron-deficient (0.5 mg/kg critical limit); zone-wise deficiency runs from 28% (Upper Brahmaputra Valley) to 36% (Lower Brahmaputra Valley)",
        "sulphur": "Not verified state-wide — AAU zone studies found boron status positively correlated with available sulphur, but no state deficiency share was retrievable"
      },
      "organicCarbon": "Medium to high in valley soils, highest in the Upper Brahmaputra Valley Zone; boron availability correlates positively with organic carbon in AAU studies",
      "currentState": "A flood-prone alluvial rice system where strong acidity, zinc deficiency (>50% of soils) and boron deficiency in light-textured, low-organic-matter floodplain sites are the main fertility constraints, compounded by annual flooding and sand deposition.",
      "issues": [
        "Strong soil acidity — a majority of surveyed lower-valley samples fall at pH 4.5-5.0",
        "Zinc deficiency in more than half of soils (ICAR-AICRP 2021)",
        "Boron deficiency in about 44% of alluvial soils, worst in the Lower Brahmaputra Valley Zone",
        "Flood-borne sand deposition and erosion on the Brahmaputra floodplain"
      ],
      "recommendations": [
        "Lime application on strongly acidic soils, dosed by soil test",
        "Zinc sulphate in deficient rice blocks per SHC results",
        "Borax application in deficient blocks, prioritising the Lower Brahmaputra Valley Zone",
        "Maintain organic-matter inputs — boron and nitrogen availability in Assam soils track organic carbon"
      ],
      "districtHighlights": [
        {
          "district": "Dibrugarh",
          "note": "Upper Brahmaputra Valley Zone — highest organic carbon and available N, and the lowest zone-level boron deficiency (about 28%)"
        },
        {
          "district": "Kamrup",
          "note": "Lower Brahmaputra Valley Zone, the zone with the state's highest surveyed boron deficiency (about 36%)"
        },
        {
          "district": "Morigaon",
          "note": "Subject of a dedicated study on boron availability under different cropping systems"
        },
        {
          "district": "Dhemaji",
          "note": "Jiyadhol river-basin landform study assessed soil fertility of this flood-prone district"
        }
      ],
      "facts": [
        "About 44% of Assam's alluvial soils and 34% of its lateritic soils are boron-deficient at the 0.5 mg/kg critical limit.",
        "Zone studies put boron deficiency at 36% in the Lower Brahmaputra Valley Zone and 28% in the Upper Brahmaputra Valley Zone.",
        "Assam is among the states with more than 50% of soils zinc-deficient in the ICAR-AICRP national survey.",
        "A lower-Brahmaputra valley survey found all sampled soils acidic, with 51% very strongly acidic (pH 4.5-5.0).",
        "The Upper Brahmaputra Valley Zone records higher clay, organic carbon, CEC, available N and P than the state's other agro-climatic zones."
      ],
      "sources": [
        {
          "title": "To study the availability of boron status under different agro-climatic zones in soils of Assam",
          "publisher": "Assam Agricultural University (journal reprint)",
          "url": "https://www.academia.edu/91129446/To_study_the_availability_of_boron_status_under_different_agro_climatic_zone_in_soils_of_Assam"
        },
        {
          "title": "Boron in Soil Plant System and Its Significance in Indian Agriculture",
          "publisher": "Ecology, Environment and Conservation (review)",
          "url": "https://www.envirobiotechjournals.com/EEC/vol28issue2/EEC-57.pdf"
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Fertility capability classification (FCC) of soils of a lower Brahmaputra valley area of Assam",
          "publisher": "Journal reprint (Academia.edu)",
          "url": "https://www.academia.edu/129774263/Fertility_capability_classification_FCC_of_soils_of_a_lower_Brahmaputra_valley_area_of_Assam_India"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "bihar": {
      "name": "Bihar",
      "summary": "Bihar farms Gangetic alluvium — calcareous across much of the north plain, with Terai soils along the foothills and a red-lateritic fringe in the south. Zinc is the headline deficiency: a 2024 Frontiers in Soil Science review estimates about 67% of Bihar soils zinc-deficient, the highest of the three eastern states it compared, driven by calcareousness, high pH and low organic carbon. Available N runs very low in surveyed districts (about 90% of samples deficient in some Muzaffarpur blocks).",
      "soilTypes": [
        "Gangetic alluvial soils (dominant)",
        "Calcareous alluvial soils of the north Bihar plain",
        "Terai soils of the northern foothill belt",
        "Red-lateritic soils of the southern fringe",
        "Tal/diara seasonal floodplain soils"
      ],
      "npk": {
        "nitrogen": "Low — available N measured 119.9-319.1 kg/ha in a Muzaffarpur geospatial survey, with about 90% of samples deficient in some blocks; alluvial soils of the state are characteristically N-deficient",
        "phosphorus": "Low to medium — available N and P were both recorded very low in surveyed Muzaffarpur blocks; state soil references describe alluvium as deficient in N and P",
        "potassium": "Medium to high — Bihar's alluvial soils are rich in potash and lime per state soil references"
      },
      "micronutrients": {
        "zinc": "High deficiency — about 67% of Bihar soils estimated zinc-deficient (Frontiers in Soil Science 2024, using ICAR-AICRP data); more than 50% of sampled sites in 16 districts were Zn-deficient in a separate eastern-India assessment",
        "iron": "Deficiency reported in calcareous, high-pH tracts, though no verified state-wide share was found in consulted sources",
        "boron": "Elevated risk in calcareous and coarse-textured soils common in north Bihar; state-wide share not verified in consulted sources",
        "sulphur": "Deficient in calcareous tracts — the long-term RPCAU Pusa experimental soils are described as deficient in sulphur and zinc; no state-wide share verified"
      },
      "organicCarbon": "Low to medium — 34% of Soil Intelligence System samples across the UP-Bihar-Odisha survey area tested low in organic carbon; Pusa-area calcareous soils are medium in OC",
      "currentState": "A rice-wheat-dominated alluvial plain where calcareousness and low organic carbon keep zinc (about 67% of soils) and iron availability poor, while available nitrogen is severely short in surveyed districts.",
      "issues": [
        "Zinc deficiency estimated at about 67% of soils — among the highest state levels in India",
        "Calcareous, high-pH soils across north Bihar locking up micronutrients",
        "Very low available nitrogen in surveyed districts",
        "Recurrent flooding (north) and seasonal waterlogging of tal/diara lands complicating nutrient management"
      ],
      "recommendations": [
        "Soil-test-based zinc sulphate application in rice-wheat systems, prioritising calcareous tracts (long-term Pusa trials show yield and soil-Zn gains)",
        "Green manuring, residue incorporation and FYM to lift organic carbon",
        "Balanced NPK per Soil Health Card recommendations instead of urea-dominant dosing",
        "Iron management (foliar ferrous sulphate) where deficiency is confirmed in calcareous soils"
      ],
      "districtHighlights": [
        {
          "district": "Muzaffarpur",
          "note": "GPS/GIS soil-fertility mapping found available N and P very low — N about 90% deficient in some blocks"
        },
        {
          "district": "Samastipur",
          "note": "Home of RPCAU Pusa, whose calcareous experimental soils (running trials since 1985) are inherently deficient in zinc and sulphur"
        },
        {
          "district": "Patna",
          "note": "With Vaishali and Saran, subject of a spatial-variability study of soil chemical properties along the Ganga; includes tal seasonal-flood lands"
        },
        {
          "district": "Vaishali",
          "note": "Ganga-adjoining district in the same spatial-variability study; calcareous alluvial plain"
        }
      ],
      "facts": [
        "About 67% of Bihar soils are estimated zinc-deficient — versus 29% in Uttar Pradesh and 48% in Odisha (Frontiers in Soil Science, 2024).",
        "Of 3,182 Soil Intelligence System samples across UP, Bihar and Odisha, 48% were Zn-deficient, 49% calcareous and 34% low in organic carbon.",
        "Available nitrogen in a Muzaffarpur district survey ranged 119.9-319.1 kg/ha, about 90% deficient in some blocks.",
        "High pH, calcareousness, coarse texture, low organic carbon and intense cultivation are the stated drivers of zinc deficiency in these soils.",
        "An SHC-based national analysis (>30 million samples, 2015-19) rates 39% of Indian soils zinc-deficient, with Bihar well above that average."
      ],
      "sources": [
        {
          "title": "Soil zinc surveillance frameworks can inform human nutrition studies: opportunities in India",
          "publisher": "Frontiers in Soil Science (Rothamsted/NERC co-authored)",
          "url": "https://www.frontiersin.org/journals/soil-science/articles/10.3389/fsoil.2024.1421652/full",
          "year": 2024
        },
        {
          "title": "Geospatial Analysis of Soil Fertility in Muzaffarpur District, Bihar, India",
          "publisher": "SSRN / journal preprint",
          "url": "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4879093",
          "year": 2024
        },
        {
          "title": "Long-Term Zinc Fertilization in Calcareous Soils Improves Wheat Productivity and Soil Zinc Status in the Rice-Wheat Cropping System (RPCAU Pusa)",
          "publisher": "Agronomy (MDPI)",
          "url": "https://www.mdpi.com/2073-4395/11/7/1306",
          "year": 2021
        },
        {
          "title": "Spatial Variability of Soil Chemical Properties in Patna, Vaishali and Saran Districts Adjoining the Ganga River, Bihar",
          "publisher": "International Journal of Bio-resource and Stress Management",
          "url": "https://ojs.pphouse.org/index.php/IJBSM/article/view/4212",
          "year": 2022
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "chandigarh": {
      "name": "Chandigarh",
      "summary": "Chandigarh is a single-district, city-dominated UT on the Indo-Gangetic alluvial plain at the Shivalik foothills, with very little remaining farmland. No UT-specific soil-health aggregate could be verified from consulted sources, and the UT lies outside the 28-state ICAR-AICRP micronutrient survey; quantitative fields are flagged rather than estimated.",
      "soilTypes": [
        "Indo-Gangetic alluvial soils of the Shivalik piedmont plain"
      ],
      "npk": {
        "nitrogen": "Low — Indo-Gangetic alluvium is characteristically deficient in nitrogen and humus, though no Chandigarh-specific SHC aggregate was found in consulted sources",
        "phosphorus": "Medium (unverified) — no UT-specific figure found in consulted sources",
        "potassium": "Medium to high — alluvial soils of the plains are generally potash-rich; no UT-specific aggregate published in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported — the UT lies outside the 28-state ICAR-AICRP micronutrient survey",
        "iron": "Not reported in sources consulted for this UT",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "No verified UT-level figure in consulted sources; regional alluvial soils are humus-poor",
      "currentState": "Urbanisation has reduced cultivation to a small peri-urban fringe; soil-testing volumes are correspondingly tiny and published UT-level soil-health statistics are effectively absent.",
      "issues": [
        "Near-total urbanisation of the land base, leaving minimal agricultural soil to monitor",
        "Absence of published UT-level soil-health aggregates in accessible sources"
      ],
      "recommendations": [
        "Refer to the SHC portal's UT dashboard for any current sample data",
        "Protect remaining peri-urban farm and green-belt soils from debris dumping and sealing"
      ],
      "districtHighlights": [
        {
          "district": "Chandigarh",
          "note": "The UT's only district; farmland is a small peri-urban fringe of the planned city on Shivalik-piedmont alluvium"
        }
      ],
      "facts": [
        "Chandigarh is a one-district UT covered by the national SHC scheme, but no UT-specific nutrient aggregate was verifiable in consulted sources.",
        "The 2021 ICAR-AICRP micronutrient survey covered the 28 states and did not report this UT.",
        "The UT's soils belong to the Indo-Gangetic alluvial plain at the Shivalik foothills.",
        "Nationally, over 25 crore Soil Health Cards had been distributed to farmers as of July 2025 (PIB)."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Soil Health Card — 'Swasth Dharaa, Khet Haraa' factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/aug/doc2025816613501.pdf",
          "year": 2025
        }
      ],
      "confidence": "low",
      "media": []
    },
    "chhattisgarh": {
      "name": "Chhattisgarh",
      "summary": "Chhattisgarh's rice bowl sits mainly on red-yellow soils (about 55% of the state, spanning Entisols, Inceptisols, Alfisols and Vertisols), with black-soil tracts and gravelly 'Bhata' uplands. Almost all soils are deficient in nitrogen and phosphorus and medium to high in potassium: a 297-sample Kabeerdham Vertisol survey found 99.1% of samples low in available N and 87% low in P, while 88.9% were high in K. The ICAR-AICRP survey lists the state among those with more than 50% of soils zinc-deficient.",
      "soilTypes": [
        "Red-yellow soils (about 55% of the state; locally Matasi/Dorsa series)",
        "Black soils / Vertisols (locally Kanhar)",
        "Gravelly lateritic upland (Bhata) Entisols",
        "Alluvial soils along the Mahanadi and tributaries"
      ],
      "npk": {
        "nitrogen": "Low — 99.10% of 297 Kabeerdham Vertisol samples tested low in available N (<280 kg/ha); state soils are broadly N-deficient",
        "phosphorus": "Low — 87% of Kabeerdham samples low in available P (2.06-20.88 kg/ha); almost all state soils reported deficient in N and P",
        "potassium": "High — available K was high (208-821 kg/ha) in 88.89% of Kabeerdham samples; state soils medium to high in K"
      },
      "micronutrients": {
        "zinc": "High deficiency — more than 50% of Chhattisgarh soils zinc-deficient (ICAR-AICRP 2021); 45.56% of samples deficient in the Palari block survey (Baloda Bazar district)",
        "iron": "Inadequate in large parts of surveyed Kabeerdham Vertisols (with Zn), while Cu and Mn were adequately supplied",
        "boron": "Not verified state-wide in consulted sources (all-India AICRP deficiency is 44.7%)",
        "sulphur": "Not verified state-wide in consulted sources (all-India AICRP deficiency is 58.6%)"
      },
      "organicCarbon": "Low to medium in cultivated soils (no verified state aggregate); rice-fallow systems return little residue",
      "currentState": "A monsoon-rice-dominated state where nitrogen and phosphorus shortage is near-universal in surveyed soils and zinc deficiency affects roughly half of the central rice-belt samples, while potassium and manganese are comfortable.",
      "issues": [
        "Near-universal low available nitrogen (99.1% of samples in the Kabeerdham survey)",
        "Widespread low phosphorus (87% of Kabeerdham samples)",
        "Zinc deficiency in about 45-50%+ of samples in the central plains and state-wide (AICRP)",
        "Gravelly Bhata uplands with poor depth and water retention"
      ],
      "recommendations": [
        "Soil-test-based N management with split applications in rice systems",
        "Phosphorus fertilisation guided by SHC tests on N-P-deficient soils",
        "Zinc sulphate application in deficient rice blocks of the central plains",
        "Green manuring (dhaincha/sunhemp) and residue retention to build organic carbon"
      ],
      "districtHighlights": [
        {
          "district": "Kabeerdham (Kawardha)",
          "note": "297-sample Vertisol survey: 99.1% low N, 87% low P, 88.9% high K; Zn and Fe inadequate in large parts"
        },
        {
          "district": "Baloda Bazar-Bhatapara",
          "note": "Palari block survey: 45.56% of samples zinc-deficient, but only 0.10% manganese-deficient"
        },
        {
          "district": "Raipur",
          "note": "Seat of Indira Gandhi Krishi Vishwavidyalaya (IGKV), the state's soil-research hub, in the red-yellow soil rice belt"
        },
        {
          "district": "Bilaspur",
          "note": "Among the principal red-yellow soil districts (with Mahasamund, Korba, Durg and Jashpur)"
        }
      ],
      "facts": [
        "Red-yellow soils account for about 55% of Chhattisgarh's soil cover; the state's four major soil orders are Entisols, Inceptisols, Alfisols and Vertisols.",
        "99.10% of Kabeerdham Vertisol samples were low in available nitrogen and 87% low in phosphorus, while 88.89% were high in potassium.",
        "45.56% of soil samples in Palari block (Baloda Bazar) were deficient in available zinc; manganese deficiency was negligible (0.10%).",
        "Chhattisgarh is among the 13 states where the ICAR-AICRP survey found more than 50% of soils zinc-deficient.",
        "Almost all Chhattisgarh soils are described as deficient in nitrogen and phosphorus and medium to high in potassium."
      ],
      "sources": [
        {
          "title": "Evaluations of soil fertility status of available major nutrients (N, P, K) and micronutrients in Vertisol of Kabeerdham district of Chhattisgarh",
          "publisher": "Journal reprint (IJIMS/Academia.edu)",
          "url": "https://www.ijims.com/uploads/8ae6072f8d73f2d1acb7OC13.pdf"
        },
        {
          "title": "Evaluation of available zinc status in the soils of Kasdol and Palari blocks, Baloda Bazar district",
          "publisher": "International Journal of Chemical Studies",
          "url": "https://www.chemijournal.com/archives/2017/vol5issue5/PartB/5-4-393-740.pdf",
          "year": 2017
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Different Types of Soil Found in Chhattisgarh",
          "publisher": "Testbook (Chhattisgarh GK, citing state soil classification)",
          "url": "https://testbook.com/chhattisgarh-gk/types-of-soil-in-chhattisgarh"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "dadra-nagar-haveli-daman-diu": {
      "name": "Dadra & Nagar Haveli and Daman & Diu",
      "summary": "This merged coastal UT (formed 2020) has a very small agricultural base. Standard soil-type references place lateritic soils in Dadra & Nagar Haveli and Daman & Diu — soils rich in iron and aluminium oxides but inherently poor in nitrogen, phosphorus and organic matter — alongside coastal alluvium at Daman and sandy coastal soils at Diu. No UT-specific soil-health aggregate could be verified; the UT lies outside the 28-state ICAR-AICRP survey, so confidence is low.",
      "soilTypes": [
        "Lateritic soils (Dadra & Nagar Haveli's hilly, high-rainfall interior; also listed for Daman & Diu)",
        "Coastal alluvial soils (Daman, along the Daman Ganga)",
        "Sandy coastal soils (Diu)"
      ],
      "npk": {
        "nitrogen": "Low — laterite soils are inherently deficient in nitrogen and organic matter; no UT-specific SHC aggregate was accessible",
        "phosphorus": "Low — laterites are characteristically phosphorus-poor; no UT-specific figure found in consulted sources",
        "potassium": "Low to medium — laterites are generally poor in potash though locally variable; no UT-specific figure found"
      },
      "micronutrients": {
        "zinc": "Not reported — the UT lies outside the 28-state ICAR-AICRP micronutrient survey",
        "iron": "Not reported as deficient — laterites are iron-oxide-rich by formation, but no UT survey was found",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "No verified UT-level figure; laterite soils are characteristically low in organic matter",
      "currentState": "Small tribal-farming pockets (paddy, ragi, pulses) on lateritic soils in DNH and tiny coastal holdings in Daman and Diu; published soil-testing statistics for the merged UT are effectively absent from accessible sources.",
      "issues": [
        "Inherently N-, P- and organic-matter-poor lateritic soils in the main farming tract",
        "Very thin published soil data for the merged UT",
        "Monsoon-erosion pressure on hilly DNH plots and coastal salinity exposure in Daman and Diu (severity unquantified in consulted sources)"
      ],
      "recommendations": [
        "Use the SHC portal's UT dashboard for current sample aggregates",
        "Soil-test-driven liming and organic-matter management on lateritic soils",
        "Salinity-aware crop and water management on coastal plots"
      ],
      "districtHighlights": [
        {
          "district": "Dadra & Nagar Haveli",
          "note": "Hilly, high-rainfall interior district with the UT's main farm area on lateritic soils"
        },
        {
          "district": "Daman",
          "note": "Coastal enclave district on the Daman Ganga estuary with alluvial pockets"
        },
        {
          "district": "Diu",
          "note": "Small island/coastal district off Saurashtra with sandy coastal soils"
        }
      ],
      "facts": [
        "Laterite soils — rich in iron/aluminium oxides but poor in N, P and organic matter — are the recognised soil group of Dadra & Nagar Haveli and Daman & Diu.",
        "The merged UT (2020) has three districts and a very small cultivated area; no UT-level nutrient aggregate was verifiable in consulted sources.",
        "The 2021 ICAR-AICRP micronutrient survey covered the 28 states and did not report this UT.",
        "The national SHC scheme applies to the UT; its portal dashboard is the authoritative data source."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "8 Major Types of Soil in India and Their Characteristics (laterite distribution incl. DNH, Daman & Diu)",
          "publisher": "Earth Reminder (geography reference)",
          "url": "https://www.earthreminder.com/types-of-soil-in-india/"
        },
        {
          "title": "Agriculture Department, Daman",
          "publisher": "U.T. Administration of Dadra & Nagar Haveli and Daman & Diu",
          "url": "http://daman.nic.in/agriculture.aspx"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "delhi": {
      "name": "Delhi (NCT)",
      "summary": "Delhi's shrinking farm belt sits on Yamuna alluvium — recent khadar floodplain and older bangar upland — soils that are characteristically potash-rich but deficient in nitrogen and humus. The SHC scheme is administered through district administrations (South West, North West, Shahdara, Central North and others run official scheme pages), but no NCT-wide nutrient aggregate could be verified, and the NCT lies outside the 28-state ICAR-AICRP survey; urbanisation of the land base is the dominant soil-resource issue.",
      "soilTypes": [
        "Yamuna khadar (recent floodplain alluvium, more fertile, flood-renewed)",
        "Bangar (older upland alluvium above flood level)",
        "Sandy-loam alluvium of the southwest rural fringe"
      ],
      "npk": {
        "nitrogen": "Low — Indo-Gangetic alluvium is characteristically deficient in nitrogen and organic humus; no NCT-specific SHC aggregate was found in consulted sources",
        "phosphorus": "Medium (unverified) — alluvial soils are generally reasonably supplied in phosphoric acid, but no NCT-specific figure was found",
        "potassium": "Medium to high — alluvial soils are rich in potash per standard soil references; no NCT aggregate published"
      },
      "micronutrients": {
        "zinc": "Not reported — the NCT lies outside the 28-state ICAR-AICRP micronutrient survey",
        "iron": "Not reported in sources consulted for the NCT",
        "boron": "Not reported in sources consulted for the NCT",
        "sulphur": "Not reported in sources consulted for the NCT"
      },
      "organicCarbon": "No verified NCT-level figure; regional alluvium is humus-poor",
      "currentState": "Agriculture survives mainly in the southwest and northwest rural fringe and the Yamuna floodplain; SHC samples are analysed in soil-testing labs and uploaded to the national portal, but published NCT-level aggregates were not accessible to this compilation.",
      "issues": [
        "Rapid conversion of farmland to urban use, shrinking the soil resource itself",
        "Floodplain cultivation pressure on the Yamuna khadar",
        "Absence of accessible NCT-level soil-health aggregates in consulted sources"
      ],
      "recommendations": [
        "Consult district SHC pages and the national portal for current Delhi sample data",
        "Protect remaining Yamuna floodplain and rural-fringe soils via land-use safeguards",
        "Soil-test-based fertiliser use in the remaining vegetable/fodder belts"
      ],
      "districtHighlights": [
        {
          "district": "South West Delhi",
          "note": "District administration runs an official SHC scheme page; contains the Najafgarh-side rural belt"
        },
        {
          "district": "North West Delhi",
          "note": "The other principal rural-fringe district; also runs an official SHC scheme page"
        },
        {
          "district": "Shahdara",
          "note": "East-of-Yamuna district with an official SHC scheme page covering its khadar fringe"
        }
      ],
      "facts": [
        "The SHC scheme in Delhi is implemented through district administrations — South West, North West, Shahdara and Central North district pages were consulted.",
        "SHC cards report 12 parameters: N, P, K, S, Zn, B, Fe, Mn, Cu, pH, EC and organic carbon.",
        "Khadar (new, flood-renewed) and bangar (older, above flood level) are the two alluvial soil belts of the Yamuna plain; alluvium is potash-rich but N- and humus-deficient.",
        "Delhi lies outside the 28-state coverage of the 2021 ICAR-AICRP micronutrient survey; no NCT-wide nutrient aggregate was verifiable."
      ],
      "sources": [
        {
          "title": "Soil Health Card scheme — District South West",
          "publisher": "Government of NCT of Delhi",
          "url": "https://dmsouthwest.delhi.gov.in/scheme/soil-health-card/"
        },
        {
          "title": "Soil Health Card scheme — District Shahdara",
          "publisher": "Government of NCT of Delhi",
          "url": "https://dmshahdara.delhi.gov.in/scheme/soil-health-card/"
        },
        {
          "title": "Khadar — alluvial soil (definition)",
          "publisher": "Encyclopaedia Britannica",
          "url": "https://www.britannica.com/science/khadar"
        },
        {
          "title": "Soil Health Card portal",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "goa": {
      "name": "Goa",
      "summary": "About 81% of Goa's soils are lateritic — acidic (pH 5.5-6.5), iron-rich and poor in water-holding capacity — with riverine alluvium and the distinctive khazan lowlands (tidal floodplains reclaimed with bunds and sluice gates). ICAR-CCARI mapping found forest-soil fertility good on average (pH 6.31; N 299 kg/ha, P 38 kg/ha, K 265 kg/ha) but flagged acute zinc deficiency, and the ICAR-AICRP national survey lists Goa among states with more than 50% of soils zinc-deficient. Khazan paddy soils test acidic with low N and very low P.",
      "soilTypes": [
        "Lateritic soils, acidic and iron-rich (about 81% of the state)",
        "Coastal and riverine alluvial soils",
        "Khazan coastal acid-saline lowland soils (reclaimed tidal floodplains)"
      ],
      "npk": {
        "nitrogen": "Medium — ICAR-CCARI forest-soil mapping averaged 299.25 kg/ha available N, while surveyed khazan paddy soils averaged a low 211.2 kg/ha (range 56.4-621.6)",
        "phosphorus": "Medium — 37.62 kg/ha average in CCARI forest mapping, but very low (mean 8.4 kg/ha, range 0.5-49.7) in surveyed khazan soils",
        "potassium": "Medium — averages of 264.51 kg/ha (forest mapping) and 202.3 kg/ha (khazan survey, range 31.5-786.2)"
      },
      "micronutrients": {
        "zinc": "High deficiency — Goa is among the states with more than 50% of soils zinc-deficient (ICAR-AICRP 2021), and CCARI's forest-soil mapping likewise flagged a higher share of soils acutely Zn-deficient",
        "iron": "Sufficient — laterites are inherently iron-rich; deficiency is not flagged in consulted Goa studies",
        "boron": "Analysed in CCARI mapping but no state-wide deficiency share published in consulted sources",
        "sulphur": "Analysed in CCARI mapping with significant variability; no state-wide deficiency share published in consulted sources"
      },
      "organicCarbon": "Medium to high but widely variable — khazan-belt soils measured 0.12-5.85% SOC; forest soils rated good on average fertility",
      "currentState": "Plantation and paddy agriculture on acidic laterites and khazan lowlands; CCARI (Old Goa) runs the STFR Goa web portal for soil-test-based fertiliser recommendations, and zinc is the flagged micronutrient gap.",
      "issues": [
        "Soil acidity on lateritic uplands (pH 5.5-6.5) with poor water-holding capacity",
        "Zinc deficiency in more than half of soils (ICAR-AICRP 2021)",
        "Very low phosphorus in khazan paddy lowlands (mean 8.4 kg/ha in the 258-sample survey)",
        "Salinity management burden in khazans where bunds/sluice gates fail"
      ],
      "recommendations": [
        "Use the STFR Goa portal (ICAR-CCARI) for soil-test-based fertiliser recommendations",
        "Soil-test-based liming and P management on acidic laterites and khazan paddies",
        "Zinc sulphate application where SHC/CCARI tests confirm deficiency",
        "Maintain khazan bund-and-sluice infrastructure to keep tidal salinity out of paddy soils"
      ],
      "districtHighlights": [
        {
          "district": "North Goa",
          "note": "Khazan lowlands along the Mandovi estuary; ICAR-CCARI is at Old Goa in this district"
        },
        {
          "district": "South Goa",
          "note": "Site of the 258-sample geo-referenced khazan fertility survey; lateritic uplands with plantation agriculture"
        }
      ],
      "facts": [
        "About 81% of Goa's soils are lateritic and acidic (pH 5.5-6.5) with poor water-holding capacity.",
        "CCARI forest-soil mapping (J. Indian Soc. Remote Sensing, 2024) averaged pH 6.31, available N 299.25, P 37.62 and K 264.51 kg/ha, and rated overall fertility good while flagging acute zinc deficiency.",
        "Khazan (coastal acid-saline) soils surveyed at 258 geo-referenced sites showed SOC 0.12-5.85%, mean available N 211.2 kg/ha and mean available P just 8.4 kg/ha.",
        "Goa is among the 13 states where the ICAR-AICRP survey found more than 50% of soils zinc-deficient.",
        "ICAR-CCARI runs 'STFR Goa', an online portal generating soil-test-based fertiliser recommendations for the state."
      ],
      "sources": [
        {
          "title": "Geospatial Mapping of Soil Properties of Forest Types ... to Delineate Site-Specific Nutrient Management Zones in Goa",
          "publisher": "Journal of the Indian Society of Remote Sensing (Springer) / ICAR-CCARI",
          "url": "https://link.springer.com/article/10.1007/s12524-024-02082-y",
          "year": 2024
        },
        {
          "title": "Fertility Status of the Unique Coastal Acid Saline Soils of Goa",
          "publisher": "Journal of the Indian Society of Soil Science",
          "url": "https://indianjournals.com/article/jisss-63-2-014",
          "year": 2015
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "'Despite challenges, Goa's forest soil fertility is good' (CCARI study report)",
          "publisher": "The Navhind Times",
          "url": "https://navhindtimes.in/goanews/despite-challenges-goas-forest-soil-fertility-is-good/"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "gujarat": {
      "name": "Gujarat",
      "summary": "Gujarat spans black (regur) soils in the central-south and Saurashtra, alluvium in the northern plains, desert/saline soils of Kachchh and long saline coastlines. Nutrient pressure is heavy and well documented: more than 60% of Gujarat soils are sulphur-deficient and more than 50% zinc-deficient (ICAR-AICRP 2021); a 1,674-sample middle-Gujarat survey found S deficiency in 52-68% of samples by district, and in Gandhinagar district 79.4% of samples tested low in available nitrogen while half were high in potassium.",
      "soilTypes": [
        "Black soils (regur/Vertisols) of central-south Gujarat and Saurashtra",
        "Alluvial soils of the north and central Gujarat plains",
        "Sandy, desert and saline soils of Kachchh",
        "Coastal saline-alkali soils"
      ],
      "npk": {
        "nitrogen": "Low — 79.38% of 160 Gandhinagar district samples were low in available N (range 78.6-376.3 kg/ha, mean 231.8); district surveys across the state repeat the low-N pattern",
        "phosphorus": "Medium — 71.88% of Gandhinagar samples tested medium in available P (18.61-69.57 kg/ha, mean 41.06)",
        "potassium": "High to medium — 50% of Gandhinagar samples were high in available K (114.24-645.33 kg/ha, mean 306)"
      },
      "micronutrients": {
        "zinc": "High deficiency — Gujarat is among the states with more than 50% of soils zinc-deficient (ICAR-AICRP 2021)",
        "iron": "Not verified state-wide in consulted sources (all-India AICRP deficiency is 19.2%)",
        "boron": "Deficiency reported in North Gujarat region status studies; a verified state-wide share was not found in consulted sources (all-India AICRP deficiency is 44.7%)",
        "sulphur": "High deficiency — more than 60% of Gujarat soils S-deficient (ICAR-AICRP 2021); middle-Gujarat districts measured Kheda 61.2%, Anand 53.4%, Vadodara 68.4% and Panchmahals 52.2% of samples deficient"
      },
      "organicCarbon": "Low — Gandhinagar district averaged 0.38% (rated low); middle-Gujarat survey soils ranged 0.08-0.98%",
      "currentState": "An intensively farmed, largely semi-arid state where nitrogen, sulphur and zinc shortfalls coexist with structural problems — coastal salinity ingress and the saline/sodic wastelands of Kachchh and the Rann fringe.",
      "issues": [
        "Sulphur deficiency in over 60% of soils state-wide, exceeding half of samples in several middle-Gujarat districts",
        "Zinc deficiency in more than half of soils (ICAR-AICRP 2021)",
        "Low available nitrogen and low organic carbon (about 0.4% in Gandhinagar) across surveyed districts",
        "Coastal salinity/sodicity and the saline desert soils of Kachchh limiting cultivable soil quality"
      ],
      "recommendations": [
        "Routine sulphur fertilisation (gypsum/SSP) in oilseed-heavy rotations, guided by SHC tests",
        "Zinc sulphate application in deficient blocks",
        "Balanced NPK per Soil Health Card tests, correcting the N-heavy pattern on high-K soils",
        "Salinity management (drainage, gypsum on sodic patches, salt-tolerant varieties) in coastal and Kachchh tracts",
        "Organic-matter build-up on low-OC semi-arid soils"
      ],
      "districtHighlights": [
        {
          "district": "Vadodara",
          "note": "Highest surveyed sulphur deficiency among middle-Gujarat districts: 68.4% of samples"
        },
        {
          "district": "Kheda",
          "note": "61.2% of samples sulphur-deficient in the 1,674-sample middle-Gujarat survey"
        },
        {
          "district": "Anand",
          "note": "53.4% sulphur-deficient; headquarters of Anand Agricultural University, source of much of the state's soil research"
        },
        {
          "district": "Panchmahals",
          "note": "52.2% of samples sulphur-deficient"
        },
        {
          "district": "Gandhinagar",
          "note": "160-sample district study: 79.38% low in N, 71.88% medium in P, 50% high in K, 48.75% high in S; pH 7.94, OC 0.38%"
        }
      ],
      "facts": [
        "More than 60% of Gujarat soils are deficient in available sulphur and more than 50% in available zinc (ICAR-AICRP national survey, 2021).",
        "A GPS/GIS survey of 1,674 middle-Gujarat samples (2010-11) found sulphur deficiency in 61.2% (Kheda), 53.4% (Anand), 68.4% (Vadodara) and 52.2% (Panchmahals) of samples; available S ranged 0.90-67.7 mg/kg.",
        "In Gandhinagar district (160 samples, 2016), 79.38% were low in available N, 71.88% medium in P, 50% high in K and 48.75% high in S; soils were mildly-moderately alkaline (pH 7.94) with low OC (0.38%).",
        "Gujarat's soil base spans black regur, alluvial plains, Kachchh desert-saline soils and coastal saline-alkali tracts."
      ],
      "sources": [
        {
          "title": "Emergence of sulphur deficiency in soils of Kheda, Anand, Vadodara and Panchamahals districts of middle Gujarat",
          "publisher": "African Journal of Agricultural Research (Academic Journals)",
          "url": "https://academicjournals.org/journal/AJAR/article-in-press-abstract/emergence_of_sulphur_deficiency_in_soils_of_kheda_anand_vadodara_and_panchamahals_districts_of_middle_gujarat_india"
        },
        {
          "title": "Status of available major nutrients in soils of Gandhinagar district of Gujarat",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/329706612_Status_of_available_major_nutrients_in_soils_of_Gandhi_nagar_district_of_Gujarat",
          "year": 2018
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Status of Sulphur and Boron in Soils of North Gujarat Region of India",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/355268847_Status_of_Sulphur_and_Boron_in_Soils_of_North_Gujarat_Region_of_India",
          "year": 2021
        }
      ],
      "confidence": "high",
      "media": []
    },
    "haryana": {
      "name": "Haryana",
      "summary": "Haryana's Indo-Gangetic alluvial soils, pushed hard by rice-wheat double cropping, show statewide nutrient depletion. A 2025 CCS HAU survey of about 6,469 samples from 22 districts found sulphur and zinc depletion worst in Mahendragarh (27.8% and 14.5% of samples) and iron/copper deficiency peaking in Fatehabad (14.8% and 4.9%). ICAR-IISS's 5,673-sample assessment puts average deficiencies at Zn 15.3%, Fe 21.6%, Mn 6.1%, Cu 5.2% and B 3.3%, and a Down To Earth analysis of SHC 2015-19 samples ranked Haryana the most organic-carbon-deficient state in India.",
      "soilTypes": [
        "Indo-Gangetic alluvial soils, sandy loam to loam (dominant)",
        "Sandy/loamy-sand arid soils of the southwest (Bhiwani-Mahendragarh belt)",
        "Saline-sodic (reh/kallar) patches in canal-irrigated and waterlogged tracts"
      ],
      "npk": {
        "nitrogen": "Low — media reporting of the 2025 CCS HAU 22-district survey (about 6,469 samples) describes widespread depletion with soils low in available nitrogen under intensive rice-wheat cropping",
        "phosphorus": "Low to medium — phosphate shortfalls are flagged in the survey's southern/southwestern districts",
        "potassium": "High to medium — potassium was not among the deficiencies flagged in consulted statewide surveys, consistent with potash-rich Indo-Gangetic alluvium"
      },
      "micronutrients": {
        "zinc": "Deficient in 15.3% of samples on average (district range 1.11-36.5%, ICAR-IISS 5,673-sample assessment); CCS HAU found the highest district-level Zn deficiency in Mahendragarh (14.5%); Zn deficiency is declining with regular zinc-sulphate use",
        "iron": "Deficient in 21.6% of samples on average (range 0-55%) and increasing significantly per ICAR-IISS; CCS HAU found the highest Fe deficiency in Fatehabad (14.8%)",
        "boron": "Low deficiency — 3.3% of samples on average (range 0-13.7%), among the least-affected nutrients in Haryana",
        "sulphur": "Deficient — 22.9% of Haryana samples were acutely S-deficient, among the higher state levels in the ICAR-AICRP national survey; CCS HAU found maximum S deficiency in Mahendragarh (27.8%)"
      },
      "organicCarbon": "Low — Haryana ranked the most organic-carbon-deficient state in the Down To Earth analysis of SHC 2015-19 samples (among seven states/UTs with more than 90% of samples deficient)",
      "currentState": "The 2025 CCS HAU statewide study reports widespread nutrient depletion threatening crop yields in the rice-wheat belt: sulphur and zinc mining concentrated in the southwest (Mahendragarh), iron/copper deficiency emerging around Fatehabad, and organic carbon the worst in the country per SHC-based analysis.",
      "issues": [
        "Worst-in-India organic-carbon deficiency in SHC 2015-19 samples",
        "Sulphur depletion — 22.9% of samples acutely deficient state-wide, up to 27.8% in Mahendragarh",
        "Zinc and iron deficiency pockets (Zn up to 36.5%, Fe up to 55% of samples in worst districts)",
        "Rising iron and manganese deficiency under intensive rice-wheat cropping (ICAR-IISS)",
        "Saline-sodic (reh/kallar) patches and waterlogging in canal-irrigated tracts"
      ],
      "recommendations": [
        "Residue retention/incorporation instead of burning to rebuild organic carbon",
        "Soil-test-based N with split/neem-coated urea applications rather than blanket dosing",
        "Sulphur fertilisation (gypsum/SSP) in mustard-growing southern districts",
        "Zinc sulphate in deficient blocks — the practice credited with Haryana's declining Zn deficiency",
        "Gypsum-based reclamation of sodic patches with improved drainage (ICAR-CSSRI Karnal protocols)"
      ],
      "districtHighlights": [
        {
          "district": "Mahendragarh",
          "note": "State's highest surveyed sulphur (27.8%) and zinc (14.5%) deficiency in the CCS HAU 22-district study"
        },
        {
          "district": "Fatehabad",
          "note": "Highest surveyed iron (14.8%) and copper (4.9%) deficiency in the same study"
        },
        {
          "district": "Hisar",
          "note": "Seat of CCS Haryana Agricultural University, which ran the 2025 statewide soil survey"
        },
        {
          "district": "Karnal",
          "note": "Home of ICAR-Central Soil Salinity Research Institute, the national hub for saline-sodic soil reclamation"
        }
      ],
      "facts": [
        "A 2025 CCS HAU study analysed about 6,469 soil samples from 22 Haryana districts and reported widespread nutrient depletion threatening crop yields.",
        "Average micronutrient deficiencies in Haryana soils (5,673 samples, ICAR-IISS): Zn 15.3%, Fe 21.6%, Mn 6.1%, Cu 5.2%, B 3.3%.",
        "District-level deficiency ranges: Zn 1.11-36.5%, Fe 0-55%, Mn 0-48.6%, Cu 0-13%, B 0-13.7%; Zn is declining with zinc-sulphate use while Fe and Mn deficiencies have increased significantly.",
        "22.9% of Haryana samples were acutely sulphur-deficient — among the higher state shares in the ICAR-AICRP national survey.",
        "Haryana's soils ranked the most organic-carbon-deficient in India in the Down To Earth analysis of SHC 2015-19 samples, ahead of Punjab, UP, Rajasthan, Tamil Nadu, Mizoram and A&N Islands."
      ],
      "sources": [
        {
          "title": "Haryana varsity study finds widespread nutrient depletion threatening crop yields and food security",
          "publisher": "ETV Bharat (reporting the CCS HAU study)",
          "url": "https://www.etvbharat.com/en/bharat/haryana-varsity-study-finds-widespread-nutrient-depletion-threatening-crop-yields-and-food-security-enn25121403086",
          "year": 2025
        },
        {
          "title": "Status of Micronutrient Deficiencies in Soils of Haryana",
          "publisher": "ICAR-Indian Institute of Soil Science",
          "url": "https://iiss.icar.gov.in/downloads/Status%20of%20Micronutrients%20Deficiencies%20in%20Soils%20of%20Haryana.pdf"
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "How nutrient-deficient are Indian soils? (SHC 2015-19 analysis)",
          "publisher": "Down To Earth",
          "url": "https://www.downtoearth.org.in/agriculture/how-nutrient-deficient-are-indian-soils--82732"
        }
      ],
      "confidence": "high",
      "media": []
    },
    "himachal-pradesh": {
      "name": "Himachal Pradesh",
      "summary": "Himachal's soils range from neutral coarse-textured alluvium in the Una-Indora-Paonta floodplains to acidic hill soils in Kangra, Shimla and parts of Chamba, Kullu and Mandi, where toxic aluminium, iron and manganese accompany the acidity. The ICAR-AICRP national survey found more than 60% of the state's soils deficient in available boron — its most severe verified micronutrient gap. District summaries of soil-testing data report low nitrogen in Una and Hamirpur and low phosphorus in Kangra, Una and Shimla, with erosion on steep slopes a recurring driver of nutrient loss.",
      "soilTypes": [
        "Acidic brown hill soils of the mid-hills (Kangra, Shimla, parts of Chamba, Kullu, Mandi; Al/Fe/Mn toxicity reported)",
        "Alluvial floodplain soils of Una, Indora (Kangra) and Paonta (Sirmaur) — loamy sand to sandy loam, low organic matter, neutral (pH above 6.5)",
        "Forest and mountain soils of the higher Himalayan ranges (shallow, skeletal on steep slopes)"
      ],
      "npk": {
        "nitrogen": "Low to medium — district summaries of soil-test data report low N in Una and Hamirpur and moderate N in Kangra, Bilaspur, Shimla and Sirmaur; no verified state-wide SHC aggregate in consulted sources",
        "phosphorus": "Low to medium — low P reported for Kangra, Una and Shimla; medium P in Hamirpur, Solan, Kinnaur, Kullu, Mandi and Sirmaur",
        "potassium": "Medium — K deficiency is listed among the state's nutrient gaps in consulted summaries, but no state-wide tested share was verifiable"
      },
      "micronutrients": {
        "zinc": "Deficiency reported among the state's nutrient gaps in consulted district summaries; a verified state-wide percentage was not found",
        "iron": "Not reported at state level in consulted sources; acid hill soils generally keep Fe available",
        "boron": "High deficiency — more than 60% of Himachal Pradesh soils are boron-deficient (including latent) per the ICAR-AICRP survey (Shukla et al. 2021)",
        "sulphur": "Deficiency flagged in consulted district summaries; no verified state-wide percentage"
      },
      "organicCarbon": "Variable — floodplain alluvium is low in organic matter while site studies report high organic carbon under forest cover (e.g. Bilaspur forest nurseries); no verified state-wide SHC aggregate in consulted sources",
      "currentState": "A mountain state whose mid-hill acidic soils (with Al/Fe/Mn toxicity) and severely eroding slopes coexist with productive neutral valley alluvium; boron deficiency in over 60% of soils is the state's strongest verified soil-health signal.",
      "issues": [
        "Boron deficiency in more than 60% of soils (ICAR-AICRP 2021)",
        "Soil acidity with aluminium/iron/manganese toxicity in Kangra, Shimla and parts of Chamba, Kullu and Mandi",
        "Severe soil erosion on steep cultivated slopes driving N-P-K depletion",
        "Low nitrogen (Una, Hamirpur) and low phosphorus (Kangra, Una, Shimla) in district soil-test summaries"
      ],
      "recommendations": [
        "Soil-test-based boron application (borax) in deficient blocks per AICRP findings",
        "Liming of strongly acidic mid-hill soils to counter Al/Fe/Mn toxicity",
        "Erosion control — terracing, cover crops and contour bunds on sloping fields",
        "Balanced NPK per Soil Health Card recommendations, with district-specific N and P correction"
      ],
      "districtHighlights": [
        {
          "district": "Kangra",
          "note": "Acidic soils with low phosphorus; includes the Indora alluvial floodplain belt"
        },
        {
          "district": "Una",
          "note": "Alluvial floodplain soils, coarse-textured and low in nitrogen and organic matter"
        },
        {
          "district": "Hamirpur",
          "note": "Low-nitrogen soils flagged in district soil-test summaries"
        },
        {
          "district": "Shimla",
          "note": "Acidic hill soils, low phosphorus; core apple belt of the state"
        },
        {
          "district": "Sirmaur",
          "note": "Paonta valley alluvium (neutral, coarse-textured) alongside mid-hill soils with moderate N and medium P"
        }
      ],
      "facts": [
        "More than 60% of Himachal Pradesh soils are deficient in available boron per the ICAR-AICRP survey of 2,42,827 samples (Shukla et al. 2021).",
        "Kangra and Shimla districts, plus parts of Chamba, Kullu and Mandi, have mainly acidic soils where toxic aluminium, iron and manganese hamper plant growth.",
        "Alluvial soils of Una, Indora (Kangra) and Paonta (Sirmaur) floodplains are loamy sand to sandy loam, low in organic matter and neutral (pH above 6.5).",
        "District soil-test summaries report low N in Una and Hamirpur, and low P in Kangra, Una and Shimla.",
        "Severe soil erosion is cited in consulted summaries as a key driver of the state's N, P, K, S and Zn depletion."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Characterization of the soils of lower Himalayas of Himachal Pradesh, India",
          "publisher": "ResearchGate (journal preprint record)",
          "url": "https://www.researchgate.net/publication/287592619_Characterization_of_the_soils_of_lower_Himalayas_of_Himachal_Pradesh_India"
        },
        {
          "title": "Type of Soil in Himachal Pradesh (district nutrient summaries)",
          "publisher": "Jokta Academy (secondary summary of state soil-test reporting)",
          "url": "https://joktacademy.com/type-of-soil-in-himachal-pradesh/"
        },
        {
          "title": "Soil Health Card portal (state dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "jammu-kashmir": {
      "name": "Jammu & Kashmir",
      "summary": "Jammu & Kashmir's farm soils span the alluvial outer plains of Jammu, the lacustrine karewa (silty clay-loam) uplands of the Kashmir valley famed for saffron, and mountain forest soils. The ICAR-AICRP survey found boron the UT's most deficient micronutrient — over 60% of soils deficient, 12.1% acutely so — with manganese deficient in more than 20%. Orchard-belt studies report low-to-medium nitrogen, medium-to-high phosphorus and high potassium, with organic carbon 1.52-2.78% in Kulgam apple soils.",
      "soilTypes": [
        "Alluvial soils of the Jammu outer plains and kandi belt",
        "Karewa (lacustrine) silty clay-loam soils of the Kashmir valley uplands — saffron and orchard belt",
        "Mountain forest and meadow soils of the middle and higher Himalayas"
      ],
      "npk": {
        "nitrogen": "Low to medium — available N was low to medium in Kashmir pear- and apple-orchard soil studies; no UT-wide SHC aggregate was verifiable in consulted sources",
        "phosphorus": "Medium to high — orchard-belt studies report medium to high available P; declining available P is however linked to falling saffron yield on karewas",
        "potassium": "High — available K tested high in Kashmir orchard soil studies"
      },
      "micronutrients": {
        "zinc": "Not verified at UT level in consulted sources; a Bhimber (PoJK) district survey found Zn low at 26.66% of sites",
        "iron": "Not reported at UT level in consulted sources",
        "boron": "High deficiency — more than 60% of J&K soils are boron-deficient (including latent), 12.1% acutely deficient (ICAR-AICRP, Shukla et al. 2021)",
        "sulphur": "Not reported at UT level in consulted sources; manganese, by contrast, is deficient in more than 20% of soils (3.5% acute) per the same survey"
      },
      "organicCarbon": "Medium to high in the orchard belt — Kulgam apple-orchard soils recorded organic carbon of 1.52-2.78% with pH 4.97-6.24; decline in soil organic matter is reported on saffron karewas",
      "currentState": "Orchard and saffron soils of the Kashmir valley remain inherently fertile but karewa lands are being lost to construction and show declining organic matter and phosphorus, while boron deficiency (over 60% of soils) is the UT's most widespread verified nutrient gap.",
      "issues": [
        "Boron deficiency in more than 60% of soils, 12.1% acute (ICAR-AICRP 2021)",
        "Manganese deficiency in more than 20% of soils",
        "Declining soil organic matter and available phosphorus on saffron karewas, associated with falling saffron output",
        "Loss of fertile karewa soils to brick kilns and infrastructure (documented by Mongabay-India)"
      ],
      "recommendations": [
        "Soil-test-based boron application in orchard and field crops per AICRP findings",
        "Organic-matter restoration (FYM, residue mulch) on karewa saffron soils",
        "Protect karewa agricultural land from excavation and construction",
        "Balanced fertilisation in apple belts — N correction where low, avoiding excess P and K which already test medium-high"
      ],
      "districtHighlights": [
        {
          "district": "Pulwama",
          "note": "Pampore karewa uplands — India's saffron heartland on lacustrine silty soils"
        },
        {
          "district": "Kulgam",
          "note": "Apple-orchard soils with pH 4.97-6.24 and organic carbon 1.52-2.78% (silty clay loam to loam)"
        },
        {
          "district": "Baramulla",
          "note": "North Kashmir high-density apple belt; orchard soil characterisation studies"
        },
        {
          "district": "Jammu",
          "note": "Outer-plain alluvial and kandi-belt soils, distinct from the valley's karewa lands"
        }
      ],
      "facts": [
        "More than 60% of J&K soils are boron-deficient (12.1% acutely) and more than 20% manganese-deficient (3.5% acutely) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "Kulgam apple-orchard soils range from silty clay loam to loam with pH 4.97-6.24 and organic carbon 1.52-2.78%.",
        "Kashmir orchard studies report available N low to medium, P medium to high and K high.",
        "Kashmir's karewas — lacustrine silt-clay uplands at about 1,585-1,677 m — support the country's only saffron cultivation, and declining soil organic matter and available P is associated with declining saffron yield.",
        "Mongabay-India documents ongoing destruction of nutrient-rich karewa soils by excavation for construction."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Effect of Physico-Chemical Properties of Soil on Available Soil Nutrients in Apple Orchards of District Kulgam",
          "publisher": "Current World Environment",
          "url": "http://www.cwejournal.org/vol13no2/effect-of-physico-chemical-properties-of-soil-on-available-soil-nutrients-in-apple-orchards-of-district-kulgam"
        },
        {
          "title": "Geochemical Characterization of Saffron Growing Karewa Soils of Kashmir Valley, Western Himalaya",
          "publisher": "Earth Systems and Environment (Springer)",
          "url": "https://link.springer.com/article/10.1007/s41748-024-00482-1",
          "year": 2024
        },
        {
          "title": "Nourishing soils of Kashmir's karewas crumble under infrastructure",
          "publisher": "Mongabay-India",
          "url": "https://india.mongabay.com/2023/01/nourishing-soils-of-kashmirs-karewas-crumble-under-infrastructure/",
          "year": 2023
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "jharkhand": {
      "name": "Jharkhand",
      "summary": "Red soils blanket about 90% of Jharkhand — the hot subhumid East India Plateau (agro-ecological zone 12) of red and lateritic soils — with exceptions only in the Damodar trough and the Rajmahal trap country. These acidic soils have low cation-exchange capacity, poor inherent fertility, strong phosphorus fixation and aluminium toxicity. The ICAR-AICRP survey found more than 60% of the state's soils sulphur-deficient, and boron deficiency stands at 60% — among the highest in India.",
      "soilTypes": [
        "Red soils (about 90% of the state; dominant on the Chotanagpur plateau)",
        "Lateritic soils on plateau summits and interfluves",
        "Alluvial/colluvial soils of the Damodar trough and river basins",
        "Trap-derived soils of the Rajmahal hills area"
      ],
      "npk": {
        "nitrogen": "Low — red and lateritic soils of the plateau are deficient in nitrogen and organic matter per consulted characterisations; no verified state-wide SHC percentage in consulted sources",
        "phosphorus": "Low — poor inherent fertility with strong P fixation is listed among the region's major constraints (acid soils rich in Fe/Al oxides)",
        "potassium": "Medium — K was not among the flagged constraints in consulted East India Plateau studies; no state-wide tested share verified"
      },
      "micronutrients": {
        "zinc": "Deficiency present but below the worst states — Jharkhand is not in the ICAR-AICRP list of states with more than 50% zinc-deficient soils",
        "iron": "Not reported as a state-level constraint in consulted sources (acid soils generally keep Fe available)",
        "boron": "High deficiency — 60.0% of Jharkhand soils are boron-deficient (PwC 2019 compilation of AICRP data); B deficiency is characteristic of the state's acid red and lateritic soils",
        "sulphur": "High deficiency — more than 60% of Jharkhand soils are sulphur-deficient (including latent) per the ICAR-AICRP survey (Shukla et al. 2021)"
      },
      "organicCarbon": "Low — red-lateritic plateau soils are characterised as low in organic matter, with surface crusting and erosion further depleting carbon; no verified state-wide SHC aggregate in consulted sources",
      "currentState": "An acid red-soil plateau state where sulphur (>60%) and boron (60%) deficiencies, P fixation and aluminium toxicity constrain rainfed agriculture; Birsa Agricultural University runs acidity-tolerance trials for rainfed rice lands.",
      "issues": [
        "Sulphur deficiency in more than 60% of soils and boron deficiency in 60% (AICRP data)",
        "Soil acidity with aluminium toxicity and 'poor inherent fertility' on red-lateritic soils",
        "Strong phosphorus fixation by iron/aluminium oxides",
        "Surface crusting and soil erosion on the undulating plateau (toposequence fertility gradients documented on the East India Plateau)"
      ],
      "recommendations": [
        "Liming of acid soils to reduce aluminium toxicity and unlock phosphorus",
        "Soil-test-based sulphur (gypsum/SSP) and boron (borax) application per AICRP findings",
        "Grow acidity-tolerant genotypes in rainfed medium-lowlands (Birsa Agricultural University trials at ZARS Dumka)",
        "Organic-matter build-up and erosion control (bunding, cover crops) along plateau toposequences"
      ],
      "districtHighlights": [
        {
          "district": "Ranchi",
          "note": "Seat of Birsa Agricultural University on the red-lateritic Chotanagpur plateau"
        },
        {
          "district": "Dumka",
          "note": "Zonal Agricultural Research Station running trials of acidity-tolerant rice genotypes (kharif 2018)"
        },
        {
          "district": "Khunti",
          "note": "District-level assessment of available micro, secondary and pollutant elements published for its soils"
        },
        {
          "district": "Dhanbad",
          "note": "Damodar trough — one of the few tracts outside the state's red-soil blanket"
        },
        {
          "district": "Sahibganj",
          "note": "Rajmahal hills trap country — the other main exception to the red-soil cover"
        }
      ],
      "facts": [
        "Red soil covers about 90% of Jharkhand, except the narrow Damodar trough and the Rajmahal area.",
        "More than 60% of Jharkhand soils are sulphur-deficient per the ICAR-AICRP survey (Shukla et al. 2021).",
        "Boron deficiency stands at 60.0% of soils (PwC 2019 compilation), among the highest in India, concentrated in acid red and lateritic soils.",
        "Major constraints of the region's red-lateritic soils: surface crusting, poor inherent fertility, P fixation, aluminium toxicity and erosion.",
        "Jharkhand falls in agro-ecological zone 12 — hot subhumid East India Plateau with red and lateritic soils."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "All for a good harvest: Addressing micronutrient deficiencies",
          "publisher": "PwC India",
          "url": "https://www.pwc.in/assets/pdfs/research-insights/2019/all-for-a-good-harvest.pdf",
          "year": 2019
        },
        {
          "title": "Soil fertility along toposequences of the East India Plateau and implications for productivity, fertiliser use, and sustainability",
          "publisher": "SOIL (Copernicus)",
          "url": "https://soil.copernicus.org/articles/6/325/2020/",
          "year": 2020
        },
        {
          "title": "Assessing the Status of Available Micro, Secondary and Pollutant Elements in Soil of Khunti District, Jharkhand",
          "publisher": "International Journal of Ecology and Environmental Sciences",
          "url": "https://nieindia.org/Journal/index.php/ijees/article/view/1351"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "karnataka": {
      "name": "Karnataka",
      "summary": "Karnataka's four soil families — red soils over the largest area, black soils across the northern districts, laterites on the coast and Malnad, and coastal alluvium — carry one of India's heaviest multi-nutrient deficiency loads. The ICAR-AICRP survey lists Karnataka among the 13 states with more than 50% of soils zinc-deficient and flags it (with Bihar, Goa and Odisha) for high combined S+Zn+B deficiency, and (with Gujarat, Maharashtra and Rajasthan) for high combined Zn+Fe deficiency. In the Malaprabha right-bank command more than 95% of analysed samples were zinc-deficient.",
      "soilTypes": [
        "Red soils (largest area; red loamy and red sandy of the southern maidan)",
        "Black cotton soils of the northern districts (basalt- and gneiss-derived Vertisols)",
        "Laterite and lateritic soils of coastal Karnataka and the Malnad",
        "Coastal alluvial soils"
      ],
      "npk": {
        "nitrogen": "Low — black soils of the north are deficient in nitrogen and organic matter, and red soils carry little humus per consulted characterisations; no verified state-wide SHC percentage found",
        "phosphorus": "Low to medium — P deficiency accompanies the low-OC red and black soils in consulted fertility summaries; no state-wide tested share verified",
        "potassium": "Medium to high — black soils are reported deficient in potash in consulted summaries, but red-soil tracts generally test medium-high; no state-wide aggregate verified"
      },
      "micronutrients": {
        "zinc": "High deficiency — Karnataka is among the 13 states with more than 50% of soils zinc-deficient (ICAR-AICRP 2021); over 95% of samples in the Malaprabha right-bank command tested Zn-deficient",
        "iron": "Deficient — Karnataka is one of four states (with Gujarat, Maharashtra, Rajasthan) flagged for relatively high combined Zn+Fe deficiency",
        "boron": "Deficient — Karnataka is one of four states (with Bihar, Goa, Odisha) flagged for high combined S+Zn+B deficiency",
        "sulphur": "Deficient — same AICRP combined-deficiency flag (S+Zn+B); no separate state percentage verified in consulted sources"
      },
      "organicCarbon": "Low — a consulted Karnataka fertility summary (KVK/SHC-based) reports about 64% of samples deficient in organic carbon (below 0.5%) and 21% medium (0.5-0.75%)",
      "currentState": "Intensive cropping on low-OC red and black soils has produced stacked deficiencies — zinc in over half the state's soils plus sulphur, boron and iron — making Karnataka one of the AICRP survey's most multi-deficient states.",
      "issues": [
        "Zinc deficiency in more than 50% of soils; over 95% of samples Zn-deficient in the Malaprabha right-bank command",
        "High combined S+Zn+B and Zn+Fe deficiencies (among the worst four states on both AICRP combinations)",
        "Organic carbon deficient in about 64% of samples in consulted SHC-based summaries",
        "Low nitrogen and potash in northern black-soil districts"
      ],
      "recommendations": [
        "Soil-test-based zinc sulphate application, especially in command-area rice and maize",
        "Sulphur and boron correction (gypsum, borax) in oilseed, pulse and plantation systems",
        "Organic-carbon restoration via residue recycling, FYM and green manure on red soils",
        "Balanced NPK per Soil Health Card recommendations instead of urea-heavy dosing"
      ],
      "districtHighlights": [
        {
          "district": "Belagavi",
          "note": "Malaprabha right-bank command, where more than 95% of analysed soil samples were zinc-deficient"
        },
        {
          "district": "Vijayapura",
          "note": "Northern black-cotton-soil district, low in N, potash and organic matter"
        },
        {
          "district": "Dakshina Kannada",
          "note": "Coastal laterite belt — acidic, leached soils of the high-rainfall coast"
        },
        {
          "district": "Bengaluru Rural",
          "note": "Red loamy soils characterised by UAS Bangalore; grape-belt soils are deep, dark red with low-medium organic carbon"
        }
      ],
      "facts": [
        "Karnataka is among the 13 states where the ICAR-AICRP survey found more than 50% of soils zinc-deficient.",
        "The AICRP survey flags Karnataka for high combined S+Zn+B deficiency (with Bihar, Goa, Odisha) and high combined Zn+Fe deficiency (with Gujarat, Maharashtra, Rajasthan).",
        "More than 95% of soil samples in the Malaprabha right-bank command were zinc-deficient (meta-analysis of Karnataka zinc studies).",
        "A consulted Karnataka fertility summary reports about 64% of samples deficient in organic carbon (<0.5%).",
        "Red soils cover the largest part of Karnataka; black soils dominate the northern districts and laterites the coast and Malnad."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Zinc Status in the Soils of Karnataka and Response of Horticultural Crops to Zinc Application: A Meta-analysis",
          "publisher": "Journal (via Redalyc)",
          "url": "https://www.redalyc.org/journal/5770/577062030002/html/"
        },
        {
          "title": "Soil zinc surveillance frameworks can inform human nutrition studies: opportunities in India",
          "publisher": "Frontiers in Soil Science",
          "url": "https://www.frontiersin.org/journals/soil-science/articles/10.3389/fsoil.2024.1421652/full",
          "year": 2024
        },
        {
          "title": "Soils & Their Fertility Status",
          "publisher": "KLE KVK (Karnataka)",
          "url": "https://www.klekvk.org/soils-their-fertility-status/"
        }
      ],
      "confidence": "high",
      "media": []
    },
    "kerala": {
      "name": "Kerala",
      "summary": "Laterite and associated red soils spread over about 70% of Kerala, and the state's defining soil-health fact is acidity: more than 90% of Kerala soils have acid reaction, with 54% extremely to strongly acidic (pH 3.5-5.5). Sesquioxide-rich profiles fix 90-95% of applied phosphorus, and extensive deficiencies of calcium, magnesium and boron are documented, while available P and K in soils generally test medium to high. The CSE/SHC assessment also places Kerala among the 15 states/UTs with nitrogen deficiency in 99-100% of tested samples.",
      "soilTypes": [
        "Laterite soils (dominant; with associated red soils about 70% of the state's area)",
        "Coastal sandy soils (including the Onattukara sandy tract)",
        "Riverine and coastal alluvium",
        "Kuttanad acid saline / acid sulphate soils (below-sea-level farmlands)",
        "Black soil pocket of Chittur (Palakkad) and forest loams of the high ranges"
      ],
      "npk": {
        "nitrogen": "Low — Kerala is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        "phosphorus": "Medium to high in available terms, but acid sesquioxide-rich soils fix 90-95% of applied P, so response to fresh P is poor without liming (Kerala soil-fertility portal)",
        "potassium": "Medium to high — available K is in the medium-to-high range per the Kerala soil-fertility portal"
      },
      "micronutrients": {
        "zinc": "Deficiency present in pockets — zinc sulphate application is among Kerala Agricultural University's correction recommendations; no verified state-wide percentage in consulted sources",
        "iron": "Generally adequate to excessive in acid laterites; toxicity rather than deficiency is the concern in waterlogged acid-sulphate tracts (not verified as a state-wide figure)",
        "boron": "Deficient — extensive boron deficiency is documented; KAU recommends borax at 1.5 kg/ha for correction",
        "sulphur": "Not reported as a leading state-wide deficiency in consulted sources; Ca and Mg (secondary nutrients) are the documented extensive deficiencies"
      },
      "organicCarbon": "Medium to high in high-rainfall laterite and forest tracts, but rapid decomposition and leaching keep fertility low; no verified state-wide SHC aggregate in consulted sources",
      "currentState": "Kerala's humid-tropical laterite soils are chronically acid (more than 90% of soils), phosphorus-fixing and depleted of bases — calcium and magnesium deficiency is near-universal — so liming plus Mg and B correction now headline the state's soil-health agenda.",
      "issues": [
        "Acidity in over 90% of soils; 54% extremely to strongly acidic (pH 3.5-5.5)",
        "Phosphorus fixation of 90-95% by sesquioxide-rich acid profiles",
        "Extensive calcium and magnesium deficiency; magnesium deficient at almost all tested locations",
        "Boron and copper deficiency documented across the state",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis); acid-sulphate stress in Kuttanad paddy lands"
      ],
      "recommendations": [
        "Liming (lime/dolomite) for soils below pH 5.5, per Kerala Agricultural University package of practices",
        "Magnesium supplementation (dolomite or magnesium sulphate) wherever deficiency is confirmed",
        "Borax at 1.5 kg/ha and copper/zinc sulphate where deficient, per KAU recommendations",
        "Split, soil-test-based N and P management to beat fixation losses on laterites"
      ],
      "districtHighlights": [
        {
          "district": "Alappuzha",
          "note": "Kuttanad below-sea-level acid saline/acid sulphate paddy soils; also part of the Onattukara sandy tract"
        },
        {
          "district": "Palakkad",
          "note": "Kerala's granary; includes the Chittur black-soil pocket, an outlier among laterites"
        },
        {
          "district": "Kasaragod",
          "note": "Deep laterite terrain typical of the northern Kerala laterite belt studied for soil acidity"
        },
        {
          "district": "Wayanad",
          "note": "High-range forest-loam and hill soils under plantation agriculture"
        }
      ],
      "facts": [
        "More than 90% of Kerala soils have acid reaction; 54% are extremely to strongly acidic (pH 3.5-5.5).",
        "Kerala's acid, sesquioxide-rich soils fix applied phosphorus to the tune of 90-95%.",
        "Red and laterite associated soils are distributed over about 70% of Kerala's geographical area.",
        "Extensive deficiencies of Ca, Mg and boron are documented; Mg is deficient at almost all tested locations, and KAU recommends borax at 1.5 kg/ha.",
        "Kerala is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE/DTE analysis)."
      ],
      "sources": [
        {
          "title": "Soil Related Constraints — Laterites",
          "publisher": "Kerala Soil Fertility portal, Dept. of Agriculture Development & Farmers' Welfare, Govt. of Kerala",
          "url": "https://www.keralasoilfertility.net/en/laterites.jsp"
        },
        {
          "title": "Soils of Kerala",
          "publisher": "Kerala Soil Survey Organisation, Govt. of Kerala",
          "url": "https://www.keralasoils.gov.in/en/soils-kerala"
        },
        {
          "title": "CSE assessment: Indian soils severely deficient in key nutrients",
          "publisher": "Down To Earth / Centre for Science and Environment",
          "url": "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients",
          "year": 2025
        },
        {
          "title": "KAU Package of Practices Recommendations: Crops — Appendices",
          "publisher": "Kerala Agricultural University",
          "url": "https://pop.kau.in/appendix14.htm",
          "year": 2011
        }
      ],
      "confidence": "high",
      "media": []
    },
    "ladakh": {
      "name": "Ladakh",
      "summary": "Ladakh's cold-arid desert soils are sandy to sandy-loam, gravelly, shallow and weakly formed, with very low organic carbon (0.16-0.58%) and low cation-exchange capacity (2.6-3.6 cmol(p+)/kg). Over 90% of tested samples fall between pH 7 and 9 — a predominantly alkaline high-altitude desert profile (Leh sites range pH 5.65-10.12, Kargil 6.57-9.47). Available phosphorus and potassium are low, and deficiencies of iron, zinc and manganese are reported; systematic soil-survey coverage of the UT remains thin, so confidence is low.",
      "soilTypes": [
        "Cold-arid desert soils — sandy to sandy loam with gravels and pebbles (dominant)",
        "Weakly developed alluvial/colluvial valley soils along the Indus and side valleys",
        "Barren scree and moraine material at higher elevations"
      ],
      "npk": {
        "nitrogen": "Low — organic-matter-poor desert soils supply little nitrogen; no UT-wide SHC aggregate was verifiable in consulted sources",
        "phosphorus": "Low — availability of phosphorus is reported low in cold-arid Ladakh soil studies",
        "potassium": "Low — availability of potash is likewise reported low in the same studies"
      },
      "micronutrients": {
        "zinc": "Deficient — Leh and Kargil soils are reported deficient in zinc",
        "iron": "Deficient — iron deficiency reported for Leh and Kargil soils (alkaline calcareous conditions)",
        "boron": "Not reported in consulted sources for the UT",
        "sulphur": "Not reported in consulted sources for the UT"
      },
      "organicCarbon": "Very low — 0.16-0.58% organic carbon reported, with low CEC (2.6-3.6 cmol(p+)/kg); conversion of barren land to tree plantation and agriculture measurably raises SOC (2025 Trans-Himalayan land-use study)",
      "currentState": "A high-altitude cold desert where shallow, alkaline, gravelly soils with almost no organic matter support small irrigated oases; greening (plantations, polyhouse agriculture) is documented to improve soil carbon and nutrient status, but published soil-testing coverage is sparse.",
      "issues": [
        "Very low organic carbon (0.16-0.58%) and low CEC in cold-arid soils",
        "Alkalinity — over 90% of samples between pH 7 and 9 — restricting Fe, Zn and Mn availability",
        "Low available phosphorus and potassium",
        "Shallow, friable, erosion-prone soil formation under extreme aridity; thin soil-survey coverage since UT formation (2019)"
      ],
      "recommendations": [
        "Build organic matter with FYM/compost in oasis fields and polyhouses (documented fertility gains under polyhouse cultivation)",
        "Convert suitable barren land to tree plantation/agriculture, which raises SOC and nutrient status (2025 study)",
        "Chelated or soil-applied Fe and Zn correction on alkaline soils where crops show deficiency",
        "Expand Soil Health Card sampling to build a UT-wide fertility baseline"
      ],
      "districtHighlights": [
        {
          "district": "Leh",
          "note": "Soil pH at tested sites spans 5.65-10.12; polyhouse soil-fertility studies conducted here"
        },
        {
          "district": "Kargil",
          "note": "Soil pH 6.57-9.47; sandy to sandy-loam gravelly soils described in the district profile"
        }
      ],
      "facts": [
        "Ladakh soils are sandy to sandy loam with gravels, low in organic carbon (0.16-0.58%) and low in CEC (2.6-3.6 cmol(p+)/kg).",
        "Over 90% of soil samples from the region test between pH 7 and 9 — a predominantly alkaline cold-desert profile.",
        "Leh and Kargil soils are reported deficient in iron, zinc and manganese, with low available phosphorus and potash.",
        "A 2025 Trans-Himalayan study found tree-plantation and agricultural land richer in SOC and nutrients than barren land, showing restoration potential.",
        "Ladakh (UT since 2019) lay outside the 28-state ICAR-AICRP micronutrient survey frame; published soil-testing data remain thin."
      ],
      "sources": [
        {
          "title": "Soil Nutrient Status Under Different Agro-Climatic Zones of Kashmir and Ladakh, India",
          "publisher": "Current World Environment",
          "url": "http://www.cwejournal.org/vol11no1/soil-nutrient-status-under-different-agro-climatic-zones-of-kashmir-and-ladakh-india"
        },
        {
          "title": "Status of available nutrients in soils of Cold Arid region of Ladakh",
          "publisher": "ResearchGate (journal record)",
          "url": "https://www.researchgate.net/publication/281288082_Status_of_available_nutrients_in_soils_of_Cold_Arid_region_of_Ladakh"
        },
        {
          "title": "Influence of vegetation and land use on soil organic carbon (SOC) and nutrient status in the cold, arid climate of Ladakh Trans-Himalayan region, India",
          "publisher": "Discover Soil (Springer)",
          "url": "https://link.springer.com/article/10.1007/s44378-025-00122-8",
          "year": 2025
        },
        {
          "title": "About District — Kargil",
          "publisher": "District Kargil, UT of Ladakh (kargil.nic.in)",
          "url": "https://kargil.nic.in/about-district/"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "lakshadweep": {
      "name": "Lakshadweep",
      "summary": "Lakshadweep's soils form from fragmentation of coral limestone — carbonate-rich, near-neutral in reaction and inherently poor in plant nutrients. The islands were declared organic decades ago; coconut, the mainstay crop, receives no external fertiliser, yet productivity is among India's highest because biomass recycling by soil microbiota returns roughly twice the palms' nitrogen requirement, an extra 20% phosphorus to already P-rich soils and 43-45% of potassium needs. The UT lies outside the ICAR-AICRP micronutrient survey and published soil-testing data are minimal, so confidence is low.",
      "soilTypes": [
        "Coral-derived calcareous sandy soils (dominant; carbonate-rich, formed from coral limestone fragmentation)",
        "Shallow coral-sand loams under coconut groves and settlement gardens"
      ],
      "npk": {
        "nitrogen": "Low inherently — calcareous coral soils generally lack nitrogen, but coconut residue recycling is documented to return about twice the palms' N requirement",
        "phosphorus": "High — the islands' soils are described as already P-rich, with biomass recycling adding a further ~20%",
        "potassium": "Medium — 43-45% of the coconut palms' K requirement is met by recycled biomass; no UT-wide tested aggregate exists in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported — outside the ICAR-AICRP survey; calcareous soils are generically prone to Zn deficiency (FAO), but no UT-specific measurement was found",
        "iron": "Not reported for the UT; iron availability is generically constrained in calcareous soils (FAO)",
        "boron": "Not reported in consulted sources for the UT",
        "sulphur": "Not reported in consulted sources for the UT"
      },
      "organicCarbon": "Not verified UT-wide — coconut biomass residues returned to the soil add substantial organic carbon per the 2022 nutrient-recycling study, but no SHC-style aggregate was found",
      "currentState": "A fully organic coral-atoll UT where nutrient-poor calcareous sands nonetheless sustain some of India's highest coconut productivity through internal nutrient cycling; formal soil-testing coverage is minimal.",
      "issues": [
        "Inherently nutrient-poor, carbonate-rich coral sands (low N, low water/nutrient retention)",
        "Generic calcareous-soil constraints on iron, zinc and phosphorus availability (FAO)",
        "Very thin published soil-testing and micronutrient data — outside the AICRP survey frame",
        "Soil erosion limits are a concern on small low-lying atolls (dedicated erosion-limits study exists)"
      ],
      "recommendations": [
        "Continue returning coconut biomass residues to the soil — documented to meet most palm nutrient needs",
        "Compost/green-manure enrichment for vegetable gardens on coral sands, consistent with the UT's organic status",
        "Monitor Fe/Zn nutrition of crops given generic calcareous-soil constraints",
        "Extend Soil Health Card sampling to island farms to create a baseline dataset"
      ],
      "districtHighlights": [
        {
          "district": "Lakshadweep (single district)",
          "note": "The UT is one district; Kavaratti is the headquarters island"
        },
        {
          "district": "Minicoy (island subdivision)",
          "note": "Southern atoll; coconut-dominated coral-sand soils like the rest of the UT"
        },
        {
          "district": "Andrott (island subdivision)",
          "note": "Coconut groves on coral-derived calcareous soils; no external fertiliser used"
        }
      ],
      "facts": [
        "Lakshadweep soils form from fragmentation of coral limestone — carbonate-rich, neutral pH, poor in plant nutrients (2022 study).",
        "The islands were declared organic decades ago; coconut is grown without external fertiliser or major plant protection.",
        "Coconut biomass recycling returns about twice the needed nitrogen, an extra 20% phosphorus to already P-rich soils, and 43-45% of potassium requirements.",
        "Lakshadweep has one of the highest coconut productivities among Indian coconut-growing regions despite nutrient-poor soils.",
        "The UT lies outside the 28-state ICAR-AICRP micronutrient survey; published soil-test data are minimal."
      ],
      "sources": [
        {
          "title": "Autochthonous nutrient recycling driven by soil microbiota could be sustaining high coconut productivity in Lakshadweep Islands sans external fertilizer application",
          "publisher": "PubMed (indexed journal article)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36053362/",
          "year": 2022
        },
        {
          "title": "Calcareous soils — management of problem soils",
          "publisher": "FAO Soils Portal",
          "url": "https://www.fao.org/soils-portal/soil-management/management-of-some-problem-soils/calcareous-soils/en/"
        },
        {
          "title": "Soil erosion limits for Lakshadweep Archipelago",
          "publisher": "ResearchGate (journal record)",
          "url": "https://www.researchgate.net/publication/264086707_Soil_erosion_limits_for_Lakshadweep_Archipelago"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "madhya-pradesh": {
      "name": "Madhya Pradesh",
      "summary": "Madhya Pradesh — home of ICAR-IISS Bhopal — is India's black-soil heartland: state agriculture-department figures put deep-medium black soils at 36.53% of area across 33 districts, shallow-medium black at 6.91%, mixed red-and-black at 18.30% and alluvium at 7.57%, with red-yellow soils across the east. The ICAR-AICRP survey found more than 60% of MP soils sulphur-deficient and more than 50% zinc-deficient (20.3% acutely), and the CSE/SHC analysis places MP among the 15 states with nitrogen deficiency in 99-100% of samples.",
      "soilTypes": [
        "Deep and medium black soils (36.53% of area, 33 districts — Narmada valley, Malwa plateau, Satpura belt)",
        "Mixed red and black soils (18.30%)",
        "Red and yellow soils of eastern MP (Baghelkhand tract)",
        "Alluvial soils of the north-west (7.57% — Morena, Bhind, Gwalior, Shivpuri)",
        "Shallow and medium black soils (6.91%)"
      ],
      "npk": {
        "nitrogen": "Low — MP is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        "phosphorus": "Low to medium — Vertisols of MP are reported increasingly deficient in phosphorus in consulted fertility reviews",
        "potassium": "Medium to high — smectitic black soils are inherently K-rich; K was not flagged among MP's leading deficiencies in consulted sources"
      },
      "micronutrients": {
        "zinc": "High deficiency — more than 50% of MP soils zinc-deficient, 20.3% acutely deficient (ICAR-AICRP, Shukla et al. 2021)",
        "iron": "Deficiency present in calcareous black-soil tracts but below the levels of S and Zn; no verified state percentage in consulted sources",
        "boron": "Not among MP's flagged top deficiencies in consulted AICRP reporting; no state percentage verified",
        "sulphur": "High deficiency — more than 60% of MP soils sulphur-deficient (including latent), critical for the soybean belt (ICAR-AICRP 2021)"
      },
      "organicCarbon": "Low in intensively cropped tracts — MP's near-universal SHC nitrogen deficiency tracks low organic carbon; no separate verified state OC percentage in consulted sources",
      "currentState": "The soybean-wheat engine on Malwa and Narmada-valley Vertisols is drawing down sulphur (deficient in over 60% of soils) and zinc (over 50%), while SHC data show nitrogen deficient in virtually all samples — balanced fertilisation is the state's central soil-health task.",
      "issues": [
        "Sulphur deficiency in more than 60% of soils — acute for the soybean-based cropping system",
        "Zinc deficiency in more than 50% of soils (20.3% acute)",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis)",
        "Phosphorus decline reported in intensively cropped Vertisols; seasonal waterlogging/cracking behaviour of deep black soils"
      ],
      "recommendations": [
        "Sulphur fertilisation (gypsum/SSP/elemental S) in soybean-wheat rotations per AICRP findings",
        "Soil-test-based zinc sulphate application in deficient blocks",
        "Residue retention, FYM and green manuring to rebuild organic carbon and N supply",
        "Follow Soil Health Card dose recommendations; ICAR-IISS Bhopal maintains state fertility maps (e-Atlas)"
      ],
      "districtHighlights": [
        {
          "district": "Narmadapuram",
          "note": "Deep black soils of the Narmada valley — among the state's most productive Vertisol tracts"
        },
        {
          "district": "Indore",
          "note": "Malwa plateau black soils; core of the soybean belt facing S and Zn drawdown"
        },
        {
          "district": "Bhopal",
          "note": "Headquarters of ICAR-Indian Institute of Soil Science, which led the 2,42,827-sample AICRP survey"
        },
        {
          "district": "Morena",
          "note": "North-western alluvial soil tract (with Bhind, Gwalior and Shivpuri)"
        },
        {
          "district": "Gwalior",
          "note": "Alluvial soils of the Gird region, distinct from the state's black-soil core"
        }
      ],
      "facts": [
        "MP agriculture-department figures: deep-medium black soils 36.53% of area (33 districts), shallow-medium black 6.91%, mixed red-black 18.30%, alluvial 7.57%.",
        "More than 60% of MP soils are sulphur-deficient and more than 50% zinc-deficient (20.3% acutely) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "MP is among the 15 states/UTs with nitrogen deficiency in 99-100% of SHC samples (CSE/DTE analysis).",
        "Medium and deep black soils dominate the Narmada valley, Malwa plateau and Satpura range, with 20-60% clay and 1-2 m depth.",
        "ICAR-IISS, the national soil-science institute that runs the AICRP micronutrient network, is headquartered at Bhopal."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Soil of Madhya Pradesh: types, features (relaying Dept. of Farmer Welfare & Agriculture Development, GoMP data)",
          "publisher": "Testbook (secondary summary of MP agriculture dept. figures)",
          "url": "https://testbook.com/mppsc-preparation/types-of-soil-in-madhya-pradesh"
        },
        {
          "title": "CSE assessment: Indian soils severely deficient in key nutrients",
          "publisher": "Down To Earth / Centre for Science and Environment",
          "url": "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients",
          "year": 2025
        },
        {
          "title": "ICAR-IISS Soil Fertility e-Atlas",
          "publisher": "ICAR-Indian Institute of Soil Science, Bhopal",
          "url": "https://www.iiss.res.in/e-Atlas/"
        }
      ],
      "confidence": "high",
      "media": []
    },
    "maharashtra": {
      "name": "Maharashtra",
      "summary": "More than 90% of Maharashtra is Deccan basalt, and black soils derived from it cover roughly three-fourths of the state, with laterites on the Konkan-Sahyadri fringe and saline patches in several districts. The ICAR-AICRP survey places Maharashtra among the 13 states with more than 50% of soils zinc-deficient (9.9% acutely) and finds more than 60% of its soils sulphur-deficient; it is also flagged (with Gujarat, Karnataka, Rajasthan) for high combined Zn+Fe deficiency. Consulted fertility reviews report the Vertisols increasingly deficient in phosphorus and zinc.",
      "soilTypes": [
        "Black cotton soils (Vertisols) from Deccan basalt — about three-fourths of the state per consulted summaries",
        "Laterite and lateritic soils of the Konkan coast and Sahyadri crest",
        "Coarse shallow (murrum) soils on basalt uplands",
        "Saline-alkaline patches (reported in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule, Solapur) and coastal saline soils"
      ],
      "npk": {
        "nitrogen": "Low — black soils are inherently low in nitrogen and organic matter per consulted characterisations; no verified state-wide SHC percentage found",
        "phosphorus": "Low — Vertisols of Maharashtra are reported increasingly deficient in phosphorus in consulted fertility reviews",
        "potassium": "Medium to high — smectitic black soils are generally well supplied with K; K was not flagged among the state's leading deficiencies in consulted sources"
      },
      "micronutrients": {
        "zinc": "High deficiency — Maharashtra is among the 13 states with more than 50% of soils zinc-deficient; 9.9% acutely deficient (ICAR-AICRP 2021)",
        "iron": "Deficient — Maharashtra is one of four states flagged for relatively high combined Zn+Fe deficiency (calcareous black-soil chemistry limits Fe)",
        "boron": "Not flagged among Maharashtra's leading deficiencies in consulted AICRP reporting; no state percentage verified",
        "sulphur": "High deficiency — more than 60% of Maharashtra soils sulphur-deficient (including latent) per the ICAR-AICRP survey"
      },
      "organicCarbon": "Low in cropped black-soil tracts — low organic matter is part of the standard characterisation of the state's Vertisols; no verified state-wide SHC aggregate in consulted sources",
      "currentState": "Maharashtra's basalt-derived black soils, farmed intensively for cotton, soybean and sugarcane, now show sulphur deficiency in over 60% and zinc deficiency in over half of surveyed soils, with irrigation-linked salinity patches in sugarcane districts adding a degradation front.",
      "issues": [
        "Sulphur deficiency in more than 60% of soils (ICAR-AICRP 2021)",
        "Zinc deficiency in more than 50% of soils (9.9% acute); combined Zn+Fe deficiency among India's highest",
        "Phosphorus and organic-matter decline in intensively cropped Vertisols",
        "Saline/alkaline soil patches in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule and Solapur; erosion on basalt uplands"
      ],
      "recommendations": [
        "Sulphur sources (gypsum/SSP) in oilseed-pulse-cotton systems per AICRP findings",
        "Soil-test-based zinc sulphate and iron management on calcareous black soils",
        "Organic-carbon build-up (residue retention, FYM, green manure) on Vertisols",
        "Drainage and gypsum-based reclamation of saline-alkaline patches in irrigated sugarcane belts"
      ],
      "districtHighlights": [
        {
          "district": "Nagpur",
          "note": "Headquarters of ICAR-NBSS&LUP, the national bureau that maps India's soils; Vidarbha black-cotton belt"
        },
        {
          "district": "Ratnagiri",
          "note": "Konkan laterite belt — acidic, leached coastal soils contrasting with the Deccan Vertisols"
        },
        {
          "district": "Solapur",
          "note": "Dry black-soil district with reported saline soil patches under canal irrigation"
        },
        {
          "district": "Ahmednagar",
          "note": "Among districts with reported saline-alkaline patches; rain-shadow black soils"
        },
        {
          "district": "Akola",
          "note": "Vidarbha deep-black-soil cotton district in the state's Zn/S-deficient dryland core"
        }
      ],
      "facts": [
        "More than 90% of Maharashtra's terrain is basalt, and black soil covers roughly three-fourths of the state per consulted summaries.",
        "More than 60% of Maharashtra soils are sulphur-deficient and over 50% zinc-deficient (9.9% acute) per the ICAR-AICRP survey (Shukla et al. 2021).",
        "The AICRP survey flags Maharashtra (with Gujarat, Karnataka, Rajasthan) for relatively high combined Zn+Fe deficiency.",
        "Black cotton soils of Maharashtra are reported increasingly deficient in phosphorus and zinc in consulted fertility reviews.",
        "Saline soil patches are reported in Sangli, Pune, Satara, Thane, Raigad, Ahmednagar, Dhule and Solapur districts."
      ],
      "sources": [
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS AICRP",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Soil Fertility Status in India: Challenges and Solutions",
          "publisher": "Agriculture.Institute (secondary review)",
          "url": "https://agriculture.institute/agriculture-fundamentals/soil-fertility-challenges-solutions-india/"
        },
        {
          "title": "Types of Soil in Maharashtra and Distribution",
          "publisher": "Testbook (secondary summary for state geography)",
          "url": "https://testbook.com/mpsc-preparation/types-of-soil-in-maharashtra"
        },
        {
          "title": "Soil Health Card portal (state dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "manipur": {
      "name": "Manipur",
      "summary": "Manipur is crested hills around the alluvial Imphal valley, with only about 10% of its area cultivated (ICAR state profile). The red and yellow hill soils are moderately deep, acidic and phosphorus-deficient, while the valley alluvium is fertile and carries the state's rice. Site surveys report surface soils from extremely acidic (pH below 4.5) to strongly acidic with low organic carbon (below 0.4%) and low potassium at sampled locations, and the CSE/SHC analysis puts Manipur among the 15 states with nitrogen deficiency in 99-100% of samples.",
      "soilTypes": [
        "Red and yellow hill soils (dominant; moderately deep, acidic, P-deficient)",
        "Alluvial soils of the Imphal valley (fertile, rice-growing)",
        "Organic-rich lacustrine/marshy soils around Loktak and other wetlands"
      ],
      "npk": {
        "nitrogen": "Low — Manipur is among the 15 states/UTs where 99-100% of SHC samples tested deficient in nitrogen (CSE/Down To Earth analysis)",
        "phosphorus": "Low — the red and yellow soils are explicitly characterised by ICAR as deficient in phosphorus; acid soils fix P strongly",
        "potassium": "Low to medium — sericulture-zone surveys measured low available K (below 34 kg/ha) at acidic sites; valley soils test better"
      },
      "micronutrients": {
        "zinc": "Not verified at state level in consulted sources (Manipur was covered by the AICRP survey but state-specific percentages were not retrievable this session)",
        "iron": "Not reported as deficient — strongly acid soils generally carry high available Fe, with aluminium and iron toxicity the greater risk",
        "boron": "Deficiency characteristic of NE acid soils reported in regional reviews; no verified Manipur percentage found",
        "sulphur": "Not verified at state level in consulted sources"
      },
      "organicCarbon": "Mixed — hill soils under forest are OC-rich, but sericulture-zone surveys found low OC (below 0.4%) at extremely-to-strongly acidic sampled sites",
      "currentState": "A classic NE-India acid-soil state: extremely to strongly acidic hill soils with P fixation and near-universal SHC nitrogen deficiency ring a fertile but flood-prone Imphal valley, while jhum and slope erosion keep degrading hill fertility.",
      "issues": [
        "Extreme-to-strong soil acidity (pH below 4.5 to 5.5) with associated aluminium toxicity",
        "Phosphorus deficiency in the red-yellow hill soils (ICAR state profile)",
        "Nitrogen deficiency in 99-100% of SHC samples (CSE analysis); low OC and K at surveyed acidic sites",
        "Soil erosion on sloping lands and fertility loss under shifting (jhum) cultivation"
      ],
      "recommendations": [
        "Liming of acid soils (as practised in Imphal West acid-soil nutrient-management studies)",
        "Phosphorus management adapted to P-fixing acid soils (band placement, rock phosphate on strongly acid soils)",
        "Organic-matter restoration on jhum and sericulture lands; longer fallows or settled terracing",
        "Erosion control on slopes and balanced NPK per Soil Health Card recommendations"
      ],
      "districtHighlights": [
        {
          "district": "Imphal West",
          "note": "Acid-soil nutrient-management studies published for this valley district"
        },
        {
          "district": "Imphal East",
          "note": "Imphal valley alluvium — the state's fertile rice tract"
        },
        {
          "district": "Thoubal",
          "note": "Valley agriculture district adjoining Loktak's wetland soils"
        },
        {
          "district": "Churachandpur",
          "note": "Hill district on acidic red-yellow soils with jhum cultivation"
        },
        {
          "district": "Senapati",
          "note": "Northern hill district; off-season vegetable production on acidic hill soils"
        }
      ],
      "facts": [
        "Only about 10% of Manipur's area is cultivated; the state is crested hills with widely spaced valleys (ICAR state profile).",
        "The red and yellow soils are moderately deep, acidic and deficient in phosphorus (ICAR).",
        "Surface soils surveyed in Manipur's sericulture zones were extremely acidic (pH below 4.5) to strongly acidic with organic carbon below 0.4% and available K below 34 kg/ha.",
        "Manipur is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE/DTE analysis).",
        "Soil erosion on sloping land and traditional shifting cultivation are flagged as key land constraints (ICAR)."
      ],
      "sources": [
        {
          "title": "Manipur — state profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17274"
        },
        {
          "title": "Assessment of Nutritional Status of the Acidic Soils of Manipur Vanya Sericulture: Levels and Spatial Distributions",
          "publisher": "Journal of Soil Salinity and Water Quality (ICAR ePubs)",
          "url": "https://epubs.icar.org.in/index.php/JoSSWQ/article/view/140147"
        },
        {
          "title": "CSE assessment: Indian soils severely deficient in key nutrients",
          "publisher": "Down To Earth / Centre for Science and Environment",
          "url": "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients",
          "year": 2025
        },
        {
          "title": "Acid Soils' nutrient management of Imphal West district",
          "publisher": "The Pharma Innovation Journal",
          "url": "https://www.thepharmajournal.com/archives/2023/vol12issue6/PartO/12-5-294-388.pdf",
          "year": 2023
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "meghalaya": {
      "name": "Meghalaya",
      "summary": "Meghalaya's high-rainfall plateau soils are acidic (pH 5.0-6.0) to strongly acidic (pH 4.5-5.0) with base saturation under 35%, the acidity intensifying with altitude and leaching. A GIS-based state fertility mapping exercise found phosphorus the weak link — 18.73% of the state low and 69.89% medium in available P — while organic carbon is high across 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas. An ICAR Complex (Shillong) study found about 40% of the state's soils below critical micronutrient levels.",
      "soilTypes": [
        "Red and lateritic acidic upland soils of the Khasi-Jaintia plateau (dominant)",
        "Red-loamy and yellow soils of hill slopes under high rainfall",
        "Alluvial and colluvial soils of valley floors and the Garo foothills"
      ],
      "npk": {
        "nitrogen": "Medium — soils are rich in organic carbon, ICAR's stated measure of nitrogen-supplying potential, though heavy leaching under high rainfall limits realised availability",
        "phosphorus": "Low to medium — 18.73% of the state's soil area is low and 69.89% medium in available P, with only 11.38% high (state fertility mapping)",
        "potassium": "Medium — no state-wide K aggregate was verifiable in consulted sources; acid leached soils of high-rainfall belts typically test medium"
      },
      "micronutrients": {
        "zinc": "About 40% of the state's soils carry micronutrients below critical levels (ICAR Complex Shillong study); Zn is among the NE region's reported gaps",
        "iron": "Generally adequate in strongly acid soils; not reported deficient in consulted sources",
        "boron": "Deficient — boron deficiency is reported for Meghalaya among the acid red-lateritic soil states (regional boron reviews)",
        "sulphur": "Not verified separately in consulted sources; falls within the ~40% below-critical micronutrient/secondary finding"
      },
      "organicCarbon": "High — organic carbon is high over 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas (state fertility mapping)",
      "currentState": "One of India's most acid soilscapes — strongly leached, base-poor (below 35% saturation) plateau soils where high organic carbon coexists with phosphorus limitation, boron/micronutrient gaps and jhum-linked degradation on slopes.",
      "issues": [
        "Strong soil acidity (pH 4.5-6.0) with base saturation below 35%, worsening with altitude and rainfall",
        "Phosphorus limitation — under 12% of the state's soils high in available P",
        "About 40% of soils below critical micronutrient levels (ICAR Shillong)",
        "Fertility decline and erosion under shifting (jhum) cultivation, documented in West Garo Hills fallow studies"
      ],
      "recommendations": [
        "Liming (furrow application) of strongly acid soils to raise base saturation and unlock P",
        "Soil-test-based P management suited to P-fixing acid soils",
        "Boron and zinc correction where confirmed, per NE-region acid-soil recommendations",
        "Longer jhum fallows or settled terrace/agroforestry systems to hold the high native organic carbon"
      ],
      "districtHighlights": [
        {
          "district": "West Jaintia Hills",
          "note": "Jaintia Hills region where organic carbon is high across 99.45% of the area — the state's highest"
        },
        {
          "district": "East Khasi Hills",
          "note": "Strongly acidic high-rainfall plateau around Shillong/Sohra; intense leaching and low base saturation"
        },
        {
          "district": "West Garo Hills",
          "note": "Jhum fallow-period effects on soil physicochemical properties documented here"
        },
        {
          "district": "Ri-Bhoi",
          "note": "Home of the ICAR Research Complex for NEH Region (Umiam), the lead soils institution for the state"
        }
      ],
      "facts": [
        "Meghalaya soils are acidic (pH 5.0-6.0) to strongly acidic (pH 4.5-5.0), with base saturation below 35%; acidity is strongest on high-altitude, high-rainfall belts.",
        "Available phosphorus: 18.73% of the state low, 69.89% medium, 11.38% high (GIS-based fertility mapping).",
        "Organic carbon is high across 99.45% of Jaintia Hills, 98.90% of Khasi Hills and 69.64% of Garo Hills areas.",
        "An ICAR Complex (Shillong) study found about 40% of Meghalaya's soils contain micronutrients below critical levels.",
        "Boron deficiency in India is reported mostly from acid red-lateritic soils of Assam, Bihar, Meghalaya, West Bengal, Jharkhand and Odisha."
      ],
      "sources": [
        {
          "title": "Extent and Distribution of Soil Acidity in Agriculture Lands of Meghalaya (survey map 2021)",
          "publisher": "Dept. of Agriculture, Govt. of Meghalaya (megagriculture.gov.in)",
          "url": "http://megagriculture.gov.in/public/dwd_docs/survey_map2021.pdf",
          "year": 2021
        },
        {
          "title": "Soil Fertility Mapping Using GIS in Meghalaya Plateau",
          "publisher": "International Journal of Current Microbiology and Applied Sciences",
          "url": "https://www.ijcmas.com/11-3-2022/Pratibha%20Thakuria%20Das,%20et%20al.pdf",
          "year": 2022
        },
        {
          "title": "Boron in Indian agriculture — A review",
          "publisher": "ResearchGate (journal record)",
          "url": "https://www.researchgate.net/publication/286648588_Boron_in_indian_agriculture_-_A_review"
        },
        {
          "title": "Effects of jhum (shifting) Cultivation Fallow Period on Soil Physicochemical Properties, West Garo Hills District",
          "publisher": "Indian Journal of Science and Technology",
          "url": "https://indjst.org/articles/effects-of-jhum-shifting-cultivation-fallow-period-on-soil-physicochemical-properties-west-garo-hills-district-meghalaya-india"
        }
      ],
      "confidence": "high",
      "media": []
    },
    "mizoram": {
      "name": "Mizoram",
      "summary": "Entirely mountainous Mizoram has sandy-loam to clay-loam soils that are rich in organic carbon and moderately rich in available potash but acidic (pH 4.5-5.6) under the heavy May-September rains, and low to very low in available phosphorus across all surveyed soil orders. Jhum (shifting) cultivation drives the state's soil-health cycle: slash burning briefly lifts P and cations while depleting carbon and nitrogen, and fertility falls through the cropping years, recovering only under longer fallows of 7-15 years. The CSE/SHC analysis lists Mizoram among the 15 states with nitrogen deficiency in 99-100% of samples.",
      "soilTypes": [
        "Red and yellow hill soils, sandy-loam to clay-loam (dominant; acidic, P-deficient)",
        "Deep loamy soils of narrow inter-mountain valleys and river terraces",
        "Young colluvial soils on steep, erosion-prone slopes"
      ],
      "npk": {
        "nitrogen": "Low in tested SHC terms — Mizoram is among the 15 states/UTs with N deficiency in 99-100% of SHC samples (CSE analysis), though field studies found available N high in 42-77% of profiles by soil order under forested land uses",
        "phosphorus": "Low — all surveyed soils (Entisols, Inceptisols, Ultisols) tested low to very low in available P; acid soils fix P strongly",
        "potassium": "Medium to high — soils are moderately rich in available potash; 71-100% of surveyed profiles by soil order tested high in K"
      },
      "micronutrients": {
        "zinc": "Not verified at state level in consulted sources",
        "iron": "Not reported deficient — strongly acid high-OM soils generally maintain available Fe",
        "boron": "Deficiency characteristic of NE acid soils in regional reviews; no verified Mizoram percentage found",
        "sulphur": "Not verified at state level in consulted sources"
      },
      "organicCarbon": "High under forest and long fallows — soils are characterised as organic-carbon-rich, with SOC up to 1.53-2.79% pre-monsoon in land-use studies; jhum burning and short fallows deplete it",
      "currentState": "An acid-soil hill state where organic-carbon-rich but phosphorus-starved soils on steep slopes are cycled through jhum; shortened fallows are eroding the fertility recovery that 7-15-year fallows once provided.",
      "issues": [
        "Soil acidity (pH 4.5-5.6, sites 4.7-5.4) from heavy monsoon leaching",
        "Available phosphorus low to very low in all surveyed soil orders",
        "Jhum slash-burning depletes soil carbon and nitrogen; fertility declines through first and second cropping years",
        "Shortening jhum fallows undercut the OC/N-P-K recovery documented under 7-15-year fallows; steep-slope erosion"
      ],
      "recommendations": [
        "Lengthen jhum fallows (7-15 years) or transition to settled terrace/agroforestry systems — longer fallows measurably restore OC, N, P and K",
        "P management adapted to acid P-fixing soils (placement, rock phosphate, liming of croplands)",
        "Soil amendments trialled at Lengpui (Mamit) improve rice productivity under shortened fallows",
        "Protect organic-carbon stocks — minimise burning intensity and retain residues where possible"
      ],
      "districtHighlights": [
        {
          "district": "Aizawl",
          "note": "Land-use soil-property studies (pH 4.7-5.4 across land uses) conducted in this district's hills"
        },
        {
          "district": "Mamit",
          "note": "Lengpui site of the fallow-length and soil-amendment study on jhum rice productivity"
        },
        {
          "district": "Lunglei",
          "note": "Southern hill district typifying the state's steep, acidic, jhum-cycled terrain"
        }
      ],
      "facts": [
        "Mizoram's sandy-loam and clay-loam soils are rich in organic carbon, moderately rich in available potash, and acidic (pH 4.5-5.6) due to high May-September rainfall (ICAR state profile).",
        "All surveyed soils — Entisols, Inceptisols and Ultisols — tested low to very low in available phosphorus; 71-100% by order tested high in available K.",
        "Slash burning in jhum depletes soil acidity, carbon and nitrogen while temporarily elevating phosphorus and cations; fertility declines through the cropping phases.",
        "Fallows of 7-15 years restore finer soil texture, organic carbon and available N, P and K on jhum lands.",
        "Mizoram is among the 15 states/UTs with nitrogen deficiency in 99-100% of SHC samples (CSE/DTE analysis)."
      ],
      "sources": [
        {
          "title": "Mizoram — state profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17277"
        },
        {
          "title": "Soil fertility and rice productivity in shifting cultivation: impact of fallow lengths and soil amendments in Lengpui, Mizoram",
          "publisher": "Heliyon (ScienceDirect)",
          "url": "https://www.sciencedirect.com/science/article/pii/S2405844021009373",
          "year": 2021
        },
        {
          "title": "Soil properties under different land use systems of Mizoram, North East India",
          "publisher": "Journal of Applied and Natural Science",
          "url": "https://journals.ansfoundation.org/index.php/jans/article/view/1999"
        },
        {
          "title": "CSE assessment: Indian soils severely deficient in key nutrients",
          "publisher": "Down To Earth / Centre for Science and Environment",
          "url": "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients",
          "year": 2025
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "nagaland": {
      "name": "Nagaland",
      "summary": "Nagaland is almost entirely hill country farmed largely under jhum (shifting cultivation), and the peer-reviewed soil science available for the state is organised around that cycle rather than around state-wide soil-test aggregates. Work in Mokokchung district shows that as jhum fallows lengthen, soil organic carbon, available nitrogen, available phosphorus and exchangeable potassium all rise while soil pH and bulk density fall. Alder-based jhum — the indigenous system best documented at Khonoma in Kohima district — outperforms traditional non-alder jhum on most soil parameters. No Nagaland-specific Soil Health Card or state-wide soil-test aggregate could be verified in this research pass.",
      "soilTypes": [
        "Hill soils under jhum and secondary forest (dominant; consulted studies measure pH, organic carbon and NPK across these, but no verified state-wide soil classification or area breakdown was obtainable)",
        "Alder-based jhum fallow soils — the indigenous system of Khonoma and neighbouring areas, measurably more fertile than non-alder jhum",
        "Wet terrace paddy soils in valley pockets (one of the three traditional land-use systems compared in the Khonoma study)",
        "Natural forest soils, used as the fertility benchmark in the Khonoma comparison"
      ],
      "npk": {
        "nitrogen": "Low but not verified at state level — consulted Nagaland studies report available nitrogen rising with longer jhum fallows rather than a state-wide status; no Soil Health Card aggregate for Nagaland was obtainable. Nationally 64% of SHC samples test low in nitrogen (CSE 2025 analysis).",
        "phosphorus": "Not verified at state level — available phosphorus increases with increasing fallow length in the Mokokchung district study; no state-wide tested share was obtainable.",
        "potassium": "Not verified at state level — exchangeable potassium increases with increasing fallow length in the Mokokchung district study; no state-wide tested share was obtainable."
      },
      "micronutrients": {
        "zinc": "Not verified for Nagaland in consulted sources; nationally zinc deficiency is assessed at 36.5% of samples (ICAR-AICRP) and 39% in the CSE analysis of Soil Health Card data.",
        "iron": "Not verified for Nagaland in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Nagaland in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Nagaland in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Rises with jhum fallow length (Mokokchung district soil-quality-index study) and is higher under natural forest and alder-based fallow than under cropped jhum in the Khonoma comparison; no verified state-wide figure was obtainable.",
      "currentState": "A hill state whose soil health is governed by the jhum cycle: shortening fallows drive fertility decline and land degradation, while the indigenous alder-based jhum documented around Khonoma keeps soils measurably more fertile than non-alder shifting cultivation.",
      "issues": [
        "Declining soil fertility and ongoing land degradation from traditional shifting cultivation, identified as a key threat in the uplands of Northeast India",
        "Shortened jhum fallows — soil organic carbon and available N, P and exchangeable K all fall as fallow length shrinks",
        "Steep-slope cultivation with associated erosion risk",
        "No verified state-wide or district-level soil-test aggregate published in accessible form, which leaves nutrient management without a quantified baseline"
      ],
      "recommendations": [
        "Lengthen jhum fallows — organic carbon and available N, P and exchangeable K all increase with fallow period (Mokokchung soil-quality-index study)",
        "Promote alder-based jhum, which showed significant improvement over traditional non-alder jhum on most soil parameters across varied fallow lengths",
        "Shift steeper jhum plots towards wet terrace paddy and tree-based systems — the other traditional land uses studied at Khonoma",
        "Build and publish district-level soil-test aggregates so nutrient advice can replace inference with measurement"
      ],
      "districtHighlights": [
        {
          "district": "Kohima",
          "note": "Khonoma village here is the site of the study comparing natural forest, alder-based jhum fallow and wet terrace paddy for pH, N, P, K, soil organic carbon and organic matter"
        },
        {
          "district": "Mokokchung",
          "note": "Soil quality index study of shifting cultivation and fallow: organic carbon and available N, P and exchangeable K rise with fallow length while pH and bulk density fall"
        }
      ],
      "facts": [
        "In Mokokchung district, longer jhum fallows raised soil organic carbon, available nitrogen, available phosphorus and exchangeable potassium, while soil pH and bulk density decreased.",
        "Alder-based shifting cultivation showed significant improvement over traditional non-alder jhum in most soil parameters across varied fallow lengths in the Eastern Indian Himalayas.",
        "The Khonoma study (Kohima district) compared three traditional land-use systems — natural forest, alder-based jhum fallow and wet terrace paddy — for pH, nitrogen, phosphorus, potassium, soil organic carbon and soil organic matter.",
        "Declining soil fertility and land degradation from traditional shifting cultivation are named as central sustainability problems for upland Northeast India.",
        "Gap: no Nagaland Soil Health Card aggregate or state-wide soil-test summary could be verified here, so the NPK and micronutrient fields above are deliberately left unquantified."
      ],
      "sources": [
        {
          "title": "Soil Nutrients and Fertility in Three Traditional Land Use Systems of Khonoma, Nagaland, India",
          "publisher": "Resources and Environment (Scientific and Academic Publishing)",
          "url": "http://article.sapub.org/10.5923.j.re.20140404.01.html",
          "year": 2014
        },
        {
          "title": "Effect of shifting cultivation and fallow on soil quality index in Mokokchung district, Nagaland, India",
          "publisher": "Ecological Processes (Springer)",
          "url": "https://ecologicalprocesses.springeropen.com/articles/10.1186/s13717-022-00386-w",
          "year": 2022
        },
        {
          "title": "The comparative soil fertility in traditional and alder-based shifting cultivation of varied fallow lengths in Eastern Indian Himalayas",
          "publisher": "Soil Science and Plant Nutrition 67(6)",
          "url": "https://www.tandfonline.com/doi/abs/10.1080/00380768.2021.2009741",
          "year": 2021
        },
        {
          "title": "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data",
          "publisher": "Centre for Science and Environment",
          "url": "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908",
          "year": 2025
        }
      ],
      "confidence": "low",
      "media": []
    },
    "odisha": {
      "name": "Odisha",
      "summary": "Odisha is an acid-soil state. Red soils cover about 7.14 million hectares — the largest area of any soil group in the state — and are strongly to moderately acidic, while laterite soils cover about 0.70 million hectares at pH roughly 4.5-5.8. High exchangeable aluminium and manganese accompany the acidity, and both groups are deficient in nitrogen and phosphorus and highly deficient in boron and molybdenum, with low organic matter in the lateritic tracts. Lime, paper-mill sludge, organic manure, green manuring and balanced fertilisation are the standard corrective package in consulted Odisha soil-management summaries.",
      "soilTypes": [
        "Red soils — about 7.14 million ha, the largest area in the state (Koraput, Rayagada, Nabarangpur, Malkangiri, Keonjhar, Ganjam, Kalahandi, Nuapada, Balangir, Dhenkanal, Mayurbhanj); strongly to moderately acidic",
        "Laterite soils — about 0.70 million ha (Puri, Khordha, Nayagarh, Cuttack, Dhenkanal, Keonjhar, Mayurbhanj, Sambalpur); slightly to strongly acidic at pH about 4.5-5.8, poor in fertility, low in organic matter",
        "Other groups (deltaic and coastal alluvium, black and brown forest soils) appear in Odisha soil classifications, but no verified areas for them were obtainable in this research pass"
      ],
      "npk": {
        "nitrogen": "Low — both the red and the laterite groups are described as deficient in nitrogen, with laterite soils specifically low in available nitrogen alongside low organic matter. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis). No verified Odisha-wide tested share was obtainable.",
        "phosphorus": "Low — red and laterite soils alike are reported deficient in phosphorus, in soils carrying high exchangeable aluminium and manganese.",
        "potassium": "Not verified at state level — consulted Odisha soil summaries emphasise nitrogen, phosphorus, boron and molybdenum shortages and do not give a potassium status share."
      },
      "micronutrients": {
        "zinc": "Not verified for Odisha in consulted sources; nationally zinc deficiency is 36.5% (ICAR-AICRP) and 39% in the CSE analysis of Soil Health Card data.",
        "iron": "Not verified for Odisha in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "High deficiency — both laterite and red soils of Odisha are described as highly deficient in boron (and in molybdenum), which makes boron the state's leading micronutrient gap in consulted sources.",
        "sulphur": "Not verified for Odisha in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Low in the lateritic tracts — laterite soils of Odisha are characterised as poor in fertility with low organic matter content; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of SHC samples test low in organic carbon (CSE 2025).",
      "currentState": "Odisha's defining soil problem is acidity: strongly to moderately acidic red soils across about 7.14 million ha and laterite soils at pH 4.5-5.8 across about 0.70 million ha, carrying high exchangeable aluminium and manganese and short of nitrogen, phosphorus and boron. Neutralising acidity with lime and rebuilding organic matter are the central soil-health tasks.",
      "issues": [
        "Soil acidity — laterite soils at pH about 4.5-5.8, red soils strongly to moderately acidic",
        "High exchangeable aluminium and manganese driving the acidity and constraining root growth",
        "Nitrogen and phosphorus deficiency across both the red and the laterite groups",
        "High deficiency of boron and molybdenum",
        "Low organic matter and generally poor fertility in the lateritic tracts"
      ],
      "recommendations": [
        "Lime application to neutralise soil acidity — the first-line correction in consulted Odisha soil-management guidance",
        "Paper-mill sludge at 1-2 tonnes per hectare as an alternative acidity amendment",
        "Organic manure to lift fertility and organic matter on lateritic and red soils",
        "Green-manure crops in the rotation",
        "Balanced fertiliser use that addresses boron and molybdenum alongside nitrogen and phosphorus"
      ],
      "districtHighlights": [
        {
          "district": "Koraput",
          "note": "Part of the southern red-soil belt (with Rayagada, Nabarangpur, Malkangiri) — strongly to moderately acidic soils deficient in nitrogen and phosphorus"
        },
        {
          "district": "Keonjhar",
          "note": "Carries both red and laterite soils; laterite here is slightly to strongly acidic with high exchangeable aluminium and manganese"
        },
        {
          "district": "Mayurbhanj",
          "note": "Listed for both the red-soil and laterite groups — acidic, boron- and molybdenum-deficient soils"
        },
        {
          "district": "Khordha",
          "note": "Core of the coastal laterite tract (with Puri and Nayagarh) at pH about 4.5-5.8, low in organic matter"
        },
        {
          "district": "Sambalpur",
          "note": "Western laterite district in the 0.70 million ha laterite group; lime and organic amendment are the standard corrections"
        }
      ],
      "facts": [
        "Red soils cover about 7.14 million hectares of Odisha — the largest area of any soil group in the state — and are strongly to moderately acidic.",
        "Laterite soils cover about 0.70 million hectares, chiefly in Puri, Khordha, Nayagarh, Cuttack, Dhenkanal, Keonjhar, Mayurbhanj and Sambalpur, with pH between about 4.5 and 5.8.",
        "Higher amounts of exchangeable aluminium and manganese make these soils slightly to strongly acidic.",
        "Both red and laterite soils of Odisha are deficient in nitrogen and phosphorus and highly deficient in boron and molybdenum.",
        "Recommended corrections include lime, 1-2 tonnes per hectare of paper-mill sludge, organic manure, green-manure crops and balanced fertilisation."
      ],
      "sources": [
        {
          "title": "Status of Odisha's Soils, Chapter 4: Management of Acidic Soils",
          "publisher": "ICRISAT Open Access Repository",
          "url": "https://oar.icrisat.org/11941/1/Ch4-(Management%20of%20acidic%20soils).pdf"
        },
        {
          "title": "Soils of Odisha — soil groups, areas, pH and districts",
          "publisher": "Odisha Geography",
          "url": "https://odishageography.com/soils-of-odisha/"
        },
        {
          "title": "Soils in Odisha: Classification and Management",
          "publisher": "ObjectiveIAS",
          "url": "https://objectiveias.in/geography-of-odisha/soils-in-odisha/"
        },
        {
          "title": "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data",
          "publisher": "Centre for Science and Environment",
          "url": "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908",
          "year": 2025
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "puducherry": {
      "name": "Puducherry",
      "summary": "Puducherry is a four-part coastal UT — Puducherry and Karaikal on the Coromandel coast adjoining Tamil Nadu, Yanam on the Godavari in Andhra Pradesh, and Mahe on the Malabar coast in Kerala — so its soils are coastal rather than continental. Red earth with sandy and silty loams, clays and pebbles is the major soil type, alongside black, alluvial and colluvial soils. Soils derived from coastal and deltaic alluvium are described as fine-textured, alkaline or saline and low in fertility, waterlogged in the rainy season and highly saline in the dry season. No UT-level Soil Health Card nutrient aggregate for Puducherry could be verified in this research pass.",
      "soilTypes": [
        "Red earth with sandy and silty loam soils, clays and pebbles — the major soil type of the UT",
        "Coastal and deltaic alluvium — fine-textured, alkaline/saline, low in fertility, waterlogged in the rains and strongly saline in the dry season",
        "Black soils",
        "Colluvial soils"
      ],
      "npk": {
        "nitrogen": "Not verified at UT level in consulted sources — Puducherry's coastal and deltaic alluvium-derived soils are described broadly as low in fertility rather than by tested nutrient class. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis).",
        "phosphorus": "Not verified at UT level in consulted sources.",
        "potassium": "Not verified at UT level in consulted sources."
      },
      "micronutrients": {
        "zinc": "Not verified for Puducherry in consulted sources; nationally 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        "iron": "Not verified for Puducherry in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Puducherry in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Puducherry in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Not verified at UT level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      "currentState": "A small coastal UT whose binding soil problems are salinity and alkalinity rather than nutrient mining: coastal and deltaic alluvial soils swing between rainy-season waterlogging and dry-season salinity, and groundwater-quality assessment for the Puducherry region treats irrigation-water suitability as a linked constraint.",
      "issues": [
        "Alkaline/saline coastal and deltaic alluvial soils of low fertility",
        "Waterlogging in the rainy season followed by high salinity in the dry season",
        "Groundwater quality constraints on irrigation in the Puducherry region",
        "A UT split across four separated coastal enclaves with very different soil settings, which prevents any single soil prescription",
        "No verifiable UT-level soil-test or Soil Health Card aggregate published in accessible form"
      ],
      "recommendations": [
        "Drainage improvement to break the rainy-season waterlogging then dry-season salinity cycle on deltaic alluvium",
        "Salinity and alkalinity management on coastal alluvial soils, coupled to irrigation-water quality monitoring",
        "Organic matter addition on low-fertility red earths and coastal alluvium",
        "Publish district-level Soil Health Card aggregates for all four districts so nutrient status is documented, not inferred"
      ],
      "districtHighlights": [
        {
          "district": "Puducherry",
          "note": "Coromandel-coast district adjoining Tamil Nadu; red earth with sandy and silty loams, clays and pebbles, and the area covered by the region's groundwater-quality assessment for domestic and agricultural use"
        },
        {
          "district": "Karaikal",
          "note": "Also on the Coromandel coast adjoining Tamil Nadu, in the Cauvery delta setting where coastal/deltaic alluvium is fine-textured, alkaline or saline and low in fertility"
        },
        {
          "district": "Yanam",
          "note": "Enclave on the Godavari in Andhra Pradesh — deltaic alluvium with the same waterlogging-then-salinity seasonal cycle"
        },
        {
          "district": "Mahe",
          "note": "Malabar-coast enclave adjoining Kerala; a wholly different high-rainfall coastal soil setting from the Coromandel districts"
        }
      ],
      "facts": [
        "Puducherry consists of four unconnected districts: Puducherry and Karaikal on the Coromandel coast next to Tamil Nadu, Yanam on the Godavari next to Andhra Pradesh, and Mahe on the Malabar coast next to Kerala.",
        "The major soil type is red earth, with sandy and silty loam soils, clays and pebbles; red, black, alluvial and colluvial soils all occur.",
        "Soils derived from coastal and deltaic alluvium are fine, alkaline or saline and low in fertility, with waterlogging in the rainy season and high salinity in the dry season.",
        "Groundwater quality in the Puducherry region has been formally assessed for domestic and agricultural suitability, linking soil salinity management to irrigation-water quality.",
        "Gap: no Puducherry-specific Soil Health Card nutrient aggregate could be verified in this research pass, so NPK, micronutrient and organic carbon fields are left unquantified."
      ],
      "sources": [
        {
          "title": "Puducherry — state/UT agricultural profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17282"
        },
        {
          "title": "Groundwater quality assessment for domestic and agriculture purposes in Puducherry region",
          "publisher": "Applied Water Science (Springer)",
          "url": "https://link.springer.com/article/10.1007/s13201-017-0556-y",
          "year": 2017
        },
        {
          "title": "Puducherry (Chapter 28) — Geotechnical Characteristics of Soils and Rocks of India",
          "publisher": "CRC Press / Taylor & Francis",
          "url": "https://www.taylorfrancis.com/chapters/edit/10.1201/9781003177159-28/puducherry-saravanan-kaviarasu-ramesh-premkumar"
        },
        {
          "title": "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data",
          "publisher": "Centre for Science and Environment",
          "url": "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908",
          "year": 2025
        }
      ],
      "confidence": "low",
      "media": []
    },
    "punjab": {
      "name": "Punjab",
      "summary": "Punjab's soil problem is over-use, not natural poverty. The state has India's highest per-hectare chemical fertiliser consumption — 253.94 kg/ha in 2021-22 — applied to a rice-wheat monoculture that takes about 85% of accessible groundwater. Mapping of intensively cultivated Punjab soils found more than 90% low to medium in organic carbon and 50% low to medium in available phosphorus, while potassium remains comfortable (only about 3% of samples low) and about 11% of samples tested low in zinc. Water tables in central Punjab have fallen at accelerating rates and about 79% of groundwater assessment blocks are over-exploited or critical, even as wheat yields have slipped.",
      "soilTypes": [
        "Intensively cultivated alluvial soils of the Indo-Gangetic plain under the rice-wheat system (dominant; the subject of the state fertility mapping study)",
        "Arid-tract sandy soils of south-western Punjab — the Mansa study recorded organic carbon of 0.02-0.40% with a mean of 0.29%",
        "Northern and central Punjab soils surveyed at Punjab Agricultural University regional research stations (Gurdaspur, Kapurthala)"
      ],
      "npk": {
        "nitrogen": "Low in effective terms despite the heaviest fertiliser use in India — Punjab applies 253.94 kg/ha of chemical fertiliser (2021-22), the highest in the country, yet consulted analyses report soil fertility still declining and organic content driven towards near-zero by excessive chemical fertiliser use. No verified Punjab-wide Soil Health Card nitrogen share was obtainable; nationally 64% of SHC samples test low in nitrogen.",
        "phosphorus": "Low to medium — 50% of intensively cultivated Punjab soils tested low to medium in available phosphorus in the state fertility mapping study.",
        "potassium": "Medium to high — available potassium is generally medium to high, with only about 3% of soil samples testing low; one arid-tract study recorded 176.34-271.77 kg/ha, described as sufficient."
      },
      "micronutrients": {
        "zinc": "Deficient in a minority of soils — about 11% of samples from intensively cultivated Punjab soils tested low in zinc (national figure 36.5%, ICAR-AICRP). Consulted Soil Health Card material reports that zinc application alone can raise rice and wheat yields 15-20% on deficient soils.",
        "iron": "Iron is named among the micronutrients whose deficiency causes yield loss in high-fertiliser states, but no verified Punjab-specific tested share was obtainable; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Punjab in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Punjab in consulted sources; sulphur is listed among the deficiencies produced by over-application of urea alongside under-application of other nutrients. National figure 40.5% (ICAR-AICRP)."
      },
      "organicCarbon": "Low to medium in more than 90% of Punjab's soils per the mapping of intensively cultivated soils; in the arid south-western tract (Mansa) organic carbon ranged 0.02-0.40% with a mean of 0.29%. Agricultural experts quoted in consulted reporting say overuse of chemical fertilisers has brought the organic component of the soil to almost zero.",
      "currentState": "Punjab is India's clearest case of soil health degraded by over-fertilisation: the highest fertiliser use per hectare in the country, more than 90% of soils low to medium in organic carbon, falling wheat yields, and a central-Punjab water table whose decline accelerated from about 18 cm a year in 1982-87 to 75 cm in 2002-06, with about 79% of groundwater assessment blocks over-exploited or critical.",
      "issues": [
        "Highest per-hectare chemical fertiliser consumption in India — 253.94 kg/ha in 2021-22 — with imbalanced NPK use",
        "More than 90% of soils low to medium in organic carbon; consulted reporting describes the organic component as driven to almost zero by fertiliser overuse",
        "Falling productivity despite rising inputs — wheat output fell from 178 lakh tonnes (2017-18) to 149 lakh tonnes (2021-22), and wheat yield from 5,077 to 4,216 kg/ha, as reported by The Tribune",
        "Groundwater depletion — about 79% of assessment blocks over-exploited or critical, with central-Punjab water-table decline accelerating from about 18 cm/yr (1982-87) to 42 cm/yr (1997-2002) to 75 cm (2002-06)",
        "Rice-wheat monoculture consuming about 85% of accessible groundwater, sustained by tube wells and electricity subsidy",
        "Soil acidification reported in high-urea states including Punjab and Haryana",
        "Available phosphorus low to medium in half of intensively cultivated soils; about 11% of soils zinc-deficient"
      ],
      "recommendations": [
        "Replace blanket urea doses with Soil Health Card-based recommendations — consulted scheme material reports average yield gains of 8-10% for farmers who follow SHC advice",
        "Rebuild organic carbon through residue retention instead of burning, farmyard manure and green manuring, given more than 90% of soils are low to medium in organic carbon",
        "Diversify out of rice-wheat monoculture to cut groundwater draft, since about 85% of accessible groundwater goes to those two crops",
        "Correct phosphorus on the half of soils testing low to medium, and apply zinc only where soil tests show deficiency (about 11% of samples) rather than uniformly",
        "Address the acidification risk that continued heavy urea use creates in Punjab and Haryana"
      ],
      "districtHighlights": [
        {
          "district": "Mansa",
          "note": "Arid-tract district where soil organic carbon ranged 0.02-0.40% with a mean of 0.29% — among the lowest recorded in the state"
        },
        {
          "district": "Gurdaspur",
          "note": "PAU Regional Research Station soils here have been formally assessed for fertility status, part of the station-level baseline network"
        },
        {
          "district": "Kapurthala",
          "note": "PAU Regional Research Station soil fertility status published separately, giving a central-Punjab reference point"
        }
      ],
      "facts": [
        "Punjab has the highest per-hectare consumption of chemical fertilisers in India: 253.94 kg per hectare in 2021-22.",
        "Mapping of intensively cultivated Punjab soils found more than 90% low to medium in soil organic carbon, 50% low to medium in available phosphorus, only about 3% low in available potassium, and about 11% low in zinc.",
        "Soils of the arid tract around Mansa recorded organic carbon of 0.02-0.40% with a mean of 0.29%.",
        "About 79% of Punjab's groundwater assessment blocks are classed over-exploited or critical, and the central-Punjab water table fell about 18 cm/yr in 1982-87, 42 cm/yr in 1997-2002 and 75 cm in 2002-06.",
        "Roughly 85% of the state's accessible groundwater is used to grow rice and wheat.",
        "The Tribune reported Punjab's wheat production falling from 178 lakh metric tonnes in 2017-18 to 149 lakh metric tonnes in 2021-22, with wheat yield down from 5,077 to 4,216 kg/ha."
      ],
      "sources": [
        {
          "title": "Mapping of Chemical Characteristics and Fertility Status of Intensively Cultivated Soils of Punjab, India",
          "publisher": "Communications in Soil Science and Plant Analysis 47(15)",
          "url": "https://www.tandfonline.com/doi/full/10.1080/00103624.2016.1208756",
          "year": 2016
        },
        {
          "title": "Fertiliser overuse: wheat yield, soil fertility decrease in Punjab",
          "publisher": "The Tribune",
          "url": "https://www.tribuneindia.com/news/punjab/fertiliser-overuse-wheat-yield-soil-fertility-decrease-in-punjab-521065/amp"
        },
        {
          "title": "Punjab, India — groundwater depletion and the rice-wheat system",
          "publisher": "Columbia Water Center, Columbia University",
          "url": "https://water.columbia.edu/content/punjab-india"
        },
        {
          "title": "Accelerating rate of groundwater depletion in Punjab worries farmers and experts",
          "publisher": "Mongabay India",
          "url": "https://india.mongabay.com/2022/06/accelerating-rate-of-groundwater-depletion-in-punjab-worries-farmers-and-experts/",
          "year": 2022
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "rajasthan": {
      "name": "Rajasthan",
      "summary": "Rajasthan is India's arid-soil state: sandy soils are the most extensive, and semi-arid tracts commonly carry high exchangeable sodium, producing sodic soils. Salinity here is largely irrigation-induced — canal water in the arid north-west (Sri Ganganagar, Hanumangarh and Bikaner through the Indira Gandhi Nahar Pariyojana) and the south-west (Sanchore-Jalore and Barmer through the Narmada canal) has produced high-NaCl soils described as the least fertile in the state. Fittingly, the national Soil Health Card scheme was launched at Suratgarh in Rajasthan on 19 February 2015. Verified state-wide nutrient aggregates for Rajasthan were not obtainable in this research pass.",
      "soilTypes": [
        "Sandy desert and arid soils — the most extensive soil type in Rajasthan",
        "Sodic soils of the semi-arid tracts, marked by high exchangeable sodium",
        "Irrigation-induced saline soils with high sodium chloride — the IGNP command in Sri Ganganagar, Hanumangarh and Bikaner, and the Narmada canal command around Sanchore-Jalore and Barmer — described as the least fertile soils of the state"
      ],
      "npk": {
        "nitrogen": "Not verified at state level in consulted sources — Rajasthan's arid sandy and saline soils are characterised as low in fertility rather than by a tested nitrogen class. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis), and 27 states/UTs show nitrogen deficiency in 90% of samples.",
        "phosphorus": "Not verified at state level in consulted sources; imbalanced fertiliser application is reported to have caused deficiency of primary nutrients (NPK) in most parts of the country.",
        "potassium": "Not verified at state level in consulted sources."
      },
      "micronutrients": {
        "zinc": "Not verified for Rajasthan in consulted sources; zinc is named among the micronutrients made deficient by imbalanced fertiliser use in most parts of the country. National figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        "iron": "Not verified for Rajasthan in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Rajasthan in consulted sources; boron is named among the deficient micronutrients nationally. National figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Rajasthan in consulted sources; sulphur is named among the deficient secondary nutrients nationally. National figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Not verified at state level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis). Rajasthan's arid sandy and saline soils are described as least fertile in consulted state soil descriptions.",
      "currentState": "An arid state whose binding soil constraints are texture and chemistry rather than nutrient mining: extensive sandy soils with little water- and nutrient-holding capacity, sodicity from high exchangeable sodium in the semi-arid tracts, and secondary salinisation in the IGNP and Narmada canal command areas.",
      "issues": [
        "Extensive sandy desert soils with poor fertility and low water-holding capacity",
        "Sodic soils in semi-arid tracts, produced by high exchangeable sodium",
        "Irrigation-induced salinity in canal commands — Sri Ganganagar, Hanumangarh and Bikaner under the IGNP, and Sanchore-Jalore and Barmer under the Narmada canal — with high NaCl content and the lowest fertility in the state",
        "Imbalanced fertiliser application causing deficiency of NPK, sulphur and micronutrients including boron, zinc and copper (national finding applied to Rajasthan by consulted scheme material)",
        "No verified state-wide Soil Health Card nutrient aggregate available in accessible form"
      ],
      "recommendations": [
        "Salinity and sodicity diagnosis and management in irrigated tracts — the approach of the ICAR salinity/sodicity/fertility indices study of south-eastern Jodhpur soils",
        "Irrigation-water and drainage management in the IGNP and Narmada canal commands to limit further secondary salinisation",
        "Soil Health Card-based balanced fertilisation to correct the NPK, sulphur and micronutrient imbalances that consulted scheme material attributes to unbalanced fertiliser use",
        "Organic matter addition and moisture-conserving practices on sandy arid soils"
      ],
      "districtHighlights": [
        {
          "district": "Sri Ganganagar",
          "note": "Suratgarh here is where the national Soil Health Card scheme was launched on 19 February 2015; the district also lies in the IGNP command where irrigation has produced saline soils"
        },
        {
          "district": "Hanumangarh",
          "note": "IGNP command district where excessive irrigation in an arid setting has produced high-NaCl saline soils"
        },
        {
          "district": "Bikaner",
          "note": "Third of the IGNP-command districts named for irrigation-induced salinity"
        },
        {
          "district": "Jalore",
          "note": "Sanchore-Jalore tract, where Narmada canal irrigation has produced saline soils described as the least fertile in the state"
        },
        {
          "district": "Jodhpur",
          "note": "South-eastern Jodhpur soils are the subject of a published evaluation of salinity, sodicity and fertility indices in the ICAR Journal of Soil Salinity and Water Quality"
        }
      ],
      "facts": [
        "Sandy soil is the most widespread soil type in Rajasthan.",
        "Semi-arid Rajasthan often shows high exchangeable sodium, producing sodic soils.",
        "Saline soils formed by excessive irrigation in arid areas occur in Sri Ganganagar, Hanumangarh and Bikaner via the Indira Gandhi Nahar Pariyojana, and in Sanchore-Jalore and Barmer via the Narmada canal; they carry high NaCl and are the least fertile soils of the state.",
        "The national Soil Health Card scheme was launched on 19 February 2015 at Suratgarh, Rajasthan.",
        "Gap: no state-wide Rajasthan Soil Health Card aggregate for NPK, organic carbon or micronutrients could be verified in this research pass, so those fields are left unquantified."
      ],
      "sources": [
        {
          "title": "Soil Health Card — factsheet (scheme launched 19 February 2015 at Suratgarh, Rajasthan)",
          "publisher": "Press Information Bureau, Government of India",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2"
        },
        {
          "title": "Evaluation of Salinity, Sodicity and Fertility Indices of Soils of South-Eastern Jodhpur (Rajasthan), India",
          "publisher": "Journal of Soil Salinity and Water Quality (ICAR ePubs)",
          "url": "https://epubs.icar.org.in/index.php/JoSSWQ/article/view/166633"
        },
        {
          "title": "Soil — Rajasthan: soil types, saline and sodic tracts",
          "publisher": "RajEdu (Rajasthan geography reference)",
          "url": "https://rajedu.in/rajasthan/3_geography/soils"
        },
        {
          "title": "Soil Health Card Scheme (Swasth Dhara Khet Hara) — Rajasthan Agriculture Department",
          "publisher": "Government of Rajasthan",
          "url": "https://www.tourism.rajasthan.gov.in/content/dam/agriculture/Agriculture%20Department/programs-scheme/schemes-programs/soil_123-11.pdf"
        }
      ],
      "confidence": "low",
      "media": []
    },
    "sikkim": {
      "name": "Sikkim",
      "summary": "Sikkim became India's first fully organic state in January 2016, after the state government and contracted agencies certified more than 75,000 hectares of farmland; the state now reports more than 76,000 hectares under organic management with over 66,000 farming families inside the system. All farming is carried out without synthetic fertilisers or pesticides, so soil fertility is maintained by organic inputs rather than mineral fertiliser. The enabling instruments were the State Policy on Organic Farming (2004) and the Sikkim Organic Mission (2010), which together won the Future Policy Gold Award in 2018 against 50 other nominated policies. Verified state-wide soil-test data — pH, organic carbon, NPK, micronutrients — was not obtainable in this research pass.",
      "soilTypes": [
        "Mountain and hill soils across the state's steep Himalayan terrain, farmed entirely organically since the 2016 declaration (no verified state-wide soil-classification or area breakdown was obtainable in this pass)",
        "Terraced cropland soils on hill slopes, managed with compost and manure in place of mineral fertiliser"
      ],
      "npk": {
        "nitrogen": "Not verified at state level in consulted sources — Sikkim's nitrogen supply comes from organic inputs, since no synthetic fertiliser is used anywhere in the state; no Soil Health Card aggregate for Sikkim was obtainable. Nationally 64% of SHC samples test low in nitrogen (CSE 2025 analysis).",
        "phosphorus": "Not verified at state level in consulted sources.",
        "potassium": "Not verified at state level in consulted sources."
      },
      "micronutrients": {
        "zinc": "Not verified for Sikkim in consulted sources; national figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        "iron": "Not verified for Sikkim in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Sikkim in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Sikkim in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Not verified at state level in consulted sources. The mechanism is documented even where the measurement is not: all Sikkim farming operates without synthetic fertilisers or pesticides, so organic inputs are the sole nutrient and carbon source across more than 76,000 hectares.",
      "currentState": "The world's first fully organic state. Since January 2016 all of Sikkim's roughly 76,000 hectares of farmland has been certified organic and worked without synthetic fertilisers or pesticides, making soil-carbon and biological fertility management the state's default practice rather than an intervention.",
      "issues": [
        "No verified state-wide soil-test data (pH, organic carbon, NPK, micronutrients) is published in accessible form, so the soil-chemistry outcomes of the organic transition are undocumented here",
        "Steep Himalayan terrain limits cultivable area and exposes terraced soils to erosion",
        "The practical uniformity of the 100% organic claim has been re-examined critically in national reporting (Down To Earth), so on-the-ground consistency across all districts should not be assumed"
      ],
      "recommendations": [
        "Publish district-level soil-test aggregates so organic carbon and nutrient trends under the organic system can be tracked, not just certified",
        "Continue compost and manure-based nutrient cycling, which substitutes for mineral fertiliser statewide",
        "Erosion control on steep terraced slopes, where soil loss undercuts organically built fertility",
        "Extend the certification record system to cover nutrient status, not only organic status"
      ],
      "districtHighlights": [
        {
          "district": "Gangtok (formerly East Sikkim)",
          "note": "Administrative core of the Sikkim Organic Mission; organic certification is statewide, and no district-level soil-test aggregate was verifiable in consulted sources"
        },
        {
          "district": "Namchi (formerly South Sikkim)",
          "note": "Southern farming district inside the statewide organic certification covering more than 76,000 hectares"
        },
        {
          "district": "Gyalshing (formerly West Sikkim)",
          "note": "Western district within the fully organic system; no synthetic fertiliser or pesticide use is permitted anywhere in the state"
        },
        {
          "district": "Mangan (formerly North Sikkim)",
          "note": "High-altitude northern district; organic certification applies here too, but no district soil-test aggregate was obtainable"
        }
      ],
      "facts": [
        "In January 2016 Sikkim was declared India's first 100% organic state.",
        "More than 75,000 hectares had been certified organic by 2016 when the declaration was made; the state now reports more than 76,000 hectares of organic farmland.",
        "Over 66,000 farming families are part of Sikkim's organic ecosystem.",
        "The Sikkim Organic Mission, formed in 2010, was the nodal agency implementing the state's organic policy; the State Policy on Organic Farming (2004) and the Mission won the Future Policy Gold Award in 2018, beating 50 other nominated policies.",
        "All farming in Sikkim is carried out without synthetic fertilisers and pesticides.",
        "Gap: no Sikkim-specific Soil Health Card or state-wide soil-test aggregate could be verified in this research pass, so NPK, micronutrient and organic carbon values are left unquantified."
      ],
      "sources": [
        {
          "title": "Sikkim — the first 100% organic state in the world",
          "publisher": "IFOAM Organics International (Organic Without Boundaries)",
          "url": "https://www.organicwithoutboundaries.bio/2018/10/17/sikkim/",
          "year": 2018
        },
        {
          "title": "Sikkim's organic farming policy and Sikkim Organic Mission win the Future Policy Gold Award",
          "publisher": "FAO Agroecology Knowledge Hub",
          "url": "https://www.fao.org/agroecology/slideshow/news-article/en/c/1157015",
          "year": 2018
        },
        {
          "title": "Sikkim is 100% organic! Take a second look",
          "publisher": "Down To Earth",
          "url": "https://www.downtoearth.org.in/agriculture/organic-trial-57517"
        },
        {
          "title": "How Sikkim in India became the world's first fully organic state",
          "publisher": "Forbes",
          "url": "https://www.forbes.com/sites/indrabatilahiri/2025/05/18/how-sikkim-in-india-became-the-worlds-first-fully-organic-state/",
          "year": 2025
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "tamil-nadu": {
      "name": "Tamil Nadu",
      "summary": "Tamil Nadu's cultivated soils are dominated by red soils and black (regur) soils, with deltaic alluvium in the Cauvery basin. The recurring soil-test signature is low nitrogen against adequate or high phosphorus and potassium: 45% of surveyed paddy-farming households reported low nitrogen on their Soil Health Cards while high phosphorus and potassium were recorded. District appraisals sharpen the picture — Villupuram is predominantly alkaline and non-saline with low organic carbon, low nitrogen, high phosphorus, medium potassium and predominantly deficient zinc, while Kancheepuram shows low nitrogen and potassium with almost all secondary and micronutrients deficient and iron alone sufficient.",
      "soilTypes": [
        "Red soils — dominant across the uplands; rich in calcium carbonate, magnesium and potash but low in nitrogen and phosphorus",
        "Black (regur) soils — rich in potash, deficient in nitrogen and phosphorus, with high water retention capacity",
        "Deltaic and riverine alluvium of the Cauvery basin (Thanjavur and the delta districts)",
        "Coastal sandy and laterite soils along the seaboard and uplands"
      ],
      "npk": {
        "nitrogen": "Low — 45% of surveyed paddy-farming households in Tamil Nadu reported low nitrogen on their Soil Health Cards, and district appraisals for Villupuram, Thanjavur and Kancheepuram all found low available nitrogen.",
        "phosphorus": "Medium to high but variable — high phosphorus was recorded in the Soil Health Card survey and available P was high in Villupuram; Thanjavur farm soils tested medium to low, and in Kancheepuram phosphorus was low in acidic soils and high in alkaline soils.",
        "potassium": "Medium to high in general, with sharp exceptions — medium in Villupuram, but low in both Thanjavur research-farm soils and Kancheepuram."
      },
      "micronutrients": {
        "zinc": "Deficient in parts of the state — predominantly deficient in Villupuram and among the deficient micronutrients in Kancheepuram, while Thanjavur farm soils tested sufficient in available zinc.",
        "iron": "Generally sufficient — sufficient in both Villupuram and Thanjavur, and the one micronutrient that remained in sufficient status in Kancheepuram.",
        "boron": "Patchy — sufficient in Villupuram but deficient in Kancheepuram; no verified state-wide share was obtainable. National figure 23.2% (ICAR-AICRP).",
        "sulphur": "Patchy — sufficient in Villupuram but low in Kancheepuram along with calcium and magnesium. National figure 40.5% (ICAR-AICRP)."
      },
      "organicCarbon": "Low in the appraised districts — Villupuram soils were low in organic carbon; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      "currentState": "Tamil Nadu's soils are characteristically nitrogen-poor but phosphorus- and potassium-adequate, with alkaline rather than acidic reaction the norm in districts like Villupuram. Micronutrient status is highly local, ranging from zinc-deficient-only Villupuram to Kancheepuram, where nearly all secondary nutrients and micronutrients test low and only iron remains sufficient.",
      "issues": [
        "Low available nitrogen across appraised districts and in 45% of surveyed farmers' Soil Health Cards",
        "Low organic carbon in appraised districts such as Villupuram",
        "Alkaline soil reaction in districts like Villupuram, which constrains micronutrient availability",
        "Zinc deficiency in red and alkaline soils; near-complete secondary- and micronutrient depletion reported for Kancheepuram (Ca, Mg, S, Zn, Mn, Cu, B all low)",
        "Potassium depletion in specific tracts — Thanjavur research-farm soils and Kancheepuram — despite generally adequate state-level potassium",
        "A gap between soil-test recommendations and actual farmer fertiliser practice, the subject of a dedicated Tamil Nadu survey"
      ],
      "recommendations": [
        "Nitrogen-focused, soil-test-based fertiliser recommendations instead of blanket doses, since phosphorus already tests high in much of the state",
        "Cut phosphorus application where soil tests read high (Villupuram, alkaline Kancheepuram soils) to stop further build-up",
        "Targeted zinc application only in districts where zinc tests deficient, and a full secondary/micronutrient package for tracts like Kancheepuram",
        "Raise organic carbon through organic manures and residue incorporation, particularly on low-OC alkaline soils",
        "Close the soil-testing-to-practice gap through extension, since the consulted survey found farmer fertiliser decisions diverging from soil-test recommendations"
      ],
      "districtHighlights": [
        {
          "district": "Villupuram",
          "note": "Soil fertility appraisal found the district predominantly alkaline and non-saline, with low organic carbon, low available nitrogen, high available phosphorus, medium potassium, predominantly deficient zinc and sufficient Cu, S, Fe, Mn and B"
        },
        {
          "district": "Thanjavur",
          "note": "Cauvery delta district; soils of the TNAU Agricultural College and Research Institute tested low in available nitrogen, medium to low in phosphorus and low in available potassium, with sufficient Zn, Cu, Mn and Fe"
        },
        {
          "district": "Kancheepuram",
          "note": "Available nitrogen and potassium low; phosphorus low in acidic soils and high in alkaline soils; almost all secondary nutrients (Ca, Mg, S) and micronutrients (Zn, Mn, Cu, B) deficient, with iron alone sufficient"
        }
      ],
      "facts": [
        "Among surveyed paddy-farming households in Tamil Nadu, 45% reported low nitrogen content on their soil health cards, while high phosphorus and potassium content was recorded.",
        "Villupuram district soils are predominantly alkaline and non-saline, with low organic carbon, low available nitrogen, high available phosphorus and medium available potassium; zinc is predominantly deficient while copper, sulphur, iron, manganese and boron are sufficient.",
        "Soils of the TNAU Agricultural College and Research Institute, Thanjavur, were low in available nitrogen, medium to low in phosphorus and low in available potassium, but sufficient in zinc, copper, manganese and iron.",
        "In Kancheepuram district, available nitrogen and potassium were low, phosphorus was low in acidic and high in alkaline soils, and almost all secondary and micronutrients were deficient with iron alone sufficient.",
        "Tamil Nadu's red soils are rich in calcium carbonate, magnesium and potash but low in nitrogen and phosphorus; its black soils are rich in potash yet deficient in nitrogen and phosphorus, with high water retention."
      ],
      "sources": [
        {
          "title": "Soil Fertility Appraisal for Villupuram District of Tamil Nadu",
          "publisher": "Indian Society of Soil Science",
          "url": "https://www.isss-india.org/downloads/05-R-Santhi.pdf"
        },
        {
          "title": "Status of Soil Testing and Fertilizer Recommendations by the Farmers of Tamil Nadu",
          "publisher": "Agricultural Science Digest (ARCC Journals)",
          "url": "https://arccjournals.com/journal/agricultural-science-digest/D-5018"
        },
        {
          "title": "Soil fertility status of Agricultural College and Research Institute, Thanjavur, Tamil Nadu, India",
          "publisher": "peer-reviewed paper (ResearchGate record)",
          "url": "https://www.researchgate.net/publication/372915068_Soil_fertility_status_of_Agricultural_College_and_Research_Institute_Thanjavur_Tamil_Nadu_India",
          "year": 2023
        },
        {
          "title": "Fertiliser Consumption and Soil Health Status in Tamil Nadu",
          "publisher": "research paper (Academia.edu record)",
          "url": "https://www.academia.edu/38872670/Fertiliser_Consumption_and_Soil_Health_Status_in_Tamil_Nadu"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "telangana": {
      "name": "Telangana",
      "summary": "Telangana's cultivated area is dominated by red soils, including the light red chalka sandy soils that are poor in nitrogen and phosphorus, with black cotton (regur) soils in pockets. Soil-test work on paddy-growing red soils of the Central Telangana Zone is stark: of 59 samples, 97% were low in available nitrogen, 90% were high in available phosphorus and 47% were high in available potassium — a textbook picture of nitrogen mining alongside phosphorus build-up. Micronutrient deficiency is comparatively modest where measured: forage-growing soils of Yadadri Bhuvanagiri district were deficient in available zinc in 9.4% and available iron in 10.6% of samples.",
      "soilTypes": [
        "Red soils including light red chalka (sandy) soils — dominant; red sandy soils are poor in nitrogen and phosphorus and less fertile",
        "Red loamy and red sandy paddy soils of the Central Telangana Zone, the subject of the state's most detailed published fertility survey",
        "Black cotton (regur) soils — higher in iron and calcium but lower in phosphorus, nitrogen and organic matter"
      ],
      "npk": {
        "nitrogen": "Low — 97% of 59 paddy-growing red-soil samples from Central Telangana Zone districts tested low in available nitrogen, and red chalka and red sandy soils are separately described as poor in nitrogen.",
        "phosphorus": "High — 90% of the same samples tested high in available phosphorus, indicating build-up from continued phosphatic fertiliser application.",
        "potassium": "Medium to high — 47% of the Central Telangana Zone paddy soil samples tested high in available potassium."
      },
      "micronutrients": {
        "zinc": "Deficient in about 9.4% of forage-growing soils sampled in Yadadri Bhuvanagiri district; no verified state-wide share was obtainable. National figure 36.5% (ICAR-AICRP).",
        "iron": "Deficient in about 10.6% of the same Yadadri Bhuvanagiri forage soils. National figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Telangana in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Telangana in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Low in the black cotton soils, which are described as containing less organic material along with less phosphorus and nitrogen; no verified state-wide organic carbon aggregate was obtainable. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025).",
      "currentState": "Telangana's red-soil paddy belts show near-universal nitrogen deficiency — 97% of tested samples low — alongside phosphorus that has built up to high levels in 90% of them. The state's fertiliser problem is therefore one of composition rather than quantity.",
      "issues": [
        "Near-universal nitrogen deficiency in paddy-growing red soils — 97% of tested samples low in available nitrogen",
        "Phosphorus build-up: 90% of the same samples high in available phosphorus, implying continued unnecessary phosphatic application",
        "Inherently low fertility of red chalka and red sandy soils, poor in both nitrogen and phosphorus",
        "Low organic matter in black cotton (regur) soils",
        "Localised zinc and iron deficiency — 9.4% and 10.6% of forage-growing soils in Yadadri Bhuvanagiri district"
      ],
      "recommendations": [
        "Sharply reduce or stop phosphatic fertiliser on the 90% of red-soil paddy fields testing high in available phosphorus, and redirect spend to nitrogen and organic matter",
        "Soil-test-based, split nitrogen scheduling in paddy on red soils, where 97% of samples test low",
        "Build organic matter on red chalka and black cotton soils to lift their weak nitrogen and organic carbon base",
        "Apply zinc and iron only where soil tests confirm deficiency, as in parts of Yadadri Bhuvanagiri, rather than uniformly",
        "Extend village-level fertility mapping of the kind carried out at Gudur village, Ranga Reddy district"
      ],
      "districtHighlights": [
        {
          "district": "Ranga Reddy",
          "note": "Red chalka soil localities including Rajendranagar, Hayathnagar and Saroornagar; also the site of village-level soil fertility status and mapping work at Gudur"
        },
        {
          "district": "Yadadri Bhuvanagiri",
          "note": "Forage-growing soils here were deficient in available zinc in 9.4% and available iron in 10.6% of samples"
        },
        {
          "district": "Medchal-Malkajgiri",
          "note": "Medchal, Shameerpet and Quthbullapur are listed among the state's red chalka soil localities — light, sandy, poor in nitrogen and phosphorus"
        }
      ],
      "facts": [
        "Of 59 soil samples from paddy-growing red soils of Central Telangana Zone districts, 97% were low in available nitrogen, 90% were high in available phosphorus and 47% were high in available potassium.",
        "Red chalka soils occur at Medchal, Shameerpet, Quthbullapur, Hayathnagar, Saroornagar and Rajendranagar; red sandy soils are poor in nitrogen and phosphorus and less fertile.",
        "Black cotton (regur) soils of Telangana have higher iron and calcium content but less phosphorus, nitrogen and organic material.",
        "In forage-growing soils of Yadadri Bhuvanagiri district, 9.4% of samples were deficient in available zinc and 10.6% in available iron.",
        "PJTSAU has published district- and village-level fertility surveys for Telangana, including soil fertility status and mapping for Gudur village in Ranga Reddy district."
      ],
      "sources": [
        {
          "title": "Soil fertility status of paddy growing red soils of Central Telangana Zone districts of Telangana State, India",
          "publisher": "The Journal of Research PJTSAU (ICAR ePubs)",
          "url": "https://epubs.icar.org.in/index.php/TJRP/article/view/136017"
        },
        {
          "title": "Soil fertility status of forage growing soils of Yadadri Bhuvanagiri district",
          "publisher": "The Pharma Innovation Journal",
          "url": "https://www.thepharmajournal.com/archives/2022/vol11issue8/PartP/11-8-111-215.pdf",
          "year": 2022
        },
        {
          "title": "Soil fertility status and mapping in Gudur Village of Ranga Reddy district",
          "publisher": "The Pharma Innovation Journal",
          "url": "https://www.thepharmajournal.com/archives/2023/vol12issue6/PartAM/12-6-318-690.pdf",
          "year": 2023
        },
        {
          "title": "Red Soils of Telangana: types, properties and distribution",
          "publisher": "KPIAS Academy (Telangana geography reference)",
          "url": "https://kpiasacademy.com/red-soils-telangana-types-properties-agriculture/"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "tripura": {
      "name": "Tripura",
      "summary": "Tripura's soils are acidic, medium in available nitrogen, low in available phosphorus and medium in available potassium, according to the published fertility survey of selected Tripura soils. Available zinc was low in every sample analysed, which the study attributes to the strongly acidic soil reaction. Liming to raise soil pH into the 5.5-7.8 range required for crop productivity is the standard recommendation. The state's red and laterite-group soils are separately described as poor in lime, magnesia, phosphates, nitrogen and humus. No district-level or state-wide Soil Health Card aggregate for Tripura could be verified in this research pass.",
      "soilTypes": [
        "Acidic cultivated soils across the state — the surveyed Tripura soils are acidic in reaction (dominant)",
        "Red and laterite-group soils of the eastern-India type — poor in lime, magnesia, phosphates, nitrogen and humus",
        "Valley and terrace soils between the state's north-south hill ranges (no verified area breakdown was obtainable)"
      ],
      "npk": {
        "nitrogen": "Medium — Tripura soils are medium in available nitrogen content in the consulted state fertility survey, an unusual result against the national picture in which 64% of Soil Health Card samples test low in nitrogen.",
        "phosphorus": "Low — the surveyed Tripura soils are low in available phosphorus, consistent with strong phosphorus fixation in acid soils and with the red/laterite group being poor in phosphates.",
        "potassium": "Medium — the surveyed Tripura soils are medium in available potassium."
      },
      "micronutrients": {
        "zinc": "Low in all soil samples analysed in the consulted Tripura fertility survey, which attributes this to the strongly acidic nature of the soils — the state's clearest verified micronutrient gap.",
        "iron": "Not reported as deficient in consulted sources; national figure 12.8% (ICAR-AICRP).",
        "boron": "Not verified for Tripura in consulted sources; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not verified for Tripura in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Not verified at state level in consulted sources; the state's red and laterite-group soils are described as poor in humus. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025 analysis).",
      "currentState": "An acid-soil hill state whose nitrogen and potassium test medium but whose phosphorus is low and whose zinc was deficient in every sample analysed — a nutrient pattern driven by soil acidity, for which liming to pH 5.5-7.8 is the recommended correction.",
      "issues": [
        "Acidic soil reaction across the state's cultivated soils, the underlying driver of its nutrient problems",
        "Low available phosphorus in surveyed soils",
        "Zinc deficiency in all samples analysed, explicitly linked to strong acidity",
        "Red and laterite-group soils poor in lime, magnesia, phosphates, nitrogen and humus",
        "No verified district-level or state-wide soil-test aggregate published in accessible form"
      ],
      "recommendations": [
        "Apply agricultural lime to raise soil pH into the 5.5-7.8 range required for crop productivity",
        "Zinc application on the acidic soils where available zinc tested uniformly low",
        "Phosphorus management adapted to acid, phosphorus-fixing soils rather than blanket doses",
        "Combine liming with organic matter addition — raising pH increases microbial activity and improves potassium availability in acidic red soils",
        "Publish district-level soil-test aggregates for the state's districts, which are absent from accessible sources"
      ],
      "districtHighlights": [
        {
          "district": "West Tripura",
          "note": "The state-level survey findings (acidic reaction, medium nitrogen, low phosphorus, medium potassium, uniformly low zinc) are reported without district breakdowns; no West Tripura-specific soil-test aggregate was verifiable"
        },
        {
          "district": "Gomati",
          "note": "Southern-central district within the same acidic red/laterite-group soil belt; no district-level soil-test aggregate was verifiable in consulted sources"
        },
        {
          "district": "Dhalai",
          "note": "Interior hill district where the state's acidity and low-phosphorus pattern applies; no district-level soil-test aggregate was verifiable in consulted sources"
        }
      ],
      "facts": [
        "Tripura soils are acidic in nature, medium in available nitrogen, low in available phosphorus and medium in available potassium.",
        "Available zinc was low in all Tripura soil samples analysed, which the study attributes to the strongly acidic nature of the soils.",
        "Agricultural lime is recommended to raise soil pH to the 5.5-7.8 level required for crop productivity.",
        "The red and laterite soils of eastern India, the group Tripura belongs to, are poor in lime, magnesia, phosphates, nitrogen and humus.",
        "Liming raises soil pH and microbial activity and improves potassium availability to meet crop uptake in acidic red soils.",
        "Gap: no Tripura Soil Health Card aggregate or district-level soil-test summary could be verified in this research pass."
      ],
      "sources": [
        {
          "title": "Fertility Status of Some Selected Soils of Tripura",
          "publisher": "Annals of Plant Sciences",
          "url": "https://www.annalsofplantsciences.com/index.php/aps/article/download/1008/pdf"
        },
        {
          "title": "Soil pH effects on potassium and phosphorus fertilizer availability and management",
          "publisher": "Nutrien eKonomics",
          "url": "https://nutrien-ekonomics.com/news/soil-ph-effects-potassium-and-phosphorus-fertilizer-availability-and-management/"
        },
        {
          "title": "Major soil types of India: red soils, lateritic soils and alkaline soils",
          "publisher": "PMF IAS (soil geography reference)",
          "url": "https://www.pmfias.com/indian-soil-types-red-soils-laterite-lateritic-soils-forest-mountain-soils-arid-desert-soils-saline-alkaline-soils-peaty-marshy-soils/"
        },
        {
          "title": "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data",
          "publisher": "Centre for Science and Environment",
          "url": "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908",
          "year": 2025
        }
      ],
      "confidence": "low",
      "media": []
    },
    "uttar-pradesh": {
      "name": "Uttar Pradesh",
      "summary": "Uttar Pradesh's farmland sits on Indo-Gangetic alluvium under intensive continuous rice-wheat cropping, and the best-documented soil problem is micronutrient depletion driven by decades of high-analysis NPK fertiliser use. A 200-sample survey of the Hasanganj and Auras blocks of Unnao district in 2020-21 found 39.5% of soils deficient in zinc and 32.5% deficient in boron, and the consulted literature reports that most Uttar Pradesh district soils are zinc-deficient, with copper deficiency in certain pockets. India's NPK consumption ratio of about 6.7:2.4:1 against the ideal 4:2:1 is the mechanism the authors identify. No state-wide Soil Health Card aggregate for Uttar Pradesh could be verified in this research pass.",
      "soilTypes": [
        "Indo-Gangetic alluvial soils under intensive continuous rice-wheat cropping — dominant across the plains and the setting of the consulted Unnao and eastern-UP surveys",
        "Eastern Uttar Pradesh alluvial soils, surveyed separately for primary and cationic micronutrient status",
        "Gap: no verified state-wide soil-classification or area breakdown for Uttar Pradesh was obtainable in this research pass"
      ],
      "npk": {
        "nitrogen": "Not verified at state level in consulted sources — nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025 analysis), and India's NPK use ratio of about 6.7:2.4:1 against the ideal 4:2:1 reflects heavy urea application relative to phosphorus and potassium.",
        "phosphorus": "Not verified at state level — consulted UP work identifies farmers using more urea and phosphatic fertilisers while neglecting micronutrients as the driver of the state's depletion, rather than giving a tested phosphorus share.",
        "potassium": "Not verified at state level in consulted sources."
      },
      "micronutrients": {
        "zinc": "High deficiency — 39.5% of 200 soil samples from the Hasanganj and Auras blocks of Unnao district were zinc-deficient, and consulted literature reports most Uttar Pradesh district soils deficient in zinc. National figure 36.5% (ICAR-AICRP), 39% in the CSE SHC analysis.",
        "iron": "Measured in the Unnao survey, with samples distributed across low, critical and high classes; no state-wide deficiency share was obtainable. National figure 12.8% (ICAR-AICRP).",
        "boron": "High deficiency — 32.5% of the Unnao samples were boron-deficient, above the national ICAR-AICRP figure of 23.2%.",
        "sulphur": "Not verified for Uttar Pradesh in consulted sources; national figure 40.5% (ICAR-AICRP), 36% in the CSE SHC analysis."
      },
      "organicCarbon": "Not verified at state level in consulted sources; nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025). Consulted UP work attributes fertility depletion to continuous intensive cropping, residue burning and inadequate organic and micronutrient inputs.",
      "currentState": "The Gangetic-alluvium heartland of the rice-wheat system, where decades of high-analysis NPK fertiliser without micronutrient replacement have made zinc and boron the binding constraints — 39.5% and 32.5% of sampled soils deficient in the Unnao survey — while residue burning and low organic input continue to draw down the nutrient pool.",
      "issues": [
        "Zinc deficiency in 39.5% and boron deficiency in 32.5% of sampled soils in Unnao district; most Uttar Pradesh district soils reported zinc-deficient",
        "Copper deficiency observed in certain pockets of the state",
        "Skewed NPK use — India's ratio of about 6.7:2.4:1 against the ideal 4:2:1 — with micronutrients neglected",
        "Intensive continuous rice-wheat cropping with high-yielding varieties exhausting the soil nutrient pool",
        "Residue burning and lower subsidy for micronutrient fertilisers accelerating micronutrient decline",
        "Farmers choosing fertilisers by cost, subsidy and local availability rather than soil-test values, identified as a direct cause of poor soil health",
        "No verified state-wide Soil Health Card aggregate available in accessible form for India's largest agricultural state"
      ],
      "recommendations": [
        "Soil-specific, balanced nutrient recommendations in place of cost- and subsidy-driven fertiliser choice",
        "Zinc and boron correction across the alluvial rice-wheat belt, where nearly two-fifths of sampled soils tested zinc-deficient",
        "Shift the NPK ratio towards the ideal 4:2:1 by reducing urea dominance",
        "Stop residue burning and add organic matter to rebuild the soil nutrient pool depleted by continuous cropping",
        "Expand soil testing and farmer awareness of recommendation guidelines, named in the consulted study as a direct lever on soil health"
      ],
      "districtHighlights": [
        {
          "district": "Unnao",
          "note": "200 surface soil samples from five villages in each of the Hasanganj and Auras blocks (2020-21) found 39.5% zinc-deficient and 32.5% boron-deficient soils, with copper, iron and manganese also mapped across low, critical and high classes"
        }
      ],
      "facts": [
        "A 200-sample survey of the Hasanganj and Auras blocks of Unnao district in 2020-21 found significant deficiencies, particularly zinc at 39.5% and boron at 32.5% of samples.",
        "Most Uttar Pradesh district soils are reported deficient in zinc, and copper deficiency has been observed in certain pockets of the state.",
        "India's NPK consumption ratio is about 6.7:2.4:1 against the ideal 4:2:1, reflecting urea dominance over phosphorus, potassium and micronutrients.",
        "Intensive continuous rice-wheat cropping with high-yielding varieties, absent micronutrient fertilisers and manures, plus residue burning and low micronutrient subsidy, are identified as the causes of micronutrient depletion in these soils.",
        "Farmers often decide fertiliser use on cost, subsidy and local availability without knowing soil fertility status or crop requirement, which the study identifies as adversely affecting soil health.",
        "Gap: no state-wide Uttar Pradesh Soil Health Card aggregate for NPK or organic carbon could be verified in this research pass, so only the Unnao district survey supplies quantified state evidence here."
      ],
      "sources": [
        {
          "title": "Assessment of Micronutrient Deficiencies in Agricultural Soils of Hasanganj and Auras Blocks, Unnao District, Uttar Pradesh: Implications for Sustainable Farming",
          "publisher": "Journal of Experimental Agriculture International",
          "url": "https://sdiopr.s3.ap-south-1.amazonaws.com/2025/JANUARY/16-Jan-2025/JEAI_128378/Revised-ms_JEAI_128378_v1.pdf",
          "year": 2025
        },
        {
          "title": "Primary and Cationic Micronutrient Status of Soils in Few Districts of Eastern Uttar Pradesh",
          "publisher": "AGRIS (FAO bibliographic record)",
          "url": "https://agris.fao.org/search/es/records/64747354bf943c8c79830976"
        },
        {
          "title": "Indian soils severely deficient in essential nutrients — assessment of Soil Health Card data",
          "publisher": "Centre for Science and Environment",
          "url": "https://www.cseindia.org/indian-soils-severely-deficient-in-essential-nutrients-12908",
          "year": 2025
        },
        {
          "title": "CSE assessment finds Indian soils severely deficient in key nutrients",
          "publisher": "Down To Earth",
          "url": "https://www.downtoearth.org.in/food/cse-assessment-finds-indian-soils-severely-deficient-in-key-nutrients",
          "year": 2025
        }
      ],
      "confidence": "low",
      "media": []
    },
    "uttarakhand": {
      "name": "Uttarakhand",
      "summary": "Uttarakhand's soils are low to medium in fertility overall and split sharply by terrain: Bhabar soils are coarse-textured, sandy to gravelly, highly porous and largely infertile; Tarai soils are rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane; and hill soils range from slightly to extremely acidic on constantly eroding slopes. The state micronutrient mapping study recorded deficiency in 12.0% of samples for iron, 9.7% for molybdenum, 8.3% for zinc and 7.3% for manganese, with 8.0% for sulphur, 4.0% for potassium and 2.3% for calcium. Decreasing organic carbon, imbalanced fertiliser use, water scarcity and high nutrient mining are the constraints named for the state.",
      "soilTypes": [
        "Hill soils of the mid and upper Himalaya — slightly to extremely acidic, constantly eroding on steep slopes (dominant by area)",
        "Tarai soils — mostly rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane cultivation",
        "Bhabar soils — coarse-textured, sandy to gravelly, highly porous and largely infertile"
      ],
      "npk": {
        "nitrogen": "Low to medium — Uttarakhand soils are described as low to medium in fertility status, with low soil organic carbon and high nutrient mining among the state's named constraints; the consulted state micronutrient mapping study did not report a nitrogen deficiency share.",
        "phosphorus": "Not quantified at state level in consulted sources.",
        "potassium": "Mostly adequate — potassium deficiency was recorded in only 4.0% of samples in the Uttarakhand micronutrient mapping study, alongside calcium at 2.3%."
      },
      "micronutrients": {
        "zinc": "Deficient in 8.3% of samples in the Uttarakhand micronutrient mapping study — well below the national figure of 36.5% (ICAR-AICRP).",
        "iron": "Deficient in 12.0% of samples — the most widespread micronutrient deficiency recorded for the state, close to the national 12.8% (ICAR-AICRP).",
        "boron": "Not covered by the consulted Uttarakhand mapping study, which reported zinc, iron, manganese and molybdenum; national figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Deficient in 8.0% of samples in the same study; molybdenum 9.7% and manganese 7.3% were also mapped."
      },
      "organicCarbon": "Declining and low — decreasing organic carbon content in soils is named among the state's major production constraints, alongside low soil organic carbon status in both the hills and the Tarai. Nationally 48.5% of Soil Health Card samples test low in organic carbon (CSE 2025).",
      "currentState": "A two-tier state: fertile Tarai clayey loams supporting rice and sugarcane set against coarse, infertile Bhabar gravels and acidic, constantly eroding hill soils. Organic carbon is declining statewide, and iron (12.0%) and molybdenum (9.7%) are the leading mapped micronutrient gaps.",
      "issues": [
        "Decreasing soil organic carbon content and imbalanced fertiliser use, named as major production constraints",
        "Constant soil erosion on steep hill slopes, which reduces fertility further",
        "Soil reaction ranging from slightly to extremely acidic in hill areas",
        "Coarse, sandy to gravelly, highly porous and largely infertile Bhabar soils",
        "Water scarcity in both hill and Tarai areas, plus high nutrient mining",
        "Mapped deficiencies of iron (12.0%), molybdenum (9.7%), zinc (8.3%), sulphur (8.0%), manganese (7.3%), potassium (4.0%) and calcium (2.3%)"
      ],
      "recommendations": [
        "Precise, mapping-based micronutrient management — the explicit purpose of the Uttarakhand micronutrient deficiency mapping work",
        "Organic carbon restoration through manures, compost and residue return, since declining OC is a named state constraint",
        "Liming and acid-soil management in the hill districts where reaction runs slight to extremely acidic",
        "Slope stabilisation, terracing and erosion control to stop the fertility loss that steep-slope erosion causes",
        "Village-cluster soil nutrient evaluation and crop planning of the kind carried out for the Patiya cluster in Almora"
      ],
      "districtHighlights": [
        {
          "district": "Almora",
          "note": "Soil nutrient evaluation and crop management study for the Patiya village cluster — a hill-district example of cluster-level nutrient assessment feeding crop choice"
        },
        {
          "district": "Udham Singh Nagar",
          "note": "Tarai district: rich clayey loams mixed with fine sand and humus, well suited to rice and sugarcane, but flagged for water scarcity and low organic carbon"
        },
        {
          "district": "Nainital",
          "note": "Spans the Bhabar foothill belt of coarse, sandy to gravelly, highly porous and largely infertile soils and the acidic mid-hill soils above it"
        }
      ],
      "facts": [
        "Uttarakhand's soils are low to medium in fertility status overall.",
        "Bhabar soils are coarse-textured, sandy to gravelly, highly porous and largely infertile, while Tarai soils are mostly rich clayey loams mixed with fine sand and humus and suited to rice and sugarcane.",
        "Soil reaction in Uttarakhand's hill areas varies from slightly to extremely acidic, and steep slopes cause constant erosion.",
        "The state micronutrient mapping study recorded macronutrient/secondary deficiency in 4.0% of samples for potassium, 2.3% for calcium and 8.0% for sulphur, and micronutrient deficiency in 8.3% for zinc, 12.0% for iron, 7.3% for manganese and 9.7% for molybdenum.",
        "Decreasing organic carbon content and imbalanced fertiliser use are named as major constraints on production, together with water scarcity in the hills and Tarai and high nutrient mining."
      ],
      "sources": [
        {
          "title": "Mapping Current Micronutrients Deficiencies in Soils of Uttarakhand for Precise Micronutrient Management",
          "publisher": "peer-reviewed paper (ResearchGate record)",
          "url": "https://www.researchgate.net/publication/286194353_Mapping_Current_Micronutrients_Deficiencies_in_Soils_of_Uttarakhand_for_Precise_Micronutrient_Management"
        },
        {
          "title": "Soil Nutrient Status of Bhabhar and Hill Areas of Uttarakhand",
          "publisher": "peer-reviewed paper (ResearchGate record)",
          "url": "https://www.researchgate.net/publication/344157655_SOIL_NUTRIENT_STATUS_Of_BHABHAR_AND_HILL_AREAS_Of_UTTARAKHAND",
          "year": 2020
        },
        {
          "title": "Uttarakhand — state agricultural profile",
          "publisher": "Indian Council of Agricultural Research",
          "url": "https://icar.org.in/en/node/17293"
        },
        {
          "title": "Soil Nutrient Evaluation and Crop Management for Sustainable Growth of Patiya Village Cluster in Almora, Uttarakhand",
          "publisher": "Current World Environment",
          "url": "https://www.cwejournal.org/vol16no3/soil-nutrient-evaluation-and-crop-management-for-sustainable-growth-of-patiyavillage-cluster-in-almora--uttarakhand"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "west-bengal": {
      "name": "West Bengal",
      "summary": "West Bengal's soils split between the Gangetic alluvium of the central and northern plains and the red-laterite plateau of the west. A district-level study of soil status found 65.7% of tested soil acidic and 25.7% alkaline. The lateritic west — Birbhum, Bankura, Purulia, Bardhaman and Paschim Medinipur — has coarse-textured, highly drained, erosion-prone soils at pH about 5.5-6.5, poor in organic matter, calcium, phosphates and nitrogen. Insufficient organic carbon and unbalanced NPK fertilisation are reported across both the alluvial and lateritic zones, and organic carbon correlates positively with the availability of nitrogen, phosphorus, sulphur, boron and manganese, making it the pivotal parameter for the state.",
      "soilTypes": [
        "Gangetic alluvial soils — old and new alluvium of the central and northern plains (dominant cultivated group; the old alluvial zone has its own published fertility evaluation)",
        "Red and laterite soils of the western plateau (Birbhum, Bankura, Purulia, Bardhaman, Paschim Medinipur) — coarse-textured, highly drained, erosion-prone, acidic at pH about 5.5-6.5, poor in organic matter, calcium, phosphates and nitrogen",
        "Tarai soils of the northern districts, the subject of separate studies on organic carbon and nitrogen distribution"
      ],
      "npk": {
        "nitrogen": "Low — the red and laterite soils of the western plateau are specifically poor in nitrogen, and insufficient organic carbon with unbalanced NPK fertilisation is reported across both alluvial and lateritic zones. Nationally 64% of Soil Health Card samples test low in nitrogen (CSE 2025). No verified state-wide tested share was obtainable.",
        "phosphorus": "Low in the red-laterite zone, which is described as poor in phosphates; organic carbon correlates positively with available phosphorus, tying P supply to the state's carbon deficit. No verified state-wide tested share was obtainable.",
        "potassium": "Not verified at state level in consulted sources; unbalanced NPK fertilisation is reported as a state-wide problem."
      },
      "micronutrients": {
        "zinc": "Deficiency reported among the state's widespread micronutrient gaps, alongside copper, boron and iron; the figures in the consulted source were given in an ambiguous unit, so no percentage is quoted here. National figure 36.5% (ICAR-AICRP).",
        "iron": "Reported among the widespread micronutrient deficiencies of the state, but without an interpretable state-wide percentage in consulted sources. National figure 12.8% (ICAR-AICRP).",
        "boron": "Reported among the widespread micronutrient deficiencies of the state; organic carbon correlates positively with available boron. National figure 23.2% (ICAR-AICRP), 47% in the CSE SHC analysis.",
        "sulphur": "Not separately quantified for West Bengal; organic carbon correlates positively with available sulphur, tying sulphur supply to the state's organic carbon deficit. National figure 40.5% (ICAR-AICRP)."
      },
      "organicCarbon": "Insufficient across both alluvial and lateritic regions, with the red-laterite zone specifically poor in organic matter. Organic carbon shows a significant positive correlation with the availability of nitrogen, phosphorus, sulphur, boron and manganese, which makes it the compelling parameter for maintaining balanced soil health in the state.",
      "currentState": "A predominantly acidic-soil state — 65.7% of tested samples acidic against 25.7% alkaline — where the organic carbon deficit is the central problem, because it simultaneously limits nitrogen, phosphorus, sulphur, boron and manganese availability. The deficit is worst on the coarse, well-drained, erosion-prone red-laterite soils of the western districts.",
      "issues": [
        "65.7% of tested soils acidic, against 25.7% alkaline, in the district-level state soil status study",
        "Insufficient organic carbon in both alluvial and lateritic zones, coupled with unbalanced NPK fertilisation",
        "Coarse-textured, highly drained, erosion-prone red-laterite soils of the western plateau, poor in available nutrients",
        "Poor calcium, phosphate and nitrogen status in the laterite belt (pH about 5.5-6.5)",
        "Widespread micronutrient deficiencies reported for copper, boron, zinc and iron",
        "Soil fertility degradation identified as a constraint on the state's agricultural productivity"
      ],
      "recommendations": [
        "Raise organic carbon as the primary lever, since it governs available nitrogen, phosphorus, sulphur, boron and manganese simultaneously",
        "Liming and acidity management on the 65.7% of soils testing acidic, especially the western laterite belt",
        "Erosion control and organic matter retention on the coarse, well-drained lateritic soils",
        "Replace the unbalanced NPK application reported for both alluvial and lateritic zones with soil-test-based balanced fertilisation",
        "Correct copper, boron, zinc and iron where soil tests confirm deficiency, rather than blanket micronutrient application"
      ],
      "districtHighlights": [
        {
          "district": "Birbhum",
          "note": "Red-laterite belt district: coarse-textured, highly drained, erosion-prone soils at pH about 5.5-6.2, poor in available nutrients"
        },
        {
          "district": "Bankura",
          "note": "Western plateau laterite district, red in colour and acidic, poor in organic matter, calcium, phosphates and nitrogen"
        },
        {
          "district": "Purulia",
          "note": "Westernmost plateau district in the laterite group, with the same acidic, coarse, nutrient-poor profile"
        },
        {
          "district": "Paschim Medinipur",
          "note": "Southern edge of the red-laterite zone (listed as West Midnapore in consulted sources), erosion-prone and acidic"
        }
      ],
      "facts": [
        "A district-level study of West Bengal soil status found 65.7% of tested soil acidic and 25.7% alkaline.",
        "Laterite soil occurs in the western plateau region — parts of Birbhum, Bardhaman, Bankura, Purulia and Paschim Medinipur — is red, acidic at roughly pH 5.5-6.5, and poor in organic matter, calcium, phosphates and nitrogen.",
        "Red laterite soils of Birbhum, Bankura and Paschim Medinipur are coarse in texture, highly drained, erosion-prone, acidic at pH 5.5-6.2 and poor in available nutrients.",
        "Insufficient organic carbon and unbalanced NPK fertilisation are prevalent across both the alluvial and lateritic regions of West Bengal.",
        "Organic carbon has a significant positive correlation with the availability of nitrogen, phosphorus, sulphur, boron and manganese, indicating its compelling role in maintaining balanced soil health.",
        "Widespread micronutrient deficiencies were recorded for copper, boron, zinc and iron in the consulted West Bengal soil-fertility work."
      ],
      "sources": [
        {
          "title": "A Geographical Study on District Level Soil Status of West Bengal",
          "publisher": "Journal of Emerging Technologies and Innovative Research (JETIR)",
          "url": "https://www.jetir.org/papers/JETIR1808324.pdf",
          "year": 2018
        },
        {
          "title": "Evaluation of Soil Fertility Status in Old Alluvial Zone of West Bengal",
          "publisher": "peer-reviewed paper (Academia.edu record)",
          "url": "https://www.academia.edu/29849208/EVALUATION_OF_SOIL_FERTILITY_STATUS_IN_OLD_ALLUVIAL_ZONE_OF_WEST_BENGAL"
        },
        {
          "title": "Soil Fertility Degradation and Agricultural Productivity in West Bengal",
          "publisher": "EAS Publisher",
          "url": "https://www.easpublisher.com/get-articles/5254"
        },
        {
          "title": "Constraints in Agricultural Productivity of Lateritic Soil of West Bengal",
          "publisher": "Redshine Archive",
          "url": "https://chapters.redshine.in/index.php/redshine/article/view/39"
        }
      ],
      "confidence": "medium",
      "media": []
    }
  }
};
