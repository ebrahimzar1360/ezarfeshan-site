import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { ArticleTools } from '@/components/admin/ArticleTools'
import { DeleteArticleButton } from '@/components/admin/DeleteArticleButton'
import { guard } from '@/lib/admin/guard'
import { can } from '@/lib/admin/permissions'
import { getAdminArticle, getAllTopics, getArticleRevisions } from '@/lib/admin/queries'
import { site } from '@/lib/site'

export const dynamic = 'force-dynamic'

/**
 * Sent as an ISO instant. The editor turns it into the browser's wall-clock
 * time for datetime-local, and back into an instant on save — the server's
 * own zone (UTC in the container) never enters into it.
 */
function toIso(d: Date | null): string {
  return d ? d.toISOString() : ''
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await guard('articles.write')
  const { id } = await params
  const [article, topics, revisions] = await Promise.all([getAdminArticle(id), getAllTopics(), getArticleRevisions(id)])
  if (!article) notFound()
  if (article.authorId !== user.id && !can(user.role, 'articles.editAny')) redirect('/admin/articles')

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="gold-marker text-700">ویرایش مقاله</h1>
        <div className="ms-auto flex flex-wrap items-center gap-5">
          {article.status === 'PUBLISHED' && (
            <Link href={`/articles/${article.slug}`} target="_blank" className="text-200 no-underline">
              دیدن روی سایت ↗
            </Link>
          )}
          {can(user.role, 'articles.publish') && <DeleteArticleButton id={article.id} title={article.title} />}
        </div>
      </div>

      <ArticleEditor
        topics={topics.map((t) => ({ id: t.id, name: t.name }))}
        canPublish={can(user.role, 'articles.publish')}
        siteUrl={site.url}
        initial={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          status: article.status,
          publishedAt: toIso(article.publishedAt),
          featured: article.featured,
          coverImage: article.coverImage ?? '',
          coverAlt: article.coverAlt ?? '',
          ogImage: article.ogImage ?? '',
          canonicalUrl: article.canonicalUrl ?? '',
          noindex: article.noindex,
          seoTitle: article.seoTitle ?? '',
          seoDescription: article.seoDescription ?? '',
          topicIds: article.topics.map((t) => t.id),
        }}
      />

      <ArticleTools
        articleId={article.id}
        author={article.author?.name ?? null}
        createdAt={article.createdAt.toISOString()}
        updatedAt={article.updatedAt.toISOString()}
        revisions={revisions.map((r) => ({
          id: r.id,
          title: r.title,
          createdAt: r.createdAt.toISOString(),
          by: r.author?.name ?? null,
          words: r.body.trim().split(/\s+/).filter(Boolean).length,
        }))}
      />
    </>
  )
}
