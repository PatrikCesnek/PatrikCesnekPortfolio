import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../content/nav.js'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import StatusPage from '../components/StatusPage.jsx'
import s from './NotFound.module.css'

/** Everything except the timeline, which gets the primary button of its own. */
const ELSEWHERE = NAV_ITEMS.filter(([path]) => path !== '/')

/**
 * The site has four pages. A 404 that only apologises wastes the one moment
 * where that is worth saying out loud, so this one lists them.
 *
 * @param {string} [description] Replaces the generic line where the caller
 *   knows what was missing — ProjectPage names the project.
 */
export default function NotFound({ description }) {
  const { t } = useLocale()
  const lp = useLocalePath()

  useDocumentTitle(t('meta.title404'))

  return (
    <StatusPage
      ghost="404"
      kicker={t('notFound.kicker')}
      title={t('notFound.title')}
      description={description ?? t('notFound.body')}
    >
      <nav className={s.links} aria-label={t('notFound.elsewhere')}>
        <Link to={lp('/')} className="btn btn-primary">
          {t('notFound.home')}
        </Link>

        {ELSEWHERE.map(([path, key]) => (
          <Link key={key} to={lp(path)} className="btn btn-secondary mono">
            {t(`nav.${key}`)}
          </Link>
        ))}
      </nav>
    </StatusPage>
  )
}
