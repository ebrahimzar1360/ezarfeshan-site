import type { Metadata } from 'next'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { pageCount } from '@/lib/content/pagination'
import { getPublishedArticlesPage, getTopics } from '@/lib/content/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'مقالات',
  description: 'نوشته‌هایی دربارهٔ سیستم‌سازی، مدیریت تیم، و استفادهٔ عملی از هوش مصنوعی.',
}

export default async function ArticlesPage() {
  const [{ items, total }, topics] = await Promise.all([
    getPublishedArticlesPage(1),
    getTopics(),
  ])
  const withArticles = topics
    .filter((t) => t._count.articles > 0)
    .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }))

  return (
    <Container className="py-16 md:py-24">
      <SectionHead
        as="h1"
        eyebrow="مقالات"
        title="نوشته‌ها"
        lead="هر نوشته یک مسئلهٔ عملیاتی را می‌گیرد و تا انتها می‌برد."
      />

      <TopicChips topics={withArticles} />

      {items.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای منتشر نشده"
          body="اولین نوشته‌ها به‌زودی اینجا می‌آیند."
          action={{ label: 'دربارهٔ من', href: '/about' }}
        />
      ) : (
        <>
          <div>
            {items.map((a) => (
              <ArticleListItem key={a.slug} article={a} />
            ))}
          </div>
          <Pagination
            page={1}
            count={pageCount(total)}
            hrefFor={(n) => (n === 1 ? '/articles' : `/articles/page/${n}`)}
          />
        </>
      )}
    </Container>
  )
}
