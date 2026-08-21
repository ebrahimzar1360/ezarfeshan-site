import type { Metadata } from 'next'
import { ConsultForm } from '@/components/site/ConsultForm'
import { Container } from '@/components/ui/Container'
import { fa, yearsSince } from '@/lib/content/bio'

export const metadata: Metadata = {
  title: 'درخواست مشاوره',
  description: 'اگر کسب‌وکارت بدون حضور دائمی تو از حرکت می‌ایستد، بنویس.',
}

export default function ConsultPage() {
  return (
    <>
      <Container width="measure" className="py-16 md:py-24">
        <div className="gold-marker">
          <p className="mb-3 text-200 font-medium tracking-wide text-text-subtle">مشاوره</p>
          <h1 className="text-800">درخواست مشاوره</h1>
        </div>
        <div className="mt-8 space-y-5 text-400 leading-prose text-text-muted">
          <p>
            کارم کمک به مدیرانی است که کسب‌وکارشان بدون حضور دائمی خودشان کار نمی‌کند.
            {' '}{fa(yearsSince(1389))} سال است همین کار را در کسب‌وکار خودم می‌کنم.
          </p>
          <p>
            اول توضیح می‌دهی چه مسئله‌ای داری. اگر فکر کنم می‌توانم کمک کنم، جواب می‌دهم و
            قرار می‌گذاریم. اگر فکر کنم نمی‌توانم، همان را می‌گویم.
          </p>
        </div>
      </Container>

      <Container width="measure" className="pb-20">
        <ConsultForm />
      </Container>

      <section className="tone-inverse bg-forest py-16 md:py-24">
        <Container width="measure">
          <h2 className="text-600">قبل از فرستادن</h2>
          <ul className="mt-6 space-y-4 text-300 leading-prose text-text-muted">
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر دنبال راه‌حل سریع هستی</strong> — سیستم‌سازی
              سریع نیست. نتیجه‌اش ماندگار است، ولی یک‌شبه نمی‌آید.
            </li>
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر فقط دنبال ابزار هوش مصنوعی هستی</strong> —
              خودکار کردن کاری که فرایندش نوشته نشده، فقط بی‌نظمی را سریع‌تر می‌کند. اول
              فرایند.
            </li>
            <li className="border-t border-border pt-4">
              <strong className="text-text">اگر مطمئن نیستی</strong> — از{' '}
              <a href="/articles">مقالات</a> شروع کن. اگر حرف‌ها به کارت آمد، بعد بنویس.
            </li>
          </ul>
        </Container>
      </section>
    </>
  )
}
