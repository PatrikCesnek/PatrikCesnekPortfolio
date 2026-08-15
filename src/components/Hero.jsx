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
      {/* Decorative — first in source so it sits behind the text column.
          Keyed on the year so it only re-animates when the year changes,
          not on every scrub within 2026. */}
      <span key={entry.year} className={`${s.ghost} ${s.ghostAnim}`} aria-hidden="true">
        {entry.year}
      </span>

      {/* Keyed on the slug: React remounts the column, which restarts the
          staggered entrance. Cheap, and no animation library needed. */}
      <div key={entry.slug} className={s.text}>
        <div className={`mono anim-up ${s.kicker}`}>
          <span className={s.dot} aria-hidden="true" />
          <span className={s.kind}>{t(entry.kind === 'own' ? 'kind.own' : 'kind.job')}</span>
          <span className="text-muted">{copy.span}</span>
        </div>

        {/* h2, not h1: the page's h1 states who this site is about. A heading
            that changes to "Apex Ryde" as you scrub tells a crawler the
            homepage is about a motorcycle game. */}
        <h2 className={`anim-up ${s.titleWrap}`} style={{ '--delay': '30ms' }}>
          <button type="button" className={s.title} onClick={open}>
            {entry.title}
          </button>
        </h2>

        <p className={`anim-up ${s.lede}`} style={{ '--delay': '60ms' }}>
          {copy.blurb}
        </p>

        <div className={`anim-up ${s.tags}`} style={{ '--delay': '90ms' }}>
          {entry.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">
              {tag}
            </span>
          ))}
        </div>

        <div className={`anim-up ${s.actions}`} style={{ '--delay': '115ms' }}>
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

      <div key={`${entry.slug}-media`} className={`anim-scale ${s.media}`}>
        {media}
      </div>
    </section>
  )
}
