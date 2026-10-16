import type { CSSProperties, ReactNode } from 'react'
import { Container } from '@/components/ui/Container'

/**
 * Masthead for the inner pages: a forest band, the title in paper with an
 * accent phrase in gold-light (gold type is fine on forest), one line of lead.
 * `aside` takes the portrait on /about. The band is calm on purpose — a faint
 * blueprint grid and one soft light, no animation beyond the entrance.
 */
export function PageBand({
  title,
  lead,
  aside,
  children,
}: {
  title: ReactNode
  lead?: ReactNode
  aside?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="tone-inverse bp-grid relative overflow-hidden bg-forest">
      <span aria-hidden className="glow-gold -top-32 start-[-6rem] size-96 opacity-25" />
      <Container className={aside ? 'grid items-end gap-8 pt-14 md:grid-cols-[1.15fr_1fr] md:pt-20' : 'py-14 md:py-20'}>
        <div className={aside ? 'pb-14 md:pb-20' : ''}>
          <h1
            className="hero-rise max-w-3xl text-[clamp(2rem,3.8vw,3.2rem)] font-black leading-[1.3]"
            style={{ '--dl': '0.05s' } as CSSProperties}
          >
            {title}
          </h1>
          {lead && (
            <p
              className="hero-rise mt-5 max-w-[38rem] text-500 leading-prose text-text-muted"
              style={{ '--dl': '0.2s' } as CSSProperties}
            >
              {lead}
            </p>
          )}
          {children}
        </div>
        {aside}
      </Container>
    </header>
  )
}
