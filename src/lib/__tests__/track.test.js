import { describe, it, expect } from 'vitest'
import { position, tFromFraction, nearestIndex, indexFromPointer, tickLabel } from '../track.js'
import { ENTRIES, T_MIN, T_MAX } from '../../content/entries.js'

const rect = { left: 100, width: 1000 }
const EN_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

describe('position', () => {
  it('puts the range ends at 0% and 100%', () => {
    expect(position(T_MIN)).toBeCloseTo(0)
    expect(position(T_MAX)).toBeCloseTo(100)
  })

  it('places the midpoint at 50%', () => {
    expect(position((T_MIN + T_MAX) / 2)).toBeCloseTo(50)
  })

  it('keeps every entry on the track', () => {
    for (const e of ENTRIES) {
      expect(position(e.t), e.slug).toBeGreaterThanOrEqual(0)
      expect(position(e.t), e.slug).toBeLessThanOrEqual(100)
    }
  })

  it('orders positions the same way it orders time', () => {
    const ps = ENTRIES.map((e) => position(e.t))
    expect([...ps].sort((a, b) => a - b)).toEqual(ps)
  })
})

describe('tFromFraction', () => {
  it('is the inverse of position', () => {
    expect(position(tFromFraction(0.25))).toBeCloseTo(25)
  })

  it('clamps out-of-range fractions to the ends', () => {
    expect(tFromFraction(-1)).toBeCloseTo(T_MIN)
    expect(tFromFraction(2)).toBeCloseTo(T_MAX)
  })
})

describe('nearestIndex', () => {
  it('returns the closest entry by absolute distance', () => {
    expect(nearestIndex(2019.0, ENTRIES)).toBe(0)
    expect(nearestIndex(2030, ENTRIES)).toBe(ENTRIES.length - 1)
  })

  it('picks the nearer of two neighbours, not simply the earlier', () => {
    // Just shy of Billdu (2024.7), coming up from Freelance (2023.9).
    expect(nearestIndex(2024.6, ENTRIES)).toBe(3)
  })
})

describe('indexFromPointer', () => {
  it('snaps to the first entry at the far left', () => {
    expect(indexFromPointer(100, rect, ENTRIES)).toBe(0)
  })

  it('snaps to the last entry at the far right', () => {
    expect(indexFromPointer(1100, rect, ENTRIES)).toBe(ENTRIES.length - 1)
  })

  it('clamps rather than overflowing past either end', () => {
    expect(indexFromPointer(-500, rect, ENTRIES)).toBe(0)
    expect(indexFromPointer(9999, rect, ENTRIES)).toBe(ENTRIES.length - 1)
  })

  it('lands on each entry when pointed straight at it', () => {
    ENTRIES.forEach((e, i) => {
      const x = rect.left + (position(e.t) / 100) * rect.width
      expect(indexFromPointer(x, rect, ENTRIES), e.slug).toBe(i)
    })
  })

  it('is independent of where the track sits on the page', () => {
    const shifted = { left: 640, width: 1000 }
    ENTRIES.forEach((e, i) => {
      const x = shifted.left + (position(e.t) / 100) * shifted.width
      expect(indexFromPointer(x, shifted, ENTRIES), e.slug).toBe(i)
    })
  })
})

describe('tickLabel', () => {
  it('shows the year for the first entry of that year', () => {
    expect(tickLabel(ENTRIES[0], 0, ENTRIES, EN_MONTHS)).toBe('2019')
    expect(tickLabel(ENTRIES[5], 5, ENTRIES, EN_MONTHS)).toBe('2026')
  })

  it('shows the month for later entries in the same year', () => {
    expect(tickLabel(ENTRIES[6], 6, ENTRIES, EN_MONTHS)).toBe('MAR')
    expect(tickLabel(ENTRIES[7], 7, ENTRIES, EN_MONTHS)).toBe('MAY')
    expect(tickLabel(ENTRIES[8], 8, ENTRIES, EN_MONTHS)).toBe('JUN')
  })

  it('never repeats a label, which is the whole point of the month fallback', () => {
    const labels = ENTRIES.map((e, i) => tickLabel(e, i, ENTRIES, EN_MONTHS))
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('uses the supplied month table, so it localises', () => {
    const cs = ['LED', 'ÚNO', 'BŘE', 'DUB', 'KVĚ', 'ČVN', 'ČVC', 'SRP', 'ZÁŘ', 'ŘÍJ', 'LIS', 'PRO']
    expect(tickLabel(ENTRIES[6], 6, ENTRIES, cs)).toBe('BŘE')
  })
})
