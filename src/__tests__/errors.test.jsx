import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import ErrorPage from '../pages/ErrorPage.jsx'
import { LocaleProvider } from '../i18n/index.js'
import { NAV_ITEMS } from '../content/nav.js'
import en from '../i18n/locales/en.json'
import cs from '../i18n/locales/cs.json'
import sk from '../i18n/locales/sk.json'

const at = (url) => renderToStaticMarkup(<StaticRouter location={url}><App /></StaticRouter>)

const text = (url) => at(url).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')

describe('404 page', () => {
  it('says what happened in words, not just a status code', () => {
    const html = text('/nonsense')
    expect(html).toContain(en.notFound.title)
    expect(html).toContain(en.notFound.body)
  })

  it('keeps the decorative numeral out of the accessibility tree', () => {
    const html = at('/nonsense')
    // The glyph is texture. A screen reader that reads "404" and nothing else
    // has told its user nothing they can act on.
    expect(html).toMatch(/aria-hidden="true"[^>]*>404</)
  })

  it('gives the page exactly one h1, and it is the message', () => {
    const html = text('/nonsense')
    const headings = html.match(/<h1[^>]*>(.*?)<\/h1>/g) ?? []
    expect(headings).toHaveLength(1)
    expect(headings[0]).toContain(en.notFound.title)
  })

  it('makes the heading focusable so the route change can be announced', () => {
    expect(at('/nonsense')).toMatch(/<h1[^>]*tabindex="-1"/)
  })

  it('offers every top-level destination as a way out', () => {
    const html = at('/nonsense')
    expect(html).toContain(en.notFound.home)
    for (const [, key] of NAV_ITEMS.filter(([path]) => path !== '/')) {
      expect(html, key).toContain(en.nav[key])
    }
  })

  it('labels that list of links as navigation', () => {
    expect(at('/nonsense')).toContain(`aria-label="${en.notFound.elsewhere}"`)
  })

  it('keeps the way out inside the locale the visitor is in', () => {
    const html = at('/cs/nonsense')
    expect(html).toContain('href="/cs"')
    expect(html).toContain('href="/cs/lab"')
    expect(html).toContain('href="/cs/cv"')
  })

  it.each([
    ['/nonsense', en],
    ['/cs/nonsense', cs],
    ['/sk/nonsense', sk],
  ])('renders %s in the right language', (url, dict) => {
    const html = text(url)
    expect(html).toContain(dict.notFound.title)
    expect(html).toContain(dict.notFound.body)
  })

  it('names the thing that was missing when it knows — an unknown project', () => {
    const html = text('/projects/nope')
    expect(html).toContain(en.project.notFound)
    // Still the 404 page, just with a more precise line.
    expect(html).toContain(en.notFound.title)
    expect(html).toContain(en.notFound.home)
  })

  it('leaves no raw translation key on the page', () => {
    for (const url of ['/nonsense', '/cs/nonsense', '/sk/projects/nope']) {
      expect(at(url), url).not.toMatch(/>(notFound|error|nav|meta)\.\w+</)
    }
  })
})

describe('error boundary', () => {
  let container
  let root
  let logged

  const Boom = () => {
    throw new Error('kaboom')
  }

  beforeEach(() => {
    logged = []
    // React re-throws to the console around a caught error; that is expected
    // noise here, and swallowing it keeps the real assertion readable.
    vi.spyOn(console, 'error').mockImplementation((...args) => logged.push(String(args[0])))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    container?.remove()
    container = undefined
  })

  const mount = async (tree) => {
    container?.remove()
    container = document.createElement('div')
    document.body.appendChild(container)
    await act(async () => {
      root = createRoot(container)
      root.render(tree)
    })
    return container
  }

  const rerender = async (tree) => {
    await act(async () => {
      root.render(tree)
    })
  }

  const wrap = (children, key) => (
    <BrowserRouter>
      <LocaleProvider locale="en">
        <div key={key}>{children}</div>
      </LocaleProvider>
    </BrowserRouter>
  )

  it('renders its children while nothing throws', async () => {
    const el = await mount(
      wrap(<ErrorBoundary fallback={() => <p>fallback</p>}><p>fine</p></ErrorBoundary>)
    )
    expect(el.textContent).toContain('fine')
    expect(logged).toEqual([])
  })

  it('catches a render-time throw and hands the error to the fallback', async () => {
    const el = await mount(
      wrap(<ErrorBoundary fallback={(error) => <p>caught: {error.message}</p>}><Boom /></ErrorBoundary>)
    )
    expect(el.textContent).toContain('caught: kaboom')
  })

  it('logs the failure rather than swallowing it', async () => {
    await mount(wrap(<ErrorBoundary fallback={() => <p>x</p>}><Boom /></ErrorBoundary>))
    expect(logged.join('\n')).toContain('Unhandled error while rendering the page')
  })

  it('comes back clean on a new key — the reset App relies on', async () => {
    // App mounts the boundary inside a wrapper keyed on the pathname, so a
    // navigation replaces the instance. Without that a visitor whose page
    // threw would carry the error page with them for the rest of the session.
    const broken = <ErrorBoundary fallback={() => <p>broken</p>}><Boom /></ErrorBoundary>
    const working = <ErrorBoundary fallback={() => <p>broken</p>}><p>fine</p></ErrorBoundary>

    await mount(wrap(broken, '/a'))
    expect(container.textContent).toContain('broken')

    // Same key: the boundary keeps its error, by design — it holds no reset
    // of its own, so this is what a stale instance would look like.
    await rerender(wrap(working, '/a'))
    expect(container.textContent).toContain('broken')

    await rerender(wrap(working, '/b'))
    expect(container.textContent).toContain('fine')
  })

  it('renders the error page itself with a way out', async () => {
    const el = await mount(
      wrap(
        <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
          <Boom />
        </ErrorBoundary>
      )
    )
    expect(el.textContent).toContain(en.error.title)
    expect(el.textContent).toContain(en.error.reload)
    expect(el.querySelector('a[href="/"]')).not.toBeNull()

    // The message is available, collapsed, and never opens on its own.
    const details = el.querySelector('details')
    expect(details).not.toBeNull()
    expect(details.open).toBe(false)
    expect(details.textContent).toContain('kaboom')

    // The report link carries enough to act on without asking the visitor.
    const mailto = el.querySelector('a[href^="mailto:"]')
    expect(mailto).not.toBeNull()
    expect(decodeURIComponent(mailto.getAttribute('href'))).toContain('kaboom')
  })

  it('titles the tab, so the failure is visible outside the viewport', async () => {
    await mount(
      wrap(<ErrorBoundary fallback={(error) => <ErrorPage error={error} />}><Boom /></ErrorBoundary>)
    )
    expect(document.title).toBe(en.meta.titleError)
  })
})

describe('404 on the client', () => {
  let container

  afterEach(() => {
    container?.remove()
    container = undefined
  })

  const mount = async (path) => {
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)
    window.history.pushState({}, '', path)
    await act(async () => {
      createRoot(container).render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
    })
  }

  it('moves focus to the heading, the only announcement a SPA route change gets', async () => {
    await mount('/nonsense')
    expect(document.activeElement).toBe(container.querySelector('h1'))
  })

  it('sets the tab title to match', async () => {
    await mount('/nonsense')
    expect(document.title).toBe(en.meta.title404)
  })

  it('hands the next page its own title instead of keeping the 404’s', async () => {
    await mount('/nonsense')
    expect(document.title).toBe(en.meta.title404)

    container.remove()
    await mount('/lab')
    expect(document.title).toBe(en.meta.titleLab)
  })
})
