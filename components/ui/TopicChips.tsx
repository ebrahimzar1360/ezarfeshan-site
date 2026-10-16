import Link from 'next/link'

export type TopicChip = { slug: string; name: string; count?: number }

/**
 * Category row for /articles and /topics/[slug].
 *
 * There is no `?topic=` filter, deliberately. It would flip /articles to dynamic
 * and cost `revalidate = 3600`, it would create a second URL for content that
 * already has a canonical home at /topics/[slug], and it buys nothing a link
 * does not. Rendering the same chips on both pages gives the active state and
 * the in-place switching without any of that: "همه" is active on /articles and
 * links back there from a topic page.
 *
 * v3: the six categories always show, with or without articles in them, and the
 * row scrolls sideways on a phone instead of wrapping to several lines. The
 * active chip is forest with paper text; gold is never the label colour (2.10:1
 * on paper — an e2e test watches for exactly this mistake).
 */
export function TopicChips({
  topics,
  activeSlug,
  current = true,
}: {
  topics: TopicChip[]
  /** Omit on /articles, where "همه" is the active chip. */
  activeSlug?: string
  /**
   * Whether one of these chips represents the page being viewed — false where
   * nothing is a topic listing, so a screen reader is not told it is on a page
   * it is not on.
   */
  current?: boolean
}) {
  if (topics.length === 0) return null

  const base =
    'inline-flex flex-none items-center rounded-lg border px-4 py-2 text-300 no-underline transition-colors duration-150'
  const on = 'border-forest bg-forest font-bold text-paper hover:text-paper'
  const off = 'border-border-strong bg-bg-raised text-text-muted hover:border-forest hover:text-text'

  return (
    <nav
      aria-label="موضوع‌ها"
      className="scroll-x -mx-[clamp(1.25rem,5vw,4rem)] mb-10 flex gap-2 px-[clamp(1.25rem,5vw,4rem)] pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      <Link
        href="/articles"
        aria-current={current && !activeSlug ? 'page' : undefined}
        className={`${base} ${current && !activeSlug ? on : off}`}
      >
        همه
      </Link>

      {topics.map((topic) => {
        const active = topic.slug === activeSlug
        return (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            aria-current={current && active ? 'page' : undefined}
            className={`${base} ${current && active ? on : off}`}
          >
            {topic.name}
          </Link>
        )
      })}
    </nav>
  )
}
