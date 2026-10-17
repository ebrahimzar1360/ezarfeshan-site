'use client'

import { useEffect, useRef } from 'react'
import { reducedMotion, shouldSkip3d, webglAvailable, whenNear } from '../three/gate'

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

    if (shouldSkip3d() || !webglAvailable()) return

    let cancelled = false
    let dispose: (() => void) | undefined

    const load = () => {
      import('./hero-scene')
        .then(({ mountHeroScene }) => {
          if (cancelled) return
          dispose = mountHeroScene({
            canvas,
            host,
            still: reducedMotion(),
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

    const cancelNear = whenNear(host, load)

    return () => {
      cancelled = true
      cancelNear()
      dispose?.()
      delete host.dataset.stage
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="ha-canvas" />
}
