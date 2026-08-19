/**
 * App screenshots that come from a sibling repo rather than the original
 * design handoff, so `optimize-assets.mjs` (which reads one handoff folder)
 * has nothing to work from.
 *
 * Reaper ships its App Store screenshots in the game repo, already sized and
 * captured on device, so they are the source of truth. Output is committed so
 * Netlify never needs sharp at build time.
 *
 *   npm run app-shots
 */
import sharp from 'sharp'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PROJECTS = join(process.env.HOME, 'Desktop/personalProjects')
const OUT = 'public/img'
const WIDTHS = [108, 320, 500, 760, 1120]

/** name -> path, relative to the personalProjects folder. */
const SOURCES = [
  [
    'reaper-1',
    'reaper-game/Marketing/AppStoreScreenshots/iPhone-6.9-2868x1320/01-briefing.png',
  ],
  [
    'reaper-2',
    'reaper-game/Marketing/AppStoreScreenshots/iPhone-6.9-2868x1320/02-gameplay.png',
  ],
  [
    'reaper-3',
    'reaper-game/Marketing/AppStoreScreenshots/iPhone-6.9-2868x1320/03-tutorial.png',
  ],
  [
    'reaper-4',
    'reaper-game/Marketing/AppStoreScreenshots/iPhone-6.9-2868x1320/04-profile.png',
  ],
]

await mkdir(OUT, { recursive: true })

const MANIFEST = 'src/assets/manifest.json'
const manifest = JSON.parse(await readFile(MANIFEST, 'utf-8'))

for (const [name, rel] of SOURCES) {
  const src = join(PROJECTS, rel)
  try {
    await access(src)
  } catch {
    console.warn(`! missing ${src} — skipping ${name}`)
    continue
  }

  const meta = await sharp(src).metadata()
  const emitted = []

  // Sources are wider than the widest derivative the design renders, so every
  // width is emitted; the guard keeps that true if a smaller source appears.
  for (const w of WIDTHS) {
    if (w > meta.width) continue
    const base = () => sharp(src).resize(w)
    await base().avif({ quality: 58 }).toFile(`${OUT}/${name}-${w}.avif`)
    await base().webp({ quality: 78 }).toFile(`${OUT}/${name}-${w}.webp`)
    await base().jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}-${w}.jpg`)
    emitted.push(w)
  }

  manifest[name] = { widths: emitted, w: meta.width, h: meta.height }
  console.log(`  ${name}: ${emitted.length * 3} derivatives (${meta.width}x${meta.height})`)
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`updated ${MANIFEST}`)
