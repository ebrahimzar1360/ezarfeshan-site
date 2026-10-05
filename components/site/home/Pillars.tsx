import type { CSSProperties, ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'

/**
 * Four pillars as a bento grid — the four layers of the hero stack, opened up.
 *
 * Every line restates something the site already says elsewhere (the article
 * titles, the field example on /about, the warning on /consult); nothing here
 * is a new claim. Each tile carries a small live diagram drawn in SVG strokes.
 *
 * Titles are <p>, not <h3>: e2e/site.spec.ts opens the first level-3 heading on
 * the homepage and expects it to be an article.
 */
function Tile({
  index,
  title,
  body,
  art,
  className = '',
  dark = false,
}: {
  index: number
  title: string
  body: string
  art: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <li
      data-reveal
      style={{ '--d': index } as CSSProperties}
      className={`panel panel-hover group relative flex flex-col justify-between overflow-hidden p-7 md:p-9 ${
        dark ? 'tone-inverse tone-deep bp-grid' : ''
      } ${className}`}
    >
      <div className="mb-8 h-36 md:h-40">{art}</div>
      <div>
        <p className="latin text-200 font-medium text-text-subtle">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="mt-2 text-600 font-bold text-text">{title}</p>
        <p className="mt-3 max-w-[34rem] text-300 leading-prose text-text-muted">{body}</p>
      </div>
    </li>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** A flowchart: three steps, one decision, data moving along the connectors. */
function ProcessArt() {
  return (
    <svg viewBox="0 0 420 150" className="draw h-full w-full text-text-subtle" aria-hidden>
      <g {...stroke}>
        <rect x="320" y="50" width="90" height="46" rx="8" style={{ '--len': 280 } as CSSProperties} />
        <rect x="180" y="50" width="90" height="46" rx="8" style={{ '--len': 280, '--d': 1 } as CSSProperties} />
        <path d="M60 40l40 33-40 33-40-33z" style={{ '--len': 220, '--d': 2 } as CSSProperties} />
      </g>
      <g fill="none" strokeWidth="1.6" className="text-accent" stroke="currentColor">
        <path className="flow" d="M320 73h-50" />
        <path className="flow" d="M180 73h-80" />
      </g>
      <rect x="320" y="50" width="6" height="46" className="fill-accent" />
      <g className="fill-current text-text-muted" fontSize="13" fontFamily="inherit" textAnchor="middle">
        <text x="365" y="78">ثبت</text>
        <text x="225" y="78">بررسی</text>
        <text x="60" y="78">تأیید؟</text>
      </g>
    </svg>
  )
}

/** Bars rising to a measured level, with a target line. */
function MetricsArt() {
  const bars = [46, 70, 58, 92, 110]
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden>
      <path d="M10 30h200" className="text-accent" stroke="currentColor" strokeDasharray="4 6" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={22 + i * 38}
          y={140 - h}
          width="22"
          height={h}
          rx="3"
          className={`bar-grow ${i === bars.length - 1 ? 'fill-accent' : 'fill-current text-border-strong'}`}
          style={{ '--d': i } as CSSProperties}
        />
      ))}
    </svg>
  )
}

/** A team as a network of roles: one node leaves, the structure holds. */
function TeamArt() {
  const nodes: [number, number][] = [
    [110, 30], [40, 80], [180, 80], [70, 130], [150, 130],
  ]
  return (
    <svg viewBox="0 0 220 160" className="h-full w-full" aria-hidden>
      <g stroke="currentColor" className="text-border-strong" strokeWidth="1.4">
        {[[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [1, 2]].map(([a, b]) => (
          <line key={`${a}${b}`} x1={nodes[a!]![0]} y1={nodes[a!]![1]} x2={nodes[b!]![0]} y2={nodes[b!]![1]} />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <rect
          key={i}
          x={x - 11}
          y={y - 11}
          width="22"
          height="22"
          rx="5"
          className={i === 0 ? 'fill-accent' : i === 4 ? 'node-swap fill-current text-text-muted' : 'fill-current text-text-subtle'}
        />
      ))}
    </svg>
  )
}

/** Order first, speed second: a grid of process cells with a spark crossing it. */
function AiArt() {
  return (
    <svg viewBox="0 0 420 150" className="h-full w-full" aria-hidden>
      <g stroke="currentColor" className="text-border" strokeWidth="1">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`v${i}`} x1={30 + i * 52} y1="10" x2={30 + i * 52} y2="140" />
        ))}
        {Array.from({ length: 3 }, (_, i) => (
          <line key={`h${i}`} x1="10" y1={30 + i * 45} x2="410" y2={30 + i * 45} />
        ))}
      </g>
      <path
        className="flow text-gold-light"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        d="M394 30H290v45H186v45H30"
      />
      <circle r="6" className="fill-gold spark">
        <animateMotion dur="5s" repeatCount="indefinite" path="M394 30H290v45H186v45H30" />
      </circle>
    </svg>
  )
}

export function Pillars() {
  return (
    <section className="py-24 md:py-36">
      <Container>
        <SectionHead
          eyebrow="چهار لایه"
          title="سیستم یعنی این چهار چیز، نوشته‌شده"
          lead="همان چهار لایه‌ای که بالا روی هم سوار شدند. هر کدام جدا ساخته می‌شود و با بقیه قفل می‌شود — و هر نوشتهٔ این سایت دربارهٔ یکی از آن‌هاست."
        />
        <ul className="grid gap-4 md:grid-cols-6 md:gap-5">
          <Tile
            index={0}
            className="md:col-span-4"
            title="فرایند"
            body="کاری که فقط در سر یک نفر است، دارایی نیست — ریسک است. فرایند نوشته‌شده یعنی نفر بعدی بتواند بدون تو ادامه بدهد."
            art={<ProcessArt />}
          />
          <Tile
            index={1}
            className="md:col-span-2"
            title="داده"
            body="عملکرد باید از یک حس به یک عدد تبدیل شود: قابل اندازه‌گیری، قابل مرور، یکسان برای همه."
            art={<MetricsArt />}
          />
          <Tile
            index={2}
            className="md:col-span-2"
            title="تیم"
            body="آدم‌ها می‌آیند و می‌روند. وقتی نقش‌ها تعریف شده باشند، هر رفتن یعنی شروع دوباره نیست."
            art={<TeamArt />}
          />
          <Tile
            index={3}
            dark
            className="md:col-span-4"
            title="هوش مصنوعی"
            body="خودکار کردن کاری که فرایندش نوشته نشده، فقط بی‌نظمی را سریع‌تر می‌کند. اول فرایند، بعد ابزار — آن‌وقت برای یک تیم پنج‌نفره هم جواب می‌دهد."
            art={<AiArt />}
          />
        </ul>
      </Container>
    </section>
  )
}
