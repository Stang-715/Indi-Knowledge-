import type { LocaleCode } from '../core/types'

export interface LanguageMeta {
  code: LocaleCode
  endonym: string
  english: string
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'hi', endonym: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', endonym: 'বাংলা', english: 'Bengali' },
  { code: 'ta', endonym: 'தமிழ்', english: 'Tamil' },
  { code: 'mr', endonym: 'मराठी', english: 'Marathi' },
]

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

export const DICTS: Record<LocaleCode, Dict> = { en, hi, bn, ta, mr }

/** BCP-47 tags for speech synthesis and `lang` attributes. */
export const BCP47: Record<LocaleCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
}
