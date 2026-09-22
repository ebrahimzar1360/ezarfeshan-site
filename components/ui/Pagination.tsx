import Link from 'next/link'
import { faNum } from '@/lib/format'
import { pageWindow } from '@/lib/content/pagination'

/**
 * Page links for a list.
 *
 * Previous and next are words — تازه‌تر / قدیمی‌تر — not arrows. That is not
 * decoration: an arrow in an RTL document has to be mirrored, every mirroring
 * rule is a per-icon judgement call, and the words say something an arrow cannot
 * anyway. These articles are ordered newest first, so "back" means newer. An
 * arrow would only have said "that way".
 *
 * Numbers reuse Button's outline variant so the control inherits the button
 * scale rather than inventing a second one.
 */
export function Pagination({
  page,
  count,
  hrefFor,
}: {
  page: number
  count: number
  hrefFor: (page: number) => string
}) {
  // Nothing to navigate. With six seeded articles and PER_PAGE at 12 this is the
  // normal case, and rendering an empty nav would be furniture.
  if (count <= 1) return null

  const window = pageWindow(page, count)
  const base =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-200 no-underline transition-colors duration-150'
  const on = 'border border-accent bg-accent/10 font-medium text-text'
  const off = 'border border-border text-text-muted hover:border-border-strong hover:text-text'

  return (
    <nav aria-label="صفحه‌بندی" className="mt-12 border-t border-border pt-8">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={`${base} ${off}`} rel="prev">
              تازه‌تر
            </Link>
          ) : (
            <span className={`${base} border border-border text-text-subtle opacity-50`}>
              تازه‌تر
            </span>
          )}
        </li>

        {window.map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-200 text-text-subtle">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={hrefFor(n)}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`صفحهٔ ${faNum(n)}`}
                className={`${base} ${n === page ? on : off}`}
              >
                <span className="fa-nums">{faNum(n)}</span>
              </Link>
            </li>
          )
        )}

        <li>
          {page < count ? (
            <Link href={hrefFor(page + 1)} className={`${base} ${off}`} rel="next">
              قدیمی‌تر
            </Link>
          ) : (
            <span className={`${base} border border-border text-text-subtle opacity-50`}>
              قدیمی‌تر
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
