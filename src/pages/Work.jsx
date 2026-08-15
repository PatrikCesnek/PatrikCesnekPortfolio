import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { ENTRIES } from '../content/entries.js'
import Hero from '../components/Hero.jsx'
import ScrubTrack from '../components/ScrubTrack.jsx'
import s from './Work.module.css'

export default function Work() {
  const { hash } = useLocation()

  // The hero opens on the newest entry, unless a hash names one — /#sideq.
  const [activeIndex, setActiveIndex] = useState(() => {
    const fromHash = ENTRIES.findIndex((e) => e.slug === hash.replace('#', ''))
    return fromHash >= 0 ? fromHash : ENTRIES.length - 1
  })

  const select = useCallback((i) => {
    setActiveIndex(i)
    // replaceState, not a router navigation: the active entry is ephemeral
    // state that happens to be linkable, and should not add history entries.
    window.history.replaceState(null, '', `#${ENTRIES[i].slug}`)
  }, [])

  return (
    <main id="content" className={s.page}>
      <Hero entry={ENTRIES[activeIndex]} />
      <ScrubTrack activeIndex={activeIndex} onChange={select} />
    </main>
  )
}
