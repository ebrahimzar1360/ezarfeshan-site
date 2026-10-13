import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { CommandPalette } from './CommandPalette'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'
import { ThemeToggle } from './ThemeToggle'
import { Icon } from '@/components/ui/Icon'

export function Header() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-border bg-bg/80 text-text backdrop-blur-md">
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
          {/* Two entry points, split by breakpoint. Below md the plain link to
              /search: a ⌘K hint is meaningless on a phone, and the link is also
              the no-JavaScript path. At md+ the palette button replaces it.
              `md:hidden` is display:none, so exactly one of the two is in the
              accessibility tree at any width — never both, which is what would
              give the header two controls with the same purpose.

              The palette's own Ctrl+K listener is on window and mounts at every
              width, so a keyboard user on a small screen still gets it. */}
          <Link
            href="/search"
            aria-label="جست‌وجو"
            className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text md:hidden"
          >
            <Icon name="search" className="text-400" />
          </Link>
          <div className="hidden md:block">
            <CommandPalette />
          </div>
          <ThemeToggle />
          {/* wrapped: `hidden` on the Button itself loses to its own inline-flex */}
          {/* Gold and round, like the hero's own consult button. On the
              homepage it waits until the hero has scrolled away (HeroWatch +
              globals.css), so the two never compete on one screen. */}
          <span className="header-cta ms-2 hidden lg:block">
            <Link
              href="/consult"
              className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-200 font-bold text-forest-deep transition-colors duration-150 hover:bg-gold-light"
            >
              درخواست مشاوره
            </Link>
          </span>
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
