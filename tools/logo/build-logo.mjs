/**
 * Draws the vector brand files from the hand-traced outlines of the v4 mark
 * (components/site/home/monogram-shapes.ts):
 *
 *   public/brand/logo-mark.svg      the mark alone, emerald and metallic gold
 *   public/brand/favicon.svg        the mark on an emerald tile, as the sheet's app icon
 *   public/brand/favicon-small.svg  the same, simplified for 16–32 px (flat colours)
 *   public/brand/icon-maskable.svg  full-bleed emerald, the mark inside the 80% safe zone
 *
 *   npm run logo
 *
 * On the tile the emerald pieces turn ivory, or they would vanish into it. The
 * raster logo (ez-monogram*.webp) comes from tools/logo/crop-sheet.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'components/site/home/monogram-shapes.ts'
const OUT = 'public/brand'

// palette — the brand sheet v4, as in app/globals.css
const C = {
  emerald: '#0F4D3F',
  emeraldLight: '#1C6B58',
  emeraldDeep: '#0A3229',
  gold: '#D4AF6B',
  goldLight: '#E9D3A0',
  goldDark: '#A8823F',
  ivory: '#F8F4EC',
}

// read the pieces out of the TS module without a TS toolchain
const src = readFileSync(SRC, 'utf8')
const pieces = [...src.matchAll(/letter: '(e|z)',[\s\S]*?path: \[([\s\S]*?)\n {4}\],/g)].map(([, letter, body]) => ({
  letter,
  d:
    [...body.matchAll(/\['([MLQC])', ([^\]]+)\]/g)]
      .map(([, c, args]) => `${c}${args.split(',').map((v) => +v).join(' ')}`)
      .join(' ') + ' Z',
}))
if (pieces.length !== 6) throw new Error(`expected 6 pieces in ${SRC}, found ${pieces.length}`)

// the traced frame: bounds of every piece
const nums = pieces.flatMap((p) => p.d.match(/-?\d+(\.\d+)?/g).map(Number))
const xs = nums.filter((_, i) => i % 2 === 0)
const ys = nums.filter((_, i) => i % 2 === 1)
const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }

const defs = `<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldLight}"/><stop offset=".45" stop-color="${C.gold}"/><stop offset=".75" stop-color="${C.goldDark}"/><stop offset="1" stop-color="${C.goldLight}"/></linearGradient>
<linearGradient id="e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.emeraldLight}"/><stop offset=".55" stop-color="${C.emerald}"/><stop offset="1" stop-color="${C.emeraldDeep}"/></linearGradient>
</defs>`

/** the mark scaled into a square of `size`, inset by `pad` on each side */
function mark({ size, pad, eFill, zFill }) {
  const s = (size - 2 * pad) / Math.max(box.w, box.h)
  const tx = pad + ((size - 2 * pad) - box.w * s) / 2 - box.x * s
  const ty = pad + ((size - 2 * pad) - box.h * s) / 2 - box.y * s
  const paths = pieces.map((p) => `<path d="${p.d}" fill="${p.letter === 'e' ? eFill : zFill}"/>`).join('')
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})">${paths}</g>`
}

const svg = (size, body, withDefs = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="EZ">${withDefs ? defs : ''}${body}</svg>\n`

const files = {
  'logo-mark.svg': svg(512, mark({ size: 512, pad: 8, eFill: 'url(#e)', zFill: 'url(#g)' })),
  'favicon.svg': svg(
    64,
    `<rect width="64" height="64" rx="14" fill="url(#e)"/>` + mark({ size: 64, pad: 10, eFill: C.ivory, zFill: 'url(#g)' }),
  ),
  'favicon-small.svg': svg(
    32,
    `<rect width="32" height="32" rx="7" fill="${C.emerald}"/>` + mark({ size: 32, pad: 4, eFill: C.ivory, zFill: C.gold }),
    false,
  ),
  'icon-maskable.svg': svg(
    512,
    `<rect width="512" height="512" fill="url(#e)"/>` + mark({ size: 512, pad: 112, eFill: C.ivory, zFill: 'url(#g)' }),
  ),
}
for (const [name, body] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, body)
console.log(`wrote ${Object.keys(files).join(', ')} from ${pieces.length} pieces`)
