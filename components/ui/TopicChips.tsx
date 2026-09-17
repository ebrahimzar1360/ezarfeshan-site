import Link from 'next/link'
import { faNum } from '@/lib/format'

export type TopicChip = { slug: string; name: string; count: number }

/**
 * Topic row for /articles and /topics/[slug].
 *
 * There is no `?topic=` filter, deliberately. It would flip /articles to dynamic
 * and cost `revalidate = 3600`, it would create a second URL for content that
 * already has a canonical home at /topics/[slug], and it buys nothing a link
 * does not. Rendering the same chips on both pages gives the active state and
 * the in-place switching without any of that: "همه" is active on /articles and
 * links back there from a topic page.
 *
 * Gold appears as a border and a 10% wash, never as the label colour — it is
 * 2.10:1 on paper and an e2e test watches for exactly this mistake.
 */
export function TopicChips({
  topics,
  activeSlug,
}: {
  topics: TopicChip[]
  /** Omit on /articles, where "همه" is the active chip. */
  activeSlug?: string
}) {
  if (topics.length === 0) return null

  const base =
    'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-200 no-underline transition-colors duration-150'
  const on = 'border-accent bg-accent/10 font-medium text-text'
  const off = 'border-border text-text-muted hover:border-border-strong hover:text-text'

  return (
    <nav aria-label="موضوع‌ها" className="mb-10 flex flex-wrap gap-2">
      <Link
        href="/articles"
        aria-current={activeSlug ? undefined : 'page'}
        className={`${base} ${activeSlug ? off : on}`}
      >
        همه
      </Link>

      {topics.map((topic) => {
        const active = topic.slug === activeSlug
        return (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            aria-current={active ? 'page' : undefined}
            className={`${base} ${active ? on : off}`}
          >
            {topic.name}
            <span aria-hidden className="text-text-subtle">
              {faNum(topic.count)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
