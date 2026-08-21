import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin is already gated, but keeping it out of the index means the
        // login page never turns up in a search result as a target.
        disallow: ['/admin', '/api/', '/newsletter/confirmed', '/newsletter/unsubscribe'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
