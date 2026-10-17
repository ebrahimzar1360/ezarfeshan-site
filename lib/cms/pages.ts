import { cache } from 'react'
import { db } from '@/lib/db'

/**
 * Public read path for CMS pages. Same rule as lib/content/queries.ts: only
 * PUBLISHED rows whose date has come, filtered here rather than at call sites.
 */

/** Built-in pages a CMS page with the same slug replaces. */
export const OVERRIDABLE_PAGES = ['privacy', 'terms'] as const

export const getPublishedPage = cache(async (slug: string) => {
  try {
    return await db.page.findFirst({ where: { slug, status: 'PUBLISHED', publishedAt: { lte: new Date() } } })
  } catch (cause) {
    console.error('[cms:page]', cause)
    return null
  }
})

export async function getPublishedPages() {
  return db.page.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, noindex: false },
    select: { slug: true, updatedAt: true },
  })
}
