import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
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
 * CTAs: enquiring leads (owner's call, 1405/07) — a strip with the free first
 * conversation and the 48-hour answer — then read and subscribe as quieter
 * round buttons. The years-in-the-field figures moved out: /about and the
 * homepage's about block already carry them.
 */
const LINE_1 = ['سیستم', 'بساز،']
const LINE_2 = ['آزاد', 'باش']

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

          {/* The one primary action: enquire. Same promise as /consult and the
              "how I work" block — first conversation free, answer within 48
              working hours — so nothing here is new, only moved up. */}
          <Link
            href="/consult"
            className="enter offer group mt-9 flex max-w-[34rem] flex-wrap items-center gap-x-4 gap-y-3 rounded-full border border-gold/55 bg-gold/8 p-2.5 transition-[background-color,border-color] duration-150 hover:border-gold hover:bg-gold/15 max-sm:rounded-xl"
            style={{ animationDelay: '640ms' }}
          >
            <Image
              src="/photos/portrait-square.jpg"
              alt=""
              width={620}
              height={620}
              sizes="56px"
              className="size-14 flex-none rounded-full border-2 border-gold object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-500 font-bold text-text">
                اولین گفت‌وگو
                <span className="offer-badge rounded-full bg-gold px-2.5 py-0.5 text-200 font-black text-forest-deep">
                  رایگان
                </span>
              </span>
              <span className="mt-0.5 block text-300 text-text-muted">پاسخ ظرف ۴۸ ساعت کاری</span>
            </span>
            <span className="offer-cta inline-flex h-12 flex-none items-center justify-center gap-2 rounded-full bg-gold px-6 text-400 font-black text-forest-deep max-sm:w-full">
              درخواست مشاوره
              <span aria-hidden className="offer-arrow">←</span>
            </span>
          </Link>

          <div
            className="enter mt-5 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '760ms' }}
          >
            <Button href="/articles" variant="outline" round>
              آخرین مقالات
            </Button>
            <Button href="/newsletter" variant="outline" round>
              عضویت در خبرنامه
            </Button>
          </div>
        </div>

        <div className="enter" style={{ animationDelay: '200ms' }}>
          <HeroStory />
        </div>
      </Container>

    </section>
  )
}
