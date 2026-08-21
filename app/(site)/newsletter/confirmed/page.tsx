import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = { title: 'تأیید عضویت', robots: { index: false } }

/**
 * Landing page for the confirmation link. Every branch says what happened and
 * what to do next — "مشکلی پیش آمد" on its own is not acceptable.
 */
const STATES: Record<string, { title: string; body: string; cta?: { label: string; href: string } }> = {
  confirmed: {
    title: 'عضویتت تأیید شد',
    body: 'از این به بعد هر دو هفته یک نوشته دریافت می‌کنی. اولین ایمیل تأیید هم برایت فرستاده شد.',
    cta: { label: 'شروع از مقالات', href: '/articles' },
  },
  already: {
    title: 'قبلاً تأیید شده بود',
    body: 'این نشانی از قبل عضو خبرنامه است. کار دیگری لازم نیست.',
    cta: { label: 'شروع از مقالات', href: '/articles' },
  },
  invalid: {
    title: 'این لینک کار نمی‌کند',
    body: 'لینک تأیید یک‌بار‌مصرف است و ممکن است قبلاً استفاده شده باشد. اگر هنوز عضو نشده‌ای، دوباره ثبت‌نام کن.',
    cta: { label: 'ثبت‌نام دوباره', href: '/newsletter' },
  },
  error: {
    title: 'تأیید انجام نشد',
    body: 'مشکلی در سرور پیش آمد و عضویتت ثبت نشد. چند دقیقهٔ دیگر دوباره روی لینک ایمیل کلیک کن.',
    cta: { label: 'صفحهٔ خبرنامه', href: '/newsletter' },
  },
}

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const state = STATES[status ?? ''] ?? STATES.invalid!

  return (
    <Container width="measure" className="py-24 md:py-32">
      <div className="gold-marker">
        <h1 className="text-700">{state.title}</h1>
      </div>
      <p className="mt-5 text-400 leading-prose text-text-muted">{state.body}</p>
      {state.cta && (
        <p className="mt-8">
          <Link href={state.cta.href} className="text-300 font-medium">
            {state.cta.label} ←
          </Link>
        </p>
      )}
    </Container>
  )
}
