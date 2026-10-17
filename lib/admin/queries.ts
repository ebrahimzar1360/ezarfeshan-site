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

  const [articles, drafts, subscribers, pending, leads, newLeads, views, media, pages] = await Promise.all([
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.article.count({ where: { status: { in: ['DRAFT', 'SCHEDULED'] } } }),
    db.subscriber.count({ where: { status: 'CONFIRMED' } }),
    db.subscriber.count({ where: { status: 'PENDING' } }),
    db.lead.count(),
    db.lead.count({ where: { status: 'NEW' } }),
    db.pageView.count({ where: { createdAt: { gte: since } } }),
    db.media.count(),
    db.page.count(),
  ])

  return { articles, drafts, subscribers, pending, leads, newLeads, views, media, pages }
}

export async function getAdminArticles(filter: { authorId?: string; status?: string; q?: string } = {}) {
  const status = filter.status === 'DRAFT' || filter.status === 'SCHEDULED' || filter.status === 'PUBLISHED' ? filter.status : undefined
  const q = filter.q?.trim()
  return db.article.findMany({
    where: {
      ...(filter.authorId ? { authorId: filter.authorId } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { slug: { contains: q, mode: 'insensitive' as const } }] }
        : {}),
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      author: { select: { name: true } },
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
    include: {
      topics: { select: { id: true, slug: true, name: true } },
      author: { select: { name: true } },
    },
  })
}

export async function getArticleRevisions(articleId: string) {
  return db.articleRevision.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { author: { select: { name: true } } },
  })
}

export async function getRevision(id: string) {
  return db.articleRevision.findUnique({ where: { id }, include: { article: { select: { id: true, title: true, body: true, excerpt: true, authorId: true } } } })
}

export async function getAdminPages() {
  return db.page.findMany({ orderBy: { updatedAt: 'desc' } })
}

export async function getAdminPage(id: string) {
  return db.page.findUnique({ where: { id } })
}

export async function getUsers() {
  return db.user.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, email: true, name: true, role: true, active: true, lastLoginAt: true, createdAt: true, _count: { select: { articles: true } } },
  })
}

export async function getAuditLog(take = 200) {
  return db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function getContentRows() {
  return db.setting.findMany({ where: { key: { startsWith: 'content:' } }, select: { key: true, updatedAt: true } })
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
