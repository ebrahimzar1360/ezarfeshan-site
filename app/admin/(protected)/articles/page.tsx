import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { getAdminArticles } from '@/lib/admin/queries'
import { faNum, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS = {
  DRAFT: { label: 'پیش‌نویس', tone: 'text-text-subtle' },
  SCHEDULED: { label: 'زمان‌بندی‌شده', tone: 'text-accent' },
  PUBLISHED: { label: 'منتشرشده', tone: 'text-link' },
} as const

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles()

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="gold-marker text-700">مقالات</h1>
        <Link
          href="/admin/articles/new"
          className="ms-auto h-11 rounded-md bg-solid-bg px-5 text-300 font-medium leading-[2.75rem] text-solid-text no-underline hover:bg-solid-bg-hover"
        >
          مقالهٔ جدید
        </Link>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای نساخته‌ای"
          body="اولین نوشته را شروع کن. تا وقتی وضعیتش پیش‌نویس است روی سایت دیده نمی‌شود."
          action={{ label: 'مقالهٔ جدید', href: '/admin/articles/new' }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-bg">
          <table className="w-full text-300">
            <thead>
              <tr className="border-b border-border text-200 text-text-subtle">
                <th className="p-4 text-start font-medium">عنوان</th>
                <th className="p-4 text-start font-medium">وضعیت</th>
                <th className="p-4 text-start font-medium">موضوع</th>
                <th className="p-4 text-start font-medium">تاریخ</th>
                <th className="p-4 text-start font-medium">بازدید</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <Link href={`/admin/articles/${a.id}`} className="font-medium no-underline">
                      {a.title}
                    </Link>
                    {a.featured && (
                      <span className="ms-2 text-200 text-accent" title="مقالهٔ شاخص">
                        ★
                      </span>
                    )}
                    <p className="latin mt-1 text-200 text-text-subtle">{a.slug}</p>
                  </td>
                  <td className={`p-4 text-200 ${STATUS[a.status].tone}`}>
                    {STATUS[a.status].label}
                  </td>
                  <td className="p-4 text-200 text-text-muted">
                    {a.topics.map((t) => t.name).join('، ') || '—'}
                  </td>
                  <td className="p-4 text-200 text-text-muted">
                    {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                  </td>
                  <td className="p-4 text-200 text-text-muted">{faNum(a.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
