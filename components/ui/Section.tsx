import type { ReactNode } from 'react'
import { Container } from './Container'

type Tone = 'paper' | 'raised' | 'forest'

const tones: Record<Tone, string> = {
  paper: 'bg-bg text-text',
  raised: 'bg-bg-raised text-text',
  // dark blocks carry more weight, so they also get more air (see DESIGN-PLAN §4)
  forest: 'bg-forest tone-inverse',
}

export function Section({
  children,
  tone = 'paper',
  className = '',
  id,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  id?: string
}) {
  const air = tone === 'forest' ? 'py-20 md:py-40' : 'py-16 md:py-32'
  return (
    <section id={id} className={`${tones[tone]} ${air} ${className}`}>
      <Container>{children}</Container>
    </section>
  )
}
