import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { auth } from '@/lib/auth'

export const metadata = { title: 'مدیریت', robots: { index: false, follow: false } }

/**
 * The real authentication boundary.
 *
 * middleware.ts only checks that a cookie is present — it runs on the edge
 * runtime and cannot reach the database. This layout is a server component, so
 * it can verify the session properly, and every admin page renders inside it.
 *
 * The login page must stay OUT of this tree. In the App Router a child layout
 * nests inside its parent rather than replacing it, so app/admin/login/layout.tsx
 * did not exempt the login page — it rendered inside this one, was redirected to
 * itself, and looped. The (protected) route group solves it: it groups the
 * authenticated pages without adding a URL segment, leaving /admin/login outside.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')

  const nav = [
    { href: '/admin', label: 'داشبورد' },
    { href: '/admin/articles', label: 'مقالات' },
    { href: '/admin/topics', label: 'موضوع‌ها' },
    { href: '/admin/subscribers', label: 'مشترکین' },
    { href: '/admin/leads', label: 'درخواست‌ها' },
  ]

  return (
    <div className="min-h-dvh bg-bg-sunken">
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex max-w-(--container-page) flex-wrap items-center gap-x-7 gap-y-3 px-6 py-4">
          <Link href="/admin" className="text-400 font-bold text-text no-underline">
            مدیریت
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-300 text-text-muted no-underline hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-5">
            <Link href="/" target="_blank" className="text-200 text-text-subtle no-underline hover:text-text">
              دیدن سایت ↗
            </Link>
            <span className="text-200 text-text-subtle">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-(--container-page) px-6 py-10">{children}</main>
    </div>
  )
}
