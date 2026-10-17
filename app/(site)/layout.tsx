import type { ReactNode } from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'

/**
 * Chrome for the public site.
 *
 * Header and footer live here rather than in the root layout so /admin does not
 * inherit them — the admin panel rendered the public navigation and footer
 * until this group existed.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
