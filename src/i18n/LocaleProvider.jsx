import { createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import en from './locales/en.json'
import cs from './locales/cs.json'
import sk from './locales/sk.json'
import { DEFAULT_LOCALE } from './resolveLocale.js'

const DICTS = { en, cs, sk }
const LocaleContext = createContext(null)

const lookup = (dict, key) =>
  key.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), dict)

export function LocaleProvider({ locale, children }) {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE]

  /**
   * Every prerendered file ships the right <html lang>, but switching language
   * is a client-side navigation — the document never reloads. Without this the
   * page keeps declaring "en" while the text turns Czech, and a screen reader
   * reads Czech with English phonemes. WCAG 3.1.1, and the reason translating
   * a page is worth anything at all. LocaleRedirect trips the same wire when
   * it sends a first-time visitor from / to /cs.
   */
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  /** Dot-path lookup with {name} interpolation, falling back to English. */
  const t = useCallback(
    (key, params) => {
      let value = lookup(dict, key)
      if (value === undefined) value = lookup(DICTS[DEFAULT_LOCALE], key)
      if (value === undefined) return key
      if (typeof value === 'string' && params) {
        return value.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m))
      }
      return value
    },
    [dict]
  )

  /** An entry's translatable copy, with English filling any gap field by field. */
  const tEntry = useCallback(
    (slug) => ({
      ...(DICTS[DEFAULT_LOCALE].entries[slug] ?? {}),
      ...(dict.entries?.[slug] ?? {}),
    }),
    [dict]
  )

  const value = useMemo(() => ({ locale, dict, t, tEntry }), [locale, dict, t, tEntry])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside a LocaleProvider')
  return ctx
}
