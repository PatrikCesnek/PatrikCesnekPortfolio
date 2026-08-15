import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify.js'

describe('slugify', () => {
  it('maps the nine portfolio titles to their expected slugs', () => {
    const pairs = [
      ['Independent iOS', 'independent-ios'],
      ['Matee', 'matee'],
      ['Freelance', 'freelance'],
      ['Billdu', 'billdu'],
      ['O2 Slovakia', 'o2-slovakia'],
      ['FormCoach', 'formcoach'],
      ['Worldwanderer', 'worldwanderer'],
      ['SideQ', 'sideq'],
      ['Apex Ryde', 'apex-ryde'],
    ]
    for (const [title, slug] of pairs) expect(slugify(title)).toBe(slug)
  })

  it('collapses runs of punctuation and trims the ends', () => {
    expect(slugify('  Hello -- World!  ')).toBe('hello-world')
  })

  it('strips diacritics', () => {
    expect(slugify('Přehled Žánrů')).toBe('prehled-zanru')
  })
})
