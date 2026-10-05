import type { Metadata } from 'next'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
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
  const channels = [
    { label: 'تلفن', value: site.phone.display, href: site.phone.href, note: site.hours.display, latin: false },
    { label: 'ایمیل', value: site.email, href: `mailto:${site.email}`, note: 'روزانه بررسی می‌شود', latin: true },
    ...socials.map((s) => ({
      label: s.label,
      value: s.handle ?? `${s.label} ←`,
      href: s.href,
      note: null as string | null,
      latin: Boolean(s.handle),
      external: true,
    })),
  ]

  return (
    <>
      <PageHeader
        eyebrow="تماس"
        title="راه‌های ارتباط"
        lead="خودم جواب می‌دهم — نه تیم پشتیبانی، نه ربات."
      />

      <Container className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5 text-400 leading-prose text-text-muted">
            <p>
              اگر مسئله‌ای در کسب‌وکارت داری که می‌خواهی دربارهٔ آن حرف بزنیم، از فرم مشاوره
              شروع کن؛ آن‌جا اطلاعاتی می‌پرسم که بدون آن‌ها جواب دقیقی نمی‌شود داد.
            </p>
            <p>
              برای هر چیز دیگری — یک سؤال کوتاه، پیشنهاد همکاری، یا اصلاح چیزی که در
              نوشته‌هایم اشتباه است — هر کدام از این راه‌ها باز است.
            </p>
            <div className="pt-4">
              <Link
                href="/consult"
                className="inline-flex h-13 items-center justify-center rounded-md bg-solid-bg px-8 text-500 font-medium text-solid-text no-underline transition-colors duration-150 hover:bg-solid-bg-hover"
              >
                درخواست مشاوره
              </Link>
              <p className="mt-3 text-200 text-text-subtle">ظرف ۴۸ ساعت کاری جواب می‌دهم.</p>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {channels.map((c, i) => (
              <li key={c.href} data-reveal style={{ '--d': i % 2 } as CSSProperties} className="flex">
                <a
                  href={c.href}
                  {...('external' in c && c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group panel panel-hover flex w-full flex-col p-6 no-underline"
                >
                  <span className="text-200 text-text-subtle">{c.label}</span>
                  <span className={`mt-2 text-500 font-bold text-text transition-colors duration-150 group-hover:text-link ${c.latin ? 'latin' : ''}`}>
                    {c.value}
                  </span>
                  {c.note && <span className="mt-2 text-200 text-text-subtle">{c.note}</span>}
                </a>
              </li>
            ))}
            <li className="panel p-6 sm:col-span-2">
              <span className="text-200 text-text-subtle">نشانی</span>
              <p className="mt-2 text-500 font-bold">{site.address.display}</p>
            </li>
          </ul>
        </div>

        <p className="mt-12 max-w-(--container-measure) text-300 leading-prose text-text-muted">
          تلفن فقط در ساعت کاری بالا جواب داده می‌شود. واتس‌اپ و ایمیل را روزانه می‌بینم.
          اینستاگرام و لینکدین کندتر — اگر جواب فوری می‌خواهی، ایمیل بزن.
        </p>
      </Container>
    </>
  )
}
