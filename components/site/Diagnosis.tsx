import { Container } from '@/components/ui/Container'
import { fa, yearsSince } from '@/lib/content/bio'

/**
 * The strongest block on the page, and the first dark one.
 *
 * Four things the audience actually says, then the pattern breaks: the brand's
 * answer arrives unquoted, at a larger size, in gold. Gold clears AA on forest
 * (5.24:1) — this is the one place it is allowed to be a text colour.
 *
 * Quotes come from the brief's audience-pain list, verbatim. They are not
 * testimonials and are not attributed to anyone.
 */
const PAINS = [
  'وقت ندارم برای این کارها.',
  'هوش مصنوعی فقط برای شرکت‌های بزرگ است.',
  'بارها نیروی کلیدی را از دست داده‌ام و از صفر شروع کرده‌ام.',
  'اگر فردا مریض شوید، کسب‌وکارتان چه می‌شود؟',
]

export function Diagnosis() {
  return (
    <section className="tone-inverse bg-forest py-20 md:py-40">
      <Container>
        <p className="mb-10 text-200 font-medium tracking-wide text-text-subtle">تشخیص</p>

        <ul className="max-w-(--container-measure) space-y-0">
          {PAINS.map((pain) => (
            <li
              key={pain}
              className="border-b border-border py-5 text-500 leading-snug text-text-muted first:border-t"
            >
              «{pain}»
            </li>
          ))}
        </ul>

        <p className="mt-14 max-w-3xl text-600 font-bold leading-snug text-accent md:text-700">
          مشکل از آدم‌ها نیست. مشکل از سیستم است.
        </p>
        <div className="mt-6 max-w-(--container-measure) space-y-4 text-400 leading-prose text-text-muted">
          <p>
            این جمله‌ها را نقل نمی‌کنم. خودم گفته‌ام. {fa(yearsSince(1389))} سال مدیریت
            نمایندگی یعنی همهٔ این‌ها را از نزدیک دیده‌ام.
          </p>
          <p>
            آدم‌ها می‌آیند و می‌روند. اگر کار به حافظهٔ آن‌ها وابسته باشد، هر رفتن یعنی شروع
            دوباره. سیستم یعنی کار طوری نوشته شده باشد که نفر بعدی بتواند ادامه‌اش بدهد.
          </p>
        </div>
      </Container>
    </section>
  )
}
