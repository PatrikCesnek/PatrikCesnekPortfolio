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
      // The project page's lede is the full blurb, not the card one-liner.
      expect(html, prefix).toContain(dict.entries.sideq.blurb)
    }
  })
})

describe('hero', () => {
  it('opens on the newest entry — Apex Ryde, a landscape project', () => {
    const html = at('/')
    expect(html).toContain('Apex Ryde')
    expect(html).toContain(en.entries['apex-ryde'].blurb)
    expect(html).toContain(en.entries['apex-ryde'].captions[0])
  })

  it('renders the ghost year as decorative', () => {
    expect(at('/')).toMatch(/aria-hidden="true"[^>]*>2026</)
  })

  it('shows every tag of the active entry', () => {
    const html = at('/')
    for (const tag of ['Swift', 'SceneKit', 'Physics', 'No dependencies']) {
      expect(html).toContain(`>${tag}<`)
    }
  })

  it('gives every screenshot real alt text, never an empty one', () => {
    const html = at('/')
    const imgs = html.match(/<img[^>]*>/g) ?? []
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]+"/)
    }
  })

  it('serves modern formats ahead of the jpeg fallback', () => {
    const html = at('/')
    expect(html).toContain('type="image/avif"')
    expect(html).toContain('type="image/webp"')
  })

  it('opens on the entry a hash names', () => {
    const html = at('/#o2-slovakia')
    expect(html).toContain('O2 Slovakia')
    expect(html).toContain(en.entries['o2-slovakia'].blurb)
  })

  it('describes client work instead of showing it', () => {
    const html = at('/#o2-slovakia')
    expect(html).toContain(en.work.owned)
    expect(html).toContain(en.work.notShown)
    for (const note of en.entries['o2-slovakia'].notes) expect(html).toContain(note)

    // The hero itself shows no screenshot for a job entry. Scope to the hero:
    // it ends where the track begins, and the card grid below legitimately
    // carries images for the own projects.
    const trackStart = html.indexOf(`aria-label="${en.work.timeline}"`)
    expect(trackStart).toBeGreaterThan(-1)
    expect(html.slice(0, trackStart)).not.toContain('<img')
  })
})

describe('work grid', () => {
  it('lists all nine entries', () => {
    const html = at('/')
    for (const e of ENTRIES) expect(html, e.slug).toContain(e.title)
  })

  it('orders them newest first', () => {
    const html = at('/')
    const grid = html.slice(html.indexOf(en.work.gridHeading))
    const order = ENTRIES.map((e) => e.title).filter((title) => grid.includes(title))
    const positions = order.map((title) => grid.indexOf(title))
    // Reverse chronological: each title appears before the one older than it.
    expect([...positions].sort((a, b) => b - a)).toEqual(positions)
  })

  it('gives entries without screenshots a striped tile carrying their coverNote', () => {
    const html = at('/')
    for (const e of ENTRIES.filter((x) => !x.images)) {
      expect(html, e.slug).toContain(en.entries[e.slug].coverNote)
    }
  })

  it('links every card to its project page', () => {
    const html = at('/')
    expect(html).toContain(en.work.gridHeading)
    for (const e of ENTRIES) expect(html, e.slug).toContain(en.entries[e.slug].short)
  })
})

describe('project page', () => {
  it('renders a portrait project as one bezel per screenshot, captioned', () => {
    const html = at('/projects/sideq')
    const sideq = ENTRIES.find((e) => e.slug === 'sideq')
    expect((html.match(/<img/g) ?? []).length).toBe(sideq.images.length)
    for (const caption of en.entries.sideq.captions) expect(html).toContain(caption)
  })

  it('renders a landscape project as wide figures', () => {
    const html = at('/projects/apex-ryde')
    for (const caption of en.entries['apex-ryde'].captions) expect(html).toContain(caption)
  })

  it('describes client work at the larger scale, never showing it', () => {
    const html = at('/projects/o2-slovakia')
    expect(html).toContain(en.work.owned)
    expect(html).toContain(en.project.notShownLong)
    expect(html).not.toContain('<img')
  })

  it('lists the entry tags in the rail', () => {
    const html = at('/projects/o2-slovakia')
    expect(html).toContain(en.project.builtWith)
    expect(html).toContain(en.project.when)
    for (const tag of ENTRIES.find((e) => e.slug === 'o2-slovakia').tags) {
      expect(html).toContain(tag)
    }
  })

  it('sends the outbound CTA to the App Store for shipped apps', () => {
    expect(at('/projects/sideq')).toContain('https://apps.apple.com/app/sideq/id6767996805')
    expect(at('/projects/worldwanderer')).toContain('https://apps.apple.com/app/id6772739029')
  })

  it('wraps prev/next around the ends, oldest on the left', () => {
    // Apex Ryde is newest: next wraps to the oldest, prev is SideQ.
    const newest = at('/projects/apex-ryde')
    expect(newest).toContain('Independent iOS →')
    expect(newest).toContain('← SideQ')

    // Independent iOS is oldest: prev wraps back to the newest.
    const oldest = at('/projects/independent-ios')
    expect(oldest).toContain('← Apex Ryde')
    expect(oldest).toContain('Matee →')
  })

  it('keeps prev/next inside the active locale', () => {
    const html = at('/cs/projects/sideq')
    expect(html).toContain('href="/cs/projects/worldwanderer"')
    expect(html).toContain('href="/cs/projects/apex-ryde"')
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
