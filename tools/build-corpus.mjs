#!/usr/bin/env node
// The corpus: works, their transmission lineage, and the events that threatened them.
// This is the economic substrate of the knowledge economy (docs/05-knowledge-economy.md).
//
// A work is not a tech-tree node. It is a good with unusual physics: non-rival (telling
// you costs me nothing), excludable (only if someone still remembers), and PERISHABLE —
// palm leaf lasts roughly 300 years in this climate, so every work must be recopied or it
// dies. Upkeep, not research, is the core loop.
//
// Fields: [id, title, tradition, subject, lang, from, to, prec, conf,
//          'Attributed|kind', transmission, [derives_from], [pillars], survival, note]
// survival: 'extant' | 'partial' | 'lost' | 'recension' (original lost, adaptations survive)

import { writeFileSync, mkdirSync } from 'node:fs';

const PILLARS = {
  DESIGN:      ['Design',      'Craft and form. Pottery and bead-drilling → bronze → temple sculpture → textile design → industrial design.'],
  IT:          ['Information', 'The technology of storing and moving knowledge. Mnemonic recitation → Brahmi → palm leaf → paper → print → digital. The oldest pillar and the one that never stops mattering.'],
  STRUCTURE:   ['Structure',   'Building and engineering. Tanks and step-wells → stupas → temples → forts → canals → rail.'],
  CLASSICISM:  ['Classicism',  'Codification: turning practice into shastra. Grammar, poetics, law, mathematics, medicine, music — the disciplines themselves.'],
  NETWORKING:  ['Networking',  'Connective tissue. Guru-shishya lineages, monastic circuits, merchant guilds (shreni), pilgrimage routes, later post and telegraph.'],
  TRADE:       ['Trade',       'Exchange. Barter → grain-standard → punch-marked coin → cash economy → markets.'],
  CULTIVATION: ['Cultivation', 'Cultivation of people: schooling, apprenticeship, ordination, discipline. Distinct from agriculture — this grows minds, not grain.'],
  AGRICULTURE: ['Agriculture', 'Food. Foraging → domestication → irrigation → double-cropping → the plantation and the mill.'],
};

// Events that threatened the corpus. `kind` matters: destruction and displacement are
// different mechanics, and neglect is not an event at all but a permanent upkeep drain.
const CATASTROPHES = [
  ['CAT.PALM_LEAF_DECAY', 'Palm-leaf decay',           null, null, 'neglect',
   'Not an event — a permanent condition. Palm leaf survives roughly 300 years in Indian humidity. Every work must be recopied within that window or it is gone. This is the corpus\'s standing upkeep cost and the single most important mechanic in the game.', 1.0],
  ['CAT.HUNA', 'Alchon Huna disruption of the north-west', 470, 530, 'destruction',
   'Monastic and urban destruction in Gandhara and the Punjab; Taxila does not recover.', 0.7],
  ['CAT.SINDH_712', 'Arab conquest of Sindh',            712,  713, 'disruption',
   'Conquest and reorganisation; scholarly exchange follows as well as loss.', 0.8],
  ['CAT.GHAZNAVID', 'Ghaznavid raids',                  1000, 1027, 'destruction',
   'Repeated raids including Somnath. Al-Biruni travels in their wake and writes the finest ethnography of India by an outsider — the same era produces both.', 0.9],
  ['CAT.NALANDA_1193', 'Sack of Nalanda',               1193, 1193, 'destruction',
   'Bakhtiyar Khalji. The largest single loss in the corpus\'s history; the library reportedly burned for months. Much Indian Buddhist scholarship survives today only in Tibetan and Chinese translation — which is exactly the redundancy mechanic, working.', 0.85],
  ['CAT.VIKRAMASHILA_1193', 'Sack of Vikramashila',     1193, 1203, 'destruction',
   'Destroyed in the same campaign.', 0.8],
  ['CAT.ODANTAPURI_1193', 'Sack of Odantapuri',         1193, 1193, 'destruction',
   'Destroyed in the same campaign.', 0.8],
  ['CAT.TIMUR_1398', 'Timur\'s sack of Delhi',          1398, 1399, 'destruction',
   'Massive urban destruction; scholars deported to Samarkand — loss to India, transmission elsewhere.', 0.9],
  ['CAT.PORTUGUESE_GOA', 'Portuguese suppression in Goa and the Malabar', 1560, 1774, 'destruction',
   'The Goa Inquisition; destruction of Konkani and Hindu texts. Well documented, and comparatively little studied.', 0.75],
  ['CAT.COLONIAL_REMOVAL', 'Colonial manuscript removal', 1784, 1947, 'displacement',
   'Not burning — taking. Tens of thousands of Indian manuscripts enter European collections. The books are not destroyed; they are elsewhere. This turns the late game from rescue into repatriation.', 0.95],
  ['CAT.PARTITION_1947', 'Partition',                   1947, 1948, 'displacement',
   'Libraries and personal collections split, abandoned, burned in the violence.', 0.9],
];

// [id, title, tradition, subject, lang, from, to, prec, conf, 'Attribution|kind', transmission, derives, pillars, survival, note]
const W = [
  // ——— pre-literate: the storytelling economy exists long before writing ———
  ['WRK.ORAL_FOLK','Village story cycles','folk','story','proto-dravidian/indo-aryan',-4000,-1500,'millennium',0.3,'—|anonymous','oral',[],['IT','NETWORKING','CULTIVATION'],'recension','Procedurally generated per region. No text survives; the mechanic does. This is where the game begins and where the storyteller is first paid in grain.'],
  ['WRK.ROCK_ART','Bhimbetka rock painting tradition','folk','record','—',-8000,-1000,'millennium',0.6,'—|anonymous','both',[],['DESIGN','IT'],'extant','The oldest surviving information technology in the subcontinent.'],

  // ——— Vedic ———
  ['WRK.RIGVEDA','Rigveda','vedic','hymn','vedic sanskrit',-1500,-1200,'century',0.75,'Rishi families|school','oral',['WRK.ORAL_FOLK'],['IT','CLASSICISM','NETWORKING'],'extant','Transmitted orally with extraordinary fidelity for ~3,000 years before being written. The mnemonic schemes (padapatha, kramapatha, ghanapatha) are error-correcting codes — the finest pre-modern information technology anywhere.'],
  ['WRK.SAMAVEDA','Samaveda','vedic','music','vedic sanskrit',-1200,-1000,'century',0.7,'Rishi families|school','oral',['WRK.RIGVEDA'],['IT','CLASSICISM','DESIGN'],'extant','The root of Indian music theory.'],
  ['WRK.YAJURVEDA','Yajurveda','vedic','ritual','vedic sanskrit',-1200,-1000,'century',0.7,'Rishi families|school','oral',['WRK.RIGVEDA'],['IT','STRUCTURE'],'extant','Ritual procedure — and with it, altar geometry.'],
  ['WRK.ATHARVAVEDA','Atharvaveda','vedic','medicine','vedic sanskrit',-1200,-900,'century',0.7,'Rishi families|school','oral',[],['CLASSICISM','AGRICULTURE'],'extant','Healing, herbs, household life. The most everyday of the four.'],
  ['WRK.SHATAPATHA','Shatapatha Brahmana','vedic','ritual','vedic sanskrit',-900,-700,'century',0.7,'—|school','oral',['WRK.YAJURVEDA'],['CLASSICISM','STRUCTURE'],'extant','Contains altar-construction geometry — applied mathematics in a ritual manual.'],
  ['WRK.BRIHADARANYAKA','Brihadaranyaka Upanishad','vedic','philosophy','sanskrit',-800,-600,'century',0.7,'Yajnavalkya|attributed','oral',['WRK.SHATAPATHA'],['CULTIVATION','CLASSICISM'],'extant','Among the oldest Upanishads; philosophy as dialogue.'],
  ['WRK.CHANDOGYA','Chandogya Upanishad','vedic','philosophy','sanskrit',-800,-600,'century',0.7,'—|attributed','oral',['WRK.SAMAVEDA'],['CULTIVATION','CLASSICISM'],'extant',''],
  ['WRK.KATHA_UP','Katha Upanishad','vedic','philosophy','sanskrit',-500,-300,'century',0.65,'—|attributed','oral',[],['CULTIVATION'],'extant','Nachiketa and Death — a story that carries a philosophy. The storytelling economy at full power.'],
  ['WRK.SHULBA','Shulba Sutras','vedic','mathematics','sanskrit',-800,-500,'century',0.7,'Baudhayana, Apastamba, Katyayana|authored','oral',['WRK.SHATAPATHA'],['STRUCTURE','CLASSICISM'],'extant','Geometry for building altars, including a statement of the Pythagorean relation.'],

  // ——— the grammar that is really an operating system ———
  ['WRK.ASHTADHYAYI','Ashtadhyayi','shastra','grammar','sanskrit',-500,-400,'century',0.85,'Panini|authored','oral',['WRK.RIGVEDA'],['IT','CLASSICISM'],'extant','3,959 rules generating a natural language, with metarules, a formal notation and ordered rule application. Roughly 2,400 years before Backus–Naur form. The single most important artefact in this corpus.'],
  ['WRK.NIRUKTA','Nirukta','shastra','lexicon','sanskrit',-600,-500,'century',0.75,'Yaska|authored','oral',[],['IT','CLASSICISM'],'extant','Etymology; predates Panini.'],
  ['WRK.CHANDAHSHASTRA','Chandahshastra','shastra','poetics','sanskrit',-300,-200,'century',0.75,'Pingala|authored','oral',[],['IT','CLASSICISM','DESIGN'],'extant','Prosody — and in enumerating metres, binary numeration, the Fibonacci sequence and a form of Pascal\'s triangle.'],
  ['WRK.MAHABHASHYA','Mahabhashya','shastra','grammar','sanskrit',-150,-150,'century',0.8,'Patanjali|authored','both',['WRK.ASHTADHYAYI'],['CLASSICISM','IT'],'extant','The commentary that made Panini teachable. Commentary as an economic act.'],

  // ——— epic ———
  ['WRK.MAHABHARATA','Mahabharata','epic','epic','sanskrit',-400,400,'century',0.75,'Vyasa|attributed','oral',['WRK.ORAL_FOLK'],['IT','NETWORKING','CULTIVATION'],'extant','~100,000 verses, grown over eight centuries. The largest single employer of storytellers in the game.'],
  ['WRK.RAMAYANA','Ramayana','epic','epic','sanskrit',-500,-100,'century',0.75,'Valmiki|attributed','oral',['WRK.ORAL_FOLK'],['IT','NETWORKING','CULTIVATION'],'extant','Retold in every language and half of Asia. The clearest case of a work whose value multiplies with derivation.'],
  ['WRK.GITA','Bhagavad Gita','epic','philosophy','sanskrit',-200,200,'century',0.75,'—|attributed','oral',['WRK.MAHABHARATA'],['CULTIVATION'],'extant','A work embedded inside a work — and eventually more copied than its host.'],

  // ——— story literature: the storytelling economy's own product line ———
  ['WRK.PANCHATANTRA','Panchatantra','story','story','sanskrit',-300,300,'century',0.7,'Vishnu Sharma|attributed','both',['WRK.ORAL_FOLK'],['IT','NETWORKING','TRADE','CULTIVATION'],'recension','Travels to Pahlavi, then Arabic as Kalila wa Dimna, then Hebrew, Latin and every European language. The Sanskrit original is lost; the world kept the copies. Redundancy, proven.'],
  ['WRK.BRIHATKATHA','Brihatkatha','story','story','paishachi',100,400,'century',0.6,'Gunadhya|authored','oral',[],['IT','NETWORKING'],'lost','**Completely lost.** Survives only through three later Sanskrit adaptations. The canonical teaching case: a work can vanish while its children live.'],
  ['WRK.KATHASARITSAGARA','Kathasaritsagara','story','story','sanskrit',1063,1081,'decade',0.9,'Somadeva|authored','manuscript',['WRK.BRIHATKATHA'],['IT','NETWORKING'],'extant','21,000 verses reconstructing a lost ocean of stories for a Kashmiri queen.'],
  ['WRK.VETALA','Vetala Panchavimshati','story','story','sanskrit',1000,1100,'century',0.8,'—|attributed','both',['WRK.BRIHATKATHA'],['IT','NETWORKING'],'extant','Twenty-five riddle-tales; a corpse that will not stop telling stories until you answer.'],
  ['WRK.HITOPADESHA','Hitopadesha','story','story','sanskrit',800,1200,'century',0.8,'Narayana|authored','manuscript',['WRK.PANCHATANTRA'],['IT','CULTIVATION'],'extant',''],
  ['WRK.JATAKA','Jataka tales','buddhist','story','pali',-300,200,'century',0.8,'—|compiled','both',['WRK.ORAL_FOLK'],['IT','NETWORKING','CULTIVATION'],'extant','547 previous-life stories; carved on stupa railings, so the story becomes architecture.'],
  ['WRK.SUKASAPTATI','Sukasaptati','story','story','sanskrit',1100,1300,'century',0.75,'—|anonymous','manuscript',[],['IT'],'extant','Seventy tales of a parrot; later reworked in Persian as the Tutinama.'],

  // ——— Buddhist and Jain ———
  ['WRK.TIPITAKA','Pali Canon (Tipitaka)','buddhist','philosophy','pali',-400,-100,'century',0.85,'—|compiled','oral',[],['IT','CULTIVATION','NETWORKING'],'extant','Oral for four centuries, first written in Sri Lanka c. 29 BCE — a deliberate act of redundancy against famine and war.'],
  ['WRK.DHAMMAPADA','Dhammapada','buddhist','philosophy','pali',-300,-200,'century',0.85,'—|compiled','both',['WRK.TIPITAKA'],['CULTIVATION'],'extant',''],
  ['WRK.MILINDAPANHA','Milindapanha','buddhist','philosophy','pali',-100,200,'century',0.8,'—|anonymous','both',[],['CULTIVATION','NETWORKING'],'extant','A Greek king and a Buddhist monk argue. Cross-cultural transmission as literature.'],
  ['WRK.MULAMADHYAMAKA','Mulamadhyamakakarika','buddhist','philosophy','sanskrit',150,250,'century',0.85,'Nagarjuna|authored','manuscript',['WRK.TIPITAKA'],['CLASSICISM','CULTIVATION'],'extant',''],
  ['WRK.ABHIDHARMAKOSHA','Abhidharmakosha','buddhist','philosophy','sanskrit',350,400,'century',0.85,'Vasubandhu|authored','manuscript',['WRK.TIPITAKA'],['CLASSICISM'],'partial','Sanskrit original lost for centuries; recovered in Tibet in 1935. Redundancy across borders, recovered after 700 years.'],
  ['WRK.VISUDDHIMAGGA','Visuddhimagga','buddhist','philosophy','pali',430,430,'decade',0.9,'Buddhaghosa|authored','manuscript',['WRK.TIPITAKA'],['CULTIVATION'],'extant',''],
  ['WRK.PRAMANAVARTTIKA','Pramanavarttika','buddhist','philosophy','sanskrit',600,660,'decade',0.85,'Dharmakirti|authored','manuscript',[],['CLASSICISM'],'partial','Logic and epistemology at Nalanda. Much survives only in Tibetan.'],
  ['WRK.TATTVARTHA','Tattvartha Sutra','jain','philosophy','sanskrit',200,400,'century',0.85,'Umaswati|authored','manuscript',[],['CLASSICISM','CULTIVATION'],'extant','Accepted by every Jain sect — a rare unifying text.'],
  ['WRK.JAIN_AGAMAS','Jain Agamas','jain','philosophy','ardhamagadhi',-300,500,'century',0.75,'—|compiled','oral',[],['IT','CULTIVATION'],'partial','Svetambara canon; the Digambaras hold the original was lost — a schism about redundancy itself.'],

  // ——— statecraft, law, medicine, arts ———
  ['WRK.ARTHASHASTRA','Arthashastra','shastra','statecraft','sanskrit',-300,300,'century',0.75,'Kautilya|attributed','manuscript',[],['STRUCTURE','TRADE','AGRICULTURE','NETWORKING'],'extant','Lost for centuries; a palm-leaf manuscript surfaced in Mysore in 1905. Taxation, espionage, mining, irrigation — and the mandala theory of graded sovereignty this game is built on.'],
  ['WRK.MANUSMRITI','Manusmriti','shastra','law','sanskrit',-200,200,'century',0.8,'—|attributed','manuscript',[],['CLASSICISM'],'extant','Enormously influential and enormously contested; Ambedkar burned a copy in 1927. The game models its influence, not its authority.'],
  ['WRK.NATYASHASTRA','Natyashastra','shastra','drama','sanskrit',-200,200,'century',0.8,'Bharata|attributed','manuscript',[],['DESIGN','CLASSICISM'],'extant','Theatre, dance, music, stagecraft and rasa theory in one treatise. The design pillar\'s foundation document.'],
  ['WRK.CHARAKA','Charaka Samhita','shastra','medicine','sanskrit',-100,200,'century',0.8,'Charaka|authored','manuscript',['WRK.ATHARVAVEDA'],['CLASSICISM','CULTIVATION'],'extant','Internal medicine; translated into Arabic and thence to Europe.'],
  ['WRK.SUSHRUTA','Sushruta Samhita','shastra','medicine','sanskrit',-600,500,'century',0.75,'Sushruta|attributed','manuscript',[],['CLASSICISM','DESIGN'],'extant','Surgery: 300 procedures, 120 instruments, and rhinoplasty. Reached Britain in 1794 and changed European plastic surgery.'],
  ['WRK.ASHTANGA','Ashtanga Hridayam','shastra','medicine','sanskrit',600,650,'decade',0.85,'Vagbhata|authored','manuscript',['WRK.CHARAKA','WRK.SUSHRUTA'],['CLASSICISM'],'extant','The synthesis that made the two older systems teachable.'],
  ['WRK.KAMASUTRA','Kamasutra','shastra','philosophy','sanskrit',200,300,'century',0.8,'Vatsyayana|authored','manuscript',[],['DESIGN','CULTIVATION'],'extant','More a manual of urbane living than its reputation suggests — the sixty-four arts are a curriculum.'],
  ['WRK.KRISHIPARASHARA','Krishi-Parashara','shastra','agronomy','sanskrit',400,900,'century',0.7,'Parashara|attributed','manuscript',[],['AGRICULTURE'],'extant','Ploughing, monsoon prediction, cattle, seed. The agriculture pillar in text form.'],
  ['WRK.VRIKSHAYURVEDA','Vrikshayurveda','shastra','agronomy','sanskrit',900,1000,'century',0.7,'Surapala|authored','manuscript',[],['AGRICULTURE','CLASSICISM'],'extant','Plant science: propagation, soil, disease. A single manuscript in the Bodleian preserved it.'],
  ['WRK.SAMARANGANA','Samarangana Sutradhara','shastra','architecture','sanskrit',1035,1055,'decade',0.85,'Bhoja|authored','manuscript',[],['STRUCTURE','DESIGN'],'extant','Architecture, town planning and mechanical devices, by a king who wrote his own treatises.'],
  ['WRK.MAYAMATA','Mayamata','shastra','architecture','sanskrit',900,1100,'century',0.8,'—|attributed','manuscript',[],['STRUCTURE','DESIGN'],'extant','South Indian temple architecture and iconometry.'],
  ['WRK.SANGITARATNAKARA','Sangita Ratnakara','shastra','music','sanskrit',1210,1247,'decade',0.9,'Sharngadeva|authored','manuscript',['WRK.SAMAVEDA'],['DESIGN','CLASSICISM'],'extant','The bridge text: both Hindustani and Carnatic traditions claim it.'],
  ['WRK.RASARATNAKARA','Rasaratnakara','shastra','metallurgy','sanskrit',700,1000,'century',0.65,'Nagarjuna (alchemical)|attributed','manuscript',[],['DESIGN','STRUCTURE'],'partial','Alchemy and metallurgy; zinc distillation at Zawar predates Europe by centuries.'],

  // ——— mathematics and astronomy ———
  ['WRK.BAKHSHALI','Bakhshali manuscript','shastra','mathematics','gandhari prakrit',224,383,'century',0.6,'—|anonymous','manuscript',[],['CLASSICISM','IT'],'extant','Contains a dot for zero. Radiocarbon dating is disputed — a live scholarly argument the game should present as one.'],
  ['WRK.ARYABHATIYA','Aryabhatiya','shastra','astronomy','sanskrit',499,499,'year',0.95,'Aryabhata|authored','manuscript',['WRK.SHULBA'],['CLASSICISM','IT','STRUCTURE'],'extant','121 verses: place-value, a sine table, π to four places, and the earth rotating on its axis.'],
  ['WRK.BRAHMASPHUTA','Brahmasphutasiddhanta','shastra','mathematics','sanskrit',628,628,'year',0.95,'Brahmagupta|authored','manuscript',['WRK.ARYABHATIYA'],['CLASSICISM','IT','TRADE'],'extant','**The first text anywhere to treat zero as a number and give rules for negatives.** Carried to Baghdad in 771 and thence to Europe. The highest-value single export in the corpus.'],
  ['WRK.GANITASARA','Ganita Sara Sangraha','jain','mathematics','sanskrit',850,850,'decade',0.9,'Mahavira|authored','manuscript',['WRK.BRAHMASPHUTA'],['CLASSICISM','TRADE'],'extant','The first Indian text purely on mathematics, without astronomy attached.'],
  ['WRK.LILAVATI','Lilavati','shastra','mathematics','sanskrit',1150,1150,'decade',0.95,'Bhaskara II|authored','manuscript',['WRK.BRAHMASPHUTA'],['CLASSICISM','CULTIVATION'],'extant','Arithmetic taught through puzzles addressed to a girl. Pedagogy as literature — a textbook that is also a story.'],
  ['WRK.SIDDHANTASHIROMANI','Siddhanta Shiromani','shastra','astronomy','sanskrit',1150,1150,'decade',0.95,'Bhaskara II|authored','manuscript',['WRK.ARYABHATIYA'],['CLASSICISM'],'extant','Contains an early statement of the derivative and of instantaneous motion.'],
  ['WRK.TANTRASANGRAHA','Tantrasangraha','shastra','astronomy','sanskrit',1501,1501,'year',0.9,'Nilakantha Somayaji|authored','manuscript',['WRK.SIDDHANTASHIROMANI'],['CLASSICISM'],'extant','Kerala school; a partially heliocentric planetary model.'],
  ['WRK.YUKTIBHASHA','Yuktibhasha','shastra','mathematics','malayalam',1530,1530,'decade',0.9,'Jyesthadeva|authored','manuscript',['WRK.TANTRASANGRAHA'],['CLASSICISM','IT'],'extant','**Infinite series for π, sine and cosine — with proofs — roughly 200 years before Newton and Leibniz.** Written in Malayalam, not Sanskrit, and largely unknown outside Kerala until the 1830s. The corpus\'s greatest failure of networking.'],

  // ——— Tamil and the southern traditions ———
  ['WRK.TOLKAPPIYAM','Tolkappiyam','tamil','grammar','tamil',-300,300,'century',0.75,'Tolkappiyar|attributed','manuscript',[],['IT','CLASSICISM'],'extant','Grammar and poetics; the oldest surviving Tamil work.'],
  ['WRK.SANGAM','Sangam anthologies','tamil','poetry','tamil',-300,300,'century',0.8,'473 poets|compiled','both',[],['DESIGN','CULTIVATION','TRADE'],'extant','2,381 poems by 473 named poets, including many women. Nearly lost; recovered from palm leaf in the 1880s by U. V. Swaminatha Iyer — a one-man rescue that is itself a playable scenario.'],
  ['WRK.TIRUKKURAL','Tirukkural','tamil','philosophy','tamil',300,500,'century',0.8,'Tiruvalluvar|authored','both',[],['CULTIVATION','TRADE','STRUCTURE'],'extant','1,330 couplets on ethics, governance and love, claimed by every Tamil tradition at once.'],
  ['WRK.SILAPPATIKARAM','Silappatikaram','tamil','epic','tamil',200,500,'century',0.8,'Ilango Adigal|attributed','manuscript',[],['DESIGN','TRADE'],'extant','A merchant\'s wife burns a city down. The great Tamil epic and a portrait of Indian Ocean trade.'],
  ['WRK.MANIMEKALAI','Manimekalai','tamil','epic','tamil',200,600,'century',0.75,'Sattanar|attributed','manuscript',['WRK.SILAPPATIKARAM'],['CULTIVATION'],'extant','Its sequel, and Buddhist.'],
  ['WRK.TEVARAM','Tevaram','bhakti','poetry','tamil',600,800,'century',0.85,'Appar, Sambandar, Sundarar|authored','both',[],['NETWORKING','CULTIVATION'],'extant','Bhakti hymns sung on pilgrimage routes — knowledge distributed by walking.'],
  ['WRK.DIVYAPRABANDHAM','Nalayira Divya Prabandham','bhakti','poetry','tamil',600,900,'century',0.85,'Twelve Alvars|compiled','both',[],['NETWORKING','CULTIVATION'],'extant','Includes Andal, one of the great women poets of any tradition.'],
  ['WRK.KAMBARAMAYANAM','Kamba Ramayanam','tamil','epic','tamil',1150,1200,'century',0.85,'Kambar|authored','manuscript',['WRK.RAMAYANA'],['DESIGN','IT'],'extant','Not a translation — a rival. Derivation as creation.'],

  // ——— kavya, history, and the courts ———
  ['WRK.SHAKUNTALA','Abhijnanashakuntalam','kavya','drama','sanskrit',380,415,'decade',0.85,'Kalidasa|authored','manuscript',['WRK.MAHABHARATA','WRK.NATYASHASTRA'],['DESIGN'],'extant','Translated by William Jones in 1789; Goethe wrote a poem about it. India\'s first global literary export of the modern era.'],
  ['WRK.MEGHADUTA','Meghaduta','kavya','poetry','sanskrit',380,415,'decade',0.85,'Kalidasa|authored','manuscript',[],['DESIGN'],'extant','A cloud carries a message across the whole subcontinent — a geography lesson disguised as a love poem.'],
  ['WRK.MRICHCHHAKATIKA','Mrichchhakatika','kavya','drama','sanskrit',200,500,'century',0.75,'Shudraka|attributed','manuscript',['WRK.NATYASHASTRA'],['DESIGN'],'extant','A merchant, a courtesan and a coup. Unusually secular and unusually funny.'],
  ['WRK.HARSHACHARITA','Harshacharita','kavya','history','sanskrit',640,650,'decade',0.9,'Banabhatta|authored','manuscript',[],['IT','NETWORKING'],'extant','A court biography — the first sustained Indian attempt at one.'],
  ['WRK.KADAMBARI','Kadambari','kavya','story','sanskrit',630,650,'decade',0.9,'Banabhatta|authored','manuscript',[],['DESIGN','IT'],'extant','Arguably the first novel in any language; left unfinished and completed by his son.'],
  ['WRK.KAVYADARSHA','Kavyadarsha','shastra','poetics','sanskrit',700,750,'century',0.85,'Dandin|authored','manuscript',['WRK.NATYASHASTRA'],['CLASSICISM','DESIGN'],'extant','Travelled to Tibet, Sri Lanka and Java — Indian literary theory as an export good.'],
  ['WRK.RAJATARANGINI','Rajatarangini','kavya','history','sanskrit',1148,1150,'decade',0.9,'Kalhana|authored','manuscript',[],['IT'],'extant','The first Indian work that is recognisably history: sources weighed, chronology argued, kings criticised.'],
  ['WRK.GITAGOVINDA','Gita Govinda','bhakti','poetry','sanskrit',1180,1200,'decade',0.9,'Jayadeva|authored','both',[],['DESIGN','NETWORKING'],'extant','Set to music everywhere it went; the most illustrated Indian text after the epics.'],

  // ——— Persianate, and the counter-narrative ———
  ['WRK.TARIKH_AL_HIND','Tarikh al-Hind','persianate','history','arabic',1030,1030,'decade',0.95,'Al-Biruni|authored','manuscript',['WRK.BRAHMASPHUTA','WRK.ARYABHATIYA'],['IT','CLASSICISM','NETWORKING'],'extant','Al-Biruni learned Sanskrit to write it, and wrote it in the same decades as the Ghaznavid raids. **The corpus records destruction and transmission happening simultaneously, because they did.**'],
  ['WRK.KHUSRAU','Amir Khusrau\'s divans','persianate','poetry','persian/hindavi',1280,1325,'decade',0.9,'Amir Khusrau|authored','manuscript',[],['DESIGN','NETWORKING'],'extant','Qawwali, the sitar\'s ancestry, and early Hindavi verse. Synthesis as a creative act.'],
  ['WRK.BABURNAMA','Baburnama','persianate','history','chagatai turkic',1526,1530,'decade',0.95,'Babur|authored','manuscript',[],['IT','AGRICULTURE'],'extant','A conqueror\'s memoir that spends more pages on melons and gardens than on battles.'],
  ['WRK.AIN_I_AKBARI','Ain-i-Akbari','persianate','statecraft','persian',1590,1595,'year',1.0,'Abu\'l-Fazl|authored','manuscript',[],['TRADE','AGRICULTURE','STRUCTURE','IT'],'extant','**The richest pre-colonial dataset that exists for the region:** subah, sarkar and pargana with assessed revenue and measured area. The anchor pour for the entire Mughal era.'],
  ['WRK.SIRR_I_AKBAR','Sirr-i-Akbar','persianate','philosophy','persian',1657,1657,'year',0.95,'Dara Shikoh|authored','manuscript',['WRK.BRIHADARANYAKA','WRK.CHANDOGYA'],['IT','NETWORKING','CULTIVATION'],'extant','Fifty Upanishads into Persian. Reaching Europe via Latin in 1801, it gave Schopenhauer the Upanishads. **Transmission through the era the game will be tempted to render only as loss.**'],
  ['WRK.PADSHAHNAMA','Padshahnama','persianate','history','persian',1636,1657,'decade',0.95,'Lahori and others|authored','manuscript',[],['IT','DESIGN'],'extant',''],

  // ——— bhakti and vernacular: knowledge leaves the elite ———
  ['WRK.BHAGAVATA','Bhagavata Purana','bhakti','story','sanskrit',800,1000,'century',0.8,'—|attributed','both',[],['NETWORKING','IT'],'extant','The engine of the bhakti movement and of a thousand painting cycles.'],
  ['WRK.VACHANAS','Vachanas of the Sharanas','bhakti','poetry','kannada',1130,1200,'century',0.85,'Basava, Akka Mahadevi, Allama|authored','both',[],['CULTIVATION','NETWORKING'],'extant','Free verse by weavers, potters and washerwomen alongside ministers. A deliberate assault on who is allowed to produce knowledge.'],
  ['WRK.KABIR','Kabir\'s dohas','bhakti','poetry','hindavi',1440,1518,'decade',0.85,'Kabir|authored','oral',[],['NETWORKING','CULTIVATION'],'extant','A weaver, transmitted orally, claimed by Hindus, Muslims and Sikhs alike.'],
  ['WRK.RAMCHARITMANAS','Ramcharitmanas','bhakti','epic','awadhi',1574,1576,'year',0.95,'Tulsidas|authored','both',['WRK.RAMAYANA'],['IT','NETWORKING'],'extant','The Ramayana in a spoken language. Recited publicly to this day — the storytelling economy still running.'],
  ['WRK.GURU_GRANTH','Guru Granth Sahib','sikh','poetry','gurmukhi/multiple',1604,1708,'year',1.0,'Sikh Gurus, and Hindu and Muslim saints|compiled','manuscript',['WRK.KABIR'],['IT','NETWORKING','CULTIVATION'],'extant','Compiled deliberately as a canon, including poets from outside the tradition — an act of curation as much as composition.'],
  ['WRK.TUKARAM','Abhangas of Tukaram','bhakti','poetry','marathi',1620,1650,'decade',0.85,'Tukaram|authored','both',[],['NETWORKING','CULTIVATION'],'extant','Tradition holds his manuscripts were thrown into the Indrayani river and resurfaced. A story about the survival of texts, told by the text.'],

  // ——— colonial and modern ———
  ['WRK.HINDSWARAJ','Hind Swaraj','modern','statecraft','gujarati',1909,1909,'year',1.0,'M. K. Gandhi|authored','print',[],['CULTIVATION','STRUCTURE'],'extant','Written in ten days on a ship; banned by the Raj on publication.'],
  ['WRK.GITANJALI','Gitanjali','modern','poetry','bengali',1910,1912,'year',1.0,'Rabindranath Tagore|authored','print',[],['DESIGN','NETWORKING'],'extant','Nobel Prize, 1913 — the first for anyone outside Europe.'],
  ['WRK.ANANDAMATH','Anandamath','modern','epic','bengali',1882,1882,'year',1.0,'Bankim Chandra Chattopadhyay|authored','print',[],['NETWORKING'],'extant','Contains Vande Mataram; also a contested text in modern politics, which the game should say rather than hide.'],
  ['WRK.ANNIHILATION','Annihilation of Caste','modern','philosophy','english',1936,1936,'year',1.0,'B. R. Ambedkar|authored','print',['WRK.MANUSMRITI'],['CULTIVATION'],'extant','An undelivered speech, self-published after the invitation was withdrawn. The most direct challenge in the corpus to the corpus itself.'],
  ['WRK.DISCOVERY','The Discovery of India','modern','history','english',1944,1946,'year',1.0,'Jawaharlal Nehru|authored','print',[],['IT','CULTIVATION'],'extant','Written in Ahmednagar Fort prison.'],
  ['WRK.CONSTITUTION','Constitution of India','modern','law','english/hindi',1946,1950,'year',1.0,'Constituent Assembly|compiled','print',['WRK.ANNIHILATION'],['STRUCTURE','CULTIVATION','NETWORKING'],'extant','The longest written constitution of any sovereign country, and the last work in the campaign. Handwritten and illuminated — a manuscript, deliberately.'],
];

// ---------- expand ----------
const pillars = Object.entries(PILLARS).map(([id, [name, arc]]) => ({ id, name, arc }));
const catastrophes = CATASTROPHES.map(([id, name, from, to, kind, note, confidence]) =>
  ({ id, name, from, to, kind, confidence, note }));

const works = W.map(([id, title, tradition, subject, language, from, to, date_precision,
                      confidence, attrib, transmission, derives_from, pillars_, survival, note]) => {
  const [attributed_to, attribution_kind] = attrib.split('|');
  return { id, title, tradition, subject, language, composed_from: from, composed_to: to,
           date_precision, confidence, attributed_to, attribution_kind, transmission,
           derives_from, pillars: pillars_, survival, note: note || undefined };
});

// ---------- validate ----------
const ids = new Set(works.map(w => w.id));
const pillarIds = new Set(Object.keys(PILLARS));
const errors = [], seen = new Set();
for (const w of works) {
  if (seen.has(w.id)) errors.push(`duplicate id: ${w.id}`);
  seen.add(w.id);
  if (w.composed_to < w.composed_from) errors.push(`${w.id}: composed_to precedes composed_from`);
  for (const d of w.derives_from) {
    if (!ids.has(d)) { errors.push(`${w.id}: derives from unknown ${d}`); continue; }
    const src = works.find(x => x.id === d);
    // A work cannot derive from something that did not yet exist when it was begun.
    if (src.composed_from > w.composed_to) errors.push(`${w.id} (to ${w.composed_to}) derives from ${d} (from ${src.composed_from}) — source postdates it`);
  }
  for (const p of w.pillars) if (!pillarIds.has(p)) errors.push(`${w.id}: unknown pillar ${p}`);
  if (!['extant','partial','lost','recension'].includes(w.survival)) errors.push(`${w.id}: bad survival ${w.survival}`);
}
// cycle check on the derivation graph
const state = new Map();
const walk = (id, path) => {
  if (state.get(id) === 'done') return;
  if (state.get(id) === 'open') { errors.push(`derivation cycle: ${[...path, id].join(' -> ')}`); return; }
  state.set(id, 'open');
  for (const d of works.find(w => w.id === id).derives_from) walk(d, [...path, id]);
  state.set(id, 'done');
};
for (const w of works) walk(w.id, []);

mkdirSync('data/corpus', { recursive: true });
writeFileSync('data/corpus/works.json', JSON.stringify({
  $schema: '../../packages/schema/work.schema.json',
  note: 'First cut of the corpus. Works are economic entities, not tech-tree nodes — see docs/05-knowledge-economy.md. Ancient dating is conventional and confidence-tagged; NOT yet reviewed by a specialist, and several entries touch texts sacred to living communities.',
  generated_by: 'tools/build-corpus.mjs',
  pillars, catastrophes, works,
}, null, 2) + '\n');

// ---------- report ----------
const f = n => n < 0 ? `${-n} BCE` : `${n} CE`;
const surv = {}, trad = {}, subj = {}, pill = {};
for (const w of works) {
  surv[w.survival] = (surv[w.survival] ?? 0) + 1;
  trad[w.tradition] = (trad[w.tradition] ?? 0) + 1;
  subj[w.subject] = (subj[w.subject] ?? 0) + 1;
  for (const p of w.pillars) pill[p] = (pill[p] ?? 0) + 1;
}
const derived = works.filter(w => w.derives_from.length).length;
const roots = works.filter(w => !w.derives_from.length).length;
console.log(`works: ${works.length}   catastrophes: ${catastrophes.length}   pillars: ${pillars.length}`);
console.log(`span: ${f(Math.min(...works.map(w => w.composed_from)))} to ${f(Math.max(...works.map(w => w.composed_to)))}`);
console.log(`derivation graph: ${roots} roots, ${derived} derived works, ${works.reduce((s,w)=>s+w.derives_from.length,0)} edges\n`);
const bar = (n, max) => '#'.repeat(Math.round(n / max * 28));
const show = (title, obj) => {
  const max = Math.max(...Object.values(obj));
  console.log(title);
  for (const [k, n] of Object.entries(obj).sort((a,b)=>b[1]-a[1]))
    console.log(`  ${k.padEnd(14)} ${String(n).padStart(3)}  ${bar(n, max)}`);
  console.log();
};
show('survival:', surv);
show('by pillar:', pill);
show('by tradition:', trad);

if (errors.length) { console.error('VALIDATION ERRORS:'); errors.forEach(e => console.error('  ' + e)); process.exit(1); }
console.log('validation: OK');
