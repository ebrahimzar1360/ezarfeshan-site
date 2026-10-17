import { getSection } from '@/lib/cms/content'
import { absoluteUrl } from '@/lib/cms/metadata'
import { getChannels, getIdentity } from '@/lib/cms/site'
import { plainInline } from '@/lib/cms/tokens'
import { site } from '@/lib/site'

/**
 * Structured data.
 *
 * Everything below maps to something already on the page. Nothing is asserted
 * to search engines that a reader cannot also see — a Person block claiming
 * awards or ratings the site never shows is exactly what a manual review
 * penalises, and it would break the same rule the rest of this project follows.
 */

function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output, not user input. The </script> guard covers the
      // one sequence that could still break out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

const PERSON_ID = `${site.url}/#person`
const SITE_ID = `${site.url}/#website`

export async function PersonJsonLd() {
  const [identity, channels, creds, roles, band] = await Promise.all([
    getIdentity(),
    getChannels(),
    getSection('about.credentials'),
    getSection('about.roles'),
    getSection('about.band'),
  ])
  const portrait = band.portrait.src || identity.portrait.src
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': PERSON_ID,
        name: identity.name,
        alternateName: identity.nameLatin,
        jobTitle: identity.role,
        description: plainInline(identity.description),
        url: site.url,
        ...(portrait ? { image: absoluteUrl(portrait) } : {}),
        // only the web profiles the CMS lists as contact channels
        sameAs: channels.filter((c) => /^https?:\/\//.test(c.href)).map((c) => c.href),
        knowsAbout: ['سیستم‌سازی', 'مدیریت عملیات', 'هوش مصنوعی کاربردی', 'مدیریت تیم'],
        hasCredential: creds.items
          .filter((c) => !c.note)
          .map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c.title,
          })),
        hasOccupation: roles.items.map((r) => ({
          '@type': 'Occupation',
          name: r.title,
        })),
      }}
    />
  )
}

export async function WebSiteJsonLd() {
  const identity = await getIdentity()
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': SITE_ID,
        name: identity.name,
        url: site.url,
        description: plainInline(identity.description),
        inLanguage: 'fa-IR',
        publisher: { '@id': PERSON_ID },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${site.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  readingMinutes,
  topics,
  image,
}: {
  title: string
  description: string
  slug: string
  publishedAt: Date | null
  updatedAt: Date
  readingMinutes: number
  topics: { name: string }[]
  image?: string
}) {
  const url = `${site.url}/articles/${slug}`
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        inLanguage: 'fa-IR',
        ...(publishedAt ? { datePublished: publishedAt.toISOString() } : {}),
        dateModified: updatedAt.toISOString(),
        image: image ?? `${site.url}/api/og?title=${encodeURIComponent(title)}`,
        articleSection: topics.map((t) => t.name),
        timeRequired: `PT${readingMinutes}M`,
      }}
    />
  )
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${site.url}${item.path}`,
        })),
      }}
    />
  )
}

export type FaqEntry = { question: string; answer: string }

/**
 * FAQPage structured data.
 *
 * Fed the same array the visible list renders from, so the two cannot drift —
 * the pattern Breadcrumb already uses. That matters more than usual here:
 * Google treats FAQ markup that does not match the page as a manual-action
 * risk, so a copy-paste divergence is worse than having no markup at all.
 */
export function FaqJsonLd({ entries }: { entries: readonly FaqEntry[] }) {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: entries.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      }}
    />
  )
}
