'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Lets the hero photograph lean a few pixels away from the pointer. Writes
 * --mx/--my (−1…1) on the host; the CSS (.hp-media) does the moving, so a
 * frame costs one style write. Off for touch, coarse pointers and reduced
 * motion — the picture then simply holds still.
 */
export function HeroParallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    let x = 0
    let y = 0
    const write = () => {
      frame = 0
      host.style.setProperty('--mx', x.toFixed(3))
      host.style.setProperty('--my', y.toFixed(3))
    }
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width) * 2 - 1
      y = ((e.clientY - r.top) / r.height) * 2 - 1
      frame ||= requestAnimationFrame(write)
    }
    const leave = () => {
      x = 0
      y = 0
      frame ||= requestAnimationFrame(write)
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}
