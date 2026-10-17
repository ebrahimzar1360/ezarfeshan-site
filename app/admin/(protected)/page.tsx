import Link from 'next/link'
import { guard } from '@/lib/admin/guard'
import { can, type Permission } from '@/lib/admin/permissions'
import { getDashboardStats } from '@/lib/admin/queries'
import { faNum } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await guard()
  const { denied } = await searchParams
  const s = await getDashboardStats()

  const all: { label: string; value: number; href: string; permission?: Permission }[] = [
    { label: 'مقالهٔ منتشرشده', value: s.articles, href: '/admin/articles', permission: 'articles.write' },
    { label: 'پیش‌نویس و زمان‌بندی', value: s.drafts, href: '/admin/articles?status=DRAFT', permission: 'articles.write' },
    { label: 'صفحهٔ آزاد', value: s.pages, href: '/admin/pages', permission: 'pages.manage' },
    { label: 'فایل در کتابخانه', value: s.media, href: '/admin/media', permission: 'media.upload' },
    { label: 'مشترک تأییدشده', value: s.subscribers, href: '/admin/subscribers', permission: 'subscribers.view' },
    { label: 'در انتظار تأیید', value: s.pending, href: '/admin/subscribers', permission: 'subscribers.view' },
    { label: 'درخواست جدید', value: s.newLeads, href: '/admin/leads', permission: 'leads.view' },
    { label: 'بازدید ۳۰ روز', value: s.views, href: '/admin', permission: 'leads.view' },
  ]
  const cards = all.filter((c) => !c.permission || can(user.role, c.permission))

  const quick: { label: string; href: string; permission: Permission }[] = [
    { label: 'نوشتن مقالهٔ جدید ←', href: '/admin/articles/new', permission: 'articles.write' },
    { label: 'ویرایش متن‌ها و دکمه‌های سایت ←', href: '/admin/content', permission: 'content.edit' },
    { label: 'ویرایش صفحهٔ اصلی (هیرو) ←', href: '/admin/content/home.hero', permission: 'content.edit' },
    { label: 'بارگذاری تصویر ←', href: '/admin/media', permission: 'media.upload' },
    { label: 'ساخت صفحهٔ تازه ←', href: '/admin/pages/new', permission: 'pages.manage' },
    { label: 'افزودن کاربر و تعیین نقش ←', href: '/admin/users', permission: 'users.manage' },
    { label: 'خروجی CSV مشترکین ←', href: '/admin/subscribers', permission: 'subscribers.view' },
  ]

  return (
    <>
      <h1 className="gold-marker mb-8 text-700">داشبورد</h1>

      {denied && (
        <p role="alert" className="mb-8 rounded-md border border-accent/40 bg-accent/8 px-5 py-4 text-300 text-text">
          آن بخش برای نقش تو باز نیست. اگر به آن نیاز داری، از مدیر کل بخواه دسترسی‌ات را تغییر دهد.
        </p>
      )}

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

      {s.pending > 0 && can(user.role, 'subscribers.view') && (
        <p className="mt-8 rounded-md border border-accent/40 bg-accent/8 px-5 py-4 text-300 leading-normal text-text-muted">
          <strong className="text-text">{faNum(s.pending)} نفر</strong> ثبت‌نام کرده‌اند ولی
          هنوز ایمیل تأیید را کلیک نکرده‌اند. این عادی است — بخشی از آدم‌ها هیچ‌وقت تأیید
          نمی‌کنند. اگر نسبتش خیلی بالاست، احتمالاً ایمیل‌ها به اسپم می‌روند.
        </p>
      )}

      <div className="mt-10 rounded-lg border border-border bg-bg p-6">
        <h2 className="text-500 font-bold">شروع سریع</h2>
        <ul className="mt-4 space-y-2.5 text-300 text-text-muted">
          {quick
            .filter((q) => can(user.role, q.permission))
            .map((q) => (
              <li key={q.href}>
                <Link href={q.href}>{q.label}</Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
