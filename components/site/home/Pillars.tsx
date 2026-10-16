import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'

/**
 * "از شفافیت تا هوشمندی" — three cards, in reading order: processes, systems,
 * AI. Each pairs a small drawn illustration with a title, a one-word state and
 * a single line. The illustrations are decorative SVG in the brand colours.
 */
const cards = [
  {
    kind: 'processes',
    title: 'فرایندها',
    tag: 'شفاف',
    text: 'تحلیل و بهینه‌سازی فرایندهای کسب‌وکار',
  },
  {
    kind: 'systems',
    title: 'سیستم‌ها',
    tag: 'منظم',
    text: 'طراحی و پیاده‌سازی سیستم‌های کارآمد',
  },
  {
    kind: 'ai',
    title: 'هوش مصنوعی',
    tag: 'هوشمند',
    text: 'استفاده کاربردی از هوش مصنوعی در کسب‌وکار واقعی',
  },
] as const

function Illustration({ kind }: { kind: (typeof cards)[number]['kind'] }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden focusable="false" className="size-32">
      <ellipse cx="48" cy="84" rx="30" ry="6" className="fill-forest-deep/10" />
      {kind === 'processes' && (
        <g>
          <rect x="20" y="12" width="46" height="62" rx="7" className="fill-white stroke-forest/25" strokeWidth="1.4" />
          <rect x="28" y="22" width="22" height="5" rx="2.5" className="fill-forest/35" />
          <rect x="28" y="33" width="30" height="4" rx="2" className="fill-forest/18" />
          <rect x="28" y="42" width="26" height="4" rx="2" className="fill-forest/18" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={29 + i * 9} y={64 - [8, 14, 20][i]!} width="6" height={[8, 14, 20][i]} rx="1.5" className={i === 2 ? 'fill-gold' : 'fill-emerald'} />
          ))}
          <circle cx="62" cy="58" r="15" className="fill-white/70 stroke-gold" strokeWidth="4" />
          <path d="M55 58l5 5 8-9" className="fill-none stroke-emerald" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M73 69l10 10" className="stroke-gold" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {kind === 'systems' && (
        <g>
          {[
            { y: 62, top: 'fill-sand', left: 'fill-sand-d1', right: 'fill-sand-d2' },
            { y: 50, top: 'fill-gold', left: 'fill-gold-d1', right: 'fill-gold-d2' },
            { y: 38, top: 'fill-emerald', left: 'fill-forest-deep', right: 'fill-forest' },
          ].map((s) => (
            <g key={s.y}>
              <polygon points={`18,${s.y} 48,${s.y + 15} 48,${s.y + 23} 18,${s.y + 8}`} className={s.left} />
              <polygon points={`48,${s.y + 15} 78,${s.y} 78,${s.y + 8} 48,${s.y + 23}`} className={s.right} />
              <polygon points={`48,${s.y - 15} 78,${s.y} 48,${s.y + 15} 18,${s.y}`} className={`${s.top} stroke-white/40`} strokeWidth="1" />
            </g>
          ))}
        </g>
      )}
      {kind === 'ai' && (
        <g>
          <circle cx="48" cy="46" r="32" className="fill-white stroke-emerald/35" strokeWidth="1.6" />
          {(
            [
              [34, 34, 36, 60],
              [34, 34, 62, 32],
              [62, 32, 50, 50],
              [34, 34, 50, 50],
              [50, 50, 36, 60],
              [50, 50, 64, 62],
              [62, 32, 64, 62],
            ] as const
          ).map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-forest/45" strokeWidth="1.8" />
          ))}
          {(
            [
              [34, 34],
              [62, 32],
              [36, 60],
              [64, 62],
            ] as const
          ).map(([cx, cy]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="5.5" className="fill-forest" />
          ))}
          <circle cx="50" cy="50" r="8" className="fill-gold" />
        </g>
      )}
    </svg>
  )
}

export function Pillars() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <header className="mb-12 text-center md:mb-16" data-reveal>
          <h2 className="text-700 font-extrabold md:text-800">از شفافیت تا هوشمندی</h2>
          <span aria-hidden className="mx-auto mt-5 block h-1 w-14 rounded-full bg-gold" />
        </header>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {cards.map((c, i) => (
            <article
              key={c.kind}
              data-reveal
              style={{ '--d': i } as CSSProperties}
              className="card-v3 card-v3-hover flex flex-col items-center px-6 py-9 text-center"
            >
              <Illustration kind={c.kind} />
              <h3 className="mt-5 text-600 font-extrabold">{c.title}</h3>
              <p className="mt-2 inline-flex items-center gap-2 text-300 font-bold text-emerald">
                <span aria-hidden className="size-1.5 rounded-full bg-gold" />
                {c.tag}
              </p>
              <p className="mt-4 max-w-[16rem] text-300 leading-normal text-text-muted">{c.text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
