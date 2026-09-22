import Image from 'next/image'
import Link from 'next/link'
import { COVER_RATIO, coverAlt, coverUrl } from '@/lib/content/cover'
import type { ArticleCardData } from '@/lib/content/queries'
import { faNum, formatDate } from '@/lib/format'

function Meta({ article }: { article: ArticleCardData }) {
  const topic = article.topics[0]
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-200 text-text-subtle">
      {topic && (
        <>
          <span>{topic.name}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <span>{faNum(article.readingMinutes)} دقیقه</span>
      {article.publishedAt && (
        <>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatDate(article.publishedAt)}
          </time>
        </>
      )}
    </p>
  )
}

/**
 * Lead article: wider, with the cover above the heading.
 *
 * `priority` is a prop rather than always-on: this card is the LCP element on
 * the homepage and should preload there, but the same component appears further
 * down other pages where preloading it would compete with the real LCP.
 */
export function ArticleCard({
  article,
  priority = false,
}: {
  article: ArticleCardData
  priority?: boolean
}) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block no-underline">
        <Image
          src={coverUrl(article)}
          alt={coverAlt(article)}
          width={COVER_RATIO.width}
          height={COVER_RATIO.height}
          sizes="(min-width: 1216px) 76rem, 100vw"
          priority={priority}
          className="mb-7 w-full rounded-lg border border-border"
        />
        <h3 className="text-600 font-bold text-text transition-colors duration-150 group-hover:text-link md:text-700">
          {article.title}
        </h3>
        <p className="mt-4 max-w-(--container-measure) text-400 leading-prose text-text-muted">
          {article.excerpt}
        </p>
        <div className="mt-5">
          <Meta article={article} />
        </div>
      </Link>
    </article>
  )
}

/**
 * Secondary articles: a list, separated by a hairline, not a row of equal cards.
 *
 * The thumbnail is a deliberate compromise. DESIGN-PLAN §7.3 argues these should
 * stay pure text, and §10 bans the equal-card wall by name — so the row stays a
 * row: no frame, no shadow, the same border-t and the same py-7, with the image
 * as a second grid column rather than a card face. It is also dropped entirely
 * below sm, where a list of headings reads better than a column of small
 * pictures.
 */
export function ArticleListItem({ article }: { article: ArticleCardData }) {
  return (
    <article className="group border-t border-border">
      <Link
        href={`/articles/${article.slug}`}
        className="grid grid-cols-1 gap-x-6 py-7 no-underline sm:grid-cols-[1fr_8rem]"
      >
        <div>
          <h3 className="text-500 font-bold text-text transition-colors duration-150 group-hover:text-link">
            {article.title}
          </h3>
          <p className="mt-2.5 max-w-(--container-measure) text-300 leading-normal text-text-muted">
            {article.excerpt}
          </p>
          <div className="mt-4">
            <Meta article={article} />
          </div>
        </div>

        <Image
          src={coverUrl(article, 'thumb')}
          alt={coverAlt(article)}
          width={COVER_RATIO.width}
          height={COVER_RATIO.height}
          sizes="8rem"
          loading="lazy"
          className="hidden h-auto w-full self-start rounded-md border border-border sm:block"
        />
      </Link>
    </article>
  )
}
