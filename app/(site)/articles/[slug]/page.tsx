import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArticleJsonLd } from '@/components/seo/JsonLd'
import { ArticleListItem } from '@/components/ui/ArticleCard'
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
import { site } from '@/lib/site'

export const revalidate = 3600

/**
 * Articles published from the admin after the last build must render on demand,
 * not 404 until someone redeploys. Next defaults this to true, but leaving it
 * implicit is how a CMS silently stops publishing — the value is stated so the
 * behaviour is a decision rather than a default nobody checked.
 */
export const dynamicParams = true


/** Absolute, because Open Graph consumers do not resolve relative URLs. */
function ogUrl(title: string) {
  return `${site.url}/api/og?title=${encodeURIComponent(title)}&kicker=${encodeURIComponent('مقاله')}`
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

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [site.name],
      images: [{ url: ogUrl(article.title), width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogUrl(article.title)],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const topicSlugs = article.topics.map((t) => t.slug)
  const related = await getRelatedArticles(article.slug, topicSlugs)
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
      />
      <Container className="py-14 md:py-20">
        <Breadcrumb trail={trail} />

        <header className="max-w-(--container-measure)">
          <h1 className="text-800 md:text-900">{article.title}</h1>
          <p className="mt-5 text-500 leading-snug text-text-muted">{article.excerpt}</p>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-200 text-text-subtle">
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
        </header>
      </Container>

      {/* Two columns from lg up. The contents sits in the *second* grid column,
          which under dir="rtl" renders on the left — the arrangement
          DESIGN-PLAN §8 drew, reached without a single `left` or `order`.

          The body column keeps its own wrapper untouched: the gold reading rail
          is positioned against that div, so moving or resizing it would stretch
          the rail across the contents as well. */}
      <Container className="relative pb-16 md:pb-24">
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

      <Container className="pb-16">
        <div className="max-w-(--container-measure) border-t border-border pt-8">
          <ShareRow url={url} title={article.title} />
        </div>
      </Container>

      <section className="tone-inverse bg-forest py-16 md:py-24">
        <Container>
          <div className="max-w-(--container-measure)">
            <p className="text-200 font-medium tracking-wide text-text-subtle">نویسنده</p>
            <p className="mt-3 text-500 font-bold">{site.name}</p>
            <p className="mt-2 text-300 text-text-muted">{site.role}</p>
            <p className="mt-5 text-300 leading-prose text-text-muted">{site.description}</p>
            <p className="mt-6">
              <Link href="/about" className="text-300 font-medium">
                دربارهٔ من ←
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="gold-marker mb-8 text-600">خواندن بعدی</h2>
            <div>
              {related.map((a) => (
                <ArticleListItem key={a.slug} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  )
}
