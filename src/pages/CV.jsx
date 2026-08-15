import { useLocale } from '../i18n/index.js'

export default function CV() {
  const { t } = useLocale()
  return (
    <main id="content" style={{ padding: '56px var(--gutter) 110px' }}>
      <h1>{t('cv.title')}</h1>
    </main>
  )
}
