'use client'

import { ErrorState } from '@/components/ui/ErrorState'

/**
 * Error boundary for the admin panel. Separate from the site one because the
 * admin has its own chrome and its own reader: the person who can actually do
 * something about a broken query, and who needs the digest more than a visitor
 * does.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto w-full max-w-(--container-page) px-6 py-16">
      <h1 className="mb-8 text-700">خطا در پنل</h1>
      <ErrorState
        title="این صفحه بالا نیامد"
        body="احتمالاً اتصال به دیتابیس قطع شده. دوباره تلاش کن؛ اگر ادامه داشت، لاگ سرور را ببین."
        digest={error.digest}
        onRetry={reset}
        action={{ label: 'داشبورد', href: '/admin' }}
      />
    </main>
  )
}
