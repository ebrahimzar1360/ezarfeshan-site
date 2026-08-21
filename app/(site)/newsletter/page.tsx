import type { Metadata } from 'next'
import { NewsletterForm } from '@/components/site/NewsletterForm'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'خبرنامه',
  description: 'هر دو هفته یک نوشته دربارهٔ سیستم‌سازی و مدیریت عملیات. بدون تبلیغ.',
}

export default function NewsletterPage() {
  return (
    <Container width="measure" className="py-20 md:py-28">
      <div className="gold-marker">
        <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">خبرنامه</p>
        <h1 className="text-800">هر دو هفته، یک نوشته</h1>
      </div>

      <div className="mt-8 space-y-5 text-400 leading-prose text-text-muted">
        <p>
          یک مسئلهٔ عملیاتی و راهی که جواب داده. نه تبلیغ، نه خلاصهٔ کتاب، نه فهرست
          «۱۰ نکته».
        </p>
        <p>
          اگر مدیری هستی که کسب‌وکارش بدون خودش از حرکت می‌ایستد، این نوشته‌ها برای توست.
        </p>
      </div>

      <div className="mt-10">
        <NewsletterForm source="newsletter" />
      </div>

      <div className="mt-14 border-t border-border pt-8">
        <h2 className="text-500 font-bold">چه چیزی دریافت می‌کنی</h2>
        <ul className="mt-5 space-y-3 text-300 leading-prose text-text-muted">
          <li className="border-t border-border pt-3">یک ایمیل هر دو هفته — نه بیشتر.</li>
          <li className="border-t border-border pt-3">
            موضوع‌ها: سیستم‌سازی، مستندسازی فرایند، شاخص‌های عملیاتی، استفادهٔ عملی از
            هوش مصنوعی.
          </li>
          <li className="border-t border-border pt-3">
            لینک لغو عضویت در هر ایمیل. یک کلیک، بدون سؤال.
          </li>
        </ul>
      </div>
    </Container>
  )
}
