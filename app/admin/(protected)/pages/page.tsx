import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { guard } from '@/lib/admin/guard'
import { getAdminPages } from '@/lib/admin/queries'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PagesIndex() {
  await guard('pages.manage')
  const pages = await getAdminPages()
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="gold-marker text-700">صفحه‌ها</h1>
        <Link
          href="/admin/pages/new"
          className="ms-auto h-11 rounded-md bg-solid-bg px-5 text-300 font-medium leading-[2.75rem] text-solid-text no-underline hover:bg-solid-bg-hover"
        >
          صفحهٔ جدید
        </Link>
      </div>
      <p className="mb-8 max-w-3xl text-300 leading-prose text-text-muted">
        صفحه‌های آزاد مثل «سؤال‌های رایج» یا «همکاری». برای نشان دادنشان در منو، پیوندش را در «متن‌ها و دکمه‌ها ← منوی اصلی» یا
        «فوتر» اضافه کن. صفحه‌ای با نشانی privacy یا terms جای متن پیش‌فرض همان صفحه را می‌گیرد.
      </p>
      {pages.length === 0 ? (
        <EmptyState title="هنوز صفحه‌ای نساخته‌ای" body="صفحه‌های اصلی سایت در «متن‌ها و دکمه‌ها» ویرایش می‌شوند؛ اینجا برای صفحه‌های تازه است." action={{ label: 'صفحهٔ جدید', href: '/admin/pages/new' }} />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-bg">
          {pages.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/pages/${p.id}`} className="font-medium no-underline">
                  {p.title}
                </Link>
                <p className="latin mt-1 text-200 text-text-subtle">/{p.slug}</p>
              </div>
              <span className={`text-200 ${p.status === 'PUBLISHED' ? 'text-link' : 'text-text-subtle'}`}>
                {p.status === 'PUBLISHED' ? 'منتشرشده' : 'پیش‌نویس'}
              </span>
              <span className="text-200 text-text-subtle">{formatDate(p.updatedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
