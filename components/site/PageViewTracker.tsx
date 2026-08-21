'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Records a page view. No cookie, no localStorage, no third-party script — see
 * app/api/analytics/pageview/route.ts for how the visitor hash is derived.
 *
 * sendBeacon rather than fetch: it survives the page being closed, which is
 * exactly when the last view of a session is recorded.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    // React 18 StrictMode runs effects twice in development
    if (lastSent.current === pathname) return
    lastSent.current = pathname

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || undefined })

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/pageview', new Blob([payload], { type: 'application/json' }))
      } else {
        void fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        })
      }
    } catch {
      // analytics must never break a page
    }
  }, [pathname])

  return null
}
