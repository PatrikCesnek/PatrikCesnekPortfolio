/**
 * The marketing sites shipped for the apps above. All three are hand-written
 * HTML, CSS and JavaScript — no framework, no build step — with JSON-LD
 * structured data, a sitemap and runtime language switching.
 *
 * Translatable copy lives in the locale files under `web.sites.<slug>`.
 */
export const WEB_PROJECTS = [
  {
    slug: 'apex',
    name: 'Apex Ryde',
    image: 'web-apex',
    href: 'https://apex-ryder.netlify.app',
    label: 'apex-ryder.netlify.app',
    locales: ['EN', 'CS', 'SK'],
    tags: ['HTML', 'CSS', 'JavaScript', 'JSON-LD', 'Netlify'],
  },
  {
    slug: 'sideq',
    name: 'SideQ',
    image: 'web-sideq',
    href: 'https://sidequest-ios.netlify.app/',
    label: 'sidequest-ios.netlify.app',
    locales: ['EN', 'CS', 'SK', 'DE', 'ES'],
    tags: ['HTML', 'CSS', 'JavaScript', 'JSON-LD', 'SEO', 'Netlify'],
  },
  {
    slug: 'worldwanderer',
    name: 'Worldwanderer',
    image: 'web-ww',
    href: 'https://worldwanderer-web.netlify.app/?lang=en#apple-maps',
    label: 'worldwanderer-web.netlify.app',
    locales: ['EN', 'CS', 'SK'],
    tags: ['HTML', 'CSS', 'JavaScript', 'Localization', 'Netlify'],
  },
]
