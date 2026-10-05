import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { fa, yearsSince } from '@/lib/content/bio'

/**
 * Chaos → order.
 *
 * Four things the audience actually says, as cards that arrive thrown across
 * the table — tilted, overlapping — and snap into a straight column as the
 * block scrolls in (`.chaos` in globals.css). That movement *is* the argument:
 * the same pieces, put into a system.
 *
 * Then the brand's answer, in gold-light on forest (7.38:1).
 *
 * Quotes come from the brief's audience-pain list, verbatim. They are not
 * testimonials and are not attributed to anyone.
 */
const PAINS = [
  { text: 'وقت ندارم برای این کارها.', cx: '-14%', cy: '40px', cr: '-7deg' },
  { text: 'هوش مصنوعی فقط برای شرکت‌های بزرگ است.', cx: '10%', cy: '-10px', cr: '5deg' },
  { text: 'بارها نیروی کلیدی را از دست داده‌ام و از صفر شروع کرده‌ام.', cx: '-6%', cy: '-30px', cr: '-4deg' },
  { text: 'اگر فردا مریض شوید، کسب‌وکارتان چه می‌شود؟', cx: '16%', cy: '-60px', cr: '8deg' },
]

export function Diagnosis() {
  return (
    <section id="diagnosis" className="tone-inverse bp-grid relative overflow-hidden bg-forest py-24 md:py-40">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow" data-reveal>
              تشخیص
            </p>
            <h2 className="mt-4 text-700 md:text-800" data-reveal style={{ '--d': 1 } as CSSProperties}>
              چهار جمله که هر مدیری گفته
            </h2>

            <ul className="chaos mt-12 space-y-3" data-reveal="">
              {PAINS.map((p, i) => (
                <li
                  key={p.text}
                  className="chaos-card panel flex items-start gap-4 bg-bg-raised px-5 py-5 md:px-6"
                  style={{ '--i': i, '--cx': p.cx, '--cy': p.cy, '--cr': p.cr } as CSSProperties}
                >
                  <span aria-hidden className="text-800 leading-[0.8] font-black text-gold-light">
                    «
                  </span>
                  <span className="text-500 leading-snug text-text">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start lg:pt-24">
            <svg
              aria-hidden
              viewBox="0 0 320 90"
              className="draw mb-10 w-56 text-gold-light"
              data-reveal=""
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {/* a scribble that resolves into three straight, parallel lines */}
              <path
                style={{ '--len': 520 } as CSSProperties}
                d="M310 45c-30-40-50 30-80 0s-40-40-62 5c-18 38-40-30-60-8-14 16-20 22-38 20"
                strokeOpacity="0.45"
              />
              <path style={{ '--len': 120, '--d': 3 } as CSSProperties} d="M70 20H10" />
              <path style={{ '--len': 120, '--d': 4 } as CSSProperties} d="M70 45H10" />
              <path style={{ '--len': 120, '--d': 5 } as CSSProperties} d="M70 70H10" />
            </svg>

            <p className="text-700 font-black leading-snug text-gold-light md:text-900" data-reveal>
              مشکل از آدم‌ها نیست.
              <br />
              مشکل از سیستم است.
            </p>
            <div
              className="mt-8 max-w-(--container-measure) space-y-4 text-400 leading-prose text-text-muted"
              data-reveal
              style={{ '--d': 2 } as CSSProperties}
            >
              <p>
                این جمله‌ها را نقل نمی‌کنم. خودم گفته‌ام. {fa(yearsSince(1389))} سال مدیریت
                نمایندگی یعنی همهٔ این‌ها را از نزدیک دیده‌ام.
              </p>
              <p>
                آدم‌ها می‌آیند و می‌روند. اگر کار به حافظهٔ آن‌ها وابسته باشد، هر رفتن یعنی شروع
                دوباره. سیستم یعنی کار طوری نوشته شده باشد که نفر بعدی بتواند ادامه‌اش بدهد.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
