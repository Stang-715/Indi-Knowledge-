import type { LocaleCode } from './locales'
import { SARATHI_EN } from './sarathi.en'

type Dict = Record<string, string>

const en: Dict = {
  'app.name': 'Chowk',
  'app.tagline': 'Notices, bills and public debate — without being tracked.',

  'nav.home': 'Home',
  'nav.notices': 'Notices',
  'nav.polls': 'Polls',
  'nav.discuss': 'Discuss',
  'nav.profile': 'Profile',
  'nav.back': 'Back',
  'nav.skipToContent': 'Skip to main content',

  'action.getStarted': 'Get started',
  'action.continue': 'Continue',
  'action.understand': 'I understand',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.confirm': 'Confirm',
  'action.close': 'Close',
  'action.retry': 'Try again',
  'action.share': 'Share',
  'action.report': 'Report',
  'action.markSeen': 'Mark as seen',
  'action.seen': 'Seen',
  'action.post': 'Post',
  'action.search': 'Search',

  'onboard.welcome.title': 'A place to be told, and to answer back.',
  'onboard.welcome.body':
    'Government notices that actually reach you. Bills explained in plain words. Advisory polls that pass your view upward — and a name of your choosing to say it under.',
  'onboard.lang.title': 'Choose your language',
  'onboard.lang.body': 'You can change this at any time in Settings.',
  'onboard.verify.title': 'Verify once, then never again',
  'onboard.verify.body':
    'We check with the government ID service that you are a citizen. We keep a one-way hash of your ID number and nothing else — not the number, not your name, not a scan.',
  'onboard.verify.cta': 'Verify identity',
  'onboard.verify.why': 'Why we ask',
  'onboard.verify.failed': 'That did not verify',
  'onboard.verify.failedBody':
    'Nothing was stored. Check the number and try again, or read why this step exists.',
  'onboard.locality.title': 'Where should notices come from?',
  'onboard.locality.body':
    'Type your ward the way you would write a postal address. The app never reads your device location — this is the only way it knows where you are, and you can change it whenever you like.',
  'onboard.locality.moves': 'I move for work',
  'onboard.locality.movesHelp':
    'Follow more than one place at once. Notices from all of them reach you, and none of them is treated as your "real" home.',
  'onboard.pseudonym.title': 'Pick the name you will speak under',
  'onboard.pseudonym.body':
    'Everything you post or vote on appears under this name. It is stored apart from your verified identity, and nothing in this system can join the two back together.',
  'onboard.pseudonym.suggest': 'Suggest another',
  'onboard.privacy.title': 'What we do not collect',
  'onboard.privacy.collected': 'What we do keep',
  'onboard.a11y.title': 'Set up how it reads',
  'onboard.a11y.body': 'All of this is changeable later, in Profile.',

  'home.greeting': 'Ask me anything',
  'home.charName': 'Sarathi',
  'home.charRole': 'your guide to this platform',
  'home.inputLabel': 'Ask Sarathi a question',
  'home.placeholder': 'Ask Sarathi anything…',
  'home.send': 'Ask',
  'home.listen': 'Read answers aloud',
  'home.suggestions': 'Try asking',

  'feed.notices': 'Notices',
  'feed.polls': 'Polls',
  'feed.discussions': 'Discussions',
  'feed.empty': 'Nothing here yet for the localities you follow.',

  'notice.verifiedSource': 'Verified source',
  'notice.verifiedExplain':
    'Posted from an institutional account secured with multi-factor login. If a notice reaches you any other way, it did not come from here.',
  'notice.reportFake': 'Report as fake',
  'notice.retracted': 'Retracted',
  'notice.retractedBody': 'This notice was withdrawn by the issuing office. It is kept visible rather than deleted.',
  'notice.reach': 'Marked seen by {n} people',
  'notice.reachExplain': 'A count only. No government account can see whether you personally opened this.',
  'notice.archive': 'Archive',

  'poll.advisory': 'Advisory poll — not a legal vote',
  'poll.advisoryBody':
    'This measures public opinion and passes it to policymakers. It does not elect anyone, does not change the law by itself, and does not replace the Election Commission or the EVM system.',
  'poll.howItWorks': 'How this poll works',
  'poll.readFull': 'Read the full bill text',
  'poll.summary': 'In plain words',
  'poll.closesIn': 'Closes in {t}',
  'poll.closed': 'Closed',
  'poll.yourChoice': 'Your choice',
  'poll.confirm': 'Confirm vote',
  'poll.confirmBody': 'Your choice is recorded under your pseudonym, and counted into the total.',
  'poll.change': 'Change my vote',
  'poll.changeWindow': 'You can change this until {t}.',
  'poll.resultsLocked': 'Results open after you vote',
  'poll.resultsLockedBody':
    'Held back so that what others chose does not steer what you choose.',
  'poll.results': 'Results',
  'poll.coverage': 'Who this represents',
  'poll.needVerify': 'Verify your identity to vote',
  'poll.coverageOf': '{n} answered — {pct}% of the people this poll claims to speak for',
  'poll.minorReadOnly': 'Reading only. Answering begins at eighteen.',
  'poll.consentNeeded': 'You have not agreed to your answers being recorded. You can change that in Privacy.',

  'discuss.postOpinion': 'Post an opinion',
  'discuss.stance': 'Your position',
  'discuss.stance.support': 'Support',
  'discuss.stance.oppose': 'Oppose',
  'discuss.stance.mixed': 'Mixed',
  'discuss.stance.question': 'Question',
  'discuss.agree': 'Agree',
  'discuss.disagree': 'Disagree',
  'discuss.balanced': 'Balanced view',
  'discuss.balancedOn': 'Showing a spread of positions, not the most popular ones.',
  'discuss.rateLimited': 'You have posted several times this hour. You can post again {t}.',
  'discuss.charsLeft': '{n} characters left',
  'discuss.removed': 'Removed by moderation',
  'common.you': 'You',

  'sort.balanced': 'Balanced',
  'sort.recent': 'Newest',
  'sort.discussed': 'Most discussed',

  'profile.verification': 'Verification status',
  'profile.verified': 'Verified citizen',
  'profile.unverified': 'Not verified',
  'profile.pseudonym': 'Pseudonym',
  'profile.changePseudonym': 'Change pseudonym',
  'profile.cooldown': 'Changeable again on {d}',
  'profile.cooldownWhy':
    'A waiting period stops a name being discarded to escape a bad argument, or churned to fake a crowd.',
  'profile.notifications': 'Notifications',
  'profile.locality': 'Localities',
  'profile.privacy': 'Data & privacy',
  'profile.help': 'How this works',
  'profile.logout': 'Log out',
  'profile.dataOnMe': 'What data do you have on me',
  'profile.deleteAccount': 'Delete my account',
  'profile.deleteBody':
    'Your pseudonym, your settings and the link to your verification are erased from this device. Posts you made are removed from public view; counts you contributed to remain in past aggregates, because they can no longer be traced to you.',

  'report.title': 'Report',
  'report.reason': 'What is wrong with it?',
  'report.note': 'Anything else the moderators should know',
  'report.sent': 'Report sent',
  'report.sentBody': 'It goes to a human moderator. We do not store who reported it.',
  'report.reason.fake-notice': 'It claims to be official and is not',
  'report.reason.abuse': 'Abuse or harassment',
  'report.reason.spam': 'Spam',
  'report.reason.coordinated': 'Looks coordinated or automated',
  'report.reason.misinformation': 'Factually false',
  'report.reason.other': 'Something else',

  'gov.title': 'Government Portal',
  'gov.login': 'Institutional sign-in',
  'gov.mfa': 'Multi-factor code',
  'gov.role': 'Role',
  'gov.separate':
    'This is a separate surface. A citizen account has no route into it, and an account here cannot post, vote or comment as a citizen.',

  'oversight.title': 'Oversight',
  'oversight.subtitle': 'Run independently of both the platform and the government.',

  'common.aggregateOnly': 'Aggregate only',
  'common.suppressed': '{n} small groups hidden to protect anonymity',
  'common.notCollected': 'Not collected',
  'common.principle': 'Architectural constraint',
  /* ---------------------------------------------------------------- *
   * Chowk shell — surfaces, navigation, contextual action
   * ---------------------------------------------------------------- */
  'shell.skip': 'Skip to content',
  'surface.sarathi': 'Sarathi',
  'surface.bharat': 'Bharat',
  'surface.bills': 'Bills',
  'surface.works': 'Works',
  'action.sarathi': 'Ask Sarathi something',
  'action.bharat': 'List your store',
  'action.bills': 'Go to an open vote',
  'action.works': 'File a work',

  /* ------------------------- 1.x Sarathi surface -------------------- */
  'sar.hearing': 'Hearing…',
  'sar.mic.start': 'Ask by voice',
  'sar.mic.stop': 'Stop listening',
  'sar.mic.denied':
    'The microphone is blocked for this app. Your browser’s site settings can allow it — or just type, which works exactly as well.',
  'sar.settings': 'Voice & language',
  'sar.offline.title': 'No connection — Sarathi still works.',
  'sar.offline.body':
    'He runs on your phone. New notices and bills will arrive when you are back on.',
  'sar.island.offline': 'No connection',
  'sar.island.offlineValue': 'Sarathi is fine',
  'sar.island.offlineEyebrow': 'Offline',
  'sar.island.offlineTitle': 'Sarathi still works',
  'sar.island.whatElse': 'What else works',
  'sar.dismiss': 'Dismiss',

  /* --------------------------- 1.5 settings ------------------------- */
  'set.language': 'Language',
  'set.languageHint':
    'Sarathi speaks and listens in this language. Where a phrase has not been translated yet you will see the English rather than a broken placeholder.',
  'set.speech': 'Speech',
  'set.readAloud': 'Read answers aloud',
  'set.readAloudOn': 'Uses your device’s own voice. Nothing is sent anywhere.',
  'set.readAloudOff': 'This device has no speech voices available.',
  'set.micNote':
    'Asking by voice uses your browser’s speech engine, which on most desktops means the audio is sent to that vendor to be transcribed. Nothing is stored by this app either way — and typing does exactly the same job.',
  'set.micNone':
    'This device has no speech recognition, so the microphone button is hidden. Typing works exactly as well.',
  'set.reading': 'Reading',
  'set.textSize': 'Text size',
  'set.scale.standard': 'Standard',
  'set.reduceMotion': 'Reduce motion',
  'set.reduceMotionHint': 'Stops his blinking, sway and the drifting background.',
  'set.contrast': 'High contrast',
  'set.contrastHint': 'Black on white, hard borders, no glass and no gradient.',
  'set.offlineIf': 'If you go offline',
  'set.offlineNow': 'You are offline',
  'set.translationPartial': 'Partly translated — the rest appears in English',
  'set.translationPending': 'Not translated yet — this appears in English',

  /* ------------------------------ 1.6 offline ----------------------- */
  'off.sarathi': 'Talking to Sarathi',
  'off.sarathiWhy': 'He runs on your phone, not on a server',
  'off.notices': 'Notices you have opened',
  'off.noticesWhy': 'Kept on the device once read',
  'off.settings': 'Your settings and language',
  'off.settingsWhy': 'Never needed a connection',
  'off.new': 'New notices and bills',
  'off.newWhy': 'Arrive when you are back on',
  'off.vote': 'Casting a vote',
  'off.voteWhy': 'Held until there is a connection',

  /* ------------------------- surfaces not yet built ----------------- */
  'stub.inDevelopment': 'In development',
  'stub.alreadyWorking': 'Already working',
  'stub.planned': 'Planned',
  'stub.notBuilt': 'Not built yet',

  /* ---------------------------- screen states ----------------------- */
  /* ------------------------------ Surface 3 ------------------------------ */

  'bills.title': 'Bills',
  'bills.tagline': 'What is being legislated, and what you think of it.',
  'bills.section.pipeline': 'Pipeline',
  'bills.section.constitution': 'Constitution',
  'bills.section.constituency': 'My seat',
  'bills.search': 'Search bills',
  'bills.searchHint': 'Title, ministry or citation.',
  'bills.noResults': 'No bill matches that.',

  'bills.stage.introduced': 'Introduced',
  'bills.stage.committee': 'In committee',
  'bills.stage.lower-passed': 'Passed by the Lok Sabha',
  'bills.stage.upper-passed': 'Passed by the Rajya Sabha',
  'bills.stage.assented': 'Assented',
  'bills.stage.lapsed': 'Lapsed',
  'bills.stage.withdrawn': 'Withdrawn',
  'bills.stage.none': 'Nothing at this stage.',
  'bills.ended': 'Bills that did not become law',
  'bills.endedMeta': 'Lapsed on dissolution, or withdrawn',

  'bills.house.lok-sabha': 'Lok Sabha',
  'bills.house.rajya-sabha': 'Rajya Sabha',
  'bills.house.both': 'Both Houses',

  'bills.prov.official': 'From the official record',
  'bills.prov.partial': 'Partly readable',
  'bills.prov.unreadable': 'Could not be read',
  'bills.prov.sample': 'Sample record — invented for this build',
  'bills.prov.partialBody':
    'Part of this bill could not be read from the source. What is shown below was read; anything missing is in the original.',
  'bills.prov.unreadableBody':
    'The source did not return anything this app could read. Rather than show you something that might be wrong, here is the original.',
  'bills.prov.sampleBody':
    'This is not a real bill. It is written to exercise the surface end to end. Real bills carry the source they came from and the time it was read.',
  'bills.source': 'Open the original',
  'bills.readAt': 'Read {n} days ago',
  'bills.readToday': 'Read today',

  'bills.summary': 'In plain words',
  'bills.noSummary': 'Nobody has written a plain summary of this bill yet.',
  'bills.history': 'What has happened so far',
  'bills.clauses': 'Clause by clause',
  'bills.clausesNone': 'The clauses of this bill are not available here.',
  'bills.disputed': 'Where the argument is',
  'bills.disputedTag': 'Disputed',
  'bills.asDrafted': 'As drafted',
  'bills.inPlain': 'What it does',
  'bills.amends': 'Changes',
  'bills.viewOn': 'Your view on this bill',
  'bills.debate': 'Read the debate',
  'bills.noPoll': 'No advisory poll is open on this bill.',

  'const.title': 'The Constitution',
  'const.asOf': 'As it stood on {d}',
  'const.showing': 'Showing {n} of {total}',
  'const.tab.parts': 'Parts',
  'const.tab.articles': 'Articles',
  'const.tab.schedules': 'Schedules',
  'const.tab.amendments': 'Amendments',
  'const.search': 'Search the Constitution',
  'const.searchHint': 'Article number, a Part, a Schedule, or a phrase.',
  'const.gistNote':
    'These are summaries in plain words, never the text itself. The text is one tap away and it is the text that is the law.',
  'const.part': 'Part {p}',
  'const.articles': 'Articles {r}',

  'seat.title': 'Your constituency',
  'seat.find': 'Find your constituency',
  'seat.findHint': 'Type the name of a constituency, a district or a state.',
  'seat.suggested': 'From the localities you stated',
  'seat.noStated': 'You have not stated a locality yet. Search for your constituency instead.',
  'seat.noMatch': 'No constituency matches that.',
  'seat.rep': 'Who represents this seat',
  'seat.since': 'Holding the seat since {d}',
  'seat.record': 'How they voted',
  'seat.recordNote':
    'Most business in both Houses passes on a voice vote with no division called, so there is no individual record to publish. Those show as no recorded vote — not as an absence.',
  'seat.vote.for': 'For',
  'seat.vote.against': 'Against',
  'seat.vote.abstained': 'Abstained',
  'seat.vote.absent': 'Absent',
  'seat.vote.not-recorded': 'No recorded vote',
  'seat.division': 'Division {n}',
  'seat.noLocation':
    'Nothing here reads where you are. A constituency is found by asking you, or from a locality you typed into settings — and it can be wrong, which is why you can change it.',
  'seat.change': 'Choose a different seat',

  'debate.title': 'Debate',
  'debate.balanced': 'You are seeing disagreement first, not the loudest voice.',
  'debate.empty': 'Nobody has posted here yet.',

  'state.empty': 'Nothing here yet',
  'state.loading': 'Loading',
  'state.error': 'That did not load',
  'state.errorBody': 'Something went wrong fetching this. It is not your connection.',
  'state.retry': 'Try again',
  'state.stale': 'Showing what was saved',
  'state.staleBody': 'You are offline, so this may have changed since you last had a connection.',
  /* ================================================================== *
   * DPDP consent notice.
   *
   * This is the text the Act regulates, so it is written to the standard
   * the Rules set: clear and plain language, the data itemised, the purpose
   * for each, how to exercise rights, and how to complain to the Board.
   * Every purpose states what refusing it costs, because a cost discovered
   * afterwards is not a free choice.
   * ================================================================== */
  'consent.title': 'What Chowk keeps, and what you agree to',
  'consent.intro':
    'Each item below is a separate decision. You can refuse any of them and still use the app — where refusing costs you something, it says so on the item itself. You can change any of these later, in the same place, as easily as you set them here.',
  'consent.itemised': 'Decide each one',
  'consent.dataLabel': 'What is stored',
  'consent.purposeLabel': 'What it is for',
  'consent.costLabel': 'If you refuse',
  'consent.noCost': 'Nothing changes for you.',
  'consent.necessary': 'Needed for the main thing this app does',
  'consent.seenByGov': 'Visible publicly under your pseudonym',
  'consent.notSeenByGov': 'Never seen by a government account',
  'consent.grant': 'Agree',
  'consent.refuse': 'Refuse',
  'consent.acceptAll': 'Agree to all of it',
  'consent.refuseAll': 'Refuse all of it',
  'consent.continue': 'Continue',
  'consent.mustDecide': 'Decide each item above to continue. Refusing is a valid answer.',
  'consent.version': 'Notice version {v}, read in {lang}',
  'consent.changed':
    'What Chowk does with your data has changed since you last agreed, so the notice is being shown again. Your previous answers are not carried over.',
  'consent.receipt': 'Save a receipt of these decisions',
  'consent.receiptSaved': 'Receipt copied. It lists your decisions, not your data.',

  'consent.eligibility.data': 'A one-way hash of your ID number, and the fact that verification succeeded.',
  'consent.eligibility.purpose': 'So that one person counts once in an advisory poll. Used at sign-up and never again.',
  'consent.eligibility.cost': 'You can read everything, but not vote in advisory polls.',
  'consent.pseudonym.data': 'The name you chose to speak under.',
  'consent.pseudonym.purpose': 'So you can post and vote without your real name being involved.',
  'consent.pseudonym.cost': 'You can read everything, but not post or vote.',
  'consent.locality.data': 'The wards or districts you typed in.',
  'consent.locality.purpose': 'To decide which notices reach you. Typed by you, never read from your device.',
  'consent.locality.cost': 'Notices from everywhere reach you, unfiltered.',
  'consent.poll.data': 'Which option you chose, stored under your pseudonym.',
  'consent.poll.purpose': 'Counted into an aggregate that is passed to policymakers. Your individual answer never leaves.',
  'consent.poll.cost': 'You can read results but not add to them.',
  'consent.speech.data': 'Your posts and your agree or disagree reactions, under your pseudonym.',
  'consent.speech.purpose': 'Shown publicly so other people can read and reply to them.',
  'consent.speech.cost': 'You can read discussions but not take part in them.',
  'consent.reach.data': 'That a notice was marked as seen. A number, never a name.',
  'consent.reach.purpose': 'So an office can tell whether a notice actually reached people.',
  'consent.reach.cost': 'Nothing you will notice. The count is one lower.',
  'consent.settings.data': 'Your language, text size, contrast and motion choices.',
  'consent.settings.purpose': 'To draw the app the way you set it. Kept on your device.',
  'consent.settings.cost': 'The app returns to its defaults every time you open it.',

  /* ---------------------- rights, DPDP ss 11 to 14 ------------------ */
  'rights.title': 'Your rights over this data',
  'rights.intro':
    'These four rights are yours under the Digital Personal Data Protection Act. Each one is exercisable here rather than by writing to somebody.',
  'rights.access': 'See everything held about you',
  'rights.accessNote':
    'A summary of what is stored, what is being done with it, and who else has it. Read from the actual store, not from a list somebody typed.',
  'rights.accessOpen': 'Show it',
  'rights.export': 'Save a copy',
  'rights.exported': 'Copied. Paste it anywhere you like.',
  'rights.correct': 'Correct or complete it',
  'rights.correctNote':
    'Your pseudonym, your localities and your settings are all editable wherever they are shown. Nothing else stored here is a fact about you that could be wrong.',
  'rights.erase': 'Erase everything',
  'rights.eraseNote':
    'Immediate, not a request — there is nowhere else for it to travel to. Counts you already contributed to stay in past aggregates, because nothing in them is traceable to you.',
  'rights.grievance': 'Raise a grievance',
  'rights.grievanceNote':
    'If something here is wrong or an answer does not satisfy you, say so. You will get a reply within {days} days.',
  'rights.grievanceSubject': 'What is this about?',
  'rights.grievanceDetail': 'What happened?',
  'rights.grievanceSend': 'Send it',
  'rights.grievanceSent': 'Raised. You can see it and its due date below.',
  'rights.grievanceOpen': 'Awaiting an answer',
  'rights.grievanceDue': 'Due by {date}',
  'rights.grievanceNone': 'You have not raised anything.',
  'rights.nominate': 'Name someone to act for you',
  'rights.nominateNote':
    'A nominee can exercise every right on this page if you die or cannot act. This is stored on your device and shared with nobody.',
  'rights.nomineeName': 'Their name',
  'rights.nomineeRelation': 'Who they are to you',
  'rights.nomineeContact': 'How to reach them',
  'rights.nomineeSave': 'Save nominee',
  'rights.nomineeNone': 'Nobody nominated.',
  'rights.nomineeClear': 'Remove nominee',
  'rights.officer': 'Data Protection Officer',
  'rights.officerPending':
    'Not yet appointed. This app is pre-release and has no operating entity registered — rather than print an address that would swallow complaints, it says so.',
  'rights.board':
    'If an answer here does not satisfy you, you may complain to the Data Protection Board of India.',
  'rights.processors': 'Who else has it',
  'rights.processorsNone':
    'Nobody. There are no processors, and nothing has been shared with another party. Aggregate counts leave this app; individual answers do not.',
  'rights.notExist': 'What does not exist',
  'rights.notExistBody':
    'There is no record linking your verified identity to your pseudonym. No location has ever been read. Nobody holds a second copy of any of this.',

  /* ------------------------------ age gate -------------------------- */
  'age.minorTitle': 'You can read everything here',
  'age.minorBody':
    'Advisory polling stands in for the franchise, so taking part starts at eighteen — and the law is firm that under-eighteens must not be profiled at all. So Chowk asks nothing of you and stores nothing about you beyond your settings. Everything on every screen is yours to read.',
  'age.minorBadge': 'Reading only',
  'age.unknownNote':
    'The verification service did not return an age, and an unknown answer is treated the same as under-eighteen — the safe reading of a missing signal is the one that profiles nobody.',
}

/**
 * Partial translations. Anything missing falls through to English rather than
 * showing a key — a half-translated screen is usable, a screen of dotted
 * identifiers is not.
 */
const hi: Dict = {
  'app.name': 'नागरिक संवाद',
  'app.tagline': 'सूचनाएँ, विधेयक और सार्वजनिक बहस — बिना निगरानी के।',
  'nav.home': 'मुख्य',
  'nav.notices': 'सूचनाएँ',
  'nav.polls': 'मतदान',
  'nav.discuss': 'चर्चा',
  'nav.profile': 'प्रोफ़ाइल',
  'action.getStarted': 'शुरू करें',
  'action.continue': 'आगे बढ़ें',
  'action.understand': 'मैं समझ गया',
  'onboard.lang.title': 'अपनी भाषा चुनें',
  'poll.advisory': 'परामर्शी मतदान — यह कानूनी वोट नहीं है',
  'home.greeting': 'मुझसे कुछ भी पूछें',
  'home.charRole': 'इस मंच पर आपका मार्गदर्शक',
  'discuss.balanced': 'संतुलित दृश्य',
}

const bn: Dict = {
  'app.name': 'নাগরিক সংলাপ',
  'app.tagline': 'বিজ্ঞপ্তি, বিল এবং জনবিতর্ক — নজরদারি ছাড়াই।',
  'nav.home': 'হোম',
  'nav.notices': 'বিজ্ঞপ্তি',
  'nav.polls': 'ভোট',
  'nav.discuss': 'আলোচনা',
  'nav.profile': 'প্রোফাইল',
  'action.getStarted': 'শুরু করুন',
  'onboard.lang.title': 'আপনার ভাষা বেছে নিন',
  'poll.advisory': 'পরামর্শমূলক ভোট — আইনি ভোট নয়',
  'home.greeting': 'আমাকে যা খুশি জিজ্ঞাসা করুন',
}

const ta: Dict = {
  'app.name': 'குடிமை உரையாடல்',
  'app.tagline': 'அறிவிப்புகள், மசோதாக்கள், பொது விவாதம் — கண்காணிப்பு இல்லாமல்.',
  'nav.home': 'முகப்பு',
  'nav.notices': 'அறிவிப்புகள்',
  'nav.polls': 'வாக்கெடுப்பு',
  'nav.discuss': 'விவாதம்',
  'nav.profile': 'சுயவிவரம்',
  'action.getStarted': 'தொடங்கு',
  'onboard.lang.title': 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
  'poll.advisory': 'ஆலோசனை வாக்கெடுப்பு — சட்டப்பூர்வ வாக்கு அல்ல',
  'home.greeting': 'என்னிடம் எதையும் கேளுங்கள்',
}

const mr: Dict = {
  'app.name': 'नागरी संवाद',
  'nav.home': 'मुख्यपृष्ठ',
  'nav.notices': 'सूचना',
  'nav.polls': 'मतदान',
  'nav.discuss': 'चर्चा',
  'nav.profile': 'प्रोफाइल',
  'action.getStarted': 'सुरू करा',
  'onboard.lang.title': 'तुमची भाषा निवडा',
  'poll.advisory': 'सल्लागार मतदान — कायदेशीर मत नाही',
}

/**
 * Partial by design. Only English is complete; every other locale falls through
 * to it key by key, so a half-translated screen stays usable instead of showing
 * raw identifiers. LOCALES records how far each language actually is.
 */
export const DICTS: Partial<Record<LocaleCode, Dict>> & { en: Dict } = {
  // Sarathi's prose is merged in rather than inlined: it is the largest body of
  // translatable text in the app and belongs beside the rest of the catalogue.
  en: { ...en, ...SARATHI_EN },
  hi, bn, ta, mr,
}

/* BCP-47 tags now live on each entry in i18n/locales.ts, beside the script and
   the text direction they belong with. */
