import { useFocusOnMount } from '../hooks/useFocusOnMount.js'
import s from './StatusPage.module.css'

/**
 * The layout both dead ends share — a wrong URL and a crashed page.
 *
 * It borrows the hero's shape on purpose: giant ghost glyph behind, mono
 * kicker, oversized title, lede, actions. Landing on an error should feel
 * like the same site, not like falling out of it.
 *
 * @param {string} ghost   Decorative glyph behind the column — never read out.
 * @param {string} kicker  Mono label above the title; carries the status code.
 * @param {string} title   The h1. Plain language, because it is the message.
 */
export default function StatusPage({ ghost, kicker, title, description, children }) {
  // Nothing announces a client-side route change, and this is the one page
  // whose entire content is "that didn't work". Focus makes it heard.
  const heading = useFocusOnMount()

  return (
    <main id="content" className={s.page}>
      {/* First in source so it paints behind the column, and hidden from the
          accessibility tree: "404" spoken aloud is noise, the h1 is the fact. */}
      <span className={`${s.ghost} ${s.ghostAnim}`} aria-hidden="true">
        {ghost}
      </span>

      <div className={s.text}>
        <p className={`mono anim-up ${s.kicker}`}>{kicker}</p>

        {/* tabIndex so it can take focus on arrival without joining the tab order. */}
        <h1
          ref={heading}
          tabIndex={-1}
          className={`anim-up ${s.title}`}
          style={{ '--delay': '30ms' }}
        >
          {title}
        </h1>

        <p className={`anim-up ${s.body}`} style={{ '--delay': '60ms' }}>
          {description}
        </p>

        {children ? (
          <div className={`anim-up ${s.extras}`} style={{ '--delay': '90ms' }}>
            {children}
          </div>
        ) : null}
      </div>
    </main>
  )
}
