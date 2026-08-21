import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { Stats } from '@/components/ui/Stats'
import {
  credentials,
  currentRoles,
  fa,
  fieldExample,
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
 * The positioning line ("came from the field as well as from the future") is
 * load-bearing here: the field half is 25 years of running a dealership and a
 * parts distribution business, and the page leads with that rather than with
 * the consulting.
 */
export default function AboutPage() {
  return (
    <>
      <Container className="py-16 md:py-28">
        <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <div className="gold-marker">
              <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">درباره</p>
              <h1 className="text-800 md:text-900">{site.positioning}</h1>
            </div>
            <div className="mt-8 max-w-(--container-measure) space-y-5 text-400 leading-prose text-text-muted">
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
            <div className="mt-10">
              <Stats />
            </div>
          </div>

          <div className="md:col-span-5">
            <Image
              src="/photos/portrait-about.jpg"
              alt="پرترهٔ ابراهیم زرفشان"
              width={1030}
              height={1373}
              sizes="(min-width: 768px) 40vw, 100vw"
              priority
              className="rounded-lg border border-border"
            />
          </div>
        </div>
      </Container>

      <section className="tone-inverse bg-forest py-20 md:py-32">
        <Container>
          <div className="max-w-(--container-measure)">
            <h2 className="text-600 md:text-700">چه چیزی مرا به اینجا رساند</h2>
            <div className="mt-7 space-y-5 text-400 leading-prose text-text-muted">
              <p>
                سال‌ها فکر می‌کردم مشکل از آدم‌هاست. نیروی خوب پیدا نمی‌شود، آموزش نمی‌گیرد،
                می‌رود. هر بار از صفر شروع می‌کردم و هر بار به همان‌جا می‌رسیدم.
              </p>
              <p>
                نقطهٔ تغییر وقتی بود که دیدم الگو تکرار می‌شود — با آدم‌های مختلف، در بخش‌های
                مختلف، حتی در کسب‌وکار جدیدی که از صفر ساختم. وقتی یک مشکل با هر آدمی تکرار
                شود، دیگر مشکل آدم نیست.
              </p>
              <p className="font-medium text-accent">مشکل از سیستم است.</p>
              <p>
                از آن به بعد کارم عوض شد: به‌جای اینکه هر بار خودم مسئله را حل کنم، شروع کردم
                به نوشتن اینکه چطور حل می‌شود. این تفاوت بین کار کردن در کسب‌وکار و کار کردن
                روی کسب‌وکار است.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* The one section a CV cannot carry: something actually built. */}
      <section className="py-16 md:py-32">
        <Container>
          <SectionHead eyebrow={fieldExample.eyebrow} title={fieldExample.title} />
          <div className="grid gap-x-14 gap-y-8 md:grid-cols-3">
            {(
              [
                ['مسئله', fieldExample.problem],
                ['کاری که کردیم', fieldExample.action],
                ['چه چیزی عوض شد', fieldExample.result],
              ] as const
            ).map(([label, body], i) => (
              <div key={label}>
                <p className="latin text-200 font-medium text-accent">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 text-500 font-bold">{label}</h3>
                <p className="mt-3 text-300 leading-prose text-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-32">
        <Container>
          <SectionHead eyebrow="مسیر" title="از کجا آمده‌ام" />
          <ol className="max-w-(--container-measure)">
            {milestones.map((m) => (
              <li key={m.year} className="border-t border-border py-7">
                <div className="flex items-baseline gap-4">
                  <span className="shrink-0 text-500 font-bold text-accent">{fa(m.year)}</span>
                  <h3 className="text-500 font-bold">{m.title}</h3>
                </div>
                <p className="mt-3 text-300 leading-prose text-text-muted">{m.body}</p>
                {m.ongoing && (
                  <p className="mt-2 text-200 text-text-subtle">
                    تا امروز — {fa(yearsSince(m.year))} سال
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <SectionHead eyebrow="امروز" title="نقش‌های فعلی" as="h2" />
              <ul className="space-y-4">
                {currentRoles.map((r) => (
                  <li key={r.title} className="border-t border-border pt-4">
                    <p className="text-400 font-medium">{r.title}</p>
                    <p className="mt-1 text-200 text-text-subtle">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHead eyebrow="آموزش" title="مدارک و دوره‌ها" as="h2" />
              <ul className="space-y-4">
                {credentials.map((c) => (
                  <li key={c.title} className="border-t border-border pt-4">
                    <p className="text-400 font-medium">
                      <span className="latin">{c.title}</span>
                    </p>
                    {c.note && <p className="mt-1 text-200 text-text-subtle">{c.note}</p>}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-300 leading-prose text-text-muted">
                هوش مصنوعی برای من موضوع تازه‌ای است که دارم یاد می‌گیرم، نه چیزی که سال‌ها
                در آن کار کرده باشم. آنچه اضافه می‌کنم این است که می‌دانم کجای یک کسب‌وکار
                واقعی به آن نیاز دارد.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="tone-inverse bg-forest py-20 md:py-32">
        <Container>
          <div className="max-w-(--container-measure)">
            <h2 className="text-600 md:text-700">تماس</h2>
            <p className="mt-5 text-400 leading-prose text-text-muted">
              اگر مسئله‌ات از جنس همین حرف‌هاست، بنویس.
            </p>
            <ul className="mt-7 space-y-3">
              <li>
                <a href={`mailto:${site.email}`} className="latin text-300">
                  {site.email}
                </a>
              </li>
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-300">
                    {s.label}
                    {s.handle && <span className="latin text-text-subtle"> · {s.handle}</span>}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-10 border-t border-border pt-6 text-300 text-text-muted">
              یا{' '}
              <Link href="/articles" className="font-medium">
                از مقالات شروع کن
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
