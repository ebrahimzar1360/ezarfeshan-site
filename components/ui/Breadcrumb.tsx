import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { Icon } from '@/components/ui/Icon'

export type Crumb = { name: string; path: string }

/**
 * Visual trail and structured data from one array.
 *
 * They used to be two literals in the same file — the article page hand-rolled a
 * <nav> and then wrote the same steps again for BreadcrumbJsonLd. That is one
 * copy-paste away from showing the reader one path and telling Google another,
 * which is the kind of mismatch that costs a rich result without ever looking
 * broken. Passing the same array to both makes disagreement impossible.
 *
 * The last crumb is the current page: plain text, marked aria-current, not a
 * link to where you already are.
 */
export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  if (trail.length === 0) return null

  return (
    <>
      <BreadcrumbJsonLd trail={trail} />
      <nav aria-label="مسیر" className="text-200 text-text-subtle">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-x-2">
                {i > 0 && (
                  <Icon name="chevron" className="text-text-subtle" />
                )}
                {last ? (
                  <span aria-current="page" className="text-text-muted">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className="text-text-subtle no-underline hover:text-text">
                    {crumb.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
