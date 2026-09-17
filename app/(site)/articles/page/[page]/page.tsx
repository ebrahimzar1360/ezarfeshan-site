import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Container } from '@/components/ui/Container'
import { Pagination } from '@/components/ui/Pagination'
import { SectionHead } from '@/components/ui/SectionHead'
import { TopicChips } from '@/components/ui/TopicChips'
import { faNum } from '@/lib/format'
import { pageCount, parsePageParam } from '@/lib/content/pagination'
import { getPublishedArticlesPage, getPublishedArticles, getTopics } from '@/lib/content/queries'

export const revalidate = 3600
export const dynamicParams = true

/**
 * Pages 2+ of the article list.
 *
 * Path segments rather than `?page=`: a query string would make /articles
 * dynamic and cost its `revalidate = 3600`, while a segment keeps every page
 * statically generated and crawlable. Page 1 stays at /articles as the canonical
 * URL and /articles/page/1 redirects there, so the same list never answers at
 * two addresses.
 *
 * These pages are indexed, not noindex'd — they are the only route to anything
 * older than the first twelve articles.
 */
export async function generateStaticParams() {
  const total = (await getPublishedArticles()).length
  const count = pageCount(total)
  // page 1 is /articles; this route starts at 2
  return Array.from({ length: Math.max(0, count - 1) }, (_, i) => ({ page: String(i + 2) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const n = parsePageParam(page)
  if (!n) return {}
  return {
    title: `مقالات — صفحهٔ ${faNum(n)}`,
    alternates: { canonical: `/articles/page/${n}` },
  }
}

export default async function ArticlesPaginated({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params
  const n = parsePageParam(page)
  if (!n) notFound()
  // page 1 is canonicalised to /articles by middleware.ts, before this renders —
  // a redirect() thrown from inside a page does not survive here (OPEN-QUESTIONS §16)

  const [{ items, total }, topics] = await Promise.all([
    getPublishedArticlesPage(n),
    getTopics(),
  ])

  // A page past the end is not an empty list, it is a wrong address.
  if (items.length === 0) notFound()

  const withArticles = topics
    .filter((t) => t._count.articles > 0)
    .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }))

  return (
    <Container className="py-16 md:py-24">
      <SectionHead
        as="h1"
        eyebrow="مقالات"
        title={`نوشته‌ها — صفحهٔ ${faNum(n)}`}
      />

      <TopicChips topics={withArticles} />

      <div>
        {items.map((a) => (
          <ArticleListItem key={a.slug} article={a} />
        ))}
      </div>

      <Pagination
        page={n}
        count={pageCount(total)}
        hrefFor={(p) => (p === 1 ? '/articles' : `/articles/page/${p}`)}
      />
    </Container>
  )
}
