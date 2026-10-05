import type { CSSProperties, ReactNode } from 'react'
import { Container } from './Container'

/**
 * Masthead for every inner page: blueprint grid, eyebrow with the gold marker,
 * a display-size title, an optional lead, and the logo's ring turning slowly at
 * the far edge — the hero's language, at page scale.
 *
 * `tone="deep"` puts it on the night ground (about, consult); the default is
 * the warm band surface, which flips with the theme.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  tone = 'band',
  aside,
  width = 'page',
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  tone?: 'band' | 'deep'
  aside?: ReactNode
  width?: 'page' | 'measure'
}) {
  const deep = tone === 'deep'
  return (
    <header
      className={`bp-grid relative overflow-hidden border-b border-border ${
        deep ? 'tone-inverse tone-deep' : 'bg-bg-band'
      }`}
    >
      {deep && <span aria-hidden className="glow-emerald -top-32 end-0 size-[28rem] opacity-50" />}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        fill="none"
        className="ring-spin pointer-events-none absolute -end-24 -top-24 hidden size-[26rem] md:block"
      >
        <circle cx="100" cy="100" r="78" stroke="currentColor" className="text-border-strong" strokeWidth="0.8" strokeDasharray="420 70" />
        <circle cx="158" cy="48" r="5" className="fill-accent" />
      </svg>

      <Container width={width} className="relative py-16 md:py-24">
        <div className={aside ? 'grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]' : ''}>
          <div>
            {children}
            {eyebrow && (
              <p className="eyebrow enter" style={{ animationDelay: '60ms' } as CSSProperties}>
                {eyebrow}
              </p>
            )}
            <h1
              className="enter mt-4 max-w-4xl text-display-sm font-black leading-[1.2]"
              style={{ animationDelay: '120ms' }}
            >
              {title}
            </h1>
            {lead && (
              <p
                className="enter mt-6 max-w-(--container-measure) text-500 leading-normal text-text-muted"
                style={{ animationDelay: '220ms' }}
              >
                {lead}
              </p>
            )}
          </div>
          {aside}
        </div>
      </Container>
    </header>
  )
}
