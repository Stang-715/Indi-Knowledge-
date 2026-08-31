import type { ConstitutionData } from '../core/legislation'

/**
 * 3.4 — the Constitution, as structure rather than as a document.
 *
 * What is here is the shape: the Parts and what each is for, the twelve
 * Schedules, a selection of Articles a citizen is most likely to be looking
 * for, and the Amendments that changed something they would recognise. It is
 * explicitly a subset, and the counts below are stated separately from the
 * lists so the screen can say "showing 24 of about 470" rather than implying
 * the list is the whole.
 *
 * Every entry is a plain-words gist, never the text of an Article. The text is
 * on India Code and the link is one tap away; paraphrasing is what makes it
 * findable, and pretending a paraphrase is the law is what makes it dangerous.
 *
 * `asOf` is the date this snapshot describes, and the UI shows it. A constitution
 * changes rarely, which is exactly why an undated copy of one goes stale
 * without anybody noticing.
 */
export const CONSTITUTION: ConstitutionData = {
  provenance: 'official',
  sourceName: 'India Code — Constitution of India',
  sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1362',
  fetchedAt: Date.parse('2023-09-29T00:00:00Z'),
  asOf: '29 September 2023',

  counts: {
    articles: 'about 470',
    parts: 25,
    schedules: 12,
    amendments: 106,
  },

  parts: [
    { roman: 'I', title: 'The Union and its Territory', subject: 'What India is, and which states and territories it is made of.', articleRange: '1–4' },
    { roman: 'II', title: 'Citizenship', subject: 'Who is a citizen at commencement, and Parliament’s power to legislate on citizenship.', articleRange: '5–11' },
    { roman: 'III', title: 'Fundamental Rights', subject: 'Equality, freedom, life and liberty, religion, minorities — and the right to move the courts to enforce them.', articleRange: '12–35' },
    { roman: 'IV', title: 'Directive Principles of State Policy', subject: 'Goals the state is to work toward. Not enforceable in court, and meant to guide legislation.', articleRange: '36–51' },
    { roman: 'IVA', title: 'Fundamental Duties', subject: 'Duties of every citizen. Added by the 42nd Amendment in 1976.', articleRange: '51A' },
    { roman: 'V', title: 'The Union', subject: 'President, Parliament, the Union executive and the Supreme Court.', articleRange: '52–151' },
    { roman: 'VI', title: 'The States', subject: 'Governor, State Legislature, State executive and the High Courts.', articleRange: '152–237' },
    { roman: 'VIII', title: 'The Union Territories', subject: 'How territories without statehood are administered.', articleRange: '239–242' },
    { roman: 'IX', title: 'The Panchayats', subject: 'Village and district self-government. Added by the 73rd Amendment in 1992.', articleRange: '243–243O' },
    { roman: 'IXA', title: 'The Municipalities', subject: 'Urban local government. Added by the 74th Amendment in 1992.', articleRange: '243P–243ZG' },
    { roman: 'IXB', title: 'Co-operative Societies', subject: 'Added by the 97th Amendment in 2011.', articleRange: '243ZH–243ZT' },
    { roman: 'XI', title: 'Relations between the Union and the States', subject: 'Who may legislate on what, and how disputes between the two are settled.', articleRange: '245–263' },
    { roman: 'XII', title: 'Finance, Property, Contracts and Suits', subject: 'Taxation, the Finance Commission, borrowing and public property.', articleRange: '264–300A' },
    { roman: 'XIVA', title: 'Tribunals', subject: 'Administrative and other tribunals. Added by the 42nd Amendment in 1976.', articleRange: '323A–323B' },
    { roman: 'XV', title: 'Elections', subject: 'The Election Commission, the electoral roll, and the bar on courts interfering in an election once it has begun.', articleRange: '324–329A' },
    { roman: 'XVII', title: 'Official Language', subject: 'The language of the Union, of the states, and of the courts.', articleRange: '343–351' },
    { roman: 'XVIII', title: 'Emergency Provisions', subject: 'National, State and financial emergency, and what happens to rights during one.', articleRange: '352–360' },
    { roman: 'XX', title: 'Amendment of the Constitution', subject: 'How the Constitution itself is changed — the single Article this surface exists to make legible.', articleRange: '368' },
  ],

  articles: [
    { number: '12', heading: 'Definition of “the State”', gist: 'Who counts as the State for the purposes of Fundamental Rights — government, Parliament, legislatures, local and other authorities.', partRoman: 'III' },
    { number: '14', heading: 'Equality before law', gist: 'The State shall not deny any person equality before the law or equal protection of the laws.', partRoman: 'III' },
    { number: '15', heading: 'Prohibition of discrimination', gist: 'No discrimination on grounds of religion, race, caste, sex or place of birth — with room for special provision for women, children and disadvantaged classes.', partRoman: 'III' },
    { number: '16', heading: 'Equality of opportunity in public employment', gist: 'Equal opportunity in state employment, with provision for reservation.', partRoman: 'III' },
    { number: '19', heading: 'Protection of certain rights regarding freedom of speech', gist: 'Speech and expression, assembly, association, movement, residence and profession — each subject to reasonable restrictions set out in the Article itself.', partRoman: 'III' },
    { number: '21', heading: 'Protection of life and personal liberty', gist: 'No person shall be deprived of life or personal liberty except according to procedure established by law. The Article privacy was read into.', partRoman: 'III' },
    { number: '21A', heading: 'Right to education', gist: 'Free and compulsory education for children aged six to fourteen. Added by the 86th Amendment.', partRoman: 'III' },
    { number: '22', heading: 'Protection against arrest and detention', gist: 'Grounds of arrest, the right to counsel, production before a magistrate within twenty-four hours — and the separate regime for preventive detention.', partRoman: 'III' },
    { number: '25', heading: 'Freedom of conscience and religion', gist: 'Freedom to profess, practise and propagate religion, subject to public order, morality and health.', partRoman: 'III' },
    { number: '32', heading: 'Remedies for enforcement of rights', gist: 'The right to move the Supreme Court directly when a Fundamental Right is breached. Ambedkar called it the heart and soul of the Constitution.', partRoman: 'III' },
    { number: '38', heading: 'State to secure a social order for welfare', gist: 'The state is to promote welfare by securing a social order in which justice — social, economic and political — informs institutions.', partRoman: 'IV' },
    { number: '39A', heading: 'Equal justice and free legal aid', gist: 'Legal aid so that opportunities for justice are not denied for want of means.', partRoman: 'IV' },
    { number: '51A', heading: 'Fundamental duties', gist: 'Eleven duties of every citizen, including to abide by the Constitution, safeguard public property and provide education to one’s child between six and fourteen.', partRoman: 'IVA' },
    { number: '73', heading: 'Extent of executive power of the Union', gist: 'The Union executive’s power runs to the matters Parliament may legislate on.', partRoman: 'V' },
    { number: '110', heading: 'Definition of “Money Bill”', gist: 'What makes a bill a Money Bill, and the Speaker’s certificate that settles it. Decides whether the Rajya Sabha can do more than recommend.', partRoman: 'V' },
    { number: '112', heading: 'Annual financial statement', gist: 'The Budget: a statement of estimated receipts and expenditure laid before Parliament each year.', partRoman: 'V' },
    { number: '123', heading: 'Ordinances', gist: 'The President may promulgate an ordinance when Parliament is not sitting. It has the force of law and lapses six weeks after Parliament reassembles.', partRoman: 'V' },
    { number: '141', heading: 'Law declared by the Supreme Court', gist: 'The law declared by the Supreme Court binds all courts in India.', partRoman: 'V' },
    { number: '226', heading: 'Power of High Courts to issue writs', gist: 'A High Court may issue writs for Fundamental Rights and for any other purpose — wider than Article 32.', partRoman: 'VI' },
    { number: '243G', heading: 'Powers of Panchayats', gist: 'State legislatures may devolve powers to Panchayats for economic development and social justice, including the subjects in the Eleventh Schedule.', partRoman: 'IX' },
    { number: '243W', heading: 'Powers of Municipalities', gist: 'The urban counterpart of 243G, with the subjects in the Twelfth Schedule.', partRoman: 'IXA' },
    { number: '246', heading: 'Subject-matter of laws', gist: 'The division of legislative power between Union, State and Concurrent Lists in the Seventh Schedule.', partRoman: 'XI' },
    { number: '324', heading: 'Superintendence of elections', gist: 'The Election Commission’s control of the preparation of rolls and the conduct of elections.', partRoman: 'XV' },
    { number: '356', heading: 'Provisions in case of failure of constitutional machinery', gist: 'President’s Rule in a state. The Article whose use the Supreme Court narrowed in S. R. Bommai.', partRoman: 'XVIII' },
    { number: '368', heading: 'Power of Parliament to amend', gist: 'How the Constitution is amended, and the special majorities required. Read subject to the basic structure doctrine from Kesavananda Bharati.', partRoman: 'XX' },
  ],

  schedules: [
    { number: 1, title: 'First Schedule', subject: 'The States and Union Territories, and their territories.' },
    { number: 2, title: 'Second Schedule', subject: 'Emoluments and allowances of the President, Governors, Speakers and judges.' },
    { number: 3, title: 'Third Schedule', subject: 'Forms of oath and affirmation for office.' },
    { number: 4, title: 'Fourth Schedule', subject: 'Allocation of Rajya Sabha seats to states and union territories.' },
    { number: 5, title: 'Fifth Schedule', subject: 'Administration and control of Scheduled Areas and Scheduled Tribes.' },
    { number: 6, title: 'Sixth Schedule', subject: 'Administration of tribal areas in Assam, Meghalaya, Tripura and Mizoram.' },
    { number: 7, title: 'Seventh Schedule', subject: 'The Union, State and Concurrent Lists — who may legislate on what.' },
    { number: 8, title: 'Eighth Schedule', subject: 'The twenty-two scheduled languages. The reason this app must speak twenty-two.' },
    { number: 9, title: 'Ninth Schedule', subject: 'Laws given protection from challenge, subject to basic-structure review since 1973.' },
    { number: 10, title: 'Tenth Schedule', subject: 'Disqualification on ground of defection. Added by the 52nd Amendment.' },
    { number: 11, title: 'Eleventh Schedule', subject: 'Twenty-nine subjects that may be devolved to Panchayats.' },
    { number: 12, title: 'Twelfth Schedule', subject: 'Eighteen subjects that may be devolved to Municipalities.' },
  ],

  amendments: [
    { number: 1, year: 1951, shortTitle: 'First Amendment', effect: 'Added reasonable restrictions to free speech and created the Ninth Schedule.' },
    { number: 7, year: 1956, shortTitle: 'Seventh Amendment', effect: 'Reorganised the states on linguistic lines and repealed Part VII.' },
    { number: 24, year: 1971, shortTitle: 'Twenty-fourth Amendment', effect: 'Asserted Parliament’s power to amend any part of the Constitution.' },
    { number: 42, year: 1976, shortTitle: 'Forty-second Amendment', effect: 'The largest single amendment. Added Fundamental Duties, Tribunals, and the words socialist and secular to the Preamble.' },
    { number: 44, year: 1978, shortTitle: 'Forty-fourth Amendment', effect: 'Undid much of the 42nd, and moved the right to property out of Fundamental Rights.' },
    { number: 52, year: 1985, shortTitle: 'Fifty-second Amendment', effect: 'Anti-defection law — added the Tenth Schedule.' },
    { number: 61, year: 1989, shortTitle: 'Sixty-first Amendment', effect: 'Lowered the voting age from twenty-one to eighteen.' },
    { number: 73, year: 1992, shortTitle: 'Seventy-third Amendment', effect: 'Constitutional status for Panchayats, with reserved seats and five-yearly elections.' },
    { number: 74, year: 1992, shortTitle: 'Seventy-fourth Amendment', effect: 'The urban counterpart — Municipalities, ward committees and state finance commissions.' },
    { number: 86, year: 2002, shortTitle: 'Eighty-sixth Amendment', effect: 'Made education a Fundamental Right for children aged six to fourteen.' },
    { number: 101, year: 2016, shortTitle: 'One Hundred and First Amendment', effect: 'Introduced the Goods and Services Tax and the GST Council.' },
    { number: 103, year: 2019, shortTitle: 'One Hundred and Third Amendment', effect: 'Reservation for economically weaker sections in education and public employment.' },
    { number: 106, year: 2023, shortTitle: 'One Hundred and Sixth Amendment', effect: 'Reserved one-third of seats in the Lok Sabha and state assemblies for women, to take effect after a delimitation following the next census.' },
  ],
}
