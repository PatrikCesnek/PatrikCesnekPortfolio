import { Link, useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import PhoneBezel from './PhoneBezel.jsx'
import LandscapeShots from './LandscapeShots.jsx'
import OwnedNotes from './OwnedNotes.jsx'
import s from './Hero.module.css'

export default function Hero({ entry }) {
  const { t, tEntry } = useLocale()
  const lp = useLocalePath()
  const navigate = useNavigate()

  const copy = tEntry(entry.slug)
  const to = lp(`/projects/${entry.slug}`)
  const open = () => navigate(to)

  const media = entry.images
    ? entry.orient === 'portrait'
      ? <PhoneBezel entry={entry} captions={copy.captions} />
      : <LandscapeShots entry={entry} captions={copy.captions} />
    : <OwnedNotes notes={copy.notes} />

  return (
    <section className={s.hero}>
      {/* Decorative — first in source so it sits behind the text column. */}
      <span className={s.ghost} aria-hidden="true">
        {entry.year}
      </span>

      <div className={s.text}>
        <div className={`mono ${s.kicker}`}>
          <span className={s.dot} aria-hidden="true" />
          <span className={s.kind}>{t(entry.kind === 'own' ? 'kind.own' : 'kind.job')}</span>
          <span className="text-muted">{copy.span}</span>
        </div>

        <h1 className={s.titleWrap}>
          <button type="button" className={s.title} onClick={open}>
            {entry.title}
          </button>
        </h1>

        <p className={s.lede}>{copy.blurb}</p>

        <div className={s.tags}>
          {entry.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">
              {tag}
            </span>
          ))}
        </div>

        <div className={s.actions}>
          <Link to={to} className="btn btn-primary">
            {t('work.openCase')}
          </Link>
          <a
            className={`mono text-muted ${s.hrefLabel}`}
            href={entry.href}
            target="_blank"
            rel="noopener"
          >
            {copy.hrefLabel}
          </a>
        </div>
      </div>

      <div className={s.media}>{media}</div>
    </section>
  )
}
