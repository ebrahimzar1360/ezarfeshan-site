import { getPublishedArticles } from '@/lib/content/queries'
import { site } from '@/lib/site'

export const revalidate = 3600

/**
 * RSS 2.0. Titles and descriptions are Persian, so the feed declares utf-8 and
 * fa-IR; a reader that guesses the encoding renders mojibake otherwise.
 */
export async function GET() {
  const articles = await getPublishedArticles(50)
  const now = new Date().toUTCString()

  const items = articles
    .map((a) => {
      const url = `${site.url}/articles/${a.slug}`
      return [
        '    <item>',
        `      <title>${xml(a.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        `      <description>${xml(a.excerpt)}</description>`,
        a.publishedAt ? `      <pubDate>${a.publishedAt.toUTCString()}</pubDate>` : '',
        ...a.topics.map((t) => `      <category>${xml(t.name)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(site.name)}</title>
    <link>${xml(site.url)}</link>
    <description>${xml(site.description)}</description>
    <language>fa-IR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${xml(site.url)}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
