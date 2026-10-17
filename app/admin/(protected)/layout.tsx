import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { can, ROLE_LABELS, type Permission } from '@/lib/admin/permissions'
import { currentUser } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = { title: 'مدیریت', robots: { index: false, follow: false } }

/**
 * The real authentication boundary.
 *
 * middleware.ts only checks that a cookie is present — it runs on the edge
 * runtime and cannot reach the database. This layout is a server component, so
 * it verifies the session properly *and* re-reads the account: a disabled user
 * is out on the next request, not when the cookie expires.
 *
 * The login page must stay OUT of this tree. In the App Router a child layout
 * nests inside its parent rather than replacing it, so app/admin/login/layout.tsx
 * did not exempt the login page — it rendered inside this one, was redirected to
 * itself, and looped. The (protected) route group solves it: it groups the
 * authenticated pages without adding a URL segment, leaving /admin/login outside.
 *
 * The menu shows only what the role may open; each page and action still
 * checks for itself.
 */
const NAV: { href: string; label: string; permission?: Permission; group: string }[] = [
  { href: '/admin', label: 'داشبورد', group: 'main' },
  { href: '/admin/articles', label: 'مقالات', permission: 'articles.write', group: 'content' },
  { href: '/admin/pages', label: 'صفحه‌ها', permission: 'pages.manage', group: 'content' },
  { href: '/admin/content', label: 'متن‌ها و دکمه‌ها', permission: 'content.edit', group: 'content' },
  { href: '/admin/media', label: 'رسانه', permission: 'media.upload', group: 'content' },
  { href: '/admin/topics', label: 'موضوع‌ها', permission: 'topics.manage', group: 'content' },
  { href: '/admin/leads', label: 'درخواست‌ها', permission: 'leads.view', group: 'people' },
  { href: '/admin/subscribers', label: 'مشترکین', permission: 'subscribers.view', group: 'people' },
  { href: '/admin/users', label: 'کاربران و دسترسی', permission: 'users.manage', group: 'system' },
  { href: '/admin/audit', label: 'گزارش تغییرات', permission: 'audit.view', group: 'system' },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/admin/login')

  const items = NAV.filter((n) => !n.permission || can(user.role, n.permission))

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg-sunken">
        <header className="border-b border-border bg-bg">
          <div className="mx-auto flex max-w-(--container-page) flex-wrap items-center gap-x-7 gap-y-3 px-6 py-4">
            <Link href="/admin" className="text-400 font-bold text-text no-underline">
              مدیریت
            </Link>
            <AdminNav items={items.slice(1).map(({ href, label }) => ({ href, label }))} />
            <div className="ms-auto flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/" target="_blank" className="text-200 text-text-subtle no-underline hover:text-text">
                دیدن سایت ↗
              </Link>
              <Link href="/admin/account" className="text-200 text-text-subtle no-underline hover:text-text">
                {user.name} · {ROLE_LABELS[user.role]}
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-(--container-page) px-6 py-10">{children}</main>
      </div>
    </ToastProvider>
  )
}
