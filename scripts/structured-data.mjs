/**
 * JSON-LD for the prerendered pages.
 *
 * A portfolio will never rank for a head term like "ios developer" — those
 * belong to job boards. What structured data buys is entity recognition:
 * Google learning that "Patrik Cesnek" is a person, a Senior iOS Developer,
 * who knows these technologies, made these apps and is available for hire.
 * That is what wins name searches and long-tail "for hire" phrases.
 */

const SKILLS = [
  'iOS development',
  'Swift',
  'SwiftUI',
  'UIKit',
  'Objective-C',
  'Swift 6 strict concurrency',
  'SwiftData',
  'StoreKit 2',
  'WidgetKit',
  'HealthKit',
  'Live Activities',
  'Combine',
  'RxSwift',
  'MVVM',
  'MVI',
  'Clean Architecture',
  'Kotlin Multiplatform',
  'Compose Multiplatform',
  'Flutter',
  'Design systems',
  'Design tokens',
  'CI/CD',
  'GitHub Actions',
  'App Store Connect',
  'TestFlight',
  'Firebase',
  'REST APIs',
  'JavaScript',
  'React',
  'HTML',
  'CSS',
  'Localization',
]

const LANGUAGES = [
  { code: 'sk', name: 'Slovak' },
  { code: 'cs', name: 'Czech' },
  { code: 'en', name: 'English' },
]

/**
 * Where the offer is good for.
 *
 * "European Union" alone is true but useless: it gives Google nothing to match
 * against a query that names a city. Cities first, then the countries that
 * contain them, then the catch-all — a crawler reading this can connect
 * "freelance iOS developer Brno" to this page without inferring anything.
 */
const AREA_SERVED = [
  { '@type': 'City', name: 'Brno', address: { '@type': 'PostalAddress', addressCountry: 'CZ' } },
  { '@type': 'City', name: 'Praha', alternateName: 'Prague', address: { '@type': 'PostalAddress', addressCountry: 'CZ' } },
  { '@type': 'City', name: 'Bratislava', address: { '@type': 'PostalAddress', addressCountry: 'SK' } },
  { '@type': 'Country', name: 'Czech Republic' },
  { '@type': 'Country', name: 'Slovakia' },
  { '@type': 'Place', name: 'European Union' },
  { '@type': 'Place', name: 'Remote worldwide' },
]

/** The person behind the site — the entity everything else hangs off. */
export function person(site, dict) {
  return {
    '@type': 'Person',
    '@id': `${site}/#patrik`,
    name: 'Patrik Cesnek',
    givenName: 'Patrik',
    familyName: 'Cesnek',
    jobTitle: dict.meta.jobTitle,
    description: dict.meta.siteDescription,
    url: site,
    image: `${site}/img/portrait-640.jpg`,
    email: 'mailto:pcesnek290@gmail.com',
    telephone: '+421948093464',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brno',
      addressCountry: 'CZ',
    },
    nationality: { '@type': 'Country', name: 'Slovakia' },
    knowsAbout: SKILLS,
    knowsLanguage: LANGUAGES.map((l) => ({
      '@type': 'Language',
      name: l.name,
      alternateName: l.code,
    })),
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Stredná odborná škola Ivanka pri Dunaji',
    },
    sameAs: [
      'https://github.com/PatrikCesnek',
      'https://apps.apple.com/app/sideq/id6767996805',
      'https://apps.apple.com/app/id6772739029',
      'https://sidequest-ios.netlify.app/',
      'https://worldwanderer-web.netlify.app/',
      'https://apex-ryder.netlify.app',
      'https://reaper-before-dawn.netlify.app',
      'https://dinoryde.netlify.app/',
    ],
    // The hire-me signal, stated in a form a machine can read.
    seeks: {
      '@type': 'Demand',
      name: 'Freelance and contract iOS development',
    },
    // Occupation carries the city in a field Google reads as a location fact
    // about the person, which the free-text address alone does not.
    hasOccupation: {
      '@type': 'Occupation',
      name: dict.meta.jobTitle,
      occupationLocation: AREA_SERVED.filter((a) => a['@type'] === 'City'),
      skills: SKILLS.join(', '),
    },
    makesOffer: { '@id': `${site}/#freelance-ios` },
  }
}

/** The thing actually being sold, as its own addressable node. */
export function service(site, dict) {
  return {
    '@type': 'Offer',
    '@id': `${site}/#freelance-ios`,
    itemOffered: {
      '@type': 'Service',
      name: 'Freelance iOS development',
      serviceType: 'iOS application development',
      description: dict.meta.availability,
      provider: { '@id': `${site}/#patrik` },
      areaServed: AREA_SERVED,
      availableLanguage: LANGUAGES.map((l) => ({
        '@type': 'Language',
        name: l.name,
        alternateName: l.code,
      })),
    },
    areaServed: AREA_SERVED,
    availability: 'https://schema.org/InStock',
  }
}

/**
 * The hire page's FAQ.
 *
 * Google stopped showing FAQ rich results for ordinary sites in 2023, so this
 * buys no stars in the SERP. It is here because the answers are the clearest
 * statement on the site of what is on offer, and because the assistants people
 * increasingly ask for a developer recommendation read exactly this.
 */
export function faqPage(site, dict, url) {
  return {
    '@type': 'FAQPage',
    '@id': `${site}${url}#faq`,
    inLanguage: dict.meta.htmlLang,
    mainEntity: dict.hire.faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

/** The site itself, so Google can attribute every page to one publisher. */
export function website(site, dict, locale) {
  return {
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: site,
    name: 'Patrik Cesnek',
    description: dict.meta.siteDescription,
    inLanguage: locale,
    publisher: { '@id': `${site}/#patrik` },
  }
}

/** An own project, described as the shipped software it is. */
export function softwareApplication(site, dict, entry) {
  const copy = dict.entries[entry.slug]
  const onAppStore = entry.href.includes('apps.apple.com')

  return {
    '@type': 'SoftwareApplication',
    name: entry.title,
    description: copy.blurb,
    applicationCategory: 'MobileApplication',
    operatingSystem: 'iOS',
    author: { '@id': `${site}/#patrik` },
    ...(entry.images?.length
      ? { screenshot: entry.images.map((n) => `${site}/img/${n}-760.jpg`) }
      : {}),
    ...(onAppStore
      ? {
          downloadUrl: entry.href,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        }
      : { url: entry.href }),
  }
}

/** Trail so Google prints a readable path instead of a bare URL. */
export function breadcrumbs(site, prefixed, route, label) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Patrik Cesnek', item: `${site}${prefixed('/')}` },
      { '@type': 'ListItem', position: 2, name: label, item: `${site}${prefixed(route)}` },
    ],
  }
}

/** Wrap a set of nodes into one graph, which is cheaper than many blocks. */
export const graph = (nodes) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) })
