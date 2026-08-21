import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleListItem } from '@/components/ui/ArticleCard'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
import { getArticlesByTopic, getTopicBySlug, getTopics } from '@/lib/content/queries'

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

  const articles = await getArticlesByTopic(slug)

  return (
    <Container className="py-16 md:py-24">
      <SectionHead as="h1" eyebrow="موضوع" title={topic.name} lead={topic.description ?? undefined} />

      {articles.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای در این موضوع منتشر نشده"
          body="موضوع‌های دیگر را ببین یا از فهرست کامل شروع کن."
          action={{ label: 'همهٔ مقالات', href: '/articles' }}
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
