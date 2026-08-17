import { useEffect } from 'react'

/**
 * Keeps `document.title` in step with the route.
 *
 * Every route ships a prerendered <title>, but that title is only correct for
 * the page the visitor first landed on — a client-side navigation replaces the
 * whole document body and leaves the tab saying something else. The 404 is
 * where that hurts most: the tab is the one place a wrong URL still announces
 * itself, to a screen reader and to a human scanning twenty open tabs.
 *
 * There is no cleanup on purpose. Restoring the previous title on unmount
 * would hand the *next* route the title of the one before it, which is the
 * same bug pointed the other way. Every page sets its own instead.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}
