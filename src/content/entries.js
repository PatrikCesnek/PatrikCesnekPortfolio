import { slugify } from '../lib/slugify.js'

/**
 * The untranslatable spine of the timeline. Everything a human reads —
 * short, blurb, notes, captions, span, cta, hrefLabel, coverNote — lives in
 * src/i18n/locales/*.json, keyed by slug.
 *
 * `t` is a fractional year used only for horizontal position on the scrub track.
 * `kind`: "own" = personal project (taller tick, accent label, screenshots)
 *         "job" = client/contract work (short tick, neutral label, notes block)
 * `orient: "portrait"` = phone screenshots (360x778); absent = landscape (778x360).
 */

export const T_MIN = 2019.2
export const T_MAX = 2026.75

const RAW = [
  {
    t: 2019.4,
    year: '2019',
    date: '2019-06',
    title: 'Independent iOS',
    kind: 'own',
    tags: ['Swift', 'UIKit', 'REST', 'App Store Connect'],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2022.1,
    year: '2022',
    date: '2022-02',
    title: 'Matee',
    kind: 'job',
    tags: [
      'SwiftUI',
      'RxSwift',
      'Combine',
      'MVI + Clean Architecture',
      'Kotlin Multiplatform',
      'Compose MP',
      'XCTest',
      'Crashlytics',
    ],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2023.9,
    year: '2023',
    date: '2023-11',
    title: 'Freelance',
    kind: 'job',
    tags: [
      'Firestore',
      'Auth',
      'Cloud Messaging',
      'SQLite',
      'MongoDB',
      'Analytics',
      'CI/CD',
      'React',
      'JavaScript',
    ],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2024.7,
    year: '2024',
    date: '2024-09',
    title: 'Billdu',
    kind: 'job',
    tags: ['Objective-C → Swift', 'MVC → MVVM', 'Swift', 'SQLite', 'REST'],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2025.5,
    year: '2025',
    date: '2025-06',
    title: 'O2 Slovakia',
    kind: 'job',
    tags: ['Design System', 'SPM', 'Design Tokens', 'Swift Testing', 'CI'],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2026.05,
    year: '2026',
    date: '2026-01',
    title: 'FormCoach',
    kind: 'job',
    tags: ['SwiftUI', 'WidgetKit', 'HealthKit', 'Live Activities', 'MVVM', 'CI/CD'],
    href: 'mailto:pcesnek290@gmail.com',
  },
  {
    t: 2026.25,
    year: '2026',
    date: '2026-03',
    title: 'Worldwanderer',
    kind: 'own',
    orient: 'portrait',
    tags: ['SwiftUI', 'MapKit', 'Firebase', 'Localization'],
    images: ['ww-3', 'ww-2', 'ww-1'],
    // Recovered from landmarky-website/index.html — the handoff was still
    // chasing this link.
    href: 'https://apps.apple.com/app/id6772739029',
    web: 'https://worldwanderer-web.netlify.app/?lang=en#apple-maps',
  },
  {
    t: 2026.4,
    year: '2026',
    date: '2026-05',
    title: 'SideQ',
    kind: 'own',
    orient: 'portrait',
    tags: ['Swift 6', 'Strict Concurrency', 'SwiftData', 'StoreKit 2', 'Live Activities'],
    images: ['sideq-1', 'sideq-2', 'sideq-3', 'sideq-4', 'sideq-5'],
    href: 'https://apps.apple.com/app/sideq/id6767996805',
    web: 'https://sidequest-ios.netlify.app/',
  },
  {
    t: 2026.55,
    year: '2026',
    date: '2026-06',
    title: 'Apex Ryde',
    kind: 'own',
    tags: ['Swift', 'SceneKit', 'Physics', 'No dependencies'],
    images: ['apex-1', 'apex-2', 'apex-3'],
    // apex-web still carries a placeholder App Store id, so the app is not
    // on the Store yet — this points at the live site, not the Netlify
    // console the handoff had recorded.
    href: 'https://apex-ryder.netlify.app',
  },
]

export const ENTRIES = RAW.map((e) => ({ ...e, slug: slugify(e.title) }))

export const bySlug = (slug) => ENTRIES.find((e) => e.slug === slug)

export const indexOfSlug = (slug) => ENTRIES.findIndex((e) => e.slug === slug)

/** Own projects only, for the Lab view. */
export const OWN = ENTRIES.filter((e) => e.kind === 'own')
