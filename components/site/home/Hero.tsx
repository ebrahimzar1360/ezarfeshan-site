import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { HeroArt } from './HeroArt'

const rise = (s: number) => ({ '--dl': `${s}s` }) as CSSProperties

/**
 * v3 hero — the approved composition: copy on the reading side, the central
 * graphic opposite. The headline is one h1; "سیستم‌های هوشمند" is carried by
 * forest green and a gold rule, not gold type (2.10:1 on paper).
 *
 * The motion lives in HeroArt; the copy only rises in once, in order.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <span aria-hidden className="glow-gold -top-24 start-[-12rem] size-[30rem] opacity-40" />
      <span aria-hidden className="glow-emerald -top-16 end-[-10rem] size-[26rem] opacity-15" />

      <Container className="grid items-center gap-8 pb-14 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div>
          <h1 className="text-[clamp(2.2rem,3.5vw,3.3rem)] font-black leading-[1.3] tracking-tight">
            <span className="hero-rise block" style={rise(0.05)}>
              مدیریت واقعی،
            </span>
            <span className="hero-rise block" style={rise(0.2)}>
              با{' '}
              <span className="ink-sweep text-emerald">سیستم‌های هوشمند</span>
            </span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-[30rem] text-500 leading-normal text-text-muted"
            style={rise(0.4)}
          >
            تجربه کسب‌وکار، سیستم‌سازی و هوش مصنوعی در یک مسیر
          </p>

          <div className="hero-rise mt-9" style={rise(0.6)}>
            <Button href="/about" variant="brand" size="lg">
              مسیر کاری من
              <Icon name="arrow" />
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[34rem] lg:max-w-none">
          <HeroArt />
        </div>
      </Container>
    </section>
  )
}
