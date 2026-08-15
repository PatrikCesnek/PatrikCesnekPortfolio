import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resolveLocale, localeFromPath, localePath, DEFAULT_LOCALE } from '../i18n/index.js'

/**
 * Sends a first-time visitor to their preferred locale.
 *
 * The rendered locale comes from the URL alone, so prerendered HTML and the
 * hydrated tree always agree — reading localStorage during render would make
 * "/" hydrate as Czech over English markup. Preference is applied here
 * instead, after mount, as a one-time replace so the back button stays clean.
 */
export default function LocaleRedirect() {
  const { pathname, hash, search } = useLocation()
  const navigate = useNavigate()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    // Only ever redirect away from an unprefixed path.
    if (localeFromPath(pathname)) return

    const stored = window.localStorage.getItem('locale')
    const preferred = resolveLocale({
      pathname,
      stored,
      navigatorLangs: navigator.languages ?? [navigator.language],
    })

    if (preferred === DEFAULT_LOCALE) return
    navigate(localePath(preferred, pathname) + search + hash, { replace: true })
  }, [pathname, search, hash, navigate])

  return null
}
