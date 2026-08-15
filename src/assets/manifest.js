import manifest from './manifest.json'

/**
 * Image helpers backed by what `npm run assets` actually emitted, so a srcset
 * never promises a file that was never written. Sources differ in native
 * width — the SideQ captures are only 360px wide, the Worldwanderer ones 828.
 */

const widthsFor = (name) => manifest[name]?.widths ?? [320]

/** The largest emitted width, used as the plain `src` fallback. */
export const imgSrc = (name) => {
  const widths = widthsFor(name)
  return `/img/${name}-${widths[widths.length - 1]}.jpg`
}

export const imgSrcSet = (name, type = 'jpg') =>
  widthsFor(name)
    .map((w) => `/img/${name}-${w}.${type} ${w}w`)
    .join(', ')

/** Intrinsic dimensions, so <img> can reserve space and avoid layout shift. */
export const imgSize = (name) => {
  const m = manifest[name]
  return m ? { width: m.w, height: m.h } : {}
}

export const PORTRAIT = {
  avif: '/img/portrait-320.avif 320w, /img/portrait-640.avif 640w',
  webp: '/img/portrait-320.webp 320w, /img/portrait-640.webp 640w',
  jpg: '/img/portrait-320.jpg 320w, /img/portrait-640.jpg 640w',
  src: '/img/portrait-640.jpg',
}

export const CV_PDF = '/cv/Patrik_Cesnek_CV.pdf'
