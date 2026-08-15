export const LOCALES = ['en', 'cs', 'sk']
export const DEFAULT_LOCALE = 'en'

/** Locales that carry a URL prefix. English is the default and stays unprefixed. */
export const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

const isLocale = (v) => LOCALES.includes(v)

/** The locale a path declares, or null when it declares none. */
export function localeFromPath(pathname) {
  const seg = String(pathname ?? '/')
    .split('/')
    .filter(Boolean)[0]
  return PREFIXED.includes(seg) ? seg : null
}

/** The path without its locale prefix, always with a leading slash. */
export function stripLocale(pathname) {
  const segs = String(pathname ?? '/')
    .split('/')
    .filter(Boolean)
  if (PREFIXED.includes(segs[0])) segs.shift()
  return '/' + segs.join('/')
}

/** The same path under a given locale. */
export function localePath(locale, path) {
  const clean = '/' + String(path ?? '/').split('/').filter(Boolean).join('/')
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/**
 * Path prefix wins, then the stored preference, then the browser's languages,
 * then English. An unsupported value at any step is skipped, never 404s.
 */
export function resolveLocale({ pathname = '/', stored = null, navigatorLangs = [] } = {}) {
  const fromPath = localeFromPath(pathname)
  if (fromPath) return fromPath
  if (isLocale(stored)) return stored
  for (const lang of navigatorLangs ?? []) {
    const base = String(lang).toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
