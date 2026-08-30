import { localeOf, SCRIPT_FONT, type LocaleCode, type ScriptId } from './locales'

/**
 * Per-locale font loading.
 *
 * Anek is one superfamily across Latin and ten Indic scripts, but a single
 * bundle carrying all eleven would be several megabytes — unusable on the
 * connections this app is meant for. So each script's face is fetched only when
 * a locale that needs it is selected, and never fetched again.
 *
 * Latin ships in the bundle because the shell, the numerals and the English
 * fallback all need it before any locale is chosen.
 */

const loaded = new Set<ScriptId>(['latin'])
const inflight = new Map<ScriptId, Promise<void>>()

/**
 * Where a script's face is served from. Kept as one function so that moving
 * from a CDN to self-hosted subsets is a change in one place.
 *
 * The three faces Anek does not carry are listed in SCRIPT_FONT as
 * `carried: false`; they need separate sourcing before those locales can ship,
 * and `missingScripts()` below reports exactly which.
 */
function href(script: ScriptId): string | null {
  const font = SCRIPT_FONT[script]
  if (!font.carried) return null
  const family = font.family.replace(/ /g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wdth,wght@75..125,100..800&display=swap`
}

export function isLoaded(script: ScriptId): boolean {
  return loaded.has(script)
}

/** Scripts the Eighth Schedule needs that the display superfamily cannot serve. */
export function missingScripts(): { script: ScriptId; family: string }[] {
  return (Object.entries(SCRIPT_FONT) as [ScriptId, { family: string; carried: boolean }][])
    .filter(([, f]) => !f.carried)
    .map(([script, f]) => ({ script, family: f.family }))
}

export function loadScript(script: ScriptId): Promise<void> {
  if (loaded.has(script)) return Promise.resolve()
  const existing = inflight.get(script)
  if (existing) return existing

  const url = href(script)
  if (!url) {
    // No face available yet. Resolve rather than reject: the locale still works,
    // it renders in the system fallback, and missingScripts() is what surfaces it.
    loaded.add(script)
    return Promise.resolve()
  }

  const promise = new Promise<void>((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.dataset.script = script
    // Never block the app on a font: a locale that renders in a fallback face is
    // far better than a locale that renders nothing while a CDN times out.
    link.onload = () => { loaded.add(script); resolve() }
    link.onerror = () => { loaded.add(script); resolve() }
    document.head.appendChild(link)
  })

  inflight.set(script, promise)
  return promise
}

export function loadForLocale(code: LocaleCode): Promise<void> {
  return loadScript(localeOf(code).script)
}

/** The CSS stack for a locale — its script's face first, then the Latin base. */
export function fontStackFor(code: LocaleCode): string {
  const { family } = SCRIPT_FONT[localeOf(code).script]
  return family === 'Anek Latin'
    ? `'Anek Latin', system-ui, sans-serif`
    : `'${family}', 'Anek Latin', system-ui, sans-serif`
}
