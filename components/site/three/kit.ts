import { CanvasTexture, Color, SRGBColorSpace } from 'three'

/**
 * Shared pieces of the homepage's WebGL scenes (hero, pillars, projects).
 * Imported only by the lazily loaded scene modules, so three.js stays out of
 * the first-load bundle.
 */

/**
 * Resolves any CSS colour expression (a token, a color-mix…) to RGB by letting
 * the browser compute it on a probe and painting the result on a 1×1 canvas,
 * which handles every colour syntax the cascade can produce. This is how the
 * scenes take every colour from the theme tokens rather than a literal.
 */
export function makeResolver(host: HTMLElement) {
  const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  return (expr: string, out: Color = new Color()) => {
    const probe = document.createElement('span')
    probe.style.color = expr
    probe.style.display = 'none'
    host.appendChild(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    if (!paint || !computed) return out
    paint.clearRect(0, 0, 1, 1)
    paint.fillStyle = computed
    paint.fillRect(0, 0, 1, 1)
    const [r, g, b] = paint.getImageData(0, 0, 1, 1).data
    return out.setRGB(r! / 255, g! / 255, b! / 255, SRGBColorSpace)
  }
}

/** a soft round contact shadow, drawn once into a small texture */
export function shadowTexture(rgb: Color, strength = 0.55) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  const srgb = rgb.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace)
  const [r, g, b] = [srgb.r, srgb.g, srgb.b].map((v) => Math.round(v * 255))
  grad.addColorStop(0, `rgba(${r},${g},${b},${strength})`)
  grad.addColorStop(0.55, `rgba(${r},${g},${b},${strength / 3})`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * How much a device can be asked to draw. Phones and machines reporting few
 * cores or little memory get fewer particles and a lower pixel ratio, so the
 * scenes stay smooth on weak hardware rather than merely running.
 */
export type Quality = { tier: 0 | 1 | 2; dpr: number; antialias: boolean; density: number }

export function quality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const coarse = matchMedia('(pointer: coarse)').matches
  const ratio = window.devicePixelRatio || 1
  if (cores <= 4 || memory <= 3) return { tier: 2, dpr: Math.min(ratio, 1.25), antialias: false, density: 0.4 }
  if (coarse) return { tier: 1, dpr: Math.min(ratio, 1.5), antialias: ratio < 2, density: 0.6 }
  return { tier: 0, dpr: Math.min(ratio, 2), antialias: ratio < 2, density: 1 }
}
