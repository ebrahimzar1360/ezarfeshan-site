'use client'

import { Container } from '@/components/ui/Container'
import { ErrorState } from '@/components/ui/ErrorState'
import { SectionHead } from '@/components/ui/SectionHead'

/**
 * Error boundary for the public site. Renders inside the (site) layout, so the
 * header and footer survive and the reader is never stranded.
 *
 * `error.message` is never shown. In a Prisma failure it carries the connection
 * string, the failing column, sometimes the row; Next already strips it to a
 * generic string in production, but relying on that to hold in every runtime is
 * not a security decision worth making twice. `digest` is the whole of what a
 * reader can usefully pass on.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container className="py-20 md:py-32">
      <SectionHead as="h1" eyebrow="خطا" title="این صفحه بالا نیامد" />
      <ErrorState
        title="مشکل از سمت سرور بود، نه از کاری که کردی"
        body="صفحه برای لحظه‌ای در دسترس نبود. دوباره تلاش کن؛ اگر باز هم نشد، از فهرست مقالات وارد شو."
        digest={error.digest}
        onRetry={reset}
        action={{ label: 'همهٔ مقالات', href: '/articles' }}
      />
    </Container>
  )
}
