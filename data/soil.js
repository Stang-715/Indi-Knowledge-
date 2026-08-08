// data/soil.js — Soil Health
// Compiled from internet research; merged from chunked research parts on 2026-08-08.
window.INDIA_DATA = window.INDIA_DATA || {};
window.INDIA_DATA.soil = {
  "meta": {
    "tab": "soil",
    "title": "Soil Health",
    "compiledOn": "2026-08-08",
    "coverage": "PARTIAL — 12 of 36 states/UTs; research fleet still running",
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
    }
  }
};
