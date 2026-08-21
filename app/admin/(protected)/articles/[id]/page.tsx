import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { DeleteArticleButton } from '@/components/admin/DeleteArticleButton'
import { getAdminArticle, getAllTopics } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

/** datetime-local wants YYYY-MM-DDTHH:mm in local time, not an ISO string. */
function toLocalInput(d: Date | null): string {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [article, topics] = await Promise.all([getAdminArticle(id), getAllTopics()])
  if (!article) notFound()

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="gold-marker text-700">ویرایش مقاله</h1>
        <div className="ms-auto flex items-center gap-5">
          {article.status === 'PUBLISHED' && (
            <Link href={`/articles/${article.slug}`} target="_blank" className="text-200 no-underline">
              دیدن روی سایت ↗
            </Link>
          )}
          <DeleteArticleButton id={article.id} title={article.title} />
        </div>
      </div>

      <ArticleEditor
        topics={topics.map((t) => ({ id: t.id, name: t.name }))}
        initial={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          status: article.status,
          publishedAt: toLocalInput(article.publishedAt),
          featured: article.featured,
          coverImage: article.coverImage ?? '',
          seoTitle: article.seoTitle ?? '',
          seoDescription: article.seoDescription ?? '',
          topicIds: article.topics.map((t) => t.id),
        }}
      />
    </>
  )
}
