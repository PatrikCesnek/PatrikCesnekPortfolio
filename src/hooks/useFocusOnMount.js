import { useEffect, useRef } from 'react'

/**
 * Moves focus to an element once, on mount, and returns the ref to attach.
 *
 * A client-side navigation swaps the page without telling assistive tech that
 * anything happened — there is no load event to announce. For a page the
 * visitor asked for, the content itself is the answer. For a 404 or a crash it
 * is not: the whole message is "you did not get what you clicked", and a
 * screen-reader user would otherwise hear silence and assume nothing moved.
 *
 * The target needs `tabIndex={-1}` so it can take focus without joining the
 * tab order. Scrolling is left to ScrollToTop, which has already run.
 */
export function useFocusOnMount() {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  return ref
}
