import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { guard } from '@/lib/admin/guard'
import { can } from '@/lib/admin/permissions'
import { getAdminArticles } from '@/lib/admin/queries'
import { inputClass } from '@/components/ui/FormField'
import { faNum, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS = {
  DRAFT: { label: 'پیش‌نویس', tone: 'text-text-subtle' },
  SCHEDULED: { label: 'زمان‌بندی‌شده', tone: 'text-accent' },
  PUBLISHED: { label: 'منتشرشده', tone: 'text-link' },
} as const

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const user = await guard('articles.write')
  const { status, q } = await searchParams
  // authors see their own; editors and admins see everyone's
  const mine = !can(user.role, 'articles.editAny')
  const articles = await getAdminArticles({ authorId: mine ? user.id : undefined, status, q })
  const filtered = Boolean(status || q)

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

      <form className="mb-6 flex flex-wrap items-end gap-3" role="search">
        <div className="min-w-56 flex-1">
          <label htmlFor="q" className="mb-1.5 block text-200 text-text-subtle">
            جست‌وجو در عنوان یا اسلاگ
          </label>
          <input id="q" name="q" type="search" defaultValue={q ?? ''} className={inputClass} />
        </div>
        <div>
          <label htmlFor="st" className="mb-1.5 block text-200 text-text-subtle">
            وضعیت
          </label>
          <select id="st" name="status" defaultValue={status ?? ''} className={`${inputClass} w-44`}>
            <option value="">همه</option>
            {Object.entries(STATUS).map(([v, s]) => (
              <option key={v} value={v}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="h-12 rounded-md border border-border-strong px-5 text-300 text-text hover:border-accent">
          اعمال
        </button>
        {filtered && (
          <Link href="/admin/articles" className="h-12 px-2 text-200 leading-[3rem]">
            پاک کردن فیلتر
          </Link>
        )}
      </form>

      {articles.length === 0 && filtered ? (
        <p className="rounded-lg border border-border bg-bg p-6 text-300 text-text-muted">مقاله‌ای با این فیلتر پیدا نشد.</p>
      ) : articles.length === 0 ? (
        <EmptyState
          title="هنوز مقاله‌ای نساخته‌ای"
          body="اولین نوشته را شروع کن. تا وقتی وضعیتش پیش‌نویس است روی سایت دیده نمی‌شود."
          action={{ label: 'مقالهٔ جدید', href: '/admin/articles/new' }}
        />
      ) : (
        <>
        {/* Cards below md. Measured at 390px, the table needed 422px inside a
            340px box: the views column fell off entirely, titles broke onto four
            lines and slugs wrapped character by character. overflow-x-auto kept
            the *page* from scrolling but left the content unreadable, which is
            not the same thing as working. */}
        <ul className="space-y-3 md:hidden">
          {articles.map((a) => (
            <li key={a.id} className="rounded-lg border border-border bg-bg p-4">
              <Link href={`/admin/articles/${a.id}`} className="font-medium no-underline">
                {a.title}
              </Link>
              {a.featured && (
                <span className="ms-2 text-200 text-accent" title="مقالهٔ شاخص">
                  ★
                </span>
              )}
              <p className="latin mt-1 text-200 text-text-subtle">{a.slug}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-200">
                <span className={STATUS[a.status].tone}>{STATUS[a.status].label}</span>
                <span aria-hidden className="text-text-subtle">·</span>
                <span className="text-text-muted">
                  {a.topics.map((t) => t.name).join('، ') || '—'}
                </span>
                <span aria-hidden className="text-text-subtle">·</span>
                <span className="text-text-muted">
                  {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                </span>
                <span aria-hidden className="text-text-subtle">·</span>
                <span className="text-text-muted">{faNum(a.views)} بازدید</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-lg border border-border bg-bg md:block">
          <table className="w-full text-300">
            <thead>
              <tr className="border-b border-border text-200 text-text-subtle">
                <th className="p-4 text-start font-medium">عنوان</th>
                <th className="p-4 text-start font-medium">وضعیت</th>
                <th className="p-4 text-start font-medium">موضوع</th>
                <th className="p-4 text-start font-medium">نویسنده</th>
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
                  <td className="p-4 text-200 text-text-muted">{a.author?.name ?? '—'}</td>
                  <td className="p-4 text-200 text-text-muted">
                    {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                  </td>
                  <td className="p-4 text-200 text-text-muted">{faNum(a.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  )
}
