import { MediaBrowser } from '@/components/admin/media/MediaBrowser'
import { guard } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  await guard('media.upload')
  return (
    <>
      <h1 className="gold-marker mb-3 text-700">رسانه</h1>
      <p className="mb-8 max-w-3xl text-300 leading-prose text-text-muted">
        همهٔ تصویرها و فایل‌های سایت. برای هر تصویر متن جایگزین بنویس — هم برای کسی که صفحه را با صفحه‌خوان می‌شنود و هم
        برای جست‌وجوی تصاویر. فایلی که جایی استفاده شده حذف نمی‌شود.
      </p>
      <MediaBrowser />
    </>
  )
}
