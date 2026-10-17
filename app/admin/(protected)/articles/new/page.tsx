import { ArticleEditor, EMPTY_ARTICLE } from '@/components/admin/ArticleEditor'
import { guard } from '@/lib/admin/guard'
import { can } from '@/lib/admin/permissions'
import { getAllTopics } from '@/lib/admin/queries'
import { site } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  const user = await guard('articles.write')
  const topics = await getAllTopics()
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">مقالهٔ جدید</h1>
      <ArticleEditor
        topics={topics.map((t) => ({ id: t.id, name: t.name }))}
        initial={EMPTY_ARTICLE}
        canPublish={can(user.role, 'articles.publish')}
        siteUrl={site.url}
      />
    </>
  )
}
