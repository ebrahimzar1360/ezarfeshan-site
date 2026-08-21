import { db } from '@/lib/db'

/**
 * Admin read paths.
 *
 * Unlike lib/content/queries.ts these do NOT filter on published status — the
 * admin needs to see drafts and scheduled posts. Keeping the two sets in
 * separate modules is what stops a public page from accidentally importing a
 * query that leaks unpublished work.
 */

export async function getDashboardStats() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)

  const [articles, drafts, subscribers, pending, leads, newLeads, views] = await Promise.all([
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.article.count({ where: { status: { in: ['DRAFT', 'SCHEDULED'] } } }),
    db.subscriber.count({ where: { status: 'CONFIRMED' } }),
    db.subscriber.count({ where: { status: 'PENDING' } }),
    db.lead.count(),
    db.lead.count({ where: { status: 'NEW' } }),
    db.pageView.count({ where: { createdAt: { gte: since } } }),
  ])

  return { articles, drafts, subscribers, pending, leads, newLeads, views }
}

export async function getAdminArticles() {
  return db.article.findMany({
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      featured: true,
      readingMinutes: true,
      views: true,
      topics: { select: { slug: true, name: true } },
    },
  })
}

export async function getAdminArticle(id: string) {
  return db.article.findUnique({
    where: { id },
    include: { topics: { select: { id: true, slug: true, name: true } } },
  })
}

export async function getAllTopics() {
  return db.topic.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  })
}

export async function getSubscribers() {
  return db.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      source: true,
      confirmedAt: true,
      createdAt: true,
    },
  })
}

export async function getLeads() {
  return db.lead.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getLead(id: string) {
  return db.lead.findUnique({ where: { id } })
}
