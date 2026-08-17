import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import StatusPage from '../components/StatusPage.jsx'
import s from './ErrorPage.module.css'

const CONTACT = 'pcesnek290@gmail.com'

/**
 * Reload rather than re-render.
 *
 * The realistic causes of a crash on a static site are a chunk that went
 * missing under a visitor mid-deploy, or a hydration that landed wrong. A
 * re-render of the same tree reproduces both; a fresh document fixes both.
 * "Try again" that visibly fails is worse than no button.
 */
const reload = () => window.location.reload()

/** Pre-fills the one report I would actually be able to act on. */
function reportHref(subject, error) {
  const where = typeof window === 'undefined' ? '' : window.location.href
  const body = `${where}\n\n${error?.message ?? ''}\n\n—\n`
  return `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Rendered by ErrorBoundary in place of a page that threw. */
export default function ErrorPage({ error }) {
  const { t } = useLocale()
  const lp = useLocalePath()

  useDocumentTitle(t('meta.titleError'))

  return (
    <StatusPage
      ghost="ERR"
      kicker={t('error.kicker')}
      title={t('error.title')}
      description={t('error.body')}
    >
      <div className={s.actions}>
        <button type="button" className="btn btn-primary" onClick={reload}>
          {t('error.reload')}
        </button>

        <Link to={lp('/')} className="btn btn-secondary">
          {t('error.home')}
        </Link>

        <a
          className={`mono text-muted ${s.report}`}
          href={reportHref(t('error.reportSubject'), error)}
        >
          {t('error.report')}
        </a>
      </div>

      {/* Collapsed, and the message only — a stack trace is for my console,
          not for whoever happened to be reading the site at the time. */}
      {error?.message ? (
        <details className={s.details}>
          <summary className={`mono ${s.summary}`}>{t('error.detail')}</summary>
          <pre className={s.message}>{error.message}</pre>
        </details>
      ) : null}
    </StatusPage>
  )
}
