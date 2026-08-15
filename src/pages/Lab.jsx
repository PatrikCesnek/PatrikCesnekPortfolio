import { OWN } from '../content/entries.js'
import { WEB_PROJECTS } from '../content/webProjects.js'
import { useLocale } from '../i18n/index.js'
import LabRow from '../components/LabRow.jsx'
import WebCard from '../components/WebCard.jsx'
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

      {/* The apps above each ship a marketing site, written the same way. */}
      <section className={s.web}>
        <h2 className={`mono ${s.webHeading}`}>{t('web.heading')}</h2>
        <p className={s.webLede}>{t('web.lede')}</p>

        <div className={s.webGrid}>
          {WEB_PROJECTS.map((site, i) => (
            <WebCard key={site.slug} site={site} index={i} />
          ))}
        </div>
      </section>
    </main>
  )
}
