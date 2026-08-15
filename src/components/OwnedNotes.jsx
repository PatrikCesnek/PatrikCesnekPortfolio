import { useLocale } from '../i18n/index.js'
import s from './OwnedNotes.module.css'

/**
 * Client work is described, never shown. `large` is the project-page scale.
 */
export default function OwnedNotes({ notes, large = false }) {
  const { t } = useLocale()

  return (
    <div className={`${s.wrap} ${large ? s.large : ''}`}>
      <span className={`mono ${s.kicker}`}>{t('work.owned')}</span>

      <ul className={s.list}>
        {notes.map((note) => (
          <li key={note} className={s.item}>
            <span className={s.dot} aria-hidden="true" />
            <span className={s.text}>{note}</span>
          </li>
        ))}
      </ul>

      <span className={`mono text-muted ${s.foot}`}>
        {t(large ? 'project.notShownLong' : 'work.notShown')}
      </span>
    </div>
  )
}
