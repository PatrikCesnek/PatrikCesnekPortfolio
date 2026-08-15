import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import Picture from './Picture.jsx'
import PlaceholderTile from './PlaceholderTile.jsx'
import s from './WorkCard.module.css'

export default function WorkCard({ entry }) {
  const { t, tEntry } = useLocale()
  const lp = useLocalePath()
  const navigate = useNavigate()

  const copy = tEntry(entry.slug)
  const own = entry.kind === 'own'

  return (
    <button
      type="button"
      className={`${s.card} ${own ? s.own : s.job}`}
      onClick={() => navigate(lp(`/projects/${entry.slug}`))}
    >
      <span className={`mono ${s.meta}`}>
        <span className={own ? s.kindOwn : s.kindJob}>
          {t(own ? 'kind.own' : 'kind.job')}
        </span>
        <span className="text-muted">{entry.date}</span>
      </span>

      <span className={s.cover}>
        {entry.images ? (
          <Picture
            name={entry.images[0]}
            alt={`${entry.title} — ${copy.captions[0] ?? copy.short}`}
            sizes="(max-width: 600px) 100vw, 320px"
            className={`${s.shot} ${entry.orient === 'portrait' ? s.portrait : ''}`}
          />
        ) : (
          <PlaceholderTile label={copy.coverNote} />
        )}
      </span>

      <span className={s.title}>{entry.title}</span>
      <span className={`text-muted ${s.short}`}>{copy.short}</span>
    </button>
  )
}
