import { describe, it, expect } from 'vitest'
import { ENTRIES, OWN, bySlug, indexOfSlug, T_MIN, T_MAX } from '../entries.js'

describe('ENTRIES', () => {
  it('holds ten entries ordered oldest first', () => {
    expect(ENTRIES).toHaveLength(10)
    const ts = ENTRIES.map((e) => e.t)
    expect([...ts].sort((a, b) => a - b)).toEqual(ts)
  })

  it('keeps every t inside the track range', () => {
    for (const e of ENTRIES) {
      expect(e.t).toBeGreaterThanOrEqual(T_MIN)
      expect(e.t).toBeLessThanOrEqual(T_MAX)
    }
  })

  it('gives every entry a unique slug', () => {
    const slugs = ENTRIES.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(10)
  })

  it('gives every entry a year matching its date', () => {
    for (const e of ENTRIES) expect(e.date.startsWith(e.year)).toBe(true)
  })

  it('never gives a job entry screenshots', () => {
    for (const e of ENTRIES) {
      if (e.kind === 'job') expect(e.images).toBeUndefined()
    }
  })

  it('gives shipped own projects screenshots and captions to match', () => {
    for (const e of OWN) {
      if (e.slug === 'independent-ios') continue
      expect(e.images?.length, e.slug).toBeGreaterThan(0)
    }
  })

  it('marks the two landscape-only games as landscape', () => {
    const landscape = OWN.filter((e) => e.images && e.orient !== 'portrait')
    expect(landscape.map((e) => e.slug)).toEqual(['apex-ryde', 'reaper'])
  })

  it('points the shipped apps at the App Store', () => {
    expect(bySlug('worldwanderer').href).toContain('apps.apple.com')
    expect(bySlug('sideq').href).toContain('apps.apple.com')
  })

  it('resolves entries by slug', () => {
    expect(bySlug('apex-ryde').title).toBe('Apex Ryde')
    expect(bySlug('reaper').title).toBe('Reaper')
    expect(bySlug('nope')).toBeUndefined()
    expect(indexOfSlug('apex-ryde')).toBe(8)
    expect(indexOfSlug('reaper')).toBe(9)
    expect(indexOfSlug('nope')).toBe(-1)
  })
})
