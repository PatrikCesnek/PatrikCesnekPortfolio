import { ENTRIES } from '../content/entries.js'
import { CV_PDF } from '../assets/manifest.js'
import { useLocale } from '../i18n/index.js'
import CVRow from '../components/CVRow.jsx'
import s from './CV.module.css'

const NEWEST_FIRST = [...ENTRIES].reverse()

export default function CV() {
  const { t } = useLocale()

  return (
    <main id="content" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{t('cv.title')}</h1>
        {/* A real download — the handoff's button was a mailto placeholder. */}
        <a
          className={`btn btn-secondary mono ${s.download}`}
          href={CV_PDF}
          download="Patrik_Cesnek_CV.pdf"
        >
          {t('cv.download')}
        </a>
      </div>

      <div className={s.rows}>
        {NEWEST_FIRST.map((entry) => (
          <CVRow key={entry.slug} entry={entry} />
        ))}
      </div>

      <div className={s.education}>
        <span className={`mono ${s.eduKicker}`}>{t('cv.education')}</span>
        <div className={s.eduBody}>
          <span className={s.school}>{t('cv.school')}</span>
          <span className={`text-muted ${s.schoolNote}`}>{t('cv.schoolNote')}</span>
        </div>
      </div>
    </main>
  )
}
