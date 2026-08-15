import { Link, useLocation } from 'react-router-dom'
import { useLocale, LOCALES, localePath, stripLocale } from '../i18n/index.js'
import s from './LangSwitcher.module.css'

/**
 * Swapping language keeps the visitor on the same route and the same timeline
 * entry — the path is rebuilt from the bare route and the hash is carried over.
 */
export default function LangSwitcher() {
  const { locale, t } = useLocale()
  const { pathname, hash } = useLocation()
  const bare = stripLocale(pathname)

  const remember = (l) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('locale', l)
  }

  return (
    <div className={s.wrap} role="group" aria-label={t('nav.language')}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          to={localePath(l, bare) + hash}
          hrefLang={l}
          aria-current={l === locale ? 'true' : undefined}
          onClick={() => remember(l)}
          className={`mono ${s.item} ${l === locale ? s.active : ''}`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
