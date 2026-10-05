import Link from 'next/link'

/**
 * Empty states say what happened, why, and what to do next. "مشکلی پیش آمد"
 * on its own is not acceptable — the brief is explicit about this.
 *
 * v2: a dashed panel with an empty slot drawn in it — an unbuilt layer of the
 * stack, waiting for content.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-6 rounded-xl border border-dashed border-border-strong bg-bg-sunken px-7 py-10 sm:flex-row sm:items-start">
      <svg aria-hidden viewBox="0 0 64 64" className="size-14 shrink-0 text-text-subtle" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M32 6 58 20 32 34 6 20Z" strokeDasharray="4 4" />
        <path d="M6 30l26 14 26-14M6 40l26 14 26-14" />
      </svg>
      <div>
        <p className="text-500 font-bold text-text">{title}</p>
        <p className="mt-3 text-300 leading-prose text-text-muted">{body}</p>
        {action && (
          <p className="mt-5">
            <Link href={action.href} className="text-300 font-medium">
              {action.label} ←
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
