import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { site } from '@/lib/site'
import { fa, yearsSince } from '@/lib/content/bio'
import { HeroStory } from './home/HeroStory'
import { HeroWatch } from './home/HeroWatch'

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
/* The brand line "سیستم بساز، آزاد باش" stays as the footer's sign-off; up
   here the promise is spelled out, because a visitor meeting the site for the
   first time read the tagline and did not know what it offered. Copy is the
   owner's own wording (1405/07). */
const LINE_1 = ['از', 'مدیریت', 'ریزه‌کاری‌ها']
const LINE_2 = ['تا', 'رهبری', 'یک', 'کسب‌وکار', 'خودمختار']

/**
 * A sticker beside the years line: the number in the middle, a ring of text
 * turning slowly around it. Decorative — the sentence beside it says the same
 * thing in words — so it is aria-hidden. Reduced motion stops the ring.
 */
function YearsSticker({ years }: { years: string }) {
  return (
    <span aria-hidden className="years-sticker relative grid size-20 flex-none place-items-center">
      <svg viewBox="0 0 100 100" className="years-ring absolute inset-0 size-full text-gold-light">
        <defs>
          <path id="years-ring-path" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 4" />
        <text fontSize="10.5" fontWeight="700" fill="currentColor" letterSpacing="0.5">
          <textPath href="#years-ring-path" startOffset="50%" textAnchor="middle">از میدان · از ۱۳۸۰ تا امروز · تجربهٔ واقعی ·</textPath>
        </text>
      </svg>
      <span className="relative grid size-12 place-items-center rounded-full bg-gold text-500 font-black leading-none text-forest-deep">
        {years}
      </span>
    </span>
  )
}

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
      <HeroWatch />
      <span aria-hidden className="glow-emerald -top-40 end-[-10%] size-[38rem] opacity-60" />
      <span aria-hidden className="glow-gold bottom-[-12rem] start-[-8rem] size-[26rem] opacity-50" />

      <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-6 pb-16 pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:py-16 xl:gap-28">
        <div>
          <p className="enter inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-raised/60 px-3.5 py-1.5 text-200 font-medium text-text-muted backdrop-blur-sm">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-[2px] bg-gold opacity-60" />
              <span className="relative size-2 rounded-[2px] bg-gold" />
            </span>
            {site.role}
          </p>

          <h1 className="mt-7 text-[clamp(2.4rem,4vw,3.6rem)] font-black leading-[1.25] tracking-tight">
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
            اگر گوشی شما اتاق فرمان مجموعه‌ای از کارهای کوچک است، همراه شما هستم تا فرآیندها را
            منظم، تیم را مستقل و هوش مصنوعی را فعال به کار بگیرید.
          </p>
          <p
            className="enter mt-5 flex items-center gap-4 text-400 font-bold text-text"
            style={{ animationDelay: '580ms' }}
          >
            <YearsSticker years={fa(yearsSince(1380))} />
            <span>
              حاصل <span className="text-gold-light">{fa(yearsSince(1380))} سال</span> تجربهٔ واقعی
              در میدان کسب‌وکار
            </span>
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
