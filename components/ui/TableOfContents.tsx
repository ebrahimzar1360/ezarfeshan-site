import type { Heading } from '@/lib/content/mdx'
import { TocActiveLink } from './TocActiveLink'

/**
 * Article contents — the sticky column promised in DESIGN-PLAN §8.
 *
 * Two exports rather than one component that renders both layouts, because the
 * two belong in different places in the DOM: the collapsed one sits above the
 * body inside the text column, the sticky one in the grid's second column. A
 * single component could only have put them in one place.
 *
 * Both are server-rendered, so every link works with JavaScript off. Only the
 * "which section am I in" highlight is a client island, and it degrades to a
 * plain link.
 */

/** One or two headings is a list of the obvious; it earns no furniture. */
const MIN_HEADINGS = 3

/** Collapsed, above the body. Below lg only. <details> needs no JavaScript. */
export function TableOfContentsInline({ headings }: { headings: Heading[] }) {
  if (headings.length < MIN_HEADINGS) return null

  return (
    <details className="mb-10 rounded-lg border border-border bg-bg-sunken px-5 py-4 lg:hidden">
      <summary className="cursor-pointer text-300 font-medium text-text">فهرست مطالب</summary>
      <nav aria-label="فهرست مطالب" className="mt-4">
        <TocList headings={headings} />
      </nav>
    </details>
  )
}

/**
 * Sticky, beside the body. In the article grid this is the second column, which
 * under dir="rtl" renders on the left — the arrangement DESIGN-PLAN §8 drew,
 * reached without a `left` or an `order` anywhere.
 *
 * `top-24` is 6rem, matching the scroll-margin already set on .prose h2/h3, so
 * an anchor jump clears the sticky header by exactly the same amount.
 */
export function TableOfContentsSticky({ headings }: { headings: Heading[] }) {
  if (headings.length < MIN_HEADINGS) return null

  return (
    <nav aria-label="فهرست مطالب" className="sticky top-24 hidden lg:block">
      <p className="mb-4 text-200 font-medium tracking-wide text-text-subtle">فهرست مطالب</p>
      <TocList headings={headings} />
    </nav>
  )
}

function TocList({ headings }: { headings: Heading[] }) {
  return (
    <ol className="space-y-2.5 text-200">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.depth === 3 ? 'ps-4' : undefined}>
          <TocActiveLink id={heading.id} text={heading.text} />
        </li>
      ))}
    </ol>
  )
}
