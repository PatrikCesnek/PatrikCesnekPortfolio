/**
 * The default link-preview card.
 *
 * Previously og:image was a Worldwanderer app screenshot, so a link pasted
 * into Slack or LinkedIn showed someone else's travel app rather than saying
 * who this is. This composes a Nocturne-coloured card: the portrait on the
 * right, name and role on the left.
 *
 *   npm run og-card
 */
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const OUT = 'public/img'
const W = 1200
const H = 630

await mkdir(OUT, { recursive: true })

const en = JSON.parse(await readFile('src/i18n/locales/en.json', 'utf-8'))

// Nocturne's page ground, painted rather than guessed.
const ground = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="8%" cy="0%" r="120%">
      <stop offset="0%" stop-color="#1c1f31"/>
      <stop offset="55%" stop-color="#13151f"/>
      <stop offset="100%" stop-color="#0e1018"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="72" y="238" width="64" height="2" fill="#9184d9"/>
</svg>`)

const text = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: Helvetica, Arial, sans-serif; font-weight: 500; font-size: 68px; fill: #e9e9ed; letter-spacing: -2px; }
    .role { font-family: Helvetica, Arial, sans-serif; font-weight: 400; font-size: 27px; fill: #d2cefd; }
    .meta { font-family: 'Courier New', monospace; font-size: 19px; fill: #9397ab; letter-spacing: 1.6px; }
  </style>
  <text x="72" y="196" class="name">Patrik Cesnek</text>
  <text x="72" y="300" class="role">${en.meta.jobTitle} · freelance</text>
  <text x="72" y="352" class="role">SwiftUI · Swift 6 · shipped on the App Store</text>
  <text x="72" y="546" class="meta">REMOTE ACROSS THE EU · BRNO, CZ</text>
</svg>`)

// The portrait is already a head-and-shoulders crop; feather its left edge so
// it sits in the ground rather than on top of it.
const portraitW = 380
const portrait = await sharp('public/img/portrait-640.jpg')
  .resize(portraitW, H, { fit: 'cover', position: 'top' })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${portraitW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="f" x1="0" x2="1">
              <stop offset="0%" stop-color="#000" stop-opacity="0"/>
              <stop offset="42%" stop-color="#000" stop-opacity="1"/>
            </linearGradient>
          </defs>
          <rect width="${portraitW}" height="${H}" fill="url(#f)"/>
        </svg>`),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer()

const card = await sharp(ground)
  .composite([
    { input: portrait, left: W - portraitW, top: 0 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer()

await writeFile(`${OUT}/og-default-1200.jpg`, card)
await sharp(card).webp({ quality: 86 }).toFile(`${OUT}/og-default-1200.webp`)

console.log('og card built: public/img/og-default-1200.jpg')
