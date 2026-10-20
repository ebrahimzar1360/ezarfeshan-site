import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'

type Action = { label: string; href: string }

/**
 * The closing invitation used on the homepage, about and projects: a forest
 * band, one sentence, a gold primary button and an optional quiet second one.
 * Gold type is allowed here — it is on forest (4.71:1 and up).
 *
 * `aside` turns it into two columns, copy on the reading side: the homepage
 * puts the 3D monogram there (owner, 1405/07/28 — moved down from the hero).
 */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
  aside,
}: {
  title: ReactNode
  text?: ReactNode
  primary: Action
  secondary?: Action
  aside?: ReactNode
}) {
  const copy = (
    <>
      <h2 className="text-700 font-extrabold leading-tight md:text-800">{title}</h2>
      {text && (
        <p className={`mt-5 max-w-[38rem] text-400 leading-prose text-text-muted ${aside ? '' : 'mx-auto'}`}>{text}</p>
      )}
      <div className={`mt-8 flex flex-wrap items-center gap-3 ${aside ? '' : 'justify-center'}`}>
        <Button href={primary.href} variant="gold" size="lg">
          {primary.label}
          <Icon name="arrow" />
        </Button>
        {secondary && (
          <Button
            href={secondary.href}
            variant="outline"
            size="lg"
            className="border-paper/40 text-paper hover:bg-paper/10 hover:text-paper"
          >
            {secondary.label}
          </Button>
        )}
      </div>
    </>
  )

  return (
    <section className="py-12 md:py-20">
      <Container>
        <div
          className={`tone-inverse bp-grid relative overflow-hidden rounded-3xl bg-forest px-6 py-12 md:px-16 md:py-16 ${
            aside ? 'grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10' : 'text-center'
          }`}
          data-reveal
        >
          <span aria-hidden className="glow-gold -top-24 inset-x-0 mx-auto size-72 opacity-30" />
          {aside ? (
            <>
              <div>{copy}</div>
              <div className="mx-auto w-full max-w-[24rem] lg:max-w-[28rem]">{aside}</div>
            </>
          ) : (
            copy
          )}
        </div>
      </Container>
    </section>
  )
}
