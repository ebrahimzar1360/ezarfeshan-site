import Link from 'next/link'
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

/** Lead article: wider, with room for a real cover once one exists. */
export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block no-underline">
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
 * Secondary articles render as list rows, not as a row of equal icon cards —
 * that shape is on the banned list and a list reads better anyway. Separated by
 * a hairline rather than boxed.
 */
export function ArticleListItem({ article }: { article: ArticleCardData }) {
  return (
    <article className="group border-t border-border">
      <Link href={`/articles/${article.slug}`} className="block py-7 no-underline">
        <h3 className="text-500 font-bold text-text transition-colors duration-150 group-hover:text-link">
          {article.title}
        </h3>
        <p className="mt-2.5 max-w-(--container-measure) text-300 leading-normal text-text-muted">
          {article.excerpt}
        </p>
        <div className="mt-4">
          <Meta article={article} />
        </div>
      </Link>
    </article>
  )
}
