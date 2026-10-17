'use client'

import { useEffect, useRef, useState } from 'react'
import { faNum } from '@/lib/format'
import { reducedMotion, shouldSkip3d, webglAvailable, whenNear } from '../three/gate'
import { PillarIllustration, type Kind } from './PillarIllustration'

type Card = { kind: string; title: string; tag: string; text: string }

const KINDS: Kind[] = ['processes', 'systems', 'ai']
const kindOf = (k: string): Kind => (KINDS.includes(k as Kind) ? (k as Kind) : 'processes')

/**
 * The scroll journey of the pillars. A sticky stage holds one figure while
 * the cards pass beside it (under it on a phone); the card crossing the middle
 * of the screen decides the figure.
 *
 * The stage starts as the card's drawn illustration — the poster, and the
 * whole picture without WebGL — and the particle scene (pillars-scene.ts)
 * fades in over it once loaded. Everything readable lives in the cards.
 */
export function PillarsJourney({ cards }: { cards: Card[] }) {
  const [active, setActive] = useState(0)
  const [live, setLive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{ setActive: (i: number) => void; dispose: () => void } | null>(null)

  // which card is crossing the middle of the viewport
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const beats = [...root.querySelectorAll<HTMLElement>('[data-beat]')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.beat))
      },
      // a line below the middle: on a phone the top of the screen belongs to the stage
      { rootMargin: '-62% 0px -36% 0px' },
    )
    beats.forEach((b) => io.observe(b))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    sceneRef.current?.setActive(active)
  }, [active])

  // the 3D stage, loaded only when near and idle
  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root || shouldSkip3d() || !webglAvailable()) return
    let cancelled = false
    const cancelNear = whenNear(root, () => {
      import('./pillars-scene')
        .then(({ mountPillarsScene }) => {
          if (cancelled) return
          sceneRef.current = mountPillarsScene({
            canvas,
            host: root,
            kinds: cards.map((c) => kindOf(c.kind)),
            still: reducedMotion(),
            onReady: () => setLive(true),
            onLost: () => {
              sceneRef.current = null
              setLive(false)
            },
          })
        })
        .catch(() => {
          // the drawn illustrations stay; they are the complete fallback
        })
    })
    return () => {
      cancelled = true
      cancelNear()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [cards])

  return (
    <div ref={rootRef} className="relative lg:grid lg:grid-cols-2 lg:gap-10" data-live={live || undefined}>
      {/* stage: first in the DOM so it sticks above the cards on a phone; the end column on a wide screen */}
      <div className="sticky top-20 z-10 -mx-[clamp(1.25rem,5vw,4rem)] h-[38svh] bg-bg px-[clamp(1.25rem,5vw,4rem)] lg:order-last lg:mx-0 lg:h-[calc(100svh-5rem)] lg:self-start lg:bg-transparent lg:px-0">
        <div className="relative h-full">
          {cards.map((c, i) => (
            <div
              key={i}
              aria-hidden
              className={`pj-poster absolute inset-0 grid place-items-center ${i === active ? 'is-on' : ''}`}
            >
              <PillarIllustration kind={kindOf(c.kind)} className="h-3/5 w-auto max-w-full" />
            </div>
          ))}
          <canvas ref={canvasRef} aria-hidden className="pj-canvas absolute inset-0 size-full" />
        </div>
      </div>

      <div>
        {cards.map((c, i) => (
          <div key={i} data-beat={i} className="flex min-h-[72svh] items-end py-8 lg:min-h-[88svh] lg:items-center">
            <article className="card-v3 w-full max-w-[33rem] p-7 md:p-10" data-reveal>
              <div className="flex items-center gap-5">
                <span aria-hidden className="pj-glyph">
                  {faNum(i + 1).padStart(2, '۰')}
                </span>
                <div>
                  {c.tag && (
                    <p className="flex items-center gap-2 text-300 font-bold text-emerald">
                      <span aria-hidden className="size-1.5 rounded-full bg-gold" />
                      {c.tag}
                    </p>
                  )}
                  <h3 className="mt-1 text-700 font-black leading-snug md:text-800">{c.title}</h3>
                </div>
              </div>
              {c.text && <p className="mt-5 text-400 leading-normal text-text-muted">{c.text}</p>}
              <ol aria-hidden className="mt-7 flex flex-wrap gap-2">
                {cards.map((x, j) => (
                  <li key={j} className={`pj-step ${j === i ? 'is-on' : ''}`}>
                    {x.title}
                  </li>
                ))}
              </ol>
            </article>
          </div>
        ))}
      </div>
    </div>
  )
}
