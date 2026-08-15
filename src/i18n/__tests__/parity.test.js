import { describe, it, expect } from 'vitest'
import en from '../locales/en.json'
import cs from '../locales/cs.json'
import sk from '../locales/sk.json'
import { ENTRIES } from '../../content/entries.js'

const paths = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k
    return v && typeof v === 'object' && !Array.isArray(v) ? paths(v, p) : [p]
  })

const at = (obj, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj)

describe.each([
  ['cs', cs],
  ['sk', sk],
])('%s dictionary', (name, dict) => {
  it('has every key English has', () => {
    const missing = paths(en).filter((p) => at(dict, p) === undefined)
    expect(missing).toEqual([])
  })

  it('has no keys English lacks', () => {
    const extra = paths(dict).filter((p) => at(en, p) === undefined)
    expect(extra).toEqual([])
  })

  it('matches every array length', () => {
    for (const p of paths(en)) {
      const a = at(en, p)
      if (Array.isArray(a)) expect(at(dict, p), p).toHaveLength(a.length)
    }
  })

  it('covers all nine entries', () => {
    for (const e of ENTRIES) expect(dict.entries[e.slug], e.slug).toBeDefined()
  })

  it('has twelve month abbreviations', () => {
    expect(dict.months).toHaveLength(12)
  })

  it('gives every entry captions matching its screenshot count', () => {
    for (const e of ENTRIES) {
      expect(dict.entries[e.slug].captions, e.slug).toHaveLength(e.images?.length ?? 0)
    }
  })

  it('is actually translated, not a copy of English', () => {
    expect(dict.about.title).not.toBe(en.about.title)
    expect(dict.lab.lede).not.toBe(en.lab.lede)
    expect(dict.nav.contact).not.toBe(en.nav.contact)
    expect(dict.entries.sideq.blurb).not.toBe(en.entries.sideq.blurb)
  })

  it('leaves no string empty', () => {
    for (const p of paths(en)) {
      const v = at(dict, p)
      if (typeof v === 'string') expect(v.trim(), p).not.toBe('')
    }
  })
})

describe('English dictionary', () => {
  it('gives every entry captions matching its screenshot count', () => {
    for (const e of ENTRIES) {
      expect(en.entries[e.slug].captions, e.slug).toHaveLength(e.images?.length ?? 0)
    }
  })
})
