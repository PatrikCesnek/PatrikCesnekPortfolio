import { useLocale } from '../i18n/index.js'

export default function Lab() {
  const { t } = useLocale()
  return (
    <main id="content" style={{ padding: '56px var(--gutter) 110px' }}>
      <h1>{t('lab.title')}</h1>
    </main>
  )
}
