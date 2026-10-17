import type { ReactNode } from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'

/**
 * Pages written in the admin, at /<slug>.
 *
 * A separate group from (site) for one reason: (site)/loading.tsx wraps every
 * page under it in a Suspense boundary, so the response starts streaming —
 * with status 200 — before the page can call notFound(). That is the soft-404
 * in docs/OPEN-QUESTIONS.md §16. A catch-all /<slug> under it would turn every
 * mistyped address on the site into a 200. Here there is no loading boundary,
 * the route is dynamic, and an unknown slug answers a real 404.
 */
export default function CmsLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
