import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'

export default function NotFound() {
  const { t } = useLocale()
  const lp = useLocalePath()

  return (
    <main id="content" style={{ padding: '96px var(--gutter) 140px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 62, lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
        404
      </h1>
      <p style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--color-neutral-300)' }}>
        {t('project.notFound')}
      </p>
      <Link
        to={lp('/')}
        className="mono"
        style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--color-accent-300)' }}
      >
        {t('project.notFoundBack')}
      </Link>
    </main>
  )
}
