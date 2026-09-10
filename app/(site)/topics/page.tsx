import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
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
    <Container className="py-16 md:py-24">
      <SectionHead
        as="h1"
        eyebrow="موضوع‌ها"
        title="از کجا شروع کنی"
        lead="نوشته‌ها بر اساس موضوع دسته‌بندی شده‌اند. هر موضوع یک مسئلهٔ مشخص در ادارهٔ کسب‌وکار است."
      />

      {withArticles.length === 0 ? (
        <EmptyState
          title="هنوز موضوعی مقاله ندارد"
          body="اولین نوشته‌ها در حال آماده شدن‌اند. اگر می‌خواهی وقتی منتشر شدند خبردار شوی، عضو خبرنامه شو."
          action={{ label: 'عضویت در خبرنامه', href: '/newsletter' }}
        />
      ) : (
        <ul className="space-y-0">
          {withArticles.map((t) => (
            <li key={t.slug} className="border-t border-border py-7">
              <Link href={`/topics/${t.slug}`} className="text-500 font-bold no-underline">
                {t.name}
              </Link>
              <p className="mt-2 text-200 text-text-subtle">
                {faNum(t._count.articles)} مقاله
              </p>
              {t.description && (
                <p className="mt-2.5 max-w-(--container-measure) text-300 leading-normal text-text-muted">
                  {t.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
