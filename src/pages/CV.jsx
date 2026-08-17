import { ENTRIES } from '../content/entries.js'
import { CV_PDF } from '../assets/manifest.js'
import { useLocale } from '../i18n/index.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import CVRow from '../components/CVRow.jsx'
import s from './CV.module.css'

const NEWEST_FIRST = [...ENTRIES].reverse()

export default function CV() {
  const { t } = useLocale()

  useDocumentTitle(t('meta.titleCv'))

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

      {/* The independent iOS years overlapped a full-time job. Saying so
          turns an apparent gap into evidence of the opposite. */}
      <div className={s.block}>
        <span className={`mono ${s.blockKicker}`}>{t('cv.alongside')}</span>
        <div className={s.blockBody}>
          <span className={s.blockTitle}>{t('cv.alongsideRole')}</span>
          <span className={`mono text-muted ${s.blockSpan}`}>{t('cv.alongsideSpan')}</span>
          <span className={`text-muted ${s.blockNote}`}>{t('cv.alongsideNote')}</span>
        </div>
      </div>

      <div className={s.block}>
        <span className={`mono ${s.blockKicker}`}>{t('cv.education')}</span>
        <div className={s.blockBody}>
          <span className={s.blockTitle}>{t('cv.school')}</span>
          <span className={`text-muted ${s.blockNote}`}>{t('cv.schoolNote')}</span>
        </div>
      </div>
    </main>
  )
}
