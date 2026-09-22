'use client'

import Link from 'next/link'
import { Button } from './Button'
import { Icon } from '@/components/ui/Icon'

/**
 * Sibling of EmptyState, same box, different job: an empty state says there is
 * nothing here, an error state says something went wrong. Both follow the rule
 * from DESIGN-PLAN §9 — what happened, why, and what to do next. "مشکلی پیش آمد"
 * on its own is not acceptable.
 *
 * `digest` is Next's hash of the server-side error. It is the only thing worth
 * showing the reader, because it is the only thing that makes a report
 * actionable. The message itself never appears: in a Prisma failure it can carry
 * a connection string or a column list.
 *
 * Deliberately no role="alert" on the container. This renders as a whole page,
 * not as an interruption, and e2e asserts on exactly one non-announcer alert per
 * page state (docs/UX-OVERHAUL.md §5).
 */
export function ErrorState({
  title,
  body,
  digest,
  onRetry,
  action,
}: {
  title: string
  body: string
  digest?: string
  onRetry?: () => void
  action?: { label: string; href: string }
}) {
  return (
    <div className="max-w-(--container-measure) rounded-lg border border-border bg-bg-sunken px-6 py-10">
      <p className="text-500 font-bold text-text">
        <Icon name="alert" className="me-2" />
        {title}
      </p>
      <p className="mt-3 text-300 leading-prose text-text-muted">{body}</p>

      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              دوباره تلاش کن
            </Button>
          )}
          {action && (
            <Link href={action.href} className="text-300 font-medium">
              {action.label} ←
            </Link>
          )}
        </div>
      )}

      {digest && (
        <p className="mt-6 text-200 text-text-subtle">
          کد خطا: <span className="latin">{digest}</span> — اگر گزارشش می‌کنی، همین را بفرست.
        </p>
      )}
    </div>
  )
}
