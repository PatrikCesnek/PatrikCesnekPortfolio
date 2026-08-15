import { OWN } from '../content/entries.js'
import { useLocale } from '../i18n/index.js'
import LabRow from '../components/LabRow.jsx'
import s from './Lab.module.css'

/** Own projects only, newest first. */
const ROWS = [...OWN].reverse()

export default function Lab() {
  const { t } = useLocale()

  return (
    <main id="content" className={s.page}>
      <h1 className={s.title}>{t('lab.title')}</h1>
      <p className={s.lede}>{t('lab.lede')}</p>

      <div className={s.rows}>
        {ROWS.map((entry, i) => (
          <LabRow key={entry.slug} entry={entry} index={i} />
        ))}
      </div>
    </main>
  )
}
