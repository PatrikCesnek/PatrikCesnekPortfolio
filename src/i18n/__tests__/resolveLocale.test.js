import { describe, it, expect } from 'vitest'
import { resolveLocale, stripLocale, localePath, localeFromPath } from '../resolveLocale.js'

describe('resolveLocale', () => {
  it('prefers an explicit path prefix over everything else', () => {
    expect(resolveLocale({ pathname: '/cs/about', stored: 'sk', navigatorLangs: ['en-US'] })).toBe('cs')
  })

  it('falls back to the stored preference when the path is unprefixed', () => {
    expect(resolveLocale({ pathname: '/about', stored: 'sk', navigatorLangs: ['en-US'] })).toBe('sk')
  })

  it('falls back to the navigator language when nothing is stored', () => {
    expect(resolveLocale({ pathname: '/', stored: null, navigatorLangs: ['cs-CZ', 'en'] })).toBe('cs')
  })

  it('falls back to English for an unsupported navigator language', () => {
    expect(resolveLocale({ pathname: '/', stored: null, navigatorLangs: ['fr-FR'] })).toBe('en')
  })

  it('ignores an unsupported prefix rather than treating it as a locale', () => {
    expect(resolveLocale({ pathname: '/de/about', stored: null, navigatorLangs: ['fr'] })).toBe('en')
  })

  it('ignores a stored value that is not a supported locale', () => {
    expect(resolveLocale({ pathname: '/', stored: 'de', navigatorLangs: ['sk'] })).toBe('sk')
  })

  it('never treats the unprefixed default as a prefix', () => {
    expect(localeFromPath('/en/about')).toBe(null)
  })

  it('survives being called with nothing', () => {
    expect(resolveLocale()).toBe('en')
  })
})

describe('stripLocale', () => {
  it('removes a locale prefix', () => {
    expect(stripLocale('/cs/projects/sideq')).toBe('/projects/sideq')
    expect(stripLocale('/sk')).toBe('/')
  })

  it('leaves an unprefixed path alone', () => {
    expect(stripLocale('/projects/sideq')).toBe('/projects/sideq')
    expect(stripLocale('/')).toBe('/')
  })

  it('does not mistake a route for a locale', () => {
    expect(stripLocale('/cv')).toBe('/cv')
    expect(stripLocale('/lab')).toBe('/lab')
  })
})

describe('localePath', () => {
  it('leaves English unprefixed', () => {
    expect(localePath('en', '/about')).toBe('/about')
    expect(localePath('en', '/')).toBe('/')
  })

  it('prefixes the other locales', () => {
    expect(localePath('cs', '/about')).toBe('/cs/about')
    expect(localePath('sk', '/')).toBe('/sk')
    expect(localePath('cs', '/projects/apex-ryde')).toBe('/cs/projects/apex-ryde')
  })

  it('round-trips with stripLocale', () => {
    for (const locale of ['en', 'cs', 'sk']) {
      for (const path of ['/', '/lab', '/projects/sideq']) {
        expect(stripLocale(localePath(locale, path))).toBe(path)
      }
    }
  })
})
