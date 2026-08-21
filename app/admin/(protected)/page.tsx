import Link from 'next/link'
import { getDashboardStats } from '@/lib/admin/queries'
import { faNum } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const s = await getDashboardStats()

  const cards = [
    { label: 'مقالهٔ منتشرشده', value: s.articles, href: '/admin/articles' },
    { label: 'پیش‌نویس و زمان‌بندی', value: s.drafts, href: '/admin/articles' },
    { label: 'مشترک تأییدشده', value: s.subscribers, href: '/admin/subscribers' },
    { label: 'در انتظار تأیید', value: s.pending, href: '/admin/subscribers' },
    { label: 'درخواست جدید', value: s.newLeads, href: '/admin/leads' },
    { label: 'بازدید ۳۰ روز', value: s.views, href: '/admin' },
  ]

  return (
    <>
      <h1 className="gold-marker mb-8 text-700">داشبورد</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-border bg-bg p-6 no-underline transition-colors duration-150 hover:border-accent"
          >
            <p className="text-800 font-bold text-text">{faNum(c.value)}</p>
            <p className="mt-1.5 text-300 text-text-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      {s.pending > 0 && (
        <p className="mt-8 rounded-md border border-accent/40 bg-accent/8 px-5 py-4 text-300 leading-normal text-text-muted">
          <strong className="text-text">{faNum(s.pending)} نفر</strong> ثبت‌نام کرده‌اند ولی
          هنوز ایمیل تأیید را کلیک نکرده‌اند. این عادی است — بخشی از آدم‌ها هیچ‌وقت تأیید
          نمی‌کنند. اگر نسبتش خیلی بالاست، احتمالاً ایمیل‌ها به اسپم می‌روند.
        </p>
      )}

      <div className="mt-10 rounded-lg border border-border bg-bg p-6">
        <h2 className="text-500 font-bold">شروع سریع</h2>
        <ul className="mt-4 space-y-2.5 text-300 text-text-muted">
          <li>
            <Link href="/admin/articles/new">نوشتن مقالهٔ جدید ←</Link>
          </li>
          <li>
            <Link href="/admin/subscribers">خروجی CSV مشترکین ←</Link>
          </li>
        </ul>
      </div>
    </>
  )
}
