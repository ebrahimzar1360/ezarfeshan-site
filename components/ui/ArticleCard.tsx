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
          <span className="font-medium text-text-muted">{topic.name}</span>
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

/** The arrow that slides along the reading direction on hover. */
function ReadMore() {
  return (
    <span className="mt-6 inline-flex items-center gap-2 text-300 font-medium text-link">
      خواندن
      <span
        aria-hidden
        className="transition-transform duration-300 ease-brand group-hover:-translate-x-1.5"
      >
        ←
      </span>
    </span>
  )
}

/**
 * Lead article: a large panel, cover on one side and the pitch on the other.
 *
 * `priority` is a prop rather than always-on: this card is the LCP element on
 * the homepage and should preload there, but nowhere else.
 */
export function ArticleCard({
  article,
  priority = false,
}: {
  article: ArticleCardData
  priority?: boolean
}) {
  return (
    <article className="group panel panel-hover overflow-hidden">
      <Link href={`/articles/${article.slug}`} className="block no-underline">
        <div className="overflow-hidden border-b border-border">
          <Image
            src={coverUrl(article)}
            alt={coverAlt(article)}
            width={COVER_RATIO.width}
            height={COVER_RATIO.height}
            sizes="(min-width: 1024px) 44rem, 100vw"
            priority={priority}
            className="w-full transition-transform duration-700 ease-brand group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-7 md:p-9">
          <Meta article={article} />
          <h3 className="mt-4 text-600 font-bold leading-snug text-text transition-colors duration-150 group-hover:text-link md:text-700">
            {article.title}
          </h3>
          <p className="mt-4 max-w-(--container-measure) text-400 leading-prose text-text-muted">
            {article.excerpt}
          </p>
          <ReadMore />
        </div>
      </Link>
    </article>
  )
}

/**
 * Vertical card for grids (/articles). Cover, meta, title, two lines of
 * excerpt. Hairline and a lift on hover — no resting shadow.
 */
export function ArticleTile({ article, priority = false }: { article: ArticleCardData; priority?: boolean }) {
  return (
    <article className="group panel panel-hover flex flex-col overflow-hidden">
      <Link href={`/articles/${article.slug}`} className="flex h-full flex-col no-underline">
        <div className="overflow-hidden border-b border-border">
          <Image
            src={coverUrl(article)}
            alt={coverAlt(article)}
            width={COVER_RATIO.width}
            height={COVER_RATIO.height}
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="w-full transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <Meta article={article} />
          <h3 className="mt-3 text-500 font-bold leading-snug text-text transition-colors duration-150 group-hover:text-link">
            {article.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-300 leading-normal text-text-muted">{article.excerpt}</p>
          <div className="mt-auto">
            <ReadMore />
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * Compact row: index number, title, meta, small cover. Used beside the lead
 * card on the homepage and for related / topic lists.
 */
export function ArticleListItem({ article, index }: { article: ArticleCardData; index?: number }) {
  return (
    <article className="group border-b border-border last:border-b-0">
      <Link
        href={`/articles/${article.slug}`}
        className="-mx-3 grid grid-cols-[1fr_auto] items-start gap-x-5 rounded-lg px-3 py-6 no-underline transition-colors duration-200 hover:bg-bg-raised sm:grid-cols-[auto_1fr_7rem]"
      >
        {index !== undefined && (
          <span aria-hidden className="hidden pt-0.5 text-600 font-black text-border-strong transition-colors duration-200 group-hover:text-text sm:block">
            {faNum(index).padStart(2, '۰')}
          </span>
        )}
        <div className={index === undefined ? 'sm:col-span-2' : ''}>
          <h3 className="text-500 font-bold leading-snug text-text transition-colors duration-150 group-hover:text-link">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-(--container-measure) text-300 leading-normal text-text-muted">
            {article.excerpt}
          </p>
          <div className="mt-3">
            <Meta article={article} />
          </div>
        </div>
        <Image
          src={coverUrl(article, 'thumb')}
          alt={coverAlt(article)}
          width={COVER_RATIO.width}
          height={COVER_RATIO.height}
          sizes="7rem"
          loading="lazy"
          className="hidden w-full self-start rounded-md border border-border sm:block"
        />
      </Link>
    </article>
  )
}
