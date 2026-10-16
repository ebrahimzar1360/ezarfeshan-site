import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

/**
 * v3 header: logo, five links, one forest-green button. Nothing else — the
 * command palette and theme switch that used to sit here were removed for the
 * minimal redesign (search is still /search). The theme follows the visitor's
 * system setting.
 */
export function Header() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-border bg-bg/90 text-text backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-10 focus:rounded-md focus:bg-bg-raised focus:px-4 focus:py-2 focus:text-300"
      >
        پرش به محتوا
      </a>

      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo />

        <NavLinks />

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden h-11 items-center gap-2 rounded-lg bg-forest px-5 text-300 font-bold text-paper no-underline transition-colors duration-150 hover:bg-emerald hover:text-paper md:inline-flex"
          >
            شروع گفت‌وگو
            <Icon name="arrow" className="text-400" />
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
