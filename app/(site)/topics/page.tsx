import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import type { CSSProperties } from 'react'
import { getTopics } from '@/lib/content/queries'
import { faNum } from '@/lib/format'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'موضوع‌ها',
  description: 'موضوع‌هایی که دربارهٔ آن‌ها می‌نویسم: سیستم‌سازی، فرایند، و هوش مصنوعی در کسب‌وکار.',
  alternates: { canonical: '/topics' },
}

/**
 * `/topics` was in the header and footer navigation but had no page — only
 * `/topics/[slug]`. Every visitor who clicked "موضوع‌ها" reached a 404.
 *
 * The count comes from `_count.articles`, which `getTopics` already filters
 * through `publicFilter()` — a topic with only drafts shows ۰, not a number
 * that promises reading which does not exist yet.
 */
export default async function TopicsPage() {
  const topics = await getTopics()
  const withArticles = topics.filter((t) => t._count.articles > 0)

  return (
    <>
      <PageHeader
        eyebrow="موضوع‌ها"
        title="از کجا شروع کنی"
        lead="نوشته‌ها بر اساس موضوع دسته‌بندی شده‌اند. هر موضوع یک مسئلهٔ مشخص در ادارهٔ کسب‌وکار است."
      />
      <Container className="py-14 md:py-20">
        {withArticles.length === 0 ? (
          <EmptyState
            title="هنوز موضوعی مقاله ندارد"
            body="اولین نوشته‌ها در حال آماده شدن‌اند. اگر می‌خواهی وقتی منتشر شدند خبردار شوی، عضو خبرنامه شو."
            action={{ label: 'عضویت در خبرنامه', href: '/newsletter' }}
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {withArticles.map((t, i) => (
              <li key={t.slug} data-reveal style={{ '--d': i % 3 } as CSSProperties} className="flex">
                <Link
                  href={`/topics/${t.slug}`}
                  className="group panel panel-hover relative flex w-full flex-col overflow-hidden p-7 no-underline"
                >
                  <span
                    aria-hidden
                    className="absolute -end-6 -top-8 text-[9rem] font-black leading-none text-border transition-colors duration-300 group-hover:text-accent/30"
                  >
                    {faNum(i + 1)}
                  </span>
                  <span className="relative inline-flex w-fit items-center gap-2 rounded-md border border-border px-2.5 py-1 text-200 text-text-subtle">
                    {faNum(t._count.articles)} مقاله
                  </span>
                  <span className="relative mt-10 text-600 font-bold text-text transition-colors duration-150 group-hover:text-link">
                    {t.name}
                  </span>
                  {t.description && (
                    <span className="relative mt-3 text-300 leading-normal text-text-muted">
                      {t.description}
                    </span>
                  )}
                  <span className="relative mt-auto pt-6 text-300 font-medium text-link">
                    دیدن نوشته‌ها{' '}
                    <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1.5">
                      ←
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}
