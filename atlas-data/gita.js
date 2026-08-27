// data/gita.js — Bhagavad Gita, chapter cards for the game's Library
// The Gita is a public-domain text. Chapter names and verse counts follow the
// standard Gita Press (Gorakhpur) editions; English renderings are original
// prose made after the public-domain translations of K. T. Telang (Sacred
// Books of the East Vol. 8, 1882) and Edwin Arnold (The Song Celestial, 1885).
window.INDIA_DATA = window.INDIA_DATA || {};
window.INDIA_DATA.gita = {
  meta: {
    tab: "gita",
    title: "Bhagavad Gita",
    compiledOn: "2026-08-27",
    coverage: "All 18 chapters",
    primarySources: [
      "K. T. Telang, The Bhagavadgita, Sacred Books of the East Vol. 8 (Oxford, 1882; public domain)",
      "Edwin Arnold, The Song Celestial (1885; public domain, Project Gutenberg #2388)",
      "Gita Press Gorakhpur editions (chapter names and verse counts)"
    ],
    qc: { status: "pending", checkedOn: null, notes: "Summaries are original prose over the public-domain text; slokas quoted from standard editions." }
  },
  chapters: [
    {
      n: 1, verses: 47,
      name: { sa: "अर्जुनविषादयोग", translit: "Arjuna Vishada Yoga", en: "The Yoga of Arjuna's Despair" },
      summary: "Two armies of one family face each other at Kurukshetra, and Arjuna asks Krishna to drive his chariot between them. Seeing teachers, cousins and grandfathers on both sides, he is overwhelmed: what victory could be worth killing one's own people? His bow slips from his hand and he sinks down in the chariot, refusing to fight — the crisis that calls forth the whole Gita.",
      sloka: {
        ref: "1.47",
        sa: "एवमुक्त्वार्जुनः संख्ये रथोपस्थ उपाविशत् । विसृज्य सशरं चापं शोकसंविग्नमानसः ॥",
        translit: "evam uktvarjunah sankhye rathopastha upavishat, visrijya sa-sharam chapam shoka-samvigna-manasah",
        en: "Having spoken thus on the field of battle, Arjuna sank down in the chariot, casting away bow and arrow, his mind shaken with grief."
      },
      recite: "Arjuna despairs; the bow falls. The question of duty is born.",
      themes: ["doubt", "grief", "duty"]
    },
    {
      n: 2, verses: 72,
      name: { sa: "सांख्ययोग", translit: "Sankhya Yoga", en: "The Yoga of Knowledge" },
      summary: "Krishna begins the teaching: the self is never born and never dies, so the wise grieve neither for the living nor the dead. He tells Arjuna to do his duty with an even mind, giving up attachment to success and failure alike. The chapter closes with the portrait of the person of steady wisdom — calm amid pleasure and pain, like a sea unmoved by the rivers entering it.",
      sloka: {
        ref: "2.47",
        sa: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
        translit: "karmany evadhikaras te ma phaleshu kadachana, ma karma-phala-hetur bhur ma te sango 'stv akarmani",
        en: "Your right is to the work alone, never to its fruits. Do not make the fruit of action your motive, nor let yourself cling to inaction."
      },
      recite: "The soul never dies. Act; claim no fruit.",
      themes: ["equanimity", "the eternal self", "steady wisdom"]
    },
    {
      n: 3, verses: 43,
      name: { sa: "कर्मयोग", translit: "Karma Yoga", en: "The Yoga of Action" },
      summary: "If knowledge is higher than action, Arjuna asks, why act at all? Krishna answers that no one can remain without acting even for a moment, and that work done as offering, without selfish attachment, binds no one. The great ones act to hold the world together, for whatever the best do, others follow; one's own duty done imperfectly is better than another's done well.",
      sloka: {
        ref: "3.35",
        sa: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् । स्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥",
        translit: "shreyan sva-dharmo vigunah para-dharmat sv-anushthitat, sva-dharme nidhanam shreyah para-dharmo bhayavahah",
        en: "Better one's own duty, though imperfect, than the duty of another well performed. Better to die in one's own duty; the duty of another carries fear."
      },
      recite: "None can stand still. Work selflessly; your own duty is best.",
      themes: ["duty", "selfless work", "example"]
    },
    {
      n: 4, verses: 42,
      name: { sa: "ज्ञानकर्मसंन्यासयोग", translit: "Jnana Karma Sannyasa Yoga", en: "The Yoga of Knowledge and the Renunciation of Action" },
      summary: "Krishna reveals that this yoga is ancient — taught to the sun at the beginning and now restored, for whenever righteousness declines he takes birth to protect the good and re-establish dharma. He describes many kinds of sacrifice, and the highest among them is the sacrifice of knowledge. As fire turns fuel to ash, the fire of knowledge turns all karma to ash.",
      sloka: {
        ref: "4.7",
        sa: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥",
        translit: "yada yada hi dharmasya glanir bhavati bharata, abhyutthanam adharmasya tadatmanam srijamy aham",
        en: "Whenever righteousness declines, O Bharata, and unrighteousness rises up, then I bring myself forth into being."
      },
      recite: "When dharma fades, the Lord returns. Knowledge burns karma to ash.",
      themes: ["dharma restored", "knowledge as fire", "sacrifice"]
    },
    {
      n: 5, verses: 29,
      name: { sa: "कर्मसंन्यासयोग", translit: "Karma Sannyasa Yoga", en: "The Yoga of the Renunciation of Action" },
      summary: "Renouncing action and performing it selflessly both lead to freedom, Krishna says, but acting without attachment is the easier and better path. The knower works with body, mind and senses only to purify the self, untouched by what is done. Such a one, resting in the self, sees the same in a learned brahmin, a cow, an elephant, a dog — and lives in peace.",
      sloka: {
        ref: "5.10",
        sa: "ब्रह्मण्याधाय कर्माणि सङ्गं त्यक्त्वा करोति यः । लिप्यते न स पापेन पद्मपत्रमिवाम्भसा ॥",
        translit: "brahmany adhaya karmani sangam tyaktva karoti yah, lipyate na sa papena padma-patram ivambhasa",
        en: "One who acts, placing all actions in Brahman and abandoning attachment, is untouched by sin — as a lotus leaf is untouched by water."
      },
      recite: "Renounce attachment, not action — untouched, like a lotus leaf in water.",
      themes: ["detachment", "even sight", "inner peace"]
    },
    {
      n: 6, verses: 47,
      name: { sa: "आत्मसंयमयोग", translit: "Atma Samyama (Dhyana) Yoga", en: "The Yoga of Meditation" },
      summary: "Krishna teaches the discipline of meditation: a clean, steady seat, the body erect, the mind drawn again and again from its wanderings back to the self, like a lamp in a windless place. One must lift oneself by oneself, for the self is its own friend and its own enemy. Yoga is not for the one who eats or sleeps too much or too little — it is balance, and it destroys sorrow.",
      sloka: {
        ref: "6.5",
        sa: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् । आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
        translit: "uddhared atmanatmanam natmanam avasadayet, atmaiva hy atmano bandhur atmaiva ripur atmanah",
        en: "Let a man raise himself by his own self; let him not lower himself. For the self alone is the friend of the self, and the self alone its enemy."
      },
      recite: "Sit steady; still the mind. The self is its own friend.",
      themes: ["self-mastery", "meditation", "balance"]
    },
    {
      n: 7, verses: 30,
      name: { sa: "ज्ञानविज्ञानयोग", translit: "Jnana Vijnana Yoga", en: "The Yoga of Knowledge and Realization" },
      summary: "Krishna describes his two natures — the eightfold material nature, and the higher living nature that upholds the world — and declares that all beings are strung on him like pearls on a thread. He is the taste in water, the light in moon and sun, the sound in air, the life in all beings. Of thousands who strive, few know him in truth; the wise soul who does, after many births, is rare indeed.",
      sloka: {
        ref: "7.19",
        sa: "बहूनां जन्मनामन्ते ज्ञानवान्मां प्रपद्यते । वासुदेवः सर्वमिति स महात्मा सुदुर्लभः ॥",
        translit: "bahunam janmanam ante jnanavan mam prapadyate, vasudevah sarvam iti sa mahatma su-durlabhah",
        en: "At the end of many births the man of knowledge comes to me, knowing that Vasudeva is all. Such a great soul is very hard to find."
      },
      recite: "All beings are pearls strung on one thread. Few know it.",
      themes: ["the divine in all", "two natures", "rare knowledge"]
    },
    {
      n: 8, verses: 28,
      name: { sa: "अक्षरब्रह्मयोग", translit: "Akshara Brahma Yoga", en: "The Yoga of the Imperishable Brahman" },
      summary: "Arjuna asks the great questions: what is Brahman, what is the self, what is karma, and what happens at death? Krishna answers that whatever one remembers at the last moment, that one becomes — therefore remember him at all times, and fight. He describes the cycles of cosmic day and night from which beings stream forth and dissolve, and the imperishable beyond them from which there is no return.",
      sloka: {
        ref: "8.7",
        sa: "तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च । मय्यर्पितमनोबुद्धिर्मामेवैष्यस्यसंशयम् ॥",
        translit: "tasmat sarveshu kaleshu mam anusmara yudhya cha, mayy arpita-mano-buddhir mam evaishyasy asamshayam",
        en: "Therefore at all times remember me, and fight. With mind and understanding set on me, you will surely come to me."
      },
      recite: "Remember the Lord at all times — even at the last breath.",
      themes: ["remembrance", "the last moment", "the imperishable"]
    },
    {
      n: 9, verses: 34,
      name: { sa: "राजविद्याराजगुह्ययोग", translit: "Raja Vidya Raja Guhya Yoga", en: "The Yoga of the Royal Knowledge and the Royal Secret" },
      summary: "Krishna shares the kingliest knowledge, the deepest secret: all beings rest in him as the great wind rests in space, yet he is not contained in them. Whatever is offered with devotion — a leaf, a flower, a fruit, water — he accepts. No devotee of his is ever lost; to those who worship with single mind, he himself carries what they lack and preserves what they have.",
      sloka: {
        ref: "9.22",
        sa: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते । तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥",
        translit: "ananyash chintayanto mam ye janah paryupasate, tesham nityabhiyuktanam yoga-kshemam vahamy aham",
        en: "To those who think of me and no other, who worship me ever steadfast, I bring what they need and guard what they have."
      },
      recite: "A leaf, a flower, water — offered with love, it is accepted.",
      themes: ["devotion", "divine care", "the open secret"]
    },
    {
      n: 10, verses: 42,
      name: { sa: "विभूतियोग", translit: "Vibhuti Yoga", en: "The Yoga of Divine Glories" },
      summary: "Arjuna asks in what forms Krishna may be contemplated, and Krishna recounts his glories: among the Vedas the Sama, among mountains Meru, among rivers the Ganga, among seasons the flower-bearing spring, among words the single syllable Om. Whatever is glorious, brilliant or mighty springs from a spark of his splendor. He supports the whole universe with a single fragment of himself.",
      sloka: {
        ref: "10.20",
        sa: "अहमात्मा गुडाकेश सर्वभूताशयस्थितः । अहमादिश्च मध्यं च भूतानामन्त एव च ॥",
        translit: "aham atma gudakesha sarva-bhutashaya-sthitah, aham adish cha madhyam cha bhutanam anta eva cha",
        en: "I am the self, O Gudakesha, seated in the heart of every being; I am the beginning, the middle, and the end of all beings."
      },
      recite: "The divine is the best of each thing: among words, Om.",
      themes: ["divine presence", "glory in all things"]
    },
    {
      n: 11, verses: 55,
      name: { sa: "विश्वरूपदर्शनयोग", translit: "Vishvarupa Darshana Yoga", en: "The Yoga of the Vision of the Universal Form" },
      summary: "Granted divine sight, Arjuna beholds the universal form: all worlds and gods in one body, blazing like a thousand suns rising at once, armies streaming into its mouths like rivers into the sea. Terrified, he begs to know who this is, and the form answers: Time, grown mighty to destroy the worlds. Arjuna trembles, asks forgiveness for past familiarity, and Krishna returns to his gentle human shape.",
      sloka: {
        ref: "11.32",
        sa: "कालोऽस्मि लोकक्षयकृत्प्रवृद्धो लोकान्समाहर्तुमिह प्रवृत्तः ।",
        translit: "kalo 'smi loka-kshaya-krit pravriddho lokan samahartum iha pravrittah",
        en: "I am Time, the destroyer of worlds, grown mighty, set forth here to gather the worlds in."
      },
      recite: "A thousand suns at once — Time itself, seen face to face.",
      themes: ["the universal form", "awe", "time"]
    },
    {
      n: 12, verses: 20,
      name: { sa: "भक्तियोग", translit: "Bhakti Yoga", en: "The Yoga of Devotion" },
      summary: "Which is better, Arjuna asks — worship of the formless imperishable, or devotion to the personal Lord? Krishna answers that both reach him, but the path of devotion is easier for embodied beings. He then describes the devotee dear to him: friendly and compassionate to all, free of possessiveness and pride, the same in honor and disgrace, content with whatever comes.",
      sloka: {
        ref: "12.13",
        sa: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च । निर्ममो निरहङ्कारः समदुःखसुखः क्षमी ॥",
        translit: "adveshta sarva-bhutanam maitrah karuna eva cha, nirmamo nirahankarah sama-duhkha-sukhah kshami",
        en: "Hating no being, friendly and compassionate, free from 'mine' and from 'I', even in pain and pleasure, forgiving —"
      },
      recite: "Hate none; befriend all. The humble devotee is dear.",
      themes: ["devotion", "compassion", "the dear devotee"]
    },
    {
      n: 13, verses: 34,
      name: { sa: "क्षेत्रक्षेत्रज्ञविभागयोग", translit: "Kshetra Kshetrajna Vibhaga Yoga", en: "The Yoga of the Field and the Knower of the Field" },
      summary: "The body is the field; the one who knows it is the knower of the field — and Krishna declares himself the knower in all fields. He lists what true knowledge is: humility, harmlessness, patience, purity, steadiness, and constant awareness of birth, death, old age and pain. The supreme is seated in all beings equally, the same in the perishing and the imperishable; who sees this, truly sees.",
      sloka: {
        ref: "13.27",
        sa: "समं सर्वेषु भूतेषु तिष्ठन्तं परमेश्वरम् । विनश्यत्स्वविनश्यन्तं यः पश्यति स पश्यति ॥",
        translit: "samam sarveshu bhuteshu tishthantam parameshvaram, vinashyatsv avinashyantam yah pashyati sa pashyati",
        en: "One who sees the supreme Lord dwelling alike in all beings, the imperishable amid the perishing — that one truly sees."
      },
      recite: "The body is the field; one knower dwells in every field.",
      themes: ["field and knower", "true knowledge", "equal vision"]
    },
    {
      n: 14, verses: 27,
      name: { sa: "गुणत्रयविभागयोग", translit: "Gunatraya Vibhaga Yoga", en: "The Yoga of the Division of the Three Gunas" },
      summary: "All of nature is woven of three strands: sattva, luminous and pure, binding through attachment to happiness and knowledge; rajas, passionate and restless, binding through attachment to action; tamas, dark and heavy, binding through sleep and delusion. Krishna describes how each rises, what each breeds, and where each carries the soul. The one who crosses beyond all three, serving with unwavering devotion, is fit for freedom.",
      sloka: {
        ref: "14.26",
        sa: "मां च योऽव्यभिचारेण भक्तियोगेन सेवते । स गुणान्समतीत्यैतान्ब्रह्मभूयाय कल्पते ॥",
        translit: "mam cha yo 'vyabhichareṇa bhakti-yogena sevate, sa gunan samatityaitan brahma-bhuyaya kalpate",
        en: "One who serves me with unswerving devotion crosses beyond these gunas and is fit to become Brahman."
      },
      recite: "Three strands weave nature — light, passion, dark. Cross all three.",
      themes: ["the three gunas", "bondage and crossing over"]
    },
    {
      n: 15, verses: 20,
      name: { sa: "पुरुषोत्तमयोग", translit: "Purushottama Yoga", en: "The Yoga of the Supreme Person" },
      summary: "The world is pictured as an ashvattha tree with roots above and branches below, its leaves the Vedic hymns; cutting it down with the axe of non-attachment, one seeks the place from which there is no return. A fragment of the Lord becomes the eternal soul in the world of the living, drawing to itself the mind and senses. Beyond the perishable and even the imperishable stands the Supreme Person who enters and upholds the three worlds.",
      sloka: {
        ref: "15.7",
        sa: "ममैवांशो जीवलोके जीवभूतः सनातनः । मनःषष्ठानीन्द्रियाणि प्रकृतिस्थानि कर्षति ॥",
        translit: "mamaivamsho jiva-loke jiva-bhutah sanatanah, manah-shashthanindriyani prakriti-sthani karshati",
        en: "A fragment of my own self, become the eternal soul in the world of the living, draws to itself the senses, with mind the sixth, that rest in nature."
      },
      recite: "The world is a tree with roots above; fell it with non-attachment.",
      themes: ["the world tree", "the soul", "the supreme person"]
    },
    {
      n: 16, verses: 24,
      name: { sa: "दैवासुरसम्पद्विभागयोग", translit: "Daivasura Sampad Vibhaga Yoga", en: "The Yoga of the Division between the Divine and the Demonic" },
      summary: "Two endowments appear among beings: the divine — fearlessness, purity, charity, gentleness, modesty, absence of malice — which leads to freedom; and the demonic — hypocrisy, arrogance, anger, harshness — which leads to bondage. Krishna names desire, anger and greed as the threefold gate of ruin, to be abandoned. Scripture is the measure of what should and should not be done.",
      sloka: {
        ref: "16.21",
        sa: "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः । कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत् ॥",
        translit: "tri-vidham narakasyedam dvaram nashanam atmanah, kamah krodhas tatha lobhas tasmad etat trayam tyajet",
        en: "Threefold is this gate of ruin, destructive of the self: desire, anger, and greed. Therefore let one abandon these three."
      },
      recite: "Desire, anger, greed — ruin's three gates. Abandon them.",
      themes: ["divine and demonic natures", "the three gates of ruin"]
    },
    {
      n: 17, verses: 28,
      name: { sa: "श्रद्धात्रयविभागयोग", translit: "Shraddhatraya Vibhaga Yoga", en: "The Yoga of the Threefold Faith" },
      summary: "Faith itself is of three kinds, following the gunas, and so are the food people love, the sacrifices they offer, the austerities they keep, and the gifts they give. A gift given simply because giving is right — at the fit place and time, to one who cannot repay — is sattvic; gifts for return or given with contempt are lesser. The chapter closes with Om Tat Sat, the threefold designation of Brahman that sanctifies all acts of sacrifice, gift and austerity.",
      sloka: {
        ref: "17.20",
        sa: "दातव्यमिति यद्दानं दीयतेऽनुपकारिणे । देशे काले च पात्रे च तद्दानं सात्त्विकं स्मृतम् ॥",
        translit: "datavyam iti yad danam diyate 'nupakarine, deshe kale cha patre cha tad danam sattvikam smritam",
        en: "A gift given because giving is right, to one who can make no return, at the fit place and time and to the worthy — that gift is called sattvic."
      },
      recite: "Faith is threefold. Give because giving is right. Om Tat Sat.",
      themes: ["faith", "giving", "austerity"]
    },
    {
      n: 18, verses: 78,
      name: { sa: "मोक्षसंन्यासयोग", translit: "Moksha Sannyasa Yoga", en: "The Yoga of Liberation through Renunciation" },
      summary: "The longest chapter gathers the whole teaching: renunciation means giving up not action but attachment to its fruit; knowledge, action, agent, understanding, firmness and happiness are each threefold by the gunas; the duties of the four orders arise from inborn nature, and by worshipping through one's own work a person attains perfection. Krishna gives his final word — abandon all dharmas and take refuge in me alone; I will free you from every sin, do not grieve. Arjuna's delusion is destroyed; he stands, resolved: I will act by your word.",
      sloka: {
        ref: "18.66",
        sa: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज । अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥",
        translit: "sarva-dharman parityajya mam ekam sharanam vraja, aham tvam sarva-papebhyo mokshayishyami ma shuchah",
        en: "Abandoning all dharmas, come to me alone for refuge. I will free you from all sins; do not grieve."
      },
      recite: "Give up attachment, not work. Take refuge; do not grieve.",
      themes: ["surrender", "freedom", "the final word"]
    }
  ]
};
