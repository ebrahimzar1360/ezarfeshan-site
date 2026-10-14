import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { getPublishedArticlesBySlugs } from '@/lib/content/queries'
import { DiagnosisCheck, type DiagnosisItem } from './DiagnosisCheck'

/**
 * Diagnosis, as a self-check.
 *
 * Four things the audience actually says (the brief's audience-pain list,
 * phrased in the manager's own voice). The visitor ticks the ones that are
 * true; each names its cause and points at the article that deals with it.
 * Not testimonials, not attributed to anyone.
 *
 * The article for each cause is looked up by slug among *published* articles,
 * so a draft or a missing piece is never linked — the cause and its one-line
 * explanation stand on their own until the article exists.
 */
const CHECKS = [
  {
    text: 'وقت و انرژی کافی برای این کارها ندارم.',
    cause: 'فرایندهای مکتوب‌نشده',
    why: 'کارها روی کاغذ نیامده‌اند؛ در نتیجه هر بار همه‌چیز از صفر در ذهن شما ساخته می‌شود.',
    slug: 'system-building-for-the-overloaded-manager',
  },
  {
    text: 'تصور می‌کنم هوش مصنوعی فقط به درد شرکت‌های بزرگ می‌خورد.',
    cause: 'استفادهٔ بی‌نظم از ابزارها',
    why: 'پیاده‌سازی ابزار جدید روی بستر بی‌نظم، فقط سرعت تولید بی‌نظمی را بیشتر می‌کند!',
    slug: 'ai-for-small-teams',
  },
  {
    text: 'بارها با رفتن نیروهای کلیدی ضربه خورده‌ام.',
    cause: 'انحصار دانش نزد افراد',
    why: 'وقتی متد کاری فقط در ذهن یک نفر باشد، رفتن او یعنی بازگشت به نقطهٔ صفر.',
    slug: 'hiring-and-onboarding-without-starting-over',
  },
  {
    text: 'اگر چند روز نباشم یا مریض شوم، همه‌چیز متوقف می‌شود.',
    cause: 'تمرکز تمام تصمیمات روی مدیر',
    why: 'وقتی همهٔ جزئیات از گوشی و ذهن شما بگذرد، غیبت شما یعنی ایست کامل مجموعه.',
    slug: 'founder-dependency',
  },
]

export async function Diagnosis() {
  const articles = await getPublishedArticlesBySlugs(CHECKS.map((c) => c.slug))
  const items: DiagnosisItem[] = CHECKS.map(({ slug, ...c }) => ({
    ...c,
    article: articles.find((a) => a.slug === slug) ?? null,
  }))

  return (
    <section id="diagnosis" className="tone-inverse bp-grid relative overflow-hidden bg-forest py-24 md:py-36">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow" data-reveal>
            تشخیص
          </p>
          <h2 className="mt-4 text-700 md:text-800" data-reveal style={{ '--d': 1 } as CSSProperties}>
            وضعیت کسب‌وکار خود را بسنجید
          </h2>
          <p
            className="mt-4 text-500 font-bold text-text"
            data-reveal
            style={{ '--d': 2 } as CSSProperties}
          >
            کدام‌یک از جملات زیر دربارهٔ مجموعهٔ شما صدق می‌کند؟
          </p>
          <p
            className="mt-2 text-400 leading-prose text-text-muted"
            data-reveal
            style={{ '--d': 2 } as CSSProperties}
          >
            گزینه(های) مدنظرتان را علامت بزنید تا ریشهٔ مشکل و نقطهٔ شروع تغییر دقیقاً مشخص شود.
          </p>
        </div>

        <div className="mt-12" data-reveal style={{ '--d': 3 } as CSSProperties}>
          <DiagnosisCheck items={items} />
        </div>

        <p className="mt-12 flex items-start gap-3 text-500 font-black leading-snug text-gold-light md:text-600" data-reveal>
          {/* a small bulb, not the 💡 emoji: emoji render differently on every platform */}
          <svg aria-hidden viewBox="0 0 24 24" className="mt-1 size-6 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 21h4" />
            <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z" />
          </svg>
          مشکل از نیروها یا توان شما نیست؛ مشکل از نبودِ یک سیستم درست است.
        </p>
      </Container>
    </section>
  )
}
