/**
 * Cuts the EZ monogram and the green app tile out of the owner's logo sheet
 * (brand-source/logo-sheet-v4.webp, 1405/07/28) as transparent WebP files.
 *
 *   node tools/logo/crop-sheet.mjs
 *
 * The monogram sits on warm ivory, so its background is removed by the minimum
 * colour channel: ivory is near-white in all three, the emerald and gold marks
 * are not. The soft drop shadow under the mark falls in the ramp and stays as a
 * faint shadow. The tile keeps its own rounded corners; the ivory outside them
 * is masked out.
 *
 * The vector version of the same mark (favicons, the 3D hero) is traced by hand
 * in components/site/home/monogram-shapes.ts; tools/logo/mark-svg.mjs draws the
 * favicons from it.
 */
import sharp from 'sharp'

const SRC = 'brand-source/logo-sheet-v4.webp'
const OUT = 'public/brand'

// the large mark at the sheet's top-left, without the wordmark under it
const MARK = { left: 176, top: 42, width: 344, height: 334 }

async function monogram() {
  const { data, info } = await sharp(SRC).extract(MARK).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2])
    // fully opaque below 196, fully transparent above 230, smooth between
    const t = Math.min(1, Math.max(0, (230 - min) / (230 - 196)))
    data[i + 3] = Math.round(t * 255)
  }
  const raw = { raw: { width: info.width, height: info.height, channels: 4 } }
  await sharp(data, raw)
    .resize({ width: 640, kernel: 'lanczos3' })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-monogram.webp`)

  // light variant for dark grounds: the emerald pieces turn ivory, the gold
  // stays. The drop shadow would read as a pale halo on a dark ground, so this
  // one is cut tighter: transparent from 212 up.
  const light = Buffer.from(data)
  for (let i = 0; i < light.length; i += 4) {
    const [r, g, b] = [light[i], light[i + 1], light[i + 2]]
    const min = Math.min(r, g, b)
    light[i + 3] = Math.round(Math.min(1, Math.max(0, (212 - min) / (212 - 182))) * 255)
    if (g > r + 6 && g >= b) {
      const shade = 0.9 + 0.1 * Math.min(1, g / 110)
      light[i] = Math.round(248 * shade)
      light[i + 1] = Math.round(244 * shade)
      light[i + 2] = Math.round(236 * shade)
    }
  }
  await sharp(light, raw)
    .resize({ width: 640, kernel: 'lanczos3' })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-monogram-light.webp`)
}

async function tile() {
  const size = 200
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="38" fill="#fff"/></svg>`
  )
  await sharp(SRC)
    .extract({ left: 961, top: 320, width: size, height: size })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .resize({ width: 256 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-tile.webp`)
}

await monogram()
await tile()
const m = await sharp(`${OUT}/ez-monogram.webp`).metadata()
console.log(`wrote ez-monogram.webp (${m.width}×${m.height}), ez-monogram-light.webp, ez-tile.webp`)
