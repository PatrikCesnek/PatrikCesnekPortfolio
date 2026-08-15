import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Every navigation lands at the top, per the handoff's interaction table. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
