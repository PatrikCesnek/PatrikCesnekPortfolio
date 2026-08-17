import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App.jsx'
import { ENTRIES } from '../content/entries.js'
import { WEB_PROJECTS } from '../content/webProjects.js'
import en from '../i18n/locales/en.json'
import cs from '../i18n/locales/cs.json'
import sk from '../i18n/locales/sk.json'

const at = (url) => renderToStaticMarkup(<StaticRouter location={url}><App /></StaticRouter>)

/**
 * Same markup with text entities decoded, for asserting on prose. React
 * escapes apostrophes and ampersands, so "I've" ships as "I&#x27;ve".
 * Angle brackets are deliberately left alone so `<img` assertions stay honest.
 */
const text = (url) =>
  at(url).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')

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

  it('offers a second button to each shipped app’s own site', () => {
    const sideq = at('/projects/sideq')
    expect(sideq).toContain('https://sidequest-ios.netlify.app/')
    expect(sideq).toContain(en.entries.sideq.ctaWeb)

    const ww = at('/projects/worldwanderer')
    expect(ww).toContain('worldwanderer-web.netlify.app/?lang=en#apple-maps')
    expect(ww).toContain(en.entries.worldwanderer.ctaWeb)
  })

  it('never links to the Netlify admin console', () => {
    for (const e of ENTRIES) {
      expect(at(`/projects/${e.slug}`), e.slug).not.toContain('app.netlify.com')
    }
  })

  it('points Apex Ryde at its live site', () => {
    expect(at('/projects/apex-ryde')).toContain('https://apex-ryder.netlify.app')
  })

  it('shows a web button only where one exists', () => {
    // Apex has no separate marketing site beyond its own href.
    const withWeb = ENTRIES.filter((e) => e.web).map((e) => e.slug)
    expect(withWeb).toEqual(['worldwanderer', 'sideq'])
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

describe('lab', () => {
  it('lists own projects only, newest first', () => {
    const html = at('/lab')
    const own = ENTRIES.filter((e) => e.kind === 'own')
    for (const e of own) expect(html, e.slug).toContain(e.title)
    for (const e of ENTRIES.filter((x) => x.kind === 'job')) {
      expect(html, e.slug).not.toContain(`>${e.title}<`)
    }
    const body = html.slice(html.indexOf(en.lab.lede))
    const positions = own.map((e) => body.indexOf(e.title))
    expect([...positions].sort((a, b) => b - a)).toEqual(positions)
  })

  it('gives Independent iOS a placeholder — it is own but has no screenshots', () => {
    expect(at('/lab')).toContain(en.entries['independent-ios'].coverNote)
  })
})

describe('web section', () => {
  it('lists all three shipped marketing sites', () => {
    const html = text('/lab')
    expect(html).toContain(en.web.heading)
    for (const site of WEB_PROJECTS) {
      expect(html, site.slug).toContain(site.href)
      expect(html, site.slug).toContain(en.web.sites[site.slug])
    }
  })

  it('shows the languages each site actually ships', () => {
    const html = at('/lab')
    expect(html).toContain('EN · CS · SK · DE · ES')
  })

  it('opens each site in a new tab safely', () => {
    const html = at('/lab')
    for (const site of WEB_PROJECTS) {
      const tag = html.match(new RegExp(`<a[^>]*href="${site.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`))
      expect(tag, site.slug).not.toBeNull()
      expect(tag[0], site.slug).toContain('rel="noopener"')
      expect(tag[0], site.slug).toContain('target="_blank"')
    }
  })

  it('gives each card a real preview image with alt text', () => {
    const html = at('/lab')
    for (const site of WEB_PROJECTS) {
      expect(html, site.slug).toContain(`/img/${site.image}-`)
    }
    expect(html).toContain('The SideQ site')
  })

  it('translates the section', () => {
    for (const [url, dict] of [['/cs/lab', cs], ['/sk/lab', sk]]) {
      const html = text(url)
      expect(html, url).toContain(dict.web.lede)
      expect(html, url).toContain(dict.web.sites.sideq)
    }
  })
})

describe('about', () => {
  it('renders all three paragraphs and the portrait', () => {
    const html = text('/about')
    for (const para of en.about.paragraphs) expect(html).toContain(para)
    expect(html).toContain('/img/portrait-640.jpg')
    expect(html).toContain(en.about.portraitCaption)
  })

  it('renders six skill groups with their untranslated items', () => {
    const html = text('/about')
    for (const g of en.skills) {
      expect(html).toContain(g.group)
      expect(html).toContain(g.note)
    }
    expect(html).toContain('Kotlin Multiplatform (~2 yrs)')
  })

  it('keeps technical terms in English while translating the prose', () => {
    const html = text('/cs/about')
    expect(html).toContain(cs.about.title)
    expect(html).toContain(cs.skills[0].note)
    expect(html).toContain('SwiftUI (7+ yrs)')
  })

  it('links email and phone', () => {
    const html = at('/about')
    expect(html).toContain('mailto:pcesnek290@gmail.com')
    expect(html).toContain('tel:+421948093464')
  })
})

describe('cv', () => {
  it('lists all nine entries newest first with OWN/CONTRACT labels', () => {
    const html = at('/cv')
    for (const e of ENTRIES) expect(html, e.slug).toContain(e.title)
    expect(html).toContain(`>${en.kind.ownShort}<`)
    expect(html).toContain(`>${en.kind.jobShort}<`)
  })

  it('downloads a real PDF rather than opening email', () => {
    const html = at('/cv')
    expect(html).toContain('href="/cv/Patrik_Cesnek_CV.pdf"')
    expect(html).toContain('download="Patrik_Cesnek_CV.pdf"')
  })

  it('closes with the education block', () => {
    const html = at('/cv')
    expect(html).toContain(en.cv.education)
    expect(html).toContain(en.cv.school)
    expect(html).toContain(en.cv.schoolNote)
  })

  it('shows the job the independent iOS years ran alongside', () => {
    for (const [url, dict] of [['/cv', en], ['/cs/cv', cs], ['/sk/cv', sk]]) {
      const html = text(url)
      expect(html, url).toContain('Wobbegong')
      expect(html, url).toContain(dict.cv.alongside)
      expect(html, url).toContain(dict.cv.alongsideSpan)
    }
  })

  it('keeps the school name untranslated — it is already Slovak', () => {
    for (const [url, dict] of [['/cs/cv', cs], ['/sk/cv', sk]]) {
      expect(at(url)).toContain(dict.cv.school)
    }
    expect(cs.cv.school).toBe(en.cv.school)
    expect(sk.cv.school).toBe(en.cv.school)
  })
})

describe('hydration safety', () => {
  it('renders a locale determined only by the URL', () => {
    // Any dependence on localStorage or navigator during render would make
    // the prerendered HTML disagree with the hydrated tree.
    for (const [url, dict] of [['/', en], ['/cs', cs], ['/sk', sk]]) {
      expect(at(url), url).toContain(dict.nav.contact)
    }
  })

  it('renders identical markup on repeated renders of the same URL', () => {
    for (const url of ['/', '/cs/about', '/sk/projects/sideq', '/cv']) {
      expect(at(url), url).toBe(at(url))
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
    expect(text('/nonsense')).toContain(en.notFound.title)
  })

  it('never leaves a raw translation key in the output', () => {
    for (const url of ['/', '/lab', '/about', '/cv', '/cs', '/sk/cv']) {
      expect(at(url), url).not.toMatch(/>(nav|work|about|cv|lab|project|footer)\.\w+</)
    }
  })
})
