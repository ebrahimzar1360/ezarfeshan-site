import Link from 'next/link'
import { NewsletterForm } from '@/components/site/NewsletterForm'
import { Container } from '@/components/ui/Container'

/**
 * Closing block. The newsletter is the action; consulting is a quiet line
 * underneath it. The brief's CTA order is read → subscribe → enquire.
 *
 * Behind it, the logo's ring at architectural scale, turning slowly.
 *
 * The form posts to /api/newsletter/subscribe: validated, rate limited,
 * honeypot-guarded, double opt-in.
 */
export function FinalInvitation() {
  return (
    <section className="tone-inverse tone-deep bp-grid relative overflow-hidden py-28 md:py-44">
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="ring-spin pointer-events-none absolute -end-40 top-1/2 size-[42rem] -translate-y-1/2 opacity-60 md:-end-24"
        fill="none"
      >
        <circle cx="100" cy="100" r="78" stroke="var(--color-gold-light)" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="420 70" />
        <circle cx="100" cy="100" r="92" stroke="var(--color-paper)" strokeOpacity="0.08" strokeWidth="0.4" strokeDasharray="1 4" />
        <circle cx="158" cy="48" r="5" fill="var(--color-gold)" />
      </svg>

      <Container>
        <div className="relative max-w-2xl" data-reveal>
          <p className="eyebrow">خبرنامه</p>
          <h2 className="mt-4 text-800 font-black leading-tight md:text-900">
            هر دو هفته، یک نوشته دربارهٔ{' '}
            <span className="text-gold-light">سیستم‌سازی</span>
          </h2>
          <p className="mt-6 max-w-(--container-measure) text-500 leading-normal text-text-muted">
            بدون تبلیغ، بدون خلاصهٔ کتاب. یک مسئلهٔ عملیاتی و راهی که جواب داده. هر وقت خواستی
            لغو عضویت کن.
          </p>

          <div className="panel mt-10 max-w-xl bg-bg-raised/70 p-5 backdrop-blur-md md:p-6">
            <NewsletterForm source="home" tone="inverse" />
          </div>

          <p className="mt-10 text-300 text-text-muted">
            پروژه‌ای در ذهن داری؟{' '}
            <Link href="/consult" className="font-medium">
              درخواست مشاوره ←
            </Link>
          </p>
        </div>
      </Container>
    </section>
  )
}
