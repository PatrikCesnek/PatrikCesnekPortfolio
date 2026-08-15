import { useLocale } from '../i18n/index.js'

export default function About() {
  const { t } = useLocale()
  return (
    <main id="content" style={{ padding: '56px var(--gutter) 110px' }}>
      <h1>{t('about.title')}</h1>
    </main>
  )
}
