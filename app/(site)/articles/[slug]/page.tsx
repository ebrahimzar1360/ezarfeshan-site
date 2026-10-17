import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArticleJsonLd } from '@/components/seo/JsonLd'
import { ReferencesNote } from '@/components/site/ReferencesNote'
import { ArticleGrid } from '@/components/ui/ArticleGrid'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import {
  TableOfContentsInline,
  TableOfContentsSticky,
} from '@/components/ui/TableOfContents'
import { Container } from '@/components/ui/Container'
import { DraftNotice } from '@/components/ui/DraftNotice'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import { ShareRow } from '@/components/ui/ShareRow'
import { createMdxComponents } from '@/components/ui/mdx'
import { extractHeadings, hasDraftMarker, prepareMdx } from '@/lib/content/mdx'
import { getArticleBySlug, getPublishedArticles, getRelatedArticles } from '@/lib/content/queries'
import { faNum, formatDate } from '@/lib/format'
import { Inline } from '@/components/cms/Inline'
import { getSection } from '@/lib/cms/content'
import { absoluteUrl, ogFallback } from '@/lib/cms/metadata'
import { getIdentity } from '@/lib/cms/site'
import { site } from '@/lib/site'

export const revalidate = 3600

/**
 * Articles published from the admin after the last build must render on demand,
 * not 404 until someone redeploys. Next defaults this to true, but leaving it
 * implicit is how a CMS silently stops publishing — the value is stated so the
 * behaviour is a decision rather than a default nobody checked.
 */
export const dynamicParams = true


/** The share image: the article's own OG image, else its cover, else the generated card. */
function shareImage(article: { title: string; ogImage: string | null; coverImage: string | null }) {
  const own = article.ogImage || article.coverImage
  return own ? absoluteUrl(own) : ogFallback(article.title, 'مقاله')
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const identity = await getIdentity()
  const image = shareImage(article)
  const description = article.seoDescription ?? article.excerpt

  return {
    title: article.seoTitle ?? article.title,
    description,
    alternates: { canonical: article.canonicalUrl || `/articles/${article.slug}` },
    ...(article.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'article',
      title: article.seoTitle ?? article.title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author?.name ?? identity.name],
      tags: article.topics.map((t) => t.name),
      images: [{ url: image, alt: article.coverAlt || article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle ?? article.title,
      description,
      images: [image],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const topicSlugs = article.topics.map((t) => t.slug)
  const [related, identity, author, copy] = await Promise.all([
    getRelatedArticles(article.slug, topicSlugs),
    getIdentity(),
    getSection('misc.author'),
    getSection('articles.index'),
  ])
  const authorName = article.author?.name ?? identity.name
  const portrait = identity.portrait.src ? identity.portrait : null
  const url = `${site.url}/articles/${article.slug}`
  const headings = extractHeadings(article.body)

  // One array drives both the visible trail and the BreadcrumbList JSON-LD, so
  // the two can never drift apart.
  const trail = [
    { name: 'مقالات', path: '/articles' },
    ...(article.topics[0]
      ? [{ name: article.topics[0].name, path: `/topics/${article.topics[0].slug}` }]
      : []),
    { name: article.title, path: `/articles/${article.slug}` },
  ]

  return (
    <article>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        readingMinutes={article.readingMinutes}
        topics={article.topics}
        image={shareImage(article)}
      />
      <header className="bp-grid relative overflow-hidden border-b border-border bg-bg-band">
        <Container className="py-12 md:py-20">
          <Breadcrumb trail={trail} />
          <div className="mt-10 max-w-4xl">
            {article.topics[0] && (
              <Link
                href={`/topics/${article.topics[0].slug}`}
                className="enter inline-flex rounded-md border border-border-strong bg-bg-raised px-3 py-1 text-200 font-medium text-text no-underline transition-colors duration-150 hover:border-accent"
              >
                {article.topics[0].name}
              </Link>
            )}
            <h1 className="enter mt-5 text-display-sm font-black leading-[1.25]" style={{ animationDelay: '80ms' }}>
              {article.title}
            </h1>
            <p className="enter mt-6 max-w-(--container-measure) text-500 leading-normal text-text-muted" style={{ animationDelay: '160ms' }}>
              {article.excerpt}
            </p>
            <div className="enter mt-8 flex items-center gap-4" style={{ animationDelay: '240ms' }}>
              {portrait && (
                <Image
                  src={portrait.src}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-lg border border-border object-cover"
                />
              )}
              <div>
                <p className="text-300 font-bold text-text">{authorName}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-200 text-text-subtle">
                  <span>{faNum(article.readingMinutes)} دقیقه مطالعه</span>
                  {article.publishedAt && (
                    <>
                      <span aria-hidden>·</span>
                      <time dateTime={article.publishedAt.toISOString()}>
                        {formatDate(article.publishedAt)}
                      </time>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {article.coverImage && (
        <Container className="pt-10 md:pt-14">
          <figure className="max-w-4xl">
            <Image
              src={article.coverImage}
              alt={article.coverAlt ?? ''}
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 56rem, 100vw"
              priority
              className="aspect-[16/9] w-full rounded-xl border border-border object-cover"
            />
          </figure>
        </Container>
      )}

      {/* Two columns from lg up. The contents sits in the *second* grid column,
          which under dir="rtl" renders on the left — the arrangement
          DESIGN-PLAN §8 drew, reached without a single `left` or `order`.

          The body column keeps its own wrapper untouched: the gold reading rail
          is positioned against that div, so moving or resizing it would stretch
          the rail across the contents as well. */}
      <Container className="relative py-14 md:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,var(--container-measure))_1fr] lg:gap-16">
          <div className="relative ps-6 md:ps-8">
            <ReadingProgress />
            {hasDraftMarker(article.body) && <DraftNotice />}
            <TableOfContentsInline headings={headings} />
            <div className="prose">
              <MDXRemote source={prepareMdx(article.body)} components={createMdxComponents()} />
            </div>
          </div>

          <TableOfContentsSticky headings={headings} />
        </div>
      </Container>

      <Container className="pb-10">
        <ReferencesNote className="max-w-4xl" />
      </Container>

      <Container className="pb-16">
        <div className="max-w-(--container-measure) border-t border-border pt-8">
          <ShareRow url={url} title={article.title} />
        </div>
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="tone-inverse tone-deep bp-grid relative grid max-w-4xl items-center gap-8 overflow-hidden rounded-xl p-8 sm:grid-cols-[auto_1fr] md:p-10">
            {portrait && (
              <Image
                src={portrait.src}
                alt=""
                width={112}
                height={112}
                className="size-24 rounded-xl border border-border object-cover md:size-28"
              />
            )}
            <div>
              {author.eyebrow && <p className="eyebrow">{author.eyebrow}</p>}
              <p className="mt-3 text-600 font-bold">{authorName}</p>
              <p className="mt-1 text-300 text-text-muted">{identity.role}</p>
              <p className="mt-4 text-300 leading-prose text-text-muted">
                <Inline text={author.bio || identity.description} />
              </p>
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {[author.primary, author.secondary]
                  .filter((l) => l.label && l.href)
                  .map((l) => (
                    <Link key={l.href} href={l.href} className="text-300 font-medium">
                      {l.label}
                    </Link>
                  ))}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-bg-band py-16 md:py-24">
          <Container>
            <h2 className="gold-marker mb-10 text-700 font-black">{copy.relatedTitle}</h2>
            <ArticleGrid items={related} />
          </Container>
        </section>
      )}
    </article>
  )
}
