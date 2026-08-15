import { Link, useParams } from 'react-router-dom'
import { ENTRIES, bySlug, indexOfSlug } from '../content/entries.js'
import { neighbours } from '../lib/neighbours.js'
import { useLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import Picture from './../components/Picture.jsx'
import OwnedNotes from '../components/OwnedNotes.jsx'
import NotFound from './NotFound.jsx'
import s from './ProjectPage.module.css'

export default function ProjectPage() {
  const { slug } = useParams()
  const entry = bySlug(slug)
  const { t, tEntry } = useLocale()
  const lp = useLocalePath()

  if (!entry) return <NotFound />

  const copy = tEntry(entry.slug)
  const { prev, next } = neighbours(indexOfSlug(entry.slug), ENTRIES.length)
  const own = entry.kind === 'own'

  return (
    <main id="content" className={s.page}>
      <Link to={lp('/')} className={`mono text-muted ${s.back}`}>
        {t('project.back')}
      </Link>

      <header className={s.header}>
        <div className={`mono ${s.kicker}`}>
          <span className={s.dot} aria-hidden="true" />
          <span className={s.kind}>{t(own ? 'kind.own' : 'kind.job')}</span>
          <span className="text-muted">{copy.span}</span>
        </div>

        <h1 className={s.title}>{entry.title}</h1>
        <p className={s.lede}>{copy.blurb}</p>

        <div className={s.actions}>
          <a className="btn btn-primary" href={entry.href} target="_blank" rel="noopener">
            {copy.cta}
          </a>
          {/* Shipped apps have a marketing site of their own alongside the
              App Store listing. */}
          {entry.web && (
            <a className="btn btn-secondary" href={entry.web} target="_blank" rel="noopener">
              {copy.ctaWeb}
            </a>
          )}
          <a
            className={`mono text-muted ${s.hrefLabel}`}
            href={entry.href}
            target="_blank"
            rel="noopener"
          >
            {copy.hrefLabel}
          </a>
        </div>
      </header>

      <div className={s.body}>
        <aside className={s.rail}>
          <div className={s.railBlock}>
            <span className={`mono ${s.railKicker}`}>{t('project.builtWith')}</span>
            <ul className={s.railList}>
              {entry.tags.map((tag) => (
                <li key={tag} className={`mono ${s.railItem}`}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className={s.railBlock}>
            <span className={`mono ${s.railKicker}`}>{t('project.when')}</span>
            <span className={`mono ${s.railItem}`}>{copy.span}</span>
          </div>
        </aside>

        <div className={s.content}>
          {entry.images ? (
            entry.orient === 'portrait' ? (
              <div className={s.portraitGrid}>
                {entry.images.map((name, i) => (
                  <figure key={name} className={s.figure}>
                    <div className={s.bezel}>
                      <Picture
                        name={name}
                        alt={`${entry.title} — ${copy.captions[i] ?? ''}`}
                        sizes="(max-width: 600px) 90vw, (max-width: 900px) 40vw, 280px"
                        className={s.screen}
                        eager={i === 0}
                      />
                    </div>
                    <figcaption className={`mono ${s.caption}`}>{copy.captions[i]}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className={s.landscapeStack}>
                {entry.images.map((name, i) => (
                  <figure key={name} className={s.figure}>
                    <Picture
                      name={name}
                      alt={`${entry.title} — ${copy.captions[i] ?? ''}`}
                      sizes="(max-width: 900px) 100vw, 900px"
                      className={s.wide}
                      eager={i === 0}
                    />
                    <figcaption className={`mono ${s.caption}`}>{copy.captions[i]}</figcaption>
                  </figure>
                ))}
              </div>
            )
          ) : (
            <OwnedNotes notes={copy.notes} large />
          )}

          <nav className={`mono ${s.footer}`} aria-label={t('work.timeline')}>
            <Link to={lp(`/projects/${ENTRIES[prev].slug}`)} className={s.footerLink}>
              ← {ENTRIES[prev].title}
            </Link>
            <Link to={lp(`/projects/${ENTRIES[next].slug}`)} className={s.footerLink}>
              {ENTRIES[next].title} →
            </Link>
          </nav>
        </div>
      </div>
    </main>
  )
}
