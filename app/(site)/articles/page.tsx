import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
import { getPublishedArticles, getTopics } from '@/lib/content/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'مقالات',
  description: 'نوشته‌هایی دربارهٔ سیستم‌سازی، مدیریت تیم، و استفادهٔ عملی از هوش مصنوعی.',
}

export default async function ArticlesPage() {
  const [articles, topics] = await Promise.all([getPublishedArticles(), getTopics()])
  const withArticles = topics.filter((t) => t._count.articles > 0)

  return (
    <Container className="py-16 md:py-24">
      <SectionHead
        as="h1"
        eyebrow="مقالات"
        title="نوشته‌ها"
        lead="هر نوشته یک مسئلهٔ عملیاتی را می‌گیرد و تا انتها می‌برد."
      />

      {withArticles.length > 0 && (
        <nav aria-label="فیلتر موضوع" className="mb-10 flex flex-wrap gap-x-5 gap-y-2">
          <span className="text-200 text-text-subtle">موضوع‌ها:</span>
          {withArticles.map((t) => (
            <Link key={t.slug} href={`/topics/${t.slug}`} className="text-300 no-underline hover:underline">
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {articles.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای منتشر نشده"
          body="اولین نوشته‌ها به‌زودی اینجا می‌آیند."
          action={{ label: 'دربارهٔ من', href: '/about' }}
        />
      ) : (
        <div>
          {articles.map((a) => (
            <ArticleListItem key={a.slug} article={a} />
          ))}
        </div>
      )}
    </Container>
  )
}
