import type { Metadata } from 'next'
import { UnsubscribeForm } from '@/components/site/UnsubscribeForm'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = { title: 'لغو عضویت', robots: { index: false } }

/**
 * The emailed unsubscribe link opens this page rather than unsubscribing on
 * sight. Mail clients and security scanners pre-fetch links; a GET that
 * unsubscribes would drop people who never clicked. One button, one POST.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <div className="bp-grid bg-bg-band">
    <Container width="measure" className="py-24 md:py-36">
      <div className="panel p-8 shadow-(--shadow) md:p-12">
      <div className="gold-marker">
        <h1 className="text-700">لغو عضویت</h1>
      </div>
      {token ? (
        <UnsubscribeForm token={token} />
      ) : (
        <p className="mt-5 text-400 leading-prose text-text-muted">
          این نشانی توکن ندارد. لینک لغو عضویت را از انتهای یکی از ایمیل‌های خبرنامه باز کن.
        </p>
      )}
      </div>
    </Container>
    </div>
  )
}
