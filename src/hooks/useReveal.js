import { useEffect, useRef, useState } from 'react'

/**
 * Reveal an element once it scrolls into view.
 *
 * Starts as `null` so the server-rendered markup carries no reveal state at
 * all — a crawler, or anyone without JavaScript, sees plain visible content.
 * Only after mount does it become "pending" and then "shown".
 */
export function useReveal({ rootMargin = '0px 0px -10% 0px', threshold = 0.1 } = {}) {
  const ref = useRef(null)
  const [state, setState] = useState(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver, or motion is unwelcome: show it and stop.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setState('shown')
      return
    }

    // Anything already on screen at mount should not flash in.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) {
      setState('shown')
      return
    }

    setState('pending')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('shown')
        io.disconnect()
      },
      { rootMargin, threshold }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, threshold])

  return [ref, state]
}
