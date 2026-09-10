import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { site, socials } from '@/lib/site'

export const metadata: Metadata = {
  title: 'تماس',
  description: 'راه‌های ارتباط مستقیم با ابراهیم زرفشان.',
  alternates: { canonical: '/contact' },
}

/**
 * The footer linked to `/contact` before this page existed. It deliberately
 * does not repeat the consultation form: a second form would split the same
 * request across two inboxes. This page routes — the form is on `/consult`.
 *
 * Every channel here comes from `lib/site.ts`, so an address is never written
 * twice and a link that is not confirmed simply does not render.
 */
export default function ContactPage() {
  return (
    <>
      <Container width="measure" className="py-16 md:py-24">
        <div className="gold-marker">
          <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">تماس</p>
          <h1 className="text-800">راه‌های ارتباط</h1>
        </div>

        <div className="mt-8 space-y-5 text-400 leading-prose text-text-muted">
          <p>
            خودم جواب می‌دهم — نه تیم پشتیبانی، نه ربات. اگر مسئله‌ای در کسب‌وکارت داری
            که می‌خواهی دربارهٔ آن حرف بزنیم، از فرم مشاوره شروع کن؛ آن‌جا اطلاعاتی
            می‌پرسم که بدون آن‌ها جواب دقیقی نمی‌شود داد.
          </p>
          <p>
            برای هر چیز دیگری — یک سؤال کوتاه، پیشنهاد همکاری، یا اصلاح چیزی که در
            نوشته‌هایم اشتباه است — هر کدام از این راه‌ها باز است.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/consult"
            className="inline-flex h-13 items-center justify-center rounded-md bg-solid-bg px-8 text-500 font-medium text-solid-text no-underline transition-colors duration-150 hover:bg-solid-bg-hover"
          >
            درخواست مشاوره
          </Link>
          <p className="mt-3 text-200 text-text-subtle">
            ظرف ۴۸ ساعت کاری جواب می‌دهم.
          </p>
        </div>
      </Container>

      <section className="tone-inverse bg-forest py-16 md:py-24">
        <Container width="measure">
          <h2 className="text-600">مستقیم</h2>
          <ul className="mt-6">
            <li className="border-t border-border py-5">
              <p className="text-200 text-text-subtle">ایمیل</p>
              <a href={`mailto:${site.email}`} className="latin mt-1.5 block text-400">
                {site.email}
              </a>
            </li>
            {socials.map((s) => (
              <li key={s.href} className="border-t border-border py-5">
                <p className="text-200 text-text-subtle">{s.label}</p>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block text-400"
                >
                  {s.handle ? <span className="latin">{s.handle}</span> : `${s.label} ←`}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-300 leading-prose text-text-muted">
            واتس‌اپ و ایمیل را روزانه می‌بینم. اینستاگرام و لینکدین کندتر — اگر جواب
            فوری می‌خواهی، ایمیل بزن.
          </p>
        </Container>
      </section>
    </>
  )
}
