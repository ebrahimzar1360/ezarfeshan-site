import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { pageCount } from '@/lib/content/pagination'
import { getArticlesByTopicPage, getTopicBySlug, getTopics } from '@/lib/content/queries'

export const revalidate = 3600

/**
 * Articles published from the admin after the last build must render on demand,
 * not 404 until someone redeploys. Next defaults this to true, but leaving it
 * implicit is how a CMS silently stops publishing — the value is stated so the
 * behaviour is a decision rather than a default nobody checked.
 */
export const dynamicParams = true


export async function generateStaticParams() {
  const topics = await getTopics()
  return topics.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) return {}
  return {
    title: topic.name,
    description: topic.description ?? undefined,
    alternates: { canonical: `/topics/${topic.slug}` },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) notFound()

  const [{ items, total }, topics] = await Promise.all([
    getArticlesByTopicPage(slug, 1),
    getTopics(),
  ])
  const withArticles = topics
    .filter((t) => t._count.articles > 0)
    .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }))

  return (
    <Container className="py-16 md:py-24">
      <Breadcrumb
        trail={[
          { name: 'موضوع‌ها', path: '/topics' },
          { name: topic.name, path: `/topics/${topic.slug}` },
        ]}
      />

      <div className="mt-8">
        <SectionHead
          as="h1"
          eyebrow="موضوع"
          title={topic.name}
          lead={topic.description ?? undefined}
        />
      </div>

      <TopicChips topics={withArticles} activeSlug={topic.slug} />

      {items.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای در این موضوع منتشر نشده"
          body="موضوع‌های دیگر را ببین یا از فهرست کامل شروع کن."
          action={{ label: 'همهٔ مقالات', href: '/articles' }}
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
            hrefFor={(n) => (n === 1 ? `/topics/${topic.slug}` : `/topics/${topic.slug}/page/${n}`)}
          />
        </>
      )}
    </Container>
  )
}
