import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { nav } from '@/lib/site'
import { CommandPalette } from './CommandPalette'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-10 focus:rounded-md focus:bg-bg-raised focus:px-4 focus:py-2 focus:text-300"
      >
        پرش به محتوا
      </a>

      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-300 text-text-muted no-underline transition-colors duration-150 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
            <span aria-hidden className="text-300">⌕</span>
          </Link>
          <div className="hidden md:block">
            <CommandPalette />
          </div>
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
