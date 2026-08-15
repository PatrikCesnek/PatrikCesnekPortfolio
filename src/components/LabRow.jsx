import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import { useReveal } from '../hooks/useReveal.js'
import Picture from './Picture.jsx'
import PlaceholderTile from './PlaceholderTile.jsx'
import s from './LabRow.module.css'

export default function LabRow({ entry, index = 0 }) {
  const { tEntry } = useLocale()
  const lp = useLocalePath()
  const navigate = useNavigate()
  const [ref, reveal] = useReveal()

  const copy = tEntry(entry.slug)

  return (
    <button
      ref={ref}
      type="button"
      className={`reveal ${s.row}`}
      data-reveal={reveal ?? undefined}
      style={{ '--delay': `${Math.min(index, 5) * 55}ms` }}
      onClick={() => navigate(lp(`/projects/${entry.slug}`))}
    >
      <span className={s.cover}>
        {entry.images ? (
          <Picture
            name={entry.images[0]}
            alt={`${entry.title} — ${copy.captions[0] ?? copy.short}`}
            sizes="(max-width: 900px) 100vw, 260px"
            className={`${s.shot} ${entry.orient === 'portrait' ? s.portrait : ''}`}
          />
        ) : (
          <PlaceholderTile label={copy.coverNote} />
        )}
      </span>

      <span className={s.text}>
        <span className={s.title}>{entry.title}</span>
        <span className={`mono text-muted ${s.span}`}>{copy.span}</span>
        <span className={s.blurb}>{copy.blurb}</span>
        <span className={s.tags}>
          {entry.tags.map((tag) => (
            <span key={tag} className="tag tag-neutral">
              {tag}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
