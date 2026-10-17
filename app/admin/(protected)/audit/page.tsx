import { guard } from '@/lib/admin/guard'
import { getAuditLog } from '@/lib/admin/queries'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const ACTIONS: Record<string, string> = {
  create: 'ساخت',
  update: 'ویرایش',
  delete: 'حذف',
  reset: 'بازگشت به پیش‌فرض',
  restore: 'برگرداندن نسخه',
  duplicate: 'رونوشت',
  upload: 'بارگذاری',
  password: 'تغییر گذرواژه',
}
const ENTITIES: Record<string, string> = {
  article: 'مقاله',
  page: 'صفحه',
  content: 'متن سایت',
  media: 'رسانه',
  topic: 'موضوع',
  lead: 'درخواست',
  user: 'کاربر',
}

export default async function AuditPage() {
  await guard('audit.view')
  const rows = await getAuditLog()
  return (
    <>
      <h1 className="gold-marker mb-3 text-700">گزارش تغییرات</h1>
      <p className="mb-8 text-300 text-text-muted">۲۰۰ تغییر آخر: چه کسی، چه چیزی را، کی تغییر داد.</p>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-border bg-bg p-6 text-300 text-text-muted">هنوز تغییری ثبت نشده.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-bg">
          <table className="w-full text-200">
            <thead>
              <tr className="border-b border-border text-text-subtle">
                <th className="p-3 text-start font-medium">زمان</th>
                <th className="p-3 text-start font-medium">کاربر</th>
                <th className="p-3 text-start font-medium">کار</th>
                <th className="p-3 text-start font-medium">مورد</th>
                <th className="p-3 text-start font-medium">جزئیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap p-3 text-text-muted">
                    {formatDate(r.createdAt)} ·{' '}
                    {r.createdAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}
                  </td>
                  <td className="p-3">{r.user?.name ?? '—'}</td>
                  <td className="p-3">{ACTIONS[r.action] ?? r.action}</td>
                  <td className="p-3">{ENTITIES[r.entity] ?? r.entity}</td>
                  <td className="p-3 text-text-muted">{r.summary ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
