import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Container } from '@/components/ui/Container'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { faNum } from '@/lib/format'
import { pageCount, parsePageParam } from '@/lib/content/pagination'
import { getArticlesByTopicPage, getTopicBySlug, getTopics } from '@/lib/content/queries'

export const revalidate = 3600
export const dynamicParams = true

/**
 * Pages 2+ within one topic. Same shape as /articles/page/[page]; see that file
 * for why this is a path segment rather than a query string.
 *
 * No generateStaticParams here: it would need a count per topic, and with the
 * current content every topic fits on one page, so the list would be empty
 * anyway. dynamicParams covers the case where one topic later outgrows PER_PAGE.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; page: string }>
}): Promise<Metadata> {
  const { slug, page } = await params
  const n = parsePageParam(page)
  const topic = await getTopicBySlug(slug)
  if (!n || !topic) return {}
  return {
    title: `${topic.name} — صفحهٔ ${faNum(n)}`,
    alternates: { canonical: `/topics/${slug}/page/${n}` },
  }
}

export default async function TopicPaginated({
  params,
}: {
  params: Promise<{ slug: string; page: string }>
}) {
  const { slug, page } = await params
  const n = parsePageParam(page)
  if (!n) notFound()
  // page 1 is canonicalised to /topics/<slug> by middleware.ts before this renders

  const topic = await getTopicBySlug(slug)
  if (!topic) notFound()

  const [{ items, total }, topics] = await Promise.all([
    getArticlesByTopicPage(slug, n),
    getTopics(),
  ])
  if (items.length === 0) notFound()

  const withArticles = topics
    .filter((t) => t._count.articles > 0)
    .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }))

  return (
    <Container className="py-16 md:py-24">
      <Breadcrumb
        trail={[
          { name: 'موضوع‌ها', path: '/topics' },
          { name: topic.name, path: `/topics/${topic.slug}` },
          { name: `صفحهٔ ${faNum(n)}`, path: `/topics/${topic.slug}/page/${n}` },
        ]}
      />

      <div className="mt-8">
        <SectionHead as="h1" eyebrow="موضوع" title={`${topic.name} — صفحهٔ ${faNum(n)}`} />
      </div>

      <TopicChips topics={withArticles} activeSlug={topic.slug} />

      <div>
        {items.map((a) => (
          <ArticleListItem key={a.slug} article={a} />
        ))}
      </div>

      <Pagination
        page={n}
        count={pageCount(total)}
        hrefFor={(p) => (p === 1 ? `/topics/${slug}` : `/topics/${slug}/page/${p}`)}
      />
    </Container>
  )
}
