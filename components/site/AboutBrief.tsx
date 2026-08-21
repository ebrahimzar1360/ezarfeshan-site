import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { Stats } from '@/components/ui/Stats'
import { fa, yearsSince } from '@/lib/content/bio'

/**
 * Asymmetric two-column: portrait on 5, narrative on 7. The office frame is used
 * rather than the studio one — the positioning is "came from the field as well
 * as from the future", and a suit against a seamless backdrop only says the
 * second half.
 *
 * This block does the work the brief assigned to a separate trust section: the
 * credibility is the operating history, so it belongs next to the portrait
 * rather than in a row of logos further down.
 */
export function AboutBrief() {
  return (
    <section className="py-16 md:py-32">
      <Container>
        <div className="grid items-start gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <Image
              src="/photos/portrait-office.jpg"
              alt="ابراهیم زرفشان پشت میز کارش"
              width={1080}
              height={1350}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="rounded-lg border border-border"
            />
          </div>

          <div className="md:col-span-7">
            <SectionHead eyebrow="درباره" title="هم از میدان، هم از آینده" as="h2" />
            <div className="max-w-(--container-measure) space-y-5 text-400 leading-prose text-text-muted">
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
              <p>
                کاری که حالا می‌کنم، نوشتن همان چیزهایی است که در این سال‌ها جواب داده — و
                اضافه کردن ابزارهایی که تازه ممکن شده‌اند.
              </p>
            </div>

            <div className="mt-9">
              <Stats />
            </div>

            <p className="mt-9">
              <Link href="/about" className="text-300 font-medium">
                روایت کامل‌تر ←
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
