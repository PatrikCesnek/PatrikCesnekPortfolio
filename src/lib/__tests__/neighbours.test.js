import { describe, it, expect } from 'vitest'
import { neighbours } from '../neighbours.js'
import { ENTRIES } from '../../content/entries.js'

const N = ENTRIES.length

describe('neighbours', () => {
  it('makes prev older and next newer', () => {
    const { prev, next } = neighbours(4, N)
    expect(prev).toBe(3)
    expect(next).toBe(5)
    expect(ENTRIES[prev].t).toBeLessThan(ENTRIES[4].t)
    expect(ENTRIES[next].t).toBeGreaterThan(ENTRIES[4].t)
  })

  it('wraps from the oldest back to the newest', () => {
    expect(neighbours(0, N).prev).toBe(N - 1)
  })

  it('wraps from the newest forward to the oldest', () => {
    expect(neighbours(N - 1, N).next).toBe(0)
  })

  it('never returns the entry itself', () => {
    for (let i = 0; i < N; i++) {
      const { prev, next } = neighbours(i, N)
      expect(prev).not.toBe(i)
      expect(next).not.toBe(i)
    }
  })

  it('is symmetric — my next has me as its prev', () => {
    for (let i = 0; i < N; i++) {
      expect(neighbours(neighbours(i, N).next, N).prev).toBe(i)
    }
  })
})
