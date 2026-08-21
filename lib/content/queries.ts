import { db } from '@/lib/db'

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

/** Same topic first, newest first, excluding the article being read. */
export async function getRelatedArticles(slug: string, topicSlugs: string[], limit = 3) {
  return db.article.findMany({
    where: {
      ...publicFilter(),
      slug: { not: slug },
      ...(topicSlugs.length ? { topics: { some: { slug: { in: topicSlugs } } } } : {}),
    },
    select: CARD_FIELDS,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
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
