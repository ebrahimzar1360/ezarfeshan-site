'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Admin menu; the current section is marked with aria-current and the accent rule. */
export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="منوی مدیریت" className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`border-b-2 pb-0.5 text-300 no-underline hover:text-text ${
              active ? 'border-accent font-medium text-text' : 'border-transparent text-text-muted'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
