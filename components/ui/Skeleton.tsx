/**
 * Loading placeholders.
 *
 * The usual shimmer is a gradient sweeping across the block on a `translateX`.
 * Both halves of that are wrong here: gradients are on the banned list
 * (DESIGN-PLAN §10), and a horizontal sweep does not mirror under dir="rtl" —
 * the keyframe moves in the physical +x direction whatever the writing mode, so
 * the light would travel the wrong way across a Persian page. An opacity pulse
 * says the same thing and is direction-neutral.
 *
 * Everything here is aria-hidden. A skeleton is furniture: the route's own
 * loading announcement is Next's job, and a screen reader that reads out twelve
 * empty boxes is worse off than one that reads nothing. Deliberately no
 * role="status" either — see docs/UX-OVERHAUL.md §5, item 4.
 */

import { cn } from '@/lib/utils'

export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden className={cn('block rounded-sm bg-bg-sunken pulse', className)} />
}

/**
 * Text lines. The last one is short because real paragraphs end mid-line, and a
 * block of equal-length bars reads as a table rather than as prose.
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={cn('block space-y-3', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-3/5' : 'w-full')} />
      ))}
    </span>
  )
}

/**
 * Shaped to ArticleListItem: the same hairline top border and the same py-7, so
 * the real list does not jump into place when it arrives.
 */
export function SkeletonArticleList({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-t border-border py-7">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="mt-3 h-4 w-full max-w-(--container-measure)" />
          <Skeleton className="mt-2 h-4 w-3/5 max-w-(--container-measure)" />
          <Skeleton className="mt-5 h-3 w-40" />
        </div>
      ))}
    </div>
  )
}
