/**
 * Sarathi's brain.
 *
 * A deterministic, offline, rule-matched conversational guide. Deliberately not
 * a language model call: this runs on a ₹4,000 phone with no connection, it
 * cannot be prompt-injected into leaking anything, and every sentence it says
 * about the platform's privacy properties is a sentence a human wrote and can
 * be held to. A generative answer that improvised on those points would be a
 * liability, not a feature.
 */

export type Mood = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'explaining'

export interface Answer {
  /** Paragraphs. Rendered one at a time, spoken one at a time. */
  say: string[]
  mood: Mood
  /** Chips offered after this answer. */
  followUps?: string[]
  /** Offer to navigate somewhere, shown as a button. */
  goto?: { label: string; to: string }
}

interface Entry {
  id: string
  /** Chip text shown to the user. */
  prompt: string
  /** Matched against the typed question, lowercased. */
  keywords: string[]
  /** Phrases that count double — distinctive rather than incidental words. */
  strong?: string[]
  answer: Answer
  /** Show this chip on the home screen's opening suggestions. */
  featured?: boolean
}

const ENTRIES: Entry[] = [
  {
    id: 'who',
    prompt: 'sar.who.prompt',
    keywords: ['who are you', 'your name', 'what are you', 'sarathi', 'about you'],
    strong: ['who are you'],
    featured: true,
    answer: {
      mood: 'happy',
      say: ['sar.who.p1', 'sar.who.p2'],
      followUps: ['what-can-you-do', 'privacy', 'advisory'],
    },
  },
  {
    id: 'what-can-you-do',
    prompt: 'sar.what-can-you-do.prompt',
    keywords: ['what can', 'what does', 'help me', 'features', 'what is this', 'how does this work', 'purpose'],
    strong: ['what can this', 'what is this app'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: ['sar.what-can-you-do.p1', 'sar.what-can-you-do.p2', 'sar.what-can-you-do.p3', 'sar.what-can-you-do.p4'],
      followUps: ['advisory', 'notices', 'pseudonym'],
    },
  },
  {
    id: 'advisory',
    prompt: 'sar.advisory.prompt',
    keywords: ['real vote', 'legal', 'binding', 'election', 'evm', 'advisory', 'does my vote count', 'replace voting'],
    strong: ['real vote', 'binding', 'advisory', 'election commission'],
    featured: true,
    answer: {
      mood: 'concerned',
      say: ['sar.advisory.p1', 'sar.advisory.p2', 'sar.advisory.p3', 'sar.advisory.p4'],
      followUps: ['polls', 'who-sees-vote', 'why-trust'],
    },
  },
  {
    id: 'privacy',
    prompt: 'sar.privacy.prompt',
    keywords: ['privacy', 'data', 'know about me', 'collect', 'track', 'surveillance', 'spy', 'watching'],
    strong: ['track me', 'know about me', 'collect', 'privacy'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: ['sar.privacy.p1', 'sar.privacy.p2', 'sar.privacy.p3'],
      followUps: ['location', 'unmask', 'delete-me'],
      goto: { label: 'Open the Privacy Centre', to: '/app/profile/privacy' },
    },
  },
  {
    id: 'location',
    prompt: 'sar.location.prompt',
    keywords: ['location', 'gps', 'where i live', 'address', 'locality', 'find me', 'geolocation'],
    strong: ['gps', 'location', 'where i live'],
    answer: {
      mood: 'explaining',
      say: ['sar.location.p1', 'sar.location.p2', 'sar.location.p3'],
      followUps: ['migrant', 'privacy'],
      goto: { label: 'Change my localities', to: '/app/profile/locality' },
    },
  },
  {
    id: 'pseudonym',
    prompt: 'sar.pseudonym.prompt',
    keywords: ['pseudonym', 'anonymous', 'anonymity', 'my name', 'username', 'nickname', 'identity'],
    strong: ['pseudonym', 'anonymous'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: ['sar.pseudonym.p1', 'sar.pseudonym.p2', 'sar.pseudonym.p3', 'sar.pseudonym.p4'],
      followUps: ['unmask', 'change-name', 'privacy'],
    },
  },
  {
    id: 'unmask',
    prompt: 'sar.unmask.prompt',
    keywords: ['unmask', 'identify me', 'court', 'subpoena', 'police', 'safe to post', 'trace', 'reveal', 'anonymous really'],
    strong: ['unmask', 'subpoena', 'trace me', 'find out who i am'],
    answer: {
      mood: 'concerned',
      say: ['sar.unmask.p1', 'sar.unmask.p2', 'sar.unmask.p3', 'sar.unmask.p4'],
      followUps: ['pseudonym', 'oversight'],
    },
  },
  {
    id: 'change-name',
    prompt: 'sar.change-name.prompt',
    keywords: ['change name', 'change pseudonym', 'new name', 'cooldown', 'rename'],
    strong: ['change my pseudonym', 'change my name'],
    answer: {
      mood: 'neutral',
      say: ['sar.change-name.p1', 'sar.change-name.p2', 'sar.change-name.p3'],
      followUps: ['pseudonym', 'brigading'],
      goto: { label: 'Pseudonym settings', to: '/app/profile/pseudonym' },
    },
  },
  {
    id: 'who-sees-vote',
    prompt: 'sar.who-sees-vote.prompt',
    keywords: ['who sees', 'my vote', 'government see', 'they know', 'individual response', 'see my answer'],
    strong: ['who sees my vote', 'government see'],
    answer: {
      mood: 'explaining',
      say: ['sar.who-sees-vote.p1', 'sar.who-sees-vote.p2', 'sar.who-sees-vote.p3'],
      followUps: ['advisory', 'dashboards', 'privacy'],
    },
  },
  {
    id: 'dashboards',
    prompt: 'sar.dashboards.prompt',
    keywords: ['government see', 'dashboard', 'officials', 'what do they get', 'gov side', 'ministry'],
    strong: ['what does the government see', 'dashboard'],
    answer: {
      mood: 'explaining',
      say: ['sar.dashboards.p1', 'sar.dashboards.p2', 'sar.dashboards.p3'],
      followUps: ['who-sees-vote', 'coverage', 'oversight'],
    },
  },
  {
    id: 'coverage',
    prompt: 'sar.coverage.prompt',
    keywords: ['who is missing', 'representative', 'coverage', 'sample', 'skew', 'everyone', 'rural', 'elderly'],
    strong: ['who is missing', 'representative', 'skew'],
    answer: {
      mood: 'concerned',
      say: ['sar.coverage.p1', 'sar.coverage.p2', 'sar.coverage.p3'],
      followUps: ['dashboards', 'accessibility'],
    },
  },
  {
    id: 'notices',
    prompt: 'sar.notices.prompt',
    keywords: ['notice', 'announcement', 'water', 'road work', 'circular', 'alert'],
    strong: ['how do notices work', 'notices'],
    answer: {
      mood: 'neutral',
      say: ['sar.notices.p1', 'sar.notices.p2', 'sar.notices.p3'],
      followUps: ['fake-notice', 'notifications'],
      goto: { label: 'See notices', to: '/app/notices' },
    },
  },
  {
    id: 'fake-notice',
    prompt: 'sar.fake-notice.prompt',
    keywords: ['fake', 'forged', 'spoofed', 'scam', 'not real', 'report notice', 'fraud'],
    strong: ['fake notice', 'scam', 'forged'],
    answer: {
      mood: 'concerned',
      say: ['sar.fake-notice.p1', 'sar.fake-notice.p2', 'sar.fake-notice.p3'],
      followUps: ['notices', 'moderation'],
      goto: { label: 'See notices', to: '/app/notices' },
    },
  },
  {
    id: 'polls',
    prompt: 'sar.polls.prompt',
    keywords: ['how do i vote', 'poll', 'bill', 'vote on', 'opinion on bill'],
    strong: ['how do i vote', 'vote on a bill'],
    featured: true,
    answer: {
      mood: 'neutral',
      say: ['sar.polls.p1', 'sar.polls.p2', 'sar.polls.p3'],
      followUps: ['advisory', 'who-sees-vote', 'results'],
      goto: { label: 'See open polls', to: '/app/polls' },
    },
  },
  {
    id: 'results',
    prompt: 'sar.results.prompt',
    keywords: ['results hidden', 'see results', 'why hidden', 'bandwagon', 'after vote'],
    strong: ['why can i not see results', 'results hidden'],
    answer: {
      mood: 'explaining',
      say: ['sar.results.p1', 'sar.results.p2'],
      followUps: ['polls', 'advisory'],
    },
  },
  {
    id: 'discussion',
    prompt: 'sar.discussion.prompt',
    keywords: ['discussion', 'comment', 'thread', 'argue', 'debate', 'post opinion', 'forum'],
    strong: ['discussion', 'how do i post'],
    answer: {
      mood: 'neutral',
      say: ['sar.discussion.p1', 'sar.discussion.p2', 'sar.discussion.p3'],
      followUps: ['balanced', 'brigading', 'moderation'],
      goto: { label: 'Open discussions', to: '/app/discuss' },
    },
  },
  {
    id: 'balanced',
    prompt: 'sar.balanced.prompt',
    keywords: ['balanced', 'sorting', 'echo chamber', 'algorithm', 'ranking', 'feed order'],
    strong: ['balanced view', 'echo chamber', 'algorithm'],
    answer: {
      mood: 'explaining',
      say: ['sar.balanced.p1', 'sar.balanced.p2', 'sar.balanced.p3'],
      followUps: ['discussion', 'amplification'],
    },
  },
  {
    id: 'amplification',
    prompt: 'sar.amplification.prompt',
    keywords: ['amplif', 'boost', 'promote', 'paid', 'advertis', 'influencer', 'owner', 'reach'],
    strong: ['buy reach', 'boosted', 'amplification'],
    answer: {
      mood: 'concerned',
      say: ['sar.amplification.p1', 'sar.amplification.p2', 'sar.amplification.p3'],
      followUps: ['balanced', 'oversight'],
    },
  },
  {
    id: 'brigading',
    prompt: 'sar.brigading.prompt',
    keywords: ['brigad', 'bot', 'coordinated', 'spam', 'manipulate', 'flood', 'astroturf', 'fake accounts'],
    strong: ['brigading', 'bots', 'astroturf'],
    answer: {
      mood: 'explaining',
      say: ['sar.brigading.p1', 'sar.brigading.p2', 'sar.brigading.p3'],
      followUps: ['moderation', 'astroturf-gov'],
    },
  },
  {
    id: 'astroturf-gov',
    prompt: 'sar.astroturf-gov.prompt',
    keywords: ['government fake', 'astroturf', 'manipulate results', 'rig', 'government cheat', 'trust results'],
    strong: ['government fake', 'rig the poll', 'government manipulate'],
    answer: {
      mood: 'concerned',
      say: ['sar.astroturf-gov.p1', 'sar.astroturf-gov.p2', 'sar.astroturf-gov.p3', 'sar.astroturf-gov.p4'],
      followUps: ['oversight', 'next-government'],
      goto: { label: 'Open the oversight layer', to: '/oversight' },
    },
  },
  {
    id: 'oversight',
    prompt: 'sar.oversight.prompt',
    keywords: ['oversight', 'audit', 'transparency', 'independent', 'watchdog', 'accountab'],
    strong: ['oversight', 'audit log', 'transparency report'],
    answer: {
      mood: 'explaining',
      say: ['sar.oversight.p1', 'sar.oversight.p2', 'sar.oversight.p3'],
      followUps: ['astroturf-gov', 'next-government'],
      goto: { label: 'Open the oversight layer', to: '/oversight' },
    },
  },
  {
    id: 'next-government',
    prompt: 'sar.next-government.prompt',
    keywords: ['future government', 'next administration', 'change later', 'regime', 'law change', 'turn off', 'reconfigure'],
    strong: ['future government', 'next administration', 'changed later'],
    answer: {
      mood: 'concerned',
      say: ['sar.next-government.p1', 'sar.next-government.p2', 'sar.next-government.p3', 'sar.next-government.p4'],
      followUps: ['oversight', 'privacy'],
    },
  },
  {
    id: 'moderation',
    prompt: 'sar.moderation.prompt',
    keywords: ['moderat', 'removed', 'takedown', 'censor', 'report post', 'deleted'],
    strong: ['moderation', 'censorship', 'removed my post'],
    answer: {
      mood: 'neutral',
      say: ['sar.moderation.p1', 'sar.moderation.p2', 'sar.moderation.p3'],
      followUps: ['brigading', 'oversight'],
    },
  },
  {
    id: 'verify',
    prompt: 'sar.verify.prompt',
    keywords: ['id', 'verify', 'verification', 'aadhaar', 'identity check', 'why id', 'document'],
    strong: ['why do you need my id', 'verification'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: ['sar.verify.p1', 'sar.verify.p2', 'sar.verify.p3', 'sar.verify.p4'],
      followUps: ['pseudonym', 'privacy', 'shared-phone'],
    },
  },
  {
    id: 'shared-phone',
    prompt: 'sar.shared-phone.prompt',
    keywords: ['share phone', 'family phone', 'one phone', 'household', 'same device', 'my husband'],
    strong: ['share a phone', 'family phone'],
    answer: {
      mood: 'neutral',
      say: ['sar.shared-phone.p1', 'sar.shared-phone.p2'],
      followUps: ['verify', 'pseudonym'],
    },
  },
  {
    id: 'migrant',
    prompt: 'sar.migrant.prompt',
    keywords: ['migrant', 'work away', 'move for work', 'two places', 'no fixed address', 'labourer', 'temporary'],
    strong: ['work away from home', 'move for work', 'no fixed address'],
    answer: {
      mood: 'happy',
      say: ['sar.migrant.p1', 'sar.migrant.p2', 'sar.migrant.p3'],
      followUps: ['location', 'notices'],
      goto: { label: 'Set up my localities', to: '/app/profile/locality' },
    },
  },
  {
    id: 'accessibility',
    prompt: 'sar.accessibility.prompt',
    keywords: ['accessib', 'text size', 'font', 'screen reader', 'blind', 'cannot see', 'too small', 'contrast', 'bigger'],
    strong: ['text too small', 'screen reader', 'accessibility'],
    answer: {
      mood: 'happy',
      say: ['sar.accessibility.p1', 'sar.accessibility.p2', 'sar.accessibility.p3'],
      followUps: ['low-bandwidth', 'language'],
      goto: { label: 'Open accessibility settings', to: '/app/profile/accessibility' },
    },
  },
  {
    id: 'low-bandwidth',
    prompt: 'sar.low-bandwidth.prompt',
    keywords: ['slow', 'bandwidth', 'data', 'expensive', 'offline', 'no internet', '2g', 'network'],
    strong: ['slow connection', 'low bandwidth', 'offline'],
    answer: {
      mood: 'neutral',
      say: ['sar.low-bandwidth.p1', 'sar.low-bandwidth.p2'],
      followUps: ['accessibility', 'notifications'],
      goto: { label: 'Open accessibility settings', to: '/app/profile/accessibility' },
    },
  },
  {
    id: 'language',
    prompt: 'sar.language.prompt',
    keywords: ['language', 'hindi', 'tamil', 'bengali', 'marathi', 'translate', 'भाषा'],
    strong: ['change language', 'language'],
    answer: {
      mood: 'happy',
      say: ['sar.language.p1', 'sar.language.p2'],
      followUps: ['accessibility'],
      goto: { label: 'Language settings', to: '/app/profile' },
    },
  },
  {
    id: 'notifications',
    prompt: 'sar.notifications.prompt',
    keywords: ['notification', 'alerts', 'too many', 'push', 'quiet', 'stop notif', 'spam me'],
    strong: ['too many notifications', 'notifications'],
    answer: {
      mood: 'neutral',
      say: ['sar.notifications.p1', 'sar.notifications.p2'],
      followUps: ['notices'],
      goto: { label: 'Notification settings', to: '/app/profile/notifications' },
    },
  },
  {
    id: 'delete-me',
    prompt: 'sar.delete-me.prompt',
    keywords: ['delete', 'remove account', 'erase', 'wipe', 'close account', 'leave'],
    strong: ['delete my account', 'erase everything'],
    answer: {
      mood: 'neutral',
      say: ['sar.delete-me.p1', 'sar.delete-me.p2', 'sar.delete-me.p3'],
      followUps: ['privacy'],
      goto: { label: 'Open the Privacy Centre', to: '/app/profile/privacy' },
    },
  },
  {
    id: 'why-trust',
    prompt: 'sar.why-trust.prompt',
    keywords: ['trust', 'believe you', 'why should i', 'prove', 'sceptical', 'skeptical', 'convince'],
    strong: ['why should i trust', 'trust this'],
    answer: {
      mood: 'concerned',
      say: ['sar.why-trust.p1', 'sar.why-trust.p2', 'sar.why-trust.p3'],
      followUps: ['oversight', 'next-government', 'coverage'],
    },
  },
  {
    id: 'gov-portal',
    prompt: 'sar.gov-portal.prompt',
    keywords: ['government portal', 'official', 'officer', 'department', 'gov login', 'councillor', 'post a notice'],
    strong: ['government portal', 'how do officials'],
    answer: {
      mood: 'explaining',
      say: ['sar.gov-portal.p1', 'sar.gov-portal.p2'],
      followUps: ['dashboards', 'notices'],
      goto: { label: 'See the government portal', to: '/gov' },
    },
  },
]

/* ------------------------------- matching ---------------------------------- */

const GREETINGS = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'vanakkam', 'good morning', 'good evening', 'salaam']
const THANKS = ['thank', 'thanks', 'shukriya', 'dhanyavad', 'nandri', 'cheers', 'appreciate']

function normalise(input: string): string {
  return input.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

function score(query: string, entry: Entry): number {
  let total = 0
  for (const kw of entry.keywords) if (query.includes(kw)) total += kw.split(' ').length
  for (const s of entry.strong ?? []) if (query.includes(s)) total += 4 + s.split(' ').length
  return total
}

export function entryById(id: string): Entry | undefined {
  return ENTRIES.find((e) => e.id === id)
}

export function promptFor(id: string): string {
  return entryById(id)?.prompt ?? id
}

export function featuredPrompts(): { id: string; prompt: string }[] {
  return ENTRIES.filter((e) => e.featured).map((e) => ({ id: e.id, prompt: e.prompt }))
}

export function allPrompts(): { id: string; prompt: string }[] {
  return ENTRIES.map((e) => ({ id: e.id, prompt: e.prompt }))
}

export function greeting(pseudonym: string | null): Answer {
  return {
    mood: 'happy',
    say: pseudonym
      ? ['sar.greet.named', 'sar.greet.namedBody']
      : ['sar.greet.anon', 'sar.greet.anonBody'],
    followUps: ['what-can-you-do', 'privacy', 'advisory'],
  }
}

const UNKNOWN_REPLIES: string[][] = [
  ['sar.unknown.a1', 'sar.unknown.a2'],
  ['sar.unknown.b1', 'sar.unknown.b2'],
]

let unknownIndex = 0

export function ask(rawQuery: string, pseudonym: string | null): Answer {
  const query = normalise(rawQuery)
  if (query.length === 0) return greeting(pseudonym)

  if (GREETINGS.some((g) => query === g || query.startsWith(`${g} `))) {
    return greeting(pseudonym)
  }
  if (THANKS.some((t) => query.includes(t))) {
    return {
      mood: 'happy',
      say: ['sar.thanks'],
      followUps: ['what-can-you-do', 'privacy'],
    }
  }

  const ranked = ENTRIES
    .map((entry) => ({ entry, points: score(query, entry) }))
    .filter((r) => r.points > 0)
    .sort((a, b) => b.points - a.points)

  if (ranked.length === 0) {
    const say = UNKNOWN_REPLIES[unknownIndex % UNKNOWN_REPLIES.length]
    unknownIndex += 1
    return {
      mood: 'thinking',
      say,
      followUps: ['what-can-you-do', 'privacy', 'polls', 'notices'],
    }
  }

  return ranked[0].entry.answer
}

export function answerFor(id: string): Answer {
  return entryById(id)?.answer ?? {
    mood: 'thinking',
    say: ['sar.lost'],
    followUps: ['what-can-you-do'],
  }
}
