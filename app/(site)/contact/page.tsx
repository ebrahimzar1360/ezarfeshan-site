import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/site/ContactForm'
import { PageBand } from '@/components/site/PageBand'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { site, socials } from '@/lib/site'

export const metadata: Metadata = {
  title: 'تماس',
  description: 'برای گفت‌وگو آماده‌ام — ایمیل، لینکدین، واتس‌اپ، اینستاگرام یا فرم پیام.',
  alternates: { canonical: '/contact' },
}

/**
 * The most minimal page: four ways to reach me, four form fields. No telephone
 * and no street address — removed at the owner's request (1405/07/24). Every
 * destination comes from lib/site.ts so none is written twice.
 */
export default function ContactPage() {
  const href = (label: string) => socials.find((s) => s.label === label)?.href

  const channels: { icon: IconName; label: string; value: string; href: string; latin: boolean }[] = [
    { icon: 'mail', label: 'ایمیل', value: site.email, href: `mailto:${site.email}`, latin: true },
    {
      icon: 'linkedin',
      label: 'لینکدین',
      value: `www.${site.linkedinDisplay}`,
      href: href('لینکدین') ?? '/contact',
      latin: true,
    },
    {
      icon: 'whatsapp',
      label: 'واتس‌اپ',
      value: site.whatsapp.display,
      href: href('واتس‌اپ') ?? '/contact',
      latin: false,
    },
    {
      icon: 'instagram',
      label: 'اینستاگرام',
      value: site.instagramHandle,
      href: href('اینستاگرام') ?? '/contact',
      latin: true,
    },
  ]

  return (
    <>
      <PageBand
        title="برای گفت‌وگو آماده‌ام"
        lead="اگر فکر می‌کنید کسب‌وکار شما به نظم بیشتر، سیستم بهتر یا استفاده کاربردی‌تر از هوش مصنوعی نیاز دارد، می‌توانیم گفت‌وگو را شروع کنیم."
      />

      <Container className="py-12 md:py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
          <section aria-labelledby="channels-title" className="card-v3 p-6 md:p-8" data-reveal>
            <h2 id="channels-title" className="text-600 font-extrabold">
              راه‌های ارتباط
            </h2>
            <ul className="mt-6 divide-y divide-border">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-4 py-4 no-underline"
                  >
                    <span
                      aria-hidden
                      className="grid size-12 flex-none place-items-center rounded-xl bg-forest text-500 text-paper transition-colors duration-150 group-hover:bg-emerald"
                    >
                      <Icon name={c.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-200 text-text-subtle">{c.label}</span>
                      <span
                        className={`mt-0.5 block break-all text-300 font-bold text-text transition-colors duration-150 group-hover:text-link ${
                          c.latin ? 'latin' : ''
                        }`}
                      >
                        {c.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="form-title" className="card-v3 p-6 md:p-8" data-reveal>
            <h2 id="form-title" className="text-600 font-extrabold">
              ارسال پیام
            </h2>
            <p className="mt-2 text-300 text-text-muted">
              چند خط بنویسید؛ خودم می‌خوانم و جواب می‌دهم.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-2xl bg-bg-band px-6 py-6 md:px-8" data-reveal>
          <p className="text-400 font-bold">ترجیح می‌دهید مستقیم صحبت کنیم؟</p>
          <p className="mt-2 max-w-[40rem] text-300 leading-normal text-text-muted">
            می‌توانید از راه‌های ارتباطی بالا با من در تماس باشید. اگر مسئله‌ای را می‌خواهید
            با جزئیات بیشتر مطرح کنید،{' '}
            <Link href="/consult" className="font-medium">
              فرم درخواست مشاوره
            </Link>{' '}
            را پر کنید.
          </p>
        </div>
      </Container>
    </>
  )
}
