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
    prompt: 'Who are you?',
    keywords: ['who are you', 'your name', 'what are you', 'sarathi', 'about you'],
    strong: ['who are you'],
    featured: true,
    answer: {
      mood: 'happy',
      say: [
        'I am Sarathi. A sarathi is a charioteer — the one who knows the route, not the one who decides where you are going. That distinction is the whole of my job here.',
        'I can explain what this platform does, what it deliberately refuses to do, and how to work any screen in it. I run entirely on your phone. Nothing you type to me is sent anywhere, because there is nowhere for it to be sent — I am a few hundred lines of rules, not a service.',
      ],
      followUps: ['what-can-you-do', 'privacy', 'advisory'],
    },
  },
  {
    id: 'what-can-you-do',
    prompt: 'What can this app do?',
    keywords: ['what can', 'what does', 'help me', 'features', 'what is this', 'how does this work', 'purpose'],
    strong: ['what can this', 'what is this app'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: [
        'Three things. First, government notices reach you — water shutdowns, road work, health camps — filtered to the localities you told us you care about.',
        'Second, bills and proposals come to you in plain words, with the full legal text one tap away, and you can register an opinion on them.',
        'Third, you can argue about all of it in public, under a name that is not your own and cannot be traced back to you.',
        'What it does not do is elect anybody. I will keep saying that, because it is the thing people most want to misunderstand.',
      ],
      followUps: ['advisory', 'notices', 'pseudonym'],
    },
  },
  {
    id: 'advisory',
    prompt: 'Is this real voting?',
    keywords: ['real vote', 'legal', 'binding', 'election', 'evm', 'advisory', 'does my vote count', 'replace voting'],
    strong: ['real vote', 'binding', 'advisory', 'election commission'],
    featured: true,
    answer: {
      mood: 'concerned',
      say: [
        'No. And I want to be blunt about it rather than gentle.',
        'What happens here is advisory. You register an opinion, it becomes part of a count, and that count is put in front of the people who write the law. They are not obliged to follow it. Nobody is elected. No law changes because of a number on this screen.',
        'Legally binding voting needs things this platform does not have and should not pretend to: a certified voter roll, a secret ballot that holds up even when someone is standing over your shoulder, and an audit trail the Election Commission runs. Anyone who tells you an app on your phone can replace that is selling you something.',
        'The disclaimer on every poll cannot be dismissed or hidden. That is on purpose.',
      ],
      followUps: ['polls', 'who-sees-vote', 'why-trust'],
    },
  },
  {
    id: 'privacy',
    prompt: 'What do you know about me?',
    keywords: ['privacy', 'data', 'know about me', 'collect', 'track', 'surveillance', 'spy', 'watching'],
    strong: ['track me', 'know about me', 'collect', 'privacy'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: [
        'Less than you would expect, and I can show you the actual list rather than describe it.',
        'A one-way hash of your ID number — not the number itself. Whether verification succeeded. The localities you typed in. Your chosen pseudonym. What you voted and posted under that pseudonym. Your language and accessibility settings.',
        'What is not there matters more: no location, ever. Not once, not in the background, not "only when the app is open". The code that would ask your phone for its position does not exist in this build.',
      ],
      followUps: ['location', 'unmask', 'delete-me'],
      goto: { label: 'Open the Privacy Centre', to: '/app/profile/privacy' },
    },
  },
  {
    id: 'location',
    prompt: 'How do you know where I live?',
    keywords: ['location', 'gps', 'where i live', 'address', 'locality', 'find me', 'geolocation'],
    strong: ['gps', 'location', 'where i live'],
    answer: {
      mood: 'explaining',
      say: [
        'Because you typed it. That is the entire mechanism.',
        'Your locality is a stated field, like writing an address on an envelope. It sits there until you change it. It does not update when you move, it does not know you have moved, and it is not checked against anything.',
        'If you work away from home, turn on "I move for work" and follow several localities at once. None of them is treated as your real one, because the app has no concept of a real one.',
      ],
      followUps: ['migrant', 'privacy'],
      goto: { label: 'Change my localities', to: '/app/profile/locality' },
    },
  },
  {
    id: 'pseudonym',
    prompt: 'What is a pseudonym here?',
    keywords: ['pseudonym', 'anonymous', 'anonymity', 'my name', 'username', 'nickname', 'identity'],
    strong: ['pseudonym', 'anonymous'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: [
        'You have two identities here, and they are kept in separate places on purpose.',
        'The first proves once that you are a citizen, so that one person counts once. It is used at sign-up and then never again.',
        'The second is your pseudonym. It is what posts, what votes, what argues. Every public thing you do wears this name.',
        'The two are not connected by anything. Not by a table, not by a shared key, not by a lookup only an administrator can run. There is no function in this system that takes one and returns the other — which is why nobody can be pressured into running it.',
      ],
      followUps: ['unmask', 'change-name', 'privacy'],
    },
  },
  {
    id: 'unmask',
    prompt: 'Could someone unmask me?',
    keywords: ['unmask', 'identify me', 'court', 'subpoena', 'police', 'safe to post', 'trace', 'reveal', 'anonymous really'],
    strong: ['unmask', 'subpoena', 'trace me', 'find out who i am'],
    answer: {
      mood: 'concerned',
      say: [
        'The honest answer has two halves, and you deserve both.',
        'From this system: no. There is no stored link between your verified identity and your pseudonym. A court order asking for it would be answered with the truth — the record does not exist. This is not a policy anyone can revise; it is an absence in how the thing is built.',
        'From outside this system: be careful anyway. If you post details only a handful of people could know, or you write in a very distinctive way, that is a form of exposure I cannot design away. Writing-style analysis is real. I would rather warn you than let you believe a pseudonym is armour.',
        'If what you are about to post could get you hurt, think about it the way you would think about it in a crowded room where nobody knows your name but everyone can hear your voice.',
      ],
      followUps: ['pseudonym', 'oversight'],
    },
  },
  {
    id: 'change-name',
    prompt: 'Can I change my pseudonym?',
    keywords: ['change name', 'change pseudonym', 'new name', 'cooldown', 'rename'],
    strong: ['change my pseudonym', 'change my name'],
    answer: {
      mood: 'neutral',
      say: [
        'Yes, but not on demand. There is a thirty-day wait between changes.',
        'The wait exists for two reasons. It stops a name being thrown away the moment an argument goes badly, and it stops one person cycling through names to look like a crowd.',
        'Your old posts stay under the old name. They do not follow you across.',
      ],
      followUps: ['pseudonym', 'brigading'],
      goto: { label: 'Pseudonym settings', to: '/app/profile/pseudonym' },
    },
  },
  {
    id: 'who-sees-vote',
    prompt: 'Who sees how I voted?',
    keywords: ['who sees', 'my vote', 'government see', 'they know', 'individual response', 'see my answer'],
    strong: ['who sees my vote', 'government see'],
    answer: {
      mood: 'explaining',
      say: [
        'Nobody sees your individual answer. Not the department that wrote the poll, not a minister, not a moderator.',
        'What leaves this app is a count. Your choice is added to a total and the total is what appears on a government dashboard. There is no button on that side that opens a list of respondents, because the data that reaches those screens never had a list in it.',
        'Small groups get hidden too. If a breakdown would show "four people in your lane, all opposed", it is suppressed — that is not a statistic, that is a pointing finger.',
      ],
      followUps: ['advisory', 'dashboards', 'privacy'],
    },
  },
  {
    id: 'dashboards',
    prompt: 'What does the government see?',
    keywords: ['government see', 'dashboard', 'officials', 'what do they get', 'gov side', 'ministry'],
    strong: ['what does the government see', 'dashboard'],
    answer: {
      mood: 'explaining',
      say: [
        'Numbers and trends. How many chose each option, how a district compares to another, how many people marked a notice as seen.',
        'They also see something most platforms hide from them: how few people this actually is. Every result carries its coverage — how many were eligible, how many could even be reached, how many answered. A poll answered by four percent of a ward says so on its face.',
        'That figure is there to stop a legislative aide reading eleven thousand responses as "the public". It is a sample, and a skewed one, and the screen admits it.',
      ],
      followUps: ['who-sees-vote', 'coverage', 'oversight'],
    },
  },
  {
    id: 'coverage',
    prompt: 'Who is missing from these polls?',
    keywords: ['who is missing', 'representative', 'coverage', 'sample', 'skew', 'everyone', 'rural', 'elderly'],
    strong: ['who is missing', 'representative', 'skew'],
    answer: {
      mood: 'concerned',
      say: [
        'People without a smartphone. People who do not read. People who have one and do not trust it. Older citizens who find this kind of screen hostile, and anyone whose language we have not translated properly yet.',
        'That is not a small footnote — it is the central weakness of a platform like this one. A result here is the opinion of people who own a phone and chose to use it, and treating that as the will of a ward would be a lie with a chart attached.',
        'So every result shows its coverage, and there is a low-bandwidth mode and a text-first fallback so the exclusion is at least smaller. It does not solve it. Nothing on a phone solves it.',
      ],
      followUps: ['dashboards', 'accessibility'],
    },
  },
  {
    id: 'notices',
    prompt: 'How do notices work?',
    keywords: ['notice', 'announcement', 'water', 'road work', 'circular', 'alert'],
    strong: ['how do notices work', 'notices'],
    answer: {
      mood: 'neutral',
      say: [
        'A verified government office posts one, tagged to particular wards. If one of those is a locality you follow, it reaches you.',
        'Every notice shows which office issued it and that the office signed in with multi-factor login. If something claiming to be official reaches you by any other route — forwarded on a messaging app, say — that badge is how you check it.',
        'And a notice is never quietly deleted. If an office withdraws one, it stays visible, marked as retracted, with the reason attached. A notice that vanishes overnight is exactly what a cover-up looks like, so the system does not allow it.',
      ],
      followUps: ['fake-notice', 'notifications'],
      goto: { label: 'See notices', to: '/app/notices' },
    },
  },
  {
    id: 'fake-notice',
    prompt: 'I think a notice is fake',
    keywords: ['fake', 'forged', 'spoofed', 'scam', 'not real', 'report notice', 'fraud'],
    strong: ['fake notice', 'scam', 'forged'],
    answer: {
      mood: 'concerned',
      say: [
        'Good instinct. Check the source badge on the notice first — a genuine one names the issuing office and shows it as verified.',
        'If it is not there, or the notice reached you outside this app, report it. Tap "Report as fake" and it goes into a queue a human moderator works through.',
        'Two things worth knowing: we do not record who reported it, so reporting is not a risk to you. And a notice asking for a payment or a personal detail is almost certainly not from an office here — nothing in this platform ever asks you for money.',
      ],
      followUps: ['notices', 'moderation'],
      goto: { label: 'See notices', to: '/app/notices' },
    },
  },
  {
    id: 'polls',
    prompt: 'How do I vote on a bill?',
    keywords: ['how do i vote', 'poll', 'bill', 'vote on', 'opinion on bill'],
    strong: ['how do i vote', 'vote on a bill'],
    featured: true,
    answer: {
      mood: 'neutral',
      say: [
        'Open a poll and you get the bill in plain words first, with the full legal text linked underneath. Read the summary, but check the text if the summary sounds like it is arguing with you — that is the point of having both.',
        'Then pick one of at most four options and confirm. You get a day to change your mind; after that it is fixed.',
        'Results stay hidden until you have answered. Not to be coy — because seeing that seventy percent chose one option genuinely changes what people pick, and a poll that measures the bandwagon is measuring nothing.',
      ],
      followUps: ['advisory', 'who-sees-vote', 'results'],
      goto: { label: 'See open polls', to: '/app/polls' },
    },
  },
  {
    id: 'results',
    prompt: 'Why can I not see results yet?',
    keywords: ['results hidden', 'see results', 'why hidden', 'bandwagon', 'after vote'],
    strong: ['why can i not see results', 'results hidden'],
    answer: {
      mood: 'explaining',
      say: [
        'Because knowing what everyone else picked would change what you pick, and then the poll is partly measuring itself.',
        'Answer first, and the results open immediately afterwards. Past polls are all readable in the archive with no restriction.',
      ],
      followUps: ['polls', 'advisory'],
    },
  },
  {
    id: 'discussion',
    prompt: 'How does the discussion work?',
    keywords: ['discussion', 'comment', 'thread', 'argue', 'debate', 'post opinion', 'forum'],
    strong: ['discussion', 'how do i post'],
    answer: {
      mood: 'neutral',
      say: [
        'Every discussion hangs off a specific notice or poll. There is no general forum, because a general forum becomes a place to shout rather than a place to decide something.',
        'You post under your pseudonym, you tag your position — support, oppose, mixed, or a question — and there is a length limit that makes pasted campaign text obvious.',
        'The default ordering is "balanced". It walks across positions rather than down a popularity list, so the top of a thread shows you people who disagree with each other. You can switch to newest or most-discussed. There is no "top" sort, and no account can be boosted — there is nowhere in the code to put a thumb on the scale.',
      ],
      followUps: ['balanced', 'brigading', 'moderation'],
      goto: { label: 'Open discussions', to: '/app/discuss' },
    },
  },
  {
    id: 'balanced',
    prompt: 'What is "balanced view"?',
    keywords: ['balanced', 'sorting', 'echo chamber', 'algorithm', 'ranking', 'feed order'],
    strong: ['balanced view', 'echo chamber', 'algorithm'],
    answer: {
      mood: 'explaining',
      say: [
        'It is the default ordering, and it takes one post from each position in turn rather than listing the most-agreed first.',
        'The effect is that you cannot read the first four posts and come away thinking everyone agrees with you. Within each position the best-argued version rises, so it is not a random shuffle — the diversity is between camps, the quality is inside them.',
        'You can turn it off. What you cannot do is find a mode that ranks purely by popularity, because that mode is the one that builds the echo chamber.',
      ],
      followUps: ['discussion', 'amplification'],
    },
  },
  {
    id: 'amplification',
    prompt: 'Can anyone buy reach here?',
    keywords: ['amplif', 'boost', 'promote', 'paid', 'advertis', 'influencer', 'owner', 'reach'],
    strong: ['buy reach', 'boosted', 'amplification'],
    answer: {
      mood: 'concerned',
      say: [
        'No, and the reason is structural rather than principled.',
        'A ranking function that could boost an account needs somewhere to store the boost. This one has no author term at all — it sorts by position and engagement, and the author is not an input. There is no field to set.',
        'That applies to whoever runs this platform as much as to anyone else. A rule the owner can exempt themselves from is not a rule.',
      ],
      followUps: ['balanced', 'oversight'],
    },
  },
  {
    id: 'brigading',
    prompt: 'What stops brigading?',
    keywords: ['brigad', 'bot', 'coordinated', 'spam', 'manipulate', 'flood', 'astroturf', 'fake accounts'],
    strong: ['brigading', 'bots', 'astroturf'],
    answer: {
      mood: 'explaining',
      say: [
        'Several small things, none of which I would claim is sufficient alone.',
        'One reaction per verified account. A limit on how often a pseudonym can post in an hour. A length cap that makes copy-pasted text stand out. A thirty-day wait before you can change names.',
        'Then there is pattern detection: a sudden burst of near-identical posts, or three hundred responses in ten minutes all choosing the same option, raises a flag. That flag goes to a human. It never triggers an automatic removal, because a system that silently deletes what looks coordinated will eventually delete a genuine protest.',
      ],
      followUps: ['moderation', 'astroturf-gov'],
    },
  },
  {
    id: 'astroturf-gov',
    prompt: 'What if the government fakes support?',
    keywords: ['government fake', 'astroturf', 'manipulate results', 'rig', 'government cheat', 'trust results'],
    strong: ['government fake', 'rig the poll', 'government manipulate'],
    answer: {
      mood: 'concerned',
      say: [
        'That is the sharpest question you can ask about a platform like this, and it is the one the design worries about most.',
        'The government cannot audit itself here. That is why there is an oversight layer run by an independent body — publishing moderation counts, data requests, retractions, and who accessed what.',
        'Government accounts can write into the audit trail by acting, and cannot read it back, edit it or delete from it. If an office starts removing inconvenient posts, the removals appear on a public page that office does not control.',
        'I will not pretend that is a guarantee. It depends on the oversight body genuinely being independent. What the software can do is make interference leave a mark somewhere the interferer cannot reach, and that is what it does.',
      ],
      followUps: ['oversight', 'next-government'],
      goto: { label: 'Open the oversight layer', to: '/oversight' },
    },
  },
  {
    id: 'oversight',
    prompt: 'Who watches the watchers?',
    keywords: ['oversight', 'audit', 'transparency', 'independent', 'watchdog', 'accountab'],
    strong: ['oversight', 'audit log', 'transparency report'],
    answer: {
      mood: 'explaining',
      say: [
        'A separate public surface, meant to be operated by a body that is neither the government nor whoever runs this platform.',
        'It publishes two things. A transparency report — how many posts were removed, how many notices retracted, how many requests for data arrived and what happened to them. And an audit log of who accessed what class of data, and when.',
        'Neither of those can be edited by the people they describe. The audit trail is append-only: there is no delete function to call.',
      ],
      followUps: ['astroturf-gov', 'next-government'],
      goto: { label: 'Open the oversight layer', to: '/oversight' },
    },
  },
  {
    id: 'next-government',
    prompt: 'What if a future government changes this?',
    keywords: ['future government', 'next administration', 'change later', 'regime', 'law change', 'turn off', 'reconfigure'],
    strong: ['future government', 'next administration', 'changed later'],
    answer: {
      mood: 'concerned',
      say: [
        'This is the assumption the whole design starts from: that the people running it next may not share the values of the people who built it.',
        'So none of the protections are settings. There is no admin screen with a tracking toggle set to off, because a toggle set to off is a toggle that can be set to on, quietly, by someone you never voted for.',
        'Instead the capability is simply absent. Adding location tracking would mean writing new code, shipping a new version, and doing it where people can see. It turns a private decision into a public one.',
        'But let me be straight with you: software cannot bind a state. This needs statutory backing to be worth anything long-term. What the architecture buys is friction and visibility, not immunity.',
      ],
      followUps: ['oversight', 'privacy'],
    },
  },
  {
    id: 'moderation',
    prompt: 'How does moderation work?',
    keywords: ['moderat', 'removed', 'takedown', 'censor', 'report post', 'deleted'],
    strong: ['moderation', 'censorship', 'removed my post'],
    answer: {
      mood: 'neutral',
      say: [
        'Reports go into a queue that a human works through. Nothing is removed automatically.',
        'When a post is removed, the space it occupied stays in the thread, marked as removed with the reason. A thread that silently loses posts is a thread you cannot trust.',
        'Removal counts are published on the oversight layer, so the volume of moderation is itself public even though individual cases are not.',
      ],
      followUps: ['brigading', 'oversight'],
    },
  },
  {
    id: 'verify',
    prompt: 'Why do you need my ID?',
    keywords: ['id', 'verify', 'verification', 'aadhaar', 'identity check', 'why id', 'document'],
    strong: ['why do you need my id', 'verification'],
    featured: true,
    answer: {
      mood: 'explaining',
      say: [
        'For exactly one thing: so that one person counts once. Without it a poll is a measure of who has the most phones.',
        'It happens once. We ask the government ID service whether you check out, and we keep the answer plus a one-way hash of the number. The number itself is never stored, never logged, and never sent to us in a form we could keep.',
        'A hash is a fingerprint that runs one way — it can tell us "this is the same person as before", and it cannot be turned back into your number.',
        'And it is tied to you, not your handset. A shared family phone still gives each person their own count.',
      ],
      followUps: ['pseudonym', 'privacy', 'shared-phone'],
    },
  },
  {
    id: 'shared-phone',
    prompt: 'We share one phone at home',
    keywords: ['share phone', 'family phone', 'one phone', 'household', 'same device', 'my husband'],
    strong: ['share a phone', 'family phone'],
    answer: {
      mood: 'neutral',
      say: [
        'That works. Verification is tied to the person, not the handset, so several people can each verify from the same phone and each gets their own single count.',
        'One thing to be careful about: log out when you hand the phone over. Otherwise the next person is posting under your pseudonym, and that name is the only thing standing between what you said and who you are.',
      ],
      followUps: ['verify', 'pseudonym'],
    },
  },
  {
    id: 'migrant',
    prompt: 'I work away from home',
    keywords: ['migrant', 'work away', 'move for work', 'two places', 'no fixed address', 'labourer', 'temporary'],
    strong: ['work away from home', 'move for work', 'no fixed address'],
    answer: {
      mood: 'happy',
      say: [
        'Then turn on "I move for work" and add every place you need. Notices from all of them reach you.',
        'This platform does not have a concept of your one true address. Most systems do, and it is precisely how people who move for work end up invisible to both the place they left and the place they are in.',
        'You can change the list whenever you like, and there is no penalty, no verification, and no record of when you changed it.',
      ],
      followUps: ['location', 'notices'],
      goto: { label: 'Set up my localities', to: '/app/profile/locality' },
    },
  },
  {
    id: 'accessibility',
    prompt: 'The text is too small',
    keywords: ['accessib', 'text size', 'font', 'screen reader', 'blind', 'cannot see', 'too small', 'contrast', 'bigger'],
    strong: ['text too small', 'screen reader', 'accessibility'],
    answer: {
      mood: 'happy',
      say: [
        'That is fixable in a few taps. Text size has four steps, and there is a high-contrast mode alongside it.',
        'If you use a screen reader, turn on screen-reader mode — it stops my ambient movement and makes the labelling more verbose, which is quieter to listen to.',
        'And if your connection is slow or expensive, low-bandwidth mode drops images and serves notices as text. It is a good deal more usable than it sounds.',
      ],
      followUps: ['low-bandwidth', 'language'],
      goto: { label: 'Open accessibility settings', to: '/app/profile/accessibility' },
    },
  },
  {
    id: 'low-bandwidth',
    prompt: 'My connection is slow',
    keywords: ['slow', 'bandwidth', 'data', 'expensive', 'offline', 'no internet', '2g', 'network'],
    strong: ['slow connection', 'low bandwidth', 'offline'],
    answer: {
      mood: 'neutral',
      say: [
        'Turn on low-bandwidth mode. Images are dropped, notices come through as text, and pages you have already opened stay readable with no connection at all.',
        'I work offline too — I am part of the app, not something it fetches. So if you are stuck without signal you can still ask me how something works.',
      ],
      followUps: ['accessibility', 'notifications'],
      goto: { label: 'Open accessibility settings', to: '/app/profile/accessibility' },
    },
  },
  {
    id: 'language',
    prompt: 'Can I change the language?',
    keywords: ['language', 'hindi', 'tamil', 'bengali', 'marathi', 'translate', 'भाषा'],
    strong: ['change language', 'language'],
    answer: {
      mood: 'happy',
      say: [
        'Yes, from Profile, and it takes effect immediately.',
        'I should be honest that the translations are not all complete yet. Where a phrase has not been translated you will see the English rather than a broken placeholder — a half-translated screen you can still use beats a tidy screen of error codes.',
      ],
      followUps: ['accessibility'],
      goto: { label: 'Language settings', to: '/app/profile' },
    },
  },
  {
    id: 'notifications',
    prompt: 'Too many notifications',
    keywords: ['notification', 'alerts', 'too many', 'push', 'quiet', 'stop notif', 'spam me'],
    strong: ['too many notifications', 'notifications'],
    answer: {
      mood: 'neutral',
      say: [
        'Set a minimum priority and everything below it stops buzzing. Time-critical only, if you like — that is the water-off-for-three-days tier.',
        'The problem this solves is real: if the app pings you about everything, you learn to ignore it, and then you miss the one that mattered. Turning things off here is the responsible move, not the lazy one.',
      ],
      followUps: ['notices'],
      goto: { label: 'Notification settings', to: '/app/profile/notifications' },
    },
  },
  {
    id: 'delete-me',
    prompt: 'How do I delete everything?',
    keywords: ['delete', 'remove account', 'erase', 'wipe', 'close account', 'leave'],
    strong: ['delete my account', 'erase everything'],
    answer: {
      mood: 'neutral',
      say: [
        'Profile, then Data and privacy, then delete. It erases your pseudonym, your settings and your verification record.',
        'Your posts come out of public view. The counts you contributed to stay in past aggregate results — and that is not a loophole: those numbers no longer have anything in them that is yours, so there is nothing left to remove.',
        'It is irreversible. There is no recovery, because a recovery path would mean we kept a copy.',
      ],
      followUps: ['privacy'],
      goto: { label: 'Open the Privacy Centre', to: '/app/profile/privacy' },
    },
  },
  {
    id: 'why-trust',
    prompt: 'Why should I trust this?',
    keywords: ['trust', 'believe you', 'why should i', 'prove', 'sceptical', 'skeptical', 'convince'],
    strong: ['why should i trust', 'trust this'],
    answer: {
      mood: 'concerned',
      say: [
        'You should not, on my say-so. I am part of the thing asking for your trust, which makes me the worst possible witness.',
        'What I can offer instead: the privacy screen reads from the actual stored data rather than a hand-written list, so it cannot quietly drift from the truth. The audit trail is published by a body that is not us. And the protections are absences in the code rather than settings, which means removing them requires a visible change rather than a private one.',
        'Check the oversight layer. Check whether the coverage numbers on a result look flattering or awkward — a platform massaging its data would not tell you only four percent of a ward answered.',
      ],
      followUps: ['oversight', 'next-government', 'coverage'],
    },
  },
  {
    id: 'gov-portal',
    prompt: 'How do officials use this?',
    keywords: ['government portal', 'official', 'officer', 'department', 'gov login', 'councillor', 'post a notice'],
    strong: ['government portal', 'how do officials'],
    answer: {
      mood: 'explaining',
      say: [
        'Through an entirely separate surface with its own multi-factor login and its own roles — one officer posts notices, another creates polls, an analyst reads dashboards, a moderator works the queues.',
        'The separation runs both ways. A citizen account has no path to posting as an office, and an account on that side cannot vote, post or comment as a citizen. They are not two modes of one login.',
      ],
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
      ? [
          `Good to see you, ${pseudonym}.`,
          'Ask me anything about how this place works — what it keeps, what it refuses to keep, or how to get something done on any screen in it.',
        ]
      : [
          'Hello. I am Sarathi.',
          'I am here to explain this platform: what it does, what it deliberately will not do, and how to work any part of it. Ask in your own words.',
        ],
    followUps: ['what-can-you-do', 'privacy', 'advisory'],
  }
}

const UNKNOWN_REPLIES: string[][] = [
  [
    'I did not follow that one — I match on words rather than truly understanding, and I have just shown you my limit.',
    'Try naming the thing you are after: privacy, voting, notices, your pseudonym, or the government side.',
  ],
  [
    'That is outside what I know. I only cover this platform — how it works and what it refuses to do.',
    'If it is about a specific notice or bill, search for it instead; I am no good at looking things up.',
  ],
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
      say: ['Any time. That is what I am for.'],
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
    say: ['I have lost the thread of that one. Ask me again in your own words.'],
    followUps: ['what-can-you-do'],
  }
}
