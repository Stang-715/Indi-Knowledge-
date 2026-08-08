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
      "summary": "Soil information for this island UT is thin in national datasets: the flagship ICAR-IISS/AICRP micronutrient survey (2,42,827 samples) covered the 28 states, not this UT, and no UT-specific Soil Health Card aggregate could be verified in this compilation. The islands' humid tropical, high-rainfall setting and forest cover shape acidic upland soils with coastal sandy and low-lying marshy soils. Figures below are deliberately withheld where no source was found.",
      "soilTypes": [
        "Acidic upland island soils (commonly described as red loamy/lateritic; UT-level NBSS&LUP sheet not directly consulted)",
        "Coastal sandy soils",
        "Alluvial valley and marshy/mangrove-fringe soils"
      ],
      "npk": {
        "nitrogen": "Low to medium (unverified) — no UT-specific Soil Health Card aggregate was accessible; the SHC portal (soilhealth.dac.gov.in) is the authoritative source",
        "phosphorus": "Low (unverified) — acidic, high-rainfall island soils typically fix P, but no UT-specific figure was found in consulted sources",
        "potassium": "Medium (unverified) — no UT-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported in sources consulted; the UT lies outside the 28-state ICAR-IISS/AICRP deficiency survey",
        "iron": "Not reported in sources consulted for this UT",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "No verified UT-level figure; high-rainfall forested islands are generally expected to hold more organic matter than mainland plains, but this was not confirmed by a consulted source",
      "currentState": "Agriculture occupies a small area between forest and coast; soil data coverage is sparse and the UT is served by the national SHC scheme with a small sample base.",
      "issues": [
        "Very thin published soil-testing data compared with mainland states",
        "Coastal salinity risk on low-lying farm land (island setting; severity not quantified in consulted sources)",
        "Soil acidity constraints typical of high-rainfall tropical islands (unquantified here)"
      ],
      "recommendations": [
        "Consult the Soil Health Card portal dashboard for the UT's latest sample aggregates before planning fertiliser use",
        "Soil-test-based liming and P management where acidity is confirmed",
        "Organic-matter recycling (plantation residues, compost) suited to island farming systems"
      ],
      "districtHighlights": [
        {
          "district": "South Andaman",
          "note": "Most populous district; UT soil data on the SHC portal aggregates a small sample base"
        },
        {
          "district": "North & Middle Andaman",
          "note": "Main farming belt of the Andaman group; district-level soil figures not verified in this compilation"
        },
        {
          "district": "Nicobar",
          "note": "Remote island district with minimal published soil-testing data"
        }
      ],
      "facts": [
        "The 2021 ICAR-led national micronutrient survey (Scientific Reports) covered 615 districts in 28 states — union territories such as Andaman & Nicobar were outside its coverage.",
        "The national Soil Health Card scheme (launched 2015) applies to all states and UTs; over 23 crore cards had been distributed across its cycles per PIB.",
        "No UT-specific NPK, organic-carbon or micronutrient aggregate could be verified from consulted sources in this compilation."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Soil Health Card — Factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2",
          "year": 2024
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        }
      ],
      "confidence": "low",
      "media": []
    },
    "andhra-pradesh": {
      "name": "Andhra Pradesh",
      "summary": "Red soils dominate Andhra Pradesh, with black (Vertisol) tracts, fertile deltaic alluvium in the Krishna-Godavari deltas and coastal sands. Surveys by ANGRAU and ICRISAT flag available nitrogen, sulphur, zinc and iron as the state's key fertility constraints; more than half of surveyed soils are zinc-deficient, driven by low organic carbon, high clay and CaCO3.",
      "soilTypes": [
        "Red soils (dominant; red loamy and red sandy)",
        "Black cotton soils (Vertisols)",
        "Deltaic alluvial soils (Krishna-Godavari deltas)",
        "Coastal sandy and saline soils"
      ],
      "npk": {
        "nitrogen": "Low — available N is repeatedly identified as a primary fertility constraint in ANGRAU village-level fertility surveys",
        "phosphorus": "Medium — P was not among the major constraints flagged (N, S, Zn, Fe were) in consulted ANGRAU fertility studies",
        "potassium": "High to medium — K is generally not reported as a constraint in consulted AP soil-fertility surveys"
      },
      "micronutrients": {
        "zinc": "High deficiency — more than 50% of AP soils reported deficient in available Zn (southern-India reviews; low organic matter, high clay and CaCO3 cited as causes)",
        "iron": "Deficiency reported as a constraint in surveyed villages and in subsurface horizons of Nellore red soils",
        "boron": "Deficient in dryland tracts — ICRISAT reports widespread S, B and Zn deficiency in semi-arid-tropic dryland soils including AP",
        "sulphur": "Deficient — flagged both by ICRISAT dryland surveys and ANGRAU village fertility studies"
      },
      "organicCarbon": "Low to medium in surveyed soils; low OC is a stated driver of the state's zinc deficiency",
      "currentState": "Intensively cropped deltas remain productive, but red-soil and dryland tracts show multi-nutrient depletion (N, S, Zn, Fe), and neutral-to-alkaline soils with low organic carbon keep micronutrient availability poor.",
      "issues": [
        "Zinc deficiency in over half of surveyed soils",
        "Widespread sulphur and boron deficiency in semi-arid dryland (Rayalaseema-type) tracts",
        "Low soil organic carbon in cultivated red soils",
        "Iron deficiency in some red-soil profiles and village survey areas"
      ],
      "recommendations": [
        "Soil-test-based zinc sulphate application in deficient blocks (AP has a history of Zn input-subsidy programmes)",
        "Include sulphur sources (gypsum/SSP) in dryland oilseed-pulse systems per ICRISAT findings",
        "Build organic carbon via residue recycling and FYM to improve micronutrient availability",
        "Follow Soil Health Card recommendations for balanced NPK rather than N-heavy dosing"
      ],
      "districtHighlights": [
        {
          "district": "Nellore (Sri Potti Sriramulu Nellore)",
          "note": "Red and associated soils studied under the Somasila project: Zn sufficient at surface but deficient in sub-surface horizons; available Fe deficient"
        },
        {
          "district": "Chittoor",
          "note": "Sugarcane-belt soils were the subject of a dedicated nutrient-status study (AGRIS-indexed)"
        },
        {
          "district": "Anantapur",
          "note": "Semi-arid dryland district in the tract where ICRISAT documents widespread sulphur, boron and zinc deficiency"
        }
      ],
      "facts": [
        "More than 50% of Andhra Pradesh soils are reported deficient in available zinc (southern-India micronutrient reviews).",
        "ANGRAU village fertility surveys identify available N, S, Zn and Fe as the key constraints needing immediate attention.",
        "ICRISAT documents widespread deficiencies of sulphur, boron and zinc in dryland soils of the Indian semi-arid tropics, which include large parts of AP.",
        "Surveyed AP soils are neutral to strongly alkaline with low-to-medium organic carbon."
      ],
      "sources": [
        {
          "title": "Widespread deficiencies of sulphur, boron and zinc in dryland soils of the Indian semi-arid tropics",
          "publisher": "ICRISAT (OAR repository)",
          "url": "https://oar.icrisat.org/2471/"
        },
        {
          "title": "Soil Fertility Status in Tatrakallu Village of Andhra Pradesh",
          "publisher": "Int. J. Current Microbiology & Applied Sciences",
          "url": "https://www.ijcmas.com/8-6-2019/G.%20Sashikala,%20et%20al.pdf",
          "year": 2019
        },
        {
          "title": "Designing better input support programs: Lessons from zinc subsidies in Andhra Pradesh, India",
          "publisher": "PLoS ONE (via PubMed Central)",
          "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7714421/",
          "year": 2020
        },
        {
          "title": "Nutrient status of some red and associated soils of Nellore district under Somasila project",
          "publisher": "AGRIS / FAO index",
          "url": "https://agris.fao.org/search/en/providers/122648/records/6471f55877fd37171a71d050"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "arunachal-pradesh": {
      "name": "Arunachal Pradesh",
      "summary": "Arunachal Pradesh is a mountainous, heavily forested Himalayan state whose soils are predominantly acidic hill soils with substantial organic matter under forest cover, and alluvial terraces in river valleys such as the Siang. State-specific Soil Health Card aggregates and AICRP micronutrient figures could not be verified from sources accessible in this compilation, so quantitative claims are withheld.",
      "soilTypes": [
        "Acidic mountain/forest soils (Inceptisols-Entisols association; state NBSS&LUP sheet not directly consulted)",
        "Alluvial soils of river valleys (Siang, Lohit, Subansiri belts)",
        "Steep-slope skeletal soils at higher elevations"
      ],
      "npk": {
        "nitrogen": "Medium (unverified) — forest-derived organic matter generally supports N in NE hill soils, but no state SHC aggregate was verified",
        "phosphorus": "Low (unverified) — strong acidity in hill soils typically fixes phosphorus; state-specific figures not found in consulted sources",
        "potassium": "Medium (unverified) — no state-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not verified — Arunachal Pradesh was within the 28-state ICAR-IISS/AICRP survey, but its state figure was not retrievable in this compilation",
        "iron": "Not verified for this state in consulted sources",
        "boron": "Not verified for this state in consulted sources",
        "sulphur": "Not verified for this state in consulted sources"
      },
      "organicCarbon": "Generally reported high under dense forest cover in NE India; a verified state figure was not accessible in this compilation",
      "currentState": "Farming is confined to valley terraces and jhum (shifting-cultivation) slopes; soil acidity and terrain, rather than intensive-agriculture nutrient mining, are the defining conditions. Data coverage is thin.",
      "issues": [
        "Soil acidity limiting phosphorus availability (typical of NE hill soils; state-level severity unquantified here)",
        "Erosion on steep jhum-cultivated slopes",
        "Sparse soil-testing coverage relative to mainland states"
      ],
      "recommendations": [
        "Use the SHC portal's state dashboard for current sample aggregates before fertiliser planning",
        "Lime-based amelioration on strongly acidic cultivated soils, guided by soil tests",
        "Agroforestry and terracing to cut erosion losses on slopes"
      ],
      "districtHighlights": [
        {
          "district": "East Siang",
          "note": "Pasighat area — Siang river valley alluvial terraces form one of the state's main settled-farming belts"
        },
        {
          "district": "Lower Subansiri",
          "note": "Ziro valley's terraced wet-rice system is a long-standing indigenous soil-fertility management landscape"
        },
        {
          "district": "Papum Pare",
          "note": "Capital-region district; settled valley agriculture alongside shifting cultivation on slopes"
        }
      ],
      "facts": [
        "The 2021 ICAR-led AICRP micronutrient survey covered 28 states including Arunachal Pradesh, but the state-wise figure could not be retrieved from sources accessible to this compilation.",
        "No state-level SHC NPK/organic-carbon aggregate was verifiable in consulted sources; the entry flags gaps rather than estimating.",
        "The state's agriculture is split between valley terrace cultivation and jhum on slopes, keeping tested-soil coverage low."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Soil Health Card — Factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2",
          "year": 2024
        }
      ],
      "confidence": "low",
      "media": []
    },
    "assam": {
      "name": "Assam",
      "summary": "Assam's agriculture sits on the alluvial plains of the Brahmaputra and Barak valleys, flanked by acidic hill and lateritic soils. Surveyed Brahmaputra alluvium is sandy loam to silty clay loam and strongly acidic to near neutral (pH 4.17-6.94), comparatively rich in nitrogen and organic matter, but boron deficiency affects roughly 44% of alluvial soils and available potassium ranges widely from low to high.",
      "soilTypes": [
        "Alluvial soils of the Brahmaputra and Barak valleys (dominant)",
        "Acidic hill soils (piedmont and hill districts)",
        "Lateritic soils",
        "Peaty/marshy lowland (beel) soils"
      ],
      "npk": {
        "nitrogen": "Medium to high — Assam soils are reported comparatively rich in nitrogen and organic matter (state soil references)",
        "phosphorus": "Low to medium — strong acidity (pH down to 4.17 in surveyed alluvium) constrains P availability; state-wide SHC aggregate not directly verified",
        "potassium": "Low to medium — available K in surveyed Brahmaputra alluvial soils ranged from low to high (about 104-419 kg/ha), with many sites in the low band"
      },
      "micronutrients": {
        "zinc": "Deficiency reported in Indian acid-soil rice belts, but no verified Assam-wide figure was found in consulted sources",
        "iron": "Not a reported deficiency concern in the consulted Assam studies (strongly acidic soils)",
        "boron": "High deficiency — about 44% of Assam's alluvial soils (34% of lateritic) are boron-deficient; zone-wise deficiency ranged from 28% (Upper Brahmaputra Valley) to 36% (Lower Brahmaputra Valley)",
        "sulphur": "No verified state-wide figure in consulted sources; boron status correlated positively with available S in AAU zone studies"
      },
      "organicCarbon": "Medium to high — 0.56-0.82% measured in surveyed Brahmaputra alluvial soils; soils generally rich in organic matter",
      "currentState": "Soil acidity is the defining chemical constraint (strongly acidic to near-neutral reaction across the valley), compounded by annual flooding and sand deposition; boron is the most widespread verified micronutrient deficiency.",
      "issues": [
        "Strong soil acidity (surveyed pH 4.17-6.94) limiting P and base availability",
        "Boron deficiency in roughly 44% of alluvial soils, worst in light-textured, low-organic-matter sites",
        "Low available potassium in a substantial share of valley soils",
        "Flood-borne sand deposition and erosion on the Brahmaputra floodplain"
      ],
      "recommendations": [
        "Lime application on strongly acidic soils, dosed by soil test",
        "Borax application in deficient blocks, prioritising the Lower Brahmaputra Valley Zone",
        "Potassium fertilisation where SHC tests show low K, rather than blanket NPK ratios",
        "Maintain organic-matter inputs; boron availability in Assam soils correlates with organic carbon"
      ],
      "districtHighlights": [
        {
          "district": "Morigaon",
          "note": "Subject of a dedicated study on boron availability under different cropping systems"
        },
        {
          "district": "Dhubri",
          "note": "Brahmaputra riverine soils analysed for physico-chemical parameters; lies in the Lower Brahmaputra Valley Zone, the zone with the highest boron deficiency (~36%)"
        },
        {
          "district": "Kamrup",
          "note": "Also in the Lower Brahmaputra Valley Zone flagged for the state's highest zone-level boron deficiency"
        },
        {
          "district": "Dibrugarh",
          "note": "Upper Brahmaputra Valley Zone, where surveyed boron deficiency was lowest (~28%)"
        }
      ],
      "facts": [
        "Around 44% of Assam's alluvial soils are reported boron-deficient, versus 34% of its lateritic soils.",
        "Zone studies put hot-water-soluble boron deficiency at 36% in the Lower Brahmaputra Valley Zone and 28% in the Upper Brahmaputra Valley Zone.",
        "Surveyed Brahmaputra alluvial soils are sandy loam to silty clay loam with pH 4.17-6.94 (strongly acidic to near neutral).",
        "Organic carbon in surveyed valley soils measured 0.56-0.82%; Assam soils are described as rich in nitrogen and organic matter.",
        "Available potassium in surveyed alluvial soils spanned roughly 104-419 kg/ha (low to high)."
      ],
      "sources": [
        {
          "title": "To study the availability of boron status under different agro-climatic zones in soils of Assam",
          "publisher": "Assam Agricultural University (via Academia.edu)",
          "url": "https://www.academia.edu/91129446/To_study_the_availability_of_boron_status_under_different_agro_climatic_zone_in_soils_of_Assam"
        },
        {
          "title": "Physico-chemical properties and acidity components of some alluvial derived soils of the Brahmaputra valley of Assam",
          "publisher": "Academia.edu (journal reprint)",
          "url": "https://www.academia.edu/85321646/Physico_chemical_properties_and_acidity_components_of_some_alluvial_derived_soils_of_the_Brahmaputra_valley_of_Assam"
        },
        {
          "title": "Boron in Soil Plant System and Its Significance in Indian Agriculture",
          "publisher": "Academia.edu (review reprint)",
          "url": "https://www.academia.edu/122923541/Boron_in_Soil_Plant_System_and_Its_Significance_in_Indian_Agriculture"
        },
        {
          "title": "Soil Health Card — Directorate of Agriculture, Assam",
          "publisher": "Government of Assam",
          "url": "https://diragri.assam.gov.in/portlet-innerpage/soil-health-card"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "bihar": {
      "name": "Bihar",
      "summary": "Bihar farms the Gangetic alluvium, with calcareous soils across much of the north Bihar plain and saline-alkali patches. Soil Intelligence System India sampling found 48% of Bihar soils zinc-deficient, 49% calcareous and 34% low in organic carbon; zinc is the most widespread micronutrient deficiency, followed by iron, with calcareousness, high pH and low organic carbon the stated drivers.",
      "soilTypes": [
        "Gangetic alluvial soils (dominant)",
        "Calcareous alluvial soils of the north Bihar plain (~49% of sampled soils calcareous)",
        "Saline and saline-alkali patches of the alluvial plain",
        "Tal/Diara seasonal floodplain soils"
      ],
      "npk": {
        "nitrogen": "Low (state aggregate unverified) — intensive cereal cropping on soils where 34% of samples are low in organic carbon points to low available N; Bihar-specific SHC NPK aggregates were not directly verifiable in this compilation",
        "phosphorus": "Medium (unverified) — no state-wide figure found in consulted sources; district fertility studies (e.g., Muzaffarpur's Kurhani block) exist but figures were not retrievable",
        "potassium": "Medium (unverified) — no state-wide figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "High deficiency — 48% of sampled Bihar soils zinc-deficient (Soil Intelligence System India data reported in Frontiers in Soil Science, 2024); linked to calcareous, high-pH, coarse-textured, low-OC soils",
        "iron": "Deficiency reported as the second most widespread micronutrient problem after zinc in Bihar soils",
        "boron": "Elevated risk — calcareous and leached sandy soils, both common in Bihar, are among the soil groups with higher boron deficiency (consulted reviews)",
        "sulphur": "No verified state-wide figure in consulted sources"
      },
      "organicCarbon": "Low in 34% of sampled soils (Soil Intelligence System India)",
      "currentState": "A rice-wheat-dominated alluvial plain where calcareousness (49% of sampled soils) and low organic carbon keep zinc and iron availability poor; nearly half of sampled soils need zinc management.",
      "issues": [
        "Zinc deficiency in 48% of sampled soils — among the more severe in the Gangetic plain",
        "Calcareous, high-pH soils across north Bihar locking up micronutrients",
        "Low organic carbon in a third of sampled soils",
        "Recurrent flooding (north) and seasonal waterlogging of tal/diara lands complicating nutrient management"
      ],
      "recommendations": [
        "Soil-test-based zinc sulphate application in rice-wheat systems, prioritising calcareous tracts",
        "Green manuring, residue incorporation and FYM to lift organic carbon",
        "Iron management (foliar ferrous sulphate) where deficiency is confirmed in calcareous soils",
        "Balanced NPK per Soil Health Card recommendations instead of urea-dominant dosing"
      ],
      "districtHighlights": [
        {
          "district": "Muzaffarpur",
          "note": "Kurhani block was the subject of a dedicated soil-fertility-status study; lies in the calcareous north Bihar plain"
        },
        {
          "district": "Samastipur",
          "note": "Village-level micronutrient studies in rice-growing villages; home district of Dr. Rajendra Prasad Central Agricultural University (Pusa)"
        },
        {
          "district": "Patna",
          "note": "South-bank district including tal (seasonal deep-flood) lands with distinct nutrient dynamics"
        }
      ],
      "facts": [
        "48% of Bihar soils sampled under the Soil Intelligence System India project were zinc-deficient.",
        "49% of sampled Bihar soils were calcareous and 34% had low organic carbon (same dataset).",
        "Zinc is the most widespread micronutrient deficiency in Bihar, followed by iron.",
        "Saline and saline-alkali soils occur in parts of the north Bihar alluvial plain.",
        "High pH, calcareousness, coarse texture, low organic carbon and intense cultivation are the stated drivers of zinc deficiency in these soils."
      ],
      "sources": [
        {
          "title": "Soil zinc surveillance frameworks can inform human nutrition studies: opportunities in India",
          "publisher": "Frontiers in Soil Science",
          "url": "https://www.frontiersin.org/journals/soil-science/articles/10.3389/fsoil.2024.1421652/full",
          "year": 2024
        },
        {
          "title": "Micronutrient Deficiencies in Crops and Soils in India",
          "publisher": "Springer (book chapter)",
          "url": "https://link.springer.com/chapter/10.1007/978-1-4020-6860-7_4",
          "year": 2008
        },
        {
          "title": "Soil fertility status in Kurhani block of Muzaffarpur district of Bihar",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/289242131_Soil_fertility_status_in_Kurhani_block_of_Muzaffarpur_district_of_Bihar"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "chandigarh": {
      "name": "Chandigarh",
      "summary": "Chandigarh is a single-district, city-dominated UT on the Shivalik piedmont plain with very little remaining farmland, and no UT-specific soil-health aggregate could be verified from consulted sources. Its soils are part of the Indo-Gangetic alluvial system. Quantitative fields are left unfilled rather than estimated; confidence is low.",
      "soilTypes": [
        "Indo-Gangetic alluvial soils of the Shivalik piedmont plain (UT-level NBSS&LUP sheet not directly consulted)"
      ],
      "npk": {
        "nitrogen": "Low (unverified) — alluvial-plain soils of the region are broadly nitrogen-deficient, but no Chandigarh-specific SHC aggregate was found",
        "phosphorus": "Medium (unverified) — no UT-specific figure found in consulted sources",
        "potassium": "Medium (unverified) — no UT-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported in sources consulted; the UT lies outside the 28-state ICAR-IISS/AICRP survey",
        "iron": "Not reported in sources consulted for this UT",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "No verified UT-level figure in consulted sources",
      "currentState": "Urbanisation has reduced cultivation to a small fringe; soil-testing volumes are correspondingly tiny, and published UT-level soil-health statistics are effectively absent.",
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
          "note": "The UT's only district; farmland is a small peri-urban fringe of the planned city"
        }
      ],
      "facts": [
        "Chandigarh is a one-district UT; the national SHC scheme covers it, but no UT-specific nutrient aggregate was verifiable in consulted sources.",
        "The 2021 ICAR-led AICRP micronutrient survey covered the 28 states and did not report this UT.",
        "The UT's soils belong to the Indo-Gangetic alluvial plain at the Shivalik foothills."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Soil Health Card — Factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2",
          "year": 2024
        }
      ],
      "confidence": "low",
      "media": []
    },
    "chhattisgarh": {
      "name": "Chhattisgarh",
      "summary": "Chhattisgarh's 'rice bowl' farms red-yellow soils that cover about 55% of the state, alongside Vertisols (about 26% of cultivated area) and gravelly Bhata uplands. Available nitrogen is severely short — a Kabeerdham Vertisol survey found 99.1% of samples low in N — and zinc deficiency reached 45.6% of samples in a Baloda Bazar block survey, while surveyed boron status was sufficient to high.",
      "soilTypes": [
        "Red-yellow soils (about 55% of the state; locally Matasi/Dorsa series, Alfisol-Inceptisol association)",
        "Black soils / Vertisols (about 26% of cultivated area; locally Kanhar)",
        "Gravelly lateritic upland (Bhata) Entisols",
        "Alluvial soils along the Mahanadi and tributaries"
      ],
      "npk": {
        "nitrogen": "Low — 99.1% of samples in the Kabeerdham district Vertisol survey were low in available N (<280 kg/ha); black soils of the state are described as N-deficient",
        "phosphorus": "Low to medium — the state's black (regur) soils are reported deficient in phosphorus as well as nitrogen",
        "potassium": "Medium to high (state aggregate unverified) — K was not flagged among deficiencies in consulted district surveys; Vertisol tracts are typically better supplied"
      },
      "micronutrients": {
        "zinc": "Deficient in 45.6% of samples in the Palari block survey (Baloda Bazar district); a common constraint of the rice belt",
        "iron": "No verified state-wide deficiency figure in consulted sources (district Vertisol surveys assessed Fe among micronutrients)",
        "boron": "Sufficient to high in surveyed Inceptisols and Vertisols of Kasdol block (0.60-2.90 mg/kg, means ~1.44 mg/kg)",
        "sulphur": "No verified state-wide figure in consulted sources"
      },
      "organicCarbon": "Low to medium — the state's black soils are described as deficient in organic matter; rice-fallow systems return little residue",
      "currentState": "A monsoon-rice-dominated state where nitrogen shortage is near-universal in surveyed soils and zinc deficiency affects large shares of the central rice belt, while boron is comparatively comfortable.",
      "issues": [
        "Near-universal low available nitrogen in surveyed soils (99.1% of samples in Kabeerdham)",
        "Zinc deficiency around 45% of samples in surveyed central-plain blocks",
        "Low organic matter in black-soil and rice-fallow systems",
        "Gravelly Bhata uplands with poor depth and water retention"
      ],
      "recommendations": [
        "Soil-test-based N management with split applications in rice systems",
        "Zinc sulphate application in deficient rice blocks of the central plains",
        "Green manuring (dhaincha/sunhemp) and residue retention to build organic carbon",
        "Phosphorus management on black soils per SHC recommendations"
      ],
      "districtHighlights": [
        {
          "district": "Kabeerdham (Kawardha)",
          "note": "Vertisol survey found 99.1% of soil samples low in available nitrogen"
        },
        {
          "district": "Baloda Bazar-Bhatapara",
          "note": "Palari block survey: 45.56% of samples deficient in available zinc; Kasdol block boron sufficient to high"
        },
        {
          "district": "Raipur",
          "note": "Seat of Indira Gandhi Krishi Vishwavidyalaya (IGKV), the state's soil-research hub, in the red-yellow soil rice belt"
        },
        {
          "district": "Bilaspur",
          "note": "Listed among the principal red-yellow soil districts of the state"
        }
      ],
      "facts": [
        "Red-yellow soils cover about 55% of Chhattisgarh; Alfisols make up roughly 39% of cultivated area and Vertisols about 26.4% (IGKV teaching material).",
        "99.10% of soil samples in a Kabeerdham district Vertisol survey were low in available nitrogen (<280 kg/ha).",
        "45.56% of soil samples in Palari block (Baloda Bazar) were deficient in available zinc.",
        "Boron in surveyed Kasdol-block Inceptisols/Vertisols ranged 0.60-2.90 mg/kg — sufficient to high.",
        "The state's black (regur) soils are reported deficient in nitrogen, phosphorus and organic matter."
      ],
      "sources": [
        {
          "title": "Evaluations of soil fertility status of available major nutrients (N, P, K) and micronutrients in Vertisol of Kabeerdham district of Chhattisgarh",
          "publisher": "Academia.edu (journal reprint)",
          "url": "https://www.academia.edu/94590210/Evaluations_of_soil_Fertility_Status_of_Available_Major_Nutrients_N_P_and_K_and_Micro_Nutrients_Fe_Mn_Cu_and_Zn_in_Vertisol_of_Kabeerdham_District_of_Chhat_tisgarh_India"
        },
        {
          "title": "Evaluation of available zinc status in the soils of Kasdol/Palari blocks, Baloda Bazar",
          "publisher": "International Journal of Chemical Studies",
          "url": "https://www.chemijournal.com/archives/2017/vol5issue5/PartB/5-4-393-740.pdf",
          "year": 2017
        },
        {
          "title": "Soil in Chhattisgarh (IGKV Raipur teaching presentation)",
          "publisher": "IGKV Raipur (via SlideShare)",
          "url": "https://www.slideshare.net/slideshow/soil-in-chhattisgarh-igkv-raipur-cg/248331374"
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "dadra-nagar-haveli-daman-diu": {
      "name": "Dadra & Nagar Haveli and Daman & Diu",
      "summary": "This merged coastal UT has a very small agricultural base, and no UT-specific soil-health aggregate or survey figure could be verified from sources accessible to this compilation. Dadra & Nagar Haveli is hilly with red/lateritic-type soils under high monsoon rainfall, while Daman and Diu are small coastal enclaves. All quantitative fields are flagged rather than estimated; confidence is low.",
      "soilTypes": [
        "Reddish lateritic-type hill soils of Dadra & Nagar Haveli (UT-level NBSS&LUP sheet not directly consulted)",
        "Coastal alluvial soils (Daman, along the Daman Ganga)",
        "Sandy/calcareous coastal soils (Diu)"
      ],
      "npk": {
        "nitrogen": "Low (unverified) — no UT-specific SHC aggregate was accessible in this compilation",
        "phosphorus": "Medium (unverified) — no UT-specific figure found in consulted sources",
        "potassium": "Medium (unverified) — no UT-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported in sources consulted; the UT lies outside the 28-state ICAR-IISS/AICRP survey",
        "iron": "Not reported in sources consulted for this UT",
        "boron": "Not reported in sources consulted for this UT",
        "sulphur": "Not reported in sources consulted for this UT"
      },
      "organicCarbon": "No verified UT-level figure in consulted sources",
      "currentState": "Small tribal-farming pockets (paddy, ragi, pulses) in DNH and tiny coastal holdings in Daman and Diu; published soil-testing statistics for the merged UT are effectively absent from accessible sources.",
      "issues": [
        "Very thin published soil data for the merged UT",
        "Monsoon-erosion pressure on hilly DNH farm plots (severity unquantified in consulted sources)",
        "Coastal salinity exposure in Daman and Diu enclaves (unquantified in consulted sources)"
      ],
      "recommendations": [
        "Use the SHC portal's UT dashboard for current sample aggregates",
        "Soil-test-driven liming/organic-matter management on lateritic-type DNH soils",
        "Salinity-aware crop and water management on coastal plots"
      ],
      "districtHighlights": [
        {
          "district": "Dadra & Nagar Haveli",
          "note": "Hilly, high-rainfall interior district with the UT's main farm area"
        },
        {
          "district": "Daman",
          "note": "Coastal enclave district on the Daman Ganga estuary"
        },
        {
          "district": "Diu",
          "note": "Small island/coastal district off Saurashtra with sandy coastal soils"
        }
      ],
      "facts": [
        "The merged UT (formed 2020) has three districts and a very small cultivated area; no UT-level nutrient aggregate was verifiable in consulted sources.",
        "The 2021 ICAR-led AICRP micronutrient survey covered the 28 states and did not report this UT.",
        "The national SHC scheme applies to the UT; its portal dashboard is the authoritative data source."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state/UT dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Soil Health Card — Factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2",
          "year": 2024
        }
      ],
      "confidence": "low",
      "media": []
    },
    "delhi": {
      "name": "Delhi (NCT)",
      "summary": "Delhi's shrinking farm belt sits on Yamuna alluvium (khadar floodplain and older bangar plain), with the SHC scheme administered through district administrations such as South West and Central-North Delhi. No NCT-specific NPK/organic-carbon aggregate could be verified from consulted sources, so quantitative claims are withheld; urbanisation of the land base is the dominant soil-resource issue.",
      "soilTypes": [
        "Yamuna alluvial soils — recent khadar floodplain and older bangar upland (NCT-level NBSS&LUP sheet not directly consulted)",
        "Sandy-loam alluvium of the southwest rural fringe"
      ],
      "npk": {
        "nitrogen": "Low (unverified) — NW Indian alluvial-plain soils are broadly low in available N, but no NCT-specific SHC aggregate was found in consulted sources",
        "phosphorus": "Medium (unverified) — no NCT-specific figure found in consulted sources",
        "potassium": "Medium to high (unverified) — no NCT-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not reported in sources consulted; the NCT lies outside the 28-state ICAR-IISS/AICRP survey",
        "iron": "Not reported in sources consulted for the NCT",
        "boron": "Not reported in sources consulted for the NCT",
        "sulphur": "Not reported in sources consulted for the NCT"
      },
      "organicCarbon": "No verified NCT-level figure in consulted sources",
      "currentState": "Agriculture survives mainly in the southwest and northwest rural fringe and the Yamuna floodplain; the SHC scheme runs through district administrations, but published NCT-level soil aggregates were not accessible to this compilation.",
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
          "note": "District administration runs a Soil Health Card scheme page; contains one of the NCT's main remaining rural belts (Najafgarh side)"
        },
        {
          "district": "North West Delhi",
          "note": "The other principal rural-fringe district of the NCT"
        },
        {
          "district": "Central North Delhi area (district administration)",
          "note": "Also administers the SHC scheme per its official scheme page"
        }
      ],
      "facts": [
        "The Soil Health Card scheme is implemented in Delhi through district administrations (official district scheme pages consulted).",
        "SHC cards report 12 parameters: N, P, K, S, Zn, B, Fe, Mn, Cu, pH, EC and organic carbon.",
        "No NCT-wide nutrient-status aggregate was verifiable in the sources accessible to this compilation.",
        "Delhi lies outside the 28-state coverage of the 2021 ICAR-led AICRP micronutrient survey."
      ],
      "sources": [
        {
          "title": "Soil Health Card scheme — District South West",
          "publisher": "Government of NCT of Delhi",
          "url": "https://dmsouthwest.delhi.gov.in/scheme/soil-health-card/"
        },
        {
          "title": "Soil Health Card scheme — District Central North",
          "publisher": "Government of NCT of Delhi",
          "url": "https://dmcentralnorth.delhi.gov.in/scheme/soil-health-card/"
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
      "summary": "Goa's soils are dominated by acidic, iron-rich lateritic soils on the uplands, with alluvial strips along rivers and the distinctive khazan lowlands — tidal floodplains reclaimed with bunds and sluice gates and managed against salinity. A state-wide Soil Health Card aggregate and AICRP-style micronutrient percentages could not be verified from sources accessible to this compilation, so quantitative fields are flagged; confidence is low.",
      "soilTypes": [
        "Lateritic soils, acidic and iron-rich (dominant on uplands; state NBSS&LUP sheet not directly consulted)",
        "Coastal and riverine alluvial soils",
        "Khazan saline lowland soils (reclaimed tidal floodplains)"
      ],
      "npk": {
        "nitrogen": "Low to medium (unverified) — no state-specific SHC aggregate accessible in this compilation",
        "phosphorus": "Low (unverified) — P fixation is expected on acidic iron-rich laterites, but no verified Goa figure was found",
        "potassium": "Medium (unverified) — no state-specific figure found in consulted sources"
      },
      "micronutrients": {
        "zinc": "Not verified — Goa is within the 28-state AICRP survey scope, but its state figure was not retrievable in this compilation",
        "iron": "Laterites are inherently iron-rich; deficiency is not the expected issue, but no verified survey figure was found",
        "boron": "Not verified for Goa in consulted sources",
        "sulphur": "Not verified for Goa in consulted sources"
      },
      "organicCarbon": "No verified state figure in consulted sources",
      "currentState": "Plantation and paddy agriculture on acidic laterites and khazan lowlands, with ICAR-CCARI (Old Goa) as the region's research institute; accessible published state-level soil aggregates are scarce.",
      "issues": [
        "Soil acidity on lateritic uplands (state-level severity unquantified in consulted sources)",
        "Salinity management burden in khazan lowlands where bunds/sluices fail",
        "Loss of farm soils to construction and mining-affected lands (unquantified here)"
      ],
      "recommendations": [
        "Use SHC portal state data and ICAR-CCARI advisories for site-specific liming and nutrient plans",
        "Maintain khazan bund-and-sluice infrastructure to keep tidal salinity out of paddy soils",
        "Organic-matter management in plantation systems on laterites"
      ],
      "districtHighlights": [
        {
          "district": "North Goa",
          "note": "Contains extensive khazan lowlands along the Mandovi estuary and ICAR-CCARI at Old Goa"
        },
        {
          "district": "South Goa",
          "note": "Lateritic uplands with plantation agriculture and khazans along the Zuari"
        }
      ],
      "facts": [
        "Goa has two districts; its upland soils are predominantly lateritic and acidic, with khazan reclaimed tidal-floodplain soils a distinctive managed-salinity system.",
        "No verified state-wide NPK, organic-carbon or micronutrient percentages for Goa were accessible in this compilation.",
        "ICAR-CCARI (Central Coastal Agricultural Research Institute), Old Goa, is the coastal-zone soil research institution for the state."
      ],
      "sources": [
        {
          "title": "Soil Health Card portal (state dashboards)",
          "publisher": "Dept. of Agriculture & Farmers Welfare, GoI",
          "url": "https://soilhealth.dac.gov.in/"
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        },
        {
          "title": "Soil Health Card — Factsheet",
          "publisher": "Press Information Bureau, GoI",
          "url": "https://www.pib.gov.in/FactsheetDetails.aspx?Id=148602&reg=48&lang=2",
          "year": 2024
        }
      ],
      "confidence": "low",
      "media": []
    },
    "gujarat": {
      "name": "Gujarat",
      "summary": "Gujarat spans black (regur) soils in the central-south and Saurashtra, alluvium in the northern plains, desert/saline soils of Kachchh and long saline coastlines. Regional surveys report low available nitrogen (79.4% of Gandhinagar samples low), medium phosphorus, medium-to-high potassium, and heavy micronutrient pressure: 49% zinc- and 77% boron-deficient samples in central-Gujarat districts, with sulphur deficient in over half of soils in several districts.",
      "soilTypes": [
        "Black soils (regur/Vertisols) of central-south Gujarat and Saurashtra",
        "Alluvial soils of the north and central Gujarat plains",
        "Sandy, desert and saline soils of Kachchh",
        "Coastal saline-alkali soils"
      ],
      "npk": {
        "nitrogen": "Low — 79.38% of Gandhinagar district samples low in available N; central-Gujarat district soils (Kheda, Anand, Vadodara, Panchmahals) also reported low in N",
        "phosphorus": "Medium — 71.88% of Gandhinagar samples medium in available P; central-Gujarat soils medium",
        "potassium": "High to medium — 50% of Gandhinagar samples high in available K; central-Gujarat soils medium in K"
      },
      "micronutrients": {
        "zinc": "Deficient in 49% of soils in the consulted central-Gujarat survey (Kheda-Anand-Vadodara-Panchmahals belt)",
        "iron": "No verified state-wide deficiency figure in consulted sources",
        "boron": "High deficiency — 77% of soils deficient in hot-water-soluble boron in the same central-Gujarat survey",
        "sulphur": "Deficient in more than 50% of soils in several districts: Kheda 61.2%, Anand 53.4%, Vadodara 68.4%, Panchmahals 52.2% (Gandhinagar, by contrast, showed 48.75% high available S)"
      },
      "organicCarbon": "Low to medium (state aggregate unverified in consulted sources); intensively cropped alluvial and black soils under semi-arid climate typically test low",
      "currentState": "An intensively farmed, largely semi-arid state where nitrogen, sulphur, zinc and boron shortfalls coexist with structural problems — coastal salinity ingress and the saline/sodic wastelands of Kachchh and the Rann fringe.",
      "issues": [
        "Low available nitrogen across surveyed districts",
        "Boron deficiency in about three-quarters of surveyed central-Gujarat soils",
        "Sulphur deficiency in over half of soils in several districts",
        "Zinc deficiency in about half of surveyed soils",
        "Coastal salinity/sodicity and saline desert soils of Kachchh limiting cultivable soil quality"
      ],
      "recommendations": [
        "Balanced NPK per Soil Health Card tests, with routine sulphur (gypsum/SSP) in oilseed-heavy rotations",
        "Borax and zinc sulphate application in deficient blocks of central and north Gujarat",
        "Salinity management (drainage, gypsum on sodic patches, salt-tolerant varieties) in coastal and Kachchh tracts",
        "Organic-matter build-up on low-OC semi-arid soils"
      ],
      "districtHighlights": [
        {
          "district": "Vadodara",
          "note": "Highest surveyed sulphur deficiency among the central-Gujarat districts: 68.4% of samples"
        },
        {
          "district": "Kheda",
          "note": "61.2% of samples sulphur-deficient in the consulted survey"
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
          "note": "79.38% of samples low in available N, 71.88% medium in P, 50% high in K, 48.75% high in S (160-sample district study)"
        }
      ],
      "facts": [
        "Central-Gujarat soils (Kheda, Anand, Vadodara, Panchmahals) tested low in N, medium in P, K and S, with 49% zinc- and 77% boron-deficient samples.",
        "Sulphur deficiency exceeded 50% of samples in Kheda (61.2%), Anand (53.4%), Vadodara (68.4%) and Panchmahals (52.2%).",
        "In Gandhinagar district, 79.38% of 160 samples were low in available nitrogen and 50% high in available potassium.",
        "Gujarat's soil base spans black regur, alluvial plains, Kachchh desert-saline soils and coastal saline-alkali tracts."
      ],
      "sources": [
        {
          "title": "Status of Sulphur and Boron in Soils of North Gujarat Region of India",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/355268847_Status_of_Sulphur_and_Boron_in_Soils_of_North_Gujarat_Region_of_India",
          "year": 2021
        },
        {
          "title": "Status of available major nutrients in soils of Gandhinagar district of Gujarat",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/329706612_Status_of_available_major_nutrients_in_soils_of_Gandhi_nagar_district_of_Gujarat",
          "year": 2018
        },
        {
          "title": "Fertility status of cultivated soils in coastal Bhavnagar district of Saurashtra region of Gujarat",
          "publisher": "Journal reprint (ResearchGate)",
          "url": "https://www.researchgate.net/publication/282820141_Fertility_status_of_cultivated_soils_in_coastal_bhavnagar_district_of_saurashtra_region_of_Gujarat",
          "year": 2015
        }
      ],
      "confidence": "medium",
      "media": []
    },
    "haryana": {
      "name": "Haryana",
      "summary": "Haryana's Indo-Gangetic alluvial soils, pushed hard by rice-wheat double cropping, show statewide nutrient depletion: a CCS HAU survey of 6,469 samples across 22 districts found all soils low in available nitrogen, with sulphur and zinc depletion worst in Mahendragarh and iron/copper deficiency peaking in Fatehabad. ICAR-IISS pegs average deficiencies at about 15.3% (Zn), 21.6% (Fe), 6.1% (Mn), 5.2% (Cu) and 3.3% (B), and organic carbon runs 0.22-0.82%.",
      "soilTypes": [
        "Indo-Gangetic alluvial soils, sandy loam to loam (dominant)",
        "Sandy/loamy-sand arid soils of the southwest (Bhiwani-Mahendragarh belt)",
        "Saline-sodic (reh/kallar) patches in canal-irrigated and waterlogged tracts"
      ],
      "npk": {
        "nitrogen": "Low — all soils in the CCS HAU 22-district survey (6,469 samples) tested low in available nitrogen",
        "phosphorus": "Low to medium — soils described as lacking in phosphate, especially in Bhiwani, Rewari, Gurugram, Jhajjar and Hisar",
        "potassium": "High to medium (state aggregate unverified) — K was not among the deficiencies flagged in the consulted statewide surveys"
      },
      "micronutrients": {
        "zinc": "Deficient — average deficiency about 15.3% of samples (district range 1.1-36.5%, ICAR-IISS); CCS HAU survey found the highest district-level Zn deficiency in Mahendragarh (14.5%)",
        "iron": "Deficient — average about 21.6% of samples (range 0-55%, ICAR-IISS); highest in Fatehabad (14.8%) in the CCS HAU survey",
        "boron": "Low deficiency — about 3.3% of samples on average (range 0-13.7%), among the least-affected nutrients in Haryana",
        "sulphur": "Deficient and rising — CCS HAU found maximum sulphur deficiency in Mahendragarh at 27.8% of samples"
      },
      "organicCarbon": "Low to medium — 0.22-0.82% across surveyed soils; low OC accompanies universal N shortage",
      "currentState": "A 2025 CCS HAU statewide study reports widespread nutrient depletion threatening crop yields in the rice-wheat belt: nitrogen universally low, sulphur and zinc mining concentrated in the southwest, and iron/copper deficiency emerging in the Fatehabad side.",
      "issues": [
        "Universal low available nitrogen under intensive rice-wheat cropping",
        "Sulphur depletion (up to 27.8% of samples deficient in Mahendragarh)",
        "Zinc and iron deficiency pockets (Zn range up to 36.5%, Fe up to 55% of samples in worst districts)",
        "Low organic carbon (as low as 0.22%) in intensively tilled soils",
        "Saline-sodic patches and waterlogging in canal-irrigated southwest tracts"
      ],
      "recommendations": [
        "Soil-test-based N with split/neem-coated urea applications rather than blanket dosing",
        "Sulphur fertilisation (gypsum/SSP) in mustard-growing southern districts",
        "Zinc sulphate in deficient blocks, a long-standing HAU recommendation for rice-wheat",
        "Residue retention/incorporation instead of burning to rebuild organic carbon",
        "Gypsum-based reclamation of sodic patches with improved drainage"
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
          "note": "Seat of CCS Haryana Agricultural University; sandy-loam soils flagged as lacking N, phosphate and zinc"
        },
        {
          "district": "Bhiwani",
          "note": "Sandy southwestern district among those flagged for N, phosphate and zinc shortage"
        }
      ],
      "facts": [
        "A CCS HAU study analysed about 6,469 soil samples from 22 Haryana districts and found all soils low in available nitrogen.",
        "Average micronutrient deficiencies in Haryana soils: Zn 15.3%, Fe 21.6%, Mn 6.1%, Cu 5.2%, B 3.3% of samples (ICAR-IISS status report).",
        "District-level deficiency ranges: Zn 1.1-36.5%, Fe 0-55%, Mn 0-48.6%, Cu 0-13%, B 0-13.7%.",
        "Organic carbon in surveyed Haryana soils varied from 0.22% to 0.82%.",
        "Mahendragarh (S 27.8%, Zn 14.5%) and Fatehabad (Fe 14.8%, Cu 4.9%) are the worst-affected surveyed districts."
      ],
      "sources": [
        {
          "title": "Haryana varsity study finds widespread nutrient depletion threatening crop yields and food security",
          "publisher": "ETV Bharat (reporting CCS HAU study)",
          "url": "https://www.etvbharat.com/en/bharat/haryana-varsity-study-finds-widespread-nutrient-depletion-threatening-crop-yields-and-food-security-enn25121403086",
          "year": 2025
        },
        {
          "title": "Status of Micronutrient Deficiencies in Soils of Haryana",
          "publisher": "ICAR-Indian Institute of Soil Science",
          "url": "https://iiss.res.in/downloads/division/Status%20of%20Micronutrients%20Deficiencies%20in%20Soils%20of%20Haryana.pdf"
        },
        {
          "title": "Deficiency of phyto-available sulphur, zinc, boron, iron, copper and manganese in soils of India",
          "publisher": "Scientific Reports (Nature) / ICAR-IISS",
          "url": "https://www.nature.com/articles/s41598-021-99040-2",
          "year": 2021
        }
      ],
      "confidence": "high",
      "media": []
    }
  }
};
