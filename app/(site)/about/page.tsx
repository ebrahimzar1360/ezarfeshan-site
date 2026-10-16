import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import { CtaBand } from '@/components/site/CtaBand'
import { PageBand } from '@/components/site/PageBand'
import { FieldExample } from '@/components/site/home/FieldExample'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { currentRoles, fa, milestones, today, yearsSince } from '@/lib/content/bio'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'درباره من',
  description: `${site.positioning} — ${site.description}`,
  alternates: { canonical: '/about' },
}

const KEYWORDS = ['مدیریت', 'سیستم‌سازی', 'مذاکره', 'بازاریابی', 'هوش مصنوعی']

/** A king, drawn flat: the page's single image of "a decision". Decorative. */
function Chess() {
  return (
    <svg viewBox="0 0 200 250" aria-hidden focusable="false" className="h-auto w-44 md:w-56">
      <ellipse cx="100" cy="232" rx="78" ry="10" className="fill-black/30" />
      <rect x="95.5" y="10" width="9" height="30" rx="3" className="fill-gold" />
      <rect x="86" y="19" width="28" height="9" rx="3" className="fill-gold" />
      <circle cx="100" cy="64" r="26" className="fill-gold" />
      <circle cx="91" cy="56" r="8" className="fill-white/30" />
      <rect x="68" y="88" width="64" height="11" rx="5.5" className="fill-gold-d1" />
      <path d="M78 99 Q72 168 52 204 L148 204 Q128 168 122 99 Z" className="fill-gold" />
      <path d="M122 99 Q128 168 148 204 L118 204 Q112 160 110 99 Z" className="fill-gold-d1" />
      <rect x="40" y="204" width="120" height="20" rx="10" className="fill-gold-d1" />
      <rect x="40" y="204" width="120" height="8" rx="4" className="fill-gold-d2" />
    </svg>
  )
}

/**
 * Every figure on this page is a duration the owner stated, computed from its
 * start year so it cannot go stale. No outcome claims — no revenue, no client
 * counts, no percentages — because none were supplied.
 *
 * Order, as briefed: masthead with portrait → three figures → the turning point
 * → the road → today's roles → learning → one real example → invitation.
 */
export default function AboutPage() {
  const figures: { icon: IconName; value: number; label: string }[] = [
    { icon: 'car', value: yearsSince(1380), label: 'در صنعت خودرو' },
    { icon: 'user', value: yearsSince(1389), label: 'مدیریت نمایندگی' },
    { icon: 'box', value: yearsSince(1391), label: 'فعالیت در قطعات یدکی خودرو' },
  ]

  const stops = [
    ...milestones.map((m) => ({ key: String(m.year), when: fa(m.year), title: m.title, body: m.body, now: false })),
    { key: 'today', when: today.title, title: '', body: today.body, now: true },
  ]

  return (
    <>
      <PageBand
        title={
          <>
            مشاوری که هم از <span className="text-gold-light">میدان</span> آمده، هم از{' '}
            <span className="text-gold-light">آینده</span>
          </>
        }
        lead={
          <>
            {fa(yearsSince(1380))} سال تجربه در صنعت خودرو،
            <br />
            {fa(yearsSince(1389))} سال مدیریت نمایندگی،
            <br />و امروز تمرکز بر سیستم‌سازی و هوش مصنوعی برای کسب‌وکارهای واقعی.
          </>
        }
        aside={
          <div className="relative mx-auto w-full max-w-xs self-end md:max-w-sm">
            <Image
              src="/photos/portrait-studio.jpg"
              alt="ابراهیم زرفشان"
              width={997}
              height={1330}
              sizes="(min-width: 768px) 24rem, 80vw"
              priority
              className="aspect-[4/4.6] w-full rounded-t-3xl object-cover object-top"
            />
          </div>
        }
      />

      <section className="py-10 md:py-14">
        <Container>
          <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {figures.map((f, i) => (
              <div
                key={f.label}
                data-reveal
                style={{ '--d': i } as CSSProperties}
                className="card-v3 flex items-center gap-5 px-6 py-6"
              >
                <span aria-hidden className="grid size-14 flex-none place-items-center rounded-xl bg-gold/20 text-700 text-forest">
                  <Icon name={f.icon} />
                </span>
                <div>
                  <dd className="text-800 font-black leading-none text-forest">
                    {fa(f.value)} <span className="text-400 font-bold">سال</span>
                  </dd>
                  <dt className="mt-2 text-300 text-text-muted">{f.label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="tone-inverse bg-forest-deep py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div className="mx-auto" data-reveal>
            <Chess />
          </div>
          <div data-reveal>
            <p className="inline-flex rounded-md bg-gold px-3 py-1 text-200 font-bold text-forest-deep">
              نقطه عطف
            </p>
            <h2 className="mt-5 max-w-2xl text-700 font-extrabold leading-[1.45] text-gold-light md:text-800">
              وقتی یک مشکل با آدم‌های مختلف تکرار می‌شود، دیگر فقط مشکل آدم‌ها نیست.
            </h2>
            <div className="mt-7 max-w-2xl space-y-5 text-400 leading-prose text-text-muted">
              <p>
                سال‌ها فکر می‌کردم بسیاری از مشکلات با نیروی بهتر حل می‌شوند. اما وقتی همان مسئله
                در بخش‌های مختلف و با افراد مختلف تکرار شد، فهمیدم:
              </p>
              <p className="text-500 font-extrabold text-text">مشکل از سیستم است.</p>
              <p>
                از همان‌جا مسیر من از مدیریت روزمره به سمت سیستم‌سازی و بعد استفاده کاربردی از
                هوش مصنوعی تغییر کرد.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <header className="mb-12 md:mb-16" data-reveal>
            <h2 className="text-700 font-extrabold md:text-800">مسیر حرفه‌ای من</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
          </header>

          <ol className="relative ms-2 grid gap-9 border-s-2 border-border-strong md:ms-0 md:grid-cols-5 md:gap-5 md:border-s-0">
            <span aria-hidden className="tl-line hidden md:block" />
            {stops.map((s, i) => (
              <li
                key={s.key}
                data-reveal
                style={{ '--d': i } as CSSProperties}
                className="relative ps-7 md:ps-0 md:pt-10"
              >
                <span
                  aria-hidden
                  className={`absolute -start-[0.6rem] top-1.5 size-4 rounded-full border-2 md:start-0 md:top-0 ${
                    s.now ? 'border-gold bg-gold' : 'border-forest bg-bg'
                  }`}
                />
                <p className="text-600 font-black text-forest">{s.when}</p>
                {s.title && <h3 className="mt-1 text-400 font-extrabold leading-snug">{s.title}</h3>}
                <p className="mt-2 text-300 leading-normal text-text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-bg-band py-16 md:py-24">
        <Container>
          <header className="mb-10 md:mb-14" data-reveal>
            <h2 className="text-700 font-extrabold md:text-800">نقش‌های فعلی من</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
          </header>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentRoles.map((r, i) => (
              <li
                key={r.title}
                data-reveal
                style={{ '--d': i % 3 } as CSSProperties}
                className="card-v3 flex items-center gap-4 p-6"
              >
                <span aria-hidden className="mt-2 size-2.5 flex-none rounded-full bg-gold" />
                <p className="text-400 font-bold leading-snug">{r.title}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
          <div data-reveal>
            <h2 className="text-700 font-extrabold md:text-800">یادگیری و توسعه</h2>
            <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-gold" />
            <p className="mt-7 max-w-[30rem] text-500 leading-prose text-text-muted">
              برای من یادگیری زمانی ارزش دارد که بتوان آن را در یک کسب‌وکار واقعی به کار گرفت.
            </p>
          </div>
          <ul className="flex flex-wrap gap-3" data-reveal>
            {KEYWORDS.map((k) => (
              <li
                key={k}
                className="rounded-xl border border-border-strong bg-bg-raised px-5 py-3 text-400 font-bold"
              >
                {k}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FieldExample />

      <CtaBand
        title="برای گفت‌وگو آماده‌ام"
        text="اگر کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم."
        primary={{ label: 'شروع گفت‌وگو', href: '/contact' }}
        secondary={{ label: 'پروژه‌ها را ببینید', href: '/projects' }}
      />
    </>
  )
}
