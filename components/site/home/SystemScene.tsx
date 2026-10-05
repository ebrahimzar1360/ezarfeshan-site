'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

/**
 * The homepage's 3D centrepiece: a business drawn as an exploded architectural
 * stack. Four layers — process, data, people, AI — that come apart so you can
 * see each one, then lock back into a single block. The logo's ring orbits it,
 * bead and all; motes of data rise off the top.
 *
 * Pure CSS 3D (see `.stage`/`.scene` in globals.css): no WebGL, no library, a
 * few dozen divs. This component only adds pointer parallax — the scene leans
 * toward the cursor, eased with a lerp so it never snaps.
 *
 * Motion rules, from the threejs/ux guidance the redesign followed:
 * - reduced motion is read live (`change` listener), not once at mount;
 * - the rAF loop runs only while the stage is on screen and the tab visible;
 * - the whole scene is aria-hidden. The layer names are repeated in real text
 *   beside it, so nothing is conveyed by the picture alone.
 */
const LAYERS = [
  { name: 'فرایند', note: 'کار نوشته‌شده' },
  { name: 'داده', note: 'عدد به‌جای حس' },
  { name: 'تیم', note: 'نقش، نه فرد' },
  { name: 'هوش مصنوعی', note: 'سرعت روی نظم' },
] as const

const MOTES = [
  { x: '30px', y: '60px', d: '0s' },
  { x: '150px', y: '40px', d: '1.4s' },
  { x: '90px', y: '170px', d: '2.6s' },
  { x: '190px', y: '130px', d: '3.7s' },
  { x: '60px', y: '120px', d: '4.8s' },
]

export function SystemScene() {
  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stage.current
    const sc = scene.current
    if (!el || !sc) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let still = mq.matches
    const onMq = (e: MediaQueryListEvent) => {
      still = e.matches
    }
    mq.addEventListener('change', onMq)

    const base = { rx: 58, rz: -42 }
    const target = { rx: base.rx, rz: base.rz }
    const now = { rx: base.rx, rz: base.rz }
    let raf = 0
    let visible = true

    const onMove = (e: PointerEvent) => {
      if (still || e.pointerType === 'touch') return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      target.rz = base.rz + nx * 22
      target.rx = base.rx - ny * 12
    }

    const tick = () => {
      raf = 0
      if (!visible || document.hidden) return
      now.rx += (target.rx - now.rx) * 0.06
      now.rz += (target.rz - now.rz) * 0.06
      sc.style.setProperty('--rx', `${now.rx.toFixed(2)}deg`)
      sc.style.setProperty('--rz', `${now.rz.toFixed(2)}deg`)
      if (Math.abs(target.rx - now.rx) + Math.abs(target.rz - now.rz) > 0.02) {
        raf = requestAnimationFrame(tick)
      }
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      onMove(e)
      kick()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) kick()
    })
    io.observe(el)
    window.addEventListener('pointermove', move, { passive: true })

    return () => {
      mq.removeEventListener('change', onMq)
      window.removeEventListener('pointermove', move)
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={stage}
        aria-hidden
        className="stage relative mx-auto grid h-[380px] w-full max-w-[540px] place-items-center sm:h-[480px] sm:justify-items-end sm:pe-4"
      >
        <span className="glow-emerald start-[20%] top-[25%] size-72" />
        <span className="glow-gold end-[18%] bottom-[18%] size-40" />

        <div className="origin-center scale-[0.78] sm:scale-100">
          <div ref={scene} className="scene" style={{ '--w': '210px' } as CSSProperties}>
            {LAYERS.map((_, i) => (
              <div
                key={i}
                className={`slab slab-${i + 1}`}
                style={{ '--i': i } as CSSProperties}
              >
                <div className="face face-top" />
                <div className="face face-x face-xp" />
                <div className="face face-x face-xn" />
                <div className="face face-y face-yp" />
                <div className="face face-y face-yn" />
              </div>
            ))}

            <div className="orbit">
              <svg viewBox="0 0 200 200" fill="none">
                <circle
                  cx="100"
                  cy="100"
                  r="96"
                  stroke="var(--color-gold-light)"
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                  strokeDasharray="520 83"
                />
                <circle cx="100" cy="100" r="80" stroke="var(--color-paper)" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="2 6" />
                <circle cx="174" cy="40" r="5" fill="var(--color-gold)" />
              </svg>
            </div>

            {MOTES.map((m, i) => (
              <span
                key={i}
                className="mote"
                style={{ '--mx': m.x, '--my': m.y, '--md': m.d } as CSSProperties}
              />
            ))}

            <div className="billboard" style={{ '--z': '290px' } as CSSProperties}>
              <div className="bead" />
            </div>
          </div>
        </div>

        {/* Layer captions, in 2D, riding the same --spread as the slabs. Hidden
            below sm where they would crowd the stack. */}
        <ul className="pointer-events-none absolute inset-y-0 start-0 hidden w-full sm:block">
          {LAYERS.map((layer, i) => (
            <li
              key={layer.name}
              className="stack-label flex items-center gap-2"
              style={{ '--i': i, '--ly': '58px' } as CSSProperties}
            >
              <span className="latin text-200 text-gold-light/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="h-px w-8 bg-gold-light/50" />
              <span dir="rtl" className="text-300 font-medium text-paper">
                {layer.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* The same four layers as text, for every reader the picture misses. */}
      <ul className="sr-only">
        {LAYERS.map((l) => (
          <li key={l.name}>
            {l.name}: {l.note}
          </li>
        ))}
      </ul>
    </div>
  )
}
