import { db } from '@/lib/db'
import { PER_PAGE, pageOffset } from './pagination'

/**
 * Read paths for published content.
 *
 * Every query filters on `status: 'PUBLISHED'` and a publishedAt in the past.
 * Scheduled posts therefore appear on their own without a cron job, and a draft
 * can never leak onto a public page because the filter lives here rather than
 * being repeated at each call site.
 */

/**
 * Must be a function.
 *
 * As a module-level constant, `new Date()` is evaluated once when the module is
 * first imported — so the filter silently means "published before this server
 * process started". Anything published or scheduled afterwards stays invisible
 * until a restart. That shipped once and was caught by the end-to-end test that
 * publishes an article and then reads it.
 */
function publicFilter() {
  return {
    status: 'PUBLISHED',
    publishedAt: { lte: new Date() },
  } as const
}

const CARD_FIELDS = {
  slug: true,
  title: true,
  excerpt: true,
  readingMinutes: true,
  publishedAt: true,
  featured: true,
  coverImage: true,
  topics: { select: { slug: true, name: true } },
} as const

export type ArticleCardData = {
  slug: string
  title: string
  excerpt: string
  readingMinutes: number
  publishedAt: Date | null
  featured: boolean
  coverImage: string | null
  topics: { slug: string; name: string }[]
}

export async function getPublishedArticles(limit?: number): Promise<ArticleCardData[]> {
  return db.article.findMany({
    where: publicFilter(),
    select: CARD_FIELDS,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  })
}

export type ArticlePage = { items: ArticleCardData[]; total: number }

/**
 * Paginated variants.
 *
 * They sit *beside* getPublishedArticles and getArticlesByTopic rather than
 * replacing them, because those two have callers that must keep seeing
 * everything: generateStaticParams in articles/[slug], app/sitemap.ts,
 * app/rss.xml/route.ts, and the homepage's getPublishedArticles(4). Changing the
 * signature would have quietly shortened the sitemap and the feed.
 *
 * One $transaction rather than two awaits so the count and the rows describe the
 * same snapshot — otherwise an article published between them shifts the page
 * count under a list that was already read.
 */
export async function getPublishedArticlesPage(
  page: number,
  perPage = PER_PAGE
): Promise<ArticlePage> {
  const where = publicFilter()
  const [items, total] = await db.$transaction([
    db.article.findMany({
      where,
      select: CARD_FIELDS,
      orderBy: { publishedAt: 'desc' },
      skip: pageOffset(page, perPage),
      take: perPage,
    }),
    db.article.count({ where }),
  ])
  return { items, total }
}

export async function getArticlesByTopicPage(
  slug: string,
  page: number,
  perPage = PER_PAGE
): Promise<ArticlePage> {
  const where = { ...publicFilter(), topics: { some: { slug } } }
  const [items, total] = await db.$transaction([
    db.article.findMany({
      where,
      select: CARD_FIELDS,
      orderBy: { publishedAt: 'desc' },
      skip: pageOffset(page, perPage),
      take: perPage,
    }),
    db.article.count({ where }),
  ])
  return { items, total }
}

export async function getFeaturedArticle(): Promise<ArticleCardData | null> {
  return (
    (await db.article.findFirst({
      where: { ...publicFilter(), featured: true },
      select: CARD_FIELDS,
      orderBy: { publishedAt: 'desc' },
    })) ??
    (await db.article.findFirst({
      where: publicFilter(),
      select: CARD_FIELDS,
      orderBy: { publishedAt: 'desc' },
    }))
  )
}

export async function getArticleBySlug(slug: string) {
  return db.article.findFirst({
    where: { slug, ...publicFilter() },
    include: { topics: { select: { slug: true, name: true } } },
  })
}

/**
 * Same topic first, then backfilled with the newest, always `limit` of them.
 *
 * The previous version filtered on topic and stopped there, so an article in a
 * thinly populated topic ended its page with a "خواندن بعدی" heading above one
 * link, or none. The section is the last thing a reader sees; it should always
 * offer somewhere to go.
 */
export async function getRelatedArticles(slug: string, topicSlugs: string[], limit = 3) {
  const sameTopic = topicSlugs.length
    ? await db.article.findMany({
        where: {
          ...publicFilter(),
          slug: { not: slug },
          topics: { some: { slug: { in: topicSlugs } } },
        },
        select: CARD_FIELDS,
        orderBy: { publishedAt: 'desc' },
        take: limit,
      })
    : []

  if (sameTopic.length >= limit) return sameTopic

  const seen = new Set([slug, ...sameTopic.map((a) => a.slug)])
  const filler = await db.article.findMany({
    where: { ...publicFilter(), slug: { notIn: [...seen] } },
    select: CARD_FIELDS,
    orderBy: { publishedAt: 'desc' },
    take: limit - sameTopic.length,
  })

  return [...sameTopic, ...filler]
}

export async function getTopics() {
  return db.topic.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: { where: publicFilter() } } } },
  })
}

export async function getTopicBySlug(slug: string) {
  return db.topic.findUnique({ where: { slug } })
}

export async function getArticlesByTopic(slug: string): Promise<ArticleCardData[]> {
  return db.article.findMany({
    where: { ...publicFilter(), topics: { some: { slug } } },
    select: CARD_FIELDS,
    orderBy: { publishedAt: 'desc' },
  })
}
