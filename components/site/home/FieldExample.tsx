import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { fieldExample } from '@/lib/content/bio'

/**
 * The one thing a CV cannot carry: something actually built. Three panels —
 * problem, action, change — joined by a connector with data flowing through it,
 * left to right in reading order (which is right to left on screen).
 *
 * Copy is lib/content/bio.ts `fieldExample`, the same text /about shows.
 */
export function FieldExample() {
  const parts = [
    { label: 'مسئله', body: fieldExample.problem },
    { label: 'کاری که کردیم', body: fieldExample.action },
    { label: 'چه چیزی عوض شد', body: fieldExample.result },
  ]

  return (
    <section className="tone-inverse tone-deep bp-grid relative overflow-hidden py-24 md:py-36">
      <span aria-hidden className="glow-emerald top-1/3 start-1/3 size-[30rem] opacity-40" />
      <Container>
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">{fieldExample.eyebrow} از میدان</p>
          <h2 className="mt-4 text-700 md:text-800">{fieldExample.title}</h2>
        </div>

        <div className="relative mt-16">
          {/* connector behind the panels, desktop only */}
          <svg aria-hidden className="absolute inset-x-[8%] top-[3.25rem] hidden h-1 md:block">
            <line x1="100%" y1="2" x2="0" y2="2" className="flow text-gold-light" stroke="currentColor" strokeWidth="2" />
          </svg>

          <ol className="relative grid gap-5 md:grid-cols-3 md:gap-8">
            {parts.map((p, i) => (
              <li
                key={p.label}
                data-reveal
                style={{ '--d': i + 1 } as CSSProperties}
                className="panel flex flex-col bg-bg-raised/80 p-7 backdrop-blur-sm md:p-8"
              >
                <span
                  className={`grid size-12 place-items-center rounded-lg text-500 font-black ${
                    i === 2 ? 'bg-gold text-forest-deep' : 'border border-border-strong bg-bg text-text'
                  }`}
                >
                  {['۱', '۲', '۳'][i]}
                </span>
                <p className="mt-6 text-500 font-bold text-gold-light">{p.label}</p>
                <p className="mt-3 text-300 leading-prose text-text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
