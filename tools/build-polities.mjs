#!/usr/bin/env node
// Expands the compact polity table into data/polities/polities.json.
// Years: negative = BCE (-322 = 322 BCE). No year zero; -1 is 1 BCE, 1 is 1 CE.
// `to: null` means still extant.
//
// precision: how tightly the date is known — 'year' | 'decade' | 'century' | 'millennium'
// confidence: how sure we are the entity existed as described, 0..1
// Ancient entries are deliberately low-confidence and coarse. That is the honest state
// of the evidence, and the game renders it as such (see docs/04-eras.md).

import { writeFileSync, mkdirSync } from 'node:fs';

const ERAS = [
  ['ERA.NEOLITHIC',        'Neolithic & Chalcolithic',   -7000, -3300, 'No states. Village agriculture, craft specialisation, no evidence of rule.'],
  ['ERA.EARLY_HARAPPAN',   'Early Harappan',             -3300, -2600, 'Regional proto-urban cultures converge on shared material norms.'],
  ['ERA.MATURE_HARAPPAN',  'Indus Civilisation',         -2600, -1900, 'Urban, standardised, long-distance trade — and no evidence of kings or armies.'],
  ['ERA.LATE_HARAPPAN',    'Late Harappan & Vedic',      -1900,  -600, 'Deurbanisation, eastward shift, oral corpus, emergence of janapadas.'],
  ['ERA.SECOND_URBAN',     'Second Urbanisation',         -600,  -322, 'Mahajanapadas, punch-marked coinage, Buddhism and Jainism, Magadhan ascent.'],
  ['ERA.MAURYAN',          'Mauryan',                     -322,  -185, 'First subcontinental empire. Edicts, provincial administration, dhamma.'],
  ['ERA.CLASSICAL',        'Classical',                   -185,   320, 'Fragmentation and Indian Ocean trade. Satavahanas, Kushans, Sangam south.'],
  ['ERA.GUPTA',            'Gupta & Post-Gupta',           320,   650, 'Land-grant economy, temple building, Huna invasions, Harsha.'],
  ['ERA.EARLY_MEDIEVAL',   'Early Medieval',               650,  1206, 'Regional kingdoms, tripartite struggle, Chola maritime reach, agrarian expansion.'],
  ['ERA.SULTANATE',        'Sultanate',                   1206,  1526, 'Iqta assignment, Vijayanagara and the Deccan sultanates, regional sultanates.'],
  ['ERA.MUGHAL',           'Mughal & Early Modern',       1526,  1757, 'Mansabdari and zabt revenue, Maratha expansion, European trading companies.'],
  ['ERA.COLONIAL',         'Company & Crown',             1757,  1947, 'Land revenue settlements, railways, paramountcy, the Drain.'],
  ['ERA.REPUBLIC',         'Republic',                    1947,  null, 'Federal union, planning, reorganisation, liberalisation.'],
];

// [id, name, era, from, to, type, precision, confidence, core(states), note]
const P = [
  // ---- pre-state: cultures, not polities. Nobody rules anybody. ----
  ['CUL.MEHRGARH','Mehrgarh','ERA.NEOLITHIC',-7000,-2600,'culture','millennium',0.55,['PK.BALOCHISTAN'],'Earliest farming in the region; wheat, barley, cattle.'],
  ['CUL.BHIRRANA','Bhirrana–Ghaggar Neolithic','ERA.NEOLITHIC',-7000,-3300,'culture','millennium',0.4,['IN.HR'],'Contested early dates on the Ghaggar-Hakra.'],
  ['CUL.LAHURADEWA','Lahuradewa & Middle Ganga','ERA.NEOLITHIC',-6500,-3000,'culture','millennium',0.4,['IN.UP'],'Independent rice domestication argued here.'],
  ['CUL.SOUTH_NEOLITHIC','South Indian Ashmound Neolithic','ERA.EARLY_HARAPPAN',-3000,-1200,'culture','century',0.5,['IN.KA','IN.AP'],'Cattle pastoralism; ashmounds of the Deccan.'],
  ['CUL.BURZAHOM','Burzahom & Kashmir Neolithic','ERA.EARLY_HARAPPAN',-3000,-1000,'culture','century',0.5,['IN.JK'],'Pit dwellings; links north toward Central Asia.'],
  ['CUL.AHAR_BANAS','Ahar–Banas','ERA.EARLY_HARAPPAN',-3000,-1500,'culture','century',0.5,['IN.RJ'],'Chalcolithic copper working in Mewar.'],
  ['CUL.KAYATHA','Kayatha','ERA.MATURE_HARAPPAN',-2400,-1700,'culture','century',0.45,['IN.MP'],'Malwa chalcolithic sequence.'],
  ['CUL.EARLY_HARAPPAN','Early Harappan (Ravi / Kot Diji / Sothi-Siswal)','ERA.EARLY_HARAPPAN',-3300,-2600,'culture','century',0.6,['PK.PUNJAB','IN.HR','IN.RJ'],'Regional cultures converging on shared norms.'],

  // ---- Indus: a civilisation without evidence of a ruler ----
  ['NET.INDUS','Indus Civilisation','ERA.MATURE_HARAPPAN',-2600,-1900,'network','century',0.75,['PK.SINDH','PK.PUNJAB','IN.GJ','IN.HR','IN.RJ'],'Standardised weights, script, planned cities. No palaces, no royal burials, no army. Modelled as a network, not a state.'],
  ['NET.INDUS.SINDHI','Sindhi domain (Mohenjo-daro)','ERA.MATURE_HARAPPAN',-2600,-1900,'network','century',0.6,['PK.SINDH'],'Regional domain of the Indus network.'],
  ['NET.INDUS.PUNJAB','Punjab domain (Harappa)','ERA.MATURE_HARAPPAN',-2600,-1900,'network','century',0.6,['PK.PUNJAB'],'Regional domain of the Indus network.'],
  ['NET.INDUS.SORATH','Sorath domain (Dholavira, Lothal)','ERA.MATURE_HARAPPAN',-2600,-1900,'network','century',0.6,['IN.GJ'],'Gujarat domain; maritime contact with the Gulf.'],
  ['NET.INDUS.EASTERN','Eastern domain (Rakhigarhi, Kalibangan)','ERA.MATURE_HARAPPAN',-2600,-1900,'network','century',0.6,['IN.HR','IN.RJ'],'Ghaggar-Hakra domain.'],
  ['CUL.CEMETERY_H','Cemetery H','ERA.LATE_HARAPPAN',-1900,-1300,'culture','century',0.55,['PK.PUNJAB'],'Late/post-urban Harappan in the Punjab.'],
  ['CUL.JHUKAR','Jhukar','ERA.LATE_HARAPPAN',-1900,-1500,'culture','century',0.5,['PK.SINDH'],'Post-urban Sindh.'],
  ['CUL.OCP','Ochre Coloured Pottery / Copper Hoards','ERA.LATE_HARAPPAN',-2000,-1500,'culture','century',0.45,['IN.UP','IN.HR'],'Doab copper hoards; association contested.'],
  ['CUL.PGW','Painted Grey Ware','ERA.LATE_HARAPPAN',-1200,-600,'culture','century',0.7,['IN.UP','IN.HR','IN.PB'],'Material horizon commonly correlated with the later Vedic period.'],
  ['CUL.MEGALITHIC','South Indian Megalithic (Iron Age)','ERA.LATE_HARAPPAN',-1500,-300,'culture','century',0.65,['IN.TN','IN.KA','IN.KL','IN.TG'],'Iron, urn burials; precedes the Sangam polities.'],

  // ---- Vedic janapadas ----
  ['POL.KURU','Kuru','ERA.LATE_HARAPPAN',-1200,-500,'janapada','century',0.5,['IN.HR','IN.UP'],'First well-attested Vedic polity; ritual codification.'],
  ['POL.PANCHALA','Panchala','ERA.LATE_HARAPPAN',-1100,-350,'janapada','century',0.5,['IN.UP'],'Later a mahajanapada; briefly a gana-sangha.'],
  ['POL.VIDEHA','Videha','ERA.LATE_HARAPPAN',-1100,-600,'janapada','century',0.45,['IN.BR','NP.MADHESH'],'Absorbed into the Vajji confederacy.'],

  // ---- the sixteen mahajanapadas ----
  ['POL.MAGADHA','Magadha','ERA.SECOND_URBAN',-700,-322,'kingdom','century',0.8,['IN.BR'],'Iron, river control and Rajgir/Pataliputra; eventual victor.'],
  ['POL.KOSALA','Kosala','ERA.SECOND_URBAN',-700,-362,'kingdom','century',0.7,['IN.UP'],'Annexed by Magadha under the Haryankas.'],
  ['POL.KASI','Kasi','ERA.SECOND_URBAN',-700,-500,'kingdom','century',0.65,['IN.UP'],'Absorbed by Kosala, then Magadha.'],
  ['POL.ANGA','Anga','ERA.SECOND_URBAN',-700,-530,'kingdom','century',0.65,['IN.BR','IN.JH'],'Annexed by Bimbisara.'],
  ['POL.VAJJI','Vajji (Licchavi confederacy)','ERA.SECOND_URBAN',-700,-468,'gana-sangha','century',0.7,['IN.BR'],'Republic-like oligarchy; conquered by Ajatashatru.'],
  ['POL.MALLA','Malla','ERA.SECOND_URBAN',-700,-450,'gana-sangha','century',0.6,['IN.UP','IN.BR'],'Oligarchic; site of the Buddha’s parinirvana.'],
  ['POL.VATSA','Vatsa','ERA.SECOND_URBAN',-700,-400,'kingdom','century',0.6,['IN.UP'],'Kaushambi; a major trade node.'],
  ['POL.AVANTI','Avanti','ERA.SECOND_URBAN',-700,-400,'kingdom','century',0.65,['IN.MP'],'Ujjain; long rival of Magadha.'],
  ['POL.CHEDI','Chedi','ERA.SECOND_URBAN',-700,-400,'kingdom','century',0.55,['IN.MP','IN.UP'],''],
  ['POL.MATSYA','Matsya','ERA.SECOND_URBAN',-700,-400,'kingdom','century',0.55,['IN.RJ'],''],
  ['POL.SURASENA','Surasena','ERA.SECOND_URBAN',-700,-400,'kingdom','century',0.55,['IN.UP'],'Mathura.'],
  ['POL.ASSAKA','Assaka','ERA.SECOND_URBAN',-700,-300,'kingdom','century',0.5,['IN.MH','IN.TG'],'Only southern mahajanapada.'],
  ['POL.GANDHARA','Gandhara','ERA.SECOND_URBAN',-700,-518,'kingdom','century',0.7,['PK.KP','AF.NANGARHAR'],'Taxila; absorbed by the Achaemenids.'],
  ['POL.KAMBOJA','Kamboja','ERA.SECOND_URBAN',-700,-300,'gana-sangha','century',0.5,['AF.KABUL','PK.KP'],''],
  ['POL.MALLA_KUSHINARA','Kuru (late)','ERA.SECOND_URBAN',-600,-400,'gana-sangha','century',0.5,['IN.HR'],'Reduced to an oligarchy by this period.'],
  ['POL.PANCHALA_LATE','Panchala (late)','ERA.SECOND_URBAN',-600,-350,'gana-sangha','century',0.5,['IN.UP'],''],

  // ---- foreign powers in the northwest ----
  ['POL.ACHAEMENID','Achaemenid satrapies (Gandara, Hindush)','ERA.SECOND_URBAN',-518,-330,'satrapy','decade',0.8,['PK.KP','PK.PUNJAB','PK.SINDH'],'First imperial administration in the subcontinent.'],
  ['POL.MACEDONIAN','Macedonian campaign','ERA.SECOND_URBAN',-327,-325,'occupation','year',0.9,['PK.PUNJAB'],'Alexander; withdrawal at the Beas.'],
  ['POL.SELEUCID','Seleucid claim','ERA.MAURYAN',-312,-303,'empire','decade',0.85,['AF.KABUL','PK.KP'],'Ceded to Chandragupta in 303 BCE.'],

  // ---- Magadhan dynasties ----
  ['POL.HARYANKA','Haryanka dynasty','ERA.SECOND_URBAN',-544,-413,'dynasty','decade',0.75,['IN.BR'],'Bimbisara, Ajatashatru. Magadhan expansion begins.'],
  ['POL.SHISHUNAGA','Shishunaga dynasty','ERA.SECOND_URBAN',-413,-345,'dynasty','decade',0.7,['IN.BR'],'Absorbs Avanti.'],
  ['POL.NANDA','Nanda Empire','ERA.SECOND_URBAN',-345,-322,'empire','decade',0.75,['IN.BR','IN.UP','IN.OD'],'Vast standing army; heavy taxation.'],
  ['POL.MAURYA','Maurya Empire','ERA.MAURYAN',-322,-185,'empire','decade',0.9,['IN.BR','IN.UP','PK.PUNJAB','IN.OD','IN.KA'],'First subcontinental empire. Ashokan edicts give the first directly attested administrative geography.'],

  // ---- post-Mauryan ----
  ['POL.SHUNGA','Shunga','ERA.CLASSICAL',-185,-73,'dynasty','decade',0.8,['IN.MP','IN.UP','IN.BR'],''],
  ['POL.KANVA','Kanva','ERA.CLASSICAL',-73,-28,'dynasty','decade',0.7,['IN.MP'],''],
  ['POL.SATAVAHANA','Satavahana','ERA.CLASSICAL',-100,225,'empire','century',0.75,['IN.MH','IN.TG','IN.AP'],'Deccan; start date contested between 3rd and 1st c. BCE.'],
  ['POL.INDO_GREEK','Indo-Greek kingdoms','ERA.CLASSICAL',-180,10,'kingdom','decade',0.8,['PK.PUNJAB','AF.KABUL'],'Menander; bilingual coinage is the main evidence.'],
  ['POL.INDO_SCYTHIAN','Indo-Scythian (Saka)','ERA.CLASSICAL',-150,400,'kingdom','decade',0.75,['PK.SINDH','IN.GJ','IN.MP'],''],
  ['POL.WESTERN_SATRAPS','Western Satraps','ERA.CLASSICAL',35,405,'satrapy','decade',0.85,['IN.GJ','IN.MP','IN.MH'],'Dated coinage — unusually precise for the period.'],
  ['POL.INDO_PARTHIAN','Indo-Parthian','ERA.CLASSICAL',19,226,'kingdom','decade',0.7,['PK.KP','AF.KABUL'],''],
  ['POL.KUSHAN','Kushan Empire','ERA.CLASSICAL',30,375,'empire','decade',0.85,['PK.KP','PK.PUNJAB','IN.UP'],'Silk Road hinge; Kanishka.'],
  ['POL.KALINGA','Kalinga','ERA.SECOND_URBAN',-700,-261,'kingdom','century',0.7,['IN.OD'],'Independent until Ashoka. The one Mauryan conquest with a first-person account of its cost.'],
  ['POL.MAHAMEGHAVAHANA','Mahameghavahana (Kalinga)','ERA.CLASSICAL',-250,400,'dynasty','century',0.6,['IN.OD'],'Kharavela and the Hathigumpha inscription; Kalinga independent again.'],
  ['POL.CHERA_EARLY','Chera (Sangam)','ERA.CLASSICAL',-300,300,'kingdom','century',0.6,['IN.KL','IN.TN'],'Sangam-era; Roman trade at Muziris.'],
  ['POL.CHOLA_EARLY','Chola (Sangam)','ERA.CLASSICAL',-300,300,'kingdom','century',0.6,['IN.TN'],'Karikala; the early, pre-imperial Cholas.'],
  ['POL.PANDYA_EARLY','Pandya (Sangam)','ERA.CLASSICAL',-300,300,'kingdom','century',0.6,['IN.TN'],'Madurai.'],

  // ---- Gupta and post-Gupta ----
  ['POL.GUPTA','Gupta Empire','ERA.GUPTA',320,550,'empire','decade',0.9,['IN.BR','IN.UP','IN.MP','IN.WB'],'Land grants, temple architecture, mathematics and astronomy.'],
  ['POL.VAKATAKA','Vakataka','ERA.GUPTA',250,500,'kingdom','decade',0.85,['IN.MH','IN.MP'],'Ajanta patronage; matrimonially tied to the Guptas.'],
  ['POL.PALLAVA','Pallava','ERA.GUPTA',275,897,'kingdom','decade',0.85,['IN.TN','IN.AP'],'Mahabalipuram; Tamil temple architecture begins.'],
  ['POL.KADAMBA','Kadamba','ERA.GUPTA',345,525,'kingdom','decade',0.8,['IN.KA'],'Banavasi; first Kannada-region dynasty.'],
  ['POL.GANGA_W','Western Ganga','ERA.GUPTA',350,1000,'kingdom','decade',0.8,['IN.KA'],'Talakad; Jain patronage.'],
  ['POL.MAITRAKA','Maitraka','ERA.GUPTA',475,776,'kingdom','decade',0.8,['IN.GJ'],'Valabhi; a major learning centre.'],
  ['POL.ALCHON','Alchon Huns','ERA.GUPTA',470,670,'confederacy','decade',0.7,['PK.PUNJAB','IN.RJ'],'Toramana, Mihirakula.'],
  ['POL.KAMARUPA','Kamarupa','ERA.GUPTA',350,1140,'kingdom','decade',0.75,['IN.AS'],'Brahmaputra valley.'],
  ['POL.MAUKHARI','Maukhari','ERA.GUPTA',550,606,'kingdom','decade',0.75,['IN.UP'],'Kannauj.'],
  ['POL.VARDHANA','Pushyabhuti (Harsha)','ERA.GUPTA',606,647,'empire','year',0.85,['IN.UP','IN.HR'],'Harshavardhana; last great north Indian power before fragmentation.'],
  ['POL.CHALUKYA_BADAMI','Chalukya of Badami','ERA.GUPTA',543,753,'kingdom','decade',0.85,['IN.KA','IN.MH'],'Pulakeshin II halts Harsha at the Narmada.'],

  // ---- early medieval ----
  ['POL.PRATIHARA','Gurjara-Pratihara','ERA.EARLY_MEDIEVAL',730,1036,'empire','decade',0.85,['IN.RJ','IN.UP','IN.MP'],'One leg of the tripartite struggle for Kannauj.'],
  ['POL.PALA','Pala','ERA.EARLY_MEDIEVAL',750,1161,'empire','decade',0.85,['IN.WB','IN.BR','BD.RAJSHAHI'],'Buddhist patronage; Nalanda and Vikramashila.'],
  ['POL.RASHTRAKUTA','Rashtrakuta','ERA.EARLY_MEDIEVAL',753,982,'empire','decade',0.85,['IN.KA','IN.MH'],'Ellora Kailasa; third leg of the tripartite struggle.'],
  ['POL.CHALUKYA_W','Western Chalukya (Kalyani)','ERA.EARLY_MEDIEVAL',973,1189,'empire','decade',0.85,['IN.KA'],'Long war with the Cholas.'],
  ['POL.CHALUKYA_E','Eastern Chalukya (Vengi)','ERA.EARLY_MEDIEVAL',624,1189,'kingdom','decade',0.8,['IN.AP'],''],
  ['POL.CHOLA','Chola Empire','ERA.EARLY_MEDIEVAL',848,1279,'empire','decade',0.95,['IN.TN','IN.KL','LK.NORTHERN'],'Maritime reach to Srivijaya; exceptional inscriptional record of village assemblies.'],
  ['POL.PANDYA','Pandya (later)','ERA.EARLY_MEDIEVAL',1190,1345,'kingdom','decade',0.85,['IN.TN'],''],
  ['POL.CHERA_PERUMAL','Chera Perumals of Makotai','ERA.EARLY_MEDIEVAL',800,1102,'kingdom','decade',0.75,['IN.KL'],''],
  ['POL.PARAMARA','Paramara','ERA.EARLY_MEDIEVAL',800,1327,'kingdom','decade',0.85,['IN.MP'],'Bhoja of Dhar.'],
  ['POL.CHANDELA','Chandela','ERA.EARLY_MEDIEVAL',831,1315,'kingdom','decade',0.85,['IN.MP','IN.UP'],'Khajuraho.'],
  ['POL.CHAULUKYA','Chaulukya (Solanki)','ERA.EARLY_MEDIEVAL',940,1244,'kingdom','decade',0.85,['IN.GJ'],'Somnath; Jain mercantile wealth.'],
  ['POL.SENA','Sena','ERA.EARLY_MEDIEVAL',1070,1230,'kingdom','decade',0.8,['IN.WB','BD.DHAKA'],''],
  ['POL.KAKATIYA','Kakatiya','ERA.EARLY_MEDIEVAL',1083,1323,'kingdom','decade',0.85,['IN.TG','IN.AP'],'Tank irrigation across the Telangana uplands.'],
  ['POL.HOYSALA','Hoysala','ERA.EARLY_MEDIEVAL',1026,1343,'kingdom','decade',0.85,['IN.KA'],'Belur, Halebidu.'],
  ['POL.YADAVA','Seuna (Yadava) of Devagiri','ERA.EARLY_MEDIEVAL',1187,1317,'kingdom','decade',0.85,['IN.MH'],''],
  ['POL.GANGA_E','Eastern Ganga','ERA.EARLY_MEDIEVAL',1078,1434,'kingdom','decade',0.85,['IN.OD'],'Konark, Puri.'],
  ['POL.SHAHI','Kabul Shahi','ERA.EARLY_MEDIEVAL',850,1026,'kingdom','decade',0.75,['AF.KABUL','PK.KP'],'Falls to Mahmud of Ghazni.'],
  ['POL.GHAZNAVID','Ghaznavid (Punjab)','ERA.EARLY_MEDIEVAL',1001,1186,'sultanate','decade',0.9,['PK.PUNJAB'],'Lahore as an eastern capital.'],
  ['POL.GHURID','Ghurid','ERA.EARLY_MEDIEVAL',1148,1215,'sultanate','decade',0.9,['AF.GHOR','PK.PUNJAB','IN.DL'],'Second Tarain, 1192.'],
  ['POL.AHOM','Ahom kingdom','ERA.SULTANATE',1228,1826,'kingdom','year',0.95,['IN.AS'],'Six centuries; repels the Mughals at Saraighat, 1671.'],
  ['POL.TRIPURA','Twipra (Manikya)','ERA.SULTANATE',1280,1949,'kingdom','decade',0.85,['IN.TR'],''],

  // ---- sultanate era ----
  ['POL.DELHI_MAMLUK','Delhi Sultanate — Mamluk','ERA.SULTANATE',1206,1290,'sultanate','year',0.95,['IN.DL','IN.UP'],'Iltutmish, Razia, Balban. Iqta assignment established.'],
  ['POL.DELHI_KHALJI','Delhi Sultanate — Khalji','ERA.SULTANATE',1290,1320,'sultanate','year',0.95,['IN.DL'],'Alauddin: price control, market regulation, Deccan raids.'],
  ['POL.DELHI_TUGHLAQ','Delhi Sultanate — Tughlaq','ERA.SULTANATE',1320,1414,'sultanate','year',0.95,['IN.DL'],'Daulatabad transfer; token currency; Timur’s sack in 1398.'],
  ['POL.DELHI_SAYYID','Delhi Sultanate — Sayyid','ERA.SULTANATE',1414,1451,'sultanate','year',0.95,['IN.DL'],''],
  ['POL.DELHI_LODI','Delhi Sultanate — Lodi','ERA.SULTANATE',1451,1526,'sultanate','year',0.95,['IN.DL','IN.UP'],'Ends at Panipat.'],
  ['POL.BENGAL_SULT','Bengal Sultanate','ERA.SULTANATE',1352,1576,'sultanate','year',0.95,['IN.WB','BD.DHAKA'],'Independent, wealthy, and a distinct Bengali literary patron.'],
  ['POL.JAUNPUR','Jaunpur Sultanate','ERA.SULTANATE',1394,1479,'sultanate','year',0.9,['IN.UP'],'Sharqi.'],
  ['POL.MALWA_SULT','Malwa Sultanate','ERA.SULTANATE',1392,1562,'sultanate','year',0.9,['IN.MP'],'Mandu.'],
  ['POL.GUJARAT_SULT','Gujarat Sultanate','ERA.SULTANATE',1407,1573,'sultanate','year',0.9,['IN.GJ'],'Maritime revenue; contests the Portuguese.'],
  ['POL.KASHMIR_SULT','Kashmir Sultanate','ERA.SULTANATE',1339,1586,'sultanate','year',0.9,['IN.JK'],'Zain-ul-Abidin.'],
  ['POL.BAHMANI','Bahmani Sultanate','ERA.SULTANATE',1347,1527,'sultanate','year',0.95,['IN.TG','IN.KA','IN.MH'],'First Deccan sultanate; splits into five.'],
  ['POL.VIJAYANAGARA','Vijayanagara Empire','ERA.SULTANATE',1336,1646,'empire','year',0.95,['IN.KA','IN.AP','IN.TN'],'Nayaka assignment system; Hampi.'],
  ['POL.AHMADNAGAR','Ahmadnagar Sultanate','ERA.SULTANATE',1490,1636,'sultanate','year',0.95,['IN.MH'],''],
  ['POL.BIJAPUR','Bijapur Sultanate (Adil Shahi)','ERA.SULTANATE',1490,1686,'sultanate','year',0.95,['IN.KA'],''],
  ['POL.GOLCONDA','Golconda Sultanate (Qutb Shahi)','ERA.SULTANATE',1518,1687,'sultanate','year',0.95,['IN.TG'],'Diamonds; Hyderabad founded 1591.'],
  ['POL.BERAR','Berar Sultanate','ERA.SULTANATE',1490,1572,'sultanate','year',0.9,['IN.MH'],''],
  ['POL.BIDAR','Bidar Sultanate','ERA.SULTANATE',1492,1619,'sultanate','year',0.9,['IN.KA'],''],
  ['POL.GAJAPATI','Gajapati','ERA.SULTANATE',1434,1541,'kingdom','year',0.9,['IN.OD'],''],
  ['POL.MEWAR','Mewar (Sisodia)','ERA.SULTANATE',1326,1949,'kingdom','year',0.95,['IN.RJ'],'Rana Sanga, Pratap; the longest Rajput resistance.'],
  ['POL.MARWAR','Marwar (Rathore)','ERA.SULTANATE',1226,1949,'kingdom','year',0.95,['IN.RJ'],'Jodhpur.'],
  ['POL.AMBER','Amber / Jaipur (Kachhwaha)','ERA.SULTANATE',1128,1949,'kingdom','year',0.95,['IN.RJ'],'Early and durable Mughal alliance.'],

  // ---- Mughal & early modern ----
  ['POL.MUGHAL','Mughal Empire','ERA.MUGHAL',1526,1857,'empire','year',1.0,['IN.DL','IN.UP','IN.PB','IN.BR','IN.WB','IN.MP','IN.GJ'],'Mansabdari and zabt. The Ain-i-Akbari (1595) is the richest pre-colonial dataset in existence for the region.'],
  ['POL.SUR','Sur Empire','ERA.MUGHAL',1540,1556,'empire','year',0.95,['IN.DL','IN.BR'],'Sher Shah: the rupiya, the Grand Trunk Road, revenue survey.'],
  ['POL.MARATHA','Maratha Confederacy','ERA.MUGHAL',1674,1818,'confederacy','year',1.0,['IN.MH','IN.MP','IN.GJ'],'Chauth and sardeshmukhi — a tribute-overlordship system, not territorial annexation.'],
  ['POL.MARATHA.SCINDIA','Scindia of Gwalior','ERA.MUGHAL',1731,1948,'kingdom','year',0.95,['IN.MP'],''],
  ['POL.MARATHA.HOLKAR','Holkar of Indore','ERA.MUGHAL',1731,1948,'kingdom','year',0.95,['IN.MP'],''],
  ['POL.MARATHA.GAEKWAD','Gaekwad of Baroda','ERA.MUGHAL',1721,1949,'kingdom','year',0.95,['IN.GJ'],''],
  ['POL.MARATHA.BHONSLE','Bhonsle of Nagpur','ERA.MUGHAL',1739,1853,'kingdom','year',0.95,['IN.MH'],''],
  ['POL.SIKH_MISLS','Sikh Misls','ERA.MUGHAL',1748,1799,'confederacy','year',0.9,['IN.PB','PK.PUNJAB'],'Twelve confederacies; a genuinely non-monarchic sovereignty model.'],
  ['POL.SIKH_EMPIRE','Sikh Empire','ERA.COLONIAL',1799,1849,'empire','year',1.0,['IN.PB','PK.PUNJAB','IN.JK'],'Ranjit Singh; last major independent power to fall.'],
  ['POL.HYDERABAD','Hyderabad (Asaf Jahi)','ERA.MUGHAL',1724,1948,'kingdom','year',1.0,['IN.TG'],'Largest princely state.'],
  ['POL.AWADH','Awadh','ERA.MUGHAL',1722,1856,'kingdom','year',1.0,['IN.UP'],'Annexed under the doctrine of lapse’s cousin, misgovernment.'],
  ['POL.BENGAL_NAWABS','Nawabs of Bengal','ERA.MUGHAL',1717,1757,'kingdom','year',1.0,['IN.WB','BD.DHAKA'],'Ends at Plassey.'],
  ['POL.CARNATIC','Nawabs of the Carnatic','ERA.MUGHAL',1690,1855,'kingdom','year',0.95,['IN.TN'],''],
  ['POL.MYSORE_WODEYAR','Mysore (Wodeyar)','ERA.MUGHAL',1399,1950,'kingdom','year',1.0,['IN.KA'],'Interrupted 1761–1799; later a model developmental state.'],
  ['POL.MYSORE_SULT','Mysore under Hyder Ali & Tipu Sultan','ERA.COLONIAL',1761,1799,'kingdom','year',1.0,['IN.KA'],'Rocket artillery, state trading monopolies, four Anglo-Mysore wars.'],
  ['POL.TRAVANCORE','Travancore','ERA.MUGHAL',1729,1949,'kingdom','year',1.0,['IN.KL'],'Early state investment in schooling and public health.'],
  ['POL.COCHIN','Cochin','ERA.MUGHAL',1500,1949,'kingdom','year',0.95,['IN.KL'],''],
  ['POL.ROHILKHAND','Rohilkhand','ERA.MUGHAL',1721,1774,'kingdom','year',0.9,['IN.UP'],''],
  ['POL.BHARATPUR','Bharatpur (Jat)','ERA.MUGHAL',1722,1949,'kingdom','year',0.9,['IN.RJ'],''],
  ['POL.MANIPUR','Manipur (Ningthouja)','ERA.MUGHAL',33,1949,'kingdom','century',0.7,['IN.MN'],'Traditional chronology begins 33 CE; reliable from c. 1400.'],

  // ---- European ----
  ['POL.PORTUGUESE','Estado da Índia (Portuguese)','ERA.MUGHAL',1505,1961,'colonial','year',1.0,['IN.GA','IN.DD'],'Goa, Daman, Diu; annexed by India in 1961.'],
  ['POL.DUTCH_IN','Dutch India','ERA.MUGHAL',1605,1825,'colonial','year',0.95,['IN.KL','IN.TN'],''],
  ['POL.DANISH_IN','Danish India','ERA.MUGHAL',1620,1845,'colonial','year',0.9,['IN.TN','IN.WB'],'Tranquebar, Serampore.'],
  ['POL.FRENCH_IN','French India','ERA.MUGHAL',1668,1954,'colonial','year',1.0,['IN.PY','IN.TN'],'Pondicherry, Chandernagore, Mahe, Yanam, Karaikal.'],
  ['POL.EIC','English East India Company','ERA.MUGHAL',1600,1858,'company','year',1.0,['IN.WB','IN.TN','IN.MH'],'Territorial from the 1765 Diwani of Bengal.'],

  // ---- colonial ----
  ['POL.BRITISH_RAJ','British Raj','ERA.COLONIAL',1858,1947,'colonial','year',1.0,['IN.DL','IN.WB'],'Crown rule. Directly administered provinces plus ~565 princely states under paramountcy.'],
  ['POL.PRES_BENGAL','Bengal Presidency','ERA.COLONIAL',1765,1947,'province','year',1.0,['IN.WB','IN.BR','IN.OD'],'Permanent Settlement, 1793.'],
  ['POL.PRES_MADRAS','Madras Presidency','ERA.COLONIAL',1652,1947,'province','year',1.0,['IN.TN','IN.AP','IN.KL'],'Ryotwari settlement.'],
  ['POL.PRES_BOMBAY','Bombay Presidency','ERA.COLONIAL',1618,1947,'province','year',1.0,['IN.MH','IN.GJ','IN.KA'],'Ryotwari; cotton and the mill economy.'],
  ['POL.NWP','North-Western Provinces & Oudh','ERA.COLONIAL',1836,1947,'province','year',1.0,['IN.UP'],'Mahalwari settlement.'],
  ['POL.PUNJAB_PROV','Punjab Province','ERA.COLONIAL',1849,1947,'province','year',1.0,['IN.PB','PK.PUNJAB','IN.HR'],'Canal colonies from the 1880s.'],
  ['POL.KASHMIR_STATE','Jammu & Kashmir (Dogra)','ERA.COLONIAL',1846,1947,'kingdom','year',1.0,['IN.JK','IN.LA'],'Treaty of Amritsar.'],

  // ---- republic ----
  ['POL.DOMINION_IN','Dominion of India','ERA.REPUBLIC',1947,1950,'dominion','year',1.0,['IN.DL'],'Transition; integration of the princely states.'],
  ['POL.INDIA','Republic of India','ERA.REPUBLIC',1950,null,'federal','year',1.0,['IN.DL'],'States Reorganisation 1956; liberalisation 1991.'],
  ['POL.PAKISTAN','Pakistan','ERA.REPUBLIC',1947,null,'federal','year',1.0,['PK.ISLAMABAD'],'Included for boundary and trade context.'],
  ['POL.BANGLADESH','Bangladesh','ERA.REPUBLIC',1971,null,'federal','year',1.0,['BD.DHAKA'],'Included for boundary and trade context.'],
];

// who ruled who: [superior, subordinate, kind, from, to, confidence, note]
// kinds: conquest | annexation | tributary | vassal | suzerainty | paramountcy | protectorate | succession
const R = [
  ['POL.ACHAEMENID','POL.GANDHARA','annexation',-518,-330,0.8,'Gandara and Hindush become satrapies.'],
  ['POL.HARYANKA','POL.ANGA','annexation',-530,-413,0.75,'Bimbisara annexes Anga.'],
  ['POL.HARYANKA','POL.VAJJI','conquest',-468,-413,0.7,'Ajatashatru after a long war.'],
  ['POL.HARYANKA','POL.KOSALA','annexation',-362,-345,0.65,'Absorbed into Magadha.'],
  ['POL.SHISHUNAGA','POL.AVANTI','annexation',-400,-345,0.65,''],
  ['POL.MAURYA','POL.NANDA','succession',-322,-322,0.9,'Chandragupta overthrows the Nandas.'],
  ['POL.MAURYA','POL.SELEUCID','tributary',-303,-303,0.7,'Territorial cession westward after the treaty.'],
  ['POL.MAURYA','POL.KALINGA','conquest',-261,-185,0.9,'The Kalinga war; Ashoka’s thirteenth rock edict.'],
  ['POL.SHUNGA','POL.MAURYA','succession',-185,-185,0.85,'Pushyamitra’s coup.'],
  ['POL.KUSHAN','POL.INDO_PARTHIAN','conquest',60,226,0.7,''],
  ['POL.GUPTA','POL.WESTERN_SATRAPS','conquest',405,405,0.85,'Chandragupta II annexes Gujarat.'],
  ['POL.VARDHANA','POL.MAUKHARI','succession',606,647,0.8,'Harsha unites Thanesar and Kannauj.'],
  ['POL.CHALUKYA_BADAMI','POL.VARDHANA','tributary',618,647,0.6,'Pulakeshin II halts Harsha; no submission either way.'],
  ['POL.RASHTRAKUTA','POL.CHALUKYA_BADAMI','succession',753,753,0.85,''],
  ['POL.CHALUKYA_W','POL.RASHTRAKUTA','succession',973,973,0.85,''],
  ['POL.CHOLA','POL.PANDYA_EARLY','conquest',910,1190,0.85,'Pandya country under Chola overlordship.'],
  ['POL.CHOLA','POL.CHERA_PERUMAL','suzerainty',1000,1102,0.7,''],
  ['POL.GHAZNAVID','POL.SHAHI','conquest',1026,1186,0.9,''],
  ['POL.GHURID','POL.GHAZNAVID','succession',1186,1186,0.9,''],
  ['POL.DELHI_MAMLUK','POL.GHURID','succession',1206,1206,0.95,'Qutb-ud-din Aibak.'],
  ['POL.DELHI_KHALJI','POL.YADAVA','tributary',1296,1317,0.9,'Devagiri pays tribute, then is annexed.'],
  ['POL.DELHI_KHALJI','POL.KAKATIYA','tributary',1310,1323,0.9,''],
  ['POL.DELHI_TUGHLAQ','POL.KAKATIYA','annexation',1323,1347,0.9,''],
  ['POL.BAHMANI','POL.DELHI_TUGHLAQ','succession',1347,1347,0.95,'Deccan secession.'],
  ['POL.VIJAYANAGARA','POL.HOYSALA','succession',1343,1343,0.85,''],
  ['POL.MUGHAL','POL.DELHI_LODI','succession',1526,1526,1.0,'First Panipat.'],
  ['POL.SUR','POL.MUGHAL','conquest',1540,1555,0.95,'Humayun in exile.'],
  ['POL.MUGHAL','POL.SUR','succession',1556,1556,0.95,'Second Panipat.'],
  ['POL.MUGHAL','POL.AMBER','vassal',1562,1707,0.95,'Matrimonial alliance and mansab service.'],
  ['POL.MUGHAL','POL.MEWAR','tributary',1615,1707,0.85,'Submission after decades of resistance.'],
  ['POL.MUGHAL','POL.GUJARAT_SULT','annexation',1573,1707,0.95,''],
  ['POL.MUGHAL','POL.BENGAL_SULT','annexation',1576,1717,0.95,''],
  ['POL.MUGHAL','POL.AHMADNAGAR','annexation',1636,1707,0.95,''],
  ['POL.MUGHAL','POL.BIJAPUR','annexation',1686,1707,0.95,''],
  ['POL.MUGHAL','POL.GOLCONDA','annexation',1687,1707,0.95,''],
  ['POL.MUGHAL','POL.AHOM','conquest',1662,1671,0.9,'Reversed at Saraighat.'],
  ['POL.MARATHA','POL.MUGHAL','tributary',1719,1803,0.9,'Chauth and sardeshmukhi extracted across Mughal territory.'],
  ['POL.MARATHA','POL.MARATHA.SCINDIA','suzerainty',1731,1818,0.9,'Peshwa overlordship, increasingly nominal.'],
  ['POL.MARATHA','POL.MARATHA.HOLKAR','suzerainty',1731,1818,0.9,''],
  ['POL.MARATHA','POL.MARATHA.GAEKWAD','suzerainty',1721,1802,0.9,''],
  ['POL.MARATHA','POL.MARATHA.BHONSLE','suzerainty',1739,1818,0.9,''],
  ['POL.EIC','POL.BENGAL_NAWABS','protectorate',1757,1765,1.0,'Plassey; then the Diwani.'],
  ['POL.EIC','POL.MYSORE_SULT','conquest',1799,1799,1.0,'Fourth Anglo-Mysore war.'],
  ['POL.EIC','POL.MYSORE_WODEYAR','paramountcy',1799,1858,1.0,'Restored under subsidiary alliance.'],
  ['POL.EIC','POL.MARATHA.GAEKWAD','paramountcy',1802,1858,1.0,'Treaty of Bassein begins the subsidiary system in the Deccan.'],
  ['POL.EIC','POL.MARATHA','conquest',1818,1818,1.0,'Third Anglo-Maratha war; the Peshwa is pensioned.'],
  ['POL.EIC','POL.HYDERABAD','paramountcy',1798,1858,1.0,'Subsidiary alliance.'],
  ['POL.EIC','POL.SIKH_EMPIRE','annexation',1849,1858,1.0,'Second Anglo-Sikh war.'],
  ['POL.EIC','POL.AWADH','annexation',1856,1858,1.0,''],
  ['POL.EIC','POL.AHOM','annexation',1826,1858,1.0,'Treaty of Yandabo.'],
  ['POL.EIC','POL.KASHMIR_STATE','paramountcy',1846,1858,1.0,'Treaty of Amritsar.'],
  ['POL.BRITISH_RAJ','POL.EIC','succession',1858,1858,1.0,'Government of India Act 1858.'],
  ['POL.BRITISH_RAJ','POL.HYDERABAD','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.MYSORE_WODEYAR','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.TRAVANCORE','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.KASHMIR_STATE','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.MEWAR','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.MARATHA.SCINDIA','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.MARATHA.HOLKAR','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.TRIPURA','paramountcy',1858,1947,1.0,''],
  ['POL.BRITISH_RAJ','POL.MANIPUR','paramountcy',1891,1947,1.0,'After the Anglo-Manipur war.'],
  ['POL.DOMINION_IN','POL.BRITISH_RAJ','succession',1947,1947,1.0,'Indian Independence Act.'],
  ['POL.PAKISTAN','POL.BRITISH_RAJ','succession',1947,1947,1.0,'Partition.'],
  ['POL.INDIA','POL.DOMINION_IN','succession',1950,1950,1.0,'Constitution comes into force.'],
  ['POL.DOMINION_IN','POL.HYDERABAD','annexation',1948,1948,1.0,'Operation Polo.'],
  ['POL.DOMINION_IN','POL.TRAVANCORE','accession',1949,1949,1.0,''],
  ['POL.INDIA','POL.MYSORE_WODEYAR','accession',1950,1950,1.0,''],
  ['POL.INDIA','POL.PORTUGUESE','annexation',1961,1961,1.0,'Goa, Daman and Diu.'],
  ['POL.INDIA','POL.FRENCH_IN','accession',1954,1954,1.0,'De facto transfer; ratified 1962.'],
  ['POL.BANGLADESH','POL.PAKISTAN','succession',1971,1971,1.0,''],
];

const polities = P.map(([id, name, era, from, to, type, precision, confidence, core, note]) => ({
  id, name, era, from, to, type, date_precision: precision, confidence,
  core_regions: core,
  provenance: confidence >= 0.85 ? 'SOURCED' : 'DERIVED',
  note: note || undefined,
}));

const relations = R.map(([superior, subordinate, kind, from, to, confidence, note]) => ({
  superior, subordinate, kind, from, to, confidence, note: note || undefined,
}));

const eras = ERAS.map(([id, name, from, to, summary]) => ({ id, name, from, to, summary }));

// -------- validation --------
const ids = new Set(polities.map(p => p.id));
const eraIds = new Set(eras.map(e => e.id));
const errors = [];
const seen = new Set();
for (const p of polities) {
  if (seen.has(p.id)) errors.push(`duplicate id: ${p.id}`);
  seen.add(p.id);
  if (!eraIds.has(p.era)) errors.push(`${p.id}: unknown era ${p.era}`);
  if (p.to !== null && p.to < p.from) errors.push(`${p.id}: ends (${p.to}) before it starts (${p.from})`);
  // `era` is the era of ORIGIN / primary association, not a containment claim: Magadha
  // predates the Second Urbanisation and Mewar outlives the Sultanate. The real invariant
  // is that the polity's lifespan OVERLAPS its declared era.
  const era = eras.find(e => e.id === p.era);
  if (era) {
    const pTo = p.to ?? 3000, eTo = era.to ?? 3000;
    if (pTo < era.from || p.from > eTo) errors.push(`${p.id}: lifespan ${p.from}..${p.to} never overlaps era ${era.id} (${era.from}..${era.to})`);
  }
}
for (const [i, r] of relations.entries()) {
  if (!ids.has(r.superior))    errors.push(`relation ${i}: unknown superior ${r.superior}`);
  if (!ids.has(r.subordinate)) errors.push(`relation ${i}: unknown subordinate ${r.subordinate}`);
  if (r.to < r.from) errors.push(`relation ${i}: ends before it starts`);
  if (r.superior === r.subordinate) errors.push(`relation ${i}: self-rule`);
  const sup = polities.find(p => p.id === r.superior), sub = polities.find(p => p.id === r.subordinate);
  if (sup && r.from < sup.from) errors.push(`relation ${i}: ${r.superior} rules from ${r.from} but only exists from ${sup.from}`);
  if (sub && r.from < sub.from) errors.push(`relation ${i}: ${r.subordinate} ruled from ${r.from} but only exists from ${sub.from}`);
}

mkdirSync('data/polities', { recursive: true });
writeFileSync('data/polities/polities.json', JSON.stringify({
  $schema: '../../packages/schema/polity.schema.json',
  note: 'First-cut sovereignty spine, 4000 BCE to present. Negative years are BCE. Ancient entries are deliberately low-confidence; see docs/04-eras.md. NOT yet historian-reviewed.',
  generated_by: 'tools/build-polities.mjs',
  eras, polities, relations,
}, null, 2) + '\n');

// -------- report --------
const byEra = {};
for (const p of polities) (byEra[p.era] ??= []).push(p);
console.log(`polities: ${polities.length}   relations: ${relations.length}   eras: ${eras.length}\n`);
console.log('era                       span              polities  mean confidence');
console.log('-'.repeat(74));
for (const e of eras) {
  const ps = byEra[e.id] ?? [];
  const conf = ps.length ? ps.reduce((s, p) => s + p.confidence, 0) / ps.length : 0;
  const yr = n => n === null ? 'now' : n < 0 ? `${-n} BCE` : `${n} CE`;
  console.log(e.name.padEnd(26) + `${yr(e.from)} – ${yr(e.to)}`.padEnd(18) + String(ps.length).padStart(8) + conf.toFixed(2).padStart(17));
}
const kinds = {};
for (const r of relations) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
console.log('\nrule relations by kind:');
for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(14)} ${n}`);

if (errors.length) { console.error('\nVALIDATION ERRORS:'); errors.forEach(e => console.error('  ' + e)); process.exit(1); }
console.log('\nvalidation: OK');
