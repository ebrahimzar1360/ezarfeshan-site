import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CountUp } from '@/components/ui/CountUp'
import { yearsSince } from '@/lib/content/bio'
import { site } from '@/lib/site'
import { HeroStory } from './home/HeroStory'

/**
 * v2 hero: night ground, blueprint grid, and the before/consult/after story
 * (HeroStory) — the thesis drawn, not just written.
 *
 * The tagline is still the h1 and still the thesis. It is split into words so
 * each can rise into place, but the words stay real text in one heading —
 * its textContent is exactly the tagline, with the spaces kept as text nodes.
 *
 * `data-hero` is also a hook: globals.css flips the sticky header to the dark
 * tone on any page that carries one, so the bar does not sit as a pale strip
 * on top of a night-coloured opening.
 *
 * CTA order is unchanged from the brief: read → subscribe → enquire.
 */
const LINE_1 = ['سیستم', 'بساز،']
const LINE_2 = ['آزاد', 'باش']

const FIGURES = [
  { value: yearsSince(1380), label: 'سال در حوزهٔ خودرو' },
  { value: yearsSince(1389), label: 'سال مدیریت نمایندگی' },
  { value: yearsSince(1397), label: 'سال از تأسیس کسب‌وکار دوم' },
]

function Words({ words, offset }: { words: string[]; offset: number }) {
  return words.map((w, i) => (
    <span key={w}>
      {i > 0 && ' '}
      <span className="split-word">
        <span style={{ '--w': i + offset } as CSSProperties}>{w}</span>
      </span>
    </span>
  ))
}

export function Hero() {
  return (
    <section data-hero className="tone-inverse tone-deep bp-grid relative overflow-hidden">
      <span aria-hidden className="glow-emerald -top-40 end-[-10%] size-[38rem] opacity-60" />
      <span aria-hidden className="glow-gold bottom-[-12rem] start-[-8rem] size-[26rem] opacity-50" />

      <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-6 pb-16 pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:py-16">
        <div>
          <p className="enter inline-flex items-center gap-2.5 rounded-lg border border-border bg-bg-raised/60 px-3.5 py-1.5 text-200 font-medium text-text-muted backdrop-blur-sm">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-[2px] bg-gold opacity-60" />
              <span className="relative size-2 rounded-[2px] bg-gold" />
            </span>
            {site.role}
          </p>

          <h1 className="mt-7 text-display font-black leading-[1.15] tracking-tight">
            <span className="block">
              <Words words={LINE_1} offset={0} />
            </span>{' '}
            <span className="block text-gold-light">
              <span className="ink-sweep">
                <Words words={LINE_2} offset={2} />
              </span>
            </span>
          </h1>

          <p
            className="enter mt-7 max-w-[34rem] text-500 leading-normal text-text-muted"
            style={{ animationDelay: '520ms' }}
          >
            برای مدیرانی که کسب‌وکارشان بدون خودشان از حرکت می‌ایستد. از میدان آمده‌ام، نه از
            کلاس — و حالا ابزارهای تازه را روی همان تجربه سوار می‌کنم.
          </p>

          <div
            className="enter mt-10 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '640ms' }}
          >
            <Button href="/articles" size="lg" round>
              آخرین مقالات
            </Button>
            <Button href="/newsletter" size="lg" variant="outline" round>
              عضویت در خبرنامه
            </Button>
          </div>

          <dl
            className="enter mt-14 grid max-w-[34rem] grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border"
            style={{ animationDelay: '780ms' }}
          >
            {FIGURES.map((f) => (
              <div key={f.label} className="bg-bg px-4 py-4 sm:px-5">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <CountUp value={f.value} className="text-700 font-black text-gold-light" />
                  <span className="mt-1 block text-200 leading-snug text-text-muted">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="enter" style={{ animationDelay: '200ms' }}>
          <HeroStory />
        </div>
      </Container>

    </section>
  )
}
