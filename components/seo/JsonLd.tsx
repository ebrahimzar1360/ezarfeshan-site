import { credentials, currentRoles } from '@/lib/content/bio'
import { site, socials } from '@/lib/site'

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

export function PersonJsonLd() {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': PERSON_ID,
        name: site.name,
        alternateName: site.nameLatin,
        jobTitle: site.role,
        description: site.description,
        url: site.url,
        image: `${site.url}/photos/portrait-about.jpg`,
        // only the destinations lib/site.ts actually confirms
        sameAs: socials.map((s) => s.href),
        knowsAbout: ['سیستم‌سازی', 'مدیریت عملیات', 'هوش مصنوعی کاربردی', 'مدیریت تیم'],
        hasCredential: credentials
          .filter((c) => !c.note)
          .map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c.title,
          })),
        hasOccupation: currentRoles.map((r) => ({
          '@type': 'Occupation',
          name: r.title,
        })),
      }}
    />
  )
}

export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': SITE_ID,
        name: site.name,
        url: site.url,
        description: site.description,
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
}: {
  title: string
  description: string
  slug: string
  publishedAt: Date | null
  updatedAt: Date
  readingMinutes: number
  topics: { name: string }[]
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
        image: `${site.url}/api/og?title=${encodeURIComponent(title)}`,
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
