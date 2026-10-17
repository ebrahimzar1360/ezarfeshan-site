import { EMPTY_PAGE, PageEditor } from '@/components/admin/PageEditor'
import { guard } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

export default async function NewPage() {
  await guard('pages.manage')
  return (
    <>
      <h1 className="gold-marker mb-8 text-700">صفحهٔ جدید</h1>
      <PageEditor initial={EMPTY_PAGE} />
    </>
  )
}
