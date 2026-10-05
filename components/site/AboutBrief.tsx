import Image from 'next/image'
import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CountUp } from '@/components/ui/CountUp'
import { SectionHead } from '@/components/ui/SectionHead'
import { Tilt } from '@/components/ui/Tilt'
import { fa, milestones, yearsSince } from '@/lib/content/bio'

/**
 * Portrait + narrative + the road so far.
 *
 * The office frame rather than the studio one: the positioning is "came from
 * the field as well as from the future", and a suit against a seamless backdrop
 * only says the second half. The photo leans toward the pointer and sits on an
 * offset gold frame — the marker, grown into a frame.
 *
 * Below, the milestones run along a rail that fills with gold as it scrolls in.
 * Every year is from lib/content/bio.ts and every duration is computed.
 */
export function AboutBrief() {
  const figures = [
    { value: yearsSince(1380), label: 'سال در حوزهٔ خودرو' },
    { value: yearsSince(1389), label: 'سال مدیریت نمایندگی' },
    { value: yearsSince(1391), label: 'سال در پخش قطعات' },
  ]

  return (
    <section className="relative overflow-hidden bg-bg-band py-24 md:py-36">
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5" data-reveal="scale">
            <Tilt className="gold-frame relative mx-auto max-w-sm md:max-w-none">
              <Image
                src="/photos/portrait-office.jpg"
                alt="ابراهیم زرفشان پشت میز کارش"
                width={1080}
                height={1350}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="rounded-xl border border-border"
              />
              <p className="tilt-pop absolute -bottom-6 start-6 rounded-lg bg-forest-deep px-5 py-3.5 text-paper shadow-(--shadow)">
                <span className="block text-200 text-paper/75">از سال</span>
                <span className="text-600 font-black text-gold-light">{fa(1380)}</span>
              </p>
            </Tilt>
          </div>

          <div className="md:col-span-7">
            <SectionHead eyebrow="درباره" title="هم از میدان، هم از آینده" as="h2" />
            <div
              className="max-w-(--container-measure) space-y-5 text-400 leading-prose text-text-muted"
              data-reveal
            >
              <p>
                {fa(yearsSince(1380))} سال در حوزهٔ خودرو کار کرده‌ام و{' '}
                {fa(yearsSince(1389))} سال است نمایندگی سایپا را مدیریت می‌کنم. کنارش یک
                کسب‌وکار دیگر را هم از صفر ساخته‌ام.
              </p>
              <p>
                یعنی درگیری‌هایی که دربارهٔ آن‌ها می‌نویسم را خودم داشته‌ام: نیروی کلیدی که
                می‌رود، فرایندی که فقط در سر یک نفر است، انباری که بدون سیستم از دست خارج
                می‌شود.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4" data-reveal style={{ '--d': 1 } as CSSProperties}>
              {figures.map((f) => (
                <div key={f.label} className="border-t-2 border-accent pt-4">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <CountUp value={f.value} className="text-800 font-black text-text md:text-900" />
                    <span className="mt-1 block text-200 text-text-subtle">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ol className="rail-x mt-24 grid gap-10 md:grid-cols-4 md:gap-6" data-reveal="">
          {milestones.map((m, i) => (
            <li key={m.year} className="relative pt-10" style={{ '--d': i } as CSSProperties}>
              <span
                aria-hidden
                className="absolute start-0 top-1.5 size-3.5 rotate-45 border-2 border-accent bg-bg-band"
              />
              <p className="text-600 font-black text-text">{fa(m.year)}</p>
              <p className="mt-1 text-400 font-bold text-text">{m.title}</p>
              <p className="mt-2 text-300 leading-normal text-text-muted">{m.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14">
          <Button href="/about" variant="outline">
            روایت کامل‌تر
          </Button>
        </div>
      </Container>
    </section>
  )
}
