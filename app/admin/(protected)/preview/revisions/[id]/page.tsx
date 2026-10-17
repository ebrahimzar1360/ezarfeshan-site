import { notFound, redirect } from 'next/navigation'
import { MdxPreview } from '@/components/admin/MdxPreview'
import { guard } from '@/lib/admin/guard'
import { can } from '@/lib/admin/permissions'
import { getRevision } from '@/lib/admin/queries'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PreviewRevision({ params }: { params: Promise<{ id: string }> }) {
  const user = await guard('articles.write')
  const { id } = await params
  const r = await getRevision(id)
  if (!r) notFound()
  if (r.article.authorId !== user.id && !can(user.role, 'articles.editAny')) redirect('/admin/articles')
  return (
    <MdxPreview
      title={r.title}
      excerpt={r.excerpt}
      body={r.body}
      note={`نسخهٔ ${formatDate(r.createdAt)} از «${r.article.title}». برای برگرداندنش از صفحهٔ ویرایش مقاله استفاده کن.`}
    />
  )
}
