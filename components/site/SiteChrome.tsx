import type { ReactNode } from 'react'
import { PageViewTracker } from '@/components/site/PageViewTracker'
import { PersonJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { ToastProvider } from '@/components/ui/Toast'
import { ChatWidget } from '@/components/site/chat/ChatWidget'
import { Footer } from '@/components/site/Footer'
import { RevealObserver } from '@/components/site/RevealObserver'
import { Header } from '@/components/site/Header'

/**
 * Chrome for the public site: header, footer, chat, analytics, structured data.
 * Shared by app/(site) and app/(cms) — two groups because (cms) must not sit
 * under (site)/loading.tsx (see app/(cms)/layout.tsx).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* emitted once for the whole public site, not repeated per page */}
      <PersonJsonLd />
      <WebSiteJsonLd />
      <PageViewTracker />
      <RevealObserver />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </ToastProvider>
  )
}
