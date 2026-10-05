'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * Leans its content toward the pointer. Mouse/pen only — on touch a tilt would
 * fight the scroll gesture. The transform itself lives in `.tilt` (globals.css),
 * which reduced motion pins flat.
 */
export function Tilt({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        ref.current.style.setProperty('--tx', `${(nx * max).toFixed(2)}deg`)
        ref.current.style.setProperty('--ty', `${(-ny * max).toFixed(2)}deg`)
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty('--tx', '0deg')
        ref.current?.style.setProperty('--ty', '0deg')
      }}
    >
      {children}
    </div>
  )
}
