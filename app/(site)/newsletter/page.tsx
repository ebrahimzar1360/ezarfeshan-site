import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { NewsletterForm } from '@/components/site/NewsletterForm'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'خبرنامه',
  description: 'هر دو هفته یک نوشته دربارهٔ سیستم‌سازی و مدیریت عملیات. بدون تبلیغ.',
}

const PROMISES = [
  { k: 'ریتم', v: 'یک ایمیل هر دو هفته — نه بیشتر.' },
  {
    k: 'موضوع',
    v: 'سیستم‌سازی، مستندسازی فرایند، شاخص‌های عملیاتی، استفادهٔ عملی از هوش مصنوعی.',
  },
  { k: 'خروج', v: 'لینک لغو عضویت در هر ایمیل. یک کلیک، بدون سؤال.' },
]

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        tone="deep"
        eyebrow="خبرنامه"
        title={
          <>
            هر دو هفته، <span className="text-gold-light">یک نوشته</span>
          </>
        }
        lead="یک مسئلهٔ عملیاتی و راهی که جواب داده. نه تبلیغ، نه خلاصهٔ کتاب، نه فهرست «۱۰ نکته»."
        aside={
          <div className="panel enter bg-bg-raised/70 p-6 backdrop-blur-md md:p-8" style={{ animationDelay: '300ms' }}>
            <p className="mb-5 text-400 font-bold text-text">عضویت رایگان</p>
            <NewsletterForm source="newsletter" tone="inverse" />
          </div>
        }
      />

      <Container className="py-16 md:py-24">
        <p className="max-w-(--container-measure) text-500 leading-normal text-text-muted" data-reveal>
          اگر مدیری هستی که کسب‌وکارش بدون خودش از حرکت می‌ایستد، این نوشته‌ها برای توست.
        </p>
        <h2 className="mt-14 text-600 font-bold" data-reveal>
          چه چیزی دریافت می‌کنی
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {PROMISES.map((p, i) => (
            <li key={p.k} className="panel p-7" data-reveal style={{ '--d': i } as CSSProperties}>
              <span className="grid size-11 place-items-center rounded-lg border border-border-strong text-400 font-black">
                {['۱', '۲', '۳'][i]}
              </span>
              <p className="mt-5 text-400 font-bold text-text">{p.k}</p>
              <p className="mt-2 text-300 leading-prose text-text-muted">{p.v}</p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
