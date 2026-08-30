/**
 * The twenty-two languages of the Eighth Schedule to the Constitution.
 *
 * This list is not a product ambition — it is the set the DPDP Rules 2025 name.
 * A consent request must be available in English or any language in the Eighth
 * Schedule, so a consent flow that ships in five is not compliant however good
 * the five are.
 *
 * `script` drives font loading: faces are subset and fetched per locale, so a
 * Malayalam reader never downloads a Bangla face. `status` is honest about how
 * far each one actually is, and the UI shows it rather than implying parity.
 */

export type LocaleCode =
  | 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'gu' | 'ur' | 'kn' | 'or'
  | 'ml' | 'pa' | 'as' | 'mai' | 'sat' | 'ks' | 'ne' | 'sd' | 'doi' | 'kok'
  | 'mni' | 'brx' | 'sa'
  /** Development only. Long accented text for catching clipped layouts. */
  | 'zz'

export type ScriptId =
  | 'latin' | 'devanagari' | 'bengali' | 'tamil' | 'telugu' | 'kannada'
  | 'malayalam' | 'gujarati' | 'gurmukhi' | 'odia' | 'arabic' | 'olchiki'
  | 'meeteimayek'

export type TranslationStatus =
  /** Every key present, reviewed by a speaker. */
  | 'complete'
  /** Key surfaces done; the rest falls through to English. */
  | 'partial'
  /** Nothing yet — listed so the gap is visible rather than hidden. */
  | 'pending'

export interface Locale {
  code: LocaleCode
  endonym: string
  english: string
  script: ScriptId
  /** BCP-47 tag for speech synthesis, recognition and the lang attribute. */
  bcp47: string
  dir: 'ltr' | 'rtl'
  status: TranslationStatus
}

export const LOCALES: Locale[] = [
  { code: 'en',  endonym: 'English',    english: 'English',   script: 'latin',       bcp47: 'en-IN', dir: 'ltr', status: 'complete' },
  { code: 'hi',  endonym: 'हिन्दी',       english: 'Hindi',     script: 'devanagari',  bcp47: 'hi-IN', dir: 'ltr', status: 'partial' },
  { code: 'bn',  endonym: 'বাংলা',       english: 'Bengali',   script: 'bengali',     bcp47: 'bn-IN', dir: 'ltr', status: 'partial' },
  { code: 'mr',  endonym: 'मराठी',       english: 'Marathi',   script: 'devanagari',  bcp47: 'mr-IN', dir: 'ltr', status: 'partial' },
  { code: 'ta',  endonym: 'தமிழ்',       english: 'Tamil',     script: 'tamil',       bcp47: 'ta-IN', dir: 'ltr', status: 'partial' },
  { code: 'te',  endonym: 'తెలుగు',      english: 'Telugu',    script: 'telugu',      bcp47: 'te-IN', dir: 'ltr', status: 'pending' },
  { code: 'gu',  endonym: 'ગુજરાતી',      english: 'Gujarati',  script: 'gujarati',    bcp47: 'gu-IN', dir: 'ltr', status: 'pending' },
  { code: 'ur',  endonym: 'اردو',        english: 'Urdu',      script: 'arabic',      bcp47: 'ur-IN', dir: 'rtl', status: 'pending' },
  { code: 'kn',  endonym: 'ಕನ್ನಡ',       english: 'Kannada',   script: 'kannada',     bcp47: 'kn-IN', dir: 'ltr', status: 'pending' },
  { code: 'or',  endonym: 'ଓଡ଼ିଆ',       english: 'Odia',      script: 'odia',        bcp47: 'or-IN', dir: 'ltr', status: 'pending' },
  { code: 'ml',  endonym: 'മലയാളം',      english: 'Malayalam', script: 'malayalam',   bcp47: 'ml-IN', dir: 'ltr', status: 'pending' },
  { code: 'pa',  endonym: 'ਪੰਜਾਬੀ',       english: 'Punjabi',   script: 'gurmukhi',    bcp47: 'pa-IN', dir: 'ltr', status: 'pending' },
  { code: 'as',  endonym: 'অসমীয়া',      english: 'Assamese',  script: 'bengali',     bcp47: 'as-IN', dir: 'ltr', status: 'pending' },
  { code: 'mai', endonym: 'मैथिली',       english: 'Maithili',  script: 'devanagari',  bcp47: 'mai-IN', dir: 'ltr', status: 'pending' },
  { code: 'sat', endonym: 'ᱥᱟᱱᱛᱟᱲᱤ',     english: 'Santali',   script: 'olchiki',     bcp47: 'sat-IN', dir: 'ltr', status: 'pending' },
  { code: 'ks',  endonym: 'کٲشُر',        english: 'Kashmiri',  script: 'arabic',      bcp47: 'ks-IN', dir: 'rtl', status: 'pending' },
  { code: 'ne',  endonym: 'नेपाली',       english: 'Nepali',    script: 'devanagari',  bcp47: 'ne-IN', dir: 'ltr', status: 'pending' },
  { code: 'sd',  endonym: 'سنڌي',        english: 'Sindhi',    script: 'arabic',      bcp47: 'sd-IN', dir: 'rtl', status: 'pending' },
  { code: 'doi', endonym: 'डोगरी',        english: 'Dogri',     script: 'devanagari',  bcp47: 'doi-IN', dir: 'ltr', status: 'pending' },
  { code: 'kok', endonym: 'कोंकणी',       english: 'Konkani',   script: 'devanagari',  bcp47: 'kok-IN', dir: 'ltr', status: 'pending' },
  { code: 'mni', endonym: 'ꯃꯤꯇꯩꯂꯣꯟ',     english: 'Manipuri',  script: 'meeteimayek', bcp47: 'mni-IN', dir: 'ltr', status: 'pending' },
  { code: 'brx', endonym: 'बड़ो',         english: 'Bodo',      script: 'devanagari',  bcp47: 'brx-IN', dir: 'ltr', status: 'pending' },
  { code: 'sa',  endonym: 'संस्कृतम्',     english: 'Sanskrit',  script: 'devanagari',  bcp47: 'sa-IN', dir: 'ltr', status: 'pending' },
]

/**
 * Pseudo-locale. Not shipped — the build strips it from release listings.
 * Every string is padded roughly 40% and accented, which is what catches a
 * layout that only fits because English is short.
 */
export const PSEUDO: Locale = {
  code: 'zz', endonym: '[Ṗśéüdó]', english: 'Pseudo (testing)',
  script: 'latin', bcp47: 'en-IN', dir: 'ltr', status: 'complete',
}

export const ALL_LOCALES: Locale[] = [...LOCALES, PSEUDO]

export function localeOf(code: LocaleCode): Locale {
  return ALL_LOCALES.find((l) => l.code === code) ?? LOCALES[0]
}

/**
 * Which font family serves a script.
 *
 * Anek is one superfamily across ten Indic scripts plus Latin, which is why it
 * was chosen — but the Eighth Schedule needs three it does not carry. Those are
 * named here rather than left to a silent fallback, because a missing face
 * renders as tofu and nobody notices until a user complains.
 */
export const SCRIPT_FONT: Record<ScriptId, { family: string; carried: boolean }> = {
  latin:       { family: 'Anek Latin',       carried: true },
  devanagari:  { family: 'Anek Devanagari',  carried: true },
  bengali:     { family: 'Anek Bangla',      carried: true },
  tamil:       { family: 'Anek Tamil',       carried: true },
  telugu:      { family: 'Anek Telugu',      carried: true },
  kannada:     { family: 'Anek Kannada',     carried: true },
  malayalam:   { family: 'Anek Malayalam',   carried: true },
  gujarati:    { family: 'Anek Gujarati',    carried: true },
  gurmukhi:    { family: 'Anek Gurmukhi',    carried: true },
  odia:        { family: 'Anek Odia',        carried: true },
  arabic:      { family: 'Noto Nastaliq Urdu', carried: false },
  olchiki:     { family: 'Noto Sans Ol Chiki', carried: false },
  meeteimayek: { family: 'Noto Sans Meetei Mayek', carried: false },
}
