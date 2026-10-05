import type { ReactNode } from 'react'

/**
 * Section heading carrying the gold marker on its inline-start edge — the
 * device recovered from the printed brand guide. See docs/DESIGN-PLAN.md §6.
 * v2: heavier, larger titles; the block reveals on scroll.
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
    <header className="gold-marker mb-10 md:mb-14" data-reveal>
      {eyebrow && <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">{eyebrow}</p>}
      <Tag
        className={`font-extrabold leading-tight ${
          Tag === 'h1' ? 'text-display-sm' : 'text-700 md:text-800'
        }`}
      >
        {title}
      </Tag>
      {lead && <p className="mt-5 max-w-(--container-measure) text-500 leading-normal text-text-muted">{lead}</p>}
    </header>
  )
}
