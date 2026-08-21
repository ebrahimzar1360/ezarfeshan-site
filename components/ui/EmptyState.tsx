import Link from 'next/link'

/**
 * Empty states say what happened, why, and what to do next. "مشکلی پیش آمد"
 * on its own is not acceptable — the brief is explicit about this.
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
    <div className="max-w-(--container-measure) rounded-lg border border-border bg-bg-sunken px-6 py-10">
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
  )
}
