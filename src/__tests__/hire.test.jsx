import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App.jsx'
import en from '../i18n/locales/en.json'
import cs from '../i18n/locales/cs.json'
import sk from '../i18n/locales/sk.json'
import { person, service, faqPage } from '../../scripts/structured-data.mjs'

const at = (url) => renderToStaticMarkup(<StaticRouter location={url}><App /></StaticRouter>)

const SITE = 'https://example.test'

describe('hire page', () => {
  it.each([
    ['/hire', en],
    ['/cs/hire', cs],
    ['/sk/hire', sk],
  ])('renders %s in the right language', (url, dict) => {
    const html = at(url)
    expect(html).toContain(dict.hire.title)
    expect(html).toContain(dict.hire.status)
    expect(html).toContain(dict.hire.ctaButton)
  })

  /**
   * The reason this page exists. Before it, "Praha" and "Bratislava" appeared
   * nowhere on the site in any language — only "Brno", and only in the nav
   * role and the about page. A city that is never written cannot be matched.
   */
  it.each([
    ['/hire', ['Brno', 'Praha', 'Bratislava']],
    ['/cs/hire', ['Brno', 'Praha', 'Bratislava']],
    ['/sk/hire', ['Brno', 'Praha', 'Bratislava']],
  ])('names every target city on %s', (url, cities) => {
    const html = at(url)
    for (const city of cities) expect(html, city).toContain(city)
  })

  it('renders every service, location, step and FAQ pair', () => {
    const html = at('/hire')
    for (const { name } of en.hire.services) expect(html, name).toContain(name)
    for (const { name } of en.hire.cities) expect(html, name).toContain(name)
    for (const { name } of en.hire.process) expect(html, name).toContain(name)
    for (const { q } of en.hire.faq) expect(html, q).toContain(q)
  })

  /** Answers are the page's densest prose — hiding them would waste the page. */
  it('renders FAQ answers in the markup, not behind a disclosure', () => {
    const html = at('/hire')
    expect(html).not.toContain('<details')
    for (const { a } of en.hire.faq) {
      expect(html, a.slice(0, 40)).toContain(a.replace(/'/g, '&#x27;'))
    }
  })

  it('states one subject, once', () => {
    const h1 = at('/hire').match(/<h1[^>]*>/g) ?? []
    expect(h1).toHaveLength(1)
  })

  it('is reachable from the nav in every locale', () => {
    for (const [prefix, dict] of [['', en], ['/cs', cs], ['/sk', sk]]) {
      const html = at(`${prefix}/`)
      expect(html).toContain(`href="${prefix}/hire"`)
      expect(html).toContain(dict.nav.hire)
    }
  })
})

describe('hire structured data', () => {
  /**
   * person.makesOffer is a bare @id reference. If the node it points at ever
   * stops travelling with it, the graph still validates and silently says
   * nothing about what is for sale.
   */
  it('resolves the offer reference person points at', () => {
    const offerId = person(SITE, en).makesOffer['@id']
    expect(offerId).toBe(service(SITE, en)['@id'])
  })

  it('claims every target city as an area served', () => {
    const names = service(SITE, en).areaServed.map((a) => a.name)
    expect(names).toEqual(expect.arrayContaining(['Brno', 'Praha', 'Bratislava']))
  })

  it('carries Prague under the name an English query would use', () => {
    const praha = service(SITE, en).areaServed.find((a) => a.name === 'Praha')
    expect(praha.alternateName).toBe('Prague')
  })

  it('locates the occupation in the cities, not just the EU', () => {
    const where = person(SITE, en).hasOccupation.occupationLocation.map((c) => c.name)
    expect(where).toEqual(['Brno', 'Praha', 'Bratislava'])
  })

  it.each([
    ['en', en],
    ['cs', cs],
    ['sk', sk],
  ])('mirrors the %s FAQ into the graph', (locale, dict) => {
    const node = faqPage(SITE, dict, '/hire')
    expect(node.mainEntity).toHaveLength(dict.hire.faq.length)
    expect(node.mainEntity[0].name).toBe(dict.hire.faq[0].q)
    expect(node.mainEntity[0].acceptedAnswer.text).toBe(dict.hire.faq[0].a)
    expect(node.inLanguage).toBe(dict.meta.htmlLang)
  })
})
