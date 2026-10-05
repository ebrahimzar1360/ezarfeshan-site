'use client'

import { useEffect, useRef, useState } from 'react'
import { fa } from '@/lib/content/bio'

/**
 * A figure that counts up to its value the first time it scrolls into view.
 *
 * The server renders the final number, so the markup is correct without
 * JavaScript, to a crawler, and to a screen reader (the animating span is
 * aria-hidden; the real value sits beside it in sr-only text). Reduced motion
 * keeps the final number and never animates.
 */
export function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const dur = 1400
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur)
          const eased = 1 - Math.pow(1 - p, 4)
          setShown(Math.round(value * eased))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        setShown(0)
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="tabular-nums">
        {fa(shown)}
      </span>
      <span className="sr-only">{fa(value)}</span>
    </span>
  )
}
