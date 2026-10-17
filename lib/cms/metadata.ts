import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { getSection } from './content'
import type { ImageValue } from './fields'
import type { SectionKey } from './registry'
import { plainInline } from './tokens'

type SeoKey = Extract<SectionKey, `${string}.seo`>

/** Absolute, because Open Graph consumers do not resolve relative URLs. */
export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${site.url}${path.startsWith('/') ? '' : '/'}${path}`
}

export function ogFallback(title: string, kicker?: string): string {
  const q = new URLSearchParams({ title, ...(kicker ? { kicker } : {}) })
  return `${site.url}/api/og?${q.toString()}`
}

/**
 * Page metadata from a CMS SEO section: title, description, canonical, Open
 * Graph and Twitter card. Empty fields fall back to the site identity, and a
 * missing share image falls back to the generated /api/og card.
 */
export async function cmsMetadata(key: SeoKey, canonical: string, fallbackTitle?: string): Promise<Metadata> {
  const [seo, identity] = await Promise.all([getSection(key), getSection('site.identity')])
  const title = plainInline(seo.title || fallbackTitle || '')
  const description = plainInline(seo.description || identity.description)
  const own = seo.ogImage as ImageValue
  const fallback = identity.ogImage as ImageValue
  const image = own.src ? own : fallback.src ? fallback : null
  const imageUrl = image ? absoluteUrl(image.src) : ogFallback(title || identity.name)

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      title: title || `${identity.name} — ${identity.role}`,
      description,
      url: canonical,
      images: [
        {
          url: imageUrl,
          ...(image?.width ? { width: image.width, height: image.height } : { width: 1200, height: 630 }),
          alt: image?.alt || title || identity.name,
        },
      ],
    },
    twitter: { card: 'summary_large_image', title: title || identity.name, description, images: [imageUrl] },
  }
}
