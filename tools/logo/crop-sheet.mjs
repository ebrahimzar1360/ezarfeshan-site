/**
 * Cuts the EZ monogram and the green app tile out of the owner's logo sheet
 * (brand-source/logo-sheet-v3.webp) as transparent WebP files.
 *
 *   node tools/logo/crop-sheet.mjs
 *
 * The monogram sits on an off-white textured tile, so its background is removed
 * by the minimum colour channel: paper is near-white in all three, the green
 * and gold marks are not. The tile keeps its own rounded corners; the cream
 * outside them is masked out.
 */
import sharp from 'sharp'

const SRC = 'brand-source/logo-sheet-v3.webp'
const OUT = 'public/brand'

async function monogram() {
  const { data, info } = await sharp(SRC)
    .extract({ left: 170, top: 60, width: 290, height: 270 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2])
    // fully opaque below 175, fully transparent above 226, smooth between
    const t = Math.min(1, Math.max(0, (226 - min) / (226 - 175)))
    data[i + 3] = Math.round(t * 255)
  }
  const raw = { raw: { width: info.width, height: info.height, channels: 4 } }
  await sharp(data, raw)
    .resize({ width: 640 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-monogram.webp`)

  // light variant for dark grounds: the green E turns paper-white, the gold Z stays
  const light = Buffer.from(data)
  for (let i = 0; i < light.length; i += 4) {
    if (light[i + 1] > light[i] + 12) {
      const shade = 0.88 + 0.12 * (light[i + 1] / 130)
      light[i] = Math.min(255, Math.round(245 * shade))
      light[i + 1] = Math.min(255, Math.round(245 * shade))
      light[i + 2] = Math.min(255, Math.round(240 * shade))
    }
  }
  await sharp(light, raw)
    .resize({ width: 640 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-monogram-light.webp`)
}

async function tile() {
  const size = 142
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="30" fill="#fff"/></svg>`
  )
  await sharp(SRC)
    .extract({ left: 17, top: 626, width: size, height: size })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .resize({ width: 256 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/ez-tile.webp`)
}

await monogram()
await tile()
console.log('wrote ez-monogram.webp, ez-monogram-light.webp, ez-tile.webp')
