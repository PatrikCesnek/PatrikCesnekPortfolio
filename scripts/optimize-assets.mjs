/**
 * One-off asset pipeline. The raw handoff assets total ~19MB (ww-2.png alone
 * is 6MB), which would make the hero take seconds to paint. This emits AVIF,
 * WebP and a JPEG fallback at the widths the design actually renders, plus a
 * head-and-shoulders portrait derivative.
 *
 * Output is committed so Netlify never needs sharp at build time.
 *
 *   npm run assets
 */
import sharp from 'sharp'
import { mkdir, readdir, copyFile, access, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'

const HOME = process.env.HOME
const SRC = process.env.HANDOFF ?? `${HOME}/Downloads/design_handoff_portfolio/assets`
const CV_SRC = process.env.CV_PDF ?? `${HOME}/Documents/CV/Patrik_Cesnek_CV.pdf`
const OUT = 'public/img'

// The widths the design renders: 54px thumb (2x = 108), 250px bezel (2x = 500),
// 168px card cover, and a cap for the project page's full-width figures.
const WIDTHS = [108, 320, 500, 760, 1120]

await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))
let written = 0

// Sources differ in native width (sideq is 360px wide, ww is 828px), so record
// which widths each image actually got rather than letting srcset promise files
// that were never emitted.
const manifest = {}

for (const file of files) {
  const { name } = parse(file)
  const input = join(SRC, file)
  const meta = await sharp(input).metadata()

  if (name === 'patrik') {
    // The source is 768x1024 and mostly sky — the subject sits low-left, face
    // at roughly (0.36, 0.66). The prototype faked a crop with
    // background-size: 260%; the handoff's own preferred fix is to ship a real
    // head-and-shoulders derivative so About can use plain object-fit: cover.
    // Box tuned to this photo: face lands in the upper third of the 4/5 frame,
    // shoulders and chest fill the rest.
    const width = Math.round(meta.width * 0.504)
    const height = Math.round(width * 1.25) // the 4/5 frame About renders
    const left = Math.round(meta.width * 0.105)
    const top = Math.round(meta.height * 0.527)

    for (const w of [320, 640]) {
      const base = () => sharp(input).extract({ left, top, width, height }).resize(w)
      await base().avif({ quality: 62 }).toFile(`${OUT}/portrait-${w}.avif`)
      await base().webp({ quality: 80 }).toFile(`${OUT}/portrait-${w}.webp`)
      await base().jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/portrait-${w}.jpg`)
      written += 3
    }
    continue
  }

  const emitted = []
  for (const w of WIDTHS) {
    if (w > meta.width) continue
    const base = () => sharp(input).resize(w)
    await base().avif({ quality: 58 }).toFile(`${OUT}/${name}-${w}.avif`)
    await base().webp({ quality: 78 }).toFile(`${OUT}/${name}-${w}.webp`)
    await base().jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}-${w}.jpg`)
    emitted.push(w)
    written += 3
  }
  manifest[name] = { widths: emitted, w: meta.width, h: meta.height }
}

await writeFile('src/assets/manifest.json', JSON.stringify(manifest, null, 2) + '\n')

await mkdir('public/cv', { recursive: true })
try {
  await access(CV_SRC)
  await copyFile(CV_SRC, 'public/cv/Patrik_Cesnek_CV.pdf')
  console.log('copied CV PDF')
} catch {
  console.warn(`! CV PDF not found at ${CV_SRC} — the CV page will 404 on download`)
}

console.log(`optimised ${files.length} images into ${written} derivatives`)
