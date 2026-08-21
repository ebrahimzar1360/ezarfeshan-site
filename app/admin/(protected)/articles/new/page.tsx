import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { getAllTopics } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  const topics = await getAllTopics()
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">مقالهٔ جدید</h1>
      <ArticleEditor
        topics={topics.map((t) => ({ id: t.id, name: t.name }))}
        initial={{
          slug: '',
          title: '',
          excerpt: '',
          body: '',
          status: 'DRAFT',
          publishedAt: '',
          featured: false,
          coverImage: '',
          seoTitle: '',
          seoDescription: '',
          topicIds: [],
        }}
      />
    </>
  )
}
