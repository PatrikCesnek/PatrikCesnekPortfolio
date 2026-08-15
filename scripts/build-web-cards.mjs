/**
 * Build the preview cards for the "Web" section of the Lab page.
 *
 * SideQ and Apex Ryde already ship a purpose-built 1200x630 og:image — those
 * are the sites' own preview cards, so they are used as-is. Worldwanderer's
 * og:image is a portrait app screenshot rather than a site card, so a matching
 * wide card is composed from that same asset: its own colours blurred into a
 * ground, with the sharp screenshot centred on top.
 *
 * Sources live in sibling repos, so this is a one-off; the output is committed.
 *
 *   npm run web-cards
 */
import sharp from 'sharp'
import { mkdir, access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PROJECTS = join(process.env.HOME, 'Desktop/personalProjects')
const OUT = 'public/img'
const W = 1200
const H = 630
const WIDTHS = [500, 760, 1120]

await mkdir(OUT, { recursive: true })

// Merged into the shared manifest so srcset never promises a missing file.
const MANIFEST = 'src/assets/manifest.json'
const manifest = JSON.parse(await readFile(MANIFEST, 'utf-8'))

const emit = async (name, buffer) => {
  for (const w of WIDTHS) {
    const base = () => sharp(buffer).resize(w)
    await base().avif({ quality: 60 }).toFile(`${OUT}/${name}-${w}.avif`)
    await base().webp({ quality: 80 }).toFile(`${OUT}/${name}-${w}.webp`)
    await base().jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/${name}-${w}.jpg`)
  }
  manifest[name] = { widths: [...WIDTHS], w: W, h: H }
  console.log(`  ${name}: ${WIDTHS.length * 3} derivatives`)
}

/** Sites that already ship their own wide preview card. */
const READY = [
  ['web-sideq', 'sidequest-website/assets/og-home.png'],
  ['web-apex', 'apex-web/assets/og-image.png'],
]

for (const [name, rel] of READY) {
  const src = join(PROJECTS, rel)
  try {
    await access(src)
  } catch {
    console.warn(`! missing ${src} — skipping ${name}`)
    continue
  }
  const buf = await sharp(src).resize(W, H, { fit: 'cover' }).toBuffer()
  await emit(name, buf)
}

/** Worldwanderer: compose a wide card from its portrait hero. */
const wwSrc = join(PROJECTS, 'landmarky-website/assets/worldwanderer-home.jpg')
try {
  await access(wwSrc)

  // The ground takes its colour from the map screen rather than the home
  // screen — blurring a white app UI just yields grey. No invented palette.
  const groundSrc = join(PROJECTS, 'landmarky-website/assets/worldwanderer-map.jpg')
  const ground = await sharp(groundSrc)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .blur(52)
    .modulate({ brightness: 0.5, saturation: 1.4 })
    .toBuffer()

  // The screenshot sits sharp and centred, at 80% of the card height.
  // Dimensions come from the resized buffer itself — deriving the width from
  // a guessed aspect ratio put the rounding mask a pixel out.
  const shotH = Math.round(H * 0.8)
  const resized = await sharp(wwSrc).resize({ height: shotH }).png().toBuffer()
  const { width: shotW, height: realH } = await sharp(resized).metadata()

  const shot = await sharp(resized)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${shotW}" height="${realH}">
             <rect width="${shotW}" height="${realH}" rx="26" ry="26" fill="#fff"/>
           </svg>`
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const card = await sharp(ground)
    .composite([{ input: shot, gravity: 'center' }])
    .jpeg({ quality: 92 })
    .toBuffer()

  await emit('web-ww', card)
} catch (err) {
  console.warn(`! could not build web-ww: ${err.message}`)
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log('web cards done, manifest updated')
