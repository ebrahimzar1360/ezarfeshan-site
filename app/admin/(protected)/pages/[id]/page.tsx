import { notFound } from 'next/navigation'
import { PageEditor } from '@/components/admin/PageEditor'
import { guard } from '@/lib/admin/guard'
import { getAdminPage } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await guard('pages.manage')
  const { id } = await params
  const p = await getAdminPage(id)
  if (!p) notFound()
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">ویرایش صفحه</h1>
      <PageEditor
        initial={{
          id: p.id,
          slug: p.slug,
          title: p.title,
          lead: p.lead ?? '',
          body: p.body,
          status: p.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          seoTitle: p.seoTitle ?? '',
          seoDescription: p.seoDescription ?? '',
          ogImage: p.ogImage ?? '',
          noindex: p.noindex,
        }}
      />
    </>
  )
}
