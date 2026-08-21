import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { nav } from '@/lib/site'
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
          <Link
            href="/search"
            aria-label="جست‌وجو"
            className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text"
          >
            <span aria-hidden className="text-300">⌕</span>
          </Link>
          <ThemeToggle />
          {/* Mobile nav lives in a <details> so it works with JS disabled and
              needs no client component. */}
          <details className="relative md:hidden">
            <summary
              className="inline-flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-border text-text-muted [&::-webkit-details-marker]:hidden"
              aria-label="باز کردن منو"
            >
              <span aria-hidden>☰</span>
            </summary>
            <nav
              aria-label="ناوبری موبایل"
              className="absolute end-0 top-12 w-52 rounded-lg border border-border bg-bg-raised p-2 shadow-(--shadow)"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2.5 text-300 text-text no-underline hover:bg-accent/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
