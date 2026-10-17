/**
 * Whether a 3D scene should load at all. Kept free of three.js so the client
 * islands (HeroStage, PillarsStage…) can call it without pulling the library
 * into the first-load bundle.
 */

/** True when a WebGL context can be made; the probe's context is released at once. */
export function webglAvailable() {
  const probe = document.createElement('canvas')
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl')
  if (!gl) return false
  // browsers cap live contexts; give the probe's back at once
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return true
}

/** Save-Data or very little memory: keep the static fallback, fetch nothing. */
export function shouldSkip3d() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return true
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return true
  return false
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Runs `load` once the element is near the viewport and the browser is idle.
 * Returns a cancel function.
 */
export function whenNear(el: Element, load: () => void, margin = '200px') {
  let idle = 0
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      io.disconnect()
      if ('requestIdleCallback' in window) idle = requestIdleCallback(load, { timeout: 1200 })
      else idle = setTimeout(load, 300) as unknown as number
    },
    { rootMargin: margin },
  )
  io.observe(el)
  return () => {
    io.disconnect()
    if ('cancelIdleCallback' in window) cancelIdleCallback(idle)
    clearTimeout(idle)
  }
}
