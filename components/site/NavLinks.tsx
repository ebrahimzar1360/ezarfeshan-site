'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Desktop navigation. The active section gets a gold bar under its label — a
 * mark, not a text colour, so it holds on every ground the header sits on.
 * Hover draws the same bar in, from the reading edge.
 */
export type NavItem = { label: string; href: string }

export function NavLinks({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`group relative rounded-md px-3.5 py-2 text-300 no-underline transition-colors duration-150 hover:text-text ${
              active ? 'font-medium text-text' : 'text-text-muted'
            }`}
          >
            {item.label}
            <span
              aria-hidden
              className={`absolute inset-x-3.5 -bottom-px h-0.5 origin-[100%_50%] bg-accent transition-transform duration-300 ease-brand ${
                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </Link>
        )
      })}
    </nav>
  )
}
