import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CmsPageView, cmsPageMetadata } from '@/components/cms/CmsPageView'
import { getPublishedPage } from '@/lib/cms/pages'

/**
 * Pages written in /admin/pages, at /<slug>. Every fixed route (about,
 * articles, …) is a static segment and wins over this one; savePage refuses
 * those slugs so a page is never written where it cannot be reached.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = /^[a-z0-9-]+$/.test(slug) ? await getPublishedPage(slug) : null
  // the not-found render inherits this; without it the root layout's
  // "index, follow" would sit beside the 404's noindex
  return page ? cmsPageMetadata(page) : { robots: { index: false, follow: true } }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9-]+$/.test(slug)) notFound()
  const page = await getPublishedPage(slug)
  if (!page) notFound()
  return <CmsPageView page={page} />
}
