import { useLocale } from '../i18n/index.js'

export default function Work() {
  const { t } = useLocale()
  return (
    <main id="content" style={{ padding: '56px var(--gutter) 110px' }}>
      <h1>{t('work.gridHeading')}</h1>
    </main>
  )
}
