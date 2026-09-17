'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { nav } from '@/lib/site'

/**
 * Replaces the <details> dropdown the header used to carry.
 *
 * That version worked without JavaScript, which was its whole appeal, but it had
 * no focus trap, no Escape, no scroll lock, and it stayed open across a
 * navigation. The no-JS path is not lost: the footer carries the same `nav`
 * array, so a visitor without scripts still reaches every section.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on navigate. Without this the panel stays open over the page the
  // visitor just asked for — the single most common complaint about hand-rolled
  // mobile menus.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن منو"
        aria-expanded={open}
        className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text"
      >
        <span aria-hidden>☰</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} label="ناوبری سایت">
        <div className="ms-auto flex h-full w-[min(20rem,85vw)] flex-col border-s border-border bg-bg-raised">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-5">
            <p className="text-200 font-medium tracking-wide text-text-subtle">بخش‌ها</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن منو"
              className="inline-flex size-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors duration-150 hover:border-accent hover:text-text"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>

          <nav aria-label="ناوبری موبایل" className="flex-1 overflow-y-auto p-3">
            <ul>
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // gold as a marker on the inline-start edge, never as the
                      // label colour: 2.10:1 on paper, and an e2e test watches
                      // for exactly that mistake
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-md px-4 py-3.5 text-400 no-underline transition-colors duration-150 ${
                        active
                          ? 'gold-marker bg-accent/10 font-medium text-text'
                          : 'text-text-muted hover:bg-bg-sunken hover:text-text'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-border p-3">
            <Link
              href="/search"
              className="block rounded-md px-4 py-3 text-300 text-text-muted no-underline transition-colors duration-150 hover:text-text"
            >
              <span aria-hidden className="me-2">⌕</span>
              {/* not "جست‌وجو در مقالات": that exact string is the sr-only label
                  of the #q input on /search, which e2e reaches with getByLabel.
                  getByLabel does not match link text, but leaving a second copy
                  of a load-bearing string around is how a suite starts flaking. */}
              جست‌وجو
            </Link>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
