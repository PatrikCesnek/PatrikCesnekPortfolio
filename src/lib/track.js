import { T_MIN, T_MAX } from '../content/entries.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/** An entry's horizontal position on the track, as a percentage. */
export const position = (t) => ((t - T_MIN) / (T_MAX - T_MIN)) * 100

/** A fraction across the track's width, back to a fractional year. */
export const tFromFraction = (frac) => T_MIN + clamp(frac, 0, 1) * (T_MAX - T_MIN)

/** The entry closest to a fractional year. */
export function nearestIndex(t, entries) {
  let best = 0
  let bestDist = Infinity
  entries.forEach((e, i) => {
    const d = Math.abs(e.t - t)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/** Map a pointer's page X onto the nearest entry, clamped to the track. */
export function indexFromPointer(clientX, rect, entries) {
  const frac = clamp((clientX - rect.left) / rect.width, 0, 1)
  return nearestIndex(tFromFraction(frac), entries)
}

/**
 * The year for the first entry of that year, the month abbreviation otherwise.
 * Four entries land in 2026 and repeated "2026"s collided on the track.
 */
export function tickLabel(entry, index, entries, months) {
  const firstOfYear = entries.findIndex((e) => e.year === entry.year)
  if (firstOfYear === index) return entry.year
  const month = Number(entry.date.split('-')[1])
  return months[month - 1]
}

/** True when this tick's label is expendable at narrow widths. */
export const isMinorTick = (entry, index, entries) =>
  entry.kind === 'job' && entries.findIndex((e) => e.year === entry.year) !== index
