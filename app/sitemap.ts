import type { MetadataRoute } from 'next'
import { pageCount } from '@/lib/content/pagination'
import { getPublishedArticles, getTopics } from '@/lib/content/queries'
import { site } from '@/lib/site'

export const revalidate = 3600

/**
 * Only pages worth indexing appear here.
 *
 * Left out on purpose: /admin (private), the newsletter confirm and unsubscribe
 * landing pages (token-specific and useless to a searcher), and /resources while
 * it has nothing to list — a sitemap entry for an empty page invites a crawler
 * to index a dead end.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, topics] = await Promise.all([getPublishedArticles(), getTopics()])
  const base = site.url

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/articles`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/newsletter`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/consult`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  /**
   * Pages 2+ of the article list. Without these the only route to anything older
   * than the first PER_PAGE articles is a click, so a crawler that never presses
   * "قدیمی‌تر" would treat the back catalogue as unreachable.
   *
   * Page 1 is /articles, already listed above, so this starts at 2 and is empty
   * whenever everything fits on one page — which it does today, at six articles.
   */
  const articlePages: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, pageCount(articles.length) - 1) },
    (_, i) => ({
      url: `${base}/articles/page/${i + 2}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })
  )

  // /topics itself is only worth indexing once a topic has something to show
  const topicsIndex: MetadataRoute.Sitemap = topics.some((t) => t._count.articles > 0)
    ? [{ url: `${base}/topics`, changeFrequency: 'weekly', priority: 0.6 }]
    : []

  return [
    ...staticPages,
    ...articlePages,
    ...topicsIndex,
    ...articles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.publishedAt ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // a topic with no published articles is an empty page; do not advertise it
    ...topics
      .filter((t) => t._count.articles > 0)
      .map((t) => ({
        url: `${base}/topics/${t.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
  ]
}
