import type { CSSProperties } from 'react'
import { Inline } from '@/components/cms/Inline'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSection } from '@/lib/cms/content'
import { HeroArt } from './HeroArt'

const rise = (s: number) => ({ '--dl': `${s}s` }) as CSSProperties

/**
 * v3 hero — the approved composition: copy on the reading side, the central
 * graphic opposite. The headline is one h1; the *accent* phrase is carried by
 * forest green and a gold rule, not gold type (2.10:1 on paper).
 *
 * Copy comes from the CMS (home.hero). The motion lives in HeroArt; the copy
 * only rises in once, in order.
 */
export async function Hero() {
  const hero = await getSection('home.hero')

  return (
    <section className="relative overflow-hidden">
      <span aria-hidden className="glow-gold -top-24 start-[-12rem] size-[30rem] opacity-40" />
      <span aria-hidden className="glow-emerald -top-16 end-[-10rem] size-[26rem] opacity-15" />

      <Container className="grid items-center gap-8 pb-14 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div>
          <h1 className="text-[clamp(2.2rem,3.5vw,3.3rem)] font-black leading-[1.3] tracking-tight">
            <span className="hero-rise block" style={rise(0.05)}>
              <Inline text={hero.line1} accentClass="ink-sweep text-emerald" />
            </span>
            {hero.line2 && (
              <span className="hero-rise block" style={rise(0.2)}>
                <Inline text={hero.line2} accentClass="ink-sweep text-emerald" />
              </span>
            )}
          </h1>

          {hero.lead && (
            <p
              className="hero-rise mt-6 max-w-[30rem] text-500 leading-normal text-text-muted"
              style={rise(0.4)}
            >
              <Inline text={hero.lead} />
            </p>
          )}

          {hero.button.label && (
            <div className="hero-rise mt-9" style={rise(0.6)}>
              <Button href={hero.button.href} variant="brand" size="lg">
                {hero.button.label}
                <Icon name="arrow" />
              </Button>
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-[34rem] lg:max-w-none">
          <HeroArt />
        </div>
      </Container>
    </section>
  )
}
