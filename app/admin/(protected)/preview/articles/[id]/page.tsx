import { notFound, redirect } from 'next/navigation'
import { MdxPreview } from '@/components/admin/MdxPreview'
import { guard } from '@/lib/admin/guard'
import { can } from '@/lib/admin/permissions'
import { getAdminArticle } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function PreviewArticle({ params }: { params: Promise<{ id: string }> }) {
  const user = await guard('articles.write')
  const { id } = await params
  const a = await getAdminArticle(id)
  if (!a) notFound()
  if (a.authorId !== user.id && !can(user.role, 'articles.editAny')) redirect('/admin/articles')
  return <MdxPreview title={a.title} excerpt={a.excerpt} body={a.body} note="پیش‌نمایش آخرین نسخهٔ ذخیره‌شده — فقط برای مدیران دیده می‌شود." />
}
