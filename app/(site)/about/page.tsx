import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import { FieldExample } from '@/components/site/home/FieldExample'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CountUp } from '@/components/ui/CountUp'
import { SectionHead } from '@/components/ui/SectionHead'
import { Tilt } from '@/components/ui/Tilt'
import {
  credentials,
  currentRoles,
  fa,
  milestones,
  yearsSince,
} from '@/lib/content/bio'
import { site, socials } from '@/lib/site'

export const metadata: Metadata = {
  title: 'درباره',
  description: `${site.positioning} — ${site.description}`,
}

/**
 * Every figure on this page is a duration Ebrahim stated, computed from its
 * start year so it cannot go stale. There are no outcome claims — no revenue,
 * no client counts, no percentages — because none were supplied.
 *
 * v2 layout: a night-ground masthead with the portrait on its gold frame; the
 * turning point as an editorial spread; the field example (shared with the
 * homepage); the road as a vertical rail; today's roles and training as two
 * panels; contact on the night ground again.
 */
export default function AboutPage() {
  const figures = [
    { value: yearsSince(1380), label: 'سال در حوزهٔ خودرو' },
    { value: yearsSince(1389), label: 'سال مدیریت نمایندگی' },
    { value: yearsSince(1391), label: 'سال در پخش قطعات' },
  ]

  return (
    <>
      <header className="tone-inverse tone-deep bp-grid relative overflow-hidden">
        <span aria-hidden className="glow-emerald -top-40 start-[-10%] size-[36rem] opacity-50" />
        <Container className="grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7">
            <p className="eyebrow enter">درباره</p>
            <h1 className="enter mt-5 text-display-sm font-black leading-[1.2]" style={{ animationDelay: '100ms' }}>
              مشاوری که هم از <span className="text-gold-light">میدان</span> آمده، هم از{' '}
              <span className="text-gold-light">آینده</span>
            </h1>
            <div
              className="enter mt-8 max-w-(--container-measure) space-y-5 text-400 leading-prose text-text-muted"
              style={{ animationDelay: '220ms' }}
            >
              <p>
                {fa(yearsSince(1380))} سال است در حوزهٔ خودرو کار می‌کنم. از فروش قطعات شروع
                کردم و {fa(yearsSince(1389))} سال است نمایندگی سایپا را مدیریت می‌کنم.
              </p>
              <p>
                یعنی مشکلاتی که دربارهٔ آن‌ها می‌نویسم را از بیرون تماشا نکرده‌ام. نیروی کلیدی
                از دست داده‌ام. فرایندی که فقط در سر خودم بود باعث توقف کار شده. انبار و
                زنجیرهٔ تأمینی را اداره کرده‌ام که بدون فرایند نوشته‌شده از دست خارج می‌شود.
              </p>
            </div>
            <dl
              className="enter mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border"
              style={{ animationDelay: '340ms' }}
            >
              {figures.map((f) => (
                <div key={f.label} className="bg-bg px-4 py-4">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <CountUp value={f.value} className="text-700 font-black text-gold-light" />
                    <span className="mt-1 block text-200 text-text-muted">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="enter md:col-span-5" style={{ animationDelay: '200ms' }}>
            <Tilt className="gold-frame mx-auto max-w-sm md:max-w-none">
              <Image
                src="/photos/portrait-about.jpg"
                alt="پرترهٔ ابراهیم زرفشان"
                width={1030}
                height={1373}
                sizes="(min-width: 768px) 40vw, 100vw"
                priority
                className="rounded-xl border border-border"
              />
            </Tilt>
          </div>
        </Container>
      </header>

      {/* The turning point, as an editorial spread: the conclusion is the pull
          quote, the reasoning runs beside it. */}
      <section className="py-24 md:py-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div data-reveal>
              <SectionHead eyebrow="نقطهٔ تغییر" title="چه چیزی مرا به اینجا رساند" />
              <p className="border-s-4 border-accent ps-6 text-700 font-black leading-snug text-text md:text-800">
                وقتی یک مشکل با هر آدمی تکرار شود، دیگر مشکل آدم نیست.
              </p>
            </div>
            <div className="space-y-5 text-400 leading-prose text-text-muted lg:pt-20" data-reveal style={{ '--d': 1 } as CSSProperties}>
              <p>
                سال‌ها فکر می‌کردم مشکل از آدم‌هاست. نیروی خوب پیدا نمی‌شود، آموزش نمی‌گیرد،
                می‌رود. هر بار از صفر شروع می‌کردم و هر بار به همان‌جا می‌رسیدم.
              </p>
              <p>
                نقطهٔ تغییر وقتی بود که دیدم الگو تکرار می‌شود — با آدم‌های مختلف، در بخش‌های
                مختلف، حتی در کسب‌وکار جدیدی که از صفر ساختم.
              </p>
              <p className="text-500 font-bold text-text">مشکل از سیستم است.</p>
              <p>
                از آن به بعد کارم عوض شد: به‌جای اینکه هر بار خودم مسئله را حل کنم، شروع کردم
                به نوشتن اینکه چطور حل می‌شود. این تفاوت بین کار کردن در کسب‌وکار و کار کردن
                روی کسب‌وکار است.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <FieldExample />

      <section className="bg-bg-band py-24 md:py-36">
        <Container>
          <SectionHead eyebrow="مسیر" title="از کجا آمده‌ام" />
          <ol className="relative max-w-3xl border-s-2 border-border ps-8 md:ps-12">
            {milestones.map((m, i) => (
              <li key={m.year} className="relative pb-14 last:pb-0" data-reveal style={{ '--d': i } as CSSProperties}>
                <span
                  aria-hidden
                  className={`absolute -start-[calc(2rem+8px)] top-2 size-3.5 rotate-45 border-2 border-accent md:-start-[calc(3rem+8px)] ${
                    m.ongoing ? 'bg-accent' : 'bg-bg-band'
                  }`}
                />
                <p className="text-800 font-black leading-none text-text">{fa(m.year)}</p>
                <h3 className="mt-3 text-500 font-bold">{m.title}</h3>
                <p className="mt-3 max-w-(--container-measure) text-300 leading-prose text-text-muted">{m.body}</p>
                {m.ongoing && (
                  <p className="mt-3 inline-flex rounded-md border border-border-strong px-2.5 py-1 text-200 text-text-muted">
                    تا امروز — {fa(yearsSince(m.year))} سال
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-24 md:py-36">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel p-8 md:p-10" data-reveal>
              <p className="eyebrow">امروز</p>
              <h2 className="mt-3 text-600 font-bold">نقش‌های فعلی</h2>
              <ul className="mt-8 divide-y divide-border">
                {currentRoles.map((r) => (
                  <li key={r.title} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="text-400 font-medium">{r.title}</span>
                    <span className="shrink-0 text-200 text-text-subtle">{r.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-8 md:p-10" data-reveal style={{ '--d': 1 } as CSSProperties}>
              <p className="eyebrow">آموزش</p>
              <h2 className="mt-3 text-600 font-bold">مدارک و دوره‌ها</h2>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {credentials.map((c) => (
                  <li key={c.title} className="rounded-lg border border-border-strong px-4 py-2.5">
                    <span className="latin text-400 font-bold">{c.title}</span>
                    {c.note && <span className="ms-2 text-200 text-text-subtle">· {c.note}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-300 leading-prose text-text-muted">
                هوش مصنوعی برای من موضوع تازه‌ای است که دارم یاد می‌گیرم، نه چیزی که سال‌ها
                در آن کار کرده باشم. آنچه اضافه می‌کنم این است که می‌دانم کجای یک کسب‌وکار
                واقعی به آن نیاز دارد.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="tone-inverse tone-deep bp-grid relative overflow-hidden py-24 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:items-end">
            <div data-reveal>
              <p className="eyebrow">تماس</p>
              <h2 className="mt-4 text-700 font-black md:text-800">
                اگر مسئله‌ات از جنس همین حرف‌هاست، <span className="text-gold-light">بنویس.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/consult" size="lg">
                  درخواست مشاوره
                </Button>
                <Button href="/articles" size="lg" variant="outline">
                  از مقالات شروع کن
                </Button>
              </div>
            </div>
            <ul className="space-y-3" data-reveal style={{ '--d': 1 } as CSSProperties}>
              <li>
                <a href={`mailto:${site.email}`} className="latin text-400">
                  {site.email}
                </a>
              </li>
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-400">
                    {s.label}
                    {s.handle && <span className="latin text-text-subtle"> · {s.handle}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  )
}
