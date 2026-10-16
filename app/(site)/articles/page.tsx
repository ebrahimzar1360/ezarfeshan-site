import type { Metadata } from 'next'
import { PageBand } from '@/components/site/PageBand'
import { ReferencesNote } from '@/components/site/ReferencesNote'
import { ArticleGrid } from '@/components/ui/ArticleGrid'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TopicChips } from '@/components/ui/TopicChips'
import { pageCount } from '@/lib/content/pagination'
import { getPublishedArticlesPage, getTopics } from '@/lib/content/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'یادداشت‌ها و تجربه‌ها',
  description:
    'مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها',
  alternates: { canonical: '/articles' },
}

export default async function ArticlesPage() {
  const [{ items, total }, topics] = await Promise.all([getPublishedArticlesPage(1), getTopics()])
  const chips = topics.map((t) => ({ slug: t.slug, name: t.name }))

  return (
    <>
      <PageBand
        title="یادداشت‌ها و تجربه‌ها"
        lead="مرور ایده‌ها، تجربه‌های مدیریتی و استفاده کاربردی از هوش مصنوعی در کسب‌وکارها"
      />

      <Container className="py-12 md:py-16">
        <TopicChips topics={chips} />

        {items.length === 0 ? (
          <EmptyState
            title="هنوز یادداشتی منتشر نشده"
            body="اولین یادداشت‌ها به‌زودی اینجا می‌آیند."
            action={{ label: 'درباره من', href: '/about' }}
          />
        ) : (
          <>
            <ArticleGrid items={items} priorityFirst />
            <Pagination
              page={1}
              count={pageCount(total)}
              hrefFor={(n) => (n === 1 ? '/articles' : `/articles/page/${n}`)}
            />
          </>
        )}

        <ReferencesNote className="mt-14 md:mt-20" />
      </Container>
    </>
  )
}
