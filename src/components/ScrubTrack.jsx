import { useRef, useState, useEffect, useCallback } from 'react'
import { ENTRIES } from '../content/entries.js'
import { position, indexFromPointer, tickLabel, isMinorTick } from '../lib/track.js'
import { useLocale } from '../i18n/index.js'
import s from './ScrubTrack.module.css'

const pad = (n) => String(n).padStart(2, '0')

export default function ScrubTrack({ activeIndex, onChange }) {
  const { t, dict } = useLocale()
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)

  // Below 600px the track becomes a snap-scroller; drag handlers would fight
  // the native scroll, so they are attached only above that width. Read in an
  // effect so the prerendered markup stays neutral.
  const [scrubbable, setScrubbable] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 601px)')
    const sync = () => setScrubbable(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const active = ENTRIES[activeIndex]
  const months = dict.months

  const setFromPointer = useCallback(
    (clientX) => {
      const rect = ref.current?.getBoundingClientRect()
      if (rect) onChange(indexFromPointer(clientX, rect, ENTRIES))
    },
    [onChange]
  )

  const onPointerDown = (e) => {
    if (!scrubbable) return
    ref.current.setPointerCapture(e.pointerId)
    setDragging(true)
    setFromPointer(e.clientX)
  }

  const onPointerMove = (e) => {
    if (dragging) setFromPointer(e.clientX)
  }

  const endDrag = (e) => {
    setDragging(false)
    if (ref.current?.hasPointerCapture?.(e.pointerId)) ref.current.releasePointerCapture(e.pointerId)
  }

  const onKeyDown = (e) => {
    const last = ENTRIES.length - 1
    const go = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: last }[e.key]
    if (go === undefined) return
    e.preventDefault()
    onChange(Math.min(last, Math.max(0, go)))
  }

  return (
    <section className={s.wrap} aria-label={t('work.timeline')}>
      <div className={`mono ${s.header}`}>
        <span className="text-muted">
          {t(scrubbable ? 'work.trackHint' : 'work.trackHintTouch', { count: ENTRIES.length })}
        </span>
        <span className={s.counter}>
          {pad(activeIndex + 1)} / {pad(ENTRIES.length)}
        </span>
      </div>

      <div className={s.viewport}>
        <div
          ref={ref}
          className={s.track}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={ENTRIES.length - 1}
          aria-valuenow={activeIndex}
          aria-valuetext={active.title}
          aria-label={t('work.timeline')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        >
          {/* Freestanding rules fade to transparent at their ends — Nocturne. */}
          <span className={s.baseline} aria-hidden="true" />
          <span
            className={s.fill}
            aria-hidden="true"
            style={{ width: `${position(active.t)}%` }}
          />

          {ENTRIES.map((entry, i) => {
            const isActive = i === activeIndex
            const markClass = isActive ? s.markActive : entry.kind === 'own' ? s.markOwn : s.markJob

            return (
              <button
                key={entry.slug}
                type="button"
                className={`${s.tick} ${isActive ? s.tickActive : ''}`}
                style={{ left: `${position(entry.t)}%` }}
                data-minor={isMinorTick(entry, i, ENTRIES) ? 'true' : 'false'}
                aria-label={`${entry.title} — ${entry.date}`}
                aria-pressed={isActive}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(i)
                }}
              >
                <span className={s.markBox} aria-hidden="true">
                  <span className={`${s.mark} ${markClass}`} />
                </span>
                <span className={`${s.dot} ${isActive ? s.dotActive : ''}`} aria-hidden="true" />
                <span
                  className={`mono ${s.label} ${isActive ? s.labelActive : ''}`}
                  style={{ marginTop: i % 2 === 0 ? 0 : 14 }}
                >
                  {tickLabel(entry, i, ENTRIES, months)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
