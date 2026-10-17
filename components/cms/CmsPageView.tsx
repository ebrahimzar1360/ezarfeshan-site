import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PageBand } from '@/components/site/PageBand'
import { Container } from '@/components/ui/Container'
import { createMdxComponents } from '@/components/ui/mdx'
import { absoluteUrl, ogFallback } from '@/lib/cms/metadata'
import { prepareMdx } from '@/lib/content/mdx'
import { formatDate } from '@/lib/format'

type Page = {
  slug: string
  title: string
  lead: string | null
  body: string
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
  noindex: boolean
  updatedAt: Date
}

export function cmsPageMetadata(page: Page): Metadata {
  const title = page.seoTitle || page.title
  const description = page.seoDescription || page.lead || undefined
  const image = page.ogImage ? absoluteUrl(page.ogImage) : ogFallback(page.title)
  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: 'website', title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

/**
 * A page written in the admin: the forest masthead, then the MDX body through
 * the same allowlisted components articles use — no raw HTML path.
 */
export function CmsPageView({ page }: { page: Page }) {
  return (
    <>
      <PageBand title={page.title} lead={page.lead ?? undefined} />
      <Container width="measure" className="py-14 md:py-20">
        <div className="prose">
          <MDXRemote source={prepareMdx(page.body)} components={createMdxComponents()} />
        </div>
        <p className="mt-14 border-t border-border pt-6 text-200 text-text-subtle">
          آخرین به‌روزرسانی: <time dateTime={page.updatedAt.toISOString()}>{formatDate(page.updatedAt)}</time>
        </p>
      </Container>
    </>
  )
}
