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
    text: 'وقت ندارم برای این کارها.',
    cause: 'فرایند نوشته‌نشده',
    why: 'کار هنوز روی کاغذ نیامده؛ هر بار از نو در ذهن شما ساخته می‌شود.',
    slug: 'system-building-for-the-overloaded-manager',
  },
  {
    text: 'هوش مصنوعی فقط برای شرکت‌های بزرگ است.',
    cause: 'ابزار بدون نظم',
    why: 'ابزاری که روی بی‌نظمی سوار شود، فقط بی‌نظمی را سریع‌تر می‌کند.',
    slug: 'ai-for-small-teams',
  },
  {
    text: 'بارها نیروی کلیدی را از دست داده‌ام.',
    cause: 'دانش فقط در ذهن یک نفر',
    why: 'وقتی کار فقط در ذهن یک نفر است، رفتنش یعنی شروع از صفر.',
    slug: 'hiring-and-onboarding-without-starting-over',
  },
  {
    text: 'اگر فردا مریض شوم، کسب‌وکارم می‌خوابد.',
    cause: 'وابستگی کامل به مدیر',
    why: 'همهٔ تصمیم‌ها از یک نفر رد می‌شود؛ نبودنش یعنی ایستادن همه‌چیز.',
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
            کدام‌یک دربارهٔ کسب‌وکار شما درست است؟
          </h2>
          <p
            className="mt-4 text-400 leading-prose text-text-muted"
            data-reveal
            style={{ '--d': 2 } as CSSProperties}
          >
            هر جمله‌ای که صدق می‌کند را بزنید. علت هرکدام — و جای شروع — همین‌جا کنارش می‌آید.
          </p>
        </div>

        <div className="mt-12" data-reveal style={{ '--d': 3 } as CSSProperties}>
          <DiagnosisCheck items={items} />
        </div>

        <p className="mt-12 text-600 font-black leading-snug text-gold-light md:text-700" data-reveal>
          مشکل از آدم‌ها نیست. مشکل از سیستم است.
        </p>
      </Container>
    </section>
  )
}
