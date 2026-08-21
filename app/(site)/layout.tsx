import type { ReactNode } from 'react'
import { PageViewTracker } from '@/components/site/PageViewTracker'
import { PersonJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'

/**
 * Chrome for the public site.
 *
 * Header and footer live here rather than in the root layout so /admin does not
 * inherit them — the admin panel rendered the public navigation and footer
 * until this group existed.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* emitted once for the whole public site, not repeated per page */}
      <PersonJsonLd />
      <WebSiteJsonLd />
      <PageViewTracker />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
