import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { ENTRIES } from '../content/entries.js'
import { useLocale } from '../i18n/index.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import Hero from '../components/Hero.jsx'
import ScrubTrack from '../components/ScrubTrack.jsx'
import WorkCard from '../components/WorkCard.jsx'
import s from './Work.module.css'

/** The grid runs newest first — the reverse of the timeline's own order. */
const NEWEST_FIRST = [...ENTRIES].reverse()

export default function Work() {
  const { hash } = useLocation()
  const { t } = useLocale()

  useDocumentTitle(t('meta.siteTitle'))

  // The hero opens on the newest entry, unless a hash names one — /#sideq.
  const [activeIndex, setActiveIndex] = useState(() => {
    const fromHash = ENTRIES.findIndex((e) => e.slug === hash.replace('#', ''))
    return fromHash >= 0 ? fromHash : ENTRIES.length - 1
  })

  const select = useCallback((i) => {
    setActiveIndex(i)
    // replaceState, not a router navigation: the active entry is ephemeral
    // state that happens to be linkable, and should not stack history entries.
    window.history.replaceState(null, '', `#${ENTRIES[i].slug}`)
  }, [])

  return (
    <main id="content" className={s.page}>
      {/* The design gives the hero to the active project, so the page's real
          subject is stated here for crawlers and screen readers. */}
      <h1 className="visually-hidden">{t('meta.h1')}</h1>

      <Hero entry={ENTRIES[activeIndex]} />
      <ScrubTrack activeIndex={activeIndex} onChange={select} />

      <section className={s.grid}>
        <h2 className={`mono ${s.heading}`}>{t('work.gridHeading')}</h2>
        <div className={s.cards}>
          {NEWEST_FIRST.map((entry, i) => (
            <WorkCard key={entry.slug} entry={entry} index={i} />
          ))}
        </div>
      </section>
    </main>
  )
}
