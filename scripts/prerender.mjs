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

const LOCALES = ['en', 'cs', 'sk']
const DEFAULT_LOCALE = 'en'
const SITE = (process.env.SITE_URL ?? 'https://patrikcesnek.netlify.app').replace(/\/$/, '')

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

    const title = entry ? `${entry.title} — Patrik Cesnek` : dict.meta.siteTitle
    const description = entry ? dict.entries[entry.slug].short : dict.meta.siteDescription
    const image = entry?.images ? `${SITE}/img/${entry.images[0]}-760.jpg` : `${SITE}/img/ww-2-760.jpg`

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
    <meta name="twitter:image" content="${image}">`

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

console.log(`prerendered ${count} routes + sitemap`)
