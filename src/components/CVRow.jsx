import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import s from './CVRow.module.css'

export default function CVRow({ entry }) {
  const { t, tEntry } = useLocale()
  const lp = useLocalePath()
  const navigate = useNavigate()

  const copy = tEntry(entry.slug)
  const own = entry.kind === 'own'

  return (
    <button
      type="button"
      className={s.row}
      onClick={() => navigate(lp(`/projects/${entry.slug}`))}
    >
      <span className={`mono text-muted ${s.span}`}>{copy.span}</span>

      <span className={s.middle}>
        <span className={s.title}>{entry.title}</span>
        <span className={`text-muted ${s.short}`}>{copy.short}</span>
      </span>

      {/* The CV table uses OWN / CONTRACT, not the OWN PROJECT / EMPLOYED
          labels every other view carries. */}
      <span className={`mono ${s.kind} ${own ? s.kindOwn : s.kindJob}`}>
        {t(own ? 'kind.ownShort' : 'kind.jobShort')}
      </span>
    </button>
  )
}
