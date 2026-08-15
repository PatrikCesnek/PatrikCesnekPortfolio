import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App.jsx'
import { ENTRIES } from '../content/entries.js'
import en from '../i18n/locales/en.json'
import cs from '../i18n/locales/cs.json'
import sk from '../i18n/locales/sk.json'

const at = (url) => renderToStaticMarkup(<StaticRouter location={url}><App /></StaticRouter>)

describe('app shell', () => {
  it('renders the brand and every nav item on the home route', () => {
    const html = at('/')
    expect(html).toContain('Patrik Cesnek')
    for (const key of ['work', 'lab', 'about', 'cv']) {
      expect(html).toContain(en.nav[key])
    }
    expect(html).toContain(en.nav.contact)
  })

  it('renders the footer identity and outbound links', () => {
    const html = at('/')
    expect(html).toContain(en.footer.identity)
    expect(html).toContain('sidequest-ios.netlify.app')
    expect(html).toContain('worldwanderer-web.netlify.app')
  })

  it('gives every outbound link rel=noopener', () => {
    const html = at('/')
    const external = html.match(/<a[^>]*target="_blank"[^>]*>/g) ?? []
    expect(external.length).toBeGreaterThan(0)
    for (const tag of external) expect(tag).toContain('noopener')
  })

  it('offers all three languages in the switcher', () => {
    const html = at('/')
    for (const code of ['EN', 'CS', 'SK']) expect(html).toContain(`>${code}<`)
  })
})

describe('locale routing', () => {
  it.each([
    ['/', en],
    ['/cs', cs],
    ['/sk', sk],
  ])('renders %s in the right language', (url, dict) => {
    const html = at(url)
    expect(html).toContain(dict.nav.contact)
    expect(html).toContain(dict.nav.about)
  })

  it('keeps the language switcher pointing at the same route', () => {
    const html = at('/cs/about')
    expect(html).toContain('href="/about"')
    expect(html).toContain('href="/sk/about"')
  })

  it('renders project pages under every locale', () => {
    for (const [prefix, dict] of [['', en], ['/cs', cs], ['/sk', sk]]) {
      const html = at(`${prefix}/projects/sideq`)
      expect(html, prefix).toContain('SideQ')
      expect(html, prefix).toContain(dict.entries.sideq.short)
    }
  })
})

describe('routes', () => {
  it('renders every project slug without throwing', () => {
    for (const e of ENTRIES) {
      expect(() => at(`/projects/${e.slug}`), e.slug).not.toThrow()
    }
  })

  it('renders a 404 for an unknown project', () => {
    expect(at('/projects/nope')).toContain(en.project.notFound)
  })

  it('renders a 404 for an unknown route', () => {
    expect(at('/nonsense')).toContain(en.project.notFound)
  })

  it('never leaves a raw translation key in the output', () => {
    for (const url of ['/', '/lab', '/about', '/cv', '/cs', '/sk/cv']) {
      expect(at(url), url).not.toMatch(/>(nav|work|about|cv|lab|project|footer)\.\w+</)
    }
  })
})
