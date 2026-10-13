'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { fa } from '@/lib/content/bio'

/**
 * The hero's picture: the site's thesis told as a three-act story.
 *
 *   before   — a manager's phone fills with questions; each one spills out
 *              and hangs off the phone, because every one of them waits on
 *              the manager.
 *   consult  — Ebrahim's card arrives, large and centred: the turn of the
 *              story is a person, not a tool.
 *   after    — the same six questions snap into one written process under
 *              his card, the last step carrying AI, and the phone goes quiet
 *              with a single daily report.
 *
 * It replaced a 3D stack of slabs whose meaning nobody could read without
 * the labels. This one has to be understood with the sound off and the text
 * unread.
 *
 * Mechanics
 * - Positions are design-space pixels converted to `cqw` of the `.story`
 *   container, so the whole drawing scales with its column. Two layouts —
 *   wide (520) and narrow (358) — are both written into each element's custom
 *   properties and globals.css picks one with a container query. Nothing is
 *   measured in JS, so the server render is already the right shape.
 * - The server renders the finished state (act 3). That is also what
 *   reduced-motion and no-JS visitors keep. With JS, the stage is hidden until
 *   hydration resets it to act 0 and plays; a CSS fallback reveals it anyway
 *   if hydration never comes.
 * - It starts when 40% of it is on screen, plays once and stops on the
 *   finished picture. A replay button appears
 *   afterwards; a hero that loops forever competes with the headline.
 * - The drawing is aria-hidden; the visually-hidden caption says the same.
 * - No <h3> in here: the homepage's first h3 must be an article title (e2e).
 */

type Act = 'intro' | 'before' | 'consult' | 'after'

const ACTS: { key: Act; label: string }[] = [
  { key: 'before', label: 'قبل' },
  { key: 'consult', label: 'با مشاوره' },
  { key: 'after', label: 'بعد' },
]

/** Arrival order is how the questions land; `step` is where each sits in the process. */
const ITEMS = [
  { from: 'رضا (انبار)', q: 'این قطعه موجوده؟', s: 'بررسی موجودی', r: 'موجودی به‌روز است', step: 1 },
  { from: 'مشتری', q: 'سفارشم کجاست؟', s: 'ثبت سفارش', r: 'سفارش‌ها ثبت شد', step: 0 },
  { from: 'حسابداری', q: 'فاکتورش صادر شد؟', s: 'صدور فاکتور', r: 'فاکتورها صادر شد', step: 2 },
  { from: 'انبار', q: 'بار امروز بره یا نه؟', s: 'ارسال', r: 'بار امروز رفت', step: 3 },
  { from: 'تماس از دست‌رفته', q: 'مشتری شاکیه!', s: 'پیگیری مشتری', r: 'مشتری‌ها پیگیری شدند', step: 4 },
  { from: 'مریم (فروش)', q: 'آمار این ماه چند شد؟', s: 'گزارش روزانه', r: 'خلاصه با هوش مصنوعی', step: 5, ai: true },
] as const

/* ---------- design space ---------- */

type Pt = readonly [x: number, y: number, rot: number]

type Layout = {
  w: number
  phone: { x: number; y: number; w: number; h: number }
  chip: { w: number; h: number }
  col: number
  top: number
  gap: number
  spine: number
  card: { x: number; y: number; cx: number; cy: number }
  /** where each question hangs in act 1, in arrival order */
  chaos: readonly Pt[]
}

const WIDE: Layout = {
  w: 520,
  phone: { x: 0, y: 130, w: 200, h: 400 },
  chip: { w: 236, h: 48 },
  col: 284,
  top: 140,
  gap: 64,
  spine: 266,
  card: { x: 220, y: 0, cx: 110, cy: 222 },
  chaos: [
    [250, 20, -5],
    [40, 40, 4],
    [270, 130, -3],
    [230, 235, 5],
    [275, 345, -4],
    [215, 455, 3],
  ],
}

const NARROW: Layout = {
  w: 358,
  phone: { x: 0, y: 120, w: 136, h: 290 },
  chip: { w: 196, h: 42 },
  col: 162,
  top: 108,
  gap: 54,
  spine: 149,
  card: { x: 152, y: 0, cx: 76, cy: 150 },
  chaos: [
    [150, 0, -5],
    [0, 40, 4],
    [162, 110, -3],
    [10, 200, 5],
    [158, 280, -4],
    [20, 380, 3],
  ],
}


const cq = (px: number, L: Layout) => `${((px / L.w) * 100).toFixed(3)}cqw`

/** One element's positions in both layouts, as `--{name}d` / `--{name}m` pairs. */
function vars(pick: (L: Layout) => Record<string, number>): CSSProperties {
  const out: Record<string, string> = {}
  for (const [L, suffix] of [[WIDE, 'd'], [NARROW, 'm']] as const) {
    for (const [k, v] of Object.entries(pick(L))) {
      out[`--${k}${suffix}`] = k.startsWith('r') ? `${v}deg` : cq(v, L)
    }
  }
  return out as CSSProperties
}

const phoneCentre = (L: Layout) => ({
  x: L.phone.x + L.phone.w / 2,
  y: L.phone.y + L.phone.h / 2,
})

function chipVars(i: number, step: number) {
  return vars((L) => {
    const [cx, cy, r] = L.chaos[i] ?? [0, 0, 0]
    const p = phoneCentre(L)
    return {
      fx: p.x - L.chip.w / 2,
      fy: p.y - L.chip.h / 2,
      cx,
      cy,
      r,
      ox: L.col,
      oy: L.top + step * L.gap,
    }
  })
}

function Lines({ L, className }: { L: Layout; className: string }) {
  const p = phoneCentre(L)
  const h = L.top + 5 * L.gap + L.chip.h + 20
  return (
    <svg className={`story-lines ${className}`} viewBox={`0 0 ${L.w} ${h}`} preserveAspectRatio="none">
      {L.chaos.map(([x, y], i) => (
        <line
          key={i}
          x1={p.x}
          y1={p.y}
          x2={x + L.chip.w / 2}
          y2={y + L.chip.h / 2}
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </svg>
  )
}

/* ---------- timeline ---------- */

const T = {
  start: 900, // let the headline land first
  each: 600, // one question every 600ms
  toConsult: 1300, // after the last question
  toAfter: 2800, // how long the card holds the stage
  done: 3800, // after act 3 begins, when the replay button appears
}

export function HeroStory() {
  const [act, setAct] = useState<Act>('after')
  const [count, setCount] = useState<number>(ITEMS.length)
  const [live, setLive] = useState(false)
  const [still, setStill] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [done, setDone] = useState(true)
  const [run, setRun] = useState(0)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setLive(true)
    setStill(still)
    if (still) return

    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    // Jump to act 0 with transitions off, so nothing flies backwards.
    setFrozen(true)
    setAct('intro')
    setCount(0)
    setDone(false)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setFrozen(false)))

    // Play when it is actually seen. On a phone the story sits below the fold,
    // and a story that finishes before anyone scrolls to it was never told.
    const mounted = performance.now()
    const play = () => {
      const settle = run === 0 ? Math.max(300, T.start - (performance.now() - mounted)) : 300
      let t = settle
      at(t, () => setAct('before'))
      for (let i = 1; i <= ITEMS.length; i++) {
        at(t, () => setCount(i))
        t += T.each
      }
      t += T.toConsult - T.each
      at(t, () => setAct('consult'))
      t += T.toAfter
      at(t, () => setAct('after'))
      at(t + T.done, () => setDone(true))
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          play()
        }
      },
      { threshold: 0.4 },
    )
    if (stage.current) io.observe(stage.current)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [run])

  const shown = Math.min(count, ITEMS.length)
  const notes = ITEMS.slice(0, shown).reverse()
  const tagIndex = ACTS.findIndex((a) => a.key === act)

  return (
    <figure className="story" data-live={live || undefined}>
      <figcaption className="sr-only">
        گوشی مدیری که پر از سؤال‌های کارکنان و مشتری‌هاست؛ با مشاورهٔ ابراهیم زرفشان همان کارها
        به یک فرایند نوشته‌شده تبدیل می‌شوند و در پایان روز فقط یک گزارش می‌رسد.
      </figcaption>

      <div className="mb-5 flex justify-center">
        <ol aria-hidden className="story-tabs">
          {ACTS.map((a, i) => (
            <li key={a.key} data-on={i === tagIndex || undefined}>
              {a.label}
            </li>
          ))}
        </ol>
      </div>

      <div ref={stage} aria-hidden className="story-stage" data-act={act} data-frozen={frozen || undefined}>
        <Lines L={WIDE} className="story-wide" />
        <Lines L={NARROW} className="story-narrow" />

        <span className="story-spine" style={vars((L) => ({ sx: L.spine, sy: L.top + L.chip.h / 2, sh: 5 * L.gap }))} />
        <span className="story-dot" style={vars((L) => ({ sx: L.spine, sy: L.top + L.chip.h / 2, sh: 5 * L.gap }))} />

        {/* the phone */}
        <div
          className="story-phone"
          data-buzz={shown > 0 && act === 'before' ? shown % 2 : undefined}
          style={vars((L) => ({ x: L.phone.x, y: L.phone.y, w: L.phone.w, h: L.phone.h }))}
        >
          <div className="story-screen">
            <span className="story-notch" />
            <p className="story-time">۹:۴۱</p>
            <p className="story-day">شنبه</p>
            {shown > 0 && <span className="story-badge">{fa(shown * 4 + 3)}</span>}
            <ul className="story-notes">
              {notes.map((n, k) => (
                <li key={n.q} style={{ '--k': k } as CSSProperties} data-hide={k > 3 || undefined}>
                  <b>{n.from}</b>
                  <span>{n.q}</span>
                </li>
              ))}
            </ul>
            <div className="story-report">
              <p className="story-report-title">گزارش امروز آماده است</p>
              {/* one line per step, ticking in with its chip */}
              {[...ITEMS]
                .sort((x, y) => x.step - y.step)
                .map((it) => (
                  <p key={it.r} style={{ '--k': it.step } as CSSProperties}>
                    <i>✓</i>
                    {it.r}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* the questions, later the process */}
        {ITEMS.map((it, i) => (
          <div
            key={it.q}
            className="story-chip"
            data-in={i < count || undefined}
            style={{ ...chipVars(i, it.step), '--k': it.step } as CSSProperties}
          >
            <span className="story-num">{fa(it.step + 1)}</span>
            <span className="story-text">
              <span className="story-q">{it.q}</span>
              <span className="story-s">{it.s}</span>
            </span>
            {'ai' in it && <span className="story-aitag">AI</span>}
          </div>
        ))}

        {/* the turn of the story */}
        <span className="story-veil" />
        <div
          className="story-card"
          style={vars((L) => ({ kx: L.card.x, ky: L.card.y, qx: L.card.cx, qy: L.card.cy }))}
        >
          <span className="story-photo">
            <Image src="/photos/portrait-square.jpg" alt="" width={620} height={620} sizes="140px" />
            <span className="story-check">✓</span>
          </span>
          <span className="story-who">
            <b>ابراهیم زرفشان</b>
            <span className="story-rule" />
            <span className="story-meta">
              <em>مشاور سیستم‌سازی</em>
            </span>
            <span className="story-meta">مدیر نمایندگی سایپا</span>
          </span>
        </div>
        <p className="story-caption">فرایند را با هم می‌نویسیم</p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="story-replay"
          data-show={(live && done && !still) || undefined}
        >
          <span aria-hidden className="story-replay-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </span>
          دوباره ببین
        </button>
      </div>
    </figure>
  )
}
