import { EmptyState } from '@/components/ui/EmptyState'
import { getSubscribers } from '@/lib/admin/queries'
import { faNum, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS = {
  PENDING: { label: 'در انتظار تأیید', tone: 'text-accent' },
  CONFIRMED: { label: 'تأییدشده', tone: 'text-link' },
  UNSUBSCRIBED: { label: 'لغو شده', tone: 'text-text-subtle' },
} as const

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()
  const confirmed = subscribers.filter((s) => s.status === 'CONFIRMED').length

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="gold-marker text-700">مشترکین</h1>
        {confirmed > 0 && (
          <a
            href="/api/admin/subscribers-csv"
            className="ms-auto h-11 rounded-md border border-border-strong px-5 text-300 font-medium leading-[2.75rem] text-text no-underline hover:border-accent"
          >
            خروجی CSV ({faNum(confirmed)} تأییدشده)
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          title="هنوز مشترکی نداری"
          body="وقتی کسی از فرم خبرنامه ثبت‌نام کند و ایمیل تأیید را کلیک کند، اینجا می‌آید."
          action={{ label: 'دیدن صفحهٔ خبرنامه', href: '/newsletter' }}
        />
      ) : (
        <>
        {/* Cards below md — same reason as the articles list. */}
        <ul className="space-y-3 md:hidden">
          {subscribers.map((s) => (
            <li key={s.id} className="rounded-lg border border-border bg-bg p-4">
              <p className="latin text-300 text-text">{s.email}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-200">
                <span className={STATUS[s.status].tone}>{STATUS[s.status].label}</span>
                <span aria-hidden className="text-text-subtle">·</span>
                <span className="latin text-text-muted">{s.source ?? '—'}</span>
                <span aria-hidden className="text-text-subtle">·</span>
                <span className="text-text-muted">{formatDate(s.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-lg border border-border bg-bg md:block">
          <table className="w-full text-300">
            <thead>
              <tr className="border-b border-border text-200 text-text-subtle">
                <th className="p-4 text-start font-medium">ایمیل</th>
                <th className="p-4 text-start font-medium">وضعیت</th>
                <th className="p-4 text-start font-medium">منبع</th>
                <th className="p-4 text-start font-medium">ثبت‌نام</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="latin p-4 text-text">{s.email}</td>
                  <td className={`p-4 text-200 ${STATUS[s.status].tone}`}>
                    {STATUS[s.status].label}
                  </td>
                  <td className="latin p-4 text-200 text-text-muted">{s.source ?? '—'}</td>
                  <td className="p-4 text-200 text-text-muted">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  )
}
