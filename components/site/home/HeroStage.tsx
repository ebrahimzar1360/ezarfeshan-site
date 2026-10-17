'use client'

import { useEffect, useRef } from 'react'

/**
 * Mounts the WebGL monogram (hero-scene.ts) over the SVG poster in HeroArt.
 *
 * Nothing is fetched until the hero is near the viewport and the browser is
 * idle, so three.js never competes with the headline for the first paint. It
 * is skipped outright without WebGL, on Save-Data, and on devices reporting
 * very little memory — those keep the SVG, which is the complete design, not
 * a placeholder. Under reduced motion the scene is drawn once and left still.
 *
 * The host gets `data-stage="3d"` after the first frame; CSS then hides the
 * poster's slab and monogram and fades the canvas in. A lost context removes
 * the attribute again, so the poster comes back.
 */
export function HeroStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean }
      deviceMemory?: number
    }
    if (nav.connection?.saveData) return
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl')
    if (!gl) return
    // browsers cap live contexts; give the probe's back at once
    gl.getExtension('WEBGL_lose_context')?.loseContext()

    let cancelled = false
    let dispose: (() => void) | undefined
    let idle = 0

    const load = () => {
      import('./hero-scene')
        .then(({ mountHeroScene }) => {
          if (cancelled) return
          dispose = mountHeroScene({
            canvas,
            host,
            still: matchMedia('(prefers-reduced-motion: reduce)').matches,
            onReady: () => {
              host.dataset.stage = '3d'
            },
            onLost: () => {
              delete host.dataset.stage
            },
          })
        })
        .catch(() => {
          // a failed chunk leaves the poster, which is the whole design
        })
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        if ('requestIdleCallback' in window) idle = requestIdleCallback(load, { timeout: 1200 })
        else idle = setTimeout(load, 300) as unknown as number
      },
      { rootMargin: '200px' },
    )
    io.observe(host)

    return () => {
      cancelled = true
      io.disconnect()
      if ('cancelIdleCallback' in window) cancelIdleCallback(idle)
      clearTimeout(idle)
      dispose?.()
      delete host.dataset.stage
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="ha-canvas" />
}
