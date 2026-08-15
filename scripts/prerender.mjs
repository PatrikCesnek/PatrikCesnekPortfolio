/**
 * Render every route, in every locale, to a real HTML file.
 *
 * A portfolio link pasted into Slack or LinkedIn must not render as an empty
 * <div id="root">, and recruiters' crawlers do not run JavaScript. This emits
 * 3 locales x 13 routes = 39 files, each with its own title, description,
 * canonical and hreflang set, plus a sitemap.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ENTRIES } from '../src/content/entries.js'
import {
  person,
  website,
  softwareApplication,
  breadcrumbs,
  graph,
} from './structured-data.mjs'

const LOCALES = ['en', 'cs', 'sk']
const DEFAULT_LOCALE = 'en'

/**
 * Netlify sets URL to the site's own production address, so canonicals can
 * never drift from where the site actually lives. A hardcoded guess put every
 * canonical, hreflang and og:url on a domain that 404s, which tells Google the
 * real page is elsewhere — the fastest way to fall out of the index.
 * SITE_URL overrides for other hosts; the fallback is local only.
 */
const SITE = (process.env.SITE_URL ?? process.env.URL ?? 'http://localhost:4173').replace(/\/$/, '')

if (!process.env.SITE_URL && !process.env.URL) {
  console.warn('! No SITE_URL or URL set — canonicals will point at localhost.')
}

const { render } = await import(pathToFileURL(join(process.cwd(), 'dist/server/entry-server.js')).href)

const template = await readFile('dist/index.html', 'utf-8')

const dicts = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (l) => [l, JSON.parse(await readFile(`src/i18n/locales/${l}.json`, 'utf-8'))])
  )
)

const routes = ['/', '/lab', '/about', '/cv', ...ENTRIES.map((e) => `/projects/${e.slug}`)]

const prefix = (locale, path) =>
  locale === DEFAULT_LOCALE ? path : path === '/' ? `/${locale}` : `/${locale}${path}`

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const urls = []
let count = 0

for (const locale of LOCALES) {
  for (const route of routes) {
    const url = prefix(locale, route)
    const dict = dicts[locale]
    const entry = ENTRIES.find((e) => `/projects/${e.slug}` === route)

    const PAGE_META = {
      '/lab': [dict.meta.titleLab, dict.meta.descLab],
      '/about': [dict.meta.titleAbout, dict.meta.descAbout],
      '/cv': [dict.meta.titleCv, dict.meta.descCv],
    }

    const [title, description] = entry
      ? [`${entry.title} — ${dict.meta.projectTitleSuffix}`, dict.entries[entry.slug].short]
      : (PAGE_META[route] ?? [dict.meta.siteTitle, dict.meta.siteDescription])

    const image = entry?.images
      ? `${SITE}/img/${entry.images[0]}-760.jpg`
      : `${SITE}/img/og-default-1200.jpg`

    const nodes = [
      website(SITE, dict, locale),
      route === '/' || route === '/about'
        ? { '@type': 'ProfilePage', '@id': `${SITE}${url}#page`, mainEntity: { '@id': `${SITE}/#patrik` } }
        : null,
      person(SITE, dict),
      entry && entry.kind === 'own' ? softwareApplication(SITE, dict, entry) : null,
      route !== '/'
        ? breadcrumbs(SITE, (p) => prefix(locale, p), route, entry ? entry.title : title.split(' — ')[0])
        : null,
    ]

    const alternates = LOCALES.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${prefix(l, route)}">`
    ).join('\n    ')

    const head = `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${SITE}${url}">
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${SITE}${route}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Patrik Cesnek">
    <meta property="og:locale" content="${locale}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${SITE}${url}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${image}">
    <script type="application/ld+json">${graph(nodes)}</script>`

    const html = render(url)

    const out = template
      .replace('<html lang="en">', `<html lang="${locale}">`)
      .replace(/<title>[^<]*<\/title>/, head)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    const file = join('dist', url === '/' ? 'index.html' : `${url.replace(/^\//, '')}/index.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, out)

    urls.push({ loc: `${SITE}${url}`, route })
    count++
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    ({ loc, route }) => `  <url>
    <loc>${loc}</loc>
${LOCALES.map(
  (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${prefix(l, route)}"/>`
).join('\n')}
  </url>`
  )
  .join('\n')}
</urlset>
`

await writeFile('dist/sitemap.xml', sitemap)

// Generated rather than static so the sitemap URL follows the real domain.
await writeFile(
  'dist/robots.txt',
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
)

console.log(`prerendered ${count} routes + sitemap + robots (site: ${SITE})`)
