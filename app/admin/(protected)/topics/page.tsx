import { TopicManager } from '@/components/admin/TopicManager'
import { getAllTopics } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
  const topics = await getAllTopics()
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">موضوع‌ها</h1>
      <TopicManager
        topics={topics.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          description: t.description,
          count: t._count.articles,
        }))}
      />
    </>
  )
}
