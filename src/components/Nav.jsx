import { NavLink, Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../content/nav.js'
import { useLocale, stripLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import LangSwitcher from './LangSwitcher.jsx'
import s from './Nav.module.css'

export default function Nav() {
  const { t } = useLocale()
  const lp = useLocalePath()
  const here = stripLocale(useLocation().pathname)

  // A project page belongs to WORK — it is the timeline's detail view.
  const isActive = (path) =>
    path === '/' ? here === '/' || here.startsWith('/projects') : here.startsWith(path)

  return (
    <header className={s.nav}>
      <a className="skip-link" href="#content">
        {t('nav.skip')}
      </a>

      <Link to={lp('/')} className={s.brand}>
        <span className={s.name}>Patrik Cesnek</span>
        <span className={`mono ${s.role}`}>{t('nav.role')}</span>
      </Link>

      <nav className={s.links} aria-label={t('nav.work')}>
        {NAV_ITEMS.map(([path, key]) => (
          <NavLink
            key={key}
            to={lp(path)}
            end={path === '/'}
            aria-current={isActive(path) ? 'page' : undefined}
            className={`mono ${s.link} ${isActive(path) ? s.active : ''}`}
          >
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <LangSwitcher />

      <a className={`btn btn-primary mono ${s.cta}`} href="mailto:pcesnek290@gmail.com">
        {t('nav.contact')}
      </a>
    </header>
  )
}
