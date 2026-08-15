import { useCallback } from 'react'
import { useLocale, localePath } from '../i18n/index.js'

/** Build an internal link under the active locale. */
export function useLocalePath() {
  const { locale } = useLocale()
  return useCallback((path) => localePath(locale, path), [locale])
}
