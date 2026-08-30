import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { DICTS } from './strings'
import { ALL_LOCALES, localeOf, LOCALES, type Locale, type LocaleCode } from './locales'
import { pseudo } from './pseudo'
import { fontStackFor, loadForLocale } from './fonts'

export type Translate = (key: string, vars?: Record<string, string | number>) => string

interface I18nValue {
  locale: LocaleCode
  meta: Locale
  t: Translate
  bcp47: string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nValue | null>(null)

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  )
}

export function I18nProvider({
  locale, children,
}: {
  locale: LocaleCode
  children: ReactNode
}) {
  const meta = localeOf(locale)

  const t = useCallback<Translate>(
    (key, vars) => {
      // Pseudo runs over the English catalogue: the point is to test layout,
      // and it must be obvious when a string never reached the catalogue at all.
      if (locale === 'zz') {
        const source = DICTS.en[key]
        return source ? pseudo(interpolate(source, vars)) : `⟦${key}⟧`
      }
      const value = DICTS[locale]?.[key] ?? DICTS.en[key] ?? `⟦${key}⟧`
      return interpolate(value, vars)
    },
    [locale],
  )

  /* Script face, text direction and the lang attribute all follow the locale. */
  useEffect(() => {
    void loadForLocale(locale)
    const root = document.documentElement
    root.lang = meta.bcp47
    root.dir = meta.dir
    root.style.setProperty('--f-display', fontStackFor(locale))
  }, [locale, meta])

  const value = useMemo<I18nValue>(
    () => ({ locale, meta, t, bcp47: meta.bcp47, dir: meta.dir }),
    [locale, meta, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function useT(): Translate {
  return useI18n().t
}

/**
 * LANGUAGES is the list a picker should show: the twenty-two scheduled
 * languages, plus the pseudo-locale in development builds only.
 */
export const LANGUAGES: Locale[] = import.meta.env.DEV ? ALL_LOCALES : LOCALES

export { LOCALES, ALL_LOCALES, localeOf } from './locales'
export type { Locale, LocaleCode } from './locales'
