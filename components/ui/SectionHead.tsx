import type { ReactNode } from 'react'

/**
 * Section heading carrying the gold marker on its inline-start edge — the
 * device recovered from the printed brand guide. See docs/DESIGN-PLAN.md §6.
 */
export function SectionHead({
  eyebrow,
  title,
  lead,
  as: Tag = 'h2',
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <header className="gold-marker mb-10 md:mb-14">
      {eyebrow && (
        <p className="mb-2 text-200 font-medium tracking-wide text-text-subtle">{eyebrow}</p>
      )}
      <Tag className={Tag === 'h1' ? 'text-800 md:text-900' : 'text-600 md:text-700'}>{title}</Tag>
      {lead && <p className="mt-4 max-w-(--container-measure) text-500 text-text-muted">{lead}</p>}
    </header>
  )
}
