import Link from 'next/link'
import { guard } from '@/lib/admin/guard'
import { getContentRows } from '@/lib/admin/queries'
import { sectionsByGroup } from '@/lib/cms/registry'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Every editable piece of site copy, grouped by page. Articles and free
 * pages have their own sections of the admin; this is the rest of the site —
 * headings, paragraphs, buttons and links, the menus, contact channels, the
 * projects list and each page's SEO.
 */
export default async function ContentIndexPage() {
  await guard('content.edit')
  const rows = await getContentRows()
  const edited = new Map(rows.map((r) => [r.key.replace(/^content:/, ''), r.updatedAt]))

  return (
    <>
      <h1 className="gold-marker mb-3 text-700">متن‌ها و دکمه‌ها</h1>
      <p className="mb-10 max-w-3xl text-300 leading-prose text-text-muted">
        هر متن، دکمه، پیوند، عکس و تنظیم سئوی صفحه‌های سایت از اینجا ویرایش می‌شود. بخشی که دست نخورده متن پیش‌فرض را نشان
        می‌دهد؛ هر وقت خواستی می‌توانی به آن برگردی. ذخیره بلافاصله روی سایت اعمال می‌شود.
      </p>

      <div className="space-y-10">
        {sectionsByGroup().map((g) => (
          <section key={g.group} aria-labelledby={`g-${g.group}`}>
            <h2 id={`g-${g.group}`} className="text-500 font-bold">
              {g.label}
            </h2>
            <p className="mt-1 text-200 text-text-subtle">{g.description}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.sections.map((s) => {
                const at = edited.get(s.key)
                return (
                  <li key={s.key}>
                    <Link
                      href={`/admin/content/${s.key}`}
                      className="block h-full rounded-lg border border-border bg-bg p-5 no-underline transition-colors duration-150 hover:border-accent"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-300 font-bold text-text">{s.label}</span>
                        {at && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.7rem] font-medium text-text">
                            ویرایش‌شده
                          </span>
                        )}
                      </span>
                      {s.description && (
                        <span className="mt-1.5 block text-200 leading-normal text-text-muted">{s.description}</span>
                      )}
                      {at && <span className="mt-2 block text-[0.7rem] text-text-subtle">آخرین تغییر: {formatDate(at)}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
